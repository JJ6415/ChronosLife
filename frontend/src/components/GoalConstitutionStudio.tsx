'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { 
  Target, 
  Sparkles, 
  Check, 
  Edit3, 
  Save, 
  Shield, 
  Send, 
  MessageSquare, 
  Bot, 
  User, 
  RefreshCw,
  Zap,
  Cpu,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Activity,
  HeartHandshake,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  X
} from 'lucide-react';
import { AVAILABLE_MODELS, ModelOption } from './InteractiveInputConsole';
import GeminiLiveAvatar3D from './GeminiLiveAvatar3D';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface GoalItem {
  id: string;
  category: string;
  icon: string;
  title: string;
  target_value: string;
  current_value: string;
  rule: string;
  tenet: string;
  progress: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  focusCategory?: string;
  mode?: 'chat' | 'voice';
}

const INITIAL_PROMPTS_MAP: Record<string, string[]> = {
  ko: [
    "🏃 야근이 너무 많아서 주말 취미(러닝)와 개인 시간을 꼭 지키고 싶어요.",
    "👨‍👩‍👧 가족과 함께하는 저녁 식사를 주 3회 이상 사수하는 불변 헌법을 세워줘.",
    "💰 3년 내 시드머니 1억을 모으면서도 번아웃을 피하는 재정 규칙을 만들어줘.",
    "📈 연봉을 높이고 싶은데 워라밸과 타협할 수 있는 마지노선은 주 52시간이야."
  ],
  en: [
    "🏃 Too much overtime; I want to protect weekend running and personal time.",
    "👨‍👩‍👧 Establish an unchangeable constitution protecting family dinner at least 3x/week.",
    "💰 Create financial rules to accumulate 100M KRW seed in 3 years without burnout.",
    "📈 I want a higher salary, but my bottom line for work-life balance is 52 hours/week."
  ],
  ja: [
    "🏃 残業が多すぎるため、週末の趣味(ランニング)と個人の時間を守りたいです。",
    "👨‍👩‍👧 家族との夕食を週3回以上死守する不変の憲法を制定してください。",
    "💰 バーンアウトを避けつつ3年でシードマネー1億ウォンを貯める財政ルールを作って。",
    "📈 年収を上げたいですが、ワークライフバランスの限界線は週52時間です。"
  ]
};

const VOICE_SIMULATION_CHIPS_MAP: Record<string, Array<{label: string; text: string}>> = {
  ko: [
    { label: "🏃 주말 러닝 4시간 & 수면 7시간 사수", text: "나 요즘 너무 피로해서 주말 러닝 4시간과 평일 수면 7시간을 절대 침해받지 않는 헌법을 만들어줘." },
    { label: "👨‍👩‍👧 가족 식사 주 3회 불변 조항", text: "가족들과 함께하는 저녁 식사를 주 3회 이상 무조건 사수하는 규칙을 헌법에 넣어줘." },
    { label: "💰 3년 1억 시드 & 복리 방어선", text: "3년 안에 시드머니 1억을 모으면서 하루 가처분 지출을 3만 5천 원으로 통제하는 재정 조항을 세워줘." },
    { label: "💼 주 52시간 근무 상한 마지노선", text: "어떤 높은 연봉 오퍼가 오더라도 주 52시간을 초과하는 근무는 거절하는 커리어 헌법을 세우고 싶어." }
  ],
  en: [
    { label: "🏃 Weekend Running 4h & 7h Sleep", text: "I'm exhausted lately; please create a constitution safeguarding 4h weekend running and 7h weekday sleep." },
    { label: "👨‍👩‍👧 Family Dinner 3x/week Clause", text: "Add a rule to the constitution guaranteeing dinner with family at least 3 times a week." },
    { label: "💰 3-Year 100M Seed & Compound Defense", text: "Establish a financial article to gather 100M KRW in 3 years while capping daily disposable spending at 35,000 KRW." },
    { label: "💼 52-Hour Weekly Work Cap", text: "I want a career constitution rejecting any high-paying offer that exceeds 52 hours of work per week." }
  ],
  ja: [
    { label: "🏃 週末ラン4時間＆睡眠7時間死守", text: "最近とても疲れているので、週末のランニング4時間と平日の睡眠7時間を侵害されない憲法を作ってください。" },
    { label: "👨‍👩‍👧 家族との夕食週3回不変条項", text: "家族と一緒に食べる夕食を週3回以上無条件で死守するルールを憲法に入れてください。" },
    { label: "💰 3年1億シード＆複利防衛線", text: "3年以内にシードマネー1億ウォンを貯めつつ、1日の可処分支出を3万5千ウォンに抑える財政条項を作って。" },
    { label: "💼 週52時間勤務上限リミット", text: "どんなに高い給与オファーが来ても、週52時間を超える勤務は断るキャリア憲法を制定したいです。" }
  ]
};

const WELCOME_MESSAGES_MAP: Record<string, string> = {
  ko: '반갑습니다! 저는 ChronosLife의 수석 인생 헌법 설계관(Gemini Constitution Architect)입니다. 30년 인생을 지탱할 제1조~제5조 헌법과 5대 목표를 함께 수립합니다. 텍스트 채팅 또는 상단의 [Gemini Live 실시간 음성] 모드를 통해 편안하게 당신의 가치관을 말씀해 주세요.',
  en: "Welcome! I am ChronosLife's Chief Constitution Architect. Together, we establish Articles 1 through 5 and the 5 life goals that will anchor your next 30 years. Feel free to share your values via text chat or [Gemini Live Voice] mode above.",
  ja: 'ようこそ！ChronosLifeの首席人生憲法設計官（Gemini Constitution Architect）です。30年の人生を支える第1条〜第5条の憲法と5大目標を共に策定します。テキストチャットまたは上の[Gemini Live音声]モードを通じて、ご自身の価値観を自由にお話しください。'
};

