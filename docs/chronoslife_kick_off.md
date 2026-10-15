# ChronosLife: 안티그래비티 원클릭 킥오프 마스터 패키지
## Google Antigravity 자율 개발 투입용 프로젝트 스캐폴딩, 마스터 프롬프트 및 실행 로드맵

---

### 1. 프로젝트 디렉터리 구조 (Monorepo Blueprint)

안티그래비티가 백엔드와 프론트엔드를 독립적이면서도 유기적으로 빌드할 수 있도록 최적화된 풀스택 모노리포 구조입니다.

```
chronoslife/
├── .env.example
├── docker-compose.yml
├── README.md
│
├── backend/                              # FastAPI 기반 백엔드 (Python 3.11+)
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py                           # API 엔드포인트, SSE 스트리밍(/api/analyze/stream) 라우터
│   ├── config.py                         # 환경변수 및 Mock/Live 모드 플래그 관리
│   │
│   ├── engines/                          # 핵심 비즈니스 및 에이전트 엔진
│   │   ├── privacy_guard.py              # Layer 0: Google Cloud DLP 실시간 인그레스 토크나이저
│   │   ├── state_engine.py               # Layer 0.5: Chronos State Dynamics 누적 상태 역학 엔진
│   │   ├── context_cache_manager.py      # Layer 0.5: Gemini Context Cache 매니저 (초저비용 히스토리)
│   │   ├── orchestrator.py               # Layer 1: 수석 컨텍스트 오케스트레이터 & 프롬프트 디스패처
│   │   ├── domain_council.py             # Layer 2: 3개 도메인 전문 위원회 코디네이터
│   │   ├── subagents/                    # Layer 2: 독립 캡슐화 객체지향 서브에이전트군
│   │   │   ├── base_agent.py             # 추상 기본 서브에이전트 (BaseSubAgent)
│   │   │   ├── finance_agent.py          # 재정 가드레일 & 기회비용 평가 서브에이전트
│   │   │   ├── career_agent.py           # 근로시간 상한 & 번아웃 방어 서브에이전트
│   │   │   └── wellbeing_agent.py        # 수면/가족식사/취미 쿼터 수호 서브에이전트
│   │   ├── chief_governor.py             # Layer 3: 최고 중재관 인생 헌법 RAG 및 파레토 상충 중재관
│   │   ├── comic_engine.py               # Multimodal: Log-10 5컷 웹툰 만화 크로니클 생성 엔진
│   │   ├── gemini_live_session.py        # Google GenAI 공식 Gemini 3.8 Live WebSocket 브릿지
│   │   ├── history_manager.py            # 누적 심의 히스토리 영구 저장/인덱싱 엔진
│   │   ├── dev_logger.py                 # 실시간 개발자 관제 인스펙터 로거 (DevLogStore)
│   │   ├── logger_middleware.py          # 순수 ASGI 무지연 스트리밍 미들웨어
│   │   ├── json_utils.py                 # 정규식 기반 안전한 마크다운/JSON 추출 유틸리티
│   │   ├── model_registry.py             # Google GenAI API 실시간 16개 모델 동적 탐색기
│   │   └── goal_manager.py               # 5-Horizon 궤적 생성기 & 1:1 대화형 인생 헌법 관리 엔진
│   │
│   ├── tools/
│   │   └── ekispert_client.py            # Layer 5: Ekispert API MCP 서버 연동 모빌리티 클라이언트
│   │
│   ├── logs/                             # 실시간 로그 데이터
│   │   ├── history_deliberations.jsonl   # 누적 심의 히스토리 영구 레코드
│   │   └── llm_calls.jsonl               # 개발자 인스펙터 LLM 호출 감사 로그
│   │
│   └── mock_data/
│       └── presets.json                  # 외부 API 키 부재 시 자동 작동하는 데모 시나리오 프리셋
│
└── frontend/                             # Next.js 15 + Tailwind CSS 프론트엔드
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    │
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx                  # 3단계 프로세스(헌법 스튜디오/실시간 심의/히스토리) 메인 콘솔
        │   └── globals.css
        │
        └── components/
            ├── Header.tsx                # 실시간 거버넌스 헬스 인덱스 & Gemini Live 상태 표시
            ├── LifeVitalRadar.tsx        # 상단 전용 실시간 라이프 바이탈 레이더 (과거 7일 히스토리컬 추세)
            ├── GoalConstitutionStudio.tsx # 1단계: 1:1 AI 인생 헌법 설계관 대화 인터뷰 스튜디오
            ├── GeminiLiveAvatar3D.tsx    # Three.js WebGL 3D 사이버네틱 아바타 (실시간 립싱크)
            ├── InteractiveInputConsole.tsx # 2단계: 실시간 거버넌스 콘솔 & Gemini 모델 선택기
            ├── ProgressivePipelineTracker.tsx # 5단계 실시간 파이프라인 진행 상태 트래커
            ├── DlpComparisonViewer.tsx   # Layer 0: 원본 vs Cloud DLP 비식별화 분할 비교 뷰어
            ├── OrchestratorTraceViewer.tsx # Layer 1: 투명 감사 백로그 (Audit Trace) 아코디언 뷰어
            ├── ArbitrationConsole.tsx    # Layer 2 & 3: 도메인 위원회 vs 최고 중재관 판결 콘솔
            ├── GoalImpactMatrix.tsx       # Layer 4: 5대 목표 5단계 시계열 3중 궤적 선그래프 (Tri-Line)
            ├── Log10ComicStripViewer.tsx # Stage 5: Log-10 5컷 웹툰 만화 크로니클 뷰어
            ├── DeliberationHistoryTracker.tsx # 3단계: 누적 심의 히스토리 & 판결 통계 트래커
            ├── DevLogInspector.tsx       # 하단 도킹 실시간 개발자 API & LLM 관제 드로어
            └── EkispertActionCard.tsx    # Layer 5: 스트레스 회복 15분 녹지 환승 산책로 카드
```

