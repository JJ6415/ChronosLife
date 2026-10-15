import os
import sys
sys.path.insert(0, os.path.abspath('backend'))
from dotenv import load_dotenv
load_dotenv('.env')

from engines.goal_manager import GoalManager
import asyncio

gm = GoalManager()

async def run():
    print("\n=== 대화 1 ===")
    q1 = "야근이 너무 많아서 주말 취미(러닝)와 개인 시간을 꼭 지키고 싶어요."
    r1 = await gm.chat_and_refine_goals(q1)
    print("AI 답변 1:", r1["reply"])
    print("후속 질문 1:", r1.get("suggested_next_prompts"))
    print("갱신된 목표 카테고리:", r1.get("focus_category"))
    print("취미 목표 제목:", r1["updated_goals"]["hobby"]["title"])

    print("\n=== 대화 2 (후속 대화) ===")
    history = [
        {"role": "user", "content": q1},
        {"role": "assistant", "content": r1["reply"]}
    ]
    q2 = "취미 활동을 지속하기 위한 일일 수면 7시간 연계 헌법도 다듬어줘."
    r2 = await gm.chat_and_refine_goals(q2, history=history)
    print("AI 답변 2:", r2["reply"])
    print("후속 질문 2:", r2.get("suggested_next_prompts"))
    print("갱신된 목표 카테고리:", r2.get("focus_category"))
    print("건강 목표 제목:", r2["updated_goals"]["health"]["title"])
    print("건강 목표 수치:", r2["updated_goals"]["health"]["target_value"])
    print("건강 헌법 조항:", r2["updated_goals"]["health"]["tenet"])

asyncio.run(run())
