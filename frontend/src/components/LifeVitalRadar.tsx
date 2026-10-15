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
    budget_drain_pct: 0,
    burnout_index: 0,
    sleep_debt_hours: 0,
    consecutive_overwork_days: 0,
    weekly_hobby_minutes: 0,
    weekly_family_dinners: 0
  });

  // 대화 및 심의 이벤트로부터 최신 라이프 상태 유입 시 동기화
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
      if (forceReset || !internalState) {
        // 완전 초기화 폴백: 모든 수치 0
        const zeroMetrics: VitalMetrics = {
          budget_drain_pct: 0,
          burnout_index: 0,
          sleep_debt_hours: 0,
          consecutive_overwork_days: 0,
          weekly_hobby_minutes: 0,
          weekly_family_dinners: 0
        };
        const zeroHistory = ['10-08', '10-09', '10-10', '10-11', '10-12', '10-13', '10-14'].map(date => ({
          date,
          expense_total: 0,
          sleep_hours: 7.5,
          work_hours: 0,
          family_dinner: false,
          hobby_minutes: 0
        }));
        setInternalState({
          metrics: zeroMetrics,
          anomaly_triggers: [],
          context_summary_for_council: locale === 'ja'
            ? '直近7日間の全バイタル初期化完了 (予算消化率 0%、睡眠負債 0時間、バーンアウト指数 0)。'
            : '최근 7일간 전체 바이탈 초기화 완료 (예산 소진율 0%, 수면 부채 0시간, 번아웃 지수 0).'
        });
        setInternalHistory(zeroHistory);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 1. 프리셋 적용 핸들러 (과거 1주일 궤적과 메트릭스를 즉각 교체)
  const handleApplyPreset = async (presetId: 'burnout' | 'balanced' | 'frugal') => {
    setIsLoading(true);
    setActivePreset(presetId);
    setHasLiveUpdate(true);

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
      }
    } catch (e) {
      console.warn('Failed to apply preset, applying client-side preset fallback:', e);
      const dates = ['10-08', '10-09', '10-10', '10-11', '10-12', '10-13', '10-14'];
      if (presetId === 'burnout') {
        setInternalState({
          metrics: {
            budget_drain_pct: 128.2,
            burnout_index: 99.0,
            sleep_debt_hours: 11.2,
            consecutive_overwork_days: 7,
            weekly_hobby_minutes: 0,
            weekly_family_dinners: 0
          },
          anomaly_triggers: ["CRITICAL_BURNOUT_ACCUMULATED", "CONSECUTIVE_OVERWORK_TIRED_BRAIN"],
          context_summary_for_council: "過去7日間の累積分析: 週間予算消化率 128.2%、睡眠負債 11.2時間、バーンアウト指数 99.0。"
        });
        setInternalHistory(dates.map((d, i) => ({
          date: d,
          expense_total: 45000 + i * 4000,
          sleep_hours: Math.max(4.5, 6.0 - i * 0.25),
          work_hours: 10.0 + i * 0.5,
          family_dinner: false,
          hobby_minutes: 0
        })));
      } else if (presetId === 'balanced') {
        setInternalState({
          metrics: {
            budget_drain_pct: 45.0,
            burnout_index: 17.0,
            sleep_debt_hours: 0.0,
            consecutive_overwork_days: 0,
            weekly_hobby_minutes: 240,
            weekly_family_dinners: 4
          },
          anomaly_triggers: [],
          context_summary_for_council: "過去7日間の累積分析: 週間予算消化率 45.0%、睡眠負債 0.0時間、バーンアウト指数 17.0。"
        });
        setInternalHistory(dates.map((d, i) => ({
          date: d,
          expense_total: 18000,
          sleep_hours: 7.5,
          work_hours: i < 5 ? 8.0 : 0.0,
          family_dinner: i % 2 === 0,
          hobby_minutes: i < 5 ? 30 : 60
        })));
      } else {
        setInternalState({
          metrics: {
            budget_drain_pct: 17.5,
            burnout_index: 17.0,
            sleep_debt_hours: 0.0,
            consecutive_overwork_days: 0,
            weekly_hobby_minutes: 120,
            weekly_family_dinners: 3
          },
          anomaly_triggers: [],
          context_summary_for_council: "過去7日間の累積分析: 週間予算消化率 17.5%、睡眠負債 0.0時間、バーンアウト指数 17.0。"
        });
        setInternalHistory(dates.map((d, i) => ({
          date: d,
          expense_total: 7000,
          sleep_hours: 7.4,
          work_hours: i < 5 ? 8.2 : 0.0,
          family_dinner: i % 3 === 0,
          hobby_minutes: 20
        })));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 수동 슬라이더 변경 적용 핸들러
  const handleApplyCustomState = async () => {
    setIsLoading(true);
    setActivePreset('custom');
    setHasLiveUpdate(true);

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
      }
    } catch (e) {
      console.warn('Failed to apply custom state:', e);
      setInternalState(prev => prev ? ({
        ...prev,
        metrics: {
          ...prev.metrics,
          ...customSliders
        }
      }) : null);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 초기화 핸들러: 모든 메트릭스 및 7일 궤적을 0(완전 초기화)으로 리셋!
  const handleResetToBaseline = async () => {
    setIsLoading(true);
    setActivePreset('baseline');
    setIsManualTuningOpen(false);

    // 클라이언트 상태 즉각 완전 0 리셋
    const zeroMetrics: VitalMetrics = {
      budget_drain_pct: 0.0,
      burnout_index: 0.0,
      sleep_debt_hours: 0.0,
      consecutive_overwork_days: 0,
      weekly_hobby_minutes: 0,
      weekly_family_dinners: 0
    };

    const dates = ['10-08', '10-09', '10-10', '10-11', '10-12', '10-13', '10-14'];
    const zeroHistory: VitalHistoryItem[] = dates.map(d => ({
      date: d,
      expense_total: 0.0,
      sleep_hours: 7.5,
      work_hours: 0.0,
      family_dinner: false,
      hobby_minutes: 0
    }));

    setCustomSliders({
      budget_drain_pct: 0,
      burnout_index: 0,
      sleep_debt_hours: 0,
      consecutive_overwork_days: 0,
      weekly_hobby_minutes: 0,
      weekly_family_dinners: 0
    });

    setInternalState({
      metrics: zeroMetrics,
      anomaly_triggers: [],
      context_summary_for_council: locale === 'ja'
        ? '直近7日間の全バイタル初期化完了 (予算消化率 0%、睡眠負債 0時間、バーンアウト指数 0)。'
        : '최근 7일간 전체 바이탈 초기화 완료 (예산 소진율 0%, 수면 부채 0시간, 번아웃 지수 0).'
    });
    setInternalHistory(zeroHistory);
    setHasLiveUpdate(false);

    // 백엔드 동기화
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      await fetch(`${apiUrl}/api/state/reset?locale=${locale}`, { method: 'POST' });
    } catch (e) {
      console.warn('Backend reset sync:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!propStateData) {
      fetchCurrentState();
    }
  }, [locale]);

  // CRITICAL FIX: 사용자가 프리셋/초기화/직접 수정을 조작한 경우 internalState와 internalHistory를 절대적 우선순위로 적용!
  const activeState = internalState || propStateData;
  const activeHistory = (internalHistory && internalHistory.length > 0) ? internalHistory : (propHistory || []);

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

          {/* 초기화 버튼 (모든 바이탈 0 리셋) */}
          <button
            type="button"
            onClick={handleResetToBaseline}
            disabled={isLoading || isUpdating}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95 bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-white border border-rose-500/30 hover:border-rose-400"
            title="모든 바이탈 지수를 0(완전 초기화)으로 리셋"
          >
            <RotateCcw className={`w-3 h-3 ${isLoading ? 'animate-spin text-rose-400' : 'text-rose-400'}`} />
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
                min="0"
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

      {/* ── 5. 펼쳐졌을 때의 4대 바이탈 카드 & 과거 1주일간의 궤적 그리드 ── */}
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

              {/* 과거 1주일간의 궤적: 근무시간 & 스트레스 */}
              <div className="pt-2 border-t border-slate-700/50">
                <div className="flex items-center justify-between text-[9px] text-slate-400 mb-1">
                  <span>過去7日間の推移 (勤務h)</span>
                  <span className="font-mono text-slate-300">max 13h</span>
                </div>
                <div className="h-9 flex items-end gap-1 bg-slate-950/50 p-1 rounded-lg border border-slate-800/80">
                  {activeHistory.map((h, i) => {
                    const isZero = !h.work_hours || h.work_hours === 0;
                    const barH = isZero ? 6 : Math.min(100, Math.max(12, (h.work_hours / 13.0) * 100));
                    const isExtreme = h.work_hours >= 11;
                    const isOverwork = h.work_hours >= 9.5;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end" title={`${h.date}: ${h.work_hours}時間勤務`}>
                        <div 
                          style={{ height: `${barH}%` }}
                          className={`w-full rounded-sm transition-all duration-300 ${
                            isZero 
                              ? 'bg-slate-800' 
                              : isExtreme 
                              ? 'bg-rose-500 shadow-sm shadow-rose-500/50' 
                              : isOverwork 
                              ? 'bg-amber-500' 
                              : 'bg-indigo-400'
                          }`}
                        />
                        <span className="text-[7px] text-slate-500 mt-0.5 font-mono">{h.date.slice(-2)}</span>
                      </div>
                    );
                  })}
                </div>
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

              {/* 과거 1주일간의 궤적: 일별 지출 */}
              <div className="pt-2 border-t border-slate-700/50">
                <div className="flex items-center justify-between text-[9px] text-slate-400 mb-1">
                  <span>過去7日間の推移 (支出)</span>
                  <span className="font-mono text-slate-300">max ¥7万</span>
                </div>
                <div className="h-9 flex items-end gap-1 bg-slate-950/50 p-1 rounded-lg border border-slate-800/80">
                  {activeHistory.map((h, i) => {
                    const isZero = !h.expense_total || h.expense_total === 0;
                    const barH = isZero ? 6 : Math.min(100, Math.max(12, (h.expense_total / 70000.0) * 100));
                    const isHigh = h.expense_total >= 45000;
                    const isModerate = h.expense_total >= 20000;
                    const dispText = locale === 'ja'
                      ? `${h.date}: ¥${Math.round(h.expense_total).toLocaleString()}`
                      : `${h.date}: ${Math.round(h.expense_total).toLocaleString()}원`;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end" title={dispText}>
                        <div 
                          style={{ height: `${barH}%` }}
                          className={`w-full rounded-sm transition-all duration-300 ${
                            isZero 
                              ? 'bg-slate-800' 
                              : isHigh 
                              ? 'bg-amber-500 shadow-sm shadow-amber-500/50' 
                              : isModerate 
                              ? 'bg-amber-600/80' 
                              : 'bg-emerald-500'
                          }`}
                        />
                        <span className="text-[7px] text-slate-500 mt-0.5 font-mono">{h.date.slice(-2)}</span>
                      </div>
                    );
                  })}
                </div>
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

              {/* 과거 1주일간의 궤적: 수면 시간 */}
              <div className="pt-2 border-t border-slate-700/50">
                <div className="flex items-center justify-between text-[9px] text-slate-400 mb-1">
                  <span>過去7日間の推移 (睡眠h)</span>
                  <span className="font-mono text-slate-300">基準 7.5h</span>
                </div>
                <div className="h-9 flex items-end gap-1 bg-slate-950/50 p-1 rounded-lg border border-slate-800/80">
                  {activeHistory.map((h, i) => {
                    const barH = Math.min(100, Math.max(10, (h.sleep_hours / 8.5) * 100));
                    const isShort = h.sleep_hours < 6.0;
                    const isDeficit = h.sleep_hours < 7.0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end" title={`${h.date}: ${h.sleep_hours}時間睡眠`}>
                        <div 
                          style={{ height: `${barH}%` }}
                          className={`w-full rounded-sm transition-all duration-300 ${
                            isShort 
                              ? 'bg-rose-500 shadow-sm shadow-rose-500/50' 
                              : isDeficit 
                              ? 'bg-amber-400' 
                              : 'bg-blue-400'
                          }`}
                        />
                        <span className="text-[7px] text-slate-500 mt-0.5 font-mono">{h.date.slice(-2)}</span>
                      </div>
                    );
                  })}
                </div>
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

              {/* 과거 1주일간의 궤적: 취미 시간 & 가족 식사 */}
              <div className="pt-2 border-t border-slate-700/50">
                <div className="flex items-center justify-between text-[9px] text-slate-400 mb-1">
                  <span>過去7日間の推移 (趣味/家族)</span>
                  <span className="font-mono text-slate-300">目標 4h</span>
                </div>
                <div className="h-9 flex items-end gap-1 bg-slate-950/50 p-1 rounded-lg border border-slate-800/80">
                  {activeHistory.map((h, i) => {
                    const isZero = !h.hobby_minutes || h.hobby_minutes === 0;
                    const barH = isZero ? 6 : Math.min(100, Math.max(12, (h.hobby_minutes / 60.0) * 100));
                    return (
                      <div 
                        key={i} 
                        className="flex-1 flex flex-col items-center group relative h-full justify-end" 
                        title={`${h.date}: ${h.hobby_minutes}分 취미 ${h.family_dinner ? '(👨‍👩‍👧 家族夕食)' : ''}`}
                      >
                        <div 
                          style={{ height: `${barH}%` }}
                          className={`w-full rounded-sm transition-all duration-300 ${
                            isZero 
                              ? 'bg-slate-800' 
                              : h.family_dinner 
                              ? 'bg-pink-500 shadow-sm shadow-pink-500/50' 
                              : 'bg-purple-500'
                          }`}
                        />
                        <span className="text-[7px] text-slate-500 mt-0.5 font-mono">{h.date.slice(-2)}</span>
                      </div>
                    );
                  })}
                </div>
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
