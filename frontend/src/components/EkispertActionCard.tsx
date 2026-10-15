'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { 
  Activity, 
  MapPin, 
  ArrowRight, 
  Flame, 
  PiggyBank, 
  Heart,
  Train,
  Footprints,
  XCircle,
  Leaf
} from 'lucide-react';

interface RouteSegment {
  from: string;
  to: string;
  method: string;
  duration: string;
  description: string;
}

interface EkispertActionCardProps {
  prescription: {
    trigger: string;
    standard_route: {
      from: string;
      to: string;
      method: string;
      duration: string;
      congestion?: string;
    };
    healing_walk_route: {
      segments: RouteSegment[];
      total_duration: string;
    };
    action_card: string;
    savings: {
      food_cost_saved: number;
      calories_prevented: number;
    };
    wellness_impact: string;
  } | null;
}

export default function EkispertActionCard({ prescription }: EkispertActionCardProps) {
  const t = useTranslations('EkispertActionCard');
  const locale = useLocale();
  if (!prescription) return null;

  const { standard_route, healing_walk_route, savings } = prescription;

  const formatDuration = (d: string) => {
    if (!d) return '';
    if (locale === 'ja') {
      return d.replace(/분/g, '分').replace(/mins?/gi, '分');
    }
    if (locale === 'en') {
      return d.replace(/분/g, ' min').replace(/分/g, ' min');
    }
    return d;
  };

  const getMethodIcon = (method: string) => {
    if (method.toLowerCase().includes('walk') || method === '도보' || method === '徒歩') return <Footprints className="w-4 h-4" />;
    return <Train className="w-4 h-4" />;
  };

  return (
    <div className="w-full bg-[#0a150f] rounded-2xl p-6 border border-emerald-900/50 shadow-2xl backdrop-blur-md flex flex-col gap-6">
      <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
        {t('title')}
      </h2>

      {/* Trigger Alert */}
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 flex items-center gap-3 text-orange-400 text-sm font-medium">
        <Activity className="w-5 h-5 animate-pulse" />
        {prescription.trigger}
      </div>

      {/* Routes Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Before: Standard Route */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-4 opacity-75 grayscale">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 font-bold flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" /> 
              {t('before_title')}
            </h3>
            <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
              {formatDuration(standard_route.duration)}
            </span>
          </div>
          
          <div className="flex items-center gap-3 bg-black/40 p-3 rounded-lg text-sm text-gray-400">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>{standard_route.from}</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
            <span>{standard_route.to}</span>
          </div>
          
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Train className="w-3 h-3" /> {t('method_label')} {standard_route.method}
            {standard_route.congestion && (
              <span className="ml-2 text-red-900/80 bg-red-500/20 px-1.5 rounded">{t('congestion_label')} {standard_route.congestion}</span>
            )}
          </div>
        </div>

        {/* After: Healing Walk Route */}
        <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-teal-600"></div>
          
          <div className="flex items-center justify-between pl-2">
            <h3 className="text-emerald-400 font-bold flex items-center gap-2">
              <Leaf className="w-4 h-4" /> 
              {t('after_title')}
            </h3>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded border border-emerald-500/30">
              {formatDuration(healing_walk_route.total_duration)}
            </span>
          </div>

          <div className="flex flex-col gap-0 pl-2">
            {healing_walk_route.segments.map((segment, idx) => (
              <div key={idx} className="flex gap-4 relative">
                {/* Timeline line */}
                {idx !== healing_walk_route.segments.length - 1 && (
                  <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-emerald-900/50"></div>
                )}
                
                {/* Timeline node */}
                <div className="flex flex-col items-center pt-1 z-10">
                  <div className="w-6 h-6 rounded-full bg-emerald-900 border border-emerald-500 flex items-center justify-center text-emerald-400">
                    {getMethodIcon(segment.method)}
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 text-sm text-emerald-100/90 mb-1">
                    <span className="font-medium">{segment.from}</span>
                    <ArrowRight className="w-3 h-3 text-emerald-500" />
                    <span className="font-medium">{segment.to}</span>
                    <span className="text-xs text-emerald-500 ml-auto bg-emerald-500/10 px-1.5 rounded">
                      {formatDuration(segment.duration)}
                    </span>
                  </div>
                  <div className="text-xs text-emerald-300/60 bg-emerald-950/50 p-2 rounded border border-emerald-900/30">
                    {segment.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Card */}
      <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 rounded-xl p-6 text-center relative overflow-hidden flex flex-col items-center justify-center gap-3">
        <div className="text-5xl drop-shadow-md">🌿</div>
        <p className="text-emerald-50 font-semibold text-lg md:text-xl leading-relaxed whitespace-pre-line max-w-2xl">
          {prescription.action_card}
        </p>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 flex items-center justify-center gap-2">
          <div className="font-semibold text-white">{t('saved_amount_label', { amount: savings.food_cost_saved.toLocaleString() })}</div>
        </div>
        
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 flex items-center justify-center gap-2">
          <div className="font-semibold text-white">{t('calories_label', { amount: savings.calories_prevented.toLocaleString() })}</div>
        </div>
        
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 flex items-center justify-center gap-2 text-center">
          <div className="font-semibold text-white">{t('wellness_label', { text: prescription.wellness_impact })}</div>
        </div>
      </div>
    </div>
  );
}
