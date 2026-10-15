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
        あなたはChronosLifeの永久時系列記憶保管庫です。
        提供されるテキストは、過去数十日間にユーザーが下した実際の決定、消費、感情、サブエージェントの審議結果です。
        新たな発話が与えられた際、単発的な分析にとどまらず、この累積履歴に現れる反復パターンや以前の仲裁の約束と照合してください。
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
