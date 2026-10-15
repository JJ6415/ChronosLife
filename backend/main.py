"""
ChronosLife Backend - FastAPI 메인 서버
Log-10 계층 시계열 인생 거버넌스 시스템
"""
import re
import json
import logging
from pathlib import Path
from typing import Optional, Dict, Any

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from config import USE_MOCK_FALLBACK, GOOGLE_CLOUD_PROJECT
from engines.privacy_guard import ChronosPrivacySandbox
from engines.domain_council import DomainCouncil
from engines.chief_governor import ChiefGovernor
from engines.goal_manager import GoalManager
from engines.orchestrator import ContextOrchestrator
from engines.comic_engine import Log10ComicEngine
from engines.gemini_live_session import GeminiLiveBridge
from engines.history_manager import HistoryManager
from engines.model_registry import model_registry
from engines.dev_logger import dev_log_store
from engines.logger_middleware import DevInspectorMiddleware
from engines.state_engine import StateDynamicsEngine, DailySnapshot
from engines.context_cache_manager import ChronosContextCacheManager
from tools.ekispert_mcp import EkispertClient, handle_mcp_call, MCP_TOOLS_MANIFEST

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── FastAPI App ────────────────────────────────────────────
app = FastAPI(
    title="ChronosLife API",
    description="Log-10 Hierarchical Temporal LifeOS Backend",
    version="1.0.0",
)

# 1. 개발자용 API 입력/출력 실시간 감시 미들웨어
app.add_middleware(DevInspectorMiddleware)

# 2. CORS 미들웨어
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Engine Singletons ─────────────────────────────────────
orchestrator = ContextOrchestrator()
privacy_sandbox = ChronosPrivacySandbox(project_id=GOOGLE_CLOUD_PROJECT)
domain_council = DomainCouncil()
chief_governor = ChiefGovernor()
goal_manager = GoalManager()
comic_engine = Log10ComicEngine()
gemini_live_bridge = GeminiLiveBridge()
history_manager = HistoryManager()
state_engine = StateDynamicsEngine()
cache_manager = ChronosContextCacheManager(user_id="default_user")
ekispert_client = EkispertClient()

import random
from datetime import datetime, timedelta

# ─── Dynamic Session History Window for Life State Radar ───
_USER_HISTORY_WINDOW: list[DailySnapshot] = []

def init_user_history_window() -> list[DailySnapshot]:
    global _USER_HISTORY_WINDOW
    base_date = datetime.now() - timedelta(days=7)
    _USER_HISTORY_WINDOW = [
        DailySnapshot(date=(base_date + timedelta(days=0)).strftime("%m-%d"), expense_total=12000.0, sleep_hours=7.5, work_hours=8.0, family_dinner=True, hobby_minutes=60),
        DailySnapshot(date=(base_date + timedelta(days=1)).strftime("%m-%d"), expense_total=25000.0, sleep_hours=7.0, work_hours=8.5, family_dinner=False, hobby_minutes=30),
        DailySnapshot(date=(base_date + timedelta(days=2)).strftime("%m-%d"), expense_total=18000.0, sleep_hours=6.5, work_hours=9.0, family_dinner=False, hobby_minutes=0),
        DailySnapshot(date=(base_date + timedelta(days=3)).strftime("%m-%d"), expense_total=45000.0, sleep_hours=6.0, work_hours=10.5, family_dinner=False, hobby_minutes=0),
        DailySnapshot(date=(base_date + timedelta(days=4)).strftime("%m-%d"), expense_total=35000.0, sleep_hours=5.5, work_hours=11.0, family_dinner=False, hobby_minutes=0),
        DailySnapshot(date=(base_date + timedelta(days=5)).strftime("%m-%d"), expense_total=60000.0, sleep_hours=5.0, work_hours=12.0, family_dinner=False, hobby_minutes=0),
        DailySnapshot(date=(base_date + timedelta(days=6)).strftime("%m-%d"), expense_total=50000.0, sleep_hours=5.2, work_hours=11.5, family_dinner=False, hobby_minutes=0),
    ]
    return _USER_HISTORY_WINDOW

