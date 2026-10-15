'use client';

import React, { useState, useEffect } from 'react';
import { Send, Sparkles, RotateCcw, Cpu, Settings2, RefreshCw } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

export interface ModelOption {
  id: string;
  name: string;
  desc?: string;
  badge?: string;
  is_recommended?: boolean;
}

interface InteractiveInputConsoleProps {
  onSubmit: (rawInput: string, microDeviation?: number, modelName?: string) => void;
  isLoading: boolean;
  initialText?: string;
}

export const AVAILABLE_MODELS = [
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite', desc: '초고속 (0.8초) · 무지연 권장 엔진', badge: 'Recommended' },
  { id: 'gemini-flash-lite-latest', name: 'Gemini Flash Lite', desc: '초경량 초고속 저지연', badge: 'Ultra Fast' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', desc: '경량 3.1 아키텍처', badge: 'Light' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', desc: '심층 복합 추론', badge: 'Deep Reasoning' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3.0 Flash Preview', desc: '차세대 3.0 프리뷰', badge: 'Preview' },
];

export default function InteractiveInputConsole({
  onSubmit,
  isLoading,
  initialText = ""
}: InteractiveInputConsoleProps) {
  const t = useTranslations('Console');
  const locale = useLocale();
  const [text, setText] = useState(initialText);
  const [customAmount, setCustomAmount] = useState<number | ''>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.5-flash-lite');
  const [availableModels, setAvailableModels] = useState<ModelOption[]>(AVAILABLE_MODELS);
  const [isFetchingModels, setIsFetchingModels] = useState(false);

  const TEMPLATES = [
    { label: t('template_1_label'), text: t('template_1_text'), amount: 0 },
    { label: t('template_2_label'), text: t('template_2_text'), amount: locale === 'ja' ? 9800 : 98000 },
    { label: t('template_3_label'), text: t('template_3_text'), amount: locale === 'ja' ? 3000 : 30000 },
    { label: t('template_4_label'), text: t('template_4_text'), amount: locale === 'ja' ? 25000 : 250000 },
    { label: t('template_5_label'), text: t('template_5_text'), amount: locale === 'ja' ? 5000 : 50000 }
  ];

  const fetchDynamicModels = async (forceRefresh = false) => {
    setIsFetchingModels(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const url = forceRefresh ? `${apiUrl}/api/models?refresh=true` : `${apiUrl}/api/models`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.models && data.models.length > 0) {
          setAvailableModels(data.models);
          setSelectedModel((prev) => {
            const exists = data.models.some((m: ModelOption) => m.id === prev);
            if (exists) return prev;
            const rec = data.models.find((m: ModelOption) => m.is_recommended) || data.models[0];
            return rec.id;
          });
        }
      }
    } catch (e) {
      console.warn('Failed to fetch dynamic models from /api/models:', e);
    } finally {
      setIsFetchingModels(false);
    }
  };

  useEffect(() => {
    fetchDynamicModels();
  }, []);

  useEffect(() => {
    if (initialText) {
      setText(initialText);
    }
  }, [initialText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSubmit(text, typeof customAmount === 'number' ? customAmount : undefined, selectedModel);
  };

  const handleApplyTemplate = (tplText: string, tplAmount: number) => {
    setText(tplText);
    setCustomAmount(tplAmount > 0 ? tplAmount : 0);
  };

  return (
    <div className="glass-panel p-6 border border-slate-700/60 shadow-2xl relative overflow-hidden bg-slate-900/60">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {t('orchestration_console_title')}
              <span className="text-xs font-normal text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-500/30">
                Live Engine
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {t('orchestration_console_desc')}
            </p>
          </div>
        </div>

        {/* 모델 선택기 & 새로고침 & 초기화 버튼 */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-inner">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={isLoading || isFetchingModels}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-1 max-w-[200px] truncate"
              title={t('model_select_title')}
            >
              {availableModels.map((m) => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                  {m.name} {m.badge ? `[${m.badge}]` : ''}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => fetchDynamicModels(true)}
              disabled={isFetchingModels}
              className={`p-1 rounded text-slate-400 hover:text-indigo-300 transition ${isFetchingModels ? 'animate-spin text-indigo-400' : ''}`}
              title={t('model_refresh_title')}
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          <span className="text-[10px] text-emerald-400/80 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full hidden md:inline-block">
            {t('models_synced_badge', { count: availableModels.length })}
          </span>

          {text && (
            <button
              type="button"
              onClick={() => { setText(''); setCustomAmount(''); }}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> {t('reset')}
            </button>
          )}
        </div>
      </div>

      {/* 템플릿 칩 */}
      <div className="my-4">
        <div className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
          <span>{t('fast_test_templates')}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleApplyTemplate(tpl.text, tpl.amount)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50 hover:border-indigo-500/50 transition flex items-center gap-1.5 shadow-sm"
            >
              {tpl.label}
            </button>
          ))}
        </div>
      </div>

      {/* 입력 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('placeholder')}
            rows={3}
            className="w-full bg-slate-950/70 border border-slate-700/70 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition resize-none leading-relaxed"
          />
        </div>

        {/* 하단 툴바 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Settings2 className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('selected_engine')} <strong className="text-slate-300 font-mono">{selectedModel}</strong> {t('engine_fallback_info')}</span>
          </div>

          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition shadow-lg w-full sm:w-auto ${
              !text.trim() || isLoading
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-blue-500/25 active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t('processing')}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{t('analyze_btn')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
