'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Header from '@/components/Header';
import InteractiveInputConsole from '@/components/InteractiveInputConsole';
import OrchestratorTraceViewer from '@/components/OrchestratorTraceViewer';
import GoalImpactMatrix from '@/components/GoalImpactMatrix';
import GoalConstitutionStudio from '@/components/GoalConstitutionStudio';
import DlpComparisonViewer from '@/components/DlpComparisonViewer';
import Log10Visualizer from '@/components/Log10Visualizer';
import ArbitrationConsole from '@/components/ArbitrationConsole';
import Log10ComicStripViewer from '@/components/Log10ComicStripViewer';
import ProgressivePipelineTracker from '@/components/ProgressivePipelineTracker';
import DeliberationHistoryTracker from '@/components/DeliberationHistoryTracker';
import DevLogInspector from '@/components/DevLogInspector';
import LifeVitalRadar from '@/components/LifeVitalRadar';
import EkispertActionCard from '@/components/EkispertActionCard';
import { Activity, Target, History, Sparkles } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function Home() {
  const locale = useLocale();
  const t = useTranslations('Page');
  
  // 사용자의 첫 진입점: "인생 헌법 & 5대 목표"를 먼저 설계하도록 기본값 'goals'로 설정!
  const [activeTab, setActiveTab] = useState<'goals' | 'dashboard' | 'history'>('goals');
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [isStreamingComplete, setIsStreamingComplete] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [inputPrefill] = useState<string>('');

  // 점진적 실시간 스트리밍(SSE) 심의 요청 핸들러 (폴백 배제: 실제 API 응답 직통 연동)
  const handleCustomSubmit = async (rawInput: string, microDeviation?: number, modelName?: string) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setCurrentStage(1);
    setIsStreamingComplete(false);
    setStatusMessage(t('status_layer0'));

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    try {
      const res = await fetch(`${apiUrl}/api/analyze/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_input: rawInput,
          micro_deviation: microDeviation,
          model_name: modelName,
          locale: locale,
        }),
      });

      if (!res.ok) {
        throw new Error(`백엔드 스트리밍 연결 오류 (HTTP ${res.status})`);
      }

      if (!res.body) {
        throw new Error('스트리밍 응답 바디가 비어 있습니다.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const jsonStr = trimmed.replace(/^data:\s*/, '');
          
          try {
            const eventPayload = JSON.parse(jsonStr);
            const { stage, data, error: stageErr } = eventPayload;

            if (stage === 'error' || stageErr) {
              const errMsg = stageErr || (data && data.error) || '심의 처리 중 오류가 발생했습니다.';
              setError(errMsg);
              setIsLoading(false);
              return;
            }

            if (stage === 'dlp') {
              setCurrentStage(1);
              setStatusMessage(t('status_layer0_done'));
              setAnalysisResult((prev: any) => ({ ...(prev || {}), ...data }));
            } else if (stage === 'orchestrator') {
              setCurrentStage(2);
              setStatusMessage(t('status_layer1'));
              setAnalysisResult((prev: any) => ({ ...(prev || {}), ...data }));
            } else if (stage === 'council') {
              setCurrentStage(3);
              setStatusMessage(t('status_layer2'));
              setAnalysisResult((prev: any) => ({ ...(prev || {}), ...data }));
            } else if (stage === 'governor') {
              setCurrentStage(4);
              setStatusMessage(t('status_layer3'));
              setAnalysisResult((prev: any) => ({ ...(prev || {}), ...data }));
            } else if (stage === 'trajectory_and_comic') {
              setCurrentStage(5);
              setStatusMessage(t('status_layer4'));
              setAnalysisResult((prev: any) => ({ ...(prev || {}), ...data }));
            } else if (stage === 'complete') {
              setCurrentStage(5);
              setIsStreamingComplete(true);
              setStatusMessage(t('status_complete'));
              setAnalysisResult(data);
            }
          } catch (pe) {
            console.warn('SSE 파싱 스킵:', pe);
          }
        }
      }

      setIsStreamingComplete(true);
    } catch (e: any) {
      console.error('심의 요청 실패:', e);
      setError(e.message || '심의 요청을 처리하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadHistoryRecord = (payload: any) => {
    setAnalysisResult(payload);
    setCurrentStage(5);
    setIsStreamingComplete(true);
    setStatusMessage(t('status_history_loaded'));
    setActiveTab('dashboard');
  };

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 md:px-6">
      <Header />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* 모드 전환 탭 (3단계 프로세스 구조) */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md gap-1">
            {/* 1단계: 헌법 & 5대 목표 (기본 진입) */}
            <button
              onClick={() => setActiveTab('goals')}
              className={`flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
                activeTab === 'goals'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>{t('tab_goals')}</span>
            </button>

            {/* 2단계: 실시간 거버넌스 심의 */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>{t('tab_dashboard')}</span>
            </button>

            {/* 3단계: 누적 히스토리 & 궤적 추적 */}
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>{t('tab_history')}</span>
            </button>
          </div>
        </div>

        {activeTab === 'goals' ? (
          /* 1. 목표 & 헌법 관리 탭 (첫 진입 화면) */
          <div className="animate-fade-in">
            <GoalConstitutionStudio 
              onProceedToDashboard={() => setActiveTab('dashboard')} 
            />
          </div>
        ) : activeTab === 'history' ? (
          /* 3. 누적 히스토리 추적 탭 */
          <div className="animate-fade-in">
            <DeliberationHistoryTracker 
              onLoadRecord={handleLoadHistoryRecord}
            />
          </div>
        ) : (
          /* 2. 관제 대시보드 탭 */
          <div className="space-y-8 animate-fade-in">
            {/* 라이프 바이탈 레이더 (대화 및 심의마다 실시간 양방향 갱신) */}
            <LifeVitalRadar 
              stateData={analysisResult?.state_dynamics}
              historyWindow={analysisResult?.history_window}
              isUpdating={isLoading}
            />

            {/* 대화형 직접 입력 콘솔 */}
            <InteractiveInputConsole
              onSubmit={handleCustomSubmit}
              isLoading={isLoading}
              initialText={inputPrefill}
            />

            {/* 에러 알림 */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center text-sm shadow-md">
                ⚠️ {error}
              </div>
            )}

            {/* 실시간 단계별 진행 파이프라인 트래커 */}
            {(isLoading || analysisResult) && (
              <ProgressivePipelineTracker
                currentStage={currentStage}
                isCompleted={isStreamingComplete || (!isLoading && !!analysisResult)}
                statusMessage={statusMessage}
                modelUsed={analysisResult?.model_used}
              />
            )}

            {/* 심의 결과 대시보드: 수신되는 단계마다 실시간 잠금 해제 (Progressive Reveal) */}
            {analysisResult && (
              <div className="space-y-8 animate-fade-in">
                {/* 1. Layer 0: DLP 개인정보 보호 뷰어 (Stage 1부터 가장 먼저 열림) */}
                {analysisResult.dlp_result && (
                  <div className="animate-fade-in">
                    <DlpComparisonViewer
                      originalText={analysisResult.raw_input}
                      sanitizedText={analysisResult.dlp_sanitized}
                      detectedInfoTypes={analysisResult.detected_info_types || []}
                    />
                  </div>
                )}

                {/* 2. Layer 1: 오케스트레이터 투명 감사 백로그 (Stage 2에 열림) */}
                {analysisResult.orchestration_trace && (
                  <div className="animate-fade-in">
                    <OrchestratorTraceViewer trace={analysisResult.orchestration_trace} />
                  </div>
                )}

                {/* 3. Layer 2 & 3: 도메인 위원회 & 최고 중재관 판결문 (Stage 3부터 즉시 열림, Stage 4에서 판결 완결) */}
                {analysisResult.council_verdict && (
                  <div className="animate-fade-in">
                    <ArbitrationConsole
                      councilVerdict={analysisResult.council_verdict}
                      governorRuling={analysisResult.governor_ruling}
                      modelUsed={analysisResult.model_used}
                    />
                  </div>
                )}

                {/* 3.5 Layer 5: Ekispert MCP 마이크로 모빌리티 행동 처방 (힐링 녹지 도보 환승) */}
                {analysisResult.ekispert_prescription && (
                  <div className="animate-fade-in">
                    <EkispertActionCard prescription={analysisResult.ekispert_prescription} />
                  </div>
                )}

                {/* 4. 5대 핵심 목표 5-Horizon 시계열 궤적 선그래프 및 영향도 매트릭스 (Stage 5에 도출) */}
                {analysisResult.goal_impacts && (
                  <div className="animate-fade-in">
                    <GoalImpactMatrix 
                      impacts={analysisResult.goal_impacts} 
                      compositeTrajectory={analysisResult.composite_trajectory}
                    />
                  </div>
                )}

                {/* 5. Log-10 5컷 웹툰 만화 크로니클 (Stage 5에 도출) */}
                {analysisResult.log10_comic && (
                  <div className="animate-fade-in">
                    <Log10ComicStripViewer comic={analysisResult.log10_comic} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 개발자용 실시간 API 및 LLM 로그 인스펙터 */}
      <DevLogInspector />
    </main>
  );
}
