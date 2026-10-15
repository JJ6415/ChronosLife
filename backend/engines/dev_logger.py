"""
ChronosLife Developer API & LLM Inspector Logger
개발 및 디버깅 과정에서 모든 API의 입력값(Request Payload), 출력값(Response Payload),
지연 시간(Latency), 그리고 Gemini AI 모델의 프롬프트와 원본 응답을 추적하고 기록합니다.

파일 크기 급증(Disk Ballooning)을 원천 차단하기 위해 10MB 자동 롤링(Log Rotation)을 지원합니다.
"""
import os
import json
import time
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
from collections import deque

logger = logging.getLogger("DevLogger")

LOGS_DIR = Path(__file__).resolve().parent.parent / "logs"
API_LOG_FILE = LOGS_DIR / "api_inspector.jsonl"
LLM_LOG_FILE = LOGS_DIR / "llm_calls.jsonl"

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB 제한


def _safe_append_jsonl(filepath: Path, record: dict):
    """
    JSONL 파일에 안전하게 레코드를 추가하고, 파일 크기가 MAX_FILE_SIZE_BYTES를 초과하면
    .old.jsonl로 자동 로테이션하여 디스크 용량 폭발을 방지합니다.
    """
    try:
        if filepath.exists() and filepath.stat().st_size > MAX_FILE_SIZE_BYTES:
            backup_file = filepath.with_name(f"{filepath.stem}.old{filepath.suffix}")
            if backup_file.exists():
                backup_file.unlink()
            filepath.rename(backup_file)

        with open(filepath, "a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
    except Exception as e:
        logger.error(f"Failed to append log to {filepath}: {e}")


class DevLogStore:
    def __init__(self, max_items: int = 150):
        self.max_items = max_items
        self.api_logs = deque(maxlen=max_items)
        self.llm_logs = deque(maxlen=max_items)

        LOGS_DIR.mkdir(parents=True, exist_ok=True)

    def log_api_transaction(
        self,
        method: str,
        path: str,
        status_code: int,
        duration_ms: float,
        request_body: Any = None,
        response_body: Any = None,
        client_ip: Optional[str] = None,
        error: Optional[str] = None,
    ):
        now = datetime.now()
        record = {
            "id": f"req_{int(now.timestamp() * 1000)}",
            "timestamp": now.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
            "iso": now.isoformat(),
            "method": method,
            "path": path,
            "status_code": status_code,
            "duration_ms": round(duration_ms, 2),
            "client_ip": client_ip or "127.0.0.1",
            "request_body": request_body,
            "response_body": response_body,
            "error": error,
        }

        self.api_logs.appendleft(record)

        # JSONL 파일에 안전 지속 저장 (10MB 제한 자동 로테이션)
        _safe_append_jsonl(API_LOG_FILE, record)

        # 콘솔에 개발자 친화적인 하이라이트 요약 출력
        status_label = "[OK]" if status_code < 400 else "[ERR]"
        req_summary = json.dumps(request_body, ensure_ascii=False) if request_body else "{}"
        if len(req_summary) > 120:
            req_summary = req_summary[:120] + "...}"
        res_summary = json.dumps(response_body, ensure_ascii=False) if response_body else "{}"
        if len(res_summary) > 120:
            res_summary = res_summary[:120] + "...}"

        try:
            print(f"\n{status_label} [API {method} {path}] {status_code} ({duration_ms:.1f}ms)")
            print(f"   [INPUT Request]:  {req_summary}")
            print(f"   [OUTPUT Response]: {res_summary}")
            if error:
                print(f"   [ERROR]: {error}")
        except Exception:
            pass

        return record

    def log_llm_call(
        self,
        caller: str,
        model: str,
        prompt: str,
        response_text: str,
        duration_ms: float,
        error: Optional[str] = None,
    ):
        now = datetime.now()
        # 프롬프트/응답이 너무 클 경우 잘라내기
        safe_prompt = prompt if len(prompt) < 10000 else (prompt[:10000] + "...<truncated>")
        safe_response = response_text if not response_text or len(response_text) < 15000 else (response_text[:15000] + "...<truncated>")

        record = {
            "id": f"llm_{int(now.timestamp() * 1000)}",
            "timestamp": now.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
            "caller": caller,
            "model": model,
            "duration_ms": round(duration_ms, 2),
            "prompt": safe_prompt,
            "prompt_length": len(prompt),
            "response_text": safe_response,
            "response_length": len(response_text) if response_text else 0,
            "error": error,
        }

        self.llm_logs.appendleft(record)

        # JSONL 파일에 안전 지속 저장 (10MB 제한 자동 로테이션)
        _safe_append_jsonl(LLM_LOG_FILE, record)

        # 터미널 출력
        status = "[LLM-OK]" if not error else "[LLM-ERR]"
        resp_snippet = (response_text[:140] + "...") if response_text else "(None)"
        try:
            print(f"   {status} [LLM CALL: {caller}] Model: {model} ({duration_ms:.1f}ms)")
            print(f"      [LLM RESP]: {resp_snippet.strip()}")
        except Exception:
            pass

        return record

    def get_logs(self, limit: int = 50) -> Dict[str, Any]:
        return {
            "api_logs": list(self.api_logs)[:limit],
            "llm_logs": list(self.llm_logs)[:limit],
            "total_api_count": len(self.api_logs),
            "total_llm_count": len(self.llm_logs),
        }

    def clear(self):
        self.api_logs.clear()
        self.llm_logs.clear()
        for path in [
            API_LOG_FILE,
            API_LOG_FILE.with_name(f"{API_LOG_FILE.stem}.old{API_LOG_FILE.suffix}"),
            LLM_LOG_FILE,
            LLM_LOG_FILE.with_name(f"{LLM_LOG_FILE.stem}.old{LLM_LOG_FILE.suffix}"),
        ]:
            try:
                if path.exists():
                    path.unlink()
            except Exception as e:
                logger.error(f"Failed to delete {path}: {e}")


# 싱글톤 인스턴스
dev_log_store = DevLogStore()
