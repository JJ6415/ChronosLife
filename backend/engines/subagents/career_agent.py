"""
Career Sub-Agent (커리어 성장 및 전문성 수호관)
사용자의 커리어 헌법(주당 최대 노동 시간 상한, 번아웃 방어선, 전문성 티어)을 기반으로
안건이 장기적 시장 가치 및 생체 지속 가능성에 미치는 영향을 자율 심의합니다.
"""
from typing import Dict, Any, Optional
from engines.subagents.base_agent import BaseSubAgent

class CareerSubAgent(BaseSubAgent):
    def __init__(self):
        super().__init__(
            agent_id="CareerSubAgent",
            name="커리어 거버넌스 에이전트",
            role="커리어 전략 및 직무 전문성 지속가능성 수호관 (Career Strategist)",
            icon="📈"
        )

    async def evaluate(
        self, 
        sanitized_input: str, 
        intent_context: Optional[Any] = None,
        user_profile: Optional[Dict[str, Any]] = None,
        preferred_model: Optional[str] = None,
        locale: str = "ja"
    ) -> Dict[str, Any]:
        profile = user_profile or {}
        max_work_hours = int(profile.get("max_weekly_hours", 52))

        work_hours = getattr(intent_context, 'work_hours', None) if intent_context else None
        stress_level = getattr(intent_context, 'stress_level', 50) if intent_context else 50
        domain_prompt = getattr(intent_context, 'domain_prompts', {}).get('career', '') if intent_context else ''

        if locale == "ja":
            prompt = f"""
あなたは人生ガバナンスシステム『ChronosLife』の専門サブエージェント【{self.role}】です。
ユーザーのリアルタイムキャリア憲法プロファイルを基に、上程案件を専門的に審議してください。

[CRITICAL LANGUAGE MANDATE: JAPANESE (日本語)]
判断理由（'reasoning'）は必ず自然な日本語で作成してください。韓国語は使用しないでください。

[ユーザーキャリア憲法プロファイル]:
- 週あたりの法定/憲法労働上限: {max_work_hours}時間 (枯渇型過重労働の排除)
- 30年のキャリアビジョン: 持続可能な市場価値の最大化および専門性の強化

[上程案件]: {sanitized_input}
[オーケストレーター指示]: {domain_prompt or 'キャリア成長性およびバーンアウト危険度の評価'}
[検知された労働条件]: 週 {work_hours}時間労働 (推定ストレス: {stress_level}点)

[審議指針]:
1. 案件の労働強度が週 {max_work_hours}時間上限を超過するか厳格に検証。
2. 単なる報酬アップよりも1年以内のバーンアウト離職リスクや実質的な専門性蓄積を重視。
3. 必ず以下のJSON形式でのみ出力してください:
{{
    "stance": "approve|reject|conditional|neutral",
    "reasoning": "日本語での専門的判断理由（2文）",
    "metrics": {{
        "weekly_hours_cap": {max_work_hours},
        "detected_hours": {work_hours if work_hours else 'null'},
        "burnout_risk": "LOW|MODERATE|CRITICAL",
        "growth_potential": "HIGH|MODERATE|LOW"
    }}
}}
"""
        elif locale == "en":
            prompt = f"""
You are the dedicated subagent [{self.role}] of the ChronosLife governance council.
Deliberate on the proposal based on the user's career constitution profile.

[CRITICAL LANGUAGE MANDATE: ENGLISH]
Write the 'reasoning' field strictly in natural, professional English. Do NOT use Korean.

[Career Constitution Profile]:
- Weekly labor cap: {max_work_hours} hours (protection against exploitative burnout)
- 30-year career vision: Sustainable market value maximization & expertise building

[Submitted Proposal]: {sanitized_input}
[Orchestrator Directive]: {domain_prompt or 'Evaluate career growth potential and burnout risk'}
[Working Conditions]: {work_hours} hrs/week (Estimated stress: {stress_level}/100)

Output strictly in JSON format:
{{
    "stance": "approve|reject|conditional|neutral",
    "reasoning": "Professional reasoning in English (2 sentences)",
    "metrics": {{
        "weekly_hours_cap": {max_work_hours},
        "detected_hours": {work_hours if work_hours else 'null'},
        "burnout_risk": "LOW|MODERATE|CRITICAL",
        "growth_potential": "HIGH|MODERATE|LOW"
    }}
}}
"""
        else:
            prompt = f"""
당신은 ChronosLife의 독자적 전문 서브에이전트인 [{self.role}]입니다.
사용자의 실시간 커리어 헌법 프로필을 바탕으로 안건을 전문적으로 심의하세요.

[사용자 맞춤 커리어 헌법 프로필]:
- 주당 법정/헌법 근로 상한: {max_work_hours}시간 (고갈형 과노동 원천 배제)
- 30년 커리어 비전: 지속 가능한 시장 가치 극대화 및 직무 전문성 강화

[상신 안건]: {sanitized_input}
[오케스트레이터 지침]: {domain_prompt or '커리어 성장성 및 번아웃 위험도 평가'}
[감지된 근로 조건]: 주 {work_hours}시간 근로 (추정 스트레스: {stress_level}점)

[심의 지침]:
1. 안건의 노동 강도가 주 {max_work_hours}시간 상한을 초과하는지 여부를 엄정히 점검하세요.
2. 단순 보상 상승보다 1년 내 번아웃 퇴사 위험과 실질 전문성 축적 여부를 가늠하세요.
3. 결과는 반드시 JSON으로만 출력하세요:
{{
    "stance": "approve|reject|conditional|neutral",
    "reasoning": "한국어로 작성된 전문적 판단 사유 (2문장)",
    "metrics": {{
        "weekly_hours_cap": {max_work_hours},
        "detected_hours": {work_hours if work_hours else 'null'},
        "burnout_risk": "LOW|MODERATE|CRITICAL",
        "growth_potential": "HIGH|MODERATE|LOW"
    }}
}}
"""
        ai_res = self._call_gemini_live(prompt, preferred_model)
        ai_res["agent_id"] = self.agent_id
        ai_res["agent_role"] = self.role
        ai_res["applied_guardrails"] = {
            "max_weekly_hours": max_work_hours,
            "cap_source": "Career Constitution Article 4"
        }
        return ai_res
