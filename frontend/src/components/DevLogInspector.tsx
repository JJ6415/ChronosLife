'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Terminal, 
  X, 
  RefreshCw, 
  Trash2, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Code, 
  Cpu, 
  Globe, 
  Clock, 
  ArrowDownRight, 
  ArrowUpRight,
  Filter
} from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ApiLogItem {
  id: string;
  timestamp: string;
  iso: string;
  method: string;
  path: string;
  status_code: number;
  duration_ms: number;
  client_ip: string;
  request_body: any;
  response_body: any;
  error?: string;
}

interface LlmLogItem {
  id: string;
  timestamp: string;
  caller: string;
  model: string;
  duration_ms: number;
  prompt: string;
  prompt_length: number;
  response_text: string;
  response_length: number;
  error?: string;
}

export default function DevLogInspector() {
  const t = useTranslations('DevLogInspector');
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'api' | 'llm'>('api');
  const [apiLogs, setApiLogs] = useState<ApiLogItem[]>([]);
  const [llmLogs, setLlmLogs] = useState<LlmLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await fetch(`${apiUrl}/api/dev/logs?limit=60`);
      if (res.ok) {
        const data = await res.json();
        setApiLogs(data.api_logs || []);
        setLlmLogs(data.llm_logs || []);
      }
    } catch (e) {
      console.warn('Failed to fetch dev logs:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
      if (!autoRefresh) return;
      const interval = setInterval(fetchLogs, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen, autoRefresh]);

  const handleClearLogs = async () => {
    if (!confirm(t('confirmClearLogs'))) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await fetch(`${apiUrl}/api/dev/logs`, { method: 'DELETE' });
      if (res.ok) {
        setApiLogs([]);
        setLlmLogs([]);
      }
    } catch (e) {
      console.error('Failed to clear logs:', e);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredApiLogs = apiLogs.filter(log => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.path.toLowerCase().includes(term) ||
      log.method.toLowerCase().includes(term) ||
      JSON.stringify(log.request_body || '').toLowerCase().includes(term) ||
      JSON.stringify(log.response_body || '').toLowerCase().includes(term)
    );
  });

  const filteredLlmLogs = llmLogs.filter(log => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.caller.toLowerCase().includes(term) ||
      log.model.toLowerCase().includes(term) ||
      log.prompt.toLowerCase().includes(term) ||
      log.response_text.toLowerCase().includes(term)
    );
  });

  return (
    <>
      {/* ── 우측 하단 플로팅 토글 버튼 ── */}
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={() => {
            setIsOpen(prev => !prev);
            fetchLogs();
          }}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold border border-indigo-500/50 shadow-2xl shadow-indigo-500/30 backdrop-blur-xl transition-all transform hover:scale-105 active:scale-95 group"
        >
          <div className="relative">
            <Terminal className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <span className="text-slate-200">{t('apiLogsLabel')}</span>
          <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
            {apiLogs.length + llmLogs.length}
          </span>
        </button>
      </div>

      {/* ── 개발자 로그 인스펙터 모달/드로어 ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-5xl h-[88vh] flex flex-col rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden font-sans">
            {/* ── 상단 헤더 ── */}
            <div className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-black text-white flex items-center gap-2">
                    <span>{t('title')}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                      Live Trace
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('subtitle')}
                  </p>
                </div>
              </div>

              {/* 우측 컨트롤 도구들 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoRefresh(prev => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    autoRefresh
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                  title={t('autoRefreshToggle')}
                >
                  <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                  <span>{t('liveUpdate')}</span>
                </button>

                <button
                  onClick={fetchLogs}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                  title={t('manualRefresh')}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  onClick={handleClearLogs}
                  className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/40 transition-colors"
                  title={t('clearLogs')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                  title={t('close')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ── 탭 전환 & 검색 바 ── */}
            <div className="p-3 md:px-5 py-2.5 bg-slate-900/50 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTab('api')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'api'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{t('tabHttpApi')} ({apiLogs.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('llm')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'llm'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{t('tabGeminiLlm')} ({llmLogs.length})</span>
                </button>
              </div>

              {/* 검색창 */}
              <div className="relative flex-1 max-w-xs min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
            </div>

            {/* ── 로그 메인 스크롤 뷰 ── */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-3 font-mono text-xs">
              {activeTab === 'api' ? (
                /* ── Tab 1: HTTP API Logs ── */
                filteredApiLogs.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 space-y-2">
                    <Globe className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                    <p>{t('noApiLogs')}</p>
                  </div>
                ) : (
                  filteredApiLogs.map(log => {
                    const isExpanded = expandedId === log.id;
                    const isSuccess = log.status_code >= 200 && log.status_code < 400;

                    return (
                      <div
                        key={log.id}
                        className="rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all overflow-hidden"
                      >
                        {/* 헤더 바 */}
                        <div
                          onClick={() => setExpandedId(isExpanded ? null : log.id)}
                          className="p-3 md:p-3.5 flex flex-wrap items-center justify-between gap-2.5 cursor-pointer hover:bg-slate-800/40 transition-colors"
                        >
                          <div className="flex items-center gap-2 flex-wrap min-w-0">
                            {/* 메서드 배지 */}
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              log.method === 'POST' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                              log.method === 'GET' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                              {log.method}
                            </span>

                            {/* 상태 코드 배지 */}
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              isSuccess ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                            }`}>
                              {log.status_code}
                            </span>

                            {/* URL 경로 */}
                            <span className="font-bold text-white tracking-tight">
                              {log.path}
                            </span>

                            {/* 소요 시간 */}
                            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                              <Clock className="w-3 h-3" />
                              {log.duration_ms}ms
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-slate-500 text-[11px] ml-auto">
                            <span>{log.timestamp}</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>

                        {/* 상세 확장 패널 (입력값 vs 출력값) */}
                        {isExpanded && (
                          <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 space-y-3 animate-fade-in">
                            {/* 1. Request Body (입력값) */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                                <span className="font-bold text-indigo-400 flex items-center gap-1">
                                  <ArrowDownRight className="w-3.5 h-3.5" />
                                  {t('requestPayload')}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(JSON.stringify(log.request_body, null, 2), `req_${log.id}`);
                                  }}
                                  className="flex items-center gap-1 text-slate-500 hover:text-white transition-colors"
                                >
                                  {copiedKey === `req_${log.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedKey === `req_${log.id}` ? t('copied') : t('copy')}</span>
                                </button>
                              </div>
                              <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-200 overflow-x-auto max-h-56 leading-relaxed">
                                {JSON.stringify(log.request_body, null, 2) || t('empty')}
                              </pre>
                            </div>

                            {/* 2. Response Body (출력값) */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                                <span className="font-bold text-emerald-400 flex items-center gap-1">
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                  {t('responsePayload')}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(JSON.stringify(log.response_body, null, 2), `res_${log.id}`);
                                  }}
                                  className="flex items-center gap-1 text-slate-500 hover:text-white transition-colors"
                                >
                                  {copiedKey === `res_${log.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedKey === `res_${log.id}` ? t('copied') : t('copy')}</span>
                                </button>
                              </div>
                              <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-emerald-300/90 overflow-x-auto max-h-72 leading-relaxed">
                                {JSON.stringify(log.response_body, null, 2) || t('empty')}
                              </pre>
                            </div>

                            {log.error && (
                              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                                <strong>{t('errorLogPrefix')}</strong> {log.error}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )
              ) : (
                /* ── Tab 2: Gemini LLM Call Logs ── */
                filteredLlmLogs.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 space-y-2">
                    <Cpu className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                    <p>{t('noLlmLogs')}</p>
                  </div>
                ) : (
                  filteredLlmLogs.map(log => {
                    const isExpanded = expandedId === log.id;

                    return (
                      <div
                        key={log.id}
                        className="rounded-2xl bg-slate-900/80 border border-purple-500/20 hover:border-purple-500/40 transition-all overflow-hidden"
                      >
                        {/* 헤더 바 */}
                        <div
                          onClick={() => setExpandedId(isExpanded ? null : log.id)}
                          className="p-3 md:p-3.5 flex flex-wrap items-center justify-between gap-2.5 cursor-pointer hover:bg-slate-800/40 transition-colors"
                        >
                          <div className="flex items-center gap-2 flex-wrap min-w-0">
                            {/* 호출자 에이전트 배지 */}
                            <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {log.caller}
                            </span>

                            {/* 모델명 */}
                            <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-slate-800 text-slate-300">
                              {log.model}
                            </span>

                            {/* 소요 시간 */}
                            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                              <Clock className="w-3 h-3" />
                              {log.duration_ms}ms
                            </span>

                            {/* 프롬프트 글자수 */}
                            <span className="text-slate-500 text-[10px]">
                              {t('promptLengthInfo', { input: log.prompt_length, output: log.response_length })}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-slate-500 text-[11px] ml-auto">
                            <span>{log.timestamp}</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>

                        {/* 상세 확장 패널 */}
                        {isExpanded && (
                          <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 space-y-3 animate-fade-in">
                            {/* 1. 프롬프트 전문 */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                                <span className="font-bold text-purple-300 flex items-center gap-1">
                                  {t('promptFull')}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(log.prompt, `prompt_${log.id}`);
                                  }}
                                  className="flex items-center gap-1 text-slate-500 hover:text-white transition-colors"
                                >
                                  {copiedKey === `prompt_${log.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedKey === `prompt_${log.id}` ? t('copied') : t('copy')}</span>
                                </button>
                              </div>
                              <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-200 overflow-x-auto max-h-60 whitespace-pre-wrap leading-relaxed">
                                {log.prompt}
                              </pre>
                            </div>

                            {/* 2. 원본 응답 */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                                <span className="font-bold text-emerald-400 flex items-center gap-1">
                                  {t('responseFull')}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(log.response_text, `resp_${log.id}`);
                                  }}
                                  className="flex items-center gap-1 text-slate-500 hover:text-white transition-colors"
                                >
                                  {copiedKey === `resp_${log.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedKey === `resp_${log.id}` ? t('copied') : t('copy')}</span>
                                </button>
                              </div>
                              <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-emerald-300 overflow-x-auto max-h-64 whitespace-pre-wrap leading-relaxed">
                                {log.response_text}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
