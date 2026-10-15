'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { 
  BadgeDollarSign, 
  TrendingUp, 
  Home, 
  Scale, 
  AlertTriangle,
  ArrowDown,
  Handshake,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Minus,
  HelpCircle
} from 'lucide-react';

interface StanceData {
  stance: string;
  reasoning: string;
  agent_id?: string;
  agent_role?: string;
  applied_guardrails?: Record<string, any>;
  metrics?: Record<string, any>;
  model_used?: string;
}

interface ArbitrationConsoleProps {
  councilVerdict: {
    finance: StanceData;
    career?: StanceData;
    wellbeing: StanceData;
    model_used?: string;
    council_metadata?: Record<string, any>;
  };
  governorRuling?: {
    decision: string;
    violated_tenets: string[];
    reasoning: string;
    pareto_counter_offer: string | null;
    l2_review_conditions: string | null;
    model_used?: string;
  };
  modelUsed?: string;
}

export default function ArbitrationConsole({ councilVerdict, governorRuling, modelUsed }: ArbitrationConsoleProps) {
  const t = useTranslations('ArbitrationConsole');
  const getBadgeColor = (stance: string) => {
    switch (stance.toLowerCase()) {
      case 'approve':
      case '승인':
      case '찬성':
      case '承認':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'reject':
      case '기각':
      case '반대':
      case '棄却':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'conditional':
      case '조건부수정':
      case '조건부':
      case '条件付き修正':
      case '条件付き':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const getStanceText = (stance: string) => {
    switch (stance.toLowerCase()) {
      case 'approve': 
      case '승인':
      case '찬성':
      case '承認': return t('stanceApprove');
      case 'reject': 
      case '기각':
      case '반대':
      case '棄却': return t('stanceReject');
      case 'conditional': 
      case '조건부수정':
      case '조건부':
      case '条件付き修正':
      case '条件付き': return t('stanceConditional');
      default: return t('stanceNeutral');
    }
  };

  const getStanceIcon = (stance: string) => {
    switch (stance.toLowerCase()) {
      case 'approve':
      case '승인':
      case '찬성':
      case '承認': return <ThumbsUp className="w-4 h-4 mr-1" />;
      case 'reject':
      case '기각':
      case '반대':
      case '棄却': return <ThumbsDown className="w-4 h-4 mr-1" />;
      case 'conditional':
      case '조건부수정':
      case '조건부':
      case '条件付き修正':
      case '条件付き': return <HelpCircle className="w-4 h-4 mr-1" />;
      default: return <Minus className="w-4 h-4 mr-1" />;
    }
  };

  const isConflict = () => {
    const stances = [
      councilVerdict.finance.stance.toLowerCase(),
      councilVerdict.wellbeing.stance.toLowerCase()
    ];
    if (councilVerdict.career) stances.push(councilVerdict.career.stance.toLowerCase());
    
    // Check if there are differences
    const uniqueStances = new Set(stances);
    return uniqueStances.size > 1;
  };

  const renderAgentCard = (title: string, icon: React.ReactNode, data?: StanceData) => {
    if (!data) return null;
    return (
      <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-white/90 font-bold text-sm">
              {icon}
              {title}
            </div>
            {data.agent_role && (
              <span className="text-[10px] text-slate-400 font-normal mt-0.5">
                {data.agent_role}
              </span>
            )}
          </div>
          <div className={`px-2 py-1 rounded-md text-xs flex items-center shrink-0 ${getBadgeColor(data.stance)}`}>
            {getStanceIcon(data.stance)}
            {getStanceText(data.stance)}
          </div>
        </div>

        {data.applied_guardrails && (
          <div className="text-[10px] text-indigo-300 bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-500/20 flex items-center justify-between">
            <span className="text-slate-400">🛡️ {t("profileGuardrail")}</span>
            <span className="font-mono font-semibold text-indigo-200">
              {data.applied_guardrails.daily_budget ? `${t("dailyBudget", { budget: Number(data.applied_guardrails.daily_budget).toLocaleString() })}` : ''}
              {data.applied_guardrails.max_weekly_hours ? `${t("maxWeeklyHours", { hours: data.applied_guardrails.max_weekly_hours })}` : ''}
              {data.applied_guardrails.min_sleep_hours ? `${t("minSleepFamilyHobby", { sleep: data.applied_guardrails.min_sleep_hours, family: data.applied_guardrails.family_dinner_quota, hobby: data.applied_guardrails.hobby_block_quota })}` : ''}
            </span>
          </div>
        )}

        <div className="text-sm text-white/70 leading-relaxed bg-black/20 p-3 rounded-lg flex-1">
          {data.reasoning}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-slate-950/80 rounded-2xl p-6 border border-slate-800 shadow-2xl backdrop-blur-md flex flex-col gap-8">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <Scale className="w-6 h-6 text-blue-400" />
        {t("layer2_3Title")}
      </h2>

      {/* Domain Council */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-2">
          <span>Layer 2: Domain Council</span>
          <span className="text-xs font-normal text-blue-300 bg-blue-950/70 border border-blue-800/60 px-2 py-0.5 rounded-full font-mono">
            {councilVerdict.model_used || councilVerdict.finance?.model_used || modelUsed || 'Gemini 3.5 Flash'}
          </span>
        </h3>
        
        {isConflict() && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-3 rounded-xl flex items-center justify-between gap-3 text-xs md:text-sm font-medium shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t("conflictDetected")}</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/40 shrink-0">
              {t("verdictCompleted")}
            </span>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4">
          {renderAgentCard('Finance Agent 💰', <BadgeDollarSign className="w-5 h-5 text-emerald-400 hidden" />, councilVerdict.finance)}
          {renderAgentCard('Career Agent 📈', <TrendingUp className="w-5 h-5 text-blue-400 hidden" />, councilVerdict.career)}
          {renderAgentCard('Well-being Agent 🏠', <Home className="w-5 h-5 text-purple-400 hidden" />, councilVerdict.wellbeing)}
        </div>
      </div>

      {/* Separator */}
      <div className="flex flex-col items-center justify-center gap-2 py-2">
        <div className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        <div className="flex items-center gap-2 text-xs font-medium text-blue-400/80 bg-blue-950/30 px-4 py-1.5 rounded-full border border-blue-900/50">
          <ArrowDown className="w-3 h-3 animate-bounce" />
          {t("reportEscalation")}
          <ArrowDown className="w-3 h-3 animate-bounce hidden" />
        </div>
        <div className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      </div>

      {/* Chief Governor */}
      {governorRuling ? (
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-2">
            <span>Layer 3: Chief Governor</span>
            <span className="text-xs font-normal text-purple-300 bg-purple-950/70 border border-purple-800/60 px-2 py-0.5 rounded-full font-mono">
              {governorRuling.model_used || modelUsed || 'Gemini 3.5 Flash'}
            </span>
          </h3>
          
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-500/30 rounded-xl p-6 shadow-[0_0_30px_-10px_rgba(99,102,241,0.2)] relative">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/20 rounded-lg">
                  <Scale className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{t("governorVerdictTitle")}</h4>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg text-lg font-bold flex items-center border ${getBadgeColor(governorRuling.decision)}`}>
                {['승인', '承認', 'APPROVE', 'APPROVED'].includes(governorRuling.decision) ? t('verdictApprove') : 
                 ['기각', '棄却', 'REJECT', 'REJECTED'].includes(governorRuling.decision) ? t('verdictReject') : 
                 t('verdictConditional')}
              </div>
            </div>

            {governorRuling.violated_tenets.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {governorRuling.violated_tenets.map((tenet, idx) => (
                  <span key={idx} className="px-3 py-1 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {t("violation")}: {tenet}
                  </span>
                ))}
              </div>
            )}

            <blockquote className="border-l-4 border-indigo-500 pl-4 py-2 mb-6 text-indigo-100/90 italic text-sm md:text-base leading-relaxed bg-white/5 rounded-r-lg">
              "{governorRuling.reasoning}"
            </blockquote>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {governorRuling.pareto_counter_offer && (
                <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-4 flex gap-3 items-start">
                  <Handshake className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-blue-400 font-bold text-sm mb-1">Counter Offer</h5>
                    <p className="text-blue-200/80 text-sm">{governorRuling.pareto_counter_offer}</p>
                  </div>
                </div>
              )}
              
              {governorRuling.l2_review_conditions && (
                <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-4 flex gap-3 items-start">
                  <Clock className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-amber-400 font-bold text-sm mb-1">{t("l2ReviewConditions")}</h5>
                    <p className="text-amber-200/80 text-sm">{governorRuling.l2_review_conditions}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/20 shadow-lg animate-pulse">
          <div className="flex items-center gap-2.5 text-sm font-bold text-indigo-300">
            <Scale className="w-5 h-5 text-indigo-400 animate-spin" />
            <span>{t("governorDrafting")}</span>
          </div>
          <p className="text-xs text-slate-400">
            {t("governorDraftingDesc")}
          </p>
        </div>
      )}
    </div>
  );
}
