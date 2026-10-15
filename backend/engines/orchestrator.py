"""
ChronosLife Context Orchestrator & Intent Classifier (상위 오케스트레이션 에이전트)
사용자 입력의 본질(지출 vs 이직/연봉 오퍼 vs 스트레스/야근 vs 취미)을 판별하고,
각 도메인 에이전트(Finance, Career, Wellbeing)에 전달할 컨텍스트를 조율합니다.
(폴백 배제: Gemini Live 실시간 호출)
"""
import os
import time
import re
import json
import logging
from typing import Dict, Any, Optional
from dataclasses import dataclass, asdict

from engines.json_utils import parse_json_safely

logger = logging.getLogger(__name__)

@dataclass
class IntentContext:
    intent_type: str  # 'EXPENSE' | 'CAREER_OFFER' | 'LIFESTYLE_STRESS' | 'HABBY_WELLNESS' | 'GENERAL'
    intent_label: str # 한글 라벨
    is_financial_expense: bool # 실제 지출 여부
    financial_impact_type: str # 'OUTFLOW' (지출) | 'INFLOW' (수입증가) | 'NEUTRAL'
    detected_amount: float # 감지된 수치 (원)
    amount_description: str # 금액 설명
    work_hours: Optional[int] # 감지된 근무 시간
    stress_level: int # 추정 스트레스 지수 (0~100)
    domain_prompts: Dict[str, str] # 도메인 에이전트별 특화 지침
    orchestration_reasoning: str # 오케스트레이터의 분석 판단 사유
    model_used: str # 실제 분석에 사용된 모델

