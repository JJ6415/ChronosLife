"""
Finance Sub-Agent (수석 자산 거버넌스 및 유동성 수호관)
사용자의 실시간 재정 프로필(일일 가처분 예산, 30년 은퇴 자산, 시드머니 목표)을 기반으로
모든 소비 지출과 소득 안건의 복리 기회비용 및 헌법 제2조·제5조 적합성을 자율 심의합니다.
"""
from typing import Dict, Any, Optional
from engines.subagents.base_agent import BaseSubAgent

class FinanceSubAgent(BaseSubAgent):
    def __init__(self):
        super().__init__(
            agent_id="FinanceSubAgent",
            name="재정 거버넌스 에이전트",
            role="수석 자산 거버넌스 및 유동성 가드레일 수호관 (Financial Guardian)",
            icon="💰"
        )

    async def evaluate(
        self, 
        sanitized_input: str, 
        cascade_result: Optional[dict] = None, 
        intent_context: Optional[Any] = None,
        user_profile: Optional[Dict[str, Any]] = None,
        preferred_model: Optional[str] = None,
        locale: str = "ko"
    ) -> Dict[str, Any]:
        profile = user_profile or {}
        daily_budget = float(profile.get("daily_budget", 40000.0))
        retirement_goal = profile.get("retirement_goal", "은퇴 자산 10억 원")
        current_seed = profile.get("current_seed", "8,500만 원")

        intent_type = getattr(intent_context, 'intent_type', 'GENERAL') if intent_context else 'GENERAL'
        detected_amount = getattr(intent_context, 'detected_amount', 0.0) if intent_context else 0.0
        is_financial_expense = getattr(intent_context, 'is_financial_expense', False) if intent_context else False
        domain_prompt = getattr(intent_context, 'domain_prompts', {}).get('finance', '') if intent_context else ''

        if locale == "ja":
            prompt = f"""
あなたは人生ガバナンスシステム『ChronosLife』の専門サブエージェント【{self.role}】です。
ユーザーのリアルタイム財務ガバナンスプロファイルを基に、上程案件を徹底的に審議してください。

[CRITICAL LANGUAGE MANDATE: JAPANESE (日本語)]
判断理由（'reasoning'）は必ず自然な日本語で作成してください。韓国語は使用しないでください。

[ユーザー財務憲法プロファイル]:
- 1日あたりの可処分安全限度額: {daily_budget:,.0f}ウォン
- 30年の複利最終資産目標: {retirement_goal}
- 現在の蓄積シード資産: {current_seed}
- 核心原則: 短期的な衝動消費はL1(10日)バッファ内で吸収必須、30年の複利を損なう決定は自動遮断

[上程案件]: {sanitized_input}
[オーケストレーター指示]: {domain_prompt or '財務的機会費用および1日予算の侵食度を評価'}
[時系列影響]: {cascade_result if cascade_result else '非金銭案件または所得増加案件'}

[審議指針]:
1. 検知された金額が1日可処有限度をどれだけ侵食するか 'budget_drain_pct' を精密算出。
2. 転職/年収アップ案件の場合は支出ではなく資産形成加速（INFLOW）効果を分析。
3. 必ず以下のJSON形式でのみ出力してください:
{{
    "stance": "approve|reject|conditional",
    "reasoning": "日本語での専門的判断理由（2文）",
    "metrics": {{
        "daily_budget": {daily_budget},
        "detected_amount": {detected_amount},
        "budget_drain_pct": 0.0,
        "financial_impact_type": "{'OUTFLOW' if is_financial_expense else 'INFLOW_OR_NEUTRAL'}"
    }}
}}
"""
        elif locale == "en":
            prompt = f"""
You are the dedicated subagent [{self.role}] of the ChronosLife governance council.
Deliberate on the proposal based on the user's real-time financial profile.

[CRITICAL LANGUAGE MANDATE: ENGLISH]
Write the 'reasoning' field strictly in natural, professional English. Do NOT use Korean.

[Financial Constitution Profile]:
- Daily safe disposable budget: {daily_budget:,.0f} KRW
- 30-year compound retirement asset target: {retirement_goal}
- Current seed accumulation: {current_seed}
- Core principle: Short-term impulse spending must be absorbable within L1 buffer; 30-year compound harm is blocked.

[Submitted Proposal]: {sanitized_input}
[Orchestrator Directive]: {domain_prompt or 'Evaluate financial opportunity cost and daily budget drain'}
[Time Horizon Impact]: {cascade_result if cascade_result else 'Non-financial or income increase agenda'}

Output strictly in JSON format:
{{
    "stance": "approve|reject|conditional",
    "reasoning": "Professional reasoning in English (2 sentences)",
    "metrics": {{
        "daily_budget": {daily_budget},
        "detected_amount": {detected_amount},
        "budget_drain_pct": 0.0,
        "financial_impact_type": "{'OUTFLOW' if is_financial_expense else 'INFLOW_OR_NEUTRAL'}"
    }}
}}
"""
        else:
            prompt = f"""
당신은 ChronosLife의 독자적 전문 서브에이전트인 [{self.role}]입니다.
사용자의 실시간 재정 거버넌스 프로필을 바탕으로 안건을 철저히 심의하세요.

[사용자 맞춤 재정 헌법 프로필]:
- 일일 가처분 예산 안전 한도: {daily_budget:,.0f}원
- 30년 복리 최종 자산 목표: {retirement_goal}
- 현재 축적 시드 자산: {current_seed}
- 핵심 원칙: 단기 충동 소비는 L1(10일) 완충재 내 흡수 필수, 30년 복리 훼손 결정 자동 차단

[상신 안건]: {sanitized_input}
[오케스트레이터 지침]: {domain_prompt or '재정적 기회비용 및 일일 예산 잠식도 평가'}
[시계열 영향]: {cascade_result if cascade_result else '비금전 안건 또는 소득 증가 안건'}

[심의 지침]:
1. 감지된 금액이 일일 가처분 한도({daily_budget:,.0f}원)를 얼마나 잠식하는지 'budget_drain_pct'를 정밀 산출하세요.
2. 이직/연봉 인상 안건일 경우, 지출이 아니라 자산 형성 가속화(INFLOW) 효과를 분석하세요.
3. 결과는 반드시 JSON으로만 출력하세요:
{{
    "stance": "approve|reject|conditional",
    "reasoning": "한국어로 작성된 전문적 판단 사유 (2문장)",
    "metrics": {{
        "daily_budget": {daily_budget},
        "detected_amount": {detected_amount},
        "budget_drain_pct": 0.0,
        "financial_impact_type": "{'OUTFLOW' if is_financial_expense else 'INFLOW_OR_NEUTRAL'}"
    }}
}}
"""
        ai_res = self._call_gemini_live(prompt, preferred_model)
        ai_res["agent_id"] = self.agent_id
        ai_res["agent_role"] = self.role
        ai_res["applied_guardrails"] = {
            "daily_budget": daily_budget,
            "budget_source": "User Goal Profile"
        }
        return ai_res
