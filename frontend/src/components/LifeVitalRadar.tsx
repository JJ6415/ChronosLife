'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { 
  Activity, 
  Flame, 
  Wallet, 
  Moon, 
  Palette, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Sparkles,
  Sliders,
  RotateCcw,
  Check,
  Zap,
  HeartHandshake
} from 'lucide-react';

export interface VitalHistoryItem {
  date: string;
  expense_total: number;
  sleep_hours: number;
  work_hours: number;
  family_dinner: boolean;
  hobby_minutes: number;
}

export interface VitalMetrics {
  budget_drain_pct: number;
  burnout_index: number;
  sleep_debt_hours: number;
  consecutive_overwork_days: number;
  weekly_hobby_minutes: number;
  weekly_family_dinners: number;
}

export interface LifeStateData {
  metrics: VitalMetrics;
  anomaly_triggers: string[];
  context_summary_for_council: string;
}

export interface LifeVitalRadarProps {
  stateData?: LifeStateData | null;
  historyWindow?: VitalHistoryItem[];
  isUpdating?: boolean;
}

export default function LifeVitalRadar({
  stateData: propStateData,
  historyWindow: propHistory,
  isUpdating = false
}: LifeVitalRadarProps = {}) {
  const t = useTranslations('LifeVitalRadar');
  const locale = useLocale();
  const [internalState, setInternalState] = useState<LifeStateData | null>(null);
  const [internalHistory, setInternalHistory] = useState<VitalHistoryItem[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLiveUpdate, setHasLiveUpdate] = useState(false);

  // 프리셋 및 수동 직접 수정 인터랙션 상태
  const [activePreset, setActivePreset] = useState<'burnout' | 'balanced' | 'frugal' | 'baseline' | 'custom' | null>('baseline');
  const [isManualTuningOpen, setIsManualTuningOpen] = useState(false);
  const [customSliders, setCustomSliders] = useState({
    budget_drain_pct: 87.5,
    burnout_index: 78.0,
    sleep_debt_hours: 6.5,
    consecutive_overwork_days: 3,
    weekly_hobby_minutes: 90,
    weekly_family_dinners: 1
  });

  // 대화 및 심의 이벤트로부터 최신 라이프 상태 유입 시 즉각 동기화
  useEffect(() => {
    if (propStateData) {
      setInternalState(propStateData);
      setHasLiveUpdate(true);
      if (propStateData.metrics) {
        setCustomSliders({
          budget_drain_pct: propStateData.metrics.budget_drain_pct,
          burnout_index: propStateData.metrics.burnout_index <= 1.0 
            ? Math.round(propStateData.metrics.burnout_index * 100) 
            : propStateData.metrics.burnout_index,
          sleep_debt_hours: propStateData.metrics.sleep_debt_hours,
          consecutive_overwork_days: propStateData.metrics.consecutive_overwork_days,
          weekly_hobby_minutes: propStateData.metrics.weekly_hobby_minutes,
          weekly_family_dinners: propStateData.metrics.weekly_family_dinners
        });
      }
    }
  }, [propStateData]);

  useEffect(() => {
    if (propHistory && propHistory.length > 0) {
      setInternalHistory(propHistory);
    }
  }, [propHistory]);

  const fetchCurrentState = async (forceReset = false) => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const endpoint = forceReset 
        ? `${apiUrl}/api/state/reset?locale=${locale}` 
        : `${apiUrl}/api/state/current?locale=${locale}`;
      const method = forceReset ? 'POST' : 'GET';
      const res = await fetch(endpoint, { method });
      if (res.ok) {
        const json = await res.json();
        if (json.state) {
          setInternalState(json.state);
          if (json.state.metrics) {
            setCustomSliders({
              budget_drain_pct: json.state.metrics.budget_drain_pct,
              burnout_index: json.state.metrics.burnout_index <= 1.0 
                ? Math.round(json.state.metrics.burnout_index * 100) 
                : json.state.metrics.burnout_index,
              sleep_debt_hours: json.state.metrics.sleep_debt_hours,
              consecutive_overwork_days: json.state.metrics.consecutive_overwork_days,
              weekly_hobby_minutes: json.state.metrics.weekly_hobby_minutes,
              weekly_family_dinners: json.state.metrics.weekly_family_dinners
            });
          }
        }
        if (json.history_window) {
          setInternalHistory(json.history_window);
        }
        if (forceReset) {
          setActivePreset('baseline');
          setIsManualTuningOpen(false);
          setHasLiveUpdate(false);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch /api/state/current:', e);
      if (!internalState) {
        setInternalState({
          metrics: {
            budget_drain_pct: 87.5,
            burnout_index: 78.0,
            sleep_debt_hours: 6.5,
            consecutive_overwork_days: 3,
            weekly_hobby_minutes: 90,
            weekly_family_dinners: 1
          },
          anomaly_triggers: ["CRITICAL_BURNOUT_ACCUMULATED", "WEEKLY_BUDGET_ALMOST_EXHAUSTED", "CONSECUTIVE_OVERWORK_TIRED_BRAIN"],
          context_summary_for_council: "최근 7일간 누적 분석: 주간 예산 소진율 87.5%, 수면 부채 6.5시간, 번아웃 지수 78.0 (연속 고강도 근무 3일째)."
        });
        setInternalHistory([
          { date: '09-28', expense_total: 12000, sleep_hours: 7.5, work_hours: 8.0, family_dinner: true, hobby_minutes: 60 },
          { date: '09-29', expense_total: 25000, sleep_hours: 7.0, work_hours: 8.5, family_dinner: false, hobby_minutes: 30 },
          { date: '09-30', expense_total: 18000, sleep_hours: 6.5, work_hours: 9.0, family_dinner: false, hobby_minutes: 0 },
          { date: '10-01', expense_total: 45000, sleep_hours: 6.0, work_hours: 10.5, family_dinner: false, hobby_minutes: 0 },
          { date: '10-02', expense_total: 35000, sleep_hours: 5.5, work_hours: 11.0, family_dinner: false, hobby_minutes: 0 },
          { date: '10-03', expense_total: 60000, sleep_hours: 5.0, work_hours: 12.0, family_dinner: false, hobby_minutes: 0 },
          { date: '10-04', expense_total: 50000, sleep_hours: 5.2, work_hours: 11.5, family_dinner: false, hobby_minutes: 0 }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 1. 프리셋 적용 핸들러
  const handleApplyPreset = async (presetId: 'burnout' | 'balanced' | 'frugal') => {
    setIsLoading(true);
    setActivePreset(presetId);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await fetch(`${apiUrl}/api/state/preset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset_id: presetId, locale })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.state) {
          setInternalState(json.state);
          if (json.state.metrics) {
            setCustomSliders({
              budget_drain_pct: json.state.metrics.budget_drain_pct,
              burnout_index: json.state.metrics.burnout_index <= 1.0 
                ? Math.round(json.state.metrics.burnout_index * 100) 
                : json.state.metrics.burnout_index,
              sleep_debt_hours: json.state.metrics.sleep_debt_hours,
              consecutive_overwork_days: json.state.metrics.consecutive_overwork_days,
              weekly_hobby_minutes: json.state.metrics.weekly_hobby_minutes,
              weekly_family_dinners: json.state.metrics.weekly_family_dinners
            });
          }
        }
        if (json.history_window) {
          setInternalHistory(json.history_window);
        }
        setHasLiveUpdate(true);
      }
    } catch (e) {
      console.warn('Failed to apply preset:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 수동 슬라이더 변경 적용 핸들러
  const handleApplyCustomState = async () => {
    setIsLoading(true);
    setActivePreset('custom');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await fetch(`${apiUrl}/api/state/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...customSliders,
          locale
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.state) {
          setInternalState(json.state);
        }
        if (json.history_window) {
          setInternalHistory(json.history_window);
        }
        setHasLiveUpdate(true);
      }
    } catch (e) {
      console.warn('Failed to apply custom state:', e);
      // 오프라인 클라이언트 즉시 반영
      setInternalState(prev => prev ? ({
        ...prev,
        metrics: {
          ...prev.metrics,
          ...customSliders
        }
      }) : null);
      setHasLiveUpdate(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 초기화 핸들러
  const handleResetToBaseline = async () => {
    await fetchCurrentState(true);
  };

  useEffect(() => {
    if (!propStateData) {
      fetchCurrentState();
    }
  }, [locale]);

  const activeState = propStateData || internalState;
  const activeHistory = (propHistory && propHistory.length > 0) ? propHistory : internalHistory;

  if (!activeState) return null;

  const m = activeState.metrics;
  const burnoutScore = m.burnout_index <= 1.0 ? Math.round(m.burnout_index * 100) : Math.round(m.burnout_index);
  const isBurnoutSevere = burnoutScore >= 70;
  const isBudgetDrained = m.budget_drain_pct >= 80;

  return (
    <div className={`glass-panel border bg-slate-900/90 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 ${
      hasLiveUpdate ? 'border-emerald-500/40 ring-1 ring-emerald-500/20' : 'border-slate-700/60'
    }`}>
      {/* ── 1. 레이더 상단 헤더 ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-5 py-3.5 bg-slate-800/60 border-b border-slate-700/50 gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              hasLiveUpdate ? 'bg-emerald-400' : 'bg-indigo-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${
              hasLiveUpdate ? 'bg-emerald-500' : 'bg-indigo-500'
            }`}></span>
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>{t('title')}</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/80 text-slate-300 font-mono hidden sm:inline">
              {t('subtitle')}
            </span>
            {hasLiveUpdate && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>{t('liveUpdatedBadge')}</span>
              </span>
            )}
            {isUpdating && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold flex items-center gap-1 animate-pulse">
                <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" />
                <span>{t('updatingBadge')}</span>
              </span>
            )}
          </div>
        </div>

        {/* ── 2. 프리셋 3개 버튼 & 직접 수정 & 초기화 툴바 ── */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* 프리셋 1: 번아웃 위기 */}
          <button
            type="button"
            onClick={() => handleApplyPreset('burnout')}
            disabled={isLoading || isUpdating}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95 border ${
              activePreset === 'burnout'
                ? 'bg-rose-600/90 text-white border-rose-400 shadow-rose-900/40 ring-1 ring-rose-400/50'
                : 'bg-slate-800/80 hover:bg-rose-950/40 text-rose-300 border-rose-500/30 hover:border-rose-400/60'
            }`}
            title="4일 연속 12시간 야근, 수면 부족 7.5h, 번아웃 88% 위기 프리셋"
          >
            <span>{t('presetBurnout')}</span>
          </button>

          {/* 프리셋 2: 황금 밸런스 */}
          <button
            type="button"
            onClick={() => handleApplyPreset('balanced')}
            disabled={isLoading || isUpdating}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95 border ${
              activePreset === 'balanced'
                ? 'bg-emerald-600/90 text-white border-emerald-400 shadow-emerald-900/40 ring-1 ring-emerald-400/50'
                : 'bg-slate-800/80 hover:bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:border-emerald-400/60'
            }`}
            title="수면 7.5h 정상, 8시간 근무 준수, 취미 4시간, 가족 식사 4회 안정 프리셋"
          >
            <span>{t('presetBalanced')}</span>
          </button>

          {/* 프리셋 3: 극한의 절약 */}
          <button
            type="button"
            onClick={() => handleApplyPreset('frugal')}
            disabled={isLoading || isUpdating}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95 border ${
              activePreset === 'frugal'
                ? 'bg-amber-600/90 text-white border-amber-400 shadow-amber-900/40 ring-1 ring-amber-400/50'
                : 'bg-slate-800/80 hover:bg-amber-950/40 text-amber-300 border-amber-500/30 hover:border-amber-400/60'
            }`}
            title="일일 지출 최소 통제, 예산 소진 18%, 복리 방어 극대화 프리셋"
          >
            <span>{t('presetFrugal')}</span>
          </button>

          {/* 직접 수정 토글 버튼 */}
          <button
            type="button"
            onClick={() => setIsManualTuningOpen(!isManualTuningOpen)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95 border ${
              isManualTuningOpen
                ? 'bg-purple-600 text-white border-purple-400 ring-1 ring-purple-400/50'
                : 'bg-slate-800/80 hover:bg-purple-950/40 text-purple-300 border-purple-500/30 hover:border-purple-400/60'
            }`}
            title={t('manualTuningGuide')}
          >
            <Sliders className="w-3 h-3 text-purple-300" />
            <span>{t('btnManualTuning')}</span>
          </button>

          {/* 초기화 버튼 */}
          <button
            type="button"
            onClick={handleResetToBaseline}
            disabled={isLoading || isUpdating}
            className="px-2 py-1 rounded-lg text-[11px] font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600/60"
            title={t('refreshVital')}
          >
            <RotateCcw className={`w-3 h-3 ${isLoading ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
            <span>{t('btnReset')}</span>
          </button>

          {/* 접기/펼치기 토글 */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-all text-xs font-semibold"
            title={isCollapsed ? t('expand') : t('collapse')}
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── 3. 직접 수정 슬라이더 드로어 (Manual Tuning Panel) ── */}
      {isManualTuningOpen && !isCollapsed && (
        <div className="px-5 py-4 bg-purple-950/20 border-b border-purple-500/30 space-y-3.5 animate-fade-in backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>{t('manualTuningGuide')}</span>
            </div>
            <button
              type="button"
              onClick={handleApplyCustomState}
              disabled={isLoading}
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-900/50 flex items-center gap-1.5 active:scale-95 transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{t('applyAndSync')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1 text-xs">
            {/* 슬라이더 1: 주간 예산 소진율 */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-300 font-medium">
                <span className="flex items-center gap-1 text-amber-300">
                  <Wallet className="w-3.5 h-3.5" /> {t('sliderBudgetDrain')}
                </span>
                <strong className="font-mono text-amber-300">{customSliders.budget_drain_pct}%</strong>
              </div>
              <input
                type="range"
                min="5"
                max="150"
                step="1"
                value={customSliders.budget_drain_pct}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCustomSliders(prev => ({ ...prev, budget_drain_pct: val }));
                  setInternalState(prev => prev ? ({ ...prev, metrics: { ...prev.metrics, budget_drain_pct: val } }) : null);
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* 슬라이더 2: 번아웃 지수 */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-300 font-medium">
                <span className="flex items-center gap-1 text-rose-300">
                  <Flame className="w-3.5 h-3.5" /> {t('sliderBurnout')}
                </span>
                <strong className="font-mono text-rose-300">{customSliders.burnout_index} / 100</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={customSliders.burnout_index}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCustomSliders(prev => ({ ...prev, burnout_index: val }));
                  setInternalState(prev => prev ? ({ ...prev, metrics: { ...prev.metrics, burnout_index: val } }) : null);
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            {/* 슬라이더 3: 수면 부채 */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-300 font-medium">
                <span className="flex items-center gap-1 text-blue-300">
                  <Moon className="w-3.5 h-3.5" /> {t('sliderSleepDebt')}
                </span>
                <strong className="font-mono text-blue-300">{customSliders.sleep_debt_hours}h</strong>
              </div>
              <input
                type="range"
                min="0"
                max="14"
                step="0.5"
                value={customSliders.sleep_debt_hours}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCustomSliders(prev => ({ ...prev, sleep_debt_hours: val }));
                  setInternalState(prev => prev ? ({ ...prev, metrics: { ...prev.metrics, sleep_debt_hours: val } }) : null);
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
              />
            </div>

            {/* 슬라이더 4: 연속 야근 일수 */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-300 font-medium">
                <span className="flex items-center gap-1 text-purple-300">
                  <Zap className="w-3.5 h-3.5" /> {t('sliderOverworkDays')}
                </span>
                <strong className="font-mono text-purple-300">{customSliders.consecutive_overwork_days}일</strong>
              </div>
              <input
                type="range"
                min="0"
                max="7"
                step="1"
                value={customSliders.consecutive_overwork_days}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setCustomSliders(prev => ({ ...prev, consecutive_overwork_days: val }));
                  setInternalState(prev => prev ? ({ ...prev, metrics: { ...prev.metrics, consecutive_overwork_days: val } }) : null);
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>

            {/* 슬라이더 5: 주간 취미 시간 */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-300 font-medium">
                <span className="flex items-center gap-1 text-teal-300">
                  <Palette className="w-3.5 h-3.5" /> {t('sliderHobbyHours')}
                </span>
                <strong className="font-mono text-teal-300">{(customSliders.weekly_hobby_minutes / 60).toFixed(1)}h / 4h</strong>
              </div>
              <input
                type="range"
                min="0"
                max="480"
                step="30"
                value={customSliders.weekly_hobby_minutes}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setCustomSliders(prev => ({ ...prev, weekly_hobby_minutes: val }));
                  setInternalState(prev => prev ? ({ ...prev, metrics: { ...prev.metrics, weekly_hobby_minutes: val } }) : null);
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>

            {/* 슬라이더 6: 가족과의 식사 */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-300 font-medium">
                <span className="flex items-center gap-1 text-pink-300">
                  <HeartHandshake className="w-3.5 h-3.5" /> {t('sliderFamilyDinners')}
                </span>
                <strong className="font-mono text-pink-300">{customSliders.weekly_family_dinners}회 / 주</strong>
              </div>
              <input
                type="range"
                min="0"
                max="7"
                step="1"
                value={customSliders.weekly_family_dinners}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setCustomSliders(prev => ({ ...prev, weekly_family_dinners: val }));
                  setInternalState(prev => prev ? ({ ...prev, metrics: { ...prev.metrics, weekly_family_dinners: val } }) : null);
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 4. 접혔을 때의 1줄 요약 바 (Ultra Compact) ── */}
      {isCollapsed && (
        <div className="px-5 py-2.5 flex items-center justify-between text-xs text-slate-300 bg-slate-900/60 flex-wrap gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              {t('burnoutLabel')} <strong className="text-rose-300">{burnoutScore}{t('scoreUnit')}</strong> ({m.consecutive_overwork_days}{t('daysConsecutiveOverwork')})
            </span>
            <span className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
              {t('budgetDrainLabel')} <strong className="text-amber-300">{m.budget_drain_pct}%</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-blue-400" />
              {t('sleepDebtLabel')} <strong className="text-blue-300">{m.sleep_debt_hours}{t('hoursUnit')}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-purple-400" />
              {t('hobbyLabel')} <strong className="text-purple-300">{(m.weekly_hobby_minutes / 60).toFixed(1)}/4{t('hoursUnit')}</strong>
            </span>
          </div>
          {isBurnoutSevere && (
            <span className="text-[11px] text-rose-400 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {t('willpowerDepletionWarning')}
            </span>
          )}
        </div>
      )}

      {/* ── 5. 펼쳐졌을 때의 4대 바이탈 카드 & 마이크로 스파크라인 그리드 ── */}
      {!isCollapsed && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* 카드 1: 번아웃 지수 */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              isBurnoutSevere 
                ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/20' 
                : 'bg-slate-800/40 border-slate-700/60'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-400" /> {t('burnoutIndex')}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  isBurnoutSevere ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-700 text-slate-300'
                }`}>
                  {isBurnoutSevere ? t('statusDanger') : t('statusGood')}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-xl sm:text-2xl font-black text-white font-mono">{burnoutScore}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2 truncate">
                {t('consecutiveOverwork')} <strong className="text-slate-200">{m.consecutive_overwork_days}{t('days')}</strong>
              </p>
              {/* 스파크라인: 7일 근무시간 / 스트레스 강도 */}
              <div className="h-7 flex items-end gap-1 pt-1 border-t border-slate-700/40">
                {activeHistory.map((h, i) => {
                  const barH = Math.min(100, Math.max(15, (h.work_hours / 12) * 100));
                  const isHigh = h.work_hours >= 10;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative">
                      <div 
                        style={{ height: `${barH}%` }}
                        className={`w-full rounded-sm transition-all ${
                          isHigh ? 'bg-rose-500 group-hover:bg-rose-400' : 'bg-slate-600 group-hover:bg-slate-500'
                        }`}
                      />
                      <span className="text-[8px] text-slate-500 mt-0.5">{h.date.slice(-2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 카드 2: 주간 예산 소진율 */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              isBudgetDrained 
                ? 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-950/20' 
                : 'bg-slate-800/40 border-slate-700/60'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-amber-400" /> {t('weeklyBudgetDrain')}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  isBudgetDrained ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-700 text-slate-300'
                }`}>
                  {isBudgetDrained ? t('statusCritical') : t('statusNormal')}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-xl sm:text-2xl font-black text-white font-mono">{m.budget_drain_pct}%</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2 truncate">
                {t('budgetAccelerated')}
              </p>
              {/* 스파크라인: 7일 지출 금액 */}
              <div className="h-7 flex items-end gap-1 pt-1 border-t border-slate-700/40">
                {activeHistory.map((h, i) => {
                  const maxExp = 60000;
                  const barH = Math.min(100, Math.max(15, (h.expense_total / maxExp) * 100));
                  const isHigh = h.expense_total >= 40000;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative">
                      <div 
                        style={{ height: `${barH}%` }}
                        className={`w-full rounded-sm transition-all ${
                          isHigh ? 'bg-amber-500 group-hover:bg-amber-400' : 'bg-slate-600 group-hover:bg-slate-500'
                        }`}
                      />
                      <span className="text-[8px] text-slate-500 mt-0.5">{h.date.slice(-2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 카드 3: 수면 부채 누적 */}
            <div className="p-3.5 rounded-xl border bg-slate-800/40 border-slate-700/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5 text-blue-400" /> {t('sleepDebt')}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {m.sleep_debt_hours > 5 ? t('statusWarning') : t('statusNormalSleep')}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-xl sm:text-2xl font-black text-white font-mono">{m.sleep_debt_hours}</span>
                <span className="text-xs text-slate-400">{t('hoursAccumulated')}</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2 truncate">
                {t('sleepDeficitDesc')}
              </p>
              {/* 스파크라인: 7일 수면 시간 */}
              <div className="h-7 flex items-end gap-1 pt-1 border-t border-slate-700/40">
                {activeHistory.map((h, i) => {
                  const barH = Math.min(100, Math.max(15, (h.sleep_hours / 8.0) * 100));
                  const isShort = h.sleep_hours < 6.0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative">
                      <div 
                        style={{ height: `${barH}%` }}
                        className={`w-full rounded-sm transition-all ${
                          isShort ? 'bg-rose-400 group-hover:bg-rose-300' : 'bg-indigo-400 group-hover:bg-indigo-300'
                        }`}
                      />
                      <span className="text-[8px] text-slate-500 mt-0.5">{h.date.slice(-2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 카드 4: 주간 취미 쿼터 */}
            <div className="p-3.5 rounded-xl border bg-slate-800/40 border-slate-700/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-purple-400" /> {t('weeklyHobbyQuota')}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {m.weekly_hobby_minutes < 120 ? t('statusLacking') : t('statusAchieved')}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-xl sm:text-2xl font-black text-white font-mono">{(m.weekly_hobby_minutes / 60).toFixed(1)}</span>
                <span className="text-xs text-slate-400">/ 4.0{t('hoursUnitFull')}</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2 truncate">
                {t('familyDinner')} <strong className="text-slate-200">{m.weekly_family_dinners}{t('timesUnit')}</strong>
              </p>
              {/* 스파크라인: 7일 취미 시간 (분) */}
              <div className="h-7 flex items-end gap-1 pt-1 border-t border-slate-700/40">
                {activeHistory.map((h, i) => {
                  const barH = Math.min(100, Math.max(15, (h.hobby_minutes / 60) * 100));
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative">
                      <div 
                        style={{ height: `${barH}%` }}
                        className="w-full rounded-sm bg-purple-500 group-hover:bg-purple-400 transition-all"
                      />
                      <span className="text-[8px] text-slate-500 mt-0.5">{h.date.slice(-2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── 6. 사전 의지력 고갈 위험 거버넌스 경고 배너 ── */}
          {isBurnoutSevere && (
            <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-purple-950/30 border border-rose-500/40 text-xs sm:text-sm text-slate-200 flex items-start gap-2.5 shadow-lg shadow-rose-950/20">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-rose-300 font-bold block sm:inline sm:mr-2">
                  {t('lifeguardWarningTitle')}
                </strong>
                <span>
                  {t('lifeguardWarning1', { days: m.consecutive_overwork_days, hours: m.sleep_debt_hours })}
                  <strong className="text-amber-300">{t('lifeguardWarningHighlight')}</strong>
                  {t('lifeguardWarning2')}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
