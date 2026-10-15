import os
import sys
sys.path.insert(0, os.path.abspath('backend'))
from dotenv import load_dotenv
load_dotenv('.env')

print('USE_MOCK_FALLBACK:', os.environ.get('USE_MOCK_FALLBACK'))
print('GEMINI_API_KEY exists:', bool(os.environ.get('GEMINI_API_KEY')))

from engines.goal_manager import GoalManager
import asyncio

gm = GoalManager()

async def run():
    try:
        res = await gm.chat_and_refine_goals("취미 활동을 지속하기 위한 일일 수면 7시간 연계 헌법도 다듬어줘.")
        print("\n--- RESULT ---")
        print("Reply:", res.get("reply"))
        print("Focus:", res.get("focus_category"))
        print("Health Title:", res.get("updated_goals", {}).get("health", {}).get("title"))
        print("Hobby Title:", res.get("updated_goals", {}).get("hobby", {}).get("title"))
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(run())
