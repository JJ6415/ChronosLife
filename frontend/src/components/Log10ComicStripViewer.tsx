'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations, useLocale } from 'next-intl';
import { 
  Sparkles, 
  MessageSquare, 
  Bot, 
  User, 
  ChevronRight, 
  ChevronLeft, 
  Maximize2, 
  X, 
  Clock, 
  Layers, 
  TrendingUp,
  HeartHandshake,
  Compass,
  RefreshCw,
  Camera
} from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ComicCut {
  panel_number: number;
  tier: string;
  scale_label: string;
  timeframe: string;
  title: string;
  image_url?: string;
  scene_description: string;
  character_dialogue: string;
  agent_dialogue: string;
  narration: string;
  emotion: string;
  visual_theme: string;
  life_score: number;
}

interface ComicData {
  comic_title: string;
  theme_tone?: string;
  model_used?: string;
  image_generation_enabled?: boolean;
  cuts: ComicCut[];
  takeaway_message?: string;
}

interface Log10ComicStripViewerProps {
  comic?: ComicData;
}

// 컷별 비주얼 테마 그라데이션 및 비주얼 일러스트 SVG
const VisualIllustration = ({ theme, emotion }: { theme: string; emotion: string }) => {
  const t = useTranslations('Log10ComicStripViewer');
  switch (theme) {
    case 'neon-night':
      return (
        <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gradient-to-b from-slate-950 via-purple-950/70 to-slate-900 border border-purple-500/20 flex flex-col items-center justify-center p-3 text-center">
          {/* 비 내리는 밤거리 네온 비주얼 효과 */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(168,85,247,0.25),transparent_60%)]" />
          <div className="absolute top-2 right-2 text-xl animate-pulse">{emotion}</div>
          <svg className="w-16 h-16 text-purple-400/80 mb-1 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M8 12h8" strokeDasharray="2 2" />
          </svg>
          <div className="text-[11px] font-bold text-purple-300 drop-shadow">{t('theme_neon_night_title')}</div>
          <div className="text-[10px] text-slate-400">{t('theme_neon_night_desc')}</div>
        </div>
      );
    case 'alarm-dawn':
      return (
        <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gradient-to-b from-slate-950 via-amber-950/60 to-slate-900 border border-amber-500/20 flex flex-col items-center justify-center p-3 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(245,158,11,0.2),transparent_60%)]" />
          <div className="absolute top-2 right-2 text-xl animate-bounce">{emotion}</div>
          <svg className="w-16 h-16 text-amber-400/80 mb-1 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 2l3 3M8 2L5 5" />
          </svg>
          <div className="text-[11px] font-bold text-amber-300 drop-shadow">{t('theme_alarm_dawn_title')}</div>
          <div className="text-[10px] text-slate-400">{t('theme_alarm_dawn_desc')}</div>
        </div>
      );
    case 'fresh-morning':
      return (
        <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gradient-to-b from-slate-950 via-emerald-950/60 to-slate-900 border border-emerald-500/20 flex flex-col items-center justify-center p-3 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(16,185,129,0.25),transparent_60%)]" />
          <div className="absolute top-2 right-2 text-xl">{emotion}</div>
          <svg className="w-16 h-16 text-emerald-400/80 mb-1 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m6.366 1.634l-2.12 2.12M21 12h-3m1.634 6.366l-2.12-2.12M12 21v-3m-6.366 1.634l2.12-2.12M3 12h3m-1.634-6.366l2.12 2.12" />
            <circle cx="12" cy="12" r="4" />
          </svg>
          <div className="text-[11px] font-bold text-emerald-300 drop-shadow">{t('theme_fresh_morning_title')}</div>
          <div className="text-[10px] text-slate-400">{t('theme_fresh_morning_desc')}</div>
        </div>
      );
    case 'golden-growth':
      return (
        <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gradient-to-b from-slate-950 via-blue-950/60 to-slate-900 border border-blue-500/20 flex flex-col items-center justify-center p-3 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(59,130,246,0.25),transparent_60%)]" />
          <div className="absolute top-2 right-2 text-xl">{emotion}</div>
          <svg className="w-16 h-16 text-blue-400/80 mb-1 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 7h4v4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 21h16" />
          </svg>
          <div className="text-[11px] font-bold text-blue-300 drop-shadow">{t('theme_golden_growth_title')}</div>
          <div className="text-[10px] text-slate-400">{t('theme_golden_growth_desc')}</div>
        </div>
      );
    case 'peaceful-sunset':
    default:
      return (
        <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gradient-to-b from-slate-950 via-rose-950/60 to-slate-900 border border-rose-500/20 flex flex-col items-center justify-center p-3 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(244,63,94,0.25),transparent_60%)]" />
          <div className="absolute top-2 right-2 text-xl animate-pulse">{emotion}</div>
          <svg className="w-16 h-16 text-rose-400/80 mb-1 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <div className="text-[11px] font-bold text-rose-300 drop-shadow">{t('theme_peaceful_sunset_title')}</div>
          <div className="text-[10px] text-slate-400">{t('theme_peaceful_sunset_desc')}</div>
        </div>
      );
  }
}