---

## 2. 안티그래비티 주입용 마스터 킥오프 프롬프트 (Copy & Paste)

안티그래비티의 대화창에 아래 프롬프트를 **그대로 복사하여 붙여넣기**하십시오. 에이전트가 하위 작업(Sub-tasks)을 자율적으로 쪼개고 실행합니다.

```markdown
당신은 Google Antigravity 개발 플랫폼의 수석 풀스택 AI 소프트웨어 아키텍트이자 에이전틱 엔지니어입니다.
우리는 '제5회 Agentic AI Hackathon with Google Cloud' 출품작인 [ChronosLife: Log-10 계층 시계열 인생 거버넌스 시스템]을 구축할 것입니다.

이미 프로젝트 루트에 기획 및 아키텍처 명세서인 `chronoslife_architecture_blueprint.md` 파일이 존재합니다.
당신은 이 명세서의 모든 아키텍처 원칙, 수식, 보안 레이어, UX 시나리오를 100% 충실하게 준수하여 작동 가능한 풀스택 애플리케이션을 완성해야 합니다.

[핵심 개발 원칙]
1. Mock First & Multi-Model Resilience Architecture:
   - 외부 API 키가 없는 오프라인 환경에서도 `USE_MOCK_FALLBACK=True`로 즉시 동작합니다.
   - 키가 주입되면 실제 Live SDK 통신 모드로 무중단 전환됩니다.
   - 특정 모델의 일시적 503(Service Unavailable) 또는 429(Quota) 발생에 대비하여 `gemini-3.5-flash` → `gemini-flash-latest` → `gemini-flash-lite-latest` → `gemini-3.5-flash-lite` 순의 자동 폴백 체인을 가동하고, UI 상단에 Gemini 모델 선택기 드롭다운을 제공합니다.
2. 기술 스택:
   - Backend: Python 3.11, FastAPI, Google GenAI SDK (`google-genai`), `google-cloud-dlp`, Uvicorn
   - Frontend: Next.js 15 (App Router, Turbopack), TypeScript, Tailwind CSS, Lucide React, Pure SVG Trajectory Visualizer
3. 7대 핵심 레이어 및 혁신 기능:
   - Layer 0 (Context Orchestrator & Audit Trace): 발화 의도(소비 vs 연봉 인상 vs 스트레스) 자동 분해 및 도메인별 프롬프트 하달, 투명 감사 백로그 UI 제공.
   - Layer 0.5 (State Dynamics & Context Cache): 수면 부채, 누적 야근, 예산 가속도를 동적으로 산출하고 Gemini Context Caching으로 초저비용 히스토리 기억.
   - Layer 1 (DLP Sandbox): `dlp_v2.DlpServiceClient`를 활용한 계좌번호, 실명, 급여 마스킹 (Mock 지원).
   - Layer 2 (Domain Council): Finance, Career, Well-being (가족/건강/개인 취미 쿼터) 전문 위원회 에이전트.
   - Layer 3 (Chief Governor): 불변의 인생 헌법 RAG 및 파레토 최적화 상충 중재 엔진.
   - Layer 4 (Log-10 HTM & 5-Horizon Trajectory): 5대 인생 목표 5단계 시계열 궤적 선그래프 (과거 7일 궤적 연결 + Baseline 점선 vs Projected 실선, 이동 폭 면적 셰이딩).
   - Layer 5 (Micro Mobility): Ekispert API MCP 서버 도구 연동을 통한 야근 시 15분 도보 산책 환승로 자동 처방.
   - Studio: 1:1 대화형 인생 헌법 & 5대 목표 관리 스튜디오 (Constitution Architect).

[실행 단계 (Execution Steps)]
Phase 1: `backend/` 디렉터리 생성 및 FastAPI 서버, Log-10 역전파 엔진(`log10_engine.py`), Cloud DLP 토크나이저(`privacy_guard.py`), 중재 엔진(`chief_governor.py`), 프리셋 목 데이터(`presets.json`)를 작성하십시오. 로컬 터미널에서 단위 테스트를 수행하여 수식과 데이터 흐름을 검증하십시오.
Phase 2: `frontend/` 디렉터리 생성 및 Next.js 15 UI를 구축하십시오. 원본 vs 마스킹 텍스트 비교 뷰어, 5단계 시계열 인터랙티브 그래프, 도메인 위원회 찬반 대립 및 최고 중재관의 '조건부 타협안' 출력 콘솔, Ekispert 환승 지도를 미려하게 디자인하십시오.
Phase 3: 백엔드와 프론트엔드를 연동하고, 브라우저 화면 검증 및 빌드 테스트(`npm run build`, `pytest`)를 통과시키십시오.
Phase 4: 구글 클라우드 런(Cloud Run) 배포를 위한 `Dockerfile` 및 원클릭 배포 쉘 스크립트(`deploy.sh`)를 작성하십시오.

지금 즉시 Phase 1부터 디렉터리를 생성하고 코드를 작성해 주십시오.
```

