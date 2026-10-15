'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Cpu, 
  Workflow, 
  BadgeDollarSign, 
  TrendingUp, 
  Home, 
  Scale, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

interface DispatchedPrompts {
  finance?: string;
  career?: string;
  wellbeing?: string;
  chief_governor?: string;
}

interface OrchestrationTraceData {
  model_used?: string;
  reasoning?: string;
  intent_type?: string;
  intent_label?: string;
  amount_description?: string;
  dispatched_prompts?: DispatchedPrompts;
}

interface OrchestratorTraceViewerProps {
  trace?: OrchestrationTraceData;
}

export default function OrchestratorTraceViewer({ trace }: OrchestratorTraceViewerProps) {
  const t = useTranslations('OrchestratorTraceViewer');
  const [isOpen, setIsOpen] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!trace) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const prompts = trace.dispatched_prompts || {};

  return (
    <div className="glass-panel border border-indigo-500/30 rounded-2xl overflow-hidden shadow-2xl bg-slate-900/80 backdrop-blur-xl">
      {/* 상단 헤더 & 토글 */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-4 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border-b border-indigo-500/20 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/50 transition select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Workflow className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                {t('header_title')}
              </h3>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {t('header_badge')}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {t('header_desc')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {trace.model_used && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-xs text-indigo-300 font-mono">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>{trace.model_used}</span>
            </div>
          )}
          <button 
            type="button" 
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 펼쳐지는 백로그 본문 */}
      {isOpen && (
        <div className="p-6 space-y-6">
          {/* 1. 의도 분류 및 판정 요약 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-500 block mb-1">{t('label_intent')}</span>
              <span className="text-sm font-bold text-indigo-300">
                {trace.intent_label || t('default_intent')}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-500 block mb-1">{t('label_finance_status')}</span>
              <span className="text-sm font-bold text-emerald-400">
                {trace.amount_description || t('default_finance_status')}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-500 block mb-1">{t('label_engine')}</span>
              <span className="text-sm font-bold text-purple-300 font-mono flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                {trace.model_used || t('default_engine')}
              </span>
            </div>
          </div>

          {/* 2. 오케스트레이터 심층 판단 근거 */}
          {trace.reasoning && (
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs md:text-sm text-indigo-100/90 leading-relaxed">
              <div className="font-semibold text-indigo-400 mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5" />
                {t('reasoning_title')}
              </div>
              {trace.reasoning}
            </div>
          )}

          {/* 3. 에이전트별 하달 프롬프트 카드 그리드 */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t('directives_title')}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Finance Agent */}
              <div className="rounded-xl bg-slate-950/70 border border-emerald-500/25 p-4 flex flex-col justify-between hover:border-emerald-500/40 transition">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <BadgeDollarSign className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-emerald-300">{t('agent_finance')}</span>
                    </div>
                    {prompts.finance && (
                      <button
                        onClick={() => handleCopy('finance', prompts.finance!)}
                        className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1 p-1 hover:bg-slate-800 rounded transition"
                        title={t("btn_copy_title")}
                      >
                        {copiedKey === 'finance' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 whitespace-pre-wrap">
                    {prompts.finance || t('default_finance_prompt')}
                  </p>
                </div>
              </div>

              {/* Career Agent */}
              <div className="rounded-xl bg-slate-950/70 border border-blue-500/25 p-4 flex flex-col justify-between hover:border-blue-500/40 transition">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <TrendingUp className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-blue-300">{t('agent_career')}</span>
                    </div>
                    {prompts.career && (
                      <button
                        onClick={() => handleCopy('career', prompts.career!)}
                        className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1 p-1 hover:bg-slate-800 rounded transition"
                        title={t("btn_copy_title")}
                      >
                        {copiedKey === 'career' ? <Check className="w-3 h-3 text-blue-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 whitespace-pre-wrap">
                    {prompts.career || t('default_career_prompt')}
                  </p>
                </div>
              </div>

              {/* Wellbeing Agent */}
              <div className="rounded-xl bg-slate-950/70 border border-purple-500/25 p-4 flex flex-col justify-between hover:border-purple-500/40 transition">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                        <Home className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-purple-300">{t('agent_wellbeing')}</span>
                    </div>
                    {prompts.wellbeing && (
                      <button
                        onClick={() => handleCopy('wellbeing', prompts.wellbeing!)}
                        className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1 p-1 hover:bg-slate-800 rounded transition"
                        title={t("btn_copy_title")}
                      >
                        {copiedKey === 'wellbeing' ? <Check className="w-3 h-3 text-purple-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 whitespace-pre-wrap">
                    {prompts.wellbeing || t('default_wellbeing_prompt')}
                  </p>
                </div>
              </div>

              {/* Chief Governor */}
              <div className="rounded-xl bg-slate-950/70 border border-amber-500/25 p-4 flex flex-col justify-between hover:border-amber-500/40 transition">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                        <Scale className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-amber-300">{t('agent_governor')}</span>
                    </div>
                    {prompts.chief_governor && (
                      <button
                        onClick={() => handleCopy('governor', prompts.chief_governor!)}
                        className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1 p-1 hover:bg-slate-800 rounded transition"
                        title={t("btn_copy_title")}
                      >
                        {copiedKey === 'governor' ? <Check className="w-3 h-3 text-amber-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 whitespace-pre-wrap">
                    {prompts.chief_governor || t('default_governor_prompt')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
