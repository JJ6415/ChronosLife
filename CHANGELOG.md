# ChronosLife 변경 이력 추적 기록서 (Changelog & Historical Release Notes)
## 프로젝트 변경 이력, 기능 추가, 아키텍처 개선 및 문제 해결 히스토리

---

## 📌 문서 개요 및 변경 관리 원칙
본 문서는 **ChronosLife (Log-10 Hierarchical Temporal LifeOS)** 프로젝트의 기획부터 개발, 기능 고도화, 버그 수정 및 최적화에 이르는 모든 변경 사항을 체계적으로 기록하고 추적하기 위한 공식 변경 이력서입니다.

* **버전 관리 규약**: 유의적 버전(Semantic Versioning, `MAJOR.MINOR.PATCH`)을 준수합니다.
* **분류 체계**:
  * `[Feature]`: 신규 기능 추가 및 신규 컴포넌트 도입
  * `[Architecture]`: 아키텍처 구조 개편, 모델 파이프라인 변경, SDK 마이그레이션
  * `[Fix]`: 버그 수정, 렌더링 동기화 오류 해결, 런타임 예외 처리
  * `[Performance]`: 레이턴시 단축, 스트리밍 최적화, 메모리/로그 비대화 방지
  * `[UX/UI]`: 사용자 경험 개선, 디자인 튜닝, 여정(Workflow) 재설계

---

## 📅 변경 이력 타임라인 (Chronological Releases)

### 🚀 [v2.7.1] Layer 계층 체계 번호 재정립 (Layer 0: Privacy Sandbox, Layer 1: Context Orchestrator)
**Date:** 2026-10-05
* **[Architecture/Governance] 네트워크/보안 최전선 반영 Layer 번호 체계 재정립**:
  * 사용자 원본 발화가 시스템에 유입되는 최전선 경계(Ingress Perimeter)가 Cloud DLP 기반의 Privacy Sandbox이므로, 이를 **Layer 0**으로 명명.
  * 안전하게 가상 토큰화된 비식별 프롬프트를 수신하여 발화 의도를 분해하고 전문 에이전트 지침을 하달하는 상위 오케스트레이터를 **Layer 1**로 명명.
  * **완성된 6계층 구조**:
    - **Layer 0: Privacy Sandbox (DLP Ingress Perimeter)** - 초민감 개인정보 실시간 가상 토큰화
    - **Layer 1: Context Orchestrator & Audit Trace** - 비식별 프롬프트 인텐트 분해 & 에이전트 지침 하달
    - **Layer 2: Multi-Agent Domain Council** - 재정/커리어/웰빙 3대 도메인 전문 위원회 심의
    - **Layer 3: Chief Governor & Constitution Engine** - 헌법 가드레일 & 파레토 카운터오퍼 중재
    - **Layer 4: Log-10 Temporal Forecasting** - 5-Horizon 시계열 3중 궤적(기준/원안/중재안)
    - **Layer 5: Micro Action & Physical Mobility** - Cloud Run + Ekispert MCP 실행 레이어
* **[Frontend/UI] 전 계층 컴포넌트 및 스트리밍 메시지 레이블 일괄 동기화**:
  * `ProgressivePipelineTracker.tsx`: `Layer 0: Privacy Sandbox (DLP)`, `Layer 1: 인텐트 오케스트레이션`
  * `DlpComparisonViewer.tsx`: 헤더 타이틀을 `🔒 Layer 0: Privacy Sandbox (Cloud DLP 비식별화)`로 갱신.
  * `OrchestratorTraceViewer.tsx`: 헤더 타이틀을 `Layer 1: 인텐트 오케스트레이터 투명 감사 백로그 (Audit Trace)`로 갱신.
  * `page.tsx`: 실시간 SSE 수신 시의 안내 메시지 및 뷰어 주석 동기화.