const FALLBACK_GOALS_MAP: Record<string, Record<string, GoalItem>> = {
  ko: {
    family: {
      id: "family",
      category: "가족 (Family)",
      icon: "👨‍👩‍👧",
      title: "가족 유대감 및 저녁 일상 사수",
      target_value: "주당 가족 저녁 식사 최소 3회 이상",
      current_value: "이번 주 가족 식사 2회 달성",
      rule: "주말 가족 행사 절대 우선 배정, 평일 저녁 상호 경청 시간 확보",
      tenet: "제1조 (가족 유대권): 어떤 금전적 이익도 가족과의 기본 식사 시간(주 3회)을 영구히 침해할 수 없다.",
      progress: 60
    },
    hobby: {
      id: "hobby",
      category: "개인 취미 (Hobby)",
      icon: "🎨",
      title: "개인 취미 몰입 쿼터 사수 (음악·러닝·창작)",
      target_value: "주당 개인 취미 몰입 4시간 쿼터",
      current_value: "이번 주 취미 시간 2.5시간 확보",
      rule: "주말 취미 블록 강제 잠금, 업무 연락 완전 차단",
      tenet: "제2조 (개인 취미권): 주당 4시간의 개인 취미 몰입 쿼터는 번아웃 방어와 자아실현의 불변 헌법이다.",
      progress: 50
    },
    health: {
      id: "health",
      category: "건강 (Health)",
      icon: "🏃",
      title: "수면 부채 제로 및 생체 항상성 유지",
      target_value: "일일 수면 7시간 이상, 심박변이도(HRV) 정상",
      current_value: "주간 평균 수면 6.2시간 (수면 부채 주의)",
      rule: "연속 3일 22시 이후 야근 금지, 충동 배달음식 방어",
      tenet: "제3조 (신체 건강권): 신체 건강(수면 7시간, 번아웃 지수 ≤ 0.70)은 모든 외적 성취에 선행하는 절대 기본권이다.",
      progress: 55
    },
    career: {
      id: "career",
      category: "커리어 (Career)",
      icon: "📈",
      title: "지속 가능한 전문성 강화 및 시장가치 극대화",
      target_value: "전문성 레벨 Tier 1 달성 (주 52시간 캡 준수)",
      current_value: "주간 근무 평균 48시간",
      rule: "주당 최대 노동 시간 52시간 상한 엄수, 고갈형 노동 거부권 행사",
      tenet: "제4조 (지속가능 성장권): 커리어 성장은 주 52시간 상한 내에서 추구되어야 하며 생체 항상성을 파괴하는 과노동은 영구 배제한다.",
      progress: 75
    },
    finance: {
      id: "finance",
      category: "재정 (Finance)",
      icon: "💰",
      title: "30년 복리 순자산 10억 및 은퇴 자립",
      target_value: "은퇴 자산 10억 원",
      current_value: "현재 시드 8,500만 원",
      rule: "일일 가처분 40,000원 한도 준수, 고위험 레버리지 차단",
      tenet: "제5조 (평생 재정권): 일일 가처분 40,000원 한도를 수호하고, 30년 은퇴 자산 목표를 연간 5% 이상 훼손하는 단일 결정은 자동 기각된다.",
      progress: 68
    }
  },
  ja: {
    family: {
      id: "family",
      category: "家族 (Family)",
      icon: "👨‍👩‍👧",
      title: "家族の絆と夕食ルーティンの死守",
      target_value: "週3回以上の家族での夕食",
      current_value: "今週の家族での夕食2回達成",
      rule: "週末の家族行事を最優先、平日の夜は互いに傾聴する時間を確保",
      tenet: "第1条 (家族の絆権): いかなる金銭的利益も家族との基本的な食事時間(週3回)を恒久的に侵害することはできない。",
      progress: 60
    },
    hobby: {
      id: "hobby",
      category: "個人の趣味 (Hobby)",
      icon: "🎨",
      title: "個人の趣味没頭クォータの死守 (音楽・ランニング・創作)",
      target_value: "週4時間の個人趣味没頭クォータ",
      current_value: "今週の趣味時間2.5時間確保",
      rule: "週末の趣味ブロックを強制ロック、業務連絡を完全遮断",
      tenet: "第2条 (個人の趣味権): 週4時間の個人趣味没頭クォータは、バーンアウト防止と自己実現のための不変の憲法である。",
      progress: 50
    },
    health: {
      id: "health",
      category: "健康 (Health)",
      icon: "🏃",
      title: "睡眠負債ゼロと生体恒常性の維持",
      target_value: "1日7時間以上の睡眠、心拍変動(HRV)正常",
      current_value: "週間平均睡眠6.2時間 (睡眠負債注意)",
      rule: "3日連続22時以降の残業禁止、衝動的な夜食デリバリーを防御",
      tenet: "第3条 (身体健康権): 身体の健康(睡眠7時間、バーンアウト指数≤0.70)は、すべての外的な成果に優先する絶対的基本権である。",
      progress: 55
    },
    career: {
      id: "career",
      category: "キャリア (Career)",
      icon: "📈",
      title: "持続可能な専門性の強化と市場価値の最大化",
      target_value: "専門性レベルTier 1達成 (週52時間上限遵守)",
      current_value: "週間平均勤務48時間",
      rule: "週最大労働時間52時間上限を厳守、消耗型労働の拒否権を行使",
      tenet: "第4条 (持続的成長権): キャリアの成長は週52時間上限の中で追求されるべきであり、生体恒常性を破壊する過重労働は恒久的に排除する。",
      progress: 75
    },
    finance: {
      id: "finance",
      category: "財政 (Finance)",
      icon: "💰",
      title: "30年複利純資産10億ウォンとリタイア自立",
      target_value: "リタイア資産10億ウォン",
      current_value: "現在のシード資産8,500万ウォン",
      rule: "1日可処分予算40,000ウォン制限を遵守、高リスクレバレッジを遮断",
      tenet: "第5条 (生涯財政権): 1日可処分40,000ウォンの制限を守り、30年のリタイア資産目標を年間5%以上損なう単一の決定は自動棄却される。",
      progress: 68
    }
  },
  en: {
    family: {
      id: "family",
      category: "Family",
      icon: "👨‍👩‍👧",
      title: "Protect Family Bonding & Evening Routine",
      target_value: "Family dinners at least 3 times per week",
      current_value: "2 family dinners achieved this week",
      rule: "Prioritize weekend family events, ensure active listening on weekday evenings",
      tenet: "Article 1 (Family Bond): No financial gain may permanently compromise basic family dinner time (3x/week).",
      progress: 60
    },
    hobby: {
      id: "hobby",
      category: "Personal Hobby",
      icon: "🎨",
      title: "Safeguard Hobby Immersion Quota (Music, Running, Creation)",
      target_value: "4-hour weekly personal hobby immersion quota",
      current_value: "2.5 hours of hobby time secured this week",
      rule: "Enforce weekend hobby block locking, completely block work notifications",
      tenet: "Article 2 (Personal Hobby): A weekly 4-hour hobby quota is an unchangeable constitution for burnout prevention and self-realization.",
      progress: 50
    },
    health: {
      id: "health",
      category: "Health",
      icon: "🏃",
      title: "Zero Sleep Debt & Maintain Biological Homeostasis",
      target_value: "7+ hours daily sleep, normal HRV",
      current_value: "Weekly average sleep 6.2 hours (Sleep debt warning)",
      rule: "No overtime past 22:00 for 3 consecutive days, guard against impulsive late-night snacks",
      tenet: "Article 3 (Physical Health): Physical health (7h sleep, burnout index <= 0.70) is an absolute basic right preceding all external achievements.",
      progress: 55
    },
    career: {
      id: "career",
      category: "Career",
      icon: "📈",
      title: "Sustainable Expertise Enhancement & Maximize Market Value",
      target_value: "Achieve Tier 1 expertise level (Comply with 52h weekly cap)",
      current_value: "Weekly average work 48 hours",
      rule: "Strictly observe 52-hour weekly maximum work cap, exercise veto against depleting labor",
      tenet: "Article 4 (Sustainable Growth): Career growth must be pursued within the 52-hour weekly cap; depleting overwork is permanently banned.",
      progress: 75
    },
    finance: {
      id: "finance",
      category: "Finance",
      icon: "💰",
      title: "30-Year Compound Net Assets 1B KRW & Retirement Independence",
      target_value: "Retirement assets 1,000,000,000 KRW",
      current_value: "Current seed 85,000,000 KRW",
      rule: "Comply with daily disposable budget of 40,000 KRW, block high-risk leverage",
      tenet: "Article 5 (Lifelong Financial Right): Protect the 40,000 KRW daily disposable limit; any decision compromising retirement assets by >5%/yr is auto-rejected.",
      progress: 68
    }
  }
};

