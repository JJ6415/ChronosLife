'use client';

import { CreditCard, Briefcase, Footprints } from 'lucide-react';

import { useLocale } from 'next-intl';

interface PresetSelectorProps {
  onSelect: (scenarioId: string) => void;
  activeScenario: string | null;
  isLoading: boolean;
}

export default function PresetSelector({ onSelect, activeScenario, isLoading }: PresetSelectorProps) {
  const locale = useLocale();

  const scenarios = [
    {
      id: 'scenario_1_impulse_spend',
      title: locale === 'ja' ? '深夜の衝動支出' : '야밤의 충동 지출',
      desc: locale === 'ja' ? '9,800円キーボード → 30年リタイア遅延' : '98,000원 키보드 → 30년 은퇴 지연',
      color: 'border-rose-500/50 hover:border-rose-500 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] text-rose-400',
      activeColor: 'border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.5)] text-rose-500',
      icon: <CreditCard className="w-8 h-8" />,
    },
    {
      id: 'scenario_2_startup_tradeoff',
      title: locale === 'ja' ? '転職オファーの相反仲裁' : '이직 오퍼 상충 중재',
      desc: locale === 'ja' ? '年収350万円↑ vs 家族・健康の犠牲' : '연봉 3,500만↑ vs 가족·취미 박탈',
      color: 'border-amber-500/50 hover:border-amber-500 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] text-amber-400',
      activeColor: 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)] text-amber-500',
      icon: <Briefcase className="w-8 h-8" />,
    },
    {
      id: 'scenario_3_burnout_mobility',
      title: locale === 'ja' ? 'バーンアウト＆15分散歩処方' : '번아웃 힐링 산책',
      desc: locale === 'ja' ? '残業ストレス → 15分緑地徒歩処方' : '야근 스트레스 → 15분 녹지 처방',
      color: 'border-emerald-500/50 hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] text-emerald-400',
      activeColor: 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] text-emerald-500',
      icon: <Footprints className="w-8 h-8" />,
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto mb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scenarios.map((scenario) => {
          const isActive = activeScenario === scenario.id;
          return (
            <button
              key={scenario.id}
              disabled={isLoading}
              onClick={() => onSelect(scenario.id)}
              className={`
                relative flex flex-col items-start p-6 rounded-2xl text-left transition-all duration-300
                bg-slate-900/50 backdrop-blur-md border-2
                ${isActive ? scenario.activeColor : scenario.color}
                ${isActive ? 'scale-105 bg-slate-800/80 z-10' : 'hover:scale-105 hover:bg-slate-800/60 z-0'}
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className={`mb-4 p-3 rounded-full bg-slate-950/50 ${isActive ? scenario.activeColor : scenario.color}`}>
                {scenario.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">{scenario.title}</h3>
              <p className="text-sm text-slate-400 font-medium">{scenario.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