---

## 3. 심사위원 시연용 원클릭 모의 데이터셋 (`backend/mock_data/presets.json`)

안티그래비티가 라이브 API 호출 없이도 즉시 심사위원에게 완벽한 시연을 제공할 수 있도록 구성된 3대 시나리오 프리셋입니다.

```json
{
  "scenarios": [
    {
      "id": "scenario_1_impulse_spend",
      "title": "시나리오 1: [L0 → L4] 야밤의 충동 지출과 30년 복리 역전파",
      "description": "금요일 밤 98,000원 기계식 키보드 결제 시 Cloud DLP 마스킹 및 은퇴 지연 복리 역전파",
      "raw_input": "오늘 우리 아내 이수진과 신한은행 110-384-918237 계좌에서 이번 달 보너스 300만 원 들어왔는데, 너무 스트레스 받아서 쿠팡에서 98,000원짜리 한정판 키보드 결제함.",
      "dlp_sanitized": "오늘 우리 아내 [PERSON_NAME_1]과 [FINANCIAL_ACCOUNT_NUMBER] 계좌에서 이번 달 [CONFIDENTIAL_BONUS] 들어왔는데, 너무 스트레스 받아서 [ECOMMERCE_PLATFORM]에서 98,000원짜리 한정판 키보드 결제함.",
      "detected_info_types": ["PERSON_NAME", "FINANCIAL_ACCOUNT_NUMBER", "KR_SALARY_AMOUNT"],
      "log10_cascade": {
        "l0_daily": { "tier": "L0 (10^0일: 1일)", "value": "98,000원", "drain_pct": "245%", "status": "초과 소진 (위험)" },
        "l1_sprint": { "tier": "L1 (10^1일: 10일)", "value": "주말 가처분 예산 100% 소진", "remedy": "내일부터 3일간 외식비 32,600원씩 강제 차감" },
        "l2_quarter": { "tier": "L2 (10^2일: 100일)", "value": "분기 비상금 달성률 3.2% 하락", "status": "흡수 한계 도달" },
        "l3_chapter": { "tier": "L3 (10^3일: 3년)", "value": "3년 차 종잣돈 기회손실 118,500원", "status": "시드머니 누수" },
        "l4_constitution": { "tier": "L4 (10^4일: 30년)", "value": "28년 연 6% 복리 손실 502,400원", "delayed_retirement": "2.4일 은퇴 지연" }
      },
      "council_verdict": {
        "finance": "일일 한도 245% 초과. L1에서 즉각 회수 조치 요구.",
        "wellbeing": "스트레스 완화 효과 인정하나, 장비 수집 충동 반복 시 장기 재정 위협.",
        "governor": "[경고 수용] 98,000원의 일탈을 승인하되, L1 스프린트 규칙에 따라 향후 3일간 일일 가처분 한도를 32,600원 감액 적용합니다."
      }
    },
    {
      "id": "scenario_2_startup_tradeoff",
      "title": "시나리오 2: [L2 → L3] 고연봉 스타트업 이직 오퍼와 전인적 삶의 상충 중재",
      "description": "연봉 3,500만 원 인상 vs 주 70시간 야근 오퍼에 대한 최고 거버넌스(Gemini 3.1 Pro)의 파레토 중재",
      "raw_input": "초기 AI 스타트업에서 연봉 3,500만 원 인상 제안을 받았습니다. 단, 주 70시간 근무에 주말 출근이 빈번합니다. 3년 시드머니를 빨리 모으고 싶은데 이직할까요?",
      "dlp_sanitized": "초기 AI 스타트업에서 [SALARY_INCREASE: 35,000,000 KRW] 제안을 받았습니다. 단, 주 70시간 근무에 주말 출근이 빈번합니다. 3년 시드머니를 빨리 모으고 싶은데 이직할까요?",
      "detected_info_types": ["KR_SALARY_AMOUNT"],
      "council_verdict": {
        "finance": "찬성: 3년 내 순자산 1억 달성 속도를 11개월 단축시킴. 강력 추천.",
        "career": "조건부 찬성: 시장 가치와 도메인 전문성은 급상승하나 번아웃 지수 0.85로 임계 초과.",
        "wellbeing": "결사 반대: 현재 수면 부채 누적 상태. 주당 가족 저녁(3회) 및 주말 취미 몰입(4시간) 완전 박탈로 헌법 제1조 위반."
      },
      "chief_governor_ruling": {
        "decision": "원안 기각 (조건부 카운터오퍼 중재 권고)",
        "violated_tenets": "헌법 제1조(어떤 금전적 보상도 가족 유대와 지속 가능한 신체 회복을 영구 침해할 수 없다)",
        "pareto_counter_offer": "연봉 인상 폭을 2,000만 원으로 조정하되, 주 52시간 상한 및 재택근무 주 2회, 주말 취미 블록 사수를 명시한 역제안서(Counter-offer)를 송부하십시오. L2(100일) 간의 건강 지표 회복을 전제 조건으로 부여합니다."
      }
    },
    {
      "id": "scenario_3_burnout_mobility",
      "title": "시나리오 3: [L0 & Ekispert MCP] 연속 야근 번아웃 감지와 15분 도보 산책 처방",
      "description": "3일 연속 야근으로 폭식 위험 임계 도달 시, Ekispert API MCP 서버를 통해 녹지 환승 보행로 자동 안내",
      "raw_input": "3일 연속 22시 퇴근 중. 신주쿠역에서 전철 타려는데 너무 지쳐서 배달 야식 3만 원어치 시켜 먹고 싶음.",
      "dlp_sanitized": "3일 연속 22시 퇴근 중. [STATION_NAME]에서 전철 타려는데 너무 지쳐서 배달 야식 30,000원어치 시켜 먹고 싶음.",
      "detected_info_types": ["LOCATION_DATA"],
      "ekispert_prescription": {
        "trigger": "스트레스 지수 88/100, 충동 배달음식 주문 확률 85% 감지",
        "standard_route": "신주쿠역 → 오모테산도역 (지하철 최단 환승 12분, 밀집도 혼잡)",
        "healing_walk_route": "신주쿠역 하차 → 신주쿠교엔 녹지 외곽 보행로 (도보 15분, 조용한 밤공기) → 센다가야역 승차",
        "action_card": "오늘 밤 3만 원의 야식비와 1,200kcal 축적을 물리적으로 차단하고, 이번 주말 러닝 취미 컨디션을 회복하는 '15분 힐링 녹지 티켓'을 발급했습니다."
      }
    }
  ]
}
```