interface GoalConstitutionStudioProps {
  onProceedToDashboard?: () => void;
}

export default function GoalConstitutionStudio({ onProceedToDashboard }: GoalConstitutionStudioProps) {
  const t = useTranslations('GoalConstitutionStudio');
  const locale = useLocale();

  const activeInitialPrompts = INITIAL_PROMPTS_MAP[locale] || INITIAL_PROMPTS_MAP.ko;
  const activeVoiceChips = VOICE_SIMULATION_CHIPS_MAP[locale] || VOICE_SIMULATION_CHIPS_MAP.ko;
  const activeWelcomeMessage = WELCOME_MESSAGES_MAP[locale] || WELCOME_MESSAGES_MAP.ko;

  // 모드 전환: 'chat' (텍스트 채팅) vs 'live' (Gemini Live 실시간 양방향 음성 대화)
  const [interfaceMode, setInterfaceMode] = useState<'chat' | 'live'>('live');

  const [goals, setGoals] = useState<Record<string, GoalItem>>(() => {
    return FALLBACK_GOALS_MAP[locale] || FALLBACK_GOALS_MAP.ja || {};
  });
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<GoalItem>>({});
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // 대화 및 음성 메시지 히스토리
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: activeWelcomeMessage,
      timestamp: '방금 전'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [lastFocusCategory, setLastFocusCategory] = useState<string | null>(null);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(activeInitialPrompts);
  const [isDynamicPrompts, setIsDynamicPrompts] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.5-flash-lite');
  const [availableModels, setAvailableModels] = useState<ModelOption[]>(AVAILABLE_MODELS);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // ── Gemini Live 실시간 음성 상태 ──
  const [isLiveActive, setIsLiveActive] = useState(false);
  const isLiveActiveRef = useRef<boolean>(false);
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSpeakingRef = useRef<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [audioVolumeBars, setAudioVolumeBars] = useState<number[]>([15, 25, 45, 70, 90, 60, 40, 20, 35, 65, 80, 50]);
  const [liveWsStatus, setLiveWsStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('disconnected');
  const [micLevel, setMicLevel] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [showMicHelp, setShowMicHelp] = useState<boolean>(false);
  const [liveInputText, setLiveInputText] = useState('');

  // 오디오 스트림 및 WebSocket 레퍼런스
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeAudioSourcesRef = useRef<any[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingQueueRef = useRef<boolean>(false);
  const nextAudioStartTimeRef = useRef<number>(0);
  const speakingTimeoutRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // 1. 초기 목표 및 모델 로드
  const fetchGoals = async () => {
    setIsLoadingGoals(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await fetch(`${apiUrl}/api/goals?locale=${locale}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.goals) {
        setGoals(data.goals);
      }
    } catch (e) {
      console.warn('Backend /api/goals is currently unreachable, using localized fallback goals:', e);
      setGoals(prev => (prev && Object.keys(prev).length > 0) ? prev : (FALLBACK_GOALS_MAP[locale] || FALLBACK_GOALS_MAP.ja));
    } finally {
      setIsLoadingGoals(false);
    }
  };

  useEffect(() => {
    fetchGoals();
    if (!isDynamicPrompts) {
      setSuggestedPrompts(activeInitialPrompts);
    }
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [{
          id: 'welcome',
          role: 'assistant',
          content: activeWelcomeMessage,
          timestamp: '방금 전'
        }];
      }
      return prev;
    });

    const fetchDynamicModels = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const res = await fetch(`${apiUrl}/api/models`);
        if (res.ok) {
          const data = await res.json();
          if (data.models && data.models.length > 0) {
            setAvailableModels(data.models);
          }
        }
      } catch (e) {
        console.warn('Failed to load dynamic models in GoalConstitutionStudio:', e);
      }
    };
    fetchDynamicModels();
  }, [locale]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, liveTranscript]);

  // 실시간 오디오 파형 타이머
  useEffect(() => {
    let interval: any = null;
    if (isListening || isSpeaking) {
      interval = setInterval(() => {
        setAudioVolumeBars(prev => prev.map(() => Math.floor(Math.random() * 85) + 15));
      }, 90);
    } else {
      setAudioVolumeBars([15, 20, 25, 20, 15, 20, 25, 20, 15, 20, 25, 20]);
    }
    return () => clearInterval(interval);
  }, [isListening, isSpeaking]);

  // ── Gemini 3.8 Live WebSocket URL 동적 계산 (Cloud Run wss:// 자동 지원) ──
  const getWsUrl = () => {
    if (process.env.NEXT_PUBLIC_WS_URL) {
      const base = process.env.NEXT_PUBLIC_WS_URL;
      return base.includes('?') ? `${base}&locale=${locale}` : `${base}?locale=${locale}`;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl && apiUrl.startsWith('http')) {
      const wsProtocol = apiUrl.startsWith('https') ? 'wss:' : 'ws:';
      const cleanHost = apiUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
      return `${wsProtocol}//${cleanHost}/ws/gemini-live?locale=${locale}`;
    }
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${window.location.hostname}:8080/ws/gemini-live?locale=${locale}`;
    }
    return `ws://localhost:8080/ws/gemini-live?locale=${locale}`;
  };

  // ── Gemini 3.8 Live WebSocket 연결 관리 ──
  const connectGeminiLiveWs = () => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const wsUrl = getWsUrl();
      setLiveWsStatus('connecting');

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setLiveWsStatus('connected');
        console.log('🎙️ Gemini 3.8 Live WebSocket connected to:', wsUrl);
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'session_connected') {
            setLiveWsStatus('connected');
            const defaultMsg = locale === 'ja'
              ? 'Gemini 3.8 Live API セッションが接続されました。お話しください。'
              : (locale === 'en' ? 'Gemini 3.8 Live session connected. Speak freely.' : 'Gemini 3.8 Live 세션이 연결되었습니다. 말씀하세요.');
            setLiveTranscript(data.message || defaultMsg);
          } else if (data.type === 'audio_chunk') {
            // 네이티브 PCM 오디오 청크 큐잉 및 실시간 스케줄링 재생
            playNativePcmChunk(data.data);
          } else if (data.type === 'interrupted') {
            // 사용자 발화로 인한 인터럽트 처리 - 오디오 버퍼 즉시 삭제 (Live API 권장사항)
            interruptSpeaking();
          } else if (data.type === 'turn_complete') {
            // 한 턴의 답변이 완료됨 -> 사용자 경청 상태 복귀
            setIsChatLoading(false);
            setTimeout(() => {
              if (!isSpeakingRef.current) {
                setIsSpeaking(false);
                isSpeakingRef.current = false;
                const listenMsg = locale === 'ja'
                  ? '🎙️ 聞いています。続けて次の価値観や考えをお話しください！'
                  : (locale === 'en' ? '🎙️ Listening. Continue speaking!' : '🎙️ 듣고 있습니다. 계속해서 다음 가치관이나 생각을 말씀하세요!');
                setLiveTranscript(listenMsg);
              }
            }, 1000);
          } else if (data.type === 'goal_updated') {
            // Tool call로 목표 갱신
            if (data.all_goals) {
              setGoals(data.all_goals);
            }
            setLastFocusCategory(data.category);
            const notice = data.message || (
              locale === 'ja'
                ? `Gemini 3.8 Liveが[${data.category.toUpperCase()}]憲法をリアルタイム更新しました。`
                : `Gemini 3.8 Live가 [${data.category.toUpperCase()}] 헌법을 실시간 갱신했습니다.`
            );
            setSaveMessage(notice);

            // 대화 히스토리에 헌법 수립 카드 자동 누적
            const cardPrefix = locale === 'ja' ? `🎯 [${data.category.toUpperCase()} 憲法確立]` : `🎯 [${data.category.toUpperCase()} 헌법 확립]`;
            const assistantMsg: ChatMessage = {
              id: Date.now().toString(),
              role: 'assistant',
              content: `${cardPrefix} "${data.goal?.title || ''}" - ${data.goal?.tenet || ''}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              focusCategory: data.category,
              mode: 'voice'
            };
            setMessages(prev => [...prev, assistantMsg]);
            setTimeout(() => setSaveMessage(null), 5000);
          } else if (data.type === 'error') {
            console.warn('Gemini Live WS Error:', data.message);
          }
        } catch (e) {
          console.error('Error parsing live WS message:', e);
        }
      };

      ws.onerror = (e) => {
        console.warn('Gemini Live WS connection failed:', e);
        setLiveWsStatus('error');
      };

      ws.onclose = () => {
        setLiveWsStatus('disconnected');
        console.log('🎙️ Gemini Live WS closed.');
        // 라이브 모드가 활성화되어 있다면 자동으로 재연결을 시도하여 연속 대화 보장
        if (isLiveActiveRef.current) {
          console.log('🎙️ Live mode active, auto-reconnecting Gemini Live WS in 1500ms...');
          setTimeout(() => {
            if (isLiveActiveRef.current) {
              connectGeminiLiveWs();
            }
          }, 1500);
        }
      };
    } catch (err) {
      console.warn('Could not establish WS connection:', err);
      setLiveWsStatus('error');
    }
  };

  // ── 네이티브 PCM 오디오 청크 디코딩 및 실시간 무손실 스케줄링 재생 ──
  const playNativePcmChunk = async (base64Data: string) => {
    if (isAudioMuted || !base64Data) return;

    try {
      // 1. 청크 도착 즉시 로딩 스피너 해제 및 발화 상태 활성화 (즉각적 체감 반응)
      setIsChatLoading(false);
      setIsSpeaking(true);
      isSpeakingRef.current = true;

      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 16비트 Signed PCM 정렬 보장 -> Float32 변환
      const alignedLength = len - (len % 2);
      const int16Array = new Int16Array(bytes.buffer, bytes.byteOffset, alignedLength / 2);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioCtx({ sampleRate: 24000 });
      }

      const audioCtx = audioContextRef.current;
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const audioBuffer = audioCtx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      
      source.onended = () => {
        activeAudioSourcesRef.current = activeAudioSourcesRef.current.filter(s => s !== source);
      };
      activeAudioSourcesRef.current.push(source);

      // Web Audio API 정확한 시간 스케줄링 (청크 간 끊김 및 딜레이 0ms)
      const now = audioCtx.currentTime;
      const startTime = Math.max(now, nextAudioStartTimeRef.current);
      source.start(startTime);
      nextAudioStartTimeRef.current = startTime + audioBuffer.duration;

      // 발화 종료 타이머 동적 갱신
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
      }
      const remainingTimeMs = Math.max(150, (nextAudioStartTimeRef.current - now) * 1000);
      speakingTimeoutRef.current = setTimeout(() => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
      }, remainingTimeMs);

    } catch (e) {
      console.warn('PCM audio decode error:', e);
    }
  };

  // ── 브라우저 마이크 16kHz PCM 실시간 스트리밍 캡처 ──
  const startNativeMicStream = async () => {
    try {
      setMicError(null);
      connectGeminiLiveWs();

      if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('브라우저에서 마이크 API(MediaDevices)를 지원하지 않거나 보안 컨텍스트(HTTPS 또는 localhost)가 아닙니다.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { 
          sampleRate: 16000, 
          channelCount: 1, 
          echoCancellation: true, 
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;

      isListeningRef.current = true;
      setIsListening(true);

      processor.onaudioprocess = (e) => {
        if (!isListeningRef.current) return;
        const inputData = e.inputBuffer.getChannelData(0);

        // 1. 실시간 RMS 음량 계산 (파형 및 레벨 동기화)
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        const vol = Math.min(100, Math.floor(rms * 500));
        setMicLevel(vol);

        if (vol > 3) {
          setAudioVolumeBars(prev => prev.map(() => Math.min(100, Math.max(15, vol + Math.floor(Math.random() * 25)))));
        }

        // 2. Float32 -> 16bit Linear PCM 변환
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // 3. Base64 인코딩 후 WebSocket 전송
        // SpeechRecognition을 지원하지 않는 브라우저이거나 마이크 단독 모드일 때만 raw PCM 전송 (중복 입력 충돌 방지)
        const hasSpeechRec = typeof window !== 'undefined' && Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
        if (!hasSpeechRec && wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !isSpeakingRef.current) {
          const u8 = new Uint8Array(pcmData.buffer);
          let binary = '';
          const len = u8.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(u8[i]);
          }
          const b64 = btoa(binary);
          wsRef.current.send(JSON.stringify({
            type: 'audio_pcm',
            data: b64
          }));
        }
      };

      // 하울링 방지 0 gain 연결
      const zeroGain = audioCtx.createGain();
      zeroGain.gain.value = 0;
      source.connect(processor);
      processor.connect(zeroGain);
      zeroGain.connect(audioCtx.destination);

      setLiveTranscript('마이크가 정상 연결되었습니다. 편안하게 말씀하세요!');
    } catch (err: any) {
      console.warn('Microphone permission error or unsupported:', err);
      isListeningRef.current = false;
      setIsListening(false);
      setMicLevel(0);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError('마이크 권한이 차단되었습니다. 브라우저 주소창 좌측의 자물쇠/마이크 아이콘을 클릭하여 권한을 [허용]으로 변경 후 {t("btnRefresh")}해 주세요.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setMicError('마이크 장치를 찾을 수 없습니다. 마이크 연결 상태 및 윈도우 사운드 설정을 확인하시거나 아래 텍스트 입력을 사용해 주세요.');
      } else {
        setMicError(`마이크 연결 오류: ${err.message || '마이크 장치 및 권한 상태를 확인해주세요.'}`);
      }
    }
  };

  const stopNativeMicStream = () => {
    isListeningRef.current = false;
    setIsListening(false);
    setMicLevel(0);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
  };

  // ── Gemini Live 음성 처리 공통 핸들러 (텍스트 및 프리셋) ──
  const processVoiceInput = async (voiceText: string) => {
    if (!voiceText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: voiceText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: 'voice'
    };

    setMessages(prev => [...prev, userMsg]);
    setLiveTranscript(`"${voiceText}"`);
    setIsChatLoading(true);

    // 1. WebSocket이 열려있으면 네이티브 Gemini 3.8 Live로 즉시 전송!
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'text',
        text: voiceText
      }));
      return;
    }

    // 라이브 모드 중인데 WebSocket이 일시 끊겼다면 즉시 재연결 대기 후 WebSocket 전송
    if (isLiveActiveRef.current) {
      connectGeminiLiveWs();
      let waitCount = 0;
      while (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING && waitCount < 15) {
        await new Promise(r => setTimeout(r, 100));
        waitCount++;
      }
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'text',
          text: voiceText
        }));
        return;
      }
    }

    // 2. WebSocket 연결 불가 시에만 HTTP API 폴백
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await fetch(`${apiUrl}/api/goals/live-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          voice_transcript: voiceText,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
          model_name: 'gemini-3.5-flash-lite',
          locale: locale
        })
      });

      if (!res.ok) throw new Error('Live 음성 통신 실패');

      const data = await res.json();
      const defaultReply = locale === 'ja'
        ? 'あなたの価値観に合わせて人生憲法をリアルタイム更新しました。'
        : (locale === 'en' ? 'Updated your life constitution according to your values.' : '당신의 가치관에 맞춰 헌법을 실시간 갱신했습니다.');
      const reply = data.voice_reply || data.reply || defaultReply;

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        focusCategory: data.focus_category,
        mode: 'voice'
      };

      setMessages(prev => [...prev, assistantMsg]);

      if (data.updated_goals) {
        setGoals(data.updated_goals);
        setLastFocusCategory(data.focus_category);
        const notice = locale === 'ja'
          ? `[${data.focus_category?.toUpperCase()}] 憲法条項がリアルタイム更新されました。`
          : `[${data.focus_category?.toUpperCase()}] 헌법 조항이 실시간 갱신되었습니다.`;
        setSaveMessage(notice);
        setTimeout(() => setSaveMessage(null), 4000);
      }

      if (data.suggested_next_prompts && data.suggested_next_prompts.length > 0) {
        setSuggestedPrompts(data.suggested_next_prompts);
        setIsDynamicPrompts(true);
      }

      // CRITICAL FIX: HTTP 폴백 모드에서는 네이티브 PCM 스트림이 없으므로 브라우저 TTS를 반드시 실행하여 제미니의 음성을 들려줌!
      speakText(reply);

    } catch (e) {
      console.error('Error processing live voice:', e);
      const errMsg = locale === 'ja'
        ? '一時的な音声通信の遅延が発生しました。もう一度お話しいただけますか？'
        : '일시적인 음성 통신 지연이 발생했습니다. 다시 말씀해 주시겠어요?';
      speakText(errMsg);
    } finally {
      setIsChatLoading(false);
    }
  };

  // ── Gemini 실시간 발화 즉각 중단 및 끼어들기 (Barge-in) ──
  const interruptSpeaking = () => {
    console.log('⚡ Gemini Live Barge-in triggered: Stopping audio output.');
    nextAudioStartTimeRef.current = 0;
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    
    // 이전에 큐잉된 모든 AudioBufferSourceNode 즉시 중단
    activeAudioSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // 이미 종료된 소스 무시
      }
    });
    activeAudioSourcesRef.current = [];

    if (speakingTimeoutRef.current) {
      clearTimeout(speakingTimeoutRef.current);
    }
    
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    const bargeMsg = locale === 'ja' ? 'お話しください！聞いています...' : (locale === 'en' ? 'Listening to you...' : '말씀하세요! 경청하고 있습니다...');
    setLiveTranscript(bargeMsg);
  };

  // ── 브라우저 TTS 폴백 (로케일에 맞춘 자연스러운 다국어 음성 출력) ──
  const speakText = (text: string) => {
    if (isAudioMuted || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const langMap: Record<string, string> = { ja: 'ja-JP', en: 'en-US', ko: 'ko-KR' };
      utterance.lang = langMap[locale] || 'ja-JP';

      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const targetPrefix = locale.toLowerCase();
          const matched = voices.find(v => v.lang.toLowerCase().replace('_', '-').startsWith(targetPrefix)) ||
                          voices.find(v => v.lang.toLowerCase().includes(targetPrefix));
          if (matched) {
            utterance.voice = matched;
          }
        }
      } catch (ve) {
        // Voice selection error fallback
      }

      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      speechSynthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('speakText error:', err);
      setIsSpeaking(false);
    }
  };

  // ── 브라우저 마이크 시작 (SpeechRecognition - 로케일 일치 STT) ──
  const startListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const alertMsg = locale === 'ja'
        ? 'お使いのブラウザは音声認識をサポートしていません。Chromeブラウザを推奨します。下のクイック発話チップでもテスト可能です。'
        : '사용하시는 브라우저가 음성 인식을 지원하지 않습니다. Chrome 브라우저를 권장합니다. 하단의 빠른 음성 발화 칩으로 즉시 테스트하실 수 있습니다.';
      alert(alertMsg);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const langMap: Record<string, string> = { ja: 'ja-JP', en: 'en-US', ko: 'ko-KR' };
      recognition.lang = langMap[locale] || 'ja-JP';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        const startMsgMap: Record<string, string> = {
          ja: 'マイクが接続されました。お話しください。',
          ko: '마이크가 연결되었습니다. 계속해서 말씀하세요.',
          en: 'Microphone connected. Speak freely.'
        };
        setLiveTranscript(startMsgMap[locale] || startMsgMap.ja);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setLiveTranscript(final || interim);
        if (final && final.trim()) {
          // Gemini가 말하고 있을 때 사용자가 말을 시작하면 즉각 끼어들기 (Barge-in)!
          if (isSpeakingRef.current) {
            console.log('⚡ Barge-in voice detected while speaking:', final);
            interruptSpeaking();
          }
          processVoiceInput(final.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setIsListening(false);
          isListeningRef.current = false;
        }
      };

      recognition.onend = () => {
        // Live 세션이 켜져 있는 동안은 계속해서 마이크를 자동으로 재시작하여 연속 대화 유지!
        if (isLiveActiveRef.current) {
          try {
            recognition.start();
          } catch (e) {
            // Already started or busy
          }
        } else {
          setIsListening(false);
          isListeningRef.current = false;
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Error starting speech recognition:', err);
      setIsListening(false);
      isListeningRef.current = false;
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn(e);
      }
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsListening(false);
    isListeningRef.current = false;
    setIsSpeaking(false);
    isSpeakingRef.current = false;
  };

  // Gemini Live 세션 토글 (네이티브 PCM 스트리밍 및 WebSocket + 하이브리드 음성 인식)
  const toggleLiveSession = () => {
    if (isLiveActive) {
      isLiveActiveRef.current = false;
      setIsLiveActive(false);
      stopNativeMicStream();
      stopListening();
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (e) {
          console.warn(e);
        }
      }
    } else {
      isLiveActiveRef.current = true;
      setIsLiveActive(true);

      // 사용자 직접 클릭 제스처 시 AudioContext 즉시 활성화/재개 (브라우저 자동재생 정책 대응)
      try {
        if (!audioContextRef.current) {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          audioContextRef.current = new AudioCtx({ sampleRate: 24000 });
        }
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
      } catch (ae) {
        console.warn('AudioContext resume failed:', ae);
      }

      startNativeMicStream();
      startListening(); // 마이크 하이브리드 음성 인식 동시 가동으로 실시간 연속 대화 활성화!
    }
  };

  // 2. 텍스트 채팅 전송 핸들러
  const handleSendMessage = async (msgToSend?: string) => {
    const text = msgToSend || inputMessage;
    if (!text.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: 'chat'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsChatLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await fetch(`${apiUrl}/api/goals/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
          model_name: selectedModel,
          locale: locale
        })
      });

      if (!res.ok) throw new Error('채팅 응답 실패');

      const data = await res.json();
      
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || '목표를 함께 정립했습니다.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        focusCategory: data.focus_category,
        mode: 'chat'
      };

      setMessages(prev => [...prev, assistantMsg]);

      if (data.updated_goals) {
        setGoals(data.updated_goals);
        setLastFocusCategory(data.focus_category);
        setSaveMessage(`AI 설계관과의 대화를 반영하여 [${data.focus_category?.toUpperCase()}] 목표가 갱신되었습니다.`);
        setTimeout(() => setSaveMessage(null), 4000);
      }

      if (data.suggested_next_prompts && data.suggested_next_prompts.length > 0) {
        setSuggestedPrompts(data.suggested_next_prompts);
        setIsDynamicPrompts(true);
      }
    } catch (e) {
      console.error('Error in chat:', e);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '죄송합니다. AI 두뇌와의 통신 중 일시적 지연이 발생했습니다. 다시 한번 말씀해 주시겠어요?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // 3. 직접 수동 편집
  const handleStartEdit = (goal: GoalItem) => {
    setEditingId(goal.id);
    setEditFormData({
      title: goal.title,
      target_value: goal.target_value,
      rule: goal.rule,
      progress: goal.progress
    });
  };

  const handleSaveEdit = async (goalId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await fetch(`${apiUrl}/api/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal_id: goalId,
          updates: editFormData
        })
      });
      if (res.ok) {
        setGoals(prev => ({
          ...prev,
          [goalId]: { ...prev[goalId], ...editFormData }
        }));
        setEditingId(null);
        setSaveMessage('목표가 성공적으로 저장되었습니다.');
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (e) {
      console.error('Error saving goal:', e);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── 0. 모드 선택 토글 탭 (텍스트 채팅 vs Gemini Live 음성) ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 text-white shadow-lg shadow-indigo-500/25">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2">
              <span>{t("modeTitle")}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold border border-purple-500/30">
                Gemini Live Enabled
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {t("modeDesc")}
            </p>
          </div>
        </div>

        {/* 인터페이스 모드 스위처 */}
        <div className="inline-flex p-1 rounded-xl bg-slate-950/80 border border-slate-800 shadow-inner">
          <button
            onClick={() => {
              setInterfaceMode('live');
              if (!isLiveActive) toggleLiveSession();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              interfaceMode === 'live'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>🎙️ {t("btnLiveVoice")}</span>
          </button>

          <button
            onClick={() => {
              setInterfaceMode('chat');
              stopListening();
              setIsLiveActive(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              interfaceMode === 'chat'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>💬 {t("btnTextChat")}</span>
          </button>
        </div>
      </div>

      {/* ── 상단 헌법 수립 후 실시간 심의 대시보드 이동 안내 배너 ── */}
      {onProceedToDashboard && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 border border-blue-500/30 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                💡 {t("bannerTitle")}
              </p>
              <p className="text-xs text-slate-300">
                {t("bannerDesc")}
              </p>
            </div>
          </div>
          <button
            onClick={onProceedToDashboard}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs md:text-sm shadow-lg shadow-blue-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <span>⚡ {t("btnGoToDashboard")}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── 1. 메인 인터랙션 콘솔 (선택된 모드에 따라 렌더링) ── */}
      {interfaceMode === 'live' ? (
        /* ── [Mode A] Gemini Live 실시간 양방향 음성 콘솔 ── */
        <div className="relative rounded-3xl border border-purple-500/40 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-900 p-6 md:p-8 shadow-2xl overflow-hidden backdrop-blur-xl space-y-6 animate-fade-in">
          {/* 앰비언트 글로우 백그라운드 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* 상단 컨트롤 바 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-purple-500/20 pb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">{t("liveCoachingTitle")}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
                    isListening ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                    isSpeaking ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                    isLiveActive ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                    'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      isListening ? 'bg-emerald-400 animate-ping' :
                      isSpeaking ? 'bg-purple-400 animate-bounce' :
                      isLiveActive ? 'bg-blue-400' : 'bg-slate-500'
                    }`} />
                    {isListening ? t("statusListening") :
                     isSpeaking ? t("statusSpeaking") :
                     isLiveActive ? t("statusWaiting") : t("statusOffline")}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {t("liveCoachingDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              {/* 스피커 음소거 토글 */}
              <button
                onClick={() => setIsAudioMuted(!isAudioMuted)}
                title={isAudioMuted ? t("unmute") : t("mute")}
                className={`p-2 rounded-xl border transition ${
                  isAudioMuted ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Gemini Live 전용 고정 엔진 배지 (Live API는 gemini-3.8-live 단일 모델 사용) */}
              <div className="flex items-center gap-2 bg-purple-950/60 border border-purple-500/40 rounded-xl px-3 py-1.5 shadow-inner">
                <Cpu className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span className="text-xs text-purple-200 font-semibold tracking-tight">
                  Gemini 3.8 Live
                </span>
                <span className="text-[10px] text-purple-300/80 bg-purple-900/60 px-1.5 py-0.5 rounded-full border border-purple-500/20 font-mono">
                  Fixed
                </span>
              </div>
            </div>
          </div>

          {/* 마이크 오류 및 설정 가이드 배너 */}
          {micError && (
            <div className="relative z-10 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-amber-300">{t("micAlertTitle")}</p>
                  <p className="text-slate-300">{micError}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowMicHelp(!showMicHelp)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{t("micAlertHelp")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMicError(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 마이크 문제 해결 인터랙티브 가이드 모달/패널 */}
          {showMicHelp && (
            <div className="relative z-10 p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 text-slate-300 text-xs space-y-3 animate-fade-in shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                  <HelpCircle className="w-4 h-4" />
                  <span>{t("micHelpTitle")}</span>
                </div>
                <button onClick={() => setShowMicHelp(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px]">1</span>
                    <span>{t("micHelpStep1Title")}</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    {t("micHelpStep1Desc1")} <strong>{t("micHelpStep1Desc2")}</strong>{t("micHelpStep1Desc3")} <strong>{t("micHelpStep1Desc4")}</strong>{t("micHelpStep1Desc5")} <span className="text-emerald-400 font-semibold">{t("micHelpStep1Desc6")}</span>{t("micHelpStep1Desc7")}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px]">2</span>
                    <span>{t("micHelpStep2Title")}</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    <strong>{t("micHelpStep2Desc1")}</strong> &gt; <strong>{t("micHelpStep2Desc2")}</strong> &gt; <strong>{t("micHelpStep2Desc3")}</strong>{t("micHelpStep2Desc4")} <span className="text-emerald-400 font-semibold">{t("micHelpStep2Desc5")}</span>{t("micHelpStep2Desc6")}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-pink-300 font-bold">
                    <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center text-[10px]">3</span>
                    <span>{t("micHelpStep3Title")}</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    {t("micHelpStep3Desc1")} <strong>{t("micHelpStep3Desc2")}</strong>{t("micHelpStep3Desc3")}
                  </p>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 flex items-center justify-between text-[11px] text-purple-300">
                <span>💡 {t("micHelpFooter1")} <strong>{t("micHelpFooter2")}</strong>{t("micHelpFooter3")} <strong>{t("micHelpFooter4")}</strong>{t("micHelpFooter5")}</span>
                <button
                  type="button"
                  onClick={() => setShowMicHelp(false)}
                  className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-medium shrink-0 ml-2"
                >
                  {t("btnConfirm")}
                </button>
              </div>
            </div>
          )}

          {/* 중앙: Gemini Live 3D 사이버네틱 아바타 & 실시간 인터랙션 콘솔 */}
          <div className="flex flex-col items-center justify-center space-y-4 relative z-10">
            {/* 3D WebGL 아바타 (실시간 립싱크, 시선 추적, 상태별 모션 탑재) */}
            <div className="w-full max-w-xl rounded-2xl bg-gradient-to-b from-purple-950/30 via-slate-950/40 to-slate-900/60 border border-purple-500/30 shadow-2xl relative overflow-hidden backdrop-blur-md">
              <GeminiLiveAvatar3D
                isListening={isListening}
                isSpeaking={isSpeaking}
                isThinking={isChatLoading}
                audioLevel={isListening ? Math.max(20, micLevel) : (isSpeaking ? 70 : 0)}
              />

              {/* 아바타 하단 인터랙션 컨트롤 바 (마이크 버튼 & 실시간 음량 레벨 미터) */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-3 bg-slate-950/80 border border-purple-500/30 rounded-xl px-4 py-2.5 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleLiveSession}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition shadow-md active:scale-95 ${
                      isListening
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
                        : isSpeaking
                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                        : isLiveActive
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <Mic className="w-4 h-4 animate-bounce" />
                        <span>{t("btnMicOff")}</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span>{isLiveActive ? t("btnMicOn") : t("btnLiveSessionStart")}</span>
                      </>
                    )}
                  </button>

                  {/* Gemini가 말하고 있을 때 즉각 말을 끊을 수 있는 원터치 Barge-in 버튼 */}
                  {isSpeaking && (
                    <button
                      type="button"
                      onClick={interruptSpeaking}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-900/60 animate-pulse transition active:scale-95 border border-rose-400/80"
                      title={t("titleBargeIn")}
                    >
                      <span>✋ {t("btnBargeIn")}</span>
                    </button>
                  )}
                </div>

                {/* 실시간 마이크 레벨 및 오디오 파형 바 */}
                <div className="flex items-center gap-3">
                  {isListening && (
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                      <span>Mic:</span>
                      <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden border border-emerald-500/30">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 transition-all duration-75"
                          style={{ width: `${Math.min(100, Math.max(micLevel, 5))}%` }}
                        />
                      </div>
                      <span className="w-7 text-right">{micLevel}%</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 h-8">
                    {audioVolumeBars.map((height, idx) => (
                      <div
                        key={idx}
                        style={{ height: `${Math.max(6, height * 0.35)}px` }}
                        className={`w-1 rounded-full transition-all duration-100 ${
                          isListening
                            ? 'bg-gradient-to-t from-emerald-500 to-teal-300'
                            : isSpeaking
                            ? 'bg-gradient-to-t from-purple-500 to-pink-300'
                            : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 실시간 음성 자막 (Live Transcript) */}
            <div className="w-full max-w-xl bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-center min-h-[64px] flex items-center justify-center">
              {isChatLoading ? (
                <div className="flex items-center gap-2 text-xs text-purple-400 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                  <span>{t("msgLiveAnalyzing")}</span>
                </div>
              ) : liveTranscript ? (
                <p className="text-sm text-emerald-300 font-medium animate-fade-in">
                  &ldquo;{liveTranscript}&rdquo;
                </p>
              ) : isListening ? (
                <div className="space-y-1">
                  <p className="text-xs text-emerald-300 font-medium">
                    🎙️ {t("msgMicOn")}
                  </p>
                  {micLevel === 0 && (
                    <p className="text-[10px] text-slate-500">
                      ({t("msgNoSound")})
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  {t("msgHowToInteract")}
                </p>
              )}
            </div>

            {/* 마이크 없이도 즉시 실시간 발화 가능한 직접 텍스트 입력창 (Gemini Live Direct Input) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!liveInputText.trim() || isChatLoading) return;
                processVoiceInput(liveInputText.trim());
                setLiveInputText('');
              }}
              className="w-full max-w-xl flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={liveInputText}
                  onChange={(e) => setLiveInputText(e.target.value)}
                  placeholder={t("placeholderTextInput")}
                  disabled={isChatLoading}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-purple-500/30 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
                />
              </div>
              <button
                type="submit"
                disabled={!liveInputText.trim() || isChatLoading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t("btnSendSpeech")}</span>
              </button>
            </form>

            {/* 실시간 연속 대화 히스토리 피드 (Live Multi-turn Feed) */}
            {messages.length > 1 && (
              <div className="w-full max-w-xl p-3 rounded-2xl bg-slate-950/60 border border-purple-500/20 space-y-2 max-h-36 overflow-y-auto">
                <div className="flex items-center justify-between text-[10px] text-purple-300 font-bold border-b border-purple-500/10 pb-1">
                  <span>💬 {t("liveChatHistory", { count: messages.length - 1 })}</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    {t("liveChatInProgress")}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {messages.slice(-4).map((msg, i) => (
                    <div
                      key={msg.id || i}
                      className={`text-[11px] p-2 rounded-xl flex items-start gap-2 ${
                        msg.role === 'user'
                          ? 'bg-purple-900/30 text-purple-200 border border-purple-500/20'
                          : 'bg-indigo-950/40 text-slate-200 border border-indigo-500/20'
                      }`}
                    >
                      <span className="font-bold shrink-0 mt-0.5">
                        {msg.role === 'user' ? t('chatUser') : t('chatGemini')}
                      </span>
                      <p className="flex-1 leading-relaxed">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 연속 대화 유도 칩 (클릭 시 즉시 핑퐁 대화 지속) */}
          <div className="pt-2 border-t border-purple-500/20 space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-purple-300 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>💡 {t("tipTryOtherAreas")}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowMicHelp(!showMicHelp)}
                className="text-[11px] text-slate-400 hover:text-purple-300 flex items-center gap-1 transition"
              >
                <HelpCircle className="w-3 h-3" />
                <span>{t("btnMicTroubleshoot")}</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeVoiceChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => processVoiceInput(chip.text)}
                  disabled={isChatLoading}
                  className="text-xs px-3.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 hover:text-white border border-purple-500/30 hover:border-purple-400 transition shadow-sm active:scale-95 flex items-center gap-1.5"
                >
                  <Mic className="w-3 h-3 text-purple-400" />
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── [Mode B] 텍스트 채팅 인터뷰 콘솔 (기존 채팅 모드) ── */
        <div className="glass-panel border border-indigo-500/30 bg-slate-900/70 shadow-2xl rounded-2xl overflow-hidden animate-fade-in">
          {/* 채팅 상단 타이틀 바 */}
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900/60 border-b border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{t("textInterviewTitle")}</h3>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {t("modelRunning", { model: selectedModel })}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {t("textInterviewDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-inner">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={isChatLoading}
                  className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
                >
                  {availableModels.map((m) => (
                    <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                      {m.name} {m.badge ? `[${m.badge}]` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 채팅 메시지 히스토리 스크롤 뷰 */}
          <div className="p-6 space-y-4 max-h-[380px] overflow-y-auto">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 leading-relaxed ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md">
                      <Shield className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm shadow-md ${
                      isUser
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs'
                        : 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    <div className={`mt-1.5 text-[10px] flex items-center gap-2 ${isUser ? 'text-blue-200 justify-end' : 'text-slate-400 justify-between'}`}>
                      <span>{m.timestamp}</span>
                      {m.focusCategory && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                          🎯 {t("goalUpdated", { category: m.focusCategory.toUpperCase() })}
                        </span>
                      )}
                    </div>
                  </div>
                  {isUser && (
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isChatLoading && (
              <div className="flex gap-3 items-center text-xs text-indigo-400">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/50 flex items-center justify-center text-white shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-slate-400 text-xs ml-1">{t("aiAnalyzing")}</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* 지능형 실시간 대화 추천 칩 */}
          <div className="px-6 py-2.5 bg-slate-950/40 border-t border-slate-800 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] text-slate-400 whitespace-nowrap flex items-center gap-1.5 font-medium">
              {isDynamicPrompts ? (
                <span className="flex items-center gap-1 text-purple-400 font-semibold animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" /> {t("aiFollowUpQuestion")}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400">
                  <Zap className="w-3.5 h-3.5" /> {t("interviewStartQuestion")}
                </span>
              )}
            </span>
            <div className="flex gap-2">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isChatLoading}
                  className="text-[11px] px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 hover:border-indigo-500/40 transition whitespace-nowrap shadow-sm active:scale-95"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* 메시지 입력창 */}
          <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
              placeholder={t("placeholderChatInput")}
              disabled={isChatLoading}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isChatLoading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>{t("btnSendChat")}</span>
            </button>
          </div>
        </div>
      )}

      {/* 성공 알림 토스트 */}
      {saveMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2 shadow-lg animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" /> {saveMessage}
        </div>
      )}

      {/* ── 2. 실시간 동기화되는 5대 도메인 인생 목표 매트릭스 ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" />
              {t("domainMatrixTitle")}
            </h3>
            <p className="text-xs text-slate-400">
              {t("domainMatrixDesc")}
            </p>
          </div>
          <button
            onClick={fetchGoals}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> {t("btnRefresh")}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.values(goals).map((goal) => {
            const isEditing = editingId === goal.id;
            const isHighlighted = lastFocusCategory === goal.id;

            return (
              <div
                key={goal.id}
                className={`glass-panel p-5 rounded-2xl flex flex-col justify-between transition-all duration-500 ${
                  isHighlighted 
                    ? 'border-indigo-400 bg-indigo-950/20 ring-2 ring-indigo-500/40 shadow-xl shadow-indigo-500/10' 
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* 카드 상단 */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{goal.icon}</span>
                      <span className="text-sm font-bold text-slate-200">{goal.category}</span>
                      {isHighlighted && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-bold animate-pulse">
                          {t("badgeAiUpdated")}
                        </span>
                      )}
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => handleStartEdit(goal)}
                        className="text-slate-400 hover:text-indigo-300 p-1 rounded-md transition"
                        title={t("titleManualEdit")}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* 목표 제목 & 내용 */}
                  {isEditing ? (
                    <div className="space-y-3 mb-4 text-xs">
                      <div>
                        <label className="text-slate-400 block mb-1">{t("labelGoalTitle")}</label>
                        <input
                          type="text"
                          value={editFormData.title || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">{t("labelGoalValue")}</label>
                        <input
                          type="text"
                          value={editFormData.target_value || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, target_value: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">{t("labelGoalRule")}</label>
                        <input
                          type="text"
                          value={editFormData.rule || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, rule: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 mb-4">
                      <h4 className="text-sm font-semibold text-white leading-snug">{goal.title}</h4>
                      <div className="flex items-baseline gap-2 text-xs">
                        <span className="text-indigo-400 font-bold">{goal.target_value}</span>
                        <span className="text-slate-500 text-[11px]">({goal.current_value})</span>
                      </div>
                      <p className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                        🛡️ <strong className="text-slate-300">{t("labelGovernanceRule")}</strong> {goal.rule}
                      </p>
                    </div>
                  )}
                </div>

                {/* 카드 하단: {t("immutableConstitution")} 및 달성률 */}
                <div>
                  <div className="bg-gradient-to-r from-purple-950/40 to-slate-950 p-3 rounded-xl border border-purple-500/20 mb-3">
                    <div className="text-[10px] text-purple-400 font-extrabold flex items-center gap-1 mb-1">
                      <Shield className="w-3 h-3 text-purple-400" /> {t("immutableConstitution")}
                    </div>
                    <p className="text-xs text-purple-200/90 font-medium leading-relaxed">
                      {goal.tenet}
                    </p>
                  </div>

                  {isEditing ? (
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg"
                      >
                        {t("btnCancel")}
                      </button>
                      <button
                        onClick={() => handleSaveEdit(goal.id)}
                        className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" /> {t("btnSave")}
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{t("goalProgress")}</span>
                      <span className="font-mono font-bold text-indigo-400">{goal.progress}%</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
