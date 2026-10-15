'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  History, 
  Trash2, 
  RefreshCw, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  Clock, 
  Calendar,
  Wallet,
  Briefcase,
  Heart,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface DeliberationRecord {
  id: string;
  created_at: string;
  iso_timestamp: string;
  raw_input: string;
  title: string;
  intent_type: string;
  intent_label: string;
  amount_description: string;
  micro_deviation: number;
  decision: string;
  verdict_summary: string;
  pareto_counter_offer?: string;
  violated_tenets?: string[];
  council_stances?: {
    finance?: string;
    career?: string;
    wellbeing?: string;
  };
  comic_title?: string;
  comic_cuts_count?: number;
  model_used?: string;
  full_payload?: any;
}

interface DeliberationHistoryTrackerProps {
  onLoadRecord?: (payload: any) => void;
}

export default function DeliberationHistoryTracker({ onLoadRecord }: DeliberationHistoryTrackerProps) {
  const t = useTranslations('DeliberationHistoryTracker');
  const [history, setHistory] = useState<DeliberationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await fetch(`${apiUrl}/api/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(t('confirmDelete'))) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await fetch(`${apiUrl}/api/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete history item:', e);
    }
  };

  const handleClearAll = async () => {
    if (!confirm(t('confirmClearAll'))) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await fetch(`${apiUrl}/api/history`, { method: 'DELETE' });
      if (res.ok) {
        setHistory([]);
      }
    } catch (e) {
      console.error('Failed to clear history:', e);
    }
  };

  const filteredHistory = history.filter(item => {
    if (filterType === 'ALL') return true;
    if (filterType === 'EXPENSE') return item.intent_type === 'EXPENSE';
    if (filterType === 'CAREER') return item.intent_type === 'CAREER_OFFER';
    if (filterType === 'WELLNESS') return item.intent_type === 'HABBY_WELLNESS' || item.intent_type === 'LIFESTYLE_STRESS';
    return true;
  });

  // 통계 계산
  const totalCount = history.length;
  const approvedCount = history.filter(h => h.decision === '승인').length;
  const conditionalCount = history.filter(h => h.decision === '조건부수정').length;
  const rejectedCount = history.filter(h => h.decision === '기각').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── 1. 히스토리 요약 헤더 & KPI 배너 ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/90 border border-indigo-500/30 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <span>{t('title')}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold border border-indigo-500/30">
                {t('cumulativeCount', { count: totalCount })}
              </span>
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              {t('subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={fetchHistory}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            title={t('refresh')}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{t('refresh')}</span>
          </button>

          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/40 transition-all"
              title={t('clearAllTitle')}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('clearAll')}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 2. KPI 대시보드 미니 카드 ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{t('totalCountLabel')}</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalCount}{t('countUnit')}</div>
          <div className="text-[10px] text-slate-500 mt-1">{t('totalCountDesc')}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/20">
          <div className="flex items-center justify-between text-xs text-emerald-400 mb-1">
            <span>{t('approvedLabel')}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{approvedCount}{t('countUnit')}</div>
          <div className="text-[10px] text-emerald-500/70 mt-1">{t('approvedDesc')}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/20">
          <div className="flex items-center justify-between text-xs text-amber-400 mb-1">
            <span>{t('conditionalLabel')}</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{conditionalCount}{t('countUnit')}</div>
          <div className="text-[10px] text-amber-500/70 mt-1">{t('conditionalDesc')}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-rose-500/20">
          <div className="flex items-center justify-between text-xs text-rose-400 mb-1">
            <span>{t('rejectedLabel')}</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">{rejectedCount}{t('countUnit')}</div>
          <div className="text-[10px] text-rose-500/70 mt-1">{t('rejectedDesc')}</div>
        </div>
      </div>

      {/* ── 3. 필터 탭 ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: t('tabAll'), icon: Sparkles },
          { id: 'EXPENSE', label: t('tabExpense'), icon: Wallet },
          { id: 'CAREER', label: t('tabCareer'), icon: Briefcase },
          { id: 'WELLNESS', label: t('tabWellness'), icon: Heart },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = filterType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── 4. 히스토리 리스트 ── */}
      {filteredHistory.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">{t('noHistoryTitle')}</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {t('noHistoryDesc')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map(record => {
            const isExpanded = expandedId === record.id;
            const isApproved = record.decision === '승인';
            const isConditional = record.decision === '조건부수정';
            const isRejected = record.decision === '기각';

            return (
              <div
                key={record.id}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition-all overflow-hidden shadow-lg"
              >
                {/* 헤더 바 */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : record.id)}
                  className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/30 transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${
                        isApproved
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : isConditional
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {isApproved && <ShieldCheck className="w-3 h-3" />}
                        {isConditional && <AlertTriangle className="w-3 h-3" />}
                        {isRejected && <XCircle className="w-3 h-3" />}
                        <span>{record.decision}</span>
                      </span>

                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700/50">
                        {record.intent_label || record.intent_type}
                      </span>

                      {record.amount_description && (
                        <span className="text-xs font-bold text-amber-300/90 font-mono">
                          {record.amount_description}
                        </span>
                      )}

                      <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono ml-auto md:ml-0">
                        <Clock className="w-3 h-3" />
                        {record.created_at}
                      </span>
                    </div>

                    <h4 className="text-sm md:text-base font-bold text-white truncate">
                      &ldquo;{record.raw_input}&rdquo;
                    </h4>

                    {record.verdict_summary && (
                      <p className="text-xs text-slate-300 line-clamp-1">
                        ⚖️ {record.verdict_summary}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {onLoadRecord && record.full_payload && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onLoadRecord(record.full_payload);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600/90 hover:bg-indigo-600 text-white shadow-sm transition-all"
                        title={t('openInDashboardTitle')}
                      >
                        <span>{t('openInDashboard')}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDeleteItem(record.id, e)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title={t('deleteTitle')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* 상세 확장 패널 */}
                {isExpanded && (
                  <div className="p-4 md:p-6 bg-slate-950/60 border-t border-slate-800 space-y-4 animate-fade-in text-xs md:text-sm">
                    {/* 최고 중재관 판결문 요약 */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4" />
                          {t('chiefGovernorVerdict')}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {t('engine')} {record.model_used || 'Gemini'}
                        </span>
                      </div>
                      <p className="text-slate-200 leading-relaxed">
                        {record.verdict_summary}
                      </p>

                      {record.pareto_counter_offer && (
                        <div className="mt-2 pt-2 border-t border-slate-800 text-amber-300">
                          <span className="font-bold">{t('paretoCounterOfferPrefix')}</span>
                          <span>{record.pareto_counter_offer}</span>
                        </div>
                      )}

                      {record.violated_tenets && record.violated_tenets.length > 0 && (
                        <div className="text-rose-400 text-xs">
                          <span className="font-bold">{t('violatedTenetsPrefix')}</span>
                          <span>{record.violated_tenets.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* 도메인 위원회 입장 */}
                    {record.council_stances && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                          <div className="text-[11px] text-slate-400 mb-0.5">{t('financeCouncil')}</div>
                          <div className="font-bold font-mono capitalize text-slate-200">
                            {record.council_stances.finance || 'N/A'}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                          <div className="text-[11px] text-slate-400 mb-0.5">{t('careerCouncil')}</div>
                          <div className="font-bold font-mono capitalize text-slate-200">
                            {record.council_stances.career || 'N/A'}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                          <div className="text-[11px] text-slate-400 mb-0.5">{t('wellbeingCouncil')}</div>
                          <div className="font-bold font-mono capitalize text-slate-200">
                            {record.council_stances.wellbeing || 'N/A'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 웹툰 연계 정보 */}
                    {record.comic_title && (
                      <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-purple-200 flex items-center justify-between text-xs">
                        <span>{t('linkedComicPrefix')}<strong>{record.comic_title}</strong></span>
                        <span className="text-[11px] text-purple-300/80 font-mono">{t('comicGenerated')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