---

## 4. 환경설정 템플릿 (`.env.example`)

```bash
# ==========================================
# ChronosLife Environment Configuration
# ==========================================

# Mock 모드 토글 (GCP 키가 없을 경우 True, 라이브 가동 시 False)
USE_MOCK_FALLBACK=False

# Google Cloud Project Configuration
GOOGLE_CLOUD_PROJECT=chronos-life-510315
GOOGLE_CLOUD_REGION=asia-northeast1

# Google AI Studio / Gemini Main API Key (Text, Reasoning, Live Audio WebSocket)
GEMINI_API_KEY=your-gemini-main-api-key-here

# Google AI Studio / Dedicated Image Generation API Key (gemini-3.1-flash-image)
GEMINI_IMAGE_API_KEY=your-gemini-image-dedicated-key-here

# AI Image Generator Toggle (사용자 제어 토글: 기본 OFF로 쿼터/지연시간 최적화)
ENABLE_IMAGE_GENERATION=False

# Google Cloud Sensitive Data Protection (DLP) Service Account Path
# (Cloud Run 배포 시에는 IAM 역할 부여로 대체 가능)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Sponsor: Ekispert API MCP Access Key
EKISPERT_API_KEY=your-ekispert-access-key-here
EKISPERT_MCP_URL=https://api.ekispert.jp/v1/json

# Server Ports
PORT=8080
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## 5. 원클릭 Cloud Run 배포 쉘 스크립트 (`deploy_cloud_run.sh`)

안티그래비티가 로컬 빌드 및 유닛 테스트를 마친 후, Google Cloud Run에 즉시 배포할 수 있는 자동화 스크립트입니다.

```bash
#!/bin/bash
set -e

