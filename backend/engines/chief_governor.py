"""
ChronosLife Chief Governor (최고 중재관)
도메인 위원회의 의견을 헌법(Constitution)에 비추어 심사하고 최종 중재 판결을 내립니다.
(폴백 배제: 순수 Live Gemini AI 판결)
"""
import os
import time
import json
import logging
from typing import Dict, Any, Optional
from engines.json_utils import parse_json_safely

logger = logging.getLogger(__name__)

CONSTITUTION_TENETS_KO = '''
제1조: 어떤 금전적 이익도 가족과의 기본 식사 시간(주 3회)과 주말 개인 취미 몰입(주 4시간)을 영구히 침해할 수 없다.
제2조: 단기 쾌락을 위한 충동 지출은 L1(10일) 완충재 내에서 흡수 가능할 때만 조건부 허용한다.
제3조: 신체 건강(수면 7시간, 번아웃 지수 ≤ 0.70)은 어떤 커리어 목표보다 우선한다.
제4조: 30년 은퇴 자산 목표를 연간 5% 이상 훼손하는 단일 결정은 자동 기각된다.
제5조: 모든 중대 결정은 L2(100일) 유예기간을 통해 검증한 후 최종 확정한다.
'''

CONSTITUTION_TENETS_JA = '''
第1条: いかなる金銭的利益も家族との基本的な食事時間(週3回)および週末の個人趣味没頭(週4時間)を恒久的に侵害することはできない。
第2条: 短期的な快楽のための衝動支出は、L1(10日)緩衝期間内で吸収可能な場合に限り条件付きで許可する。
第3条: 身体の健康(睡眠7時間、バーンアウト指数 ≤ 0.70)は、いかなるキャリア目標よりも優先する。
第4条: 30年のリタイア資産目標を年間5%以上損なう単一の決定は自動棄却される。
第5条: すべての重大な決定は、L2(100日)猶予期間を通じた検証を経て最終確定する。
'''

CONSTITUTION_TENETS_EN = '''
Article 1: No financial gain may permanently compromise basic family dinner time (3x/week) and weekend hobby immersion (4h/week).
Article 2: Impulsive spending for short-term gratification is conditionally permitted only when absorbable within L1 (10-day) buffer.
Article 3: Physical health (7h sleep, burnout index <= 0.70) precedes any career achievements.
Article 4: Any single decision compromising the 30-year retirement asset goal by >5%/yr is auto-rejected.
Article 5: All critical decisions must be validated through an L2 (100-day) probationary period before final confirmation.
'''

CONSTITUTION_TENETS = CONSTITUTION_TENETS_KO