* **[Backend] 엔드포인트 주석 및 테스트 문서화 동기화**:
  * `backend/main.py`: `analyze`, `analyze_stream`의 단계 주석 및 docstring을 Layer 0/Layer 1 체계로 일괄 수정.
  * `backend/tests/test_engines.py`: Privacy Guard 테스트 docstring을 Layer 0으로 갱신.
  * `chronoslife_architecture_blueprint.md` 및 `chronoslife_kick_off.md` 공식 아키텍처 다이어그램 및 명세 전면 동기화.

### 🚀 [v2.7.0] 3중 시계열 궤적(Tri-Line) 도입 및 Privacy Sandbox(DLP) 선제 방어 파이프라인 재설계
**Date:** 2026-10-05
* **[Security/Architecture] Privacy Sandbox (DLP) 최전선 배치 (Ingress Perimeter)**:
  * 원본 사용자 발화(계좌번호, 실명, 민감정보 등)가 LLM(오케스트레이터)에 전달되기 전에 Cloud DLP 가상 토큰화가 최우선 실행되도록 백엔드 파이프라인 재설계.
  * 오케스트레이터는 비식별화된 안전한 프롬프트(`dlp_result['sanitized']`)만을 수신하여 인텐트 분해 및 서브에이전트 지침을 하달.
  * 대시보드 UI 및 파이프라인 트래커(`ProgressivePipelineTracker`) 역시 **Stage 1: 개인정보 보호 뷰어(DLP)** $\to$ **Stage 2: 오케스트레이터 투명 감사 백로그** 순서로 전면 재배치.
* **[Feature/Simulation] 5-Horizon 3중 시계열 궤적 선그래프 (Tri-Line Trajectory)**:
  * 기존의 단순 2중선(기준선 vs 원안선) 구조에서 탈피하여, 최고 중재관의 파레토 카운터오퍼/타협안을 따랐을 때의 궤적인 **`✨ 중재안 준수 시 (Governed Arbitrated: Emerald Green 발광 실선)`** 신설.
  * **3대 궤적 완성**:
    1. **기준선 (Baseline)**: 평온한 현상 유지 궤적 (Cyan/Slate 점선)
    2. **원안 강행 시 (As-Is)**: 판결 무시 충동 강행 궤적 (Rose 점각선)
    3. **중재안 준수 시 (Governed)**: 최고 중재관 파레토 타협안 수용 궤적 (Emerald 발광 실선)
  * 호버 툴팁 및 5단계(L0~L4) 인과 상세 카드에서 [원안 강행 시]와 [중재안 준수 시]의 점수와 서사를 1:1로 직접 대비하여, 사용자가 중재안을 수용했을 때의 파레토 이득(복리 은퇴 지연 0일 방어, 번아웃 소멸 등)을 시각적으로 명확하게 체험할 수 있도록 강화.

### 🚀 [v2.6.0] 과거 팩트(1일 선형)와 미래 예측(Log-10)의 시각화 분리 및 실시간 라이프 바이탈 레이더 신설
**Date:** 2026-10-05
* **[Architecture/UX] 과거(선형 1일) vs 미래(로그 등간격) 시각화 분리**:
  * 1일 단위 과거 데이터와 $10^0 \to 10^4$일 미래 예측선이 동일 가로축에 공존하며 발생하던 시간 스케일 왜곡(Cognitive Scale Distortion) 문제를 완벽히 해소.
  * 하단 `GoalImpactMatrix`는 순수한 **Log-10 5-Horizon ($10^0 \to 10^4$일) 미래 예측 선그래프**로 복원하여 이번 의사결정이 삶의 비전에 미치는 파급력에만 집중.