const SCALE_LABELS_MAP: Record<string, Record<number, string>> = {
  ko: { 1: "10⁰ (1일)", 2: "10¹ (10일)", 3: "10² (100일)", 4: "10³ (3년)", 5: "10⁴ (30년)" },
  en: { 1: "10⁰ (1 Day)", 2: "10¹ (10 Days)", 3: "10² (100 Days)", 4: "10³ (3 Years)", 5: "10⁴ (30 Years)" },
  ja: { 1: "10⁰ (1日)", 2: "10¹ (10日)", 3: "10² (100日)", 4: "10³ (3年)", 5: "10⁴ (30年)" }
};

const TIMEFRAME_LABELS_MAP: Record<string, Record<number, string>> = {
  ko: { 1: "오늘 밤", 2: "10일 후", 3: "100일 후", 4: "약 3년 후", 5: "약 30년 후" },
  en: { 1: "Tonight", 2: "10 Days Later", 3: "100 Days Later", 4: "Approx. 3 Yrs", 5: "Approx. 30 Yrs" },
  ja: { 1: "今夜", 2: "10日後", 3: "100日後", 4: "約3年後", 5: "約30年後" }
};

export default function Log10ComicStripViewer({ comic }: Log10ComicStripViewerProps) {
  const t = useTranslations('Log10ComicStripViewer');
  const locale = useLocale();

  const getScaleLabel = (panelNumber: number, fallback: string) => {
    return SCALE_LABELS_MAP[locale]?.[panelNumber] || fallback;
  };

  const getTimeframe = (panelNumber: number, fallback: string) => {
    if (locale !== 'ko' && /[\uac00-\ud7a3]/.test(fallback)) {
      return TIMEFRAME_LABELS_MAP[locale]?.[panelNumber] || fallback;
    }
    return fallback;
  };

  const [selectedPanel, setSelectedPanel] = useState<ComicCut | null>(null);
  const [panelImages, setPanelImages] = useState<Record<number, string>>({});
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingPanelNum, setGeneratingPanelNum] = useState<number | null>(null);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<string | null>(null);
  const [genMessage, setGenMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ESC 키로 모달 닫기 및 배경 스크롤 제어
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPanel(null);
    };
    if (selectedPanel) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedPanel]);

  const handleGenerateImage = async (panel: ComicCut): Promise<boolean> => {
    setIsGenerating(true);
    setGeneratingPanelNum(panel.panel_number);
    setGenMessage(t('generating_panel', { panel_number: panel.panel_number }));
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';
      const res = await fetch(`${apiUrl}/api/governance/comic/generate-panel-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene_description: panel.scene_description,
          panel_number: panel.panel_number,
        }),
      });
      const data = await res.json();
      if (data.status === 'ok' && data.image_url) {
        setPanelImages(prev => ({ ...prev, [panel.panel_number]: data.image_url }));
        if (selectedPanel && selectedPanel.panel_number === panel.panel_number) {
          setSelectedPanel(prev => prev ? { ...prev, image_url: data.image_url } : null);
        }
        setGenMessage(t('generating_panel_done', { panel_number: panel.panel_number }));
        return true;
      } else if (data.status === 'disabled') {
        setGenMessage(t('generating_disabled', { message: data.message || t('default_msg_disabled') }));
        return false;
      } else {
        setGenMessage(t('generating_error', { message: data.message || t('default_msg_error') }));
        return false;
      }
    } catch (e: any) {
      setGenMessage(t('generating_fail', { error: e.message }));
      return false;
    } finally {
      setIsGenerating(false);
      setGeneratingPanelNum(null);
    }
  };

  const handleGenerateAll = async () => {
    if (!comic?.cuts || isBatchGenerating) return;
    setIsBatchGenerating(true);
    setGenMessage(t('batch_start'));
    
    for (let i = 0; i < comic.cuts.length; i++) {
      const cut = comic.cuts[i];
      if (panelImages[cut.panel_number] || cut.image_url) continue;

      setBatchProgress(t('batch_progress', { current: i + 1, total: comic.cuts.length }));
      await handleGenerateImage(cut);
    }

    setIsBatchGenerating(false);
    setBatchProgress(null);
    setGenMessage(t('batch_done'));
  };

  if (!comic || !comic.cuts || comic.cuts.length === 0) {
    return null;
  }

  const missingImageCount = comic.cuts.filter(c => !panelImages[c.panel_number] && !c.image_url).length;

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-slate-950 p-5 md:p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-6 animate-fade-in">
      {/* 배경 장식 광채 */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 헤더 바 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {t('badge_multimodal')}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {t('badge_subtitle')}
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-indigo-200 to-purple-300">
            🎨 {comic.comic_title || t('default_title')}
          </h3>
          <p className="text-xs text-slate-400">
            {t('description')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {/* 이미지 생성기 상태 배지 (ON/OFF 동적 상태) */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
            comic.image_generation_enabled !== false 
              ? 'bg-purple-950/60 border-purple-500/40 text-purple-300' 
              : 'bg-slate-800/80 border-slate-700/60 text-slate-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${comic.image_generation_enabled !== false ? 'bg-purple-400 animate-pulse' : 'bg-slate-500'}`} />
            <span>{comic.image_generation_enabled !== false ? t('status_generator_on') : t('status_generator_off')}</span>
          </div>

          {comic.model_used && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs shadow-inner font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t('status_story_model', { model: comic.model_used })}</span>
            </div>
          )}

          {/* 전체 컷 일괄 생성 버튼 */}
          <button
            type="button"
            disabled={isBatchGenerating || isGenerating}
            onClick={handleGenerateAll}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 disabled:opacity-50 transition-all shadow-sm active:scale-95"
            title="{t('default_msg_disabled')}"
          >
            <Camera className={`w-3.5 h-3.5 ${isBatchGenerating ? 'animate-spin' : ''}`} />
            <span>
              {isBatchGenerating ? (batchProgress || t('btn_generating_batch')) : 
               missingImageCount > 0 ? t('btn_generate_batch_remain', { count: missingImageCount }) : t('btn_generate_batch_all')}
            </span>
          </button>
        </div>
      </div>

      {genMessage && (
        <div className="text-xs text-indigo-300 font-mono bg-indigo-950/60 p-2.5 rounded-xl border border-indigo-500/30 flex items-center justify-between gap-2 shadow-sm animate-fade-in">
          <span>{genMessage}</span>
          {isBatchGenerating && (
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
          )}
        </div>
      )}

      {/* 웹툰 5컷 스트립 패널 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
        {comic.cuts.map((cut, idx) => {
          const currentImg = !failedImages[cut.panel_number] ? (panelImages[cut.panel_number] || cut.image_url) : null;
          const isCurrentGenerating = generatingPanelNum === cut.panel_number;

          return (
            <div
              key={idx}
              onClick={() => setSelectedPanel({ ...cut, image_url: currentImg || undefined })}
              className="group relative flex flex-col rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden cursor-pointer flex-shrink-0"
            >
              {/* 상단 컷 배지 & 지평 스케일 */}
              <div className="flex items-center justify-between px-3 py-2 bg-slate-950/70 border-b border-slate-800/70 text-xs">
                <span className="font-extrabold text-indigo-400 font-mono flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px]">
                    {cut.panel_number}
                  </span>
                  {getScaleLabel(cut.panel_number, cut.scale_label)}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {getTimeframe(cut.panel_number, cut.timeframe)}
                </span>
              </div>

              {/* 컷 헤더 타이틀 */}
              <div className="px-3 pt-2.5 pb-1">
                <h4 className="text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-indigo-300 transition-colors">
                  {cut.title}
                </h4>
              </div>

              {/* 비주얼 일러스트 패널 */}
              <div className="px-3 py-1">
                {currentImg ? (
                  <div className="relative w-full h-44 rounded-xl overflow-hidden border border-indigo-500/30 group-hover:border-indigo-400/60 transition-all shadow-md bg-slate-950">
                    <img 
                      src={currentImg} 
                      alt={cut.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={() => setFailedImages(prev => ({ ...prev, [cut.panel_number]: true }))}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-2 right-2 text-lg bg-black/60 backdrop-blur-md rounded-full w-7 h-7 flex items-center justify-center border border-white/20 shadow-md">
                      {cut.emotion}
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-3 text-center">
                    <VisualIllustration theme={cut.visual_theme} emotion={cut.emotion} />
                    {/* 카드 위 액션 오버레이: 평소에는 비주얼 테마 그래픽을 선명하게 감상하고 hover 시에만 반투명 액션 노출 */}
                    <div className={`absolute inset-0 flex flex-col items-center justify-center p-3 gap-2 transition-all ${
                      isCurrentGenerating 
                        ? 'bg-slate-950/80 backdrop-blur-[2px] opacity-100' 
                        : 'bg-slate-950/75 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 duration-200'
                    }`}>
                      {isCurrentGenerating ? (
                        <div className="flex flex-col items-center gap-1.5 text-indigo-300 animate-pulse text-xs font-medium">
                          <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
                          <span>{t('overlay_generating')}</span>
                          <span className="text-[10px] text-slate-400 font-mono">gemini-3.1-flash-image</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={isGenerating || isBatchGenerating}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateImage(cut);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-[11px] font-bold shadow-lg shadow-black/40 active:scale-95 transition-all disabled:opacity-50"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>{t('btn_generate_image')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 대사 말풍선 영역 */}
              <div className="p-3 space-y-2 flex-grow flex flex-col justify-between text-xs">
                {/* 주인공 말풍선 */}
                <div className="relative bg-slate-800/90 rounded-xl p-2.5 border border-slate-700/60 shadow-sm">
                  <div className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold mb-1">
                    <User className="w-3 h-3" />
                    <span>{t('char_protagonist')}</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed font-sans line-clamp-3">
                    &ldquo;{cut.character_dialogue}&rdquo;
                  </p>
                </div>

                {/* Chronos AI 조언 말풍선 */}
                <div className="relative bg-indigo-950/40 rounded-xl p-2.5 border border-indigo-500/30 shadow-sm">
                  <div className="flex items-center gap-1 text-[10px] text-indigo-300 font-semibold mb-1">
                    <Bot className="w-3 h-3 text-indigo-400" />
                    <span>{t('char_chronos')}</span>
                  </div>
                  <p className="text-[11px] text-indigo-200/90 leading-relaxed font-sans line-clamp-3">
                    {cut.agent_dialogue}
                  </p>
                </div>

                {/* 웹툰 하단 나레이션 사각 박스 */}
                <div className="bg-slate-950/80 rounded-lg p-2 border-l-2 border-amber-400/80 text-[10px] text-slate-400 italic line-clamp-2">
                  📝 {cut.narration}
                </div>

                {/* 라이프 밸런스 점수 바 */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">{t('label_life_balance')}</span>
                  <span className={`font-mono font-bold ${
                    cut.life_score >= 80 ? 'text-emerald-400' :
                    cut.life_score >= 60 ? 'text-blue-400' : 'text-amber-400'
                  }`}>
                    {t('score_format', { score: cut.life_score })}
                  </span>
                </div>
              </div>

              {/* 확대 오버레이 힌트 */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 p-1 rounded-md text-white">
                <Maximize2 className="w-3 h-3" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 하단 인생 교훈 메시지 배너 */}
      {comic.takeaway_message && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-indigo-950/70 via-purple-950/50 to-slate-900 border border-indigo-500/30 text-xs md:text-sm text-indigo-200 shadow-md relative z-10">
          <HeartHandshake className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <div className="leading-snug">
            <span className="font-extrabold text-indigo-300 mr-2">{t('takeaway_prefix')}</span>
            <span>{comic.takeaway_message}</span>
          </div>
        </div>
      )}

      {/* 모달: 선택 컷 상세 확대 보기 (createPortal로 최상위 document.body에 렌더링하여 컨테이너 overflow 트랩 해소) */}
      {mounted && selectedPanel && createPortal(
        (() => {
          const modalImg = selectedPanel && !failedImages[selectedPanel.panel_number] ? (panelImages[selectedPanel.panel_number] || selectedPanel.image_url) : null;
          return (
            <div 
              onClick={(e) => { if (e.target === e.currentTarget) setSelectedPanel(null); }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
            >
              <div className="relative max-w-xl w-full max-h-[88vh] flex flex-col bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
                {/* 1. 상단 고정 헤더 */}
                <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/90">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500 text-white font-mono shrink-0">
                      {getScaleLabel(selectedPanel.panel_number, selectedPanel.scale_label)}
                    </span>
                    <span className="text-xs text-slate-400 font-medium shrink-0">
                      {getTimeframe(selectedPanel.panel_number, selectedPanel.timeframe)}
                    </span>
                    <h3 className="text-sm md:text-base font-bold text-white truncate ml-1">
                      {selectedPanel.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedPanel(null)}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0 ml-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* 2. 스크롤 가능한 본문 영역 */}
                <div className="p-5 overflow-y-auto space-y-4 flex-1 overscroll-contain">
                  {modalImg ? (
                    <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden border-2 border-indigo-500/50 shadow-2xl bg-black shrink-0">
                      <img 
                        src={modalImg} 
                        alt={selectedPanel.title}
                        className="w-full h-full object-cover"
                        onError={() => selectedPanel && setFailedImages(prev => ({ ...prev, [selectedPanel.panel_number]: true }))}
                      />
                      <div className="absolute top-3 right-3 text-2xl drop-shadow-lg bg-black/60 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center border border-white/30 shadow-md">
                        {selectedPanel.emotion}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 text-xs text-white bg-black/80 backdrop-blur-md p-2.5 rounded-xl border border-white/15 shadow-xl">
                        <span className="font-bold text-amber-300 mr-1.5">{t('modal_scene')}</span>
                        <span>{selectedPanel.scene_description}</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <VisualIllustration theme={selectedPanel.visual_theme} emotion={selectedPanel.emotion} />
                      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                        <div className="text-xs font-semibold text-slate-400 mb-1">{t('modal_scene_desc')}</div>
                        <p className="text-slate-300 leading-relaxed text-xs md:text-sm">{selectedPanel.scene_description}</p>
                      </div>
                    </>
                  )}

                  {/* 실시간 AI 이미지 생성 액션 바 (gemini-3.1-flash-image) */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={() => handleGenerateImage(selectedPanel)}
                      className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 text-white disabled:opacity-50 transition-all shadow-md shadow-indigo-500/20 active:scale-95 shrink-0"
                    >
                      <Camera className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                      <span>
                        {isGenerating 
                          ? t('modal_btn_generating') 
                          : modalImg 
                            ? t('modal_btn_redraw') 
                            : t('modal_btn_generate')}
                      </span>
                    </button>
                    {genMessage && (
                      <div className="text-[11px] text-indigo-300 font-mono bg-indigo-950/60 p-2 rounded-lg border border-indigo-500/30 flex-1 whitespace-normal leading-relaxed break-words">
                        {genMessage}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 text-xs md:text-sm">
                    <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                      <div className="text-xs font-semibold text-amber-400 mb-1">{t('modal_protagonist_monologue')}</div>
                      <p className="text-white leading-relaxed">&ldquo;{selectedPanel.character_dialogue}&rdquo;</p>
                    </div>

                    <div className="p-3 bg-indigo-950/60 rounded-xl border border-indigo-500/30">
                      <div className="text-xs font-semibold text-indigo-300 mb-1">{t('modal_chronos_advice')}</div>
                      <p className="text-indigo-200 leading-relaxed">{selectedPanel.agent_dialogue}</p>
                    </div>

                    <div className="p-3 bg-slate-950/90 rounded-xl border-l-4 border-amber-400 text-slate-400 italic">
                      📝 {selectedPanel.narration}
                    </div>
                  </div>
                </div>

                {/* 3. 하단 고정 푸터 */}
                <div className="p-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400 shrink-0 bg-slate-950/90">
                  <span>
                    {t('modal_life_balance_estimate')}{' '}
                    <strong className="text-emerald-400 font-mono text-sm">
                      {t('score_format', { score: selectedPanel.life_score })}
                    </strong>
                  </span>
                  <button
                    onClick={() => setSelectedPanel(null)}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-600/30 active:scale-95"
                  >
                    {t('modal_btn_close')}
                  </button>
                </div>
              </div>
            </div>
          );
        })(),
        document.body
      )}
    </div>
  );
}
