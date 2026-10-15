"""
ChronosLife Dynamic Gemini Model Discovery Service
Google GenAI API의 client.models.list()를 통해 계정에서 사용 가능한 실제 최신 Gemini 모델 목록을 실시간으로 검색 및 필터링합니다.
"""
import os
import time
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# 기본 정적 폴백 목록 (오프라인이거나 API 키가 없을 때 사용)
FALLBACK_MODELS = [
    {
        "id": "gemini-3.5-flash-lite",
        "name": "Gemini 3.5 Flash Lite",
        "desc": "초고속 (0.8초) · 무지연 권장 엔진",
        "badge": "Recommended",
        "is_recommended": True
    },
    {
        "id": "gemini-flash-lite-latest",
        "name": "Gemini Flash-Lite Latest",
        "desc": "초경량 초고속 저지연",
        "badge": "Ultra Fast",
        "is_recommended": False
    },
    {
        "id": "gemini-3.1-flash-lite",
        "name": "Gemini 3.1 Flash Lite",
        "desc": "경량 3.1 아키텍처",
        "badge": "Ultra Fast",
        "is_recommended": False
    },
    {
        "id": "gemini-3.5-flash",
        "name": "Gemini 3.5 Flash",
        "desc": "심층 복합 추론",
        "badge": "Flash",
        "is_recommended": False
    },
    {
        "id": "gemini-3-flash-preview",
        "name": "Gemini 3.0 Flash Preview",
        "desc": "차세대 3.0 프리뷰",
        "badge": "Flash",
        "is_recommended": False
    }
]

class ModelRegistry:
    def __init__(self, cache_ttl_seconds: int = 3600):
        self.cache_ttl = cache_ttl_seconds
        self._cached_models: List[Dict[str, Any]] = []
        self._last_fetch_time: float = 0.0

    def get_models(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        """
        사용 가능한 Gemini 모델 목록을 동적으로 반환합니다.
        캐시 유효 기간 내에는 캐시된 결과를 즉시 반환하며, 만료 시 Google GenAI API를 동적으로 조회합니다.
        """
        now = time.time()
        if not force_refresh and self._cached_models and (now - self._last_fetch_time < self.cache_ttl):
            return self._cached_models

        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            logger.warning("GEMINI_API_KEY not found. Using fallback models.")
            return FALLBACK_MODELS

        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            raw_models = list(client.models.list())

            discovered: List[Dict[str, Any]] = []
            for m in raw_models:
                raw_name = m.name or ""
                model_id = raw_name.replace("models/", "")
                actions = getattr(m, 'supported_actions', []) or []

                # 1. 텍스트 추론 및 생성 지원 Gemini 모델만 선별
                if not model_id.startswith("gemini-"):
                    continue
                if "generateContent" not in actions:
                    continue
                
                # 2. 비텍스트 전용(오디오, 이미지, 임베딩, 로보틱스 등) 모델 제외
                if any(k in model_id.lower() for k in [
                    "tts", "native-audio", "image", "embedding", "robotics", 
                    "transcribe", "computer-use", "live-translate", "extended-thinking"
                ]):
                    continue
                
                # 3. 신규 사용자 404 반환 구버전 제외
                if model_id in ["gemini-2.5-flash", "gemini-2.5-flash-lite"]:
                    continue

                display_name = getattr(m, "display_name", model_id) or model_id
                badge = "General"
                desc = getattr(m, "description", "") or "Gemini LLM Engine"
                is_rec = False

                if model_id == "gemini-3.5-flash-lite":
                    badge = "Recommended"
                    desc = "초고속 (0.8초) · 실시간 무지연 권장 기본 엔진"
                    is_rec = True
                elif "flash-lite" in model_id:
                    badge = "Ultra Fast"
                    desc = "초경량 초고속 저지연 Flash-Lite"
                elif "pro" in model_id:
                    badge = "Pro Reasoning"
                    desc = "최고 수준 복합 논리 추론"
                elif "flash" in model_id:
                    badge = "Flash"
                    desc = "균형 잡힌 표준 Flash 엔진"

                discovered.append({
                    "id": model_id,
                    "name": display_name,
                    "desc": desc,
                    "badge": badge,
                    "is_recommended": is_rec
                })

            if discovered:
                # 권장 모델을 최상단, Lite 모델, Flash, Pro 순으로 정렬
                def sort_key(item):
                    if item["is_recommended"]:
                        return (0, item["id"])
                    if "flash-lite" in item["id"] or "lite" in item["id"]:
                        return (1, item["id"])
                    if "flash" in item["id"]:
                        return (2, item["id"])
                    return (3, item["id"])

                discovered.sort(key=sort_key)
                self._cached_models = discovered
                self._last_fetch_time = now
                logger.info(f"Dynamically discovered {len(discovered)} Gemini models from Google AI API.")
                return discovered

        except Exception as e:
            logger.error(f"Failed to fetch dynamic models from Gemini API: {e}. Falling back to defaults.")

        return self._cached_models if self._cached_models else FALLBACK_MODELS

# 싱글톤 인스턴스
model_registry = ModelRegistry()