* **[Feature/Frontend] `LifeVitalRadar` 컴포넌트 신설 (`LifeVitalRadar.tsx`)**:
  * 대화 콘솔 상단에 **[실시간 라이프 바이탈 레이더 (Live State Radar)]** 카드 도킹.
  * 4대 핵심 바이탈(번아웃 지수, 주간 예산 소진율, 수면 부채 누적, 주간 취미 쿼터)과 각 영역별 **최근 7일 마이크로 스파크라인(Sparkline 바 차트)**을 미려하게 시각화.
  * 번아웃 70점 초과 또는 연속 야근 감지 시, 사용자가 글을 쓰기 전에 충동 결정을 한 템포 늦추도록 경고하는 **`[라이프가드 사전 진단] 의지력 고갈성 보상 심리 주의보`** 배너 표출.
  * 화면 공간 절약을 위해 접기/펼치기(Collapse/Expand) 기능 및 새로고침 지원.
* **[Backend] `GET /api/state/current` 엔드포인트 신설 (`main.py`)**:
  * 대화 시작 전 사용자의 롤링 윈도우 누적 상태(피로, 지출 속도, 7일 스냅샷 원시 데이터)를 프론트엔드에 즉시 제공하는 REST API 구현.

### 🐛 [v2.5.1] 5대 목표 시계열 궤적 선그래프 & 영향도 점수 정합성 동기화
**Date:** 2026-10-04
* **[Fix/Algorithm]**: `GoalManager._build_horizon_trajectory`와 `evaluate_action_impact` 간의 조건 분기 불일치 문제 해결.
  * **건강(Health) 모순 해결**: 고액 충동 지출 시 상단 요약 카드는 `-5%`로 표기되나 시계열 그래프에서 L0~L4가 전부 `0%`로 나오던 누락 분기를 수정하여, L0(-5%)에서 L4(0%)로 회복되는 연속 궤적 반영.
  * **가족(Family) 모순 해결**: 고액 독단 소비 시 상단 요약 카드는 `-15%`로 감점되나, 그래프에서는 텍스트 내 "아내" 키워드만 단순 매칭하여 `+8% ~ +6%`의 긍정 궤적이 나오던 역전 버그를 수정. L0(-15%)에서 L4(0%)로 점진 회복되는 인과 서사 반영.
  * **재정/커리어/취미 일관성 강화**: 요약 카드의 점수(`score`)와 시계열 $L_0$ 초기 충격치(Delta)를 1:1로 완전 동기화(재정 -36%, 커리어 +15%, 취미 +35%).

