'use client';

import React, { useState } from 'react';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  ChevronRight,
  Info,
  Calendar
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

export interface HorizonPoint {
  tier: string;
  label: string;
  days: number;
  scale: string;
  baseline: number;
  projected: number;
  arbitrated?: number;
  delta: number;
  delta_label: string;
  arbitrated_delta?: number;
  arbitrated_delta_label?: string;
  narrative: string;
  arbitrated_narrative?: string;
}

export interface GoalImpact {
  category_id: string;
  name: string;
  icon: string;
  score: number;
  status: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  reason: string;
  delta_label: string;
  temporal_trajectory?: HorizonPoint[];
}

interface GoalImpactMatrixProps {
  impacts?: GoalImpact[];
  compositeTrajectory?: HorizonPoint[];
}

const HORIZON_TIER_LOCALE_MAP: Record<string, Record<string, { label: string; scale: string }>> = {
  ja: {
    L0: { label: '1日 (L0)', scale: '日次即時' },
    L1: { label: '7日 (L1)', scale: '週次戦術' },
    L2: { label: '1年 (L2)', scale: '年次戦略' },
    L3: { label: '5年 (L3)', scale: '5ヶ年ロードマップ' },
    L4: { label: '30年 (L4)', scale: '人生憲法' },
  },
  en: {
    L0: { label: '1 Day (L0)', scale: 'Daily Immediate' },
    L1: { label: '7 Days (L1)', scale: 'Weekly Tactical' },
    L2: { label: '1 Year (L2)', scale: 'Annual Strategic' },
    L3: { label: '5 Years (L3)', scale: '5-Year Roadmap' },
    L4: { label: '30 Years (L4)', scale: 'Life Constitution' },
  },
  ko: {
    L0: { label: '1일 (L0)', scale: '일일 즉각' },
    L1: { label: '7일 (L1)', scale: '주간 전술' },
    L2: { label: '1년 (L2)', scale: '연간 전략' },
    L3: { label: '5년 (L3)', scale: '5개년 로드맵' },
    L4: { label: '30년 (L4)', scale: '인생 헌법' },
  },
};

const KOREAN_TO_JA_NARRATIVE_DICT: Record<string, string> = {
  '현 직무 상태 유지': '現職務状態の維持',
  '단기 변동 없음': '短期変動なし',
  '분기 마일스톤 유지': '四半期マイルストーン維持',
  '중기 궤적 안정': '中期軌道の安定',
  '장기 목표 유지': '長期目標の維持',
  'L0 소액 소비 발생': 'L0 少額消費発生',
  'L1 완충재 내에서 흡수 완료': 'L1 バッファ内で吸収完了',
  '분기 영향 미미': '四半期への影響軽微',
  '중기 영향 없음': '中期への影響なし',
  '장기 영향 없음': '長期への影響なし',
  '소액 지출 발생': '少額支出発生',
  '중재 가이드로 L1 내 조기 회복': '仲裁ガイドによりL1内で早期回復',
  '분기 영향 없음': '四半期への影響なし',
  '충동 소비 방어': '衝動消費の防御',
  'L1 예산 건전성 유지': 'L1 予算の健全性維持',
  '분기 잉여 자금 발생': '四半期余剰資金の発生',
  '목표 저축률 달성 순항': '目標貯蓄率の順調な達成',
  '복리 궤적 정상 유지': '複利軌道の正常維持',
  '생체 신호 평형 유지': '生体信号の平衡維持',
  '단기 피로도 정상': '短期疲労度正常',
  '분기 건강 지표 안정': '四半期健康指標安定',
  '중기 체력 유지': '中期体力維持',
  '30년 건강 궤적 순항': '30年健康軌道の順航',
  '취미 루틴 유지': '趣味ルーティンの維持',
  '단기 블록 확보': '短期ブロックの確保',
  '분기 쿼터 정상': '四半期クォータの正常消化',
  '중기 취미 생활 안정': '中期趣味生活の安定',
  '평생 여가 지속': '生涯余暇の継続',
  '가족 일정에 유의미한 영향 없음': '家族の予定に有意な影響なし',
  '일상 교감 증진': '日常の対話促進',
  '가정 내 심리적 안정': '家庭内の心理的安定',
  '가족 신뢰 자본 축적': '家族信頼資本の蓄積',
  '3년 주기 가족 행복도 상승': '3年周期の家族幸福度の上昇',
  '생애 전반 가족 공동체 공고화': '生涯にわたる家族共同体の強固化',
  '귀가 전 감정 정돈': '帰宅前の感情整理',
  '가정 내 평온한 대화': '家庭内の穏やかな対話',
  '분기 가족 스트레스 전파 차단': '四半期の家族ストレス伝播遮断',
  '온화한 가정 분위기 지속': '温和な家庭環境の持続',
  '장기 가족 웰빙 기여': '長期的な家族ウェルビーイングへの貢献',
};

