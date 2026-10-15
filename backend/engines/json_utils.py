import re
import json
from typing import Dict, Any

def parse_json_safely(text: str) -> Dict[str, Any]:
    """
    LLM 응답 문자열에서 마크다운 코드 블록(```json) 및 앞뒤 여백을 제거하고 안전하게 파싱합니다.
    """
    if not text:
        raise ValueError("Empty response text")
    
    t = text.strip()
    t = re.sub(r"^```(?:json)?\s*", "", t, flags=re.MULTILINE)
    t = re.sub(r"\s*```$", "", t, flags=re.MULTILINE)
    t = t.strip()

    try:
        return json.loads(t)
    except json.JSONDecodeError:
        # 정규식을 통해 최외각 { ... } 추출 시도
        match = re.search(r"(\{.*\})", t, re.DOTALL)
        if match:
            return json.loads(match.group(1))
        raise
