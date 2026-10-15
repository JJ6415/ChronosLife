"""
FastAPI Developer Request & Response Inspector Middleware (Pure ASGI Implementation)
모든 /api/* 경로의 HTTP 요청 헤더, 바디(입력값), 응답 바디(출력값), 소요 시간 및 에러를 캡처하여
DevLogStore에 저장하고 콘솔에 개발자용 실시간 모니터링 로그를 출력합니다.

*성능 및 실시간성 핵심 보장*:
Starlette BaseHTTPMiddleware의 고질적 버퍼링(SSE 실시간 청크 전송 차단) 문제를 원천 배제하기 위해
순수 ASGI 표준 규격으로 작성되었습니다. /api/analyze/stream(SSE) 경로는 0ms 지연으로 직통 패스스루됩니다.
"""
import time
import json
from typing import Any
from engines.dev_logger import dev_log_store

EXCLUDED_PREFIXES = (
    "/api/dev/",
    "/api/analyze/stream",
    "/health",
    "/favicon.ico",
    "/docs",
    "/openapi.json",
)


def sanitize_payload(obj: Any, max_str_len: int = 1500, max_items: int = 25, depth: int = 0) -> Any:
    """
    로그에 저장되는 페이로드를 안전하게 정제하고 크기를 제한합니다.
    - base64 이미지나 거대 문자열은 잘라냄
    - 거대 리스트나 딕셔너리의 요소 수를 제한
    - 순환 참조 및 과도한 메모리/디스크 사용 방지
    """
    if depth > 4:
        return "<Max depth reached>"

    if isinstance(obj, str):
        if obj.startswith("data:image/") or ";base64," in obj:
            return f"<base64_image_data len={len(obj)}>"
        if len(obj) > max_str_len:
            return obj[:max_str_len] + f"... <truncated {len(obj) - max_str_len} chars>"
        return obj

    if isinstance(obj, dict):
        sanitized = {}
        for idx, (k, v) in enumerate(obj.items()):
            if idx >= max_items:
                sanitized["..."] = f"<{len(obj) - max_items} more keys omitted>"
                break
            # base64나 큰 이미지 필드 키 탐지
            if any(term in str(k).lower() for term in ["image", "base64", "photo", "avatar"]):
                if isinstance(v, str) and len(v) > 200:
                    sanitized[k] = f"<image_data len={len(v)}>"
                    continue
            sanitized[k] = sanitize_payload(v, max_str_len=max_str_len, max_items=max_items, depth=depth + 1)
        return sanitized

    if isinstance(obj, list):
        if len(obj) > max_items:
            res = [sanitize_payload(item, max_str_len=max_str_len, max_items=max_items, depth=depth + 1) for item in obj[:max_items]]
            res.append(f"<{len(obj) - max_items} more items omitted>")
            return res
        return [sanitize_payload(item, max_str_len=max_str_len, max_items=max_items, depth=depth + 1) for item in obj]

    return obj


class DevInspectorMiddleware:
    """
    순수 ASGI 미들웨어로 동작하여 Starlette BaseHTTPMiddleware의
    StreamingResponse 버퍼링 버그를 완벽하게 회피합니다.
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        path = scope.get("path", "")

        # 1. SSE 실시간 스트리밍 경로 및 로깅 제외 경로는 0ms 지연 직통 패스스루!
        if (
            not path.startswith("/api")
            or path == "/api/analyze/stream"
            or any(path.startswith(prefix) for prefix in EXCLUDED_PREFIXES)
        ):
            return await self.app(scope, receive, send)

        start_time = time.time()
        client = scope.get("client")
        client_ip = client[0] if client else "unknown"
        method = scope.get("method", "GET")

        # 2. Request Body 비파괴 복제 캡처
        req_body_bytes = bytearray()

        async def custom_receive():
            message = await receive()
            if message.get("type") == "http.request":
                body = message.get("body", b"")
                if body:
                    req_body_bytes.extend(body)
            return message

        # 3. Response Status 및 Body 캡처
        resp_status = 200
        resp_body_chunks = []

        async def custom_send(message):
            nonlocal resp_status
            msg_type = message.get("type")
            if msg_type == "http.response.start":
                resp_status = message.get("status", 200)
            elif msg_type == "http.response.body":
                body = message.get("body", b"")
                if body and len(resp_body_chunks) < 10:
                    resp_body_chunks.append(body)
            await send(message)

        try:
            await self.app(scope, custom_receive, custom_send)
        except Exception as exc:
            duration_ms = (time.time() - start_time) * 1000.0
            error_message = str(exc)
            dev_log_store.log_api_transaction(
                method=method,
                path=path,
                status_code=500,
                duration_ms=duration_ms,
                request_body=None,
                response_body={"error": error_message},
                client_ip=client_ip,
                error=error_message,
            )
            raise exc

        duration_ms = (time.time() - start_time) * 1000.0

        # Request Body 파싱
        req_body = None
        if req_body_bytes:
            try:
                raw_json = json.loads(req_body_bytes.decode("utf-8"))
                req_body = sanitize_payload(raw_json)
            except Exception:
                raw_str = req_body_bytes.decode("utf-8", errors="replace")
                req_body = raw_str[:500]

        # Response Body 파싱
        response_body = None
        if resp_body_chunks:
            full_resp = b"".join(resp_body_chunks)
            try:
                raw_resp = json.loads(full_resp.decode("utf-8"))
                response_body = sanitize_payload(raw_resp)
            except Exception:
                raw_resp_str = full_resp.decode("utf-8", errors="replace")
                response_body = raw_resp_str[:500]

        dev_log_store.log_api_transaction(
            method=method,
            path=path,
            status_code=resp_status,
            duration_ms=duration_ms,
            request_body=req_body,
            response_body=response_body,
            client_ip=client_ip,
        )