const getLocalizedHorizonMeta = (tier: string, currentLabel: string, currentScale: string, curLocale: string) => {
  const meta = HORIZON_TIER_LOCALE_MAP[curLocale]?.[tier];
  if (meta) {
    return meta;
  }
  return { label: currentLabel, scale: currentScale };
};

const translateNarrative = (text: string | undefined, curLocale: string): string => {
  if (!text) return '';
  if (curLocale === 'ja') {
    let result = text;
    for (const [ko, ja] of Object.entries(KOREAN_TO_JA_NARRATIVE_DICT)) {
      if (result.includes(ko)) {
        result = result.replaceAll(ko, ja);
      }
    }
    result = result.replace(/^원안:\s*/, '原案: ').replace(/^중재:\s*/, '仲裁: ');
    return result;
  }
  return text;
};

export default function GoalImpactMatrix({ impacts, compositeTrajectory }: GoalImpactMatrixProps) {
  const locale = useLocale();
  const t = useTranslations('GoalImpactMatrix');
  const [selectedCategory, setSelectedCategory] = useState<string>('composite');
  const [hoveredPoint, setHoveredPoint] = useState<HorizonPoint | null>(null);

  if (!impacts || impacts.length === 0) return null;

  const positiveCount = impacts.filter(i => i.score > 0).length;
  const negativeCount = impacts.filter(i => i.score < 0).length;

  // 활성화된 궤적 데이터 추출
  let activeTrajectory: HorizonPoint[] = [];
  let activeName = t('composite_balance_index');
  let activeIcon = '✨';
  let activeScore = 0;

  if (selectedCategory === 'composite') {
    activeTrajectory = compositeTrajectory || (impacts[0]?.temporal_trajectory ? impacts[0].temporal_trajectory.map((_, idx) => {
      const avgBase = Math.round(impacts.reduce((acc, curr) => acc + (curr.temporal_trajectory?.[idx]?.baseline || 80), 0) / impacts.length);
      const avgProj = Math.round(impacts.reduce((acc, curr) => acc + (curr.temporal_trajectory?.[idx]?.projected || 80), 0) / impacts.length);
      const avgArb = Math.round(impacts.reduce((acc, curr) => acc + (curr.temporal_trajectory?.[idx]?.arbitrated ?? curr.temporal_trajectory?.[idx]?.projected ?? 80), 0) / impacts.length);
      const delta = avgProj - avgBase;
      const arbDelta = avgArb - avgBase;
      const tier = impacts[0].temporal_trajectory![idx].tier;
      const localizedMeta = getLocalizedHorizonMeta(tier, impacts[0].temporal_trajectory![idx].label, impacts[0].temporal_trajectory![idx].scale, locale);
      return {
        tier: tier,
        label: localizedMeta.label,
        days: impacts[0].temporal_trajectory![idx].days,
        scale: localizedMeta.scale,
        baseline: avgBase,
        projected: avgProj,
        arbitrated: avgArb,
        delta: delta,
        delta_label: `${delta >= 0 ? '+' : ''}${delta}%`,
        arbitrated_delta: arbDelta,
        arbitrated_delta_label: `${arbDelta >= 0 ? '+' : ''}${arbDelta}%`,
        narrative: t('asis_narrative', { avgBase, avgProj, delta: `${delta >= 0 ? '+' : ''}${delta}` }),
        arbitrated_narrative: t('governed_narrative', { avgBase, avgArb, arbDelta: `${arbDelta >= 0 ? '+' : ''}${arbDelta}` })
      };
    }) : []);
    activeScore = Math.round(impacts.reduce((acc, c) => acc + c.score, 0) / impacts.length);
  } else {
    const found = impacts.find(i => i.category_id === selectedCategory);
    if (found) {
      activeTrajectory = found.temporal_trajectory || [];
      activeName = t('target_goal', { name: found.name });
      activeIcon = found.icon;
      activeScore = found.score;
    }
  }

  // SVG 차트 좌표 계산 (width: 760, height: 260, padding: 40)
  const chartWidth = 760;
  const chartHeight = 260;
  const paddingX = 60;
  const paddingY = 40;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  const pointsCount = activeTrajectory.length;
  const getX = (index: number) => paddingX + (index / (pointsCount - 1 || 1)) * usableWidth;
  const getY = (val: number) => chartHeight - paddingY - ((Math.min(100, Math.max(0, val))) / 100) * usableHeight;

  // 1. Baseline line (Cyan/Slate 점선)
  const baselinePoints = activeTrajectory.map((p, i) => `${getX(i)},${getY(p.baseline)}`).join(' ');

  // 2. Projected line (원안 강행 시: Rose/Amber 점각 실선)
  const projectedPoints = activeTrajectory.map((p, i) => `${getX(i)},${getY(p.projected)}`).join(' ');

  // 3. Arbitrated line (중재안 준수 시: Emerald Green 발광 실선)
  const arbitratedPoints = activeTrajectory.map((p, i) => `${getX(i)},${getY(p.arbitrated !== undefined ? p.arbitrated : p.projected)}`).join(' ');

  // Gap fill polygon path (중재안과 기준선 사이의 면적 채움)
  let gapAreaPath = '';
  if (activeTrajectory.length > 0) {
    const forward = activeTrajectory.map((p, i) => `${getX(i)},${getY(p.arbitrated !== undefined ? p.arbitrated : p.projected)}`).join(' L ');
    const backward = activeTrajectory.slice().reverse().map((p, i) => {
      const originalIdx = activeTrajectory.length - 1 - i;
      return `${getX(originalIdx)},${getY(p.baseline)}`;
    }).join(' L ');
    gapAreaPath = `M ${forward} L ${backward} Z`;
  }

  const isNetPositive = activeScore >= 0;

  return (
    <div className="glass-panel p-6 border border-slate-700/60 bg-slate-900/80 shadow-2xl rounded-2xl space-y-6">
      {/* ── 1. 헤더 & 종합 득실 지표 ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              {t('title')}
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                5-Horizon Forecast
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {/* 득실 스코어 뱃지 */}
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 font-medium shadow-sm">
            <TrendingUp className="w-3.5 h-3.5" /> {t('positive_areas', { count: positiveCount })}
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5 font-medium shadow-sm">
            <TrendingDown className="w-3.5 h-3.5" /> {t('negative_areas', { count: negativeCount })}
          </span>
        </div>
      </div>

      {/* ── 2. 도메인 전환 탭 ── */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => { setSelectedCategory('composite'); setHoveredPoint(null); }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
            selectedCategory === 'composite'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/30 ring-1 ring-white/20'
              : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/50'
          }`}
        >
          <span>✨</span>
          <span>{t('composite_balance')}</span>
        </button>

        {impacts.map((item) => (
          <button
            key={item.category_id}
            type="button"
            onClick={() => { setSelectedCategory(item.category_id); setHoveredPoint(null); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              selectedCategory === item.category_id
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30 ring-1 ring-white/20'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/50'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              item.score > 0 ? 'bg-emerald-500/20 text-emerald-300' : item.score < 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-700 text-slate-400'
            }`}>
              {item.delta_label}
            </span>
          </button>
        ))}
      </div>

      {/* ── 3. 인터랙티브 SVG 선그래프 (HERO TRAJECTORY CHART) ── */}
      <div className="relative rounded-2xl bg-slate-950/70 border border-slate-800/80 p-4 overflow-hidden">
        {/* 범례 및 현재 선택된 도메인 타이틀 */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2 px-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">{activeIcon}</span>
            <span className="font-bold text-white text-sm">{activeName}</span>
            <span className="text-slate-400 text-xs">{t('temporal_causal_line')}</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-0.5 border-t-2 border-dashed border-slate-400" />
              <span className="text-slate-400">{t('baseline_legend')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-1 bg-rose-500 rounded-full" />
              <span className="text-rose-300 font-semibold">{t('asis_legend')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-emerald-300 font-bold">{t('governed_legend')}</span>
            </div>
          </div>
        </div>

        {/* 차트 SVG */}
        <div className="w-full overflow-x-auto">
          <svg 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            className="w-full min-w-[640px] h-[240px] select-none"
          >
            <defs>
              {/* 그라데이션 정의 */}
              <linearGradient id="arbitratedLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#059669" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>

              <linearGradient id="projectedLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#fb7185" />
              </linearGradient>

              <linearGradient id="positiveGapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
              </linearGradient>

              <linearGradient id="negativeGapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.05" />
              </linearGradient>

              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* 수평 눈금 가이드라인 (0%, 25%, 50%, 75%, 100%) */}
            {[0, 25, 50, 75, 100].map((val) => {
              const y = getY(val);
              return (
                <g key={val}>
                  <line 
                    x1={paddingX} 
                    y1={y} 
                    x2={chartWidth - paddingX} 
                    y2={y} 
                    stroke="#334155" 
                    strokeWidth="1" 
                    strokeDasharray={val === 50 || val === 100 ? '2 2' : '1 4'}
                    strokeOpacity="0.4"
                  />
                  <text 
                    x={paddingX - 12} 
                    y={y + 3} 
                    textAnchor="end" 
                    fill="#64748b" 
                    fontSize="10" 
                    fontFamily="monospace"
                  >
                    {val}%
                  </text>
                </g>
              );
            })}

            {/* 수직 타임라인 기준선 (L0 ~ L4) */}
            {activeTrajectory.map((p, i) => {
              const x = getX(i);
              return (
                <line 
                  key={p.tier} 
                  x1={x} 
                  y1={paddingY} 
                  x2={x} 
                  y2={chartHeight - paddingY} 
                  stroke="#1e293b" 
                  strokeWidth="1" 
                  strokeDasharray="2 4"
                />
              );
            })}

            {/* 1. 이동 면적 (Gap Area) 렌더링 */}
            {gapAreaPath && (
              <path
                d={gapAreaPath}
                fill={isNetPositive ? 'url(#positiveGapGrad)' : 'url(#negativeGapGrad)'}
                className="transition-all duration-700"
              />
            )}

            {/* 2. 기준선 (Baseline: Cyan/Slate 점선) */}
            <polyline
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={baselinePoints}
              className="opacity-70 transition-all duration-700"
            />

            {/* 3. 원안 강행선 (Projected As-Is: Rose 점각선) */}
            <polyline
              fill="none"
              stroke="url(#projectedLineGrad)"
              strokeWidth="2.5"
              strokeDasharray="5 3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={projectedPoints}
              className="opacity-80 transition-all duration-700"
            />

            {/* 4. 중재안 준수선 (Arbitrated Governed: Emerald Green 발광 실선) */}
            <polyline
              fill="none"
              stroke="url(#arbitratedLineGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={arbitratedPoints}
              filter="url(#glow)"
              className="transition-all duration-700"
            />

            {/* 5. 각 단계별 노드 포인트 렌더링 */}
            {activeTrajectory.map((point, idx) => {
              const x = getX(idx);
              const baseY = getY(point.baseline);
              const projY = getY(point.projected);
              const arbY = getY(point.arbitrated !== undefined ? point.arbitrated : point.projected);
              const isArbPositive = (point.arbitrated_delta ?? point.delta) >= 0;

              return (
                <g key={point.tier} className="cursor-pointer group">
                  {/* 기준 노드 (작은 점선 원) */}
                  <circle
                    cx={x}
                    cy={baseY}
                    r="3.5"
                    fill="#1e293b"
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                  />

                  {/* 원안 강행 노드 (작은 붉은 원) */}
                  <circle
                    cx={x}
                    cy={projY}
                    r="4"
                    fill="#f43f5e"
                    stroke="#ffffff"
                    strokeWidth="1"
                    className="opacity-70"
                  />

                  {/* 중재안 준수 노드 (발광 초록 원) */}
                  <circle
                    cx={x}
                    cy={arbY}
                    r={hoveredPoint?.tier === point.tier ? '7' : '5.5'}
                    fill={isArbPositive ? '#10b981' : '#f59e0b'}
                    stroke="#ffffff"
                    strokeWidth="2"
                    filter="url(#glow)"
                    onMouseEnter={() => setHoveredPoint(point)}
                    className="transition-all duration-200"
                  />

                  {/* 노드 상단 중재안 델타 뱃지 라벨 */}
                  <g transform={`translate(${x}, ${arbY - 14})`}>
                    <rect
                      x="-24"
                      y="-12"
                      width="48"
                      height="16"
                      rx="8"
                      fill={isArbPositive ? '#064e3b' : '#78350f'}
                      stroke={isArbPositive ? '#10b981' : '#f59e0b'}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="-1"
                      textAnchor="middle"
                      fill={isArbPositive ? '#6ee7b7' : '#fde68a'}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {point.arbitrated_delta_label || point.delta_label}
                    </text>
                  </g>

                  {/* X축 계층 라벨 (L0 ~ L4) */}
                  {(() => {
                    const ptMeta = getLocalizedHorizonMeta(point.tier, point.label, point.scale, locale);
                    return (
                      <>
                        <text
                          x={x}
                          y={chartHeight - 14}
                          textAnchor="middle"
                          fill="#cbd5e1"
                          fontSize="11"
                          fontWeight="600"
                        >
                          {ptMeta.label}
                        </text>
                        <text
                          x={x}
                          y={chartHeight - 2}
                          textAnchor="middle"
                          fill="#64748b"
                          fontSize="9"
                        >
                          {ptMeta.scale}
                        </text>
                      </>
                    );
                  })()}
                </g>
              );
            })}
          </svg>
        </div>

        {/* ── 4. 호버/선택 인터랙티브 진단 툴팁 바 ── */}
        <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
              <Info className="w-3.5 h-3.5" />
            </span>
            <span className="text-slate-300">
              {hoveredPoint ? (
                (() => {
                  const hMeta = getLocalizedHorizonMeta(hoveredPoint.tier, hoveredPoint.label, hoveredPoint.scale, locale);
                  const asisNar = translateNarrative(hoveredPoint.narrative, locale);
                  const govNar = translateNarrative(hoveredPoint.arbitrated_narrative || hoveredPoint.narrative, locale);
                  return (
                    <span>
                      <strong className="text-white">[{hMeta.label}]</strong>{' '}
                      <span className="text-rose-400 font-semibold">[{t('asis_bracket')}]</span> {asisNar}{' '}
                      <span className="text-emerald-400 font-semibold ml-2">[{t('governed_bracket')}]</span> {govNar}
                    </span>
                  );
                })()
              ) : (
                <span>{t('tooltip_hint')}</span>
              )}
            </span>
          </div>

          {hoveredPoint && (
            <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] flex-wrap">
              <span className="text-slate-400">{t('baseline_label', { baseline: hoveredPoint.baseline })}</span>
              <span className="text-slate-600">|</span>
              <span className="text-rose-400">{t('asis_label', { projected: hoveredPoint.projected, delta_label: hoveredPoint.delta_label })}</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 font-bold">
                {t('governed_label', { arbitrated: hoveredPoint.arbitrated ?? hoveredPoint.projected, delta_label: hoveredPoint.arbitrated_delta_label || hoveredPoint.delta_label })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── 5. 5단계 기간(L0~L4) 인과 영향도 요약 카드 5열 그리드 ── */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          {t('time_horizon_title')}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {activeTrajectory.map((tierPoint) => {
            const arbDelta = tierPoint.arbitrated_delta ?? tierPoint.delta;
            const isArbPos = arbDelta >= 0;
            const cardMeta = getLocalizedHorizonMeta(tierPoint.tier, tierPoint.label, tierPoint.scale, locale);
            const asisNar = translateNarrative(tierPoint.narrative, locale);
            const govNar = translateNarrative(tierPoint.arbitrated_narrative || tierPoint.narrative, locale);

            return (
              <div
                key={tierPoint.tier}
                onMouseEnter={() => setHoveredPoint(tierPoint)}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer shadow-sm hover:border-emerald-500/40"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">{cardMeta.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                      isArbPos ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {t('arbitration')} {tierPoint.arbitrated_delta_label || tierPoint.delta_label}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 block mb-2 font-medium">
                    {t('horizon_scale', { scale: cardMeta.scale })}
                  </span>

                  <div className="space-y-1.5 text-[11px]">
                    <p className="text-rose-400/90 leading-tight">
                      <span className="font-bold text-rose-300">{t('asis_colon')}</span> {asisNar}
                    </p>
                    <p className="text-emerald-300/90 leading-tight">
                      <span className="font-bold text-emerald-200">{t('governed_colon')}</span> {govNar}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{t('asis_percent', { projected: tierPoint.projected })}</span>
                  <ChevronRight className="w-3 h-3 text-emerald-500" />
                  <span className="font-bold text-emerald-300">{t('governed_percent', { arbitrated: tierPoint.arbitrated ?? tierPoint.projected })}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 6. 5대 도메인 카드 그리드 요약 (클릭 시 해당 도메인 궤적으로 전환) ── */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-purple-400" />
            {t('domain_diagnosis_title')}
          </span>
          <span className="text-[11px] text-indigo-400 font-normal">
            {t('selected_target')} <strong>{activeName}</strong>
          </span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
          {impacts.map((item) => {
            const isPositive = item.score > 0;
            const isNegative = item.score < 0;
            const isSelected = selectedCategory === item.category_id;

            const cardBorder = isSelected
              ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-950/30'
              : isPositive
              ? 'border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/50'
              : isNegative
              ? 'border-rose-500/30 bg-rose-950/10 hover:border-rose-500/50'
              : 'border-slate-800 bg-slate-900/30 hover:border-slate-700';

            const badgeColor = isPositive
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : isNegative
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700';

            const progressBg = isPositive
              ? 'bg-emerald-500'
              : isNegative
              ? 'bg-rose-500'
              : 'bg-slate-600';

            return (
              <div
                key={item.category_id}
                onClick={() => { setSelectedCategory(item.category_id); setHoveredPoint(null); }}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer ${cardBorder}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm font-bold text-slate-200">{item.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${badgeColor}`}>
                      {item.delta_label}
                    </span>
                  </div>

                  {/* 프로그레스 바 */}
                  <div className="w-full bg-slate-800/80 rounded-full h-1.5 mb-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${progressBg}`}
                      style={{ width: `${Math.min(100, Math.max(15, Math.abs(item.score)))}%` }}
                    />
                  </div>

                  {/* 평가 사유 */}
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {item.reason}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{t('view_trajectory')}</span>
                  <span className={isSelected ? 'text-indigo-400 font-bold' : isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-slate-400'}>
                    {isSelected ? t('selected_check') : isPositive ? t('resource_expansion') : isNegative ? t('resource_erosion') : t('homeostasis')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
