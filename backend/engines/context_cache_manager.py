import os
from google import genai
from google.genai import types

client = genai.Client()

class ChronosContextCacheManager:
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.cache_resource_name = None

    async def build_or_refresh_user_cache(self, accumulated_history_text: str):
        """
        사용자의 최근 60일간의 심의 히스토리와 상태 로그를 Context Cache에 보관
        TTL: 2시간 (신규 대화 발생 시 자동 연장)
        """
        system_instruction = """
        당신은 ChronosLife의 영구 시계열 기억 보관소입니다.
        아래에 제공되는 텍스트는 지난 수십 일간 사용자가 내린 실제 결정, 소비, 감정, 서브에이전트 심의 결과입니다.
        새로운 발화가 주어지면, 단발성 분석에 그치지 않고 이 누적 히스토리에 나타난 반복 패턴과 이전 중재 약속을 대조하십시오.
        """

        cache = client.caches.create(
            model="gemini-3.5-flash",
            config=types.CreateCachedContentConfig(
                contents=[
                    types.Content(
                        role="user",
                        parts=[types.Part.from_text(text=accumulated_history_text)]
                    )
                ],
                system_instruction=system_instruction,
                display_name=f"chronos_history_{self.user_id}",
                ttl="7200s", # 2시간
            )
        )
        self.cache_resource_name = cache.name
        return self.cache_resource_name

    def query_with_cached_history(self, new_user_event_prompt: str) -> str:
        """
        캐시된 장기 히스토리를 바탕으로 초저비용/초저지연 질의 수행
        """
        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=new_user_event_prompt,
            config=types.GenerateContentConfig(
                cached_content=self.cache_resource_name,
                temperature=0.2
            )
        )
        return response.text
