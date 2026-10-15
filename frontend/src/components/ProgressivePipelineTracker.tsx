'use client';

import React from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  Circle, 
  ShieldCheck, 
  Clock, 
  Scale, 
  Crown, 
  Palette,
  Sparkles,
  Cpu
} from 'lucide-react';

import { useTranslations } from 'next-intl';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface StageInfo {
  index: number;
  id: string;
  nameKey: string;
  subTextKey: string;
  icon: any;
}

const STAGES: StageInfo[] = [
  {
    index: 1,
    id: 'dlp',
    nameKey: 'dlp_name',
    subTextKey: 'dlp_subtext',
    icon: ShieldCheck,
  },
  {
    index: 2,
    id: 'orchestrator',
    nameKey: 'orchestrator_name',
    subTextKey: 'orchestrator_subtext',
    icon: Cpu,
  },
  {
    index: 3,
    id: 'council',
    nameKey: 'council_name',
    subTextKey: 'council_subtext',
    icon: Scale,
  },
  {
    index: 4,
    id: 'governor',
    nameKey: 'governor_name',
    subTextKey: 'governor_subtext',
    icon: Crown,
  },
  {
    index: 5,
    id: 'trajectory_and_comic',
    nameKey: 'trajectory_name',
    subTextKey: 'trajectory_subtext',
    icon: Palette,
  },
];

interface ProgressivePipelineTrackerProps {
  currentStage: number; // 0: 시작 전, 1~5: 진행/완료 단계, 6: 전체 완료
  isCompleted: boolean;
  statusMessage?: string;
  modelUsed?: string;
}

export default function ProgressivePipelineTracker({
  currentStage,
  isCompleted,
  statusMessage,
  modelUsed,
}: ProgressivePipelineTrackerProps) {
  const t = useTranslations('ProgressivePipelineTracker');

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/90 p-5 md:p-6 shadow-2xl backdrop-blur-xl space-y-5 animate-fade-in relative overflow-hidden">
      {/* 백그라운드 펄스 효과 */}
      {!isCompleted && currentStage > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-pulse" />
      )}

      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Sparkles className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
              <span>{t('title')}</span>
              {isCompleted ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {t('all_completed')}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {t('updating_realtime', { current: Math.min(currentStage, 5) })}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              {statusMessage || t('default_status')}
            </p>
          </div>
        </div>

        {modelUsed && (
          <div className="text-xs text-slate-400 font-mono bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
            Engine: <span className="text-indigo-400 font-bold">{modelUsed}</span>
          </div>
        )}
      </div>

      {/* 스테퍼 단계 시각화 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        {STAGES.map((stg) => {
          const isDone = isCompleted || currentStage > stg.index;
          const isCurrent = !isCompleted && currentStage === stg.index;
          const isPending = currentStage < stg.index;
          const IconComp = stg.icon;

          return (
            <div
              key={stg.id}
              className={`relative flex flex-col p-3.5 rounded-xl border transition-all duration-300 ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                  : isCurrent
                  ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                  : 'bg-slate-950/40 border-slate-800/80 opacity-60'
              }`}
            >
              {/* 스텝 상단 아이콘 및 상태 마커 */}
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-1.5 rounded-lg ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isCurrent
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                </div>

                <div>
                  {isDone && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t('completed')}
                    </span>
                  )}
                  {isCurrent && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {t('running')}
                    </span>
                  )}
                  {isPending && (
                    <span className="text-[11px] text-slate-500 font-mono">
                      {t('step', { index: stg.index })}
                    </span>
                  )}
                </div>
              </div>

              {/* 스텝 제목 & 서브텍스트 */}
              <div className="space-y-1">
                <h4
                  className={`text-xs font-bold ${
                    isDone
                      ? 'text-emerald-300'
                      : isCurrent
                      ? 'text-indigo-200'
                      : 'text-slate-400'
                  }`}
                >
                  {t(stg.nameKey as any)}
                </h4>
                <p className="text-[10px] text-slate-400 leading-snug line-clamp-2">
                  {t(stg.subTextKey as any)}
                </p>
              </div>

              {/* 하단 프로그레스 언더라인 */}
              <div className="mt-2 pt-1 border-t border-slate-800/50">
                <div
                  className={`h-1 rounded-full transition-all duration-500 ${
                    isDone
                      ? 'w-full bg-emerald-500'
                      : isCurrent
                      ? 'w-2/3 bg-indigo-500 animate-pulse'
                      : 'w-0 bg-slate-800'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
