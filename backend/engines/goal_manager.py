"""
ChronosLife Goal & Constitution Manager (Layer 3 & 4 보조 엔진)
커리어, 건강, 가족, 개인 취미, 재정 5대 도메인 목표 관리 및 실시간 행동 영향도 평가기
"""
import os
import re
import copy
from typing import Dict, Any, List, Optional
from engines.json_utils import parse_json_safely

DEFAULT_GOALS_KO = {
    "family": {
        "id": "family",
        "category": "가족 (Family)",
        "icon": "👨‍👩‍👧",
        "title": "가족 유대감 및 저녁 일상 사수",
        "target_value": "주당 가족 저녁 식사 최소 3회 이상",
        "current_value": "이번 주 가족 식사 2회 달성",
        "rule": "주말 가족 행사 절대 우선 배정, 평일 저녁 상호 경청 시간 확보",
        "tenet": "제1조 (가족 유대권): 어떤 금전적 이익도 가족과의 기본 식사 시간(주 3회)을 영구히 침해할 수 없다.",
        "progress": 60
    },
    "hobby": {
        "id": "hobby",
        "category": "개인 취미 (Hobby)",
        "icon": "🎨",
        "title": "개인 취미 몰입 쿼터 사수 (음악·러닝·창작)",
        "target_value": "주당 개인 취미 몰입 4시간 쿼터",
        "current_value": "이번 주 취미 시간 2.5시간 확보",
        "rule": "주말 취미 블록 강제 잠금, 업무 연락 완전 차단",
        "tenet": "제2조 (개인 취미권): 주당 4시간의 개인 취미 몰입 쿼터는 번아웃 방어와 자아실현의 불변 헌법이다.",
        "progress": 50
    },
    "health": {
        "id": "health",
        "category": "건강 (Health)",
        "icon": "🏃",
        "title": "수면 부채 제로 및 생체 항상성 유지",
        "target_value": "일일 수면 7시간 이상, 심박변이도(HRV) 정상",
        "current_value": "주간 평균 수면 6.2시간 (수면 부채 주의)",
        "rule": "연속 3일 22시 이후 야근 금지, 충동 배달음식 방어",
        "tenet": "제3조 (신체 건강권): 신체 건강(수면 7시간, 번아웃 지수 ≤ 0.70)은 모든 외적 성취에 선행하는 절대 기본권이다.",
        "progress": 55
    },
    "career": {
        "id": "career",
        "category": "커리어 (Career)",
        "icon": "📈",
        "title": "지속 가능한 전문성 강화 및 시장가치 극대화",
        "target_value": "전문성 레벨 Tier 1 달성 (주 52시간 캡 준수)",
        "current_value": "주간 근무 평균 48시간",
        "rule": "주당 최대 노동 시간 52시간 상한 엄수, 고갈형 노동 거부권 행사",
        "tenet": "제4조 (지속가능 성장권): 커리어 성장은 주 52시간 상한 내에서 추구되어야 하며 생체 항상성을 파괴하는 과노동은 영구 배제한다.",
        "progress": 75
    },
    "finance": {
        "id": "finance",
        "category": "재정 (Finance)",
        "icon": "💰",
        "title": "30년 복리 순자산 10억 및 은퇴 자립",
        "target_value": "은퇴 자산 10억 원",
        "current_value": "현재 시드 8,500만 원",
        "rule": "일일 가처분 40,000원 한도 준수, 고위험 레버리지 차단",
        "tenet": "제5조 (평생 재정권): 일일 가처분 40,000원 한도를 수호하고, 30년 은퇴 자산 목표를 연간 5% 이상 훼손하는 단일 결정은 자동 기각된다.",
        "progress": 68
    }
}

DEFAULT_GOALS_EN = {
    "family": {
        "id": "family",
        "category": "Family",
        "icon": "👨‍👩‍👧",
        "title": "Protect Family Bonding & Evening Routine",
        "target_value": "Family dinners at least 3 times per week",
        "current_value": "2 family dinners achieved this week",
        "rule": "Prioritize weekend family events, ensure active listening on weekday evenings",
        "tenet": "Article 1 (Family Bond): No financial gain may permanently compromise basic family dinner time (3x/week).",
        "progress": 60
    },
    "hobby": {
        "id": "hobby",
        "category": "Personal Hobby",
        "icon": "🎨",
        "title": "Safeguard Hobby Immersion Quota (Music, Running, Creation)",
        "target_value": "4-hour weekly personal hobby immersion quota",
        "current_value": "2.5 hours of hobby time secured this week",
        "rule": "Enforce weekend hobby block locking, completely block work notifications",
        "tenet": "Article 2 (Personal Hobby): A weekly 4-hour hobby quota is an unchangeable constitution for burnout prevention and self-realization.",
        "progress": 50
    },
    "health": {
        "id": "health",
        "category": "Health",
        "icon": "🏃",
        "title": "Zero Sleep Debt & Maintain Biological Homeostasis",
        "target_value": "7+ hours daily sleep, normal HRV",
        "current_value": "Weekly average sleep 6.2 hours (Sleep debt warning)",
        "rule": "No overtime past 22:00 for 3 consecutive days, guard against impulsive late-night snacks",
        "tenet": "Article 3 (Physical Health): Physical health (7h sleep, burnout index <= 0.70) is an absolute basic right preceding all external achievements.",
        "progress": 55
    },
    "career": {
        "id": "career",
        "category": "Career",
        "icon": "📈",
        "title": "Sustainable Expertise Enhancement & Maximize Market Value",
        "target_value": "Achieve Tier 1 expertise level (Comply with 52h weekly cap)",
        "current_value": "Weekly average work 48 hours",
        "rule": "Strictly observe 52-hour weekly maximum work cap, exercise veto against depleting labor",
        "tenet": "Article 4 (Sustainable Growth): Career growth must be pursued within the 52-hour weekly cap; depleting overwork is permanently banned.",
        "progress": 75
    },
    "finance": {
        "id": "finance",
        "category": "Finance",
        "icon": "💰",
        "title": "30-Year Compound Net Assets 1B KRW & Retirement Independence",
        "target_value": "Retirement assets 1,000,000,000 KRW",
        "current_value": "Current seed 85,000,000 KRW",
        "rule": "Comply with daily disposable budget of 40,000 KRW, block high-risk leverage",
        "tenet": "Article 5 (Lifelong Financial Right): Protect the 40,000 KRW daily disposable limit; any decision compromising retirement assets by >5%/yr is auto-rejected.",
        "progress": 68
    }
}

DEFAULT_GOALS_JA = {
    "family": {
        "id": "family",
        "category": "家族 (Family)",
        "icon": "👨‍👩‍👧",
        "title": "家族の絆と夕食ルーティンの死守",
        "target_value": "週3回以上の家族での夕食",
        "current_value": "今週の家族での夕食2回達成",
        "rule": "週末の家族行事を最優先、平日の夜は互いに傾聴する時間を確保",
        "tenet": "第1条 (家族の絆権): いかなる金銭的利益も家族との基本的な食事時間(週3回)を恒久的に侵害することはできない。",
        "progress": 60
    },
    "hobby": {
        "id": "hobby",
        "category": "個人の趣味 (Hobby)",
        "icon": "🎨",
        "title": "個人の趣味没頭クォータの死守 (音楽・ランニング・創作)",
        "target_value": "週4時間の個人趣味没頭クォータ",
        "current_value": "今週の趣味時間2.5時間確保",
        "rule": "週末の趣味ブロックを強制ロック、業務連絡を完全遮断",
        "tenet": "第2条 (個人の趣味権): 週4時間の個人趣味没頭クォータは、バーンアウト防止と自己実現のための不変の憲法である。",
        "progress": 50
    },
    "health": {
        "id": "health",
        "category": "健康 (Health)",
        "icon": "🏃",
        "title": "睡眠負債ゼロと生体恒常性の維持",
        "target_value": "1日7時間以上の睡眠、心拍変動(HRV)正常",
        "current_value": "週間平均睡眠6.2時間 (睡眠負債注意)",
        "rule": "3日連続22時以降の残業禁止、衝動的な夜食デリバリーを防御",
        "tenet": "第3条 (身体健康権): 身体の健康(睡眠7時間、バーンアウト指数≤0.70)は、すべての外的な成果に優先する絶対的基本権である。",
        "progress": 55
    },
    "career": {
        "id": "career",
        "category": "キャリア (Career)",
        "icon": "📈",
        "title": "持続可能な専門性の強化と市場価値の最大化",
        "target_value": "専門性レベルTier 1達成 (週52時間上限遵守)",
        "current_value": "週間平均勤務48時間",
        "rule": "週最大労働時間52時間上限を厳守、消耗型労働の拒否権を行使",
        "tenet": "第4条 (持続的成長権): キャリアの成長は週52時間上限の中で追求されるべきであり、生体恒常性を破壊する過重労働は恒久的に排除する。",
        "progress": 75
    },
    "finance": {
        "id": "finance",
        "category": "財政 (Finance)",
        "icon": "💰",
        "title": "30年複利純資産10億ウォンとリタイア自立",
        "target_value": "リタイア資産10億ウォン",
        "current_value": "現在のシード資産8,500万ウォン",
        "rule": "1日可処分予算40,000ウォン制限を遵守、高リスクレバレッジを遮断",
        "tenet": "第5条 (生涯財政権): 1日可処分40,000ウォンの制限を守り、30年のリタイア資産目標を年間5%以上損なう単一の決定は自動棄却される。",
        "progress": 68
    }
}