class ChiefGovernor:
    """
    ChronosLife의 최종 중재 엔진.
    도메인 위원회의 의견을 헌법(Constitution)에 비추어 심사하고 최종 결정을 내립니다.
    """
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY가 설정되지 않아 ChiefGovernor를 가동할 수 없습니다.")
        from google import genai
        self.client = genai.Client(api_key=api_key)

    async def arbitrate(
        self, 
        proposal_title: str, 
        domain_evaluations: dict, 
        cascade_summary: str,
        intent_context: Optional[Any] = None,
        preferred_model: Optional[str] = None,
        locale: str = "ko"
    ) -> Dict[str, Any]:
        """
        안건에 대한 도메인별 의견과 Log10 요약 결과를 종합하여 최종 결정을 도출합니다.
        (폴백 배제)
        """
        from google.genai import types

        if locale == "ja":
            prompt = f"""
あなたは人生ガバナンスシステム『ChronosLife』の最高憲法擁護機関である【最高仲裁官（Chief Governor AI）】です。
以下の3大独立専門ドメイン委員会（財務、キャリア、ウェルビーイング）の審議報告書を総合検討し、
L4人生憲法原則に従って最終仲裁判決文（Ruling）を作成してください。

[CRITICAL LANGUAGE MANDATE: JAPANESE (日本語)]
すべての項目（reasoning, decision, pareto_counter_offer, l2_review_conditions, violated_tenets）を自然で流暢な日本語で作成してください。
韓国語（한국어）は絶対に使用しないでください。
- "decision": "条件付き修正", "承認", または "棄却" のいずれかを使用。
- "violated_tenets": 日本語で表記（例: ["第1条", "第2条", "第3条"]）。
- "reasoning": 判決理由を明確な日本語で約2文で作成。
- "pareto_counter_offer": 具体的かつ実効性のあるパレートカウンターオファーを日本語で提示。
- "l2_review_conditions": L2（100日）猶予・検証条件を日本語で提示。

[L4 人生憲法の核心原則（不変の基本法）]
{CONSTITUTION_TENETS_JA}

[上程された意思決定案件]: {proposal_title}
[インテント属性]: {getattr(intent_context, 'intent_label', '一般案件')}

[ドメイン委員会 審議意見]:
{json.dumps(domain_evaluations, ensure_ascii=False)}

[時系列影響要約]:
{cascade_summary}

[仲裁・判決指針]
1. AI迎合（Sycophancy）の禁止: ユーザーの非現実的な野望や自己正当化に迎合しないでください。
2. パレート最適化: 単に棄却するのではなく、L4憲法を守りつつL2（100日）レベルで実行可能な「条件付き修正案（パレートカウンターオファー）」を必ず提示してください。
3. 必ず以下のJSON形式でのみ出力してください（キーは英語、値はすべて日本語）:
{{
    "decision": "条件付き修正|承認|棄却",
    "violated_tenets": ["第2条", "第3条"],
    "reasoning": "日本語での判決理由",
    "pareto_counter_offer": "日本語でのパレートカウンターオファー",
    "l2_review_conditions": "日本語でのL2検証条件"
}}
"""
        elif locale == "en":
            prompt = f"""
You are the [Chief Governor AI], the supreme constitutional authority of ChronosLife.
Review the deliberation reports from the 3 independent domain councils (Finance, Career, Wellbeing) and issue the final arbitration ruling according to the L4 Life Constitution.

[CRITICAL LANGUAGE MANDATE: ENGLISH]
ALL OUTPUT VALUES MUST BE WRITTEN IN NATURAL, FLUENT ENGLISH.
DO NOT USE KOREAN UNDER ANY CIRCUMSTANCES.
- "decision": Use "conditional", "approve", or "reject".
- "violated_tenets": List in English (e.g. ["Article 1", "Article 2"]).
- "reasoning": 2 clear sentences in English explaining the ruling.
- "pareto_counter_offer": Concrete Pareto counter-offer in English.
- "l2_review_conditions": 100-day validation criteria in English.

[L4 Life Constitution Tenets (Inviolable Laws)]
{CONSTITUTION_TENETS_EN}

[Submitted Proposal]: {proposal_title}
[Intent Context]: {getattr(intent_context, 'intent_label', 'General Proposal')}

[Domain Council Deliberations]:
{json.dumps(domain_evaluations, ensure_ascii=False)}

[Time Horizon Impact Summary]:
{cascade_summary}

[Arbitration Guidelines]
1. Anti-Sycophancy: Do not indulge unrealistic user ambitions or rationalizations.
2. Pareto Optimization: Provide a constructive, actionable conditional modification rather than outright rejection.
3. Output strictly in JSON format (keys in English, values in English):
{{
    "decision": "conditional|approve|reject",
    "violated_tenets": ["Article 2", "Article 3"],
    "reasoning": "Final ruling rationale in English",
    "pareto_counter_offer": "Concrete Pareto counter-offer in English",
    "l2_review_conditions": "L2 100-day verification conditions in English"
}}
"""
        else:
            prompt = f"""
당신은 ChronosLife의 최고 헌법 수호 기관인 [최고 중재관(Chief Governor AI)]입니다.
아래의 3대 독립 전문 도메인 위원회(재정, 커리어, 웰빙)의 심의 보고서를 종합 검토하고,
L4 인생 헌법 원칙에 따라 최종 중재 판결문(Ruling)을 작성하세요.

[LANGUAGE MANDATE: KOREAN (한국어)]
모든 판결 이유, 카운터오퍼, 유예 조건은 한국어로 명확하게 작성하세요.
- "decision": "조건부수정|승인|기각"
- "violated_tenets": ["제1조", "제2조", ...]

[L4 인생 헌법 핵심 원칙 (불변의 법률)]
{CONSTITUTION_TENETS_KO}

[상신된 의사결정 안건]: {proposal_title}
[인텐트 속성]: {getattr(intent_context, 'intent_label', '일반 안건')}

[도메인 위원회 심의 의견]:
{json.dumps(domain_evaluations, ensure_ascii=False)}

[시계열 영향 요약]:
{cascade_summary}

[중재 및 판결 지침]
1. AI 영합(Sycophancy) 금지: 사용자의 비현실적 야망이나 자기합리화에 동조하지 마십시오.
2. 파레토 최적화: 단순히 기각하는 대신, L4 헌법을 수호하면서도 L2(100일) 차원에서 실행 가능한 '조건부 수정 승인안(파레토 카운터오퍼)'을 반드시 제시하십시오.
3. 결과는 반드시 JSON으로만 출력하십시오:
{{
    "decision": "조건부수정|승인|기각",
    "violated_tenets": ["제2조", "제3조"],
    "reasoning": "판결 이유 (약 2문장)",
    "pareto_counter_offer": "구체적인 파레토 카운터오퍼",
    "l2_review_conditions": "L2 100일 검증 조건"
}}
"""
        
        models_to_try = []
        for m in [preferred_model, "gemini-3.5-flash-lite", "gemini-flash-lite-latest", "gemini-3.1-flash-lite", "gemini-3.5-flash"]:
            if m and m not in models_to_try:
                models_to_try.append(m)

        last_error = None
        for model_candidate in models_to_try:
            start_time = time.time()
            try:
                response = self.client.models.generate_content(
                    model=model_candidate,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.15,
                        max_output_tokens=1024,
                        response_mime_type="application/json"
                    )
                )
                duration_ms = (time.time() - start_time) * 1000.0
                res = parse_json_safely(response.text)
                if res and "decision" in res:
                    res["model_used"] = model_candidate
                    from engines.dev_logger import dev_log_store
                    dev_log_store.log_llm_call(
                        caller="ChiefGovernor",
                        model=model_candidate,
                        prompt=prompt,
                        response_text=response.text,
                        duration_ms=duration_ms
                    )
                    return res
            except Exception as e:
                last_error = e
                logger.warning(f"ChiefGovernor model {model_candidate} retry: {e}")

        raise RuntimeError(f"ChiefGovernor 판결 도출 실패 (모든 Gemini 모델 응답 불가): {last_error}")