def set_preset_history_window(preset_id: str) -> list[DailySnapshot]:
    global _USER_HISTORY_WINDOW
    base_date = datetime.now() - timedelta(days=7)
    if preset_id == "burnout":
        # 1. バーンアウト危機・限界残業プリセット (4일 연속 11~12h 야근, 수면 4.8h, 지출 과열, 취미/가족 0)
        _USER_HISTORY_WINDOW = [
            DailySnapshot(date=(base_date + timedelta(days=0)).strftime("%m-%d"), expense_total=32000.0, sleep_hours=6.0, work_hours=10.0, family_dinner=False, hobby_minutes=0),
            DailySnapshot(date=(base_date + timedelta(days=1)).strftime("%m-%d"), expense_total=45000.0, sleep_hours=5.5, work_hours=10.5, family_dinner=False, hobby_minutes=0),
            DailySnapshot(date=(base_date + timedelta(days=2)).strftime("%m-%d"), expense_total=42000.0, sleep_hours=5.2, work_hours=11.0, family_dinner=False, hobby_minutes=0),
            DailySnapshot(date=(base_date + timedelta(days=3)).strftime("%m-%d"), expense_total=58000.0, sleep_hours=5.0, work_hours=12.0, family_dinner=False, hobby_minutes=0),
            DailySnapshot(date=(base_date + timedelta(days=4)).strftime("%m-%d"), expense_total=62000.0, sleep_hours=4.8, work_hours=12.5, family_dinner=False, hobby_minutes=0),
            DailySnapshot(date=(base_date + timedelta(days=5)).strftime("%m-%d"), expense_total=68000.0, sleep_hours=4.5, work_hours=13.0, family_dinner=False, hobby_minutes=0),
            DailySnapshot(date=(base_date + timedelta(days=6)).strftime("%m-%d"), expense_total=52000.0, sleep_hours=5.0, work_hours=12.0, family_dinner=False, hobby_minutes=0),
        ]
    elif preset_id == "balanced":
        # 2. 黄金のバランス・安定調和プリセット (수면 7.5h 충분, 칼퇴 및 8h 근무, 지출 적정 45%, 취미 4시간, 가족 식사 4회)
        _USER_HISTORY_WINDOW = [
            DailySnapshot(date=(base_date + timedelta(days=0)).strftime("%m-%d"), expense_total=18000.0, sleep_hours=7.5, work_hours=8.0, family_dinner=True, hobby_minutes=40),
            DailySnapshot(date=(base_date + timedelta(days=1)).strftime("%m-%d"), expense_total=22000.0, sleep_hours=7.5, work_hours=8.0, family_dinner=True, hobby_minutes=30),
            DailySnapshot(date=(base_date + timedelta(days=2)).strftime("%m-%d"), expense_total=15000.0, sleep_hours=7.2, work_hours=8.5, family_dinner=False, hobby_minutes=30),
            DailySnapshot(date=(base_date + timedelta(days=3)).strftime("%m-%d"), expense_total=20000.0, sleep_hours=7.5, work_hours=8.0, family_dinner=True, hobby_minutes=40),
            DailySnapshot(date=(base_date + timedelta(days=4)).strftime("%m-%d"), expense_total=25000.0, sleep_hours=7.8, work_hours=7.5, family_dinner=False, hobby_minutes=40),
            DailySnapshot(date=(base_date + timedelta(days=5)).strftime("%m-%d"), expense_total=12000.0, sleep_hours=8.0, work_hours=0.0, family_dinner=True, hobby_minutes=60),
            DailySnapshot(date=(base_date + timedelta(days=6)).strftime("%m-%d"), expense_total=14000.0, sleep_hours=7.5, work_hours=0.0, family_dinner=False, hobby_minutes=0),
        ]
    elif preset_id == "frugal":
        # 3. 極限の倹約・修行僧プリセット (하루 지출 5,000~8,000엔 통제, 수면 7.4h, 근무 8.2h, 절약 복리 극대화)
        _USER_HISTORY_WINDOW = [
            DailySnapshot(date=(base_date + timedelta(days=0)).strftime("%m-%d"), expense_total=6000.0, sleep_hours=7.2, work_hours=8.5, family_dinner=True, hobby_minutes=20),
            DailySnapshot(date=(base_date + timedelta(days=1)).strftime("%m-%d"), expense_total=8000.0, sleep_hours=7.0, work_hours=8.5, family_dinner=False, hobby_minutes=20),
            DailySnapshot(date=(base_date + timedelta(days=2)).strftime("%m-%d"), expense_total=5000.0, sleep_hours=7.2, work_hours=8.5, family_dinner=True, hobby_minutes=15),
            DailySnapshot(date=(base_date + timedelta(days=3)).strftime("%m-%d"), expense_total=7000.0, sleep_hours=7.5, work_hours=8.0, family_dinner=False, hobby_minutes=15),
            DailySnapshot(date=(base_date + timedelta(days=4)).strftime("%m-%d"), expense_total=9000.0, sleep_hours=7.2, work_hours=8.5, family_dinner=True, hobby_minutes=20),
            DailySnapshot(date=(base_date + timedelta(days=5)).strftime("%m-%d"), expense_total=8000.0, sleep_hours=8.0, work_hours=0.0, family_dinner=False, hobby_minutes=30),
            DailySnapshot(date=(base_date + timedelta(days=6)).strftime("%m-%d"), expense_total=6000.0, sleep_hours=7.5, work_hours=0.0, family_dinner=False, hobby_minutes=0),
        ]
    else:
        init_user_history_window()
    return _USER_HISTORY_WINDOW

def set_custom_history_window(
    budget_drain_pct: float = 50.0,
    burnout_index: float = 30.0,
    sleep_debt_hours: float = 2.0,
    consecutive_overwork_days: int = 0,
    weekly_hobby_minutes: int = 120,
    weekly_family_dinners: int = 2
) -> list[DailySnapshot]:
    """사용자가 직접 슬라이더/인풋으로 조율한 바이탈 수치를 7일 스냅샷 배열로 합성합니다."""
    global _USER_HISTORY_WINDOW
    base_date = datetime.now() - timedelta(days=7)
    total_budget_yen = 280000.0 * (budget_drain_pct / 100.0)
    daily_expense = round(total_budget_yen / 7.0, 1)

    daily_sleep = max(4.0, min(9.0, 7.5 - (sleep_debt_hours / 3.0)))
    daily_hobby = max(0, int(weekly_hobby_minutes / 5))

    new_snaps = []
    for i in range(7):
        is_overwork = (7 - i) <= consecutive_overwork_days
        w_hours = 11.5 if is_overwork else 8.0
        f_dinner = (i < weekly_family_dinners)
        h_mins = 0 if is_overwork else daily_hobby
        s_hours = (daily_sleep - 0.5) if is_overwork else daily_sleep

        new_snaps.append(DailySnapshot(
            date=(base_date + timedelta(days=i)).strftime("%m-%d"),
            expense_total=daily_expense,
            sleep_hours=round(s_hours, 1),
            work_hours=round(w_hours, 1),
            family_dinner=f_dinner,
            hobby_minutes=h_mins
        ))
    _USER_HISTORY_WINDOW = new_snaps
    return _USER_HISTORY_WINDOW

def get_user_history_window() -> list[DailySnapshot]:
    global _USER_HISTORY_WINDOW
    if not _USER_HISTORY_WINDOW:
        init_user_history_window()
    return _USER_HISTORY_WINDOW

def extract_vital_deltas_from_input(raw_input: str, detected_expense: float = 0.0) -> dict:
    text = raw_input.lower()
    work_delta = 0.0
    family = False
    hobby = 0

    if any(k in text for k in ["70시간", "70時間"]):
        work_delta = 6.0
    elif any(k in text for k in ["철야", "밤샘", "徹夜", "all-nighter"]):
        work_delta = 6.0
    elif any(k in text for k in ["23시", "24시", "새벽", "22시", "야근", "残業", "overtime"]):
        work_delta = 3.5
    elif any(k in text for k in ["주말 출근", "週末出勤"]):
        work_delta = 4.0

    if any(k in text for k in ["가족", "저녁", "식사", "아내", "남편", "아이", "家族", "夕食", "妻", "子供", "dinner"]):
        if not ("야근" in text or "残業" in text):
            family = True

    if any(k in text for k in ["산책", "러닝", "운동", "취미", "키보드", "散歩", "ランニング", "趣味", "走る", "walk", "jogging"]):
        hobby = 45

    return {
        "expense_delta": float(detected_expense),
        "work_hours_delta": float(work_delta),
        "family_dinner": family,
        "hobby_mins": hobby
    }