PROJECT_ID=$(gcloud config get-value project)
REGION="asia-northeast1"
SERVICE_NAME="chronoslife-app"

echo "=================================================="
echo " Starting ChronosLife Cloud Run Deployment"
echo " Project: $PROJECT_ID | Region: $REGION"
echo "=================================================="

# 1. Google Cloud 필수 API 자동 활성화
echo "[1/4] Enabling required Google Cloud APIs..."
gcloud services enable \
    run.googleapis.com \
    dlp.googleapis.com \
    aiplatform.googleapis.com \
    artifactregistry.googleapis.com

# 2. Artifact Registry 리포지토리 준비
REPO_NAME="chronoslife-repo"
gcloud artifacts repositories describe $REPO_NAME --location=$REGION > /dev/null 2>&1 || \
gcloud artifacts repositories create $REPO_NAME --repository-format=docker --location=$REGION --description="ChronosLife Images"

# 3. Google Cloud Build를 통한 통합 컨테이너 빌드
IMAGE_URI="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$SERVICE_NAME:latest"
echo "[2/4] Building container image via Cloud Build: $IMAGE_URI"
gcloud builds submit --tag $IMAGE_URI .

# 4. Cloud Run 완전 관리형 서버리스 배포
echo "[3/4] Deploying to Google Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_URI \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars="USE_MOCK_FALLBACK=False,GOOGLE_CLOUD_PROJECT=$PROJECT_ID,GOOGLE_CLOUD_REGION=$REGION" \
    --memory 2Gi \
    --cpu 2 \
    --min-instances 0 \
    --max-instances 5

