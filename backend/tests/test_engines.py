"""
ChronosLife Unit Tests - 엔진 및 도구 검증
"""
import os
import sys
import math
import json
import pytest
import asyncio

# Mock 환경 강제 설정
os.environ["USE_MOCK_FALLBACK"] = "True"

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from engines.log10_engine import Log10TemporalEngine, Log10CascadeResult
from engines.privacy_guard import ChronosPrivacySandbox
from engines.domain_council import DomainCouncil
from engines.chief_governor import ChiefGovernor
from tools.ekispert_client import EkispertMobilityClient


# ─── Log-10 Engine Tests ───────────────────────────────────

class TestLog10Engine:
    """Log-10 5단계 계층 인과 역전파 수식 엔진 테스트"""

    def setup_method(self):
        self.engine = Log10TemporalEngine(daily_budget=40000.0, annual_interest=0.06)

    def test_cascade_98000_l0(self):
        """98,000원 충동 소비 → L0 일일 예산 245% 소진 검증"""
        result = self.engine.compute_bottom_up_cascade(98000, remaining_years=28)
        assert result.l0_daily["budget_drain_pct"] == pytest.approx(245.0, rel=0.01)
        assert result.l0_daily["status"] == "CRITICAL"

    def test_cascade_98000_l1(self):
        """98,000원 → L1 10일 스프린트 완충 검증"""
        result = self.engine.compute_bottom_up_cascade(98000, remaining_years=28)
        sprint_budget = 40000 * 10
        expected_absorb = 98000 / sprint_budget
        assert result.l1_sprint["sprint_absorb"] == pytest.approx(expected_absorb, rel=0.01)
        assert "32,667" in result.l1_sprint["remedy"]  # 98000/3 ≈ 32,667

    def test_cascade_98000_l3(self):
        """98,000원 → L3 3년 시드머니 복리 기회손실 검증"""
        result = self.engine.compute_bottom_up_cascade(98000, remaining_years=28)
        daily_r = 0.06 / 365.0
        expected_l3 = 98000 * math.pow(1 + daily_r, 1000)
        assert result.l3_chapter["future_loss_1000d"] == pytest.approx(expected_l3, rel=0.01)

    def test_cascade_98000_l4(self):
        """98,000원 → L4 30년 복리 은퇴 지연일 검증 (약 2.4일)"""
        result = self.engine.compute_bottom_up_cascade(98000, remaining_years=28)
        daily_r = 0.06 / 365.0
        total_days = 28 * 365
        expected_loss = 98000 * math.pow(1 + daily_r, total_days)
        expected_delay = expected_loss / 75000.0
        assert result.l4_constitution["compound_loss"] == pytest.approx(expected_loss, rel=0.01)
        assert result.l4_constitution["delayed_days"] == pytest.approx(expected_delay, rel=0.05)

    def test_cascade_30000(self):
        """30,000원 야식 → L0 75% 소진 검증"""
        result = self.engine.compute_bottom_up_cascade(30000, remaining_years=28)
        assert result.l0_daily["budget_drain_pct"] == pytest.approx(75.0, rel=0.01)
        assert result.l0_daily["status"] == "WARNING"

    def test_to_dict(self):
        """직렬화(to_dict) 정상 동작 검증"""
        result = self.engine.compute_bottom_up_cascade(98000)
        d = result.to_dict()
        assert isinstance(d, dict)
        assert "l0_daily" in d
        assert "l4_constitution" in d
        assert "summary_verdict" in d

    def test_top_down_constraints(self):
        """상향식 제약 역산 검증"""
        constraints = self.engine.compute_top_down_constraints(
            constitution_budget=500_000_000,
            target_retirement_age=60
        )
        assert constraints["max_daily_spend"] > 0
        assert constraints["quarterly_savings_target"] > 0
        assert constraints["constitution_target"] == 500_000_000

    def test_summary_verdict_korean(self):
        """요약 판결문이 한국어로 올바르게 생성되는지 확인"""
        result = self.engine.compute_bottom_up_cascade(98000, remaining_years=28)
        assert "98,000" in result.summary_verdict
        assert "은퇴" in result.summary_verdict


# ─── Privacy Guard Tests ───────────────────────────────────