DEFAULT_GOALS = DEFAULT_GOALS_KO

class GoalManager:
    def __init__(self):
        self.goals = copy.deepcopy(DEFAULT_GOALS_KO)
        self.custom_updates = {}

    def get_goals(self, locale: str = "ko") -> Dict[str, Any]:
        if locale == "en":
            base = copy.deepcopy(DEFAULT_GOALS_EN)
        elif locale == "ja":
            base = copy.deepcopy(DEFAULT_GOALS_JA)
        else:
            base = copy.deepcopy(DEFAULT_GOALS_KO)

        # Merge custom user modifications if any
        for gid, up in self.custom_updates.items():
            if gid in base:
                base[gid].update(up)
        return base

    def update_goal(self, goal_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        if goal_id in self.goals:
            self.goals[goal_id].update(updates)
            self.custom_updates.setdefault(goal_id, {}).update(updates)
            return self.goals[goal_id]
        raise ValueError(f"Goal '{goal_id}' not found.")

    def reset_goals(self, locale: str = "ko") -> Dict[str, Any]:
        self.custom_updates.clear()
        self.goals = copy.deepcopy(DEFAULT_GOALS_KO)
        return self.get_goals(locale=locale)

    def get_user_profile(self) -> Dict[str, Any]:
        """
        5대 인생 목표 및 헌법 조항에서 실시간 거버넌스 파라미터를 동적으로 추출합니다.
        (하드코딩 40,000원 등 탈피 -> 사용자 헌법 프로필 연동)
        """
        fin_rule = self.goals.get("finance", {}).get("rule", "")
        fin_match = re.search(r'(\d+(?:,\d+)*)\s*원', fin_rule)
        daily_budget = float(fin_match.group(1).replace(',', '')) if fin_match else 40000.0

        career_rule = self.goals.get("career", {}).get("rule", "")
        career_match = re.search(r'(\d+)\s*시간', career_rule)
        max_work_hours = int(career_match.group(1)) if career_match else 52

        fam_target = self.goals.get("family", {}).get("target_value", "")
        fam_match = re.search(r'(\d+)\s*회', fam_target)
        family_meals = int(fam_match.group(1)) if fam_match else 3

        hobby_target = self.goals.get("hobby", {}).get("target_value", "")
        hobby_match = re.search(r'(\d+)\s*시간', hobby_target)
        hobby_hours = int(hobby_match.group(1)) if hobby_match else 4

        health_target = self.goals.get("health", {}).get("target_value", "")
        health_match = re.search(r'(\d+)\s*시간', health_target)
        sleep_hours = int(health_match.group(1)) if health_match else 7

        return {
            "daily_budget": daily_budget,
            "max_weekly_hours": max_work_hours,
            "family_dinner_quota": family_meals,
            "hobby_block_quota": hobby_hours,
            "min_sleep_hours": sleep_hours,
            "retirement_goal": self.goals.get("finance", {}).get("target_value", "은퇴 자산 10억 원"),
            "current_seed": self.goals.get("finance", {}).get("current_value", "현재 시드 8,500만 원")
        }

    def ai_generate_goals(self, user_persona: str = "30대 직장인") -> Dict[str, Any]:
        """AI 페르소나 맞춤형 추천 목표 생성 (Mock & Dynamic)"""
        recommended = dict(DEFAULT_GOALS)
        if "스타트업" in user_persona or "개발자" in user_persona:
            recommended["career"]["title"] = "글로벌 AI 프로덕트 리드 및 오픈소스 컨트리뷰터"
            recommended["hobby"]["title"] = "주말 기계식 키보드 제작 및 로드 사이클링 4시간"
        return recommended

    async def chat_and_refine_goals(
        self, 
        message: str, 
        history: List[Dict[str, str]] = None,
        preferred_model: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        AI 인생 헌법 설계관과 1:1 대화를 통해 5대 인생 목표와 헌법을 실시간으로 함께 정립/수정합니다.
        """
        use_mock = os.environ.get("USE_MOCK_FALLBACK", "True").lower() in ("true", "1", "yes")
        api_key = os.environ.get("GEMINI_API_KEY")

        if not use_mock and api_key:
            try:
                from google import genai
                from google.genai import types
                import json

                client = genai.Client(api_key=api_key)
                current_state_str = json.dumps(self.goals, ensure_ascii=False)

                history_str = ""
                if history:
                    history_str = "\n[이전 대화 맥락]:\n" + "\n".join([f"- {h.get('role', 'user')}: {h.get('content', '')}" for h in history[-4:]])

                prompt = f"""
                당신은 ChronosLife의 '수석 인생 헌법 설계관(Chief Constitution Architect AI, Gemini)'입니다.
                사용자와 따뜻하고 지혜로운 대화를 나누며, 30년을 지탱할 5대 도메인(재정, 커리어, 건강, 가족, 개인 취미)의 인생 목표와 제1조~제5조 불변의 헌법 조항을 함께 설계합니다.

                [현재 5대 헌법 & 목표 현황]:
                {current_state_str}
                {history_str}
                [사용자의 최신 발화]:
                "{message}"

                [작성 지침]:
                1. 이전 대화 맥락과 최신 발화를 종합적으로 고려하여 깊이 공감하고, 라이프 거버넌스 전문가로서 통찰력 있는 조언과 함께 질문을 던지세요.
                2. 사용자의 발화에 맞추어 5대 목표(family, hobby, health, career, finance) 중 개선할 도메인 1개 이상의 구체적인 목표와 규칙, 헌법 조항을 제안하세요. (반드시 사용자의 말에 맞춰 'title', 'target_value', 'rule', 'tenet' 내용을 새롭게 작성해야 함)
                3. **가장 중요**: 사용자가 이어서 AI에게 던질 법한 [맥락 기반 후속 질문 3개 (suggested_next_prompts)]를 실시간으로 직접 고안하여 제공하세요. (고정된 문구가 아니라 방금 나눈 대화에 꼬리를 무는 질문이어야 함)
                4. 반드시 아래 JSON 형식으로만 반환하세요:
                {{
                    "reply": "사용자에게 전하는 따뜻하고 통찰력 있는 대화형 응답 (2~4문장)",
                    "suggested_goals": {{
                        // 변경이 필요한 도메인 (예: health 또는 hobby 등)
                        // 형식: "category_key": {{"title": "구체적인 새 목표명", "target_value": "수치", "rule": "통제 룰", "tenet": "제N조 (...): 헌법 내용"}}
                    }},
                    "focus_category": "family|hobby|health|career|finance",
                    "suggested_next_prompts": [
                        "방금 대화 맥락에 맞춘 사용자의 후속 질문 1",
                        "방금 대화 맥락에 맞춘 사용자의 후속 질문 2",
                        "방금 대화 맥락에 맞춘 사용자의 후속 질문 3"
                    ]
                }}
                """

                parsed = None
                models_to_try = []
                for m in [preferred_model, 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.1-flash-lite', 'gemini-3.5-flash']:
                    if m and m not in models_to_try:
                        models_to_try.append(m)

                for model_name in models_to_try:
                    try:
                        response = client.models.generate_content(
                            model=model_name,
                            contents=prompt,
                            config=types.GenerateContentConfig(
                                temperature=0.35,
                                response_mime_type="application/json"
                            )
                        )
                        parsed = parse_json_safely(response.text)
                        break
                    except Exception as me:
                        print(f"GoalChat Model {model_name} retry: {me}")

                if not parsed:
                    raise RuntimeError("All candidate models failed")

                suggested = parsed.get("suggested_goals", {})

                for k, v in suggested.items():
                    if k in self.goals and isinstance(v, dict):
                        self.goals[k].update({pk: pv for pk, pv in v.items() if pk in ["title", "target_value", "rule", "tenet"]})

                dynamic_prompts = parsed.get("suggested_next_prompts", [])
                if not dynamic_prompts:
                    dynamic_prompts = [
                        "가족 저녁 식사를 위한 평일 19시 노티 차단 규칙도 넣어줄래?",
                        "주말 취미 4시간 쿼터를 위해 주말 출근 절대 금지 조항을 추가해줘.",
                        "현재 내 월급에서 30년 복리 10억을 달성하려면 매달 얼마를 모아야 해?"
                    ]

                return {
                    "reply": parsed.get("reply", "목표를 성공적으로 조율했습니다."),
                    "updated_goals": self.goals,
                    "focus_category": parsed.get("focus_category", "general"),
                    "suggested_next_prompts": dynamic_prompts
                }

            except Exception as e:
                print(f"Gemini Goal Chat failed: {e}. Falling back to mock dialogue.")

        # ── Mock 대화 코칭 로직 (키가 없거나 실패 시) ──
        lower = message.lower()
        reply = "말씀해주신 가치관을 깊이 새겨들었습니다. 일과 삶의 균형을 위해 어떤 영역을 가장 먼저 보호하고 싶으신가요?"
        focus = "general"
        dynamic_prompts = [
            "가족 저녁 식사 주 3회를 위한 퇴근 시간 강제 락을 걸고 싶어.",
            "주말 러닝과 개인 취미를 위한 4시간 쿼터 헌법을 세워줘.",
            "야근을 줄이면 기대 연봉이 낮아질 수 있는데 재정 밸런스는 어떻게 맞춰?"
        ]

        if "가족" in lower or "아이" in lower or "아내" in lower or "남편" in lower:
            reply = "가족과의 일상은 한 번 지나가면 다시 오지 않는 가장 소중한 시간입니다. 아무리 바쁜 프로젝트라도 주당 최소 3회의 가족 저녁 식사를 '절대 불가침 헌법 제1조'로 못 박아둘 것을 제안합니다. 동의하시나요?"
            focus = "family"
            self.goals["family"]["title"] = "가족 저녁 식사 주 3회 절대 사수 및 주말 온전한 동행"
            self.goals["family"]["rule"] = "평일 19시 이후 업무 알림 차단, 주말 가족 일정 최우선"
            dynamic_prompts = [
                "평일 19시 이후 업무 메신저 알림을 강제로 끄는 제약 룰을 추가해줘.",
                "만약 주중에 야근이 생기면 주말 점심으로 식사를 대체하는 예외 룰은 어떨까?",
                "가족과의 여행을 위해 분기별 1회 주말 락다운 조항도 만들어줘."
            ]

        elif "취미" in lower or "러닝" in lower or "음악" in lower or "악기" in lower or "운동" in lower:
            reply = "개인 취미는 단순한 여가가 아니라 번아웃을 방어하는 자아의 산소호흡기입니다! 주당 최소 4시간의 '개인 취미 잠금 쿼터'를 헌법 제2조로 지정하여 업무 스트레스를 해소하도록 업데이트했습니다. 현재 하고 계신 취미 활동을 더 알려주시겠어요?"
            focus = "hobby"
            self.goals["hobby"]["title"] = "주말 개인 취미 몰입 4시간 강제 쿼터 (러닝·창작·재충전)"
            self.goals["hobby"]["rule"] = "주말 오전 취미 블록 설정 시 모든 업무 연락 수신 거부"
            dynamic_prompts = [
                "취미 장비 구매 비용은 L1(10일) 완충재 내에서 어떻게 허용할 수 있어?",
                "주말 오전에 2시간씩 러닝 블록을 방해받지 않도록 캘린더를 잠그고 싶어.",
                "취미 활동을 지속하기 위한 일일 수면 7시간 연계 헌법도 다듬어줘."
            ]

        elif "야근" in lower or "건강" in lower or "수면" in lower or "피로" in lower:
            reply = "지속 가능한 성장은 건강한 신체에서만 나옵니다. 연속 3일 야근을 방어하고 일일 수면 7시간을 사수하는 헌법 제3조를 수립했습니다. 최근 수면 시간은 대략 몇 시간 정도 유지되고 계신가요?"
            focus = "health"
            self.goals["health"]["title"] = "일일 7시간 수면 확보 및 연속 야근 차단"
            self.goals["health"]["rule"] = "22시 이후 업무 금지 및 취침 전 스마트폰 차단"
            dynamic_prompts = [
                "연속 3일 야근이 감지되면 Ekispert 15분 도보 산책 티켓을 강제 발급하는 룰을 넣어줘.",
                "수면 부채가 5시간 이상 누적되었을 때 출근 시간을 1시간 늦추는 완충 룰이 필요해.",
                "야간 충동 야식 배달 주문을 물리적으로 차단하는 재정 가드레일은 어떻게 세워?"
            ]

        elif "돈" in lower or "은퇴" in lower or "재정" in lower or "시드" in lower or "연봉" in lower:
            reply = "재정적 자립은 진정한 자유의 토대입니다. 일일 가처분 4만 원 한도를 지키면서 30년 복리로 10억 은퇴 자산을 만드는 궤적을 헌법 제5조로 다듬었습니다. 현재 생각하시는 목표 은퇴 시점은 언제인가요?"
            focus = "finance"
            self.goals["finance"]["title"] = "30년 복리 10억 은퇴 자산 및 3년 시드머니 1억 달성"
            dynamic_prompts = [
                "매월 100만 원씩 저축할 때 30년 복리 연 6% 수익률이면 최종 얼마가 모여?",
                "예상치 못한 목돈 지출이 생겼을 때 L2(100일) 비상금으로 흡수하는 조건은?",
                "연봉 3,500만 원 인상 제안이 왔을 때 가족 시간을 침해하지 않고 협상하는 가이드를 줘."
            ]

        return {
            "reply": reply,
            "updated_goals": self.goals,
            "focus_category": focus,
            "suggested_next_prompts": dynamic_prompts
        }

    def evaluate_action_impact(self, raw_input: str, micro_deviation: float, council_verdict: dict, locale: str = "ko") -> List[Dict[str, Any]]:
        """
        사용자가 입력한 행동/사건이 5대 목표(재정, 커리어, 건강, 가족, 취미) 각각에
        미치는 긍정적(+) / 부정적(-) 영향을 계산합니다.
        """
        impacts = []
        text = raw_input.lower()

        profile = self.get_user_profile()
        user_budget = profile["daily_budget"]

        # 1. 재정 (Finance) 영향도
        if micro_deviation > user_budget:
            fin_score = -min(80, int((micro_deviation / user_budget) * 15))
            fin_status = "NEGATIVE"
            fin_reason = f"사용자 일일 한도({user_budget:,.0f}원) 초과(-{micro_deviation:,.0f}원). L1 완충재 잠식 및 30년 복리 기회비용 발생"
        elif "연봉" in text and ("인상" in text or "제안" in text):
            fin_score = +45
            fin_status = "POSITIVE"
            fin_reason = "연봉 인상으로 3년 차 순자산 시드머니 조기 축적 기회"
        elif micro_deviation > 0:
            fin_score = -10
            fin_status = "NEGATIVE"
            fin_reason = f"소액 지출({micro_deviation:,.0f}원)로 L0 예산({user_budget:,.0f}원) 일부 차감"
        else:
            fin_score = +10
            fin_status = "POSITIVE"
            fin_reason = "불필요한 충동 소비 없음 (가처분 예산 온전 유지)"

        if locale == "en":
            name = "Finance"
            if fin_score < -10: fin_reason = f"Daily budget exceeded by {micro_deviation:,.0f}."
            elif fin_score > 40: fin_reason = "Salary increase brings faster seed accumulation."
            elif fin_score < 0: fin_reason = f"Minor expense ({micro_deviation:,.0f}) deducted."
            else: fin_reason = "No impulsive spending."
        elif locale == "ja":
            name = "財政"
            if fin_score < -10: fin_reason = f"一日の予算を{micro_deviation:,.0f}超過しました。"
            elif fin_score > 40: fin_reason = "給与アップによるシードマネー早期蓄積。"
            elif fin_score < 0: fin_reason = f"少額の支出（{micro_deviation:,.0f}）発生。"
            else: fin_reason = "衝動買いなし。"
        else:
            name = "재정"

        impacts.append({
            "category_id": "finance",
            "name": name,
            "icon": "💰",
            "score": fin_score,
            "status": fin_status,
            "reason": fin_reason,
            "delta_label": f"{fin_score:+d}%"
        })

        # 2. 커리어 (Career) 영향도
        if "이직" in text or "연봉" in text or "스타트업" in text or "프로젝트" in text:
            car_score = +35
            car_status = "POSITIVE"
            car_reason = "시장 가치 재평가 및 새로운 기술 도메인 역량 확장 기회"
        elif "야근" in text or "철야" in text:
            car_score = +10
            car_status = "POSITIVE"
            car_reason = "단기 마일스톤 납품 달성에 기여 (단, 장기 지속 불가능)"
        elif "키보드" in text or "장비" in text:
            car_score = +15
            car_status = "POSITIVE"
            car_reason = "업무 생산성 및 개발 환경 쾌적도 개선 효과"
        else:
            car_score = 0
            car_status = "NEUTRAL"
            car_reason = "직접적인 커리어 스킬 변화 없음"

        if locale == "en":
            name = "Career"
            if car_score > 30: car_reason = "Market value re-evaluation and domain expansion."
            elif car_score > 10: car_reason = "Improved work productivity."
            elif car_score > 0: car_reason = "Short-term milestone achieved."
            else: car_reason = "No direct impact on career."
        elif locale == "ja":
            name = "キャリア"
            if car_score > 30: car_reason = "市場価値の再評価とドメインの拡大。"
            elif car_score > 10: car_reason = "業務生産性の向上。"
            elif car_score > 0: car_reason = "短期的な目標達成。"
            else: car_reason = "キャリアへの直接的な影響なし。"
        else:
            name = "커리어"

        impacts.append({
            "category_id": "career",
            "name": name,
            "icon": "📈",
            "score": car_score,
            "status": car_status,
            "reason": car_reason,
            "delta_label": f"{car_score:+d}%"
        })

        # 3. 건강 (Health) 영향도
        if "70시간" in text or "야근" in text or "피로" in text or "수면" in text:
            hea_score = -45
            hea_status = "NEGATIVE"
            hea_reason = "수면 부채 급증 및 스트레스 지수 임계 도달. 번아웃 위험 극대화"
        elif "산책" in text or "도보" in text or "운동" in text or "수면" in text:
            hea_score = +30
            hea_status = "POSITIVE"
            hea_reason = "가벼운 유산소 보행으로 코르티솔 분비 감소 및 수면 질 향상"
        elif "야식" in text or "폭식" in text:
            hea_score = -25
            hea_status = "NEGATIVE"
            hea_reason = "심야 고칼로리 섭취로 위장 부담 및 수면 리듬 교란"
        else:
            hea_score = -5 if micro_deviation > 80000 else 0
            hea_status = "NEUTRAL"
            hea_reason = "신체 항상성 상태 유지"

        if locale == "en":
            name = "Health"
            if hea_score < -30: hea_reason = "Sleep debt surged, high burnout risk."
            elif hea_score > 20: hea_reason = "Aerobic walk lowers cortisol, improves sleep."
            elif hea_score < -10: hea_reason = "Late night eating disrupts sleep rhythm."
            else: hea_reason = "Physical homeostasis maintained."
        elif locale == "ja":
            name = "健康"
            if hea_score < -30: hea_reason = "睡眠負債の急増、バーンアウトリスク大。"
            elif hea_score > 20: hea_reason = "有酸素運動による睡眠の質向上。"
            elif hea_score < -10: hea_reason = "深夜の過食による睡眠リズムの乱れ。"
            else: hea_reason = "身体の恒常性を維持。"
        else:
            name = "건강"

        impacts.append({
            "category_id": "health",
            "name": name,
            "icon": "🏃",
            "score": hea_score,
            "status": hea_status,
            "reason": hea_reason,
            "delta_label": f"{hea_score:+d}%"
        })

        # 4. 가족 (Family) 영향도
        if "주말 출근" in text or "70시간" in text:
            fam_score = -50
            fam_status = "NEGATIVE"
            fam_reason = "헌법 제1조 위반: 주당 가족 저녁 식사 3회 보장 원칙 영구 침해 위험"
        elif "아내" in text or "남편" in text or "아이" in text or "가족" in text:
            if micro_deviation > 80000 and "상의" not in text:
                fam_score = -15
                fam_status = "NEGATIVE"
                fam_reason = "가계 공유 예산의 일방적 독단 소비로 인한 신뢰 저하 가능성"
            else:
                fam_score = +15
                fam_status = "POSITIVE"
                fam_reason = "가족과의 일상 교감 및 보너스 소식 공유"
        elif "산책" in text:
            fam_score = +10
            fam_status = "POSITIVE"
            fam_reason = "귀가 전 감정 정돈을 통해 가정 내 평온한 소통 보장"
        else:
            fam_score = 0
            fam_status = "NEUTRAL"
            fam_reason = "가족 일정에 유의미한 영향 없음"

        if locale == "en":
            name = "Family"
            if fam_score < -30: fam_reason = "Violation of Constitution Article 1: Family dinner compromised."
            elif fam_score < -10: fam_reason = "Unilateral expense causing trust issues."
            elif fam_score > 10: fam_reason = "Sharing good news and emotional connection."
            elif fam_score > 0: fam_reason = "Emotional regulation before arriving home."
            else: fam_reason = "No significant impact on family."
        elif locale == "ja":
            name = "家族"
            if fam_score < -30: fam_reason = "憲法第1条違反: 家族との夕食時間の侵害。"
            elif fam_score < -10: fam_reason = "独断的な支出による信頼低下の可能性。"
            elif fam_score > 10: fam_reason = "家族との交流と良い知らせの共有。"
            elif fam_score > 0: fam_reason = "帰宅前の感情調整による穏やかなコミュニケーション。"
            else: fam_reason = "家族の予定に有意な影響なし。"
        else:
            name = "가족"

        impacts.append({
            "category_id": "family",
            "name": name,
            "icon": "👨‍👩‍👧",
            "score": fam_score,
            "status": fam_status,
            "reason": fam_reason,
            "delta_label": f"{fam_score:+d}%"
        })

        # 5. 개인 취미 (Hobby) 영향도
        if "키보드" in text or "음악" in text or "러닝" in text or "사진" in text or "취미" in text:
            hob_score = +35
            hob_status = "POSITIVE"
            hob_reason = "개인 취미 몰입 장비/시간 확보로 자아실현 및 심리적 활력 충전"
        elif "주말 출근" in text or "70시간" in text:
            hob_score = -40
            hob_status = "NEGATIVE"
            hob_reason = "헌법 제1조 위반: 주당 개인 취미 4시간 쿼터 전면 박탈 위험"
        elif "산책" in text:
            hob_score = +25
            hob_status = "POSITIVE"
            hob_reason = "야간 도보 산책으로 주말 취미 활동(러닝/출사)을 위한 컨디션 방어"
        else:
            hob_score = 0
            hob_status = "NEUTRAL"
            hob_reason = "취미 쿼터 유지"

        if locale == "en":
            name = "Personal Hobby"
            if hob_score > 30: hob_reason = "Self-actualization through hobby equipment/time."
            elif hob_score < -30: hob_reason = "Violation of Constitution Article 1: 4-hour hobby quota deprived."
            elif hob_score > 20: hob_reason = "Condition maintenance for weekend hobbies."
            else: hob_reason = "Hobby quota maintained."
        elif locale == "ja":
            name = "個人の趣味"
            if hob_score > 30: hob_reason = "趣味の充実による自己実現と活力充電。"
            elif hob_score < -30: hob_reason = "憲法第1条違反: 趣味の4時間枠が完全に奪われる危機。"
            elif hob_score > 20: hob_reason = "週末の趣味活動に向けたコンディション維持。"
            else: hob_reason = "趣味枠を維持。"
        else:
            name = "개인 취미"

        impacts.append({
            "category_id": "hobby",
            "name": name,
            "icon": "🎨",
            "score": hob_score,
            "status": hob_status,
            "reason": hob_reason,
            "delta_label": f"{hob_score:+d}%"
        })

        # 6. 각 도메인별 Log-10 5단계 시계열 궤적(Temporal Trajectory) 부여
        for item in impacts:
            item["temporal_trajectory"] = self._build_horizon_trajectory(
                cat_id=item["category_id"],
                score=item["score"],
                text=text,
                micro_deviation=micro_deviation,
                locale=locale
            )

        return impacts

    def _build_horizon_trajectory(self, cat_id: str, score: int, text: str, micro_deviation: float, locale: str = "ko") -> List[Dict[str, Any]]:
        """
        Log-10 5대 시계열(L0: 1일 -> L1: 10일 -> L2: 100일 -> L3: 3년 -> L4: 30년)에 걸쳐
        기준선(Baseline)과 이번 결정이 미친 예상 궤적(Projected) 및 이동 폭(Delta)을 산출합니다.
        """
        def _loc_list(ko_list: List[str], ja_list: List[str], en_list: List[str]) -> List[str]:
            if locale == "ja":
                return ja_list
            if locale == "en":
                return en_list
            return ko_list

        user_budget = self.get_user_profile()["daily_budget"]
        # ── 1. Finance ──
        if cat_id == "finance":
            base = 80
            if any(k in text for k in ["연봉", "이직", "年収", "転職", "オファー", "salary", "offer"]):
                deltas = [0, 0, +10, +22, +15]
                notes = _loc_list(
                    ["현금 흐름 당일 변동 없음", "오퍼 수락 및 계약서 검토 기간", "인상된 월급 3개월 적립으로 비상금 확충", "3년 내 시드머니 1억 조기 완제 (+11개월 단축)", "조기 시드머니 30년 복리 증식 가속 (+1.8억 추가 기대)"],
                    ["キャッシュフロー当日変動なし", "オファー受諾および契約書検討期間", "増額給与の3ヶ月積立による非常資金拡充", "3年以内の種銭1億ウォン早期達成（+11ヶ月短縮）", "早期種銭の30年複利運用加速（+1.8億ウォン追加期待）"],
                    ["No cash flow change today", "Offer review period", "Emergency buffer boosted by 3-month salary hike", "Seed 100M KRW completed 11 months early", "30-year compounding accelerated (+180M KRW expected)"]
                )
                arb_deltas = [0, 0, +6, +14, +12]
                arb_notes = _loc_list(
                    ["현금 흐름 당일 변동 없음", "중재안: 주 52시간 상한 카운터오퍼 협상", "무리 없는 근무와 안정적 월급 적립", "3년 시드머니 1억 달성 (+7개월 단축)", "30년 평생 복리 자산 안정 증식"],
                    ["キャッシュフロー当日変動なし", "仲裁案: 週52時間上限カウンターオファー交渉", "無理のない勤務と安定的給与積立", "3年で種銭1億ウォン達成（+7ヶ月短縮）", "30年生涯複利資産の安定成長"],
                    ["No cash flow change today", "Ruling: 52h cap counter-offer negotiation", "Sustainable workload and steady savings", "Seed 100M KRW achieved (+7 months faster)", "Lifetime compounding asset growth"]
                )
            elif micro_deviation > user_budget:
                drain = min(80, int((micro_deviation / user_budget) * 15))
                deltas = [-drain, -int(drain * 0.8), -int(drain * 0.5), -int(drain * 0.3), -int(drain * 0.6)]
                notes = _loc_list(
                    [f"일일 가처분 {user_budget:,.0f}원 한도 초과 (-{micro_deviation:,.0f}원)", "10일 완충재 긴급 차감 및 가처분 축소", "분기 저축률 소폭 저하", "중기 시드머니 형성 속도 둔화", "30년 복리 기회비용 잠식 (은퇴 지연 리스크)"],
                    [f"1日可処分{user_budget:,.0f}ウォン限度額超過 (-{micro_deviation:,.0f}ウォン)", "10日バッファ緊急減額および可処分枠縮小", "四半期貯蓄率の微減", "中期シードマネー形成速度の鈍化", "30年複利機会費用の侵食（リタイア遅延リスク）"],
                    [f"Exceeded daily budget of {user_budget:,.0f} (-{micro_deviation:,.0f})", "10-day buffer reduced", "Quarterly savings slowed", "Mid-term seed accumulation delayed", "30-year opportunity cost lost (delayed retirement)"]
                )
                arb_deltas = [-drain, -int(drain * 0.2), 0, 0, 0]
                arb_notes = _loc_list(
                    [f"일일 가처분 한도 초과 (-{micro_deviation:,.0f}원)", "중재 판결: 3일간 외식비 절감(일 32,600원)으로 L1 내 완전 흡수", "분기 비상금 목표 100% 정상 보존", "3년 시드머니 누수 완전 차단", "30년 복리 은퇴 자산 무손실 방어 (은퇴 지연 0일)"],
                    [f"1日可処有限度超過 (-{micro_deviation:,.0f}ウォン)", "仲裁判定: 3日間の外食費削減（日32,600ウォン）でL1内完全吸収", "四半期非常資金目標の100%正常保全", "3年シードマネー漏出の完全遮断", "30年複利リタイア資産の無損失防御（リタイア遅延0日）"],
                    [f"Exceeded daily budget (-{micro_deviation:,.0f})", "Compromise: 3-day dining saving absorbs L1 impact", "100% quarterly buffer preserved", "Seed capital leakage prevented", "Zero retirement delay preserved"]
                )
            elif micro_deviation > 0:
                deltas = [-10, -5, -2, 0, 0]
                notes = _loc_list(
                    ["L0 소액 소비 발생", "L1 완충재 내에서 흡수 완료", "분기 영향 미미", "중기 영향 없음", "장기 영향 없음"],
                    ["L0 少額消費発生", "L1 バッファ内で吸収完了", "四半期への影響軽微", "中期への影響なし", "長期への影響なし"],
                    ["L0 minor spend occurred", "Absorbed within L1 buffer", "Minimal quarterly impact", "No mid-term impact", "No long-term impact"]
                )
                arb_deltas = [-10, 0, 0, 0, 0]
                arb_notes = _loc_list(
                    ["소액 지출 발생", "중재 가이드로 L1 내 조기 회복", "분기 영향 없음", "중기 영향 없음", "장기 영향 없음"],
                    ["少額支出発生", "仲裁ガイドによりL1内で早期回復", "四半期への影響なし", "中期への影響なし", "長期への影響なし"],
                    ["Minor spend occurred", "Early recovery via L1 guidance", "No quarterly impact", "No mid-term impact", "No long-term impact"]
                )
            else:
                deltas = [+10, +8, +5, +3, +1]
                notes = _loc_list(
                    ["충동 소비 방어", "L1 예산 건전성 유지", "분기 잉여 자금 발생", "목표 저축률 달성 순항", "복리 궤적 정상 유지"],
                    ["衝動消費の防御", "L1 予算の健全性維持", "四半期余剰資金の発生", "目標貯蓄率の順調な達成", "複利軌道の正常維持"],
                    ["Impulse spend prevented", "L1 budget health maintained", "Quarterly surplus generated", "On track for savings goal", "Compounding trajectory intact"]
                )
                arb_deltas = [+10, +8, +5, +3, +1]
                arb_notes = _loc_list(
                    ["충동 소비 방어", "L1 예산 건전성 유지", "분기 잉여 자금 발생", "목표 저축률 달성 순항", "복리 궤적 정상 유지"],
                    ["衝動消費の防御", "L1 予算の健全性維持", "四半期余剰資金の発生", "目標貯蓄率の順調な達成", "複利軌道の正常維持"],
                    ["Impulse spend prevented", "L1 budget health maintained", "Quarterly surplus generated", "On track for savings goal", "Compounding trajectory intact"]
                )

        # ── 2. Career ──
        elif cat_id == "career":
            base = 75
            if any(k in text for k in ["이직", "스타트업", "오퍼", "転職", "スタートアップ", "オファー", "career", "job"]):
                deltas = [+35, +25, +20, +15, +5]
                notes = _loc_list(
                    ["커리어 제안 접수 및 가치 평가", "시장 가치 및 협상 조건 확인", "핵심 AI 도메인 온보딩 및 빠른 러닝커브", "프로덕트 리드 오너십 및 업계 내 Tier 1 시장 가치 달성", "30년 관점의 커리어 포트폴리오 다각화 완성"],
                    ["キャリア提案の受領および価値評価", "市場価値および交渉条件の確認", "コアAI領域への迅速な適応", "プロダクトリードとしての業界Tier 1市場価値達成", "30年視点でのキャリアポートフォリオ多角化完成"],
                    ["Career offer received and evaluated", "Market value and negotiation terms confirmed", "Quick onboarding into core AI domain", "Product lead ownership and Tier-1 market value achieved", "30-year diversified career portfolio established"]
                )
                arb_deltas = [+25, +20, +18, +16, +14]
                arb_notes = _loc_list(
                    ["역제안서(주 52시간 상한) 발송 및 직무 가치 재평가", "주 52시간 캡 합의로 업무 지속 가능성 확보", "핵심 AI 전문성 안착 및 번아웃 제로 달성", "프로덕트 리드로서의 시장 가치 장기 극대화", "30년 롱런 커리어 성공 포트폴리오 완성"],
                    ["逆提案書（週52時間上限）送付および職務価値再評価", "週52時間上限合意による業務持続可能性確保", "中核AI専門性の定着とバーンアウトゼロ達成", "プロダクトリードとしての市場価値の長期最大化", "30年ロングランキャリアの成功ポートフォリオ完成"],
                    ["Counter-proposal (52h cap) sent and re-evaluated", "Work sustainability secured via 52h cap", "Core AI mastery settled with zero burnout", "Long-term market value maximized as product lead", "30-year long-run career portfolio completed"]
                )
            elif any(k in text for k in ["야근", "残業", "overtime"]):
                deltas = [+10, +6, +2, -8, -14]
                notes = _loc_list(
                    ["단기 마감 납품 기여", "프로젝트 스프린트 방어", "누적 피로로 생산성 점진적 저하", "번아웃으로 인한 핵심 기술 습득 정체", "장기 커리어 지속력 약화"],
                    ["短期納品への貢献", "プロジェクトスプリントの防御", "疲労蓄積による生産性の段階的低下", "バーンアウトによるコア技術習得の停滞", "長期的キャリア持続力の弱体化"],
                    ["Short-term project delivery contributed", "Sprint milestone protected", "Productivity gradually drops from accumulated fatigue", "Burnout stalls core skill acquisition", "Long-term career stamina weakened"]
                )
                arb_deltas = [+6, +4, +3, +2, +2]
                arb_notes = _loc_list(
                    ["단기 납품 기여", "중재 룰: 연속 야근 강제 차단으로 피로 누적 방지", "정상 컨디션 회복으로 업무 생산성 유지", "지속 가능한 기술 습득", "장기 커리어 활력 보존"],
                    ["短期納品への貢献", "仲裁ルール: 連続残業の強制遮断で疲労蓄積防止", "正常コンディション回復で業務生産性維持", "持続可能な技術習得", "長期キャリアの活力保全"],
                    ["Short-term delivery contributed", "Ruling: consecutive overtime blocked to prevent fatigue", "Productivity maintained via healthy condition", "Sustainable skill mastery", "Long-term career vitality preserved"]
                )
            elif any(k in text for k in ["키보드", "장비", "キーボード", "設備", "keyboard"]):
                deltas = [+15, +12, +8, +4, +1]
                notes = _loc_list(
                    ["업무 환경 즉시 개선 및 타이핑 쾌적도 향상", "타이핑 피로도 감소로 개발 집중력 증가", "분기 코딩 몰입도 및 작업 생산성 향상", "도구 생산성 안정화", "환경 쾌적도 유지"],
                    ["作業環境の即時改善およびタイピング快適性向上", "タイピング疲労軽減による開発集中力向上", "四半期コーディング没入度および作業生産性向上", "ツール生産性の安定化", "環境快適性の維持"],
                    ["Immediate workspace upgrade and typing comfort", "Focus increases with reduced typing fatigue", "Quarterly coding flow and output boosted", "Tool productivity stabilized", "Workspace ergonomics maintained"]
                )
                arb_deltas = [+15, +12, +8, +4, +1]
                arb_notes = _loc_list(
                    ["업무 환경 즉시 개선 및 타이핑 쾌적도 향상", "타이핑 피로도 감소로 개발 집중력 증가", "분기 코딩 몰입도 및 작업 생산성 향상", "도구 생산성 안정화", "환경 쾌적도 유지"],
                    ["作業環境の即時改善およびタイピング快適性向上", "タイピング疲労軽減による開発集中力向上", "四半期コーディング没入度および作業生産性向上", "ツール生産性の安定化", "環境快適性の維持"],
                    ["Immediate workspace upgrade and typing comfort", "Focus increases with reduced typing fatigue", "Quarterly coding flow and output boosted", "Tool productivity stabilized", "Workspace ergonomics maintained"]
                )
            else:
                deltas = [0, 0, 0, 0, 0]
                notes = _loc_list(
                    ["현 직무 상태 유지", "단기 변동 없음", "분기 마일스톤 유지", "중기 궤적 안정", "장기 목표 유지"],
                    ["現職務状態の維持", "短期変動なし", "四半期マイルストーン維持", "中期軌道の安定", "長期目標の維持"],
                    ["Current role maintained", "No short-term change", "Quarterly milestone preserved", "Mid-term trajectory stable", "Long-term goal intact"]
                )
                arb_deltas = [0, 0, 0, 0, 0]
                arb_notes = _loc_list(
                    ["현 직무 상태 유지", "단기 변동 없음", "분기 마일스톤 유지", "중기 궤적 안정", "장기 목표 유지"],
                    ["現職務状態の維持", "短期変動なし", "四半期マイルストーン維持", "中期軌道の安定", "長期目標の維持"],
                    ["Current role maintained", "No short-term change", "Quarterly milestone preserved", "Mid-term trajectory stable", "Long-term goal intact"]
                )

        # ── 3. Health ──
        elif cat_id == "health":
            base = 85
            if any(k in text for k in ["70시간", "주말 출근", "야근", "피로", "수면", "70時間", "残業", "疲労", "睡眠", "overtime", "tired"]):
                deltas = [-45, -35, -26, -18, -10]
                notes = _loc_list(
                    ["수면 부채 및 피로 즉각 누적", "수면 부채 지속 및 만성 피로 시작", "면역력 저하, 운동 루틴 중단, 번아웃 임계치 접근", "심각한 신체·정신적 번아웃 도달 (조기 이탈 위험)", "30년 신체 건강 항상성 및 기대수명 훼손 (헌법 제3조 위배)"],
                    ["睡眠負債および疲労の即時蓄積", "睡眠負債の持続と慢性疲労の開始", "免疫力低下、運動ルーティン中断、バーンアウト限界到達", "深刻な心身の燃え尽き症候群（早期離脱リスク）", "30年の健康恒常性および期待余命の損傷（憲法第3条違反）"],
                    ["Immediate sleep debt and fatigue accumulation", "Persistent sleep debt and chronic fatigue onset", "Lowered immunity, exercise stopped, burnout threshold near", "Severe physical/mental burnout reached (early departure risk)", "30-year health homeostasis and lifespan damaged (Constitution Art. 3 violation)"]
                )
                arb_deltas = [0, +4, +8, +10, +12]
                arb_notes = _loc_list(
                    ["중재 판결: 주 52시간 상한 및 수면 7시간 수호", "수면 부채 제로화 및 주간 피로 조기 해소", "생체 항상성 유지 및 주말 운동 루틴 안착", "번아웃 위험 완전 소멸", "30년 기대수명 및 신체 항상성 영구 수호 (헌법 제3조 완수)"],
                    ["仲裁判決: 週52時間上限および睡眠7時間の死守", "睡眠負債の解消と日中疲労の早期回復", "生体恒常性の維持と週末運動ルーティンの定着", "バーンアウトリスクの完全消滅", "30年期待余命と身体恒常性の永続的保護（憲法第3条完遂）"],
                    ["Ruling: 52h cap enforced, 7h sleep protected", "Zero sleep debt and daytime fatigue cleared", "Homeostasis maintained, weekend workout routine rooted", "Burnout risk eliminated", "30-year health span and homeostasis permanently secured"]
                )
            elif any(k in text for k in ["산책", "러닝", "운동", "散歩", "ランニング", "運動", "walk", "running", "workout"]):
                deltas = [+30, +25, +18, +14, +10]
                notes = _loc_list(
                    ["코르티솔 즉각 분비 억제 및 혈류 개선", "수면의 질 20% 향상 및 피로 회복", "유산소 기초 대사량 증진 및 체력 안착", "중기 심혈관 항상성 강화", "30년 액티브 라이프스팬 연장"],
                    ["コルチゾール即時分泌抑制および血流改善", "睡眠の質20%向上および疲労回復", "有酸素基礎代謝の増進と体力定着", "中期心血管恒常性の強化", "30年アクティブライフスパンの延伸"],
                    ["Cortisol suppressed immediately and circulation improved", "Sleep quality improved 20% and fatigue recovered", "Aerobic stamina boosted", "Mid-term cardiovascular stability strengthened", "30-year active healthspan extended"]
                )
                arb_deltas = [+30, +25, +18, +14, +10]
                arb_notes = _loc_list(
                    ["코르티솔 즉각 분비 억제", "수면 질 향상", "체력 안착", "심혈관 항상성 강화", "액티브 라이프스팬 연장"],
                    ["コルチゾール即時分泌抑制", "睡眠の質向上", "体力定着", "心血管恒常性強化", "アクティブライフスパン延伸"],
                    ["Cortisol suppressed immediately", "Sleep quality boosted", "Stamina stabilized", "Cardiovascular homeostasis strengthened", "Active healthspan extended"]
                )
            elif any(k in text for k in ["야식", "폭식", "夜食", "過食", "delivery", "late snack"]):
                deltas = [-25, -18, -12, -6, -4]
                notes = _loc_list(
                    ["소화기 야간 부담", "수면 리듬 교란", "체지방 누적 및 피로감", "기초 대사율 저하", "만성 염증 리스크"],
                    ["夜間の消化器負担", "睡眠リズムの乱れ", "体脂肪蓄積と疲労感", "基礎代謝率の低下", "慢性炎症リスク"],
                    ["Nighttime digestion burden", "Sleep rhythm disrupted", "Body fat and morning fatigue accumulation", "Basal metabolic rate drops", "Chronic inflammation risk"]
                )
                arb_deltas = [+10, +12, +10, +6, +4]
                arb_notes = _loc_list(
                    ["Ekispert 15분 도보 산책으로 야식 충동 차단", "야간 보행으로 숙면 유도", "소화기 리듬 보호", "대사율 정상화", "건강 궤적 회복"],
                    ["Ekispert 15分徒歩散歩で夜食衝動を遮断", "夜間歩行による熟睡誘導", "消化器リズムの保護", "代謝率の正常化", "健康軌道の回復"],
                    ["Ekispert 15-min walk blocks midnight snack urge", "Night walking induces deep sleep", "Digestive rhythm preserved", "Metabolism normalized", "Health trajectory recovered"]
                )
            else:
                if micro_deviation > 80000:
                    deltas = [-5, -4, -3, -1, 0]
                    notes = _loc_list(
                        ["충동 소비 직후 스트레스 및 심리적 가책", "단기 지출 부담으로 인한 컨디션 저하", "분기 생활 습관으로 점진적 흡수", "중기 건강 지표 정상 유지", "30년 건강 궤적 순항"],
                        ["衝動消費直後のストレスおよび自責の念", "短期支出負担によるコンディション低下", "四半期生活習慣での段階的吸収", "中期健康指標の正常維持", "30年健康軌道の順航"],
                        ["Stress and guilt right after impulse buy", "Fatigue from short-term financial pressure", "Gradual absorption into quarterly lifestyle", "Mid-term health indicators normal", "30-year wellness trajectory stable"]
                    )
                    arb_deltas = [0, 0, 0, 0, 0]
                    arb_notes = _loc_list(
                        ["중재안 수용으로 심리적 가책 즉시 해소", "계획된 외식비 절감으로 스트레스 제로", "건강 궤적 안정", "중기 체력 정상", "30년 건강 유지"],
                        ["仲裁案受容により自責の念を即時解消", "計画的外食費削減でストレスゼロ", "健康軌道安定", "中期体力正常", "30年健康維持"],
                        ["Guilt resolved immediately via compromise", "Zero stress with planned dining savings", "Health trajectory stable", "Mid-term stamina normal", "30-year wellness secured"]
                    )
                else:
                    deltas = [0, 0, 0, 0, 0]
                    notes = _loc_list(
                        ["생체 신호 평형 유지", "단기 피로도 정상", "분기 건강 지표 안정", "중기 체력 유지", "30년 건강 궤적 순항"],
                        ["生体信号の平衡維持", "短期疲労度正常", "四半期健康指標安定", "中期体力維持", "30年健康軌道の順航"],
                        ["Vital signs balanced", "Short-term fatigue normal", "Quarterly health stable", "Mid-term stamina kept", "30-year health trajectory steady"]
                    )
                    arb_deltas = [0, 0, 0, 0, 0]
                    arb_notes = _loc_list(
                        ["생체 신호 평형 유지", "단기 피로도 정상", "분기 건강 지표 안정", "중기 체력 유지", "30년 건강 궤적 순항"],
                        ["生体信号の平衡維持", "短期疲労度正常", "四半期健康指標安定", "中期体力維持", "30年健康軌道の順航"],
                        ["Vital signs balanced", "Short-term fatigue normal", "Quarterly health stable", "Mid-term stamina kept", "30-year health trajectory steady"]
                    )

        # ── 4. Family ──
        elif cat_id == "family":
            base = 90
            if any(k in text for k in ["주말 출근", "70시간", "週末出勤", "70時間", "overtime"]):
                deltas = [-50, -40, -30, -20, -10]
                notes = _loc_list(
                    ["가족 저녁 결석 및 주말 약속 파기", "평일 저녁 식사 결석 누적", "주말 온전한 동행 단절 (헌법 제1조 중대 위배)", "3년 성장기 가족과의 정서적 유대감 영구 침식", "30년 인생 헌법의 핵심인 가족 추억 결핍"],
                    ["家族夕食週3回の即時喪失（憲法第1条違反）", "平日夕食の欠席累積", "週末の完全な同行断絶（憲法第1条重大違反）", "3年成長期の家族との情緒的絆の永続的侵食", "30年人生憲法の核心である家族の思い出欠落"],
                    ["Family dinner missed and weekend plans cancelled", "Weekday family dinner absences accumulate", "Weekend companionship broken (Constitution Art. 1 violation)", "Emotional bond with growing family permanently eroded", "Lack of cherished family memories over 30 years"]
                )
                arb_deltas = [0, +5, +8, +10, +12]
                arb_notes = _loc_list(
                    ["중재 판결: 주 3회 가족 저녁 식사 절대 불가침 헌법 적용", "평일 19시 퇴근 알림 차단으로 가족 식사 100% 사수", "주말 온전한 동행 실현 (헌법 제1조 완벽 준수)", "가족 신뢰 자본 공고화", "30년 가족 행복 공동체 수호"],
                    ["仲裁判決: 週3回家族夕食の絶対不可侵憲法適用", "平日19時退勤アラートで家族食事を100%死守", "週末の完全な同行実現（憲法第1条完全遵守）", "家族信頼資本の強固化", "30年の家族幸福共同体の維持"],
                    ["Ruling: 3 family dinners/week strictly inviolable", "19:00 clock-out protects family dinner 100%", "Full weekend presence secured (Constitution Art. 1 met)", "Family trust capital solidified", "30-year family happiness protected"]
                )
            elif any(k in text for k in ["아내", "남편", "아이", "가족", "妻", "家族", "family", "wife"]):
                if micro_deviation > 80000 and "상의" not in text and "相談" not in text:
                    deltas = [-15, -12, -8, -3, 0]
                    notes = _loc_list(
                        ["가계 공유 예산 독단 사용으로 인한 신뢰 저하", "10일 완충 기간 동안 부부 갈등 및 예산 긴축 논의", "분기 가계부 정산 시 소통으로 회복 시작", "중기적 상호 신뢰 회복", "30년 장기 가족 헌법에는 영향 소멸"],
                        ["家計共有予算の独断使用による信頼低下", "10日バッファ期間中の夫婦摩擦と緊縮議論", "四半期家計精算時の対話による回復開始", "中期的相互信頼の回復", "30年の長期家族憲法への影響は消滅"],
                        ["Trust dipped from unilateral budget use", "Spousal friction and austerity talks over 10 days", "Recovery starts via open discussion at quarter settlement", "Mid-term mutual trust restored", "No lasting impact on 30-year family constitution"]
                    )
                    arb_deltas = [-5, 0, +4, +5, +5]
                    arb_notes = _loc_list(
                        ["사후 솔직한 공유 및 중재안 제시로 충격 완화", "3일간 외식비 아껴 함께 집밥 요리하며 유대 회복", "투명한 가계 관리로 부부 신뢰 재구축", "3년 주기 가족 행복도 상승", "생애 전반 유대감 공고화"],
                        ["事後の率直な共有と仲裁案提示で衝撃緩和", "3日間の外食費を節約し自炊することで絆を回復", "透明な家計管理による夫婦信頼の再構築", "3年周期の家族幸福度の上昇", "生涯にわたる絆の強化"],
                        ["Candid sharing and compromise softens impact", "Home-cooking together saves dining out and rebuilds bond", "Transparent budget rebuilds spousal trust", "3-year family happiness rises", "Lifelong emotional bond solidified"]
                    )
                else:
                    deltas = [+15, +12, +9, +6, +3]
                    notes = _loc_list(
                        ["일상 교감 증진", "가정 내 심리적 안정", "가족 신뢰 자본 축적", "3년 주기 가족 행복도 상승", "생애 전반 가족 공동체 공고화"],
                        ["日常の対話促進", "家庭内の心理的安定", "家族信頼資本の蓄積", "3年周期の家族幸福度の上昇", "生涯にわたる家族共同体の強固化"],
                        ["Daily connection enhanced", "Psychological safety at home", "Family trust capital accumulated", "3-year family happiness lifted", "Lifelong family cohesion fortified"]
                    )
                    arb_deltas = [+15, +12, +9, +6, +3]
                    arb_notes = _loc_list(
                        ["일상 교감 증진", "가정 내 심리적 안정", "가족 신뢰 자본 축적", "3년 주기 가족 행복도 상승", "생애 전반 가족 공동체 공고화"],
                        ["日常の対話促進", "家庭内の心理的安定", "家族信頼資本の蓄積", "3年周期の家族幸福度の上昇", "生涯にわたる家族共同体の強固化"],
                        ["Daily connection enhanced", "Psychological safety at home", "Family trust capital accumulated", "3-year family happiness lifted", "Lifelong family cohesion fortified"]
                    )
            elif any(k in text for k in ["산책", "散歩", "walk"]):
                deltas = [+10, +8, +5, +4, +3]
                notes = _loc_list(
                    ["귀가 전 감정 정돈", "가정 내 평온한 대화", "분기 가족 스트레스 전파 차단", "온화한 가정 분위기 지속", "장기 가족 웰빙 기여"],
                    ["帰宅前の感情整理", "家庭内の穏やかな対話", "四半期の家族ストレス伝播遮断", "温和な家庭環境の持続", "長期的な家族ウェルビーイングへの貢献"],
                    ["Emotions sorted before heading home", "Peaceful dialogue with family", "Prevents spillover of work stress into home", "Warm family atmosphere preserved", "Contributes to long-term family wellbeing"]
                )
                arb_deltas = [+10, +8, +5, +4, +3]
                arb_notes = _loc_list(
                    ["귀가 전 감정 정돈", "가정 내 평온한 대화", "분기 가족 스트레스 전파 차단", "온화한 가정 분위기 지속", "장기 가족 웰빙 기여"],
                    ["帰宅前の感情整理", "家庭内の穏やかな対話", "四半期の家族ストレス伝播遮断", "温和な家庭環境の持続", "長期的な家族ウェルビーイングへの貢献"],
                    ["Emotions sorted before heading home", "Peaceful dialogue with family", "Prevents spillover of work stress into home", "Warm family atmosphere preserved", "Contributes to long-term family wellbeing"]
                )
            else:
                deltas = [0, 0, 0, 0, 0]
                notes = _loc_list(
                    ["가족 일정 정상", "단기 교감 유지", "분기 가족 루틴 순항", "중기 라이프사이클 안정", "장기 헌법 준수"],
                    ["家族スケジュール正常", "短期的な絆の維持", "四半期家族ルーティンの順調な進行", "中期ライフサイクルの安定", "長期憲法の遵守"],
                    ["Family schedule normal", "Short-term bond steady", "Quarterly family routine on track", "Mid-term lifecycle stable", "Long-term constitution respected"]
                )
                arb_deltas = [0, 0, 0, 0, 0]
                arb_notes = _loc_list(
                    ["가족 일정 정상", "단기 교감 유지", "분기 가족 루틴 순항", "중기 라이프사이클 안정", "장기 헌법 준수"],
                    ["家族スケジュール正常", "短期的な絆の維持", "四半期家族ルーティンの順調な進行", "中期ライフサイクルの安定", "長期憲法の遵守"],
                    ["Family schedule normal", "Short-term bond steady", "Quarterly family routine on track", "Mid-term lifecycle stable", "Long-term constitution respected"]
                )

        # ── 5. Hobby ──
        else:
            base = 80
            if any(k in text for k in ["주말 출근", "70시간", "週末出勤", "70時間", "overtime"]):
                deltas = [-40, -32, -24, -16, -10]
                notes = _loc_list(
                    ["주말 취미 일정 즉각 취소", "주말 러닝/취미 시간 1회 캔슬", "주당 4시간 취미 쿼터 전면 박탈 (헌법 제1조 위반)", "자아실현 및 심리적 산소호흡기 차단으로 탈진", "30년 평생 취미와 삶의 활력 단절"],
                    ["週末趣味スケジュールの即時キャンセル", "週末ランニング/趣味時間の中止", "週4時間の趣味枠剥奪（憲法第1条違反）", "自己実現と心理的休息の遮断による疲弊", "30年の生涯趣味と活力の途絶"],
                    ["Weekend hobby schedule cancelled immediately", "Running/hobby session cancelled", "Weekly 4-hour hobby quota deprived (Constitution Art. 1 violation)", "Exhaustion from blocked self-actualization", "Lifelong hobby vitality severed"]
                )
                arb_deltas = [0, +4, +8, +10, +10]
                arb_notes = _loc_list(
                    ["중재 판결: 주말 취미 4시간 쿼터 블록 강제 잠금", "주말 개인 취미 몰입 4시간 온전 사수 (헌법 제2조 준수)", "자아실현 및 심리적 산소호흡기 방어", "취미 몰입을 통한 번아웃 방어막 형성", "30년 평생 자아실현 포트폴리오 완성"],
                    ["仲裁判決: 週末趣味4時間枠の強制ロック", "週末の個人趣味4時間を完全死守（憲法第2条遵守）", "自己実現および心理적酸素補給の防御", "趣味没頭によるバーンアウト防御膜の形成", "30年の生涯自己実現ポートフォリオ完成"],
                    ["Ruling: 4-hour weekend hobby block locked", "4 hours of personal immersion fully protected", "Self-actualization defense intact", "Hobby immersion forms burnout shield", "30-year lifetime hobby portfolio secured"]
                )
            elif any(k in text for k in ["키보드", "러닝", "취미", "음악", "사진", "キーボード", "ランニング", "趣味", "hobby", "keyboard"]):
                deltas = [+35, +28, +20, +12, +5]
                notes = _loc_list(
                    ["취미 몰입 즉각적 쾌감 및 도파민 충전", "주말 취미 쿼터 몰입도 상승", "100일 마일스톤 취미 숙련도 안착", "3년 차 취미 전문가 수준 도달 및 스트레스 완충", "30년 평생 자아실현 포트폴리오 구축"],
                    ["趣味没頭による即時快感とドーパミン充電", "週末趣味枠の没頭度向上", "100日マイルストーンでの趣味熟練度定着", "3年目のエキスパート到達とストレス緩和", "30年の生涯自己実現ポートフォリオ構築"],
                    ["Immediate joy and dopamine from hobby immersion", "Immersion in weekend hobby quota lifted", "Proficiency settled at 100-day milestone", "3-year expert proficiency and stress buffer", "30-year lifelong self-actualization portfolio built"]
                )
                arb_deltas = [+35, +30, +22, +14, +8]
                arb_notes = _loc_list(
                    ["취미 몰입 즉각적 쾌감 및 자아실현", "주말 취미 쿼터 몰입도 상승 (3일 외식비 절감으로 재정 부담 제거)", "100일 마일스톤 취미 숙련도 안착", "3년 차 취미 전문가 수준 도달", "30년 평생 자아실현 포트폴리오 완성"],
                    ["趣味没頭による即時快感と自己実現", "週末趣味枠の没頭度向上（3日外食費節約で財務負担ゼロ）", "100日マイルストーンでの趣味熟練度定着", "3年目のエキスパート到達", "30年の生涯自己実現ポートフォリオ完成"],
                    ["Immediate joy and self-actualization", "Weekend hobby immersion lifted (zero financial guilt via 3-day savings)", "Proficiency rooted at 100-day milestone", "3-year expert level reached", "30-year self-actualization completed"]
                )
            elif any(k in text for k in ["산책", "散歩", "walk"]):
                deltas = [+25, +20, +15, +8, +3]
                notes = _loc_list(
                    ["가벼운 야간 산책 웰니스", "주말 러닝을 위한 컨디션 조절", "분기 신체 쾌적도 회복", "취미 지속 가능성 확보", "평생 활동성 유지"],
                    ["軽快な夜間散歩ウェルネス", "週末ランニングのためのコンディション調整", "四半期の身体的快適さの回復", "趣味の持続可能性確保", "生涯にわたる活動性維持"],
                    ["Light evening walk wellness", "Condition tuned for weekend running", "Quarterly bodily vitality restored", "Hobby sustainability secured", "Lifelong active lifestyle maintained"]
                )
                arb_deltas = [+25, +20, +15, +8, +3]
                arb_notes = _loc_list(
                    ["가벼운 야간 산책", "주말 러닝 컨디션 조절", "분기 신체 쾌적도 회복", "취미 지속 가능성 확보", "평생 활동성 유지"],
                    ["軽快な夜間散歩", "週末ランニングのコンディション調整", "四半期の身体的快適さの回復", "趣味の持続可能性確保", "生涯にわたる活動性維持"],
                    ["Light evening walk", "Weekend running tuned", "Quarterly bodily vitality restored", "Hobby sustainability secured", "Lifelong active lifestyle maintained"]
                )
            else:
                deltas = [0, 0, 0, 0, 0]
                notes = _loc_list(
                    ["취미 루틴 유지", "단기 블록 확보", "분기 쿼터 정상", "중기 취미 생활 안정", "평생 여가 지속"],
                    ["趣味ルーティンの維持", "短期ブロックの確保", "四半期クォータの正常消化", "中期趣味生活の安定", "生涯余暇の継続"],
                    ["Hobby routine maintained", "Short-term block secured", "Quarterly quota normal", "Mid-term leisure stable", "Lifelong recreation kept"]
                )
                arb_deltas = [0, 0, 0, 0, 0]
                arb_notes = _loc_list(
                    ["취미 루틴 유지", "단기 블록 확보", "분기 쿼터 정상", "중기 취미 생활 안정", "평생 여가 지속"],
                    ["趣味ルーティンの維持", "短期ブロックの確保", "四半期クォータの正常消化", "中期趣味生活の安定", "生涯余暇の継続"],
                    ["Hobby routine maintained", "Short-term block secured", "Quarterly quota normal", "Mid-term leisure stable", "Lifelong recreation kept"]
                )

        if locale == "ja":
            horizons_meta = [
                ("L0", "1日 (L0)", 1, "日次即時"),
                ("L1", "7日 (L1)", 7, "週次戦術"),
                ("L2", "1年 (L2)", 365, "年次戦略"),
                ("L3", "5年 (L3)", 1825, "5ヶ年ロードマップ"),
                ("L4", "30年 (L4)", 10950, "人生憲法")
            ]
        elif locale == "en":
            horizons_meta = [
                ("L0", "1 Day (L0)", 1, "Daily Immediate"),
                ("L1", "7 Days (L1)", 7, "Weekly Tactical"),
                ("L2", "1 Year (L2)", 365, "Annual Strategic"),
                ("L3", "5 Years (L3)", 1825, "5-Year Roadmap"),
                ("L4", "30 Years (L4)", 10950, "Life Constitution")
            ]
        else:
            horizons_meta = [
                ("L0", "1일 (L0)", 1, "일일 즉각"),
                ("L1", "7일 (L1)", 7, "주간 전술"),
                ("L2", "1년 (L2)", 365, "연간 전략"),
                ("L3", "5년 (L3)", 1825, "5개년 로드맵"),
                ("L4", "30년 (L4)", 10950, "인생 헌법")
            ]

        result = []
        for i, (tier, label, days, scale) in enumerate(horizons_meta):
            d = deltas[i]
            proj = max(0, min(100, base + d))
            ad = arb_deltas[i]
            arb_proj = max(0, min(100, base + ad))

            result.append({
                "tier": tier,
                "label": label,
                "days": days,
                "scale": scale,
                "baseline": base,
                "projected": proj,
                "arbitrated": arb_proj,
                "delta": d,
                "delta_label": f"{d:+d}%",
                "arbitrated_delta": ad,
                "arbitrated_delta_label": f"{ad:+d}%",
                "narrative": notes[i],
                "arbitrated_narrative": arb_notes[i]
            })

        return result

