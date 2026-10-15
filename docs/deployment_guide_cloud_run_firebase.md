# ChronosLife 클라우드 배포 완벽 가이드
## (Cloud Run 백엔드 + Firebase App Hosting / Cloud Run 프론트엔드)

본 문서는 해커톤 심사 요건인 **"Google Cloud 애플리케이션 실행 환경"** 및 **"접속 가능한 Live Web URL"**을 충족하기 위해, ChronosLife를 실제 클라우드 환경에 배포하는 전체 과정을 설명합니다.

---

## 1. 아키텍처 개요 (2-Tier Serverless Architecture)

```
[사용자 브라우저]
       │
       ▼
 ┌────────────────────────────────────────────────────────┐
 │ Frontend (Next.js 15)                                  │
 │ • [Option A] Firebase App Hosting (권장, 가산점 특전)   │
 │ • [Option B] Google Cloud Run (독립 서버리스 컨테이너) │
 └───────────────────────────┬────────────────────────────┘
                             │ HTTPS / CORS 통신
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ Backend (FastAPI / Python 3.11)                        │
 │ • Google Cloud Run (`chronoslife-backend`)             │
 │   - Layer 0: Google Cloud DLP (Sensitive Data)         │
 │   - Layer 1~4: Google Gemini API & Multi-Agent         │
 │   - Layer 5: Ekispert API MCP Server (ヴァル研究所)    │
 └────────────────────────────────────────────────────────┘
```

---

## 2. 사전 준비 (Google Cloud CLI 설정)

터미널(PowerShell 또는 Bash)에서 아래 명령어를 차례대로 실행합니다.

### 1) gcloud CLI 로그인 및 프로젝트 지정
```bash
# 구글 계정 로그인 (개인 Gmail 권장)
gcloud auth login

# 해커톤 프로젝트 ID 설정 (예: chronos-life-510315)
gcloud config set project <YOUR_PROJECT_ID>

# 애플리케이션 기본 인증(ADC) 토큰 발급
gcloud auth application-default login
```

### 2) 필수 구글 클라우드 API 일괄 활성화
```bash
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    dlp.googleapis.com \
    aiplatform.googleapis.com
```

---

## 3. 백엔드 배포: Google Cloud Run (FastAPI)

로컬에 도커(Docker)가 설치되어 있지 않아도, **Google Cloud Build**가 클라우드 상에서 컨테이너를 자동으로 빌드하고 배포합니다.

### 배포 명령어 실행
프로젝트 루트 디렉토리에서 아래 명령어를 실행합니다:

```bash
# 백엔드 배포 (FastAPI)
gcloud run deploy chronoslife-backend \
    --source ./backend \
    --region asia-northeast1 \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars="USE_MOCK_FALLBACK=False,GOOGLE_CLOUD_PROJECT=<YOUR_PROJECT_ID>,EKISPERT_API_KEY=TpVHj3qTS9Hft63Q,GEMINI_API_KEY=<YOUR_GEMINI_API_KEY>" \
    --memory 2Gi \
    --cpu 2 \
    --min-instances 0 \
    --max-instances 5
```

*배포 완료 후 터미널에 출력되는 **`Service URL`**(예: `https://chronoslife-backend-xxxx-an.a.run.app`)을 복사해 둡니다.*

---

## 4. 프론트엔드 배포 (Next.js)

프론트엔드는 다음 두 가지 방법 중 원하는 방식으로 배포할 수 있습니다.

### [Option A: 강력 추천] Firebase App Hosting 배포
> **이유**: 해커톤 공식 FAQ에서 Firebase App Hosting을 GCP 실행 환경으로 정식 인정하며, **선택적 기술(Firebase) 가산점**을 함께 획득할 수 있습니다.

1. **설정 파일 준비**:
   - 이미 [`frontend/apphosting.yaml`](file:///c:/Users/Joel_Lee/내%20드라이브/Joel/10_projects/00_Chronos_Life/frontend/apphosting.yaml)이 생성되어 있습니다.
   - `NEXT_PUBLIC_API_URL` 항목의 값을 **위 3단계에서 획득한 Cloud Run 백엔드 URL**로 수정합니다.
2. **Firebase 콘솔 연동**:
   - [Firebase Console](https://console.firebase.google.com/) 접속 $\to$ 동일한 GCP 프로젝트 선택.
   - 좌측 메뉴의 **App Hosting** (또는 Build $\to$ App Hosting) 선택.
   - **GitHub 저장소 연결** 클릭 $\to$ ChronosLife 리포지토리 선택 $\to$ 루트 디렉토리로 `frontend` 지정.
   - 브랜치를 `main`으로 설정 후 배포 시작 클릭.
   - 완료되면 `https://<app-name>--<project-id>.web.app` 형태의 고속 글로벌 CDN URL이 발급됩니다.

---

### [Option B] Google Cloud Run 배포
> **이유**: GitHub 연동 없이 CLI 명령어 하나로 바로 프론트엔드까지 컨테이너로 배포하고 싶을 때 사용합니다.

1. **배포 명령어 실행**:
   [`frontend/Dockerfile`](file:///c:/Users/Joel_Lee/내%20드라이브/Joel/10_projects/00_Chronos_Life/frontend/Dockerfile)을 기반으로 클라우드 빌드 및 배포를 수행합니다.

```bash
# 프론트엔드 디렉토리로 이동 후 빌드 및 배포
cd frontend

gcloud run deploy chronoslife-frontend \
    --source . \
    --region asia-northeast1 \
    --platform managed \
    --allow-unauthenticated \
    --set-build-env-vars="NEXT_PUBLIC_API_URL=https://chronoslife-backend-xxxx-an.a.run.app" \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 5
```

---

## 5. 배포 후 정상 작동 검증 체크리스트

배포된 프론트엔드 Live URL에 접속하여 다음 항목을 검증합니다:

* [ ] **헬스 체크**: 브라우저에서 `https://<백엔드URL>/` 접속 시 `{"status": "ok", "mode": "live"}` 응답 확인
* [ ] **Ekispert MCP 연동**: `https://<백엔드URL>/api/ekispert/prescription` 호출 시 실시간 도보 환승 처방 JSON 반환 확인
* [ ] **프론트엔드 연동**: 프론트엔드 웹페이지 접속 후 [시나리오 3: 연속 야근 번아웃과 15분 도보 산책] 클릭 시 `Layer 5: Ekispert MCP 마이크로 모빌리티 처방` 카드 정상 렌더링 확인
* [ ] **심사위원 제출**: 발급받은 프론트엔드 Live URL을 Zenn 해커톤 대시보드 제출 폼에 입력