class TestPrivacyGuard:
    """Layer 0: Cloud DLP Mock 토크나이저 테스트"""

    def setup_method(self):
        self.sandbox = ChronosPrivacySandbox(project_id=None)  # Force mock mode

    def test_person_name_detection(self):
        """가족 실명 마스킹 검증"""
        text = "우리 아내 이수진과 함께 식사했다"
        result = self.sandbox.sanitize_user_input(text)
        assert result["has_pii"] is True
        assert "PERSON_NAME" in result["detected_info_types"]
        assert "이수진" not in result["sanitized"]

    def test_bank_account_detection(self):
        """은행 계좌번호 마스킹 검증"""
        text = "신한은행 110-384-918237 계좌"
        result = self.sandbox.sanitize_user_input(text)
        assert result["has_pii"] is True
        assert "FINANCIAL_ACCOUNT_NUMBER" in result["detected_info_types"]
        assert "110-384-918237" not in result["sanitized"]

    def test_salary_detection(self):
        """급여/보너스 금액 마스킹 검증"""
        text = "이번 달 보너스 300만 원"
        result = self.sandbox.sanitize_user_input(text)
        assert result["has_pii"] is True

    def test_ecommerce_detection(self):
        """전자상거래 플랫폼명 마스킹 검증"""
        text = "쿠팡에서 물건을 샀다"
        result = self.sandbox.sanitize_user_input(text)
        assert "ECOMMERCE_PLATFORM" in result["detected_info_types"]
        assert "쿠팡" not in result["sanitized"]

    def test_scenario1_full(self):
        """시나리오 1 전체 원본 텍스트 DLP 처리 검증"""
        raw = "오늘 우리 아내 이수진과 신한은행 110-384-918237 계좌에서 이번 달 보너스 300만 원 들어왔는데, 너무 스트레스 받아서 쿠팡에서 98,000원짜리 한정판 키보드 결제함."
        result = self.sandbox.sanitize_user_input(raw)
        assert result["has_pii"] is True
        assert "이수진" not in result["sanitized"]
        assert "110-384-918237" not in result["sanitized"]
        assert len(result["transformations"]) >= 3

    def test_no_pii_text(self):
        """PII가 없는 텍스트는 변환 없이 통과"""
        text = "오늘 날씨가 좋다"
        result = self.sandbox.sanitize_user_input(text)
        assert result["has_pii"] is False
        assert result["sanitized"] == text


# ─── Domain Council Tests ──────────────────────────────────

class TestDomainCouncil:
    """Layer 2: 멀티 에이전트 도메인 위원회 테스트"""

    def setup_method(self):
        self.council = DomainCouncil()

    @pytest.mark.asyncio
    async def test_returns_all_three_agents(self):
        """3개 에이전트(finance, career, wellbeing) 모두 의견을 반환하는지 검증"""
        result = await self.council.evaluate(
            sanitized_input="98,000원 충동 지출",
            cascade_result={"l0_daily": {"budget_drain_pct": 245.0}},
        )
        assert "finance" in result
        assert "career" in result
        assert "wellbeing" in result

    @pytest.mark.asyncio
    async def test_stance_values(self):
        """stance 값이 허용된 enum 중 하나인지 검증"""
        result = await self.council.evaluate(
            sanitized_input="테스트",
            cascade_result={"l0_daily": {"budget_drain_pct": 50.0}},
        )
        valid_stances = {"approve", "reject", "conditional", "neutral"}
        for agent in ["finance", "career", "wellbeing"]:
            assert result[agent]["stance"] in valid_stances

    @pytest.mark.asyncio
    async def test_high_spend_triggers_finance_reject(self):
        """고액 지출 시 Finance Agent가 reject하는지 검증"""
        result = await self.council.evaluate(
            sanitized_input="200,000원 지출",
            cascade_result={"l0_daily": {"budget_drain_pct": 500.0}},
        )
        assert result["finance"]["stance"] == "reject"


# ─── Chief Governor Tests ──────────────────────────────────

