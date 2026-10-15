from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import List, Dict, Any
import math

@dataclass
class DailySnapshot:
    date: str
    expense_total: float
    sleep_hours: float
    work_hours: float
    family_dinner: bool
    hobby_minutes: int

@dataclass
class LifeStateVector:
    finance_buffer_pct: float       # 0.0 ~ 100.0 (가처분 예산 건전도)
    burnout_index: float            # 0.0 (평온) ~ 1.0 (극심한 번아웃)
    habit_momentum: float           # 0.0 ~ 1.0 (루틴 안착도)
    family_connection_score: float  # 0.0 ~ 1.0
    hobby_vitality: float           # 0.0 ~ 1.0

class StateDynamicsEngine:
    def __init__(self, weekly_budget: float = 280000.0):
        self.weekly_budget = weekly_budget

    def compute_accumulated_state(
        self, 
        history_window: List[DailySnapshot], 
        current_input_expense: float = 0.0,
        current_input_work_hours: float = 0.0,
        locale: str = "ko"
    ) -> Dict[str, Any]:
        """
        최근 7~10일간의 일일 스냅샷 배열과 당일 입력을 결합하여 
        비선형 피로 누적 및 지출 가속도를 계산
        """
        n_days = len(history_window)
        if n_days == 0:
            return {"status": "INITIAL_COLD_START"}

        # 1. 재정 가속도 (Expense Velocity & Budget Drain)
        past_expenses = sum(d.expense_total for d in history_window)
        total_expense_week = past_expenses + current_input_expense
        budget_drain_pct = round((total_expense_week / self.weekly_budget) * 100, 1)

        # 2. 비선형 피로 누적 (Nonlinear Fatigue & Sleep Debt Integral)
        total_sleep_debt = 0.0
        consecutive_overwork_days = 0
        decay_factor = 0.85

        for idx, snap in enumerate(reversed(history_window)):
            weight = math.pow(decay_factor, idx)
            # 수면 부채 (기준 7.5시간 대비 부족분)
            deficit = max(0.0, 7.5 - snap.sleep_hours)
            total_sleep_debt += deficit * weight

            if snap.work_hours >= 10.0:
                consecutive_overwork_days += 1
            else:
                if idx == 0:
                    pass
                else:
                    break

        if current_input_work_hours >= 10.0:
            consecutive_overwork_days += 1

        # 번아웃 지수 산출 (시그모이드 누적)
        raw_fatigue = (total_sleep_debt * 0.15) + (consecutive_overwork_days * 0.25)
        burnout_index = round(min(1.0, 1.0 / (1.0 + math.exp(-2.0 * (raw_fatigue - 0.8)))), 2)

        # 3. 가족 및 취미 쿼터 이행률
        total_hobby_mins = sum(d.hobby_minutes for d in history_window)
        family_dinners = sum(1 for d in history_window if d.family_dinner)
        hobby_ratio = min(1.0, total_hobby_mins / 240.0) # 주당 4시간(240분) 목표

        # 4. 종합 이상 징후 및 경고 판정
        anomaly_triggers = []
        if burnout_index >= 0.75:
            anomaly_triggers.append("CRITICAL_BURNOUT_ACCUMULATED")
        if budget_drain_pct >= 85.0 and n_days <= 5:
            anomaly_triggers.append("EARLY_BUDGET_EXHAUSTION_WARNING")
        if consecutive_overwork_days >= 3:
            anomaly_triggers.append("CONSECUTIVE_OVERWORK_TIRED_BRAIN")

        # 5. 과거 궤적 렌더링을 위한 원시 데이터(Past Trajectory) 첨부
        past_trajectory = []
        for d in history_window:
            past_trajectory.append({
                "date": d.date,
                "expense_total": d.expense_total,
                "sleep_hours": d.sleep_hours,
                "work_hours": d.work_hours,
                "burnout_proxy": (max(0, 7.5 - d.sleep_hours) * 10 + (d.work_hours / 10) * 10) # 0~100 스케일의 대략적인 과거 상태 지수
            })

        if locale == "en":
            summary = (
                f"Past {n_days}-day cumulative analysis: Weekly budget drain {budget_drain_pct}%, "
                f"sleep debt {round(total_sleep_debt, 1)}h, burnout index {burnout_index} "
                f"({consecutive_overwork_days} consecutive high-intensity work days)."
            )
        elif locale == "ja":
            summary = (
                f"過去{n_days}日間の累積分析: 週間予算消化率 {budget_drain_pct}%、"
                f"睡眠負債 {round(total_sleep_debt, 1)}時間、バーンアウト指数 {burnout_index} "
                f"(連続高強度勤務 {consecutive_overwork_days}日目)。"
            )
        else:
            summary = (
                f"최근 {n_days}일간 누적 분석: 주간 예산 소진율 {budget_drain_pct}%, "
                f"수면 부채 {round(total_sleep_debt, 1)}시간, 번아웃 지수 {burnout_index} "
                f"(연속 고강도 근무 {consecutive_overwork_days}일째)."
            )

        return {
            "metrics": {
                "budget_drain_pct": budget_drain_pct,
                "burnout_index": round(burnout_index * 100, 1),
                "sleep_debt_hours": round(total_sleep_debt, 1),
                "consecutive_overwork_days": consecutive_overwork_days,
                "weekly_hobby_minutes": total_hobby_mins,
                "weekly_family_dinners": family_dinners
            },
            "anomaly_triggers": anomaly_triggers,
            "context_summary_for_council": summary,
            "past_trajectory": past_trajectory
        }
