# ⏳ ChronosLife: Log-10 계층 시계열 인생 거버넌스 시스템

> **제5회 Agentic AI Hackathon with Google Cloud** 출품작

$10^0$일(1일)의 미세 충동 행동부터 $10^4$일(~30년)의 인생 헌법까지,  
로그 등간격 5단계 계층 메모리(Log-10 HTM)를 통해 시계열 인과 단절(Vanishing Causality) 문제를 해결하고,  
삶의 유한 자원(시간·체력·자본)을 둘러싼 재정·커리어·가족·건강·취미 간의 제로섬 갈등을 자율 중재합니다.

---

## 🏗️ 기술 스택

| Layer | 기술 | 역할 |
|-------|------|------|
| **Backend** | Python 3.11, FastAPI, Uvicorn | API 서버 |
| **AI Engine** | Gemini 3.1 Pro, Gemini 3.8 Flash | 중재 & 도메인 에이전트 |
| **Privacy** | Google Cloud DLP (Sensitive Data Protection) | 실시간 PII 토크나이저 |
| **Mobility** | Ekispert API MCP 서버 | 힐링 환승 경로 처방 |
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS v4, Recharts | 대시보드 UI |
| **Deploy** | Google Cloud Run, Artifact Registry | 서버리스 배포 |

---

## 🚀 빠른 시작 (3분 안에 실행)

### 1. 의존성 설치
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 2. 환경변수 설정
```bash
cp .env.example .env
# .env 파일의 API 키를 설정하거나 USE_MOCK_FALLBACK=True로 유지
```

### 3. 서버 실행
```bash
# 터미널 1: Backend
cd backend
uvicorn main:app --reload --port 8080

# 터미널 2: Frontend
cd frontend
npm run dev
```

### 4. 브라우저에서 확인
`http://localhost:3000` 접속 → 시나리오 버튼 클릭!

---

## 🎯 3가지 핵심 데모 시나리오

| # | 시나리오 | 핵심 레이어 | 임팩트 |
|---|---------|-----------|--------|
| 1 | **야밤의 충동 지출** | L0→L4 역전파 | 98,000원 → 은퇴 2.4일 지연 |
| 2 | **이직 오퍼 상충 중재** | L2-L3 파레토 | 연봉 3,500만↑ vs 가족·취미 박탈 |
| 3 | **번아웃 힐링 산책** | L0 + Ekispert MCP | 야식 3만원 → 15분 녹지 환승 처방 |

---

## 📁 프로젝트 구조

```
chronoslife/
├── backend/
│   ├── main.py                    # FastAPI 엔드포인트
│   ├── config.py                  # Mock/Live 모드 설정
│   ├── engines/
│   │   ├── privacy_guard.py       # Layer 1: Cloud DLP 토크나이저
│   │   ├── log10_engine.py        # Layer 4: Log-10 역전파 수식 엔진
│   │   ├── domain_council.py      # Layer 2: 3-에이전트 도메인 위원회
│   │   └── chief_governor.py      # Layer 3: 인생 헌법 중재관
│   ├── tools/
│   │   └── ekispert_client.py     # Layer 5: Ekispert MCP 클라이언트
│   ├── mock_data/
│   │   └── presets.json           # 3개 데모 프리셋
│   └── tests/
│       └── test_engines.py        # 28개 유닛 테스트
├── frontend/
│   └── src/
│       ├── app/page.tsx           # 메인 대시보드
│       └── components/
│           ├── PresetSelector.tsx  # 시나리오 선택 UI
│           ├── DlpComparisonViewer.tsx
│           ├── Log10Visualizer.tsx
│           ├── ArbitrationConsole.tsx
│           └── EkispertActionCard.tsx
├── Dockerfile                     # Cloud Run 통합 빌드
├── deploy_cloud_run.sh            # 원클릭 배포 스크립트
└── docker-compose.yml             # 로컬 개발용
```

---

## ☁️ Cloud Run 배포

```bash
chmod +x deploy_cloud_run.sh
./deploy_cloud_run.sh
```

---

## 📜 라이선스

MIT License - 제5회 Agentic AI Hackathon with Google Cloud