class TestChiefGovernor:
    """Layer 3: 최고 거버넌스 중재관 테스트"""

    def setup_method(self):
        self.governor = ChiefGovernor()

    @pytest.mark.asyncio
    async def test_valid_decision_types(self):
        """결정 유형이 유효한 값인지 검증"""
        result = await self.governor.arbitrate(
            proposal_title="테스트 안건",
            domain_evaluations={
                "finance": {"stance": "approve", "reasoning": "OK"},
                "career": {"stance": "approve", "reasoning": "OK"},
                "wellbeing": {"stance": "approve", "reasoning": "OK"},
            },
            cascade_summary="은퇴가 0.5일 지연됩니다.",
        )
        assert result["decision"] in ["승인", "조건부수정", "기각"]

    @pytest.mark.asyncio
    async def test_wellbeing_reject_triggers_conditional(self):
        """Well-being이 반대하면 조건부수정이 되는지 검증"""
        result = await self.governor.arbitrate(
            proposal_title="주 70시간 이직 제안",
            domain_evaluations={
                "finance": {"stance": "approve", "reasoning": "수익 증가"},
                "career": {"stance": "conditional", "reasoning": "성장 가능"},
                "wellbeing": {"stance": "reject", "reasoning": "번아웃 위험"},
            },
            cascade_summary="은퇴가 0.5일 지연됩니다.",
        )
        assert result["decision"] == "조건부수정"
        assert len(result["violated_tenets"]) > 0

    @pytest.mark.asyncio
    async def test_high_retirement_delay_adds_l2_review(self):
        """은퇴 2일 이상 지연 시 L2 유예 조건이 추가되는지 검증"""
        result = await self.governor.arbitrate(
            proposal_title="대규모 지출",
            domain_evaluations={
                "finance": {"stance": "reject", "reasoning": "과다 지출"},
                "career": {"stance": "neutral", "reasoning": "무관"},
                "wellbeing": {"stance": "conditional", "reasoning": "스트레스 해소"},
            },
            cascade_summary="현재의 98,000원 지출은 일일 예산의 245.0%를 차지하며 은퇴가 2.4일 지연됩니다.",
        )
        assert result["l2_review_conditions"] is not None


# ─── Ekispert Client Tests ─────────────────────────────────

class TestEkispertClient:
    """Layer 5: Ekispert MCP 힐링 산책로 처방 테스트"""

    def setup_method(self):
        self.client = EkispertMobilityClient()

    @pytest.mark.asyncio
    async def test_shinjuku_route(self):
        """신주쿠역 → 신주쿠교엔 녹지 환승 경로 검증"""
        result = await self.client.prescribe_healing_route("신주쿠역", 88)
        assert "신주쿠교엔" in result["healing_walk_route"]["segments"][0]["to"]
        assert result["savings"]["food_cost_saved"] == 30000
        assert result["savings"]["calories_prevented"] == 1200

    @pytest.mark.asyncio
    async def test_gangnam_route(self):
        """강남역 → 양재시민의숲 경로 검증"""
        result = await self.client.prescribe_healing_route("강남역", 75)
        assert "양재" in result["healing_walk_route"]["segments"][0]["to"]

    @pytest.mark.asyncio
    async def test_stress_level_in_trigger(self):
        """스트레스 레벨이 트리거 메시지에 반영되는지 검증"""
        result = await self.client.prescribe_healing_route("신주쿠역", 92)
        assert "92" in result["trigger"]

    @pytest.mark.asyncio
    async def test_action_card_has_korean(self):
        """액션 카드가 한국어 동기부여 메시지를 포함하는지 검증"""
        result = await self.client.prescribe_healing_route("시부야역", 80)
        assert "야식비" in result["action_card"] or "힐링" in result["action_card"]


# ─── Presets JSON Tests ────────────────────────────────────

class TestPresetsData:
    """프리셋 JSON 데이터 무결성 테스트"""

    def setup_method(self):
        preset_path = os.path.join(os.path.dirname(__file__), "..", "mock_data", "presets.json")
        with open(preset_path, "r", encoding="utf-8") as f:
            self.data = json.load(f)

    def test_has_three_scenarios(self):
        """3가지 시나리오가 존재하는지 검증"""
        assert len(self.data["scenarios"]) == 3

    def test_scenario_ids(self):
        """시나리오 ID가 올바른지 검증"""
        ids = [s["id"] for s in self.data["scenarios"]]
        assert "scenario_1_impulse_spend" in ids
        assert "scenario_2_startup_tradeoff" in ids
        assert "scenario_3_burnout_mobility" in ids

    def test_scenario1_has_cascade(self):
        """시나리오 1에 Log-10 cascade 데이터가 있는지 검증"""
        s1 = self.data["scenarios"][0]
        assert s1["log10_cascade"] is not None
        assert "l4_constitution" in s1["log10_cascade"]

    def test_scenario3_has_ekispert(self):
        """시나리오 3에 Ekispert 처방 데이터가 있는지 검증"""
        s3 = self.data["scenarios"][2]
        assert "ekispert_prescription" in s3
        assert "healing_walk_route" in s3["ekispert_prescription"]
