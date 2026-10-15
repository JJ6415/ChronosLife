"""
ChronosLife Sub-Agent Base Class
모든 전문 도메인 서브에이전트(Finance, Career, Wellbeing)의 기반 추상 클래스
(폴백 배제: 순수 Live Gemini AI 호출)
"""
import os
import time
import json
import logging
from typing import Dict, Any, Optional, List
from engines.json_utils import parse_json_safely

logger = logging.getLogger(__name__)

class BaseSubAgent:
    def __init__(self, agent_id: str, name: str, role: str, icon: str):
        self.agent_id = agent_id
        self.name = name
        self.role = role
        self.icon = icon

        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError(f"[{self.agent_id}] GEMINI_API_KEY가 설정되지 않았습니다.")
        from google import genai
        self.client = genai.Client(api_key=api_key)

    def get_metadata(self) -> Dict[str, Any]:
        return {
            "agent_id": self.agent_id,
            "name": self.name,
            "role": self.role,
            "icon": self.icon
        }

    def _call_gemini_live(self, prompt: str, preferred_model: Optional[str] = None) -> Dict[str, Any]:
        """
        Gemini AI 모델을 호출하여 엄격한 JSON 심의 결과를 도출합니다.
        (폴백 배제: 실패 시 실제 오류 발생)
        """
        from google.genai import types

        models_to_try = []
        for m in [preferred_model, "gemini-3.5-flash-lite", "gemini-flash-lite-latest", "gemini-3.1-flash-lite", "gemini-3.5-flash"]:
            if m and m not in models_to_try:
                models_to_try.append(m)

        last_error = None
        start_time = time.time()
        for model_name in models_to_try:
            try:
                response = self.client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.2,
                        response_mime_type="application/json"
                    )
                )
                duration_ms = (time.time() - start_time) * 1000.0
                res = parse_json_safely(response.text)
                if res:
                    res["model_used"] = model_name
                    from engines.dev_logger import dev_log_store
                    dev_log_store.log_llm_call(
                        caller=self.agent_id,
                        model=model_name,
                        prompt=prompt,
                        response_text=response.text,
                        duration_ms=duration_ms
                    )
                    return res
            except Exception as e:
                last_error = e
                logger.warning(f"[{self.agent_id}] Model {model_name} attempt failed: {e}")

        raise RuntimeError(f"[{self.agent_id}] 모든 Gemini 모델 호출에 실패했습니다: {last_error}")