# 5. 배포된 최종 라이브 URL 출력
LIVE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)')
echo "=================================================="
echo " ChronosLife Deployment Successful!"
echo " Live Web URL: $LIVE_URL"
echo "=================================================="
```

---

## 6. 개발 실행 현황 및 프로덕션 운영 가이드

```
┌────────────────────────────────────────────────────────────────────────┐
│             ChronosLife 풀스택 프로덕션 구축 및 검증 완료 현황          │
├────────────────────────────────────────────────────────────────────────┤
│ [100% 완료] Phase 1: 인프라 및 보안 거버넌스 (Cloud DLP 토크나이저)      │
│ [100% 완료] Phase 2: Log-10 시계열 계산 코어 & 5-Horizon 궤적 시각화  │
│ [100% 완료] Phase 3: Gemini 멀티 서브에이전트 위원회 & 최고 중재관     │
│ [100% 완료] Phase 4: 스폰서 연동 (Ekispert MCP 이동 경로 클라이언트) │
│ [100% 완료] Phase 5: Next.js 대시보드 (3단계 프로세스 & SSE 스트리밍)  │
│ [100% 완료] Phase 6: Gemini 3.8 Live 오디오 & Three.js 3D 아바타       │
│ [100% 완료] Phase 7: 누적 심의 히스토리 트래커 & 개발자 인스펙터      │
│ [100% 완료] Phase 8: 멀티모달 웹툰 이미지 생성 분리 및 토글 최적화    │
└────────────────────────────────────────────────────────────────────────┘
```

### 1) 로컬 개발 서버 기동 명령

```bash
# 터미널 1: 백엔드 FastAPI 서버 (포트 8080)
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8080 --reload

# 터미널 2: 프론트엔드 Next.js 15 서버 (포트 3000)
cd frontend
npm run dev
```

### 2) 핵심 기능 및 검증 체크포인트

1. **1단계: 인생 헌법 & 5대 목표 스튜디오 (`http://localhost:3000`)**:
   - 앱 접속 즉시 기본 탭으로 진입하여 사용자의 30년 인생 헌법(제1조~제5조) 및 5대 목표를 맞춤 정립.
   - **Gemini Live 3D 아바타**: 공식 Google GenAI SDK WebSocket(`client.aio.live.connect`)을 통한 24kHz 실시간 음성 대화 및 목표 갱신 Function Calling 동작.
2. **2단계: 실시간 라이프 거버넌스 심의**:
   - 발화 입력 시 **순수 ASGI 미들웨어** 기반 SSE 스트리밍(`POST /api/analyze/stream`)을 통해 0ms 버퍼링 없이 Stage 1(2.9s) $\to$ Stage 2(3.0s) $\to$ Stage 3(7.9s) $\to$ Stage 4(9.7s) $\to$ Stage 5(15.8s) 순차 언락.
   - **Log-10 5컷 웹툰 만화**: `ENABLE_IMAGE_GENERATION=False` 시 고해상도 SVG 테마 일러스트와 대사/나레이션을 15.8초 만에 즉시 렌더링. 필요 시 `True`로 전환하여 `gemini-3.1-flash-image` 실시간 컷 생성 가동.
3. **3단계: 누적 심의 히스토리 트래커**:
   - 과거의 모든 심의 기록이 `backend/logs/history_deliberations.jsonl`에 영구 적립되며, 언제든 클릭 한 번으로 과거 심의 결과를 대시보드에 완벽 복원.
4. **실시간 개발자 관제 인스펙터**:
   - 화면 하단 드로어(`DevLogInspector`)에서 모든 API 응답 상태, 소요 시간, 각 LLM 호출별 프롬프트/응답 원문 실시간 모니터링 가능.