class ContextOrchestrator:
    """
    상위 오케스트레이터 에이전트.
    Gemini AI를 활용하여 사용자의 발화를 심층 분석하고,
    하위 전문 에이전트들에게 최적화된 프롬프트를 배분 및 기록(Trace)합니다.
    """
    def __init__(self):
        pass

    async def analyze(self, text: str, preferred_model: str = "gemini-3.5-flash-lite", locale: str = "ja") -> IntentContext:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY가 설정되지 않아 오케스트레이터를 가동할 수 없습니다.")

        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
        models_to_try = []
        for m in [preferred_model, "gemini-3.5-flash-lite", "gemini-flash-lite-latest", "gemini-3.1-flash-lite", "gemini-3.5-flash"]:
            if m and m not in models_to_try:
                models_to_try.append(m)

        if locale == "ja":
            prompt = f"""
あなたは人生ガバナンスシステム『ChronosLife』の【首席コンテキスト・オーケストレーターAI】です。
ユーザーの発話を深く分析し、以下の指針に従って案件の性質を特定し、
下位3つのドメイン専門エージェント（Finance, Career, Wellbeing）および最高仲裁官（Chief Governor）に伝達する最適化された「審議指示プロンプト」を生成してください。

[CRITICAL LANGUAGE MANDATE: JAPANESE (日本語)]
すべてのテキスト値（intent_label, amount_description, orchestration_reasoning, domain_prompts）を自然な日本語で生成してください。
韓国語（한국어）は絶対に出力に含めないでください。

[ユーザー発話]:
"{text}"

[判定ガイドライン]:
1. intent_type:
   - CAREER_OFFER: 転職、年収アップ、スタートアップスカウト等（支出ではなく将来の所得向上や労働条件変更）
   - EXPENSE: 買い物、電子機器購入、飲み会、出前、衝動消費など実質的な財務リソースの消費
   - LIFESTYLE_STRESS: 連続残業、極度の疲労、退勤時の燃え尽き症候群（回復処方の対象）
   - HABBY_WELLNESS: マラソン、ランニング、楽器、写真、趣味活動（個人趣味枠の死守対象）
   - GENERAL: その他の一般的なライフガバナンス案件
2. is_financial_expense:
   - 消費・支出の場合のみ true、年収アップ提案等は必ず false に設定すること。
3. domain_prompts: 各エージェントに下達する専門的指示をすべて日本語で作成すること。

必ず以下のJSON形式でのみ出力してください（キーは英語、値は日本語）:
{{
    "intent_type": "CAREER_OFFER|EXPENSE|LIFESTYLE_STRESS|HABBY_WELLNESS|GENERAL",
    "intent_label": "日本語ラベル (例: 💳 衝動的な支出・買い物)",
    "is_financial_expense": true,
    "financial_impact_type": "OUTFLOW|INFLOW|NEUTRAL",
    "detected_amount": 0,
    "amount_description": "日本語での金額および事案の要約",
    "work_hours": null,
    "stress_level": 70,
    "orchestration_reasoning": "日本語でのオーケストレーション判断理由（2文）",
    "domain_prompts": {{
        "finance": "財務エージェントへの日本語指示",
        "career": "キャリアエージェントへの日本語指示",
        "wellbeing": "ウェルビーイングエージェントへの日本語指示",
        "chief_governor": "最高仲裁官への日本語指示"
    }}
}}
"""
        elif locale == "en":
            prompt = f"""
You are the [Chief Context Orchestrator AI] of ChronosLife.
Analyze the user utterance in depth, categorize the nature of the proposal, and formulate tailored deliberation directives for the 3 domain subagents (Finance, Career, Wellbeing) and the Chief Governor.

[CRITICAL LANGUAGE MANDATE: ENGLISH]
ALL OUTPUT VALUES (intent_label, amount_description, orchestration_reasoning, domain_prompts) MUST BE WRITTEN IN NATURAL ENGLISH.
DO NOT USE KOREAN UNDER ANY CIRCUMSTANCES.

[User Utterance]:
"{text}"

[Classification Guidelines]:
1. intent_type:
   - CAREER_OFFER: Job transfer, salary bump, startup scouting (NOT an expense, but future income and working condition changes)
   - EXPENSE: Shopping, electronics purchase, dining, impulsive spending consuming financial resources
   - LIFESTYLE_STRESS: Consecutive overtime, chronic exhaustion, burnout (recovery intervention target)
   - HABBY_WELLNESS: Marathon, running, music, photography, hobbies (personal hobby quota target)
   - GENERAL: General life governance agenda
2. is_financial_expense:
   - Set true ONLY for spending/outflows; set false for salary offers, wellness, etc.
3. domain_prompts: Provide clear, expert directives in English for each agent.

Output strictly in JSON format (keys in English, values in English):
{{
    "intent_type": "CAREER_OFFER|EXPENSE|LIFESTYLE_STRESS|HABBY_WELLNESS|GENERAL",
    "intent_label": "English Label (e.g. 💳 Impulsive Purchase & Expense)",
    "is_financial_expense": true,
    "financial_impact_type": "OUTFLOW|INFLOW|NEUTRAL",
    "detected_amount": 0,
    "amount_description": "Summary of amount and proposal in English",
    "work_hours": null,
    "stress_level": 70,
    "orchestration_reasoning": "Orchestration reasoning in English (2 sentences)",
    "domain_prompts": {{
        "finance": "Directive to Finance Agent in English",
        "career": "Directive to Career Agent in English",
        "wellbeing": "Directive to Wellbeing Agent in English",
        "chief_governor": "Directive to Chief Governor in English"
    }}
}}
"""
        else:
            prompt = f"""
당신은 ChronosLife의 '수석 컨텍스트 오케스트레이터(Chief Context Orchestrator AI)'입니다.
사용자의 발화를 심층 분석하여 아래의 지침에 따라 안건의 성격을 규명하고,
하위 3개 도메인 전문 에이전트(Finance, Career, Wellbeing)와 최고 중재관(Chief Governor)에게 전달할 최적화된 '특화 심의 지침 프롬프트'를 생성하세요.

[사용자 발화]:
"{text}"

[판별 가이드라인]:
1. intent_type:
   - CAREER_OFFER: 이직, 연봉 인상, 스타트업 스카우트 등 (지출이 아니라 미래 소득 증대 및 근로조건 변경!)
   - EXPENSE: 쇼핑, 전자기기 구매, 회식, 배달음식, 충동 소비 등 실제 재정 자원 소진
   - LIFESTYLE_STRESS: 연속 야근, 극심한 피로, 퇴근길 번아웃 (회복 처방 대상)
   - HABBY_WELLNESS: 마라톤, 러닝, 악기, 사진, 취미 활동 (개인 취미 쿼터 수호 대상)
   - GENERAL: 기타 일반 라이프 거버넌스 안건
2. is_financial_expense:
   - 소비/지출일 때만 true, 연봉 인상 제안 등은 반드시 false로 지정할 것.
3. 각 에이전트별 전달할 domain_prompts를 명확하고 전문적으로 작성할 것.

반드시 아래 JSON 형식으로만 응답하세요:
{{
    "intent_type": "CAREER_OFFER|EXPENSE|LIFESTYLE_STRESS|HABBY_WELLNESS|GENERAL",
    "intent_label": "💳 충동 구매 및 지출",
    "is_financial_expense": true,
    "financial_impact_type": "OUTFLOW|INFLOW|NEUTRAL",
    "detected_amount": 0,
    "amount_description": "금액 및 사안 요약",
    "work_hours": null,
    "stress_level": 70,
    "orchestration_reasoning": "오케스트레이션 판단 사유 (2문장)",
    "domain_prompts": {{
        "finance": "재정 에이전트 지침",
        "career": "커리어 에이전트 지침",
        "wellbeing": "웰빙 에이전트 지침",
        "chief_governor": "최고 중재관 지침"
    }}
}}
"""

        last_err = None
        for model_candidate in models_to_try:
            start_time = time.time()
            try:
                response = client.models.generate_content(
                    model=model_candidate,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.2,
                        response_mime_type="application/json"
                    )
                )
                duration_ms = (time.time() - start_time) * 1000.0
                data = parse_json_safely(response.text)
                if data and "intent_type" in data:
                    from engines.dev_logger import dev_log_store
                    dev_log_store.log_llm_call(
                        caller="ContextOrchestrator",
                        model=model_candidate,
                        prompt=prompt,
                        response_text=response.text,
                        duration_ms=duration_ms
                    )
                    return IntentContext(
                        intent_type=data.get("intent_type", "GENERAL"),
                        intent_label=data.get("intent_label", "📋 일반 거버넌스 안건"),
                        is_financial_expense=bool(data.get("is_financial_expense", False)),
                        financial_impact_type=data.get("financial_impact_type", "NEUTRAL"),
                        detected_amount=float(data.get("detected_amount", 0.0)),
                        amount_description=data.get("amount_description", "금액 정보 없음"),
                        work_hours=data.get("work_hours"),
                        stress_level=int(data.get("stress_level", 50)),
                        domain_prompts=data.get("domain_prompts", {}),
                        orchestration_reasoning=data.get("orchestration_reasoning", "AI 오케스트레이터가 다차원 균형 관점에서 의도를 자동 분류했습니다."),
                        model_used=model_candidate
                    )
            except Exception as e:
                last_err = e
                logger.warning(f"Orchestrator model {model_candidate} retry: {e}")

        raise RuntimeError(f"ContextOrchestrator 분석 실패 (모든 Gemini 모델 응답 불가): {last_err}")