def update_user_history_with_action(expense_delta: float = 0.0, work_hours_delta: float = 0.0, family_dinner: bool = False, hobby_mins: int = 0) -> list[DailySnapshot]:
    window = get_user_history_window()
    today_str = datetime.now().strftime("%m-%d")
    if window and window[-1].date == today_str:
        today_item = window[-1]
        today_item.expense_total += expense_delta
        today_item.work_hours = max(today_item.work_hours, 8.0 + work_hours_delta)
        if work_hours_delta > 0:
            today_item.sleep_hours = max(4.0, today_item.sleep_hours - (work_hours_delta * 0.4))
        if family_dinner:
            today_item.family_dinner = True
        if hobby_mins > 0:
            today_item.hobby_minutes += hobby_mins
    else:
        new_snap = DailySnapshot(
            date=today_str,
            expense_total=expense_delta,
            sleep_hours=max(4.0, 7.5 - (work_hours_delta * 0.4 if work_hours_delta > 0 else 0.0)),
            work_hours=8.0 + work_hours_delta,
            family_dinner=family_dinner,
            hobby_minutes=hobby_mins
        )
        window.append(new_snap)
        if len(window) > 7:
            window.pop(0)
    return window

# ─── Presets ────────────────────────────────────────────────
MOCK_DATA_DIR = Path(__file__).parent / "mock_data"
PRESETS_FILE = MOCK_DATA_DIR / "presets.json"


def _load_presets(locale: str = "ja") -> dict:
    if locale == "ja":
        ja_file = MOCK_DATA_DIR / "presets_ja.json"
        if ja_file.exists():
            with open(ja_file, "r", encoding="utf-8") as f:
                return json.load(f)
    if PRESETS_FILE.exists():
        with open(PRESETS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"scenarios": []}


# ─── Request Models ─────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    scenario_id: Optional[str] = None
    raw_input: Optional[str] = None
    micro_deviation: Optional[float] = None
    daily_budget: Optional[float] = 40000.0
    annual_interest: Optional[float] = 0.06
    remaining_years: Optional[int] = 28
    model_name: Optional[str] = "gemini-3.5-flash-lite"
    locale: Optional[str] = "ja"




class UpdateGoalRequest(BaseModel):
    goal_id: str
    updates: Dict[str, Any]


class AiGenerateGoalRequest(BaseModel):
    persona: str = "30대 직장인"


class StatePresetRequest(BaseModel):
    preset_id: str
    locale: Optional[str] = "ja"


class CustomStateRequest(BaseModel):
    budget_drain_pct: Optional[float] = 50.0
    burnout_index: Optional[float] = 30.0
    sleep_debt_hours: Optional[float] = 2.0
    consecutive_overwork_days: Optional[int] = 0
    weekly_hobby_minutes: Optional[int] = 120
    weekly_family_dinners: Optional[int] = 2
    locale: Optional[str] = "ja"


# ─── Startup Event ──────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    mode = "MOCK" if USE_MOCK_FALLBACK else "LIVE"
    logger.info(f"🚀 ChronosLife backend starting in [{mode}] mode")
    logger.info(f"   Context Orchestrator: Ready")
    logger.info(f"   DLP: {'Mock' if privacy_sandbox.use_mock else 'Live'}")
    logger.info(f"   Gemini Council: Live")
    logger.info(f"   Gemini Governor: Live")


# ─── Endpoints ──────────────────────────────────────────────
@app.get("/")
async def health_check():
    """헬스 체크 및 현재 모드 확인"""
    return {
        "status": "ok",
        "service": "ChronosLife",
        "mode": "mock" if USE_MOCK_FALLBACK else "live",
    }


@app.get("/api/presets")
async def get_presets():
    """3가지 데모 시나리오 프리셋 반환"""
    try:
        return _load_presets()
    except Exception as e:
        logger.error(f"Error reading presets: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/models")
async def get_models(refresh: bool = False):
    """
    Google GenAI API로부터 실시간으로 탐색된 Gemini 모델 목록 반환
    """
    try:
        models = model_registry.get_models(force_refresh=refresh)
        return {"models": models}
    except Exception as e:
        logger.error(f"Error reading models: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/goals")
async def get_goals(locale: Optional[str] = "ja"):
    """5대 카테고리 목표 및 헌법 목록 반환"""
    try:
        return {"goals": goal_manager.get_goals(locale=locale or "ja")}
    except Exception as e:
        logger.error(f"Error getting goals: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/goals")
async def update_goal(req: UpdateGoalRequest):
    """특정 목표 갱신"""
    try:
        updated = goal_manager.update_goal(req.goal_id, req.updates)
        return {"status": "ok", "goal": updated}
    except Exception as e:
        logger.error(f"Error updating goal: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/goals/ai-generate")
