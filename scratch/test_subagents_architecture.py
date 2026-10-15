import os
import sys
import asyncio
import json

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from engines.domain_council import DomainCouncil
from engines.goal_manager import GoalManager

async def test():
    gm = GoalManager()
    profile = gm.get_user_profile()
    print("1. User Profile Extracted from Goals:")
    print(json.dumps(profile, ensure_ascii=False, indent=2))

    council = DomainCouncil()
    print(f"\n2. Council initialized with {len(council.finance_agent.agent_id)}...")
    print(f"Finance SubAgent: {council.finance_agent.name} ({council.finance_agent.role})")
    print(f"Career SubAgent: {council.career_agent.name} ({council.career_agent.role})")
    print(f"Wellbeing SubAgent: {council.wellbeing_agent.name} ({council.wellbeing_agent.role})")

    res = await council.evaluate(
        sanitized_input="아이패드 프로 150만 원 할부로 결제함",
        user_profile=profile,
        preferred_model="gemini-3.5-flash-lite"
    )
    print("\n3. Council Evaluation Result:")
    print("Finance Stance:", res["finance"]["stance"])
    print("Finance Reasoning:", res["finance"]["reasoning"])
    print("Finance Applied Guardrails:", res["finance"].get("applied_guardrails"))
    print("Career Stance:", res["career"]["stance"])
    print("Wellbeing Stance:", res["wellbeing"]["stance"])

if __name__ == "__main__":
    asyncio.run(test())
