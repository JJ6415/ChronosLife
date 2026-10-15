"""
Wellbeing Sub-Agent (생체 항상성 및 라이프 밸런스 수호관)
사용자의 인생 헌법 제1조(가족 식사 주 3회, 주말 취미 4시간)와 제3조(수면 7시간)를 결사 수호하며,
과로, 번아웃, 야식 충동 등 신체적·정신적 항상성을 해치는 안건을 자율 심의합니다.
"""
from typing import Dict, Any, Optional
from engines.subagents.base_agent import BaseSubAgent

class WellbeingSubAgent(BaseSubAgent):
    def __init__(self):
        super().__init__(
            agent_id="WellbeingSubAgent",
            name="웰빙 & 밸런스 에이전트",
            role="생체 항상성 및 라이프 밸런스 수호관 (Homeostasis Guardian)",
            icon="🏃"
        )

    async def evaluate(
        self, 
        sanitized_input: str, 
        intent_context: Optional[Any] = None,
        user_profile: Optional[Dict[str, Any]] = None,
        preferred_model: Optional[str] = None,
        locale: str = "ko"
    ) -> Dict[str, Any]:
        profile = user_profile or {}
        min_sleep = int(profile.get("min_sleep_hours", 7))
        family_meals = int(profile.get("family_dinner_quota", 3))
        hobby_hours = int(profile.get("hobby_block_quota", 4))

        work_hours = getattr(intent_context, 'work_hours', None) if intent_context else None
        stress_level = getattr(intent_context, 'stress_level', 50) if intent_context else 50
        domain_prompt = getattr(intent_context, 'domain_prompts', {}).get('wellbeing', '') if intent_context else ''

        if locale == "ja":
            prompt = f"""
あなたは人生ガバナンスシステム『ChronosLife』の専門サブエージェント【{self.role}】です。
ユーザーのリアルタイム全人的ウェルビーイング憲法を基に、上程案件を厳格に審議してください。

[CRITICAL LANGUAGE MANDATE: JAPANESE (日本語)]
判断理由（'reasoning'）は必ず自然な日本語で作成してください。韓国語は使用しないでください。

[ユーザーウェルビーイング憲法ガードレール]:
- 第1条 (家族の絆・趣味権): 週あたり最低家族食事 {family_meals}回 & 週末趣味 {hobby_hours}時間の死守
- 第3条 (身体健康権): 1日最低睡眠 {min_sleep}時間確保、バーンアウト指数 0.70以下に統制

[上程案件]: {sanitized_input}
[オーケストレーター指示]: {domain_prompt or '家族食事、睡眠、個人趣味枠の死守可否を評価'}
[検知された状態]: 勤務 {work_hours}時間 / ストレス指数 {stress_level}点

[審議指針]:
1. 家族との夕食({family_meals}回)や週末の趣味没頭({hobby_hours}時間)を侵害するか評価。
2. 疲労蓄積による暴食/衝動支出か、適切な休息と回復かを判別。
3. 必ず以下のJSON形式でのみ出力してください:
{{
    "stance": "approve|reject|conditional",
    "reasoning": "日本語での専門的判断理由（2文）",
    "metrics": {{
        "min_sleep_target": {min_sleep},
        "family_meals_target": {family_meals},
        "hobby_hours_target": {hobby_hours},
        "homeostasis_risk": "SAFE|WARNING|CRITICAL"
    }}
}}
"""
        elif locale == "en":
            prompt = f"""
You are the dedicated subagent [{self.role}] of the ChronosLife governance council.
Deliberate on the proposal based on the user's holistic wellbeing constitution.

[CRITICAL LANGUAGE MANDATE: ENGLISH]
Write the 'reasoning' field strictly in natural, professional English. Do NOT use Korean.

[Wellbeing Constitution Guardrails]:
- Article 1 (Family & Hobby): Min {family_meals} family meals/week & {hobby_hours}h weekend hobby immersion
- Article 3 (Physical Health): Min {min_sleep}h daily sleep, burnout index <= 0.70

[Submitted Proposal]: {sanitized_input}
[Orchestrator Directive]: {domain_prompt or 'Evaluate protection of family meals, sleep, and hobby quotas'}
[Observed Status]: Work {work_hours} hrs / Stress score {stress_level}/100

Output strictly in JSON format:
{{
    "stance": "approve|reject|conditional",
    "reasoning": "Professional reasoning in English (2 sentences)",
    "metrics": {{
        "min_sleep_target": {min_sleep},
        "family_meals_target": {family_meals},
        "hobby_hours_target": {hobby_hours},
        "homeostasis_risk": "SAFE|WARNING|CRITICAL"
    }}
}}
"""
        else:
            prompt = f"""
당신은 ChronosLife의 독자적 전문 서브에이전트인 [{self.role}]입니다.
사용자의 실시간 전인적 웰빙 헌법을 바탕으로 안건을 엄격히 심의하세요.

[사용자 맞춤 웰빙 헌법 가드레일]:
- 제1조 (가족 유대 및 취미권): 주당 최소 가족 식사 {family_meals}회 및 주말 취미 {hobby_hours}시간 사수
- 제3조 (신체 건강권): 일일 최소 수면 {min_sleep}시간 확보, 번아웃 지수 0.70 이하 통제

[상신 안건]: {sanitized_input}
[오케스트레이터 지침]: {domain_prompt or '가족 식사, 수면, 개인 취미 쿼터 수호 여부 평가'}
[감지된 상태]: 근무 {work_hours}시간 / 스트레스 지수 {stress_level}점

[심의 지침]:
1. 안건이 가족과의 저녁 식사({family_meals}회)나 주말 취미 몰입({hobby_hours}시간)을 침해하는지 평가하세요.
2. 피로 누적으로 인한 폭식/충동 지출인지, 아니면 적절한 휴식과 회복인지 판별하세요.
3. 결과는 반드시 JSON으로만 출력하세요:
{{
    "stance": "approve|reject|conditional",
    "reasoning": "한국어로 작성된 전문적 판단 사유 (2문장)",
    "metrics": {{
        "min_sleep_target": {min_sleep},
        "family_meals_target": {family_meals},
        "hobby_hours_target": {hobby_hours},
        "homeostasis_risk": "SAFE|WARNING|CRITICAL"
    }}
}}
"""
        ai_res = self._call_gemini_live(prompt, preferred_model)
        ai_res["agent_id"] = self.agent_id
        ai_res["agent_role"] = self.role
        ai_res["applied_guardrails"] = {
            "min_sleep_hours": min_sleep,
            "family_dinner_quota": family_meals,
            "hobby_block_quota": hobby_hours,
            "constitution_source": "Constitution Article 1 & 3"
        }
        return ai_res
