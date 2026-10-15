'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingDown, AlertTriangle, Clock, Target, Crown } from 'lucide-react';

interface Cascade {
  l0_daily: any;
  l1_sprint: any;
  l2_quarter: any;
  l3_chapter: any;
  l4_constitution: any;
}

interface Log10VisualizerProps {
  cascade: Cascade | null;
  microDeviation: number;
}

const TIER_INFO = [
  { level: 'L0', name: 'Execution', scale: '1일', icon: Clock },
  { level: 'L1', name: 'Sprint', scale: '10일', icon: Target },
  { level: 'L2', name: 'Tactical', scale: '100일', icon: TrendingDown },
  { level: 'L3', name: 'Strategic', scale: '1000일', icon: AlertTriangle },
  { level: 'L4', name: 'Constitution', scale: '10000일', icon: Crown },
];
export default function Log10Visualizer({ cascade, microDeviation }: Log10VisualizerProps) {
  const t = useTranslations('Log10Visualizer');
  if (!cascade) {
    return (
      <div className="w-full bg-slate-900/50 backdrop-blur-md rounded-2xl p-8 border border-slate-800 shadow-xl text-center space-y-3">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
          <span>{t('title_non_expense')}</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-normal">
            {t('badge_non_expense')}
          </span>
        </h2>
        <div className="bg-gradient-to-r from-blue-950/30 via-indigo-950/30 to-purple-950/30 p-6 rounded-xl border border-indigo-500/30 max-w-3xl mx-auto text-left space-y-2">
          <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
            <span className="text-base">💼</span> {t('orchestrator_analysis')}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {t('desc_p1_1')}<strong>{t('desc_p1_2')}</strong>{t('desc_p1_3')}<strong>{t('desc_p1_4')}</strong>{t('desc_p1_5')}
            <br />
            {t('desc_p2_1')}<strong>{t('desc_p2_2')}</strong>{t('desc_p2_3')}<strong>{t('desc_p2_4')}</strong>{t('desc_p2_5')}
          </p>
        </div>
      </div>
    );
  }

  // Parse numbers from strings like "98,000원" -> 98000
  const parseNum = (val: any): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const extracted = val.replace(/[^0-9-]/g, '');
      return extracted ? parseInt(extracted, 10) : 0;
    }
    return 0;
  };

  const getMetric = (tier: string): { label: string, valStr: string, valNum: number, color: string } => {
    switch (tier) {
      case 'L0': {
        const val = cascade.l0_daily?.drain_pct || cascade.l0_daily?.value || '0%';
        return { label: t('metric_l0_label'), valStr: val, valNum: parseNum(val), color: '#3b82f6' }; // blue
      }
      case 'L1': {
        const val = cascade.l1_sprint?.remedy || cascade.l1_sprint?.value || '0원';
        return { label: t('metric_l1_label'), valStr: val, valNum: parseNum(val), color: '#22c55e' }; // green
      }
      case 'L2': {
        const val = cascade.l2_quarter?.value || cascade.l2_quarter?.status || '0원';
        return { label: t('metric_l2_label'), valStr: val, valNum: parseNum(val), color: '#eab308' }; // yellow
      }
      case 'L3': {
        const val = cascade.l3_chapter?.value || '0원';
        return { label: t('metric_l3_label'), valStr: val, valNum: parseNum(val), color: '#f97316' }; // orange
      }
      case 'L4': {
        const val = cascade.l4_constitution?.value || cascade.l4_constitution?.delayed_retirement || '0원';
        return { label: t('metric_l4_label'), valStr: val, valNum: parseNum(val), color: '#ef4444' }; // red
      }
      default:
        return { label: '', valStr: '', valNum: 0, color: '#888888' };
    }
  };

  const chartData = TIER_INFO.map(tierInfo => {
    const metric = getMetric(tierInfo.level);
    return {
      name: tierInfo.level,
      fullName: t(`tier_${tierInfo.level}_name`),
      scale: t(`tier_${tierInfo.level}_scale`),
      // For log scale, ensure value is at least 1 (or specific small baseline) if 0 to avoid Recharts domain crash
      value: metric.valNum > 0 ? metric.valNum : (metric.valNum === 0 ? 1 : metric.valNum),
      actualValue: metric.valStr,
      label: metric.label,
      color: metric.color
    };
  });

  return (
    <div className="w-full bg-gray-900/60 backdrop-blur-md rounded-2xl p-6 border border-gray-800 shadow-2xl">
      <h2 className="text-2xl font-bold text-white tracking-tight mb-8">{t('title_main')}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Cascade Left */}
        <div className="flex flex-col gap-4 relative">
          <div className="absolute left-6 top-8 bottom-8 w-1 bg-gradient-to-b from-blue-500 via-yellow-500 to-red-500 rounded-full opacity-30 z-0"></div>
          
          {TIER_INFO.map((tier) => {
            const Icon = tier.icon;
            const metric = getMetric(tier.level);
            
            return (
              <div key={tier.level} className="relative z-10 flex items-center gap-4 group">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${metric.color}20`, borderColor: metric.color }}
                >
                  <Icon className="w-5 h-5" style={{ color: metric.color }} />
                </div>
                
                <div className="flex-1 bg-gray-950/80 rounded-xl p-4 border border-gray-800 transition-all duration-300 hover:border-gray-600 hover:bg-gray-900/90 shadow-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: metric.color }}>{tier.level}</span>
                        <span className="text-sm text-gray-400">({t(`tier_${tier.level}_scale`)})</span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-200 mt-1">{t(`tier_${tier.level}_name`)}</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 uppercase tracking-wider">{metric.label}</div>
                      <div className="text-lg font-bold text-white mt-1">{metric.valStr}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chart Right */}
        <div className="bg-gray-950/50 rounded-xl border border-gray-800 p-6 flex flex-col min-h-[400px]">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6 text-center">
            {t('chart_title')}
          </h3>
          <div className="flex-1 w-full relative min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis scale="log" domain={['auto', 'auto']} stroke="#6b7280" />
                <Tooltip 
                  cursor={{fill: '#374151', opacity: 0.2}}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-xl">
                          <p className="font-bold text-white">{data.name}: {data.fullName}</p>
                          <p className="text-sm text-gray-400 mt-1">{data.label}</p>
                          <p className="text-lg font-bold mt-1" style={{ color: data.color }}>{data.actualValue}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 p-4 bg-red-950/30 border border-red-900/50 rounded-lg">
            <p className="text-sm text-red-200 leading-relaxed font-medium text-center">
              {t('quote')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