async def ai_generate_goals(req: AiGenerateGoalRequest):
    """AI를 통한 맞춤형 5대 목표 자동 생성"""
    try:
        goals = goal_manager.ai_generate_goals(req.persona)
        return {"status": "ok", "goals": goals}
    except Exception as e:
        logger.error(f"Error generating goals: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class GoalChatRequest(BaseModel):
    message: str
    history: Optional[list] = None
    model_name: Optional[str] = "gemini-3.5-flash-lite"
    locale: Optional[str] = "ja"


class GoalLiveVoiceRequest(BaseModel):
    voice_transcript: str
    history: Optional[list] = None
    model_name: Optional[str] = "gemini-3.5-flash-lite"
    voice_speed: Optional[float] = 1.0
    locale: Optional[str] = "ja"


@app.post("/api/goals/chat")
async def goal_chat(req: GoalChatRequest):
    """
    AI 인생 헌법 설계관과의 1:1 실시간 대화 인터뷰 엔드포인트.
    사용자의 고민/상황을 듣고 조언하며 5대 목표를 실시간으로 조율합니다.
    """
    try:
        result = await goal_manager.chat_and_refine_goals(
            req.message, 
            req.history, 
            preferred_model=req.model_name,
            locale=req.locale or "ja"
        )
        return {"status": "ok", **result}
    except Exception as e:
        logger.error(f"Error in /api/goals/chat: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/goals/live-voice")
async def goal_live_voice(req: GoalLiveVoiceRequest):
    """
    Gemini Live 실시간 양방향 음성 대화 인터뷰 엔드포인트.
    사용자의 실시간 음성 발화를 받아 Gemini Live 코칭 어조로 자연스럽게 음성 답변을 생성하고,
    5대 인생 헌법 및 목표를 실시간으로 조율하여 업데이트합니다.
    """
    try:
        loc = (req.locale or "ja").lower()
        result = await goal_manager.chat_and_refine_goals(
            req.voice_transcript, 
            req.history, 
            preferred_model=req.model_name,
            locale=loc
        )
        lang_code = "ja-JP" if loc == "ja" else ("en-US" if loc == "en" else "ko-KR")
        return {
            "status": "ok",
            "mode": "gemini-live",
            "voice_reply": result.get("reply", ""),
            "voice_audio_hint": {
                "lang": lang_code,
                "pitch": 1.0,
                "rate": req.voice_speed or 1.05,
                "emotion": "warm_advisory"
            },
            **result
        }
    except Exception as e:
        logger.error(f"Error in /api/goals/live-voice: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/ws/gemini-live")
async def gemini_live_websocket(websocket: WebSocket, locale: Optional[str] = "ja"):
    """
    Google GenAI 공식 Gemini 3.8 Live API WebSocket 세션 엔드포인트.
    client.aio.live.connect 기반 양방향 오디오/텍스트 실시간 스트리밍 및 Tool Calling 헌법 조율.
    """
    await websocket.accept()
    query_locale = websocket.query_params.get("locale") or locale or "ja"
    logger.info(f"🎙️ Gemini 3.8 Live WebSocket client connected. Locale: {query_locale}")
    try:
        await gemini_live_bridge.run_live_session(websocket, goal_manager, locale=query_locale)
    except WebSocketDisconnect:
        logger.info("🎙️ Gemini Live WebSocket client disconnected.")
@app.get("/api/state/current")
async def get_current_life_state(locale: Optional[str] = "ja"):
    """
    사용자의 최근 7일간 누적 라이프 바이탈 상태(Life State Radar)를 조회합니다.
    """
    try:
        history_window = get_user_history_window()
        state_result = state_engine.compute_accumulated_state(
            history_window,
            current_input_expense=0.0,
            current_input_work_hours=0.0,
            locale=locale or "ja"
        )
        return {
            "status": "success",
            "state": state_result,
            "history_window": [
                {
                    "date": d.date,
                    "expense_total": d.expense_total,
                    "sleep_hours": d.sleep_hours,
                    "work_hours": d.work_hours,
                    "family_dinner": d.family_dinner,
                    "hobby_minutes": d.hobby_minutes
                }
                for d in history_window
            ]
        }
    except Exception as e:
        logger.error(f"Error in /api/state/current: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/state/reset")
async def reset_current_life_state(locale: Optional[str] = "ja"):
    """
    라이프 바이탈 상태를 초기 기본 기준값으로 재설정합니다.
    """
    init_user_history_window()
    return await get_current_life_state(locale=locale)


@app.post("/api/state/preset")
async def apply_state_preset(req: StatePresetRequest):
    """
    3가지 핵심 데모 프리셋(burnout, balanced, frugal)을 주간 라이프 히스토리에 즉각 적용합니다.
    """
    try:
        set_preset_history_window(req.preset_id)
        return await get_current_life_state(locale=req.locale)
    except Exception as e:
        logger.error(f"Error applying state preset: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/state/custom")
async def apply_custom_state(req: CustomStateRequest):
    """
    사용자가 슬라이더 등으로 직접 조율한 4대 바이탈 수치를 7일 스냅샷 배열로 즉각 합성/적용합니다.
    """
    try:
        set_custom_history_window(
            budget_drain_pct=req.budget_drain_pct or 50.0,
            burnout_index=req.burnout_index or 30.0,
            sleep_debt_hours=req.sleep_debt_hours or 2.0,
            consecutive_overwork_days=req.consecutive_overwork_days or 0,
            weekly_hobby_minutes=req.weekly_hobby_minutes or 120,
            weekly_family_dinners=req.weekly_family_dinners or 2
        )
        return await get_current_life_state(locale=req.locale)
    except Exception as e:
        logger.error(f"Error applying custom state: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze")
async def analyze(req: AnalyzeRequest):
    """
    메인 분석 오케스트레이션 엔드포인트.
    1. Layer 0 Privacy Sandbox (DLP 원본 비식별화)
    2. Layer 1 Context Orchestrator (안전한 프롬프트 인텐트 분해)
    3. Layer 4 Log-10 (지출 시에만 복리 역전파 실행)
    4. Layer 2 Domain Council (지침에 따른 전문 평가)
    5. Layer 3 Chief Governor (헌법 및 파레토 중재)
    6. Layer 5 Ekispert 처방
    """
    try:
        # ── Live / Custom User Input Mode ──
        if not req.raw_input:
            raise HTTPException(status_code=400, detail="Either scenario_id or raw_input is required")

        # 1. Layer 0: Privacy Sandbox (DLP) - 원본 PII를 가장 먼저 가상 토큰화
        dlp_result = privacy_sandbox.sanitize_user_input(req.raw_input)

        # 2. Layer 1: Context Orchestrator - 비식별화된 안전한 프롬프트로 인텐트 및 지출 여부 판별
        intent_ctx = await orchestrator.analyze(dlp_result["sanitized"], preferred_model=req.model_name or "gemini-3.5-flash-lite", locale=req.locale)

        # 재정 편차 금액 확정: 지출일 때만 deviation으로 반영!
        if intent_ctx.is_financial_expense:
            deviation = req.micro_deviation if req.micro_deviation is not None else intent_ctx.detected_amount
        else:
            deviation = 0.0  # 이직 오퍼 등은 지출이 아님!

        # ── [Stage 1.5] Layer 0.5: Chronos State Dynamics Engine ──
        deltas = extract_vital_deltas_from_input(req.raw_input, deviation)
        history_window = update_user_history_with_action(
            expense_delta=deltas["expense_delta"],
            work_hours_delta=deltas["work_hours_delta"],
            family_dinner=deltas["family_dinner"],
            hobby_mins=deltas["hobby_mins"]
        )
        state_result = state_engine.compute_accumulated_state(
            history_window,
            current_input_expense=deviation if intent_ctx.is_financial_expense else 0.0,
            current_input_work_hours=deltas["work_hours_delta"],
            locale=req.locale or "ja"
        )

        # 3. Log-10 Cascade (수학적 모델 삭제됨)
        user_profile = goal_manager.get_user_profile()
        effective_daily_budget = req.daily_budget if req.daily_budget is not None else user_profile.get("daily_budget", 40000.0)
        user_profile["daily_budget"] = effective_daily_budget
        user_profile["state_dynamics"] = state_result
        
        cascade_dict = {"state_dynamics": state_result}
        cascade_summary = f"복리 시뮬레이션(수학적 모델)은 제외되었습니다.\n[State Dynamics Engine]\n{state_result['context_summary_for_council']}\n이상 징후: {', '.join(state_result['anomaly_triggers']) if state_result['anomaly_triggers'] else '없음'}"

        # 4. Layer 2: Domain Council (각 독립 서브에이전트에게 동적 프로필 주입)
        council_result = await domain_council.evaluate(
            sanitized_input=dlp_result["sanitized"],
            cascade_result=cascade_dict,
            intent_context=intent_ctx,
            user_profile=user_profile,
            preferred_model=req.model_name or "gemini-3.5-flash-lite",
            locale=req.locale
        )

        # 5. Layer 3: Chief Governor (선택 모델 전달)
        governor_result = await chief_governor.arbitrate(
            proposal_title=req.raw_input[:60],
            domain_evaluations=council_result,
            cascade_summary=cascade_summary,
            intent_context=intent_ctx,
            preferred_model=req.model_name or "gemini-3.5-flash-lite",
            locale=req.locale
        )

        # 6. 5대 핵심 목표 영향도 분석 & 시계열 궤적(Temporal Trajectory)
        goal_impacts = goal_manager.evaluate_action_impact(
            raw_input=req.raw_input,
            micro_deviation=deviation,
            council_verdict=council_result,
            locale=req.locale
        )

        composite_trajectory = []
        if goal_impacts and len(goal_impacts) > 0:
            sample_traj = goal_impacts[0].get("temporal_trajectory", [])
            for idx in range(len(sample_traj)):
                tier_info = sample_traj[idx]
                avg_base = int(sum(item["temporal_trajectory"][idx]["baseline"] for item in goal_impacts) / len(goal_impacts))
                avg_proj = int(sum(item["temporal_trajectory"][idx]["projected"] for item in goal_impacts) / len(goal_impacts))
                avg_arb = int(sum(item["temporal_trajectory"][idx].get("arbitrated", item["temporal_trajectory"][idx]["projected"]) for item in goal_impacts) / len(goal_impacts))
                avg_delta = avg_proj - avg_base
                avg_arb_delta = avg_arb - avg_base
                
                narrative = f"원안 강행 시 5대 영역 종합: 기준 {avg_base}점 → 예상 {avg_proj}점 ({avg_delta:+d}%)"
                arbitrated_narrative = f"최고 중재관 타협안 수용 시: 기준 {avg_base}점 → 조정 {avg_arb}점 ({avg_arb_delta:+d}%)"
                if req.locale == "en":
                    narrative = f"Proceeding with original plan (5 core areas): Baseline {avg_base} → Projected {avg_proj} ({avg_delta:+d}%)"
                    arbitrated_narrative = f"Accepting Governor's compromise: Baseline {avg_base} → Adjusted {avg_arb} ({avg_arb_delta:+d}%)"
                elif req.locale == "ja":
                    narrative = f"原案実行時の5大領域総合: 基準 {avg_base}点 → 予想 {avg_proj}点 ({avg_delta:+d}%)"
                    arbitrated_narrative = f"最高仲裁官の妥協案受容時: 基準 {avg_base}点 → 調整 {avg_arb}点 ({avg_arb_delta:+d}%)"

                composite_trajectory.append({
                    "tier": tier_info["tier"],
                    "label": tier_info["label"],
                    "days": tier_info["days"],
                    "scale": tier_info["scale"],
                    "baseline": avg_base,
                    "projected": avg_proj,
                    "arbitrated": avg_arb,
                    "delta": avg_delta,
                    "delta_label": f"{avg_delta:+d}%",
                    "arbitrated_delta": avg_arb_delta,
                    "arbitrated_delta_label": f"{avg_arb_delta:+d}%",
                    "narrative": narrative,
                    "arbitrated_narrative": arbitrated_narrative
                })

        # 8. Log-10 5컷 웹툰 만화 생성 (Multimodal Life Comic)
        comic_data = await comic_engine.generate_5cut_comic(
            raw_input=req.raw_input,
            intent_context=intent_ctx,
            cascade_result=cascade_dict,
            council_verdict=council_result,
            governor_ruling=governor_result,
            preferred_model=req.model_name or "gemini-3.5-flash-lite",
            locale=req.locale
        )

        # 9. Layer 5: Ekispert MCP 마이크로 모빌리티 행동 처방
        ekispert_prescription = None
        has_mobility_trigger = any(
            k in req.raw_input.lower() 
            for k in ["야근", "퇴근", "신주쿠", "스트레스", "지쳐", "残業", "疲れた", "新宿", "overtime", "burnout", "tired", "전철", "지하철"]
        ) or bool(state_result.get("anomaly_triggers"))
        if has_mobility_trigger or req.scenario_id == "scenario_3_burnout_mobility":
            try:
                ekispert_prescription = ekispert_client.generate_healing_walk_prescription(locale=req.locale or "ko")
            except Exception as eke:
                logger.warning(f"Ekispert prescription generation error: {eke}")

        result_payload = {
            "id": "custom_user_query",
            "title": f"사용자 심의 안건: {intent_ctx.intent_label}",
            "description": intent_ctx.amount_description,
            "raw_input": req.raw_input,
            "dlp_sanitized": dlp_result["sanitized"],
            "detected_info_types": dlp_result["detected_info_types"],
            "micro_deviation": deviation,
            "model_used": intent_ctx.model_used,
            "orchestration_trace": {
                "model_used": intent_ctx.model_used,
                "reasoning": intent_ctx.orchestration_reasoning,
                "intent_type": intent_ctx.intent_type,
                "intent_label": intent_ctx.intent_label,
                "amount_description": intent_ctx.amount_description,
                "dispatched_prompts": intent_ctx.domain_prompts
            },
            "intent_context": {
                "intent_type": intent_ctx.intent_type,
                "intent_label": intent_ctx.intent_label,
                "is_financial_expense": intent_ctx.is_financial_expense,
                "amount_description": intent_ctx.amount_description,
            },
            "state_dynamics": state_result,
            "history_window": [
                {
                    "date": d.date,
                    "expense_total": d.expense_total,
                    "sleep_hours": d.sleep_hours,
                    "work_hours": d.work_hours,
                    "family_dinner": d.family_dinner,
                    "hobby_minutes": d.hobby_minutes
                }
                for d in history_window
            ],
            "dlp_result": dlp_result,
            "log10_cascade": cascade_dict,
            "council_verdict": council_result,
            "governor_ruling": governor_result,
            "goal_impacts": goal_impacts,
            "composite_trajectory": composite_trajectory,
            "log10_comic": comic_data,
            "ekispert_prescription": ekispert_prescription,
        }

        # 시계열 히스토리 누적 저장
        try:
            history_manager.save_deliberation(result_payload)
        except Exception as he:
            logger.warning(f"Failed to record deliberation to history: {he}")

        return result_payload

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in /api/analyze: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


class GeneratePanelImageRequest(BaseModel):
    scene_description: str
    panel_number: int = 1


@app.post("/api/governance/comic/generate-panel-image")
async def generate_panel_image(req: GeneratePanelImageRequest):
    """
    Google GenAI gemini-3.1-flash-image 실시간 컷 이미지 생성 엔드포인트.
    (폴백 배제: 실패 시 실제 오류 상태를 투명하게 반환)
    """
    try:
        res = comic_engine.generate_panel_image_with_interactions(
            scene_description=req.scene_description,
            panel_num=req.panel_number,
        )
        return res
    except Exception as e:
        logger.error(f"Error generating panel image: {e}")
        return {
            "status": "error",
            "image_url": None,
            "is_ai_generated": False,
            "message": str(e)
        }


@app.post("/api/analyze/stream")
async def analyze_stream(req: AnalyzeRequest):
    """
    단계별 점진적 실시간 스트리밍 엔드포인트 (SSE - Server-Sent Events).
    사용자가 심의를 요청했을 때 전체 결과를 한 번에 기다리는 것이 아니라,
    각 단계(Layer 0 오케스트레이터 -> Layer 1 & 4 DLP/시계열 역전파 -> Layer 2 카운슬 심의 -> Layer 3 최고 중재관 -> 5대 목표 & 5컷 만화)
    완료 시점마다 실시간으로 이벤트를 스트리밍 방출하여 대시보드 컴포넌트를 순차적으로 즉시 갱신합니다.
    """
    async def event_generator():
        try:
            # ── 0. 프리셋 처리 ──
            if req.scenario_id:
                presets = _load_presets(locale=req.locale or "ja")
                for scenario in presets.get("scenarios", []):
                    if scenario.get("id") == req.scenario_id:
                        deviation = scenario.get("micro_deviation", 0.0)
                        raw_inp = scenario.get("raw_input", "")
                        deltas = extract_vital_deltas_from_input(raw_inp, deviation)
                        history_window = update_user_history_with_action(
                            expense_delta=deltas["expense_delta"],
                            work_hours_delta=deltas["work_hours_delta"],
                            family_dinner=deltas["family_dinner"],
                            hobby_mins=deltas["hobby_mins"]
                        )
                        state_result = state_engine.compute_accumulated_state(
                            history_window,
                            current_input_expense=deviation,
                            current_input_work_hours=deltas["work_hours_delta"],
                            locale=req.locale or "ja"
                        )
                        impacts = goal_manager.evaluate_action_impact(
                            raw_input=raw_inp,
                            micro_deviation=deviation,
                            council_verdict=scenario.get("council_verdict", {}),
                            locale=req.locale
                        )
                        res = dict(scenario)
                        res["goal_impacts"] = impacts
                        res["state_dynamics"] = state_result
                        res["history_window"] = [
                            {
                                "date": d.date,
                                "expense_total": d.expense_total,
                                "sleep_hours": d.sleep_hours,
                                "work_hours": d.work_hours,
                                "family_dinner": d.family_dinner,
                                "hobby_minutes": d.hobby_minutes
                            }
                            for d in history_window
                        ]
                        if req.locale == "ja":
                            intent_label = "💼 キャリアオファー" if scenario.get("id") == "scenario_2_startup_tradeoff" else "💳 衝動的な支出"
                        elif req.locale == "en":
                            intent_label = "💼 Career Offer" if scenario.get("id") == "scenario_2_startup_tradeoff" else "💳 Impulse Spend"
                        else:
                            intent_label = "💼 커리어 오퍼" if scenario.get("id") == "scenario_2_startup_tradeoff" else "💳 충동 지출"
                        res["intent_context"] = {
                            "intent_type": "CAREER_OFFER" if scenario.get("id") == "scenario_2_startup_tradeoff" else "EXPENSE",
                            "intent_label": intent_label,
                            "is_financial_expense": scenario.get("id") != "scenario_2_startup_tradeoff"
                        }
                        res["log10_comic"] = await comic_engine.generate_5cut_comic(
                            raw_input=scenario.get("raw_input", ""),
                            intent_context=type('obj', (object,), res["intent_context"]),
                            cascade_result=scenario.get("log10_cascade"),
                            council_verdict=scenario.get("council_verdict"),
                            governor_ruling=scenario.get("governor_ruling"),
                            preferred_model=req.model_name or "gemini-3.5-flash-lite",
                            locale=req.locale
                        )
                        if scenario.get("id") == "scenario_3_burnout_mobility" or "ekispert_prescription" in res:
                            try:
                                res["ekispert_prescription"] = ekispert_client.generate_healing_walk_prescription(locale=req.locale or "ja")
                            except Exception as eke:
                                logger.warning(f"Failed to generate dynamic ekispert prescription for preset: {eke}")
                        # 즉시 최종 단계 방출
                        yield f"data: {json.dumps({'stage': 'complete', 'data': res}, ensure_ascii=False)}\n\n"
                        return

            if not req.raw_input:
                yield f"data: {json.dumps({'stage': 'error', 'error': 'raw_input is required'}, ensure_ascii=False)}\n\n"
                return

            # ── [Stage 1] Layer 0: Privacy Sandbox (DLP 가상 토큰화) ──
            dlp_result = privacy_sandbox.sanitize_user_input(req.raw_input)
            history_window = get_user_history_window()
            state_result = state_engine.compute_accumulated_state(
                history_window,
                current_input_expense=0.0,
                current_input_work_hours=0.0,
                locale=req.locale or "ja"
            )

            stage_1_data = {
                "dlp_result": dlp_result,
                "dlp_sanitized": dlp_result["sanitized"],
                "detected_info_types": dlp_result["detected_info_types"],
                "raw_input": req.raw_input,
                "state_dynamics": state_result,
                "history_window": [
                    {
                        "date": d.date,
                        "expense_total": d.expense_total,
                        "sleep_hours": d.sleep_hours,
                        "work_hours": d.work_hours,
                        "family_dinner": d.family_dinner,
                        "hobby_minutes": d.hobby_minutes
                    }
                    for d in history_window
                ]
            }
            yield f"data: {json.dumps({'stage': 'dlp', 'stage_index': 1, 'total_stages': 5, 'data': stage_1_data}, ensure_ascii=False)}\n\n"

            # ── [Stage 2] Layer 1: Context Orchestrator (비식별화된 안전한 프롬프트 분석) ──
            intent_ctx = await orchestrator.analyze(dlp_result["sanitized"], preferred_model=req.model_name or "gemini-3.5-flash-lite", locale=req.locale)
            if intent_ctx.is_financial_expense:
                deviation = req.micro_deviation if req.micro_deviation is not None else intent_ctx.detected_amount
            else:
                deviation = 0.0

            deltas = extract_vital_deltas_from_input(req.raw_input, deviation)
            history_window = update_user_history_with_action(
                expense_delta=deltas["expense_delta"],
                work_hours_delta=deltas["work_hours_delta"],
                family_dinner=deltas["family_dinner"],
                hobby_mins=deltas["hobby_mins"]
            )
            state_result = state_engine.compute_accumulated_state(
                history_window,
                current_input_expense=deviation,
                current_input_work_hours=deltas["work_hours_delta"],
                locale=req.locale or "ja"
            )

            user_profile = goal_manager.get_user_profile()
            effective_daily_budget = req.daily_budget if req.daily_budget is not None else user_profile.get("daily_budget", 40000.0)
            user_profile["daily_budget"] = effective_daily_budget
            user_profile["state_dynamics"] = state_result

            cascade_dict = {"state_dynamics": state_result}
            cascade_summary = f"복리 시뮬레이션(수학적 모델)은 제외되었습니다.\n[State Dynamics Engine]\n{state_result['context_summary_for_council']}\n이상 징후: {', '.join(state_result['anomaly_triggers']) if state_result['anomaly_triggers'] else '없음'}"

            stage_2_data = {
                "orchestration_trace": {
                    "model_used": intent_ctx.model_used,
                    "reasoning": intent_ctx.orchestration_reasoning,
                    "intent_type": intent_ctx.intent_type,
                    "intent_label": intent_ctx.intent_label,
                    "amount_description": intent_ctx.amount_description,
                    "dispatched_prompts": intent_ctx.domain_prompts,
                },
                "intent_context": {
                    "intent_type": intent_ctx.intent_type,
                    "intent_label": intent_ctx.intent_label,
                    "is_financial_expense": intent_ctx.is_financial_expense,
                    "amount_description": intent_ctx.amount_description,
                },
                "state_dynamics": state_result,
                "history_window": [
                    {
                        "date": d.date,
                        "expense_total": d.expense_total,
                        "sleep_hours": d.sleep_hours,
                        "work_hours": d.work_hours,
                        "family_dinner": d.family_dinner,
                        "hobby_minutes": d.hobby_minutes
                    }
                    for d in history_window
                ],
                "micro_deviation": deviation,
                "model_used": intent_ctx.model_used,
                "title": f"사용자 심의 안건: {intent_ctx.intent_label}",
                "description": intent_ctx.amount_description,
                "log10_cascade": cascade_dict,
                "cascade_summary": cascade_summary,
            }
            yield f"data: {json.dumps({'stage': 'orchestrator', 'stage_index': 2, 'total_stages': 5, 'data': stage_2_data}, ensure_ascii=False)}\n\n"

            # ── [Stage 3] Layer 2: Domain Council (3대 독립 서브에이전트) ──
            council_result = await domain_council.evaluate(
                sanitized_input=dlp_result["sanitized"],
                cascade_result=cascade_dict,
                intent_context=intent_ctx,
                user_profile=user_profile,
                preferred_model=req.model_name or "gemini-3.5-flash-lite",
                locale=req.locale
            )
            stage_3_data = {
                "council_verdict": council_result,
            }
            yield f"data: {json.dumps({'stage': 'council', 'stage_index': 3, 'total_stages': 5, 'data': stage_3_data}, ensure_ascii=False)}\n\n"

            # ── [Stage 4] Layer 3: Chief Governor (최고 중재관 판결) ──
            governor_result = await chief_governor.arbitrate(
                proposal_title=req.raw_input[:60],
                domain_evaluations=council_result,
                cascade_summary=cascade_summary,
                intent_context=intent_ctx,
                preferred_model=req.model_name or "gemini-3.5-flash-lite",
                locale=req.locale
            )
            stage_4_data = {
                "governor_ruling": governor_result,
            }
            yield f"data: {json.dumps({'stage': 'governor', 'stage_index': 4, 'total_stages': 5, 'data': stage_4_data}, ensure_ascii=False)}\n\n"

            # ── [Stage 5] 5대 핵심 목표 궤적 & 5컷 만화 & Ekispert ──
            goal_impacts = goal_manager.evaluate_action_impact(
                raw_input=req.raw_input,
                micro_deviation=deviation,
                council_verdict=council_result,
                locale=req.locale
            )
            composite_trajectory = []
            if goal_impacts and len(goal_impacts) > 0:
                sample_traj = goal_impacts[0].get("temporal_trajectory", [])
                for idx in range(len(sample_traj)):
                    tier_info = sample_traj[idx]
                    avg_base = int(sum(item["temporal_trajectory"][idx]["baseline"] for item in goal_impacts) / len(goal_impacts))
                    avg_proj = int(sum(item["temporal_trajectory"][idx]["projected"] for item in goal_impacts) / len(goal_impacts))
                    avg_arb = int(sum(item["temporal_trajectory"][idx].get("arbitrated", item["temporal_trajectory"][idx]["projected"]) for item in goal_impacts) / len(goal_impacts))
                    avg_delta = avg_proj - avg_base
                    avg_arb_delta = avg_arb - avg_base
                    
                    narrative = f"원안 강행 시 5대 영역 종합: 기준 {avg_base}점 → 예상 {avg_proj}점 ({avg_delta:+d}%)"
                    arbitrated_narrative = f"최고 중재관 타협안 수용 시: 기준 {avg_base}점 → 조정 {avg_arb}점 ({avg_arb_delta:+d}%)"
                    if req.locale == "en":
                        narrative = f"Proceeding with original plan (5 core areas): Baseline {avg_base} → Projected {avg_proj} ({avg_delta:+d}%)"
                        arbitrated_narrative = f"Accepting Governor's compromise: Baseline {avg_base} → Adjusted {avg_arb} ({avg_arb_delta:+d}%)"
                    elif req.locale == "ja":
                        narrative = f"原案実行時の5大領域総合: 基準 {avg_base}点 → 予想 {avg_proj}点 ({avg_delta:+d}%)"
                        arbitrated_narrative = f"最高仲裁官の妥協案受容時: 基準 {avg_base}点 → 調整 {avg_arb}点 ({avg_arb_delta:+d}%)"

                    composite_trajectory.append({
                        "tier": tier_info["tier"],
                        "label": tier_info["label"],
                        "days": tier_info["days"],
                        "scale": tier_info["scale"],
                        "baseline": avg_base,
                        "projected": avg_proj,
                        "arbitrated": avg_arb,
                        "delta": avg_delta,
                        "delta_label": f"{avg_delta:+d}%",
                        "arbitrated_delta": avg_arb_delta,
                        "arbitrated_delta_label": f"{avg_arb_delta:+d}%",
                        "narrative": narrative,
                        "arbitrated_narrative": arbitrated_narrative
                    })

            # Layer 5: Ekispert MCP 마이크로 모빌리티 행동 처방
            ekispert_data = None
            has_mobility_trigger = any(
                k in req.raw_input.lower() 
                for k in ["야근", "퇴근", "신주쿠", "스트레스", "지쳐", "残業", "疲れた", "新宿", "overtime", "burnout", "tired", "전철", "지하철"]
            ) or bool(state_result.get("anomaly_triggers"))
            if has_mobility_trigger or req.scenario_id == "scenario_3_burnout_mobility":
                try:
                    ekispert_data = ekispert_client.generate_healing_walk_prescription(locale=req.locale or "ko")
                except Exception as eke:
                    logger.warning(f"Ekispert prescription generation error in stream: {eke}")

            comic_data = await comic_engine.generate_5cut_comic(
                raw_input=req.raw_input,
                intent_context=intent_ctx,
                cascade_result=cascade_dict,
                council_verdict=council_result,
                governor_ruling=governor_result,
                preferred_model=req.model_name or "gemini-3.5-flash-lite",
                locale=req.locale
            )

            stage_5_data = {
                "goal_impacts": goal_impacts,
                "composite_trajectory": composite_trajectory,
                "log10_comic": comic_data,
                "ekispert_prescription": ekispert_data,
            }
            yield f"data: {json.dumps({'stage': 'trajectory_and_comic', 'stage_index': 5, 'total_stages': 5, 'data': stage_5_data}, ensure_ascii=False)}\n\n"

            # ── 최종 종합 완성 이벤트 ──
            complete_payload = {
                **stage_1_data,
                **stage_2_data,
                **stage_3_data,
                **stage_4_data,
                **stage_5_data,
            }

            # 시계열 히스토리에 자동 누적 기록
            try:
                history_manager.save_deliberation(complete_payload)
            except Exception as he:
                logger.warning(f"Failed to record stream deliberation to history: {he}")

            yield f"data: {json.dumps({'stage': 'complete', 'data': complete_payload}, ensure_ascii=False)}\n\n"

        except Exception as e:
            logger.error(f"Error in analyze_stream: {e}", exc_info=True)
            yield f"data: {json.dumps({'stage': 'error', 'error': str(e)}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


# ─── 히스토리 관리 엔드포인트 (Historical Deliberation Records) ────────────

@app.get("/api/history")
async def get_deliberation_history(limit: int = 50):
    """누적된 모든 라이프 거버넌스 심의 기록 조회"""
    try:
        records = history_manager.get_history(limit=limit)
        return {"history": records, "count": len(records)}
    except Exception as e:
        logger.error(f"Error getting history: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/history/{record_id}")
async def get_deliberation_record(record_id: str):
    """특정 심의 건 상세 조회"""
    record = history_manager.get_record(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="History record not found")
    return record


@app.delete("/api/history/{record_id}")
async def delete_deliberation_record(record_id: str):
    """특정 심의 건 삭제"""
    deleted = history_manager.delete_record(record_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="History record not found")
    return {"status": "ok", "message": "Record deleted"}


@app.delete("/api/history")
async def clear_all_history():
    """모든 히스토리 초기화"""
    history_manager.clear_history()
    return {"status": "ok", "message": "All history cleared"}


# ─── 개발자용 API & LLM 실시간 인스펙터 로그 엔드포인트 ──────────────────

@app.get("/api/dev/logs")
async def get_developer_logs(limit: int = 50):
    """개발자용 API 요청/응답(Input/Output) 및 LLM 호출 로그 조회"""
    try:
        return dev_log_store.get_logs(limit=limit)
    except Exception as e:
        logger.error(f"Error fetching dev logs: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/dev/logs")
async def clear_developer_logs():
    """개발자용 로그 버퍼 및 파일 초기화"""
    try:
        dev_log_store.clear()
        return {"status": "ok", "message": "Developer logs cleared"}
    except Exception as e:
        logger.error(f"Error clearing dev logs: {e}", exc_info=True)
# ─── Ekispert MCP (Model Context Protocol) 엔드포인트 ───────────────

class EkispertMcpCallRequest(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]


@app.get("/api/ekispert/manifest")
async def get_ekispert_mcp_manifest():
    """Ekispert MCP 도구 매니페스트 반환"""
    return {"tools": MCP_TOOLS_MANIFEST}


@app.post("/api/ekispert/call")
async def call_ekispert_mcp(req: EkispertMcpCallRequest):
    """Ekispert MCP 도구 호출 실행"""
    try:
        result = handle_mcp_call(req.tool_name, req.arguments)
        return result
    except Exception as e:
        logger.error(f"Error calling Ekispert MCP tool {req.tool_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/ekispert/prescription")
async def get_healing_prescription(origin: str = "신주쿠", destination: str = "오모테산도", locale: str = "ja"):
    """Ekispert 실시간 녹지 도보 환승 처방 카드 즉시 생성 (Live API 연동)"""
    try:
        prescription = ekispert_client.generate_healing_walk_prescription(
            origin=origin,
            destination=destination,
            locale=locale
        )
        return {"status": "ok", "prescription": prescription}
    except Exception as e:
        logger.error(f"Error generating Ekispert prescription: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    from config import PORT
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
