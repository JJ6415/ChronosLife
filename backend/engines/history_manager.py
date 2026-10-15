"""
ChronosLife Deliberation History Manager
사용자의 모든 라이프 거버넌스 심의 안건, 중재 판결, 5대 목표 영향도 및 5컷 만화 스토리를
영구적으로 저장하고 시계열 히스토리로 추적 관리합니다.
"""
import os
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

HISTORY_DIR = Path(__file__).resolve().parent.parent / "data"
HISTORY_FILE = HISTORY_DIR / "deliberations_history.json"

class HistoryManager:
    def __init__(self):
        HISTORY_DIR.mkdir(parents=True, exist_ok=True)
        if not HISTORY_FILE.exists():
            self._write_history([])

    def _read_history(self) -> List[Dict[str, Any]]:
        try:
            if not HISTORY_FILE.exists():
                return []
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error reading history file: {e}")
            return []

    def _write_history(self, records: List[Dict[str, Any]]):
        try:
            with open(HISTORY_FILE, "w", encoding="utf-8") as f:
                json.dump(records, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"Error writing history file: {e}")

    def save_deliberation(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        심의 완료 데이터에서 핵심 요약과 상세 스토리를 추출하여 히스토리에 기록합니다.
        """
        now = datetime.now()
        record_id = f"delib_{now.strftime('%Y%m%d_%H%M%S')}_{len(self._read_history()) + 1}"
        
        # 거버넌스 판결 정보 추출
        gov_ruling = payload.get("governor_ruling", {})
        intent_ctx = payload.get("intent_context", {})
        council_verdict = payload.get("council_verdict", {})
        comic = payload.get("log10_comic", {})

        record = {
            "id": record_id,
            "created_at": now.strftime("%Y-%m-%d %H:%M:%S"),
            "iso_timestamp": now.isoformat(),
            "raw_input": payload.get("raw_input", ""),
            "title": payload.get("title", intent_ctx.get("intent_label", "라이프 거버넌스 심의")),
            "intent_type": intent_ctx.get("intent_type", "GENERAL"),
            "intent_label": intent_ctx.get("intent_label", "일반 심의"),
            "amount_description": intent_ctx.get("amount_description", ""),
            "micro_deviation": payload.get("micro_deviation", 0.0),
            "decision": gov_ruling.get("decision", "미정"),
            "verdict_summary": gov_ruling.get("reasoning", ""),
            "pareto_counter_offer": gov_ruling.get("pareto_counter_offer") or gov_ruling.get("counter_offer"),
            "violated_tenets": gov_ruling.get("violated_tenets", []),
            "council_stances": {
                "finance": council_verdict.get("finance", {}).get("stance", "N/A"),
                "career": council_verdict.get("career", {}).get("stance", "N/A"),
                "wellbeing": council_verdict.get("wellbeing", {}).get("stance", "N/A"),
            },
            "comic_title": comic.get("comic_title", ""),
            "comic_cuts_count": len(comic.get("cuts", [])),
            "model_used": payload.get("model_used", "gemini-3.5-flash-lite"),
            "full_payload": payload
        }

        records = self._read_history()
        # 최신 항목이 맨 앞으로 오도록 추가
        records.insert(0, record)
        # 최대 100개 보관
        if len(records) > 100:
            records = records[:100]
        self._write_history(records)
        logger.info(f"Deliberation saved to history: {record_id} ({record['raw_input'][:30]}...)")
        return record

    def get_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        records = self._read_history()
        return records[:limit]

    def get_record(self, record_id: str) -> Optional[Dict[str, Any]]:
        records = self._read_history()
        for r in records:
            if r.get("id") == record_id:
                return r
        return None

    def delete_record(self, record_id: str) -> bool:
        records = self._read_history()
        new_records = [r for r in records if r.get("id") != record_id]
        if len(new_records) != len(records):
            self._write_history(new_records)
            return True
        return False

    def clear_history(self) -> bool:
        self._write_history([])
        return True
