"""
ChronosLife Multi-Agent Domain Council (3대 전문 도메인 서브에이전트 위원회)
Finance, Career, Wellbeing 3개의 독립 서브에이전트를 총괄 소집하여
각 에이전트의 전문 페르소나 및 사용자 맞춤 헌법 프로필에 기반한 독립 심의 보고서를 종합합니다.
"""
import os
import asyncio
import logging
from typing import Dict, Any, Optional

from engines.subagents.finance_agent import FinanceSubAgent
from engines.subagents.career_agent import CareerSubAgent
from engines.subagents.wellbeing_agent import WellbeingSubAgent

logger = logging.getLogger(__name__)

class DomainCouncil:
    """
    3대 전문 도메인 서브에이전트(Finance, Career, Wellbeing)의 자율 협의체.
    각 서브에이전트에게 동적 사용자 헌법 프로필과 오케스트레이터 지침을 전달하여 독립 심의를 수행합니다.
    """
    def __init__(self):
        self.finance_agent = FinanceSubAgent()
        self.career_agent = CareerSubAgent()
        self.wellbeing_agent = WellbeingSubAgent()

    async def evaluate(
        self, 
        sanitized_input: str, 
        cascade_result: Optional[dict] = None, 
        proposal_context: str = None,
        intent_context: Optional[Any] = None,
        user_profile: Optional[Dict[str, Any]] = None,
        preferred_model: Optional[str] = None,
        locale: str = "ko"
    ) -> Dict[str, Any]:
        """
        3대 독립 서브에이전트(Finance, Career, Wellbeing)에게 안건을 전달하고 
        각 에이전트의 독립적 의견 및 메트릭 보고서를 종합합니다.
        """
        # 3대 독립 서브에이전트(Finance, Career, Wellbeing) 병렬 심의 (동시 호출로 응답 속도 3배 향상)
        finance_task = self.finance_agent.evaluate(
            sanitized_input=sanitized_input,
            cascade_result=cascade_result,
            intent_context=intent_context,
            user_profile=user_profile,
            preferred_model=preferred_model,
            locale=locale
        )
        career_task = self.career_agent.evaluate(
            sanitized_input=sanitized_input,
            intent_context=intent_context,
            user_profile=user_profile,
            preferred_model=preferred_model,
            locale=locale
        )
        wellbeing_task = self.wellbeing_agent.evaluate(
            sanitized_input=sanitized_input,
            intent_context=intent_context,
            user_profile=user_profile,
            preferred_model=preferred_model,
            locale=locale
        )

        finance_verdict, career_verdict, wellbeing_verdict = await asyncio.gather(
            finance_task, career_task, wellbeing_task
        )

        # 위원회 종합 결과 패키징
        return {
            "finance": finance_verdict,
            "career": career_verdict,
            "wellbeing": wellbeing_verdict,
            "council_metadata": {
                "active_subagents": [
                    self.finance_agent.get_metadata(),
                    self.career_agent.get_metadata(),
                    self.wellbeing_agent.get_metadata()
                ],
                "applied_user_profile": user_profile or {}
            }
        }