### 🚀 [v2.5.0] 동적 상태 공간(State-Space) 거버넌스 및 과거 궤적 렌더링 도입
**Date:** 2026-10-04
* **[Architecture]**: 단발성(Point) 분석의 한계를 극복하기 위한 `Layer 0.5: Chronos State Dynamics Engine` (`state_engine.py`) 신규 도입. 수면 부채, 연속 야근, 피로 누적, 예산 가속도 등을 비선형적으로 계산하여 `LifeStateVector`를 도출.
* **[Architecture]**: `ChronosContextCacheManager` (`context_cache_manager.py`) 생성. Gemini API의 Context Caching 기능을 활용하여 30~60일간의 사용자 발화/결정/심의 로그를 초저비용/초저지연으로 메모리에 상시 캐시(TTL)하는 기반 마련.
* **[Feature/UX]**: 프론트엔드 `GoalImpactMatrix.tsx` 5단계 시계열 궤적 선그래프 고도화. 기존의 [현재 기준선 vs 미래 예상선] 구조에서 벗어나, 좌측에 **[지난 7일간의 과거 상태 추이(Past Trajectory) 점선 및 노드]**를 추가 연결 렌더링함으로써 시간의 연속성을 시각적으로 완성.
* **[Feature/Data]**: 메인 서버(`analyze_stream`)에서 `StateDynamicsEngine`의 롤링 윈도우 계산 결과(`state_result`)를 위원회(Domain Council) 및 최고 중재관에게 `cascade_summary` 형태로 전달하여, "의지력 고갈성 보상 소비 감지" 등의 임계점(Tipping Point) 돌파 상황을 AI 에이전트들이 인지할 수 있도록 파이프라인 통합.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               ChronosLife Version Release Roadmap                               │
├─────────┬─────────────┬─────────────────────────────────────────────────────────────────────────┤
│ Version │ 일자        │ 핵심 변경 요약                                                          │
├─────────┼─────────────┼─────────────────────────────────────────────────────────────────────────┤
│ v0.9.1  │ 2026-10-04  │ 이미지 생성기 사용자 토글(OFF) 탑재 및 전체 지연시간 50% 단축 (~15.8초) │
│ v0.9.0  │ 2026-10-04  │ 대시보드 순차 공개(Progressive Reveal) 완전 정상화 & Stage 3/4 분리     │
│ v0.8.0  │ 2026-10-04  │ 이미지 전용 API 키 분리 & gemini-3.1-flash-image 실시간 웹툰 컷 연동    │
│ v0.7.0  │ 2026-10-03  │ 실시간 개발자 관제 인스펙터(DevLogInspector) & 순수 ASGI 무버퍼링 전환 │
│ v0.6.0  │ 2026-10-03  │ 누적 심의 히스토리 트래커 & 과거 안건 원클릭 대시보드 복원 시스템      │
│ v0.5.0  │ 2026-10-03  │ 3단계 사용자 여정 개편: '인생 헌법 & 5대 목표 스튜디오' 기본 진입 설정  │
│ v0.4.0  │ 2026-10-03  │ Google GenAI 공식 Gemini 3.8 Live WebSocket 오디오 & Three.js 3D 아바타 │
│ v0.3.0  │ 2026-10-02  │ Multimodal 5컷 라이프 만화 & 5-Horizon 다차원 궤적 선그래프 구축       │
│ v0.2.0  │ 2026-10-02  │ Google GenAI SDK 마이그레이션 & 객체지향 캡슐화 서브에이전트군 전환     │
│ v0.1.0  │ 2026-10-01  │ 초기 6계층 코어 엔진 및 FastAPI + Next.js 풀스택 모노리포 뼈대 구축     │
└─────────┴─────────────┴─────────────────────────────────────────────────────────────────────────┘
```

---

### [v0.9.1] - 2026-10-04: 이미지 생성기 사용자 제어 토글(OFF) 및 응답 성능 2배 최적화

#### 🚀 [Feature] & [Performance]
* **이미지 생성기 설정 스위치 (`ENABLE_IMAGE_GENERATION`) 도입**:
  * 사용자 요청에 따라 AI 이미지 생성기(`gemini-3.1-flash-image`) 기능을 기본 OFF로 설정할 수 있는 환경 변수(`backend/.env`) 및 런타임 제어 로직 구현.
  * `backend/engines/comic_engine.py`의 Cut 1 이미지 자동 생성 과정을 조건부 스킵하여 불필요한 이미지 쿼터 소모를 방지.
  * 단일 컷 생성 엔드포인트(`/api/governance/comic/generate-panel-image`) 호출 시 `{ status: "disabled", message: "사용자 요청에 따라 이미지 생성기 기능이 현재 OFF 상태입니다." }`를 안전하게 반환.
* **전체 거버넌스 심의 파이프라인 지연시간 50% 단축**:
  * 기존 이미지 생성 대기 시간(~15.2초)이 배제되면서 전체 심의 소요 시간이 **~31초 $\to$ 15.8초**로 대폭 단축.
* **웹툰 뷰어 UI 최적화 (`Log10ComicStripViewer.tsx`)**:
  * 상단 헤더에 `이미지 생성기: OFF` 상태 배지 추가.
  * 기존에 미생성 컷을 가리던 75% 어두운 고정 오버레이를 제거하여, 각 컷의 고유한 맞춤형 SVG 테마 그래픽(`VisualIllustration` - Rainy Neon City, Dawn Buffer, Fresh Habit 등)을 깨끗하게 감상할 수 있도록 개선 (마우스 호버 시에만 액션 버튼 노출).

---

### [v0.9.0] - 2026-10-04: 대시보드 순차 실시간 공개(Progressive Reveal) 완전 정상화

#### 🛠️ [Fix] & [Architecture]
* **백엔드 SSE 스트리밍 버퍼링 근본 해결 (Starlette 미들웨어 버퍼링 제거)**:
  * 원인: 기존 `DevInspectorMiddleware`가 Starlette의 `BaseHTTPMiddleware`를 상속받아 AnyIO 내부 메모리 스트림으로 청크를 버퍼링하여 제너레이터 완료 시점(약 28초 뒤)에 모든 이벤트가 한꺼번에 전달되는 문제 발생.
  * 해결: 순수 ASGI 미들웨어(`async def __call__(self, scope, receive, send)`)로 재작성하고, `/api/analyze/stream` 경로는 0ms 무지연으로 즉시 스트리밍되도록 파이프라인 분리.
* **Layer 2 & 3 중재 콘솔 디커플링 및 스켈레톤 UI 도입 (`ArbitrationConsole.tsx`)**:
  * 기존에는 Stage 3(도메인 위원회)과 Stage 4(최고 중재관) 데이터가 모두 존재해야만 콘솔이 렌더링되던 조건식(`council_verdict && governor_ruling`)을 해제.
  * Stage 3 도착 즉시 3대 도메인 위원회의 찬반 카드를 공개하고, 최고 중재관 영역은 "Layer 3: 최고 중재관이 도메인 상충을 중재하고 판결문을 작성 중입니다..." 펄스 스켈레톤 카드를 노출한 뒤 Stage 4 완료 시 정식 판결문 카드로 매끄럽게 전환.
* **대시보드 컴포넌트 렌더링 순서 재정렬 (`page.tsx`)**:
  * 파이프라인 진행 순서에 맞춰 `Layer 0(오케스트레이터) → Layer 1(DLP) → Layer 2&3(카운슬/중재관) → Stage 5(목표 궤적) → Stage 5(5컷 웹툰)` 순서로 DOM을 재배치하여 시각적 화면 점핑 현상 해소.

---

### [v0.8.0] - 2026-10-04: 이미지 전용 API 키 분리 및 gemini-3.1-flash-image 연동

#### 🚀 [Feature] & [Fix]
* **듀얼 API 키 아키텍처 구성**:
  * 텍스트 추론/음성/거버넌스용 메인 키(`GEMINI_API_KEY`)와 이미지 생성 전용 키(`GEMINI_IMAGE_API_KEY`)를 환경변수 수준에서 엄격히 분리하여 쿼터 경합 및 고갈 방지.
* **Google GenAI Interactions API 프로토콜 정립 (`comic_engine.py`)**:
  * `client.interactions.create(model='gemini-3.1-flash-image', input=prompt)` 호출을 통해 고품질 웹툰 컷 이미지(약 880KB PNG) 실시간 생성 및 `frontend/public/comics/` 저장 연동 검증.
* **웹툰 모달 이미지 동기화 버그 수정 (`Log10ComicStripViewer.tsx`)**:
  * 5컷 스트립 패널에서 생성된 이미지가 개별 컷 상세 모달 창을 클릭했을 때 반영되지 않던 참조 오류(`modalImg = panelImages[selectedPanel.panel_number] || selectedPanel.image_url`) 수정.

---

### [v0.7.0] - 2026-10-03: 실시간 개발자 관제 인스펙터 & 로그 비대화 방지

#### 🚀 [Feature] & [Performance]
* **실시간 개발자 관제 인스펙터 구축 (`dev_logger.py`, `DevLogInspector.tsx`)**:
  * 프론트엔드 하단에 도킹 가능한 접이식 드로어 UI 개발.
  * 모든 HTTP API 요청(엔드포인트, 상태코드, 소요시간) 및 내부 LLM 호출(호출자, 모델명, 소요시간, 프롬프트, 응답 원문)을 실시간 폴링 및 상세 JSON 모달로 검증 지원.
* **로그 파일 용량 폭증 버그 해결**:
  * 원인: 거대 스트리밍 응답 페이로드가 `api_inspector.jsonl`에 반복 중복 기록되어 파일 크기가 GB 단위로 치솟는 문제 발생.
  * 해결: 인메모리 링버퍼(최신 100건) 기반으로 아키텍처를 전환하고, 대용량 바이너리/스트림 로깅을 배제하여 파일 크기를 안전하게 수 MB 수준으로 제한.

---

### [v0.6.0] - 2026-10-03: 누적 심의 히스토리 트래커 및 원클릭 대시보드 복원

#### 🚀 [Feature]
* **누적 심의 히스토리 매니저 (`history_manager.py`)**:
  * 사용자가 요청한 모든 의사결정 심의 결과를 `backend/logs/history_deliberations.jsonl`에 타임스탬프 기반으로 영구 적립.
  * 판결 결과(승인/조건부수정/기각), 위반 헌법 조항, 인텐트 분류, 지출 금액 등 핵심 지표 자동 인덱싱.
* **누적 심의 히스토리 뷰어 (`DeliberationHistoryTracker.tsx`)**:
  * 메인 내비게이션 3단계 탭에 히스토리 콘솔 추가.
  * 일자별/상태별 검색 필터, 종합 승인율/기각률 통계 대시보드 제공.
  * **원클릭 대시보드 복원**: 과거 심의 카드의 '대시보드에서 보기' 클릭 시 해당 안건의 5단계 전체 결과(오케스트레이터, DLP, 위원회, 판결문, 만화, 궤적)를 메인 대시보드로 즉시 재로딩.

---

### [v0.5.0] - 2026-10-03: 3단계 사용자 여정 개편 (인생 헌법 스튜디오 기본 진입)

#### 🎨 [UX/UI] & [Architecture]
* **사용자 경험 여정 혁신 (First-Time Experience Redesign)**:
  * 문제점: 앱 최초 진입 시 빈 대시보드가 노출되어 사용자가 무엇을 해야 할지 알기 어려움.
  * 개선: 앱 접속 시 **'1단계: 인생 헌법 & 5대 목표 스튜디오'를 기본 활성 탭(Default Landing)**으로 설정하여, 30년 인생 헌법과 5대 목표를 먼저 설정하도록 안내.
* **3단계 프로세스 내비게이션 바**:
  * `[1. 인생 헌법 & 5대 목표 스튜디오]` $\to$ `[2. 실시간 라이프 거버넌스 심의]` $\to$ `[3. 누적 심의 히스토리]` 상단 탭 구조 정립.
* **1:1 AI 인생 헌법 설계관 대화 인터뷰 콘솔 (`GoalConstitutionStudio.tsx`)**:
  * 사용자와 실시간 대화 인터뷰를 나누며 헌법 제1조~제5조와 5대 목표 수치를 조율하고 실시간 후속 추천 질문 3종 제공.

---

### [v0.4.0] - 2026-10-03: Google GenAI 공식 Gemini 3.8 Live WebSocket & Three.js 3D 아바타

#### 🚀 [Feature] & [Architecture]
* **공식 Gemini 3.8 Live 양방향 오디오 파이프라인 (`gemini_live_session.py`)**:
  * Google GenAI SDK `client.aio.live.connect(model="gemini-3.8-live")` 기반 영구 WebSocket 인터페이스 구축 (`/ws/gemini-live`).
  * 16kHz 업스트림 PCM 전송 및 24kHz 다운스트림 네이티브 오디오 PCM 스트리밍 재생.
  * **실시간 Tool Calling (`update_life_goal`)**: 음성 대화 도중 사용자의 가치관에 따라 헌법 및 목표 카드를 실시간 자동 갱신.
* **Three.js WebGL 3D 사이버네틱 아바타 (`GeminiLiveAvatar3D.tsx`)**:
  * 오디오 파형에 반응하는 실시간 립싱크(Lip-Sync Morphs).
  * 상태별 비주얼 피드백: 경청(Listening - 에메랄드 림라이트), 생각(Thinking - 오비탈 링 고속 회전), 발화(Speaking - 바이올렛 펄스).
  * 마우스 시선 추적 및 360도 3D 인터랙티브 회전 인터랙션.

---

### [v0.3.0] - 2026-10-02: Multimodal 5컷 라이프 만화 & 5-Horizon 다차원 궤적 선그래프

#### 🚀 [Feature]
* **Multimodal Log-10 5컷 웹툰 만화 크로니클 (`comic_engine.py`, `Log10ComicStripViewer.tsx`)**:
  * $10^0$일(오늘)부터 $10^4$일(30년 후)까지의 인과율을 5컷 웹툰 스토리보드(씬 묘사, 대사, AI 권고, 나레이션)로 자동 생성.
  * 5가지 시각 테마(Rainy Neon, Dawn Buffer, Fresh Habit, Golden Growth, Peaceful Sunset) SVG 일러스트레이션 렌더링.
* **5-Horizon 다차원 궤적 선그래프 (`GoalImpactMatrix.tsx`)**:
  * 정적 매트릭스를 탈피하여 Baseline(기준선) vs Projected(예상선) 듀얼 곡선 시각화.
  * 자원 확장(+) 시 에메랄드 그린, 자원 잠식(-) 시 로즈 레드 영역 채움(Area Shading) 적용.
  * 종합, 재정, 커리어, 건강, 가족, 취미 인터랙티브 탭 스위처 제공.

---

### [v0.2.0] - 2026-10-02: Google GenAI SDK 마이그레이션 & 객체지향 캡슐화 서브에이전트

#### 🏗️ [Architecture]
* **Google 공식 생성형 AI SDK (`google-genai`) 전면 도입**:
  * 기존 구형 라이브러리(`google.generativeai`)를 차세대 `from google import genai`로 전환.
* **객체지향 캡슐화 서브에이전트군 리팩토링 (`backend/engines/subagents/`)**:
  * `BaseSubAgent` 추상 베이스 클래스 정의.
  * `FinanceSubAgent`, `CareerSubAgent`, `WellbeingSubAgent`를 독립 파일로 모듈화하여 단일 책임 원칙(SRP) 준수.
* **동적 16개 Gemini 모델 레지스트리 (`model_registry.py`)**:
  * `client.models.list()`를 연동하여 가용한 최신 모델을 실시간 감지하고 UI 드롭다운에 제공.

---

### [v0.1.0] - 2026-10-01: 초기 아키텍처 수립 및 풀스택 모노리포 뼈대 구축

#### 🏗️ [Architecture] & [Initial Release]
* **ChronosLife 프로젝트 기획 및 아키텍처 청사진 확립**:
  * `chronoslife_architecture_blueprint.md` 및 `chronoslife_kick_off.md` 작성.
* **6계층 코어 아키텍처 설계**:
  * Layer 0: Context Orchestrator & Audit Trace
  * Layer 1: Google Cloud DLP Sensitive Data Protection (`privacy_guard.py`)
  * Layer 2: Multi-Agent Domain Council (`domain_council.py`)
  * Layer 3: Chief Governor & Constitution Engine (`chief_governor.py`)
  * Layer 4: Log-10 Temporal Forecasting Cascade (`log10_engine.py`)
  * Layer 5: Ekispert API MCP Mobility Client (`ekispert_client.py`)
* **풀스택 모노리포 환경 구축**:
  * Backend: FastAPI (Python 3.11+), Uvicorn
  * Frontend: Next.js 15, React, Tailwind CSS, TypeScript
  * Mock-First 아키텍처: 오프라인 데모 시연을 위한 `backend/mock_data/presets.json` 3대 시나리오 프리셋 내장.
