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

### 🚀 [v2.9.3] 라이프 바이탈 레이더 대화 기반 실시간 양방향 갱신(Live State Sync) 파이프라인 완성
**Date:** 2026-10-08
* **[Architecture/State] 대화 발화 인텐트 기반 실시간 바이탈 델타 추적 및 세션 윈도우 동적 누적 (`main.py`, `state_engine.py`)**:
  - **원인 분석**:
    1. 프론트엔드의 `LifeVitalRadar` 컴포넌트가 아무런 Props(`stateData`, `historyWindow`)를 전달받지 못하고 컴포넌트 최초 마운트 시점에만 `/api/state/current`를 1회 단발성 호출하여 정적 상태로 고정되어 있었음.
    2. 백엔드 `get_mock_history_window()`가 호출 시마다 랜덤 데이터를 새로 생성하여 버리는 비영속 구조였으며, 사용자가 대화창에서 지출이나 야근을 입력해도 라이프 바이탈 레이더 스냅샷에 전혀 반영되지 않았음.
    3. `state_engine.py`에서 `burnout_index`가 0.0~1.0 비율로 반환되어 프론트엔드 0~100 스케일(`burnout_index >= 70`)과 스케일 불일치가 존재했음.
  - **해결 조치**:
    - **백엔드 세션 히스토리 추적기 구축**: `_USER_HISTORY_WINDOW`와 `update_user_history_with_action`을 도입하여, 사용자가 입력한 대화 내용(예: 지출 금액, 야근/철야 키워드, 가족 식사, 운동/취미)을 자동으로 파싱(`extract_vital_deltas_from_input`)하여 당일(`10-08`) 스냅샷 및 7일 창에 즉각 누적 반영.
    - **실시간 스트리밍 & 프리셋 전면 연동**: `/api/analyze/stream`의 Stage 1(DLP), Stage 2(Orchestrator), 프리셋 완료 시점에 항상 최신 `state_dynamics`와 `history_window`를 함께 방출하도록 개편.
    - **초기화 엔드포인트 제공**: `/api/state/reset`을 추가하여 사용자가 레이더 상단 새로고침 클릭 시 기본 상태로 안전하게 롤백 가능하도록 지원.
* **[Frontend/UX] `LifeVitalRadar` 양방향 Props 동기화 및 실시간 반영 배지 구현 (`LifeVitalRadar.tsx`, `page.tsx`)**:
  - `LifeVitalRadarProps`(`stateData`, `historyWindow`, `isUpdating`) 인터페이스를 도입하고, `page.tsx`에서 SSE 수신 데이터(`analysisResult?.state_dynamics`)를 실시간 주입.
  - 사용자가 대화 콘솔에서 메시지를 전송하자마자 번아웃 지수, 예산 소진율, 7일 스파크라인 막대 그래프가 즉각적으로 상승/변화하며, 상단에 **`✨ 対話反映 (Live Synced)`** 뱃지가 실시간 점등되도록 시각적 피드백 완성.
  - `burnoutScore` 방어 연산을 적용하여 0~100 스케일 통일(예: `78 / 100`).
* **[Verification] E2E 실시간 갱신 검증 완료**:
  - 35만 원 키보드 지출 및 23시 야근 발화 테스트 결과: 주간 예산 소진율(87.5% ➔ 333.2%), 번아웃 지수(93.0 ➔ 96.0), 당일 7일차 스냅샷(`expense_total: 350,000`, `work_hours: 11.5`)이 실시간 동기화됨을 검증 완료.

### 🚀 [v2.9.2] 5대 시계열 지평 카드(L0~L4) 100% 일본어 현지화 및 2중 방어 파이프라인 구축
**Date:** 2026-10-08
* **[Backend/i18n] 5단계 시계열 지평 궤적 생성기 언어별 동적 분기 구현 (`goal_manager.py`)**:
  - **원인 분석**: 5대 핵심 목표의 5단계 시계열 궤적(Temporal Trajectory)을 생성하는 `_build_horizon_trajectory` 함수에 `locale` 매개변수가 누락되어 있었으며, 카드 상단 라벨(`1일 (L0)` ~ `30년 (L4)`), 하단 스케일(`일일 즉각` ~ `인생 헌법`), 그리고 5대 도메인별 원안/중재 나레이션(`현 직무 상태 유지`, `L0 소액 소비 발생` 등)이 한국어로 고정되어 프론트엔드로 전달되고 있었음.
  - **해결 조치**:
    - `_build_horizon_trajectory`에 `locale: str = "ko"` 인자 추가 및 상위 `evaluate_action_impact`로부터 호출 체인 연결.
    - `horizons_meta`를 언어별(ja/en/ko)로 분기: 일본어 선택 시 `1日 (L0) / 日次即時`, `7日 (L1) / 週次戦術`, `1年 (L2) / 年次戦略`, `5年 (L3) / 5ヶ年ロードマップ`, `30年 (L4) / 人生憲法`으로 정확히 방출.
    - 5개 도메인(재정, 커리어, 건강, 가족, 취미)의 모든 시계열 나레이션(`notes`, `arb_notes`)을 다국어 도우미 `_loc_list`로 일본어/영어/한국어로 완전 번역 분기.
* **[Frontend/i18n] 프론트엔드 2차 안전 방어 레이어(Defense-in-Depth) 구축 (`GoalImpactMatrix.tsx`)**:
  - `next-intl`의 `useLocale`을 연동하고 계층 메타 매핑(`HORIZON_TIER_LOCALE_MAP`), 나레이션 안전 변환기(`translateNarrative`) 구현.
  - 종합 밸런스(Composite) 및 개별 도메인 카드 렌더링, X축 라벨, 호버 툴팁 바에서 백엔드 레거시 상태나 캐시 데이터가 유입되더라도 100% 현재 언어(일본어)로 자동 치환/렌더링되도록 2중 방어 완료.
* **[Verification] E2E 엔드투엔드 파이프라인 및 개발 서버 정상 동작 검증**:
  - `npm run build`를 통해 TypeScript 유효성 검사 및 번들링 100% 통과(0 Errors).
  - 백엔드(`/api/analyze`) 실시간 호출 테스트로 `Domain: 財政`, `1日 (L0) | 日次即時`, `1日可処分40,000ウォン限度額超過 (-350,000ウォン)` 등 5단계 지평 카드가 일본어로 깨끗하게 방출됨을 확인.
  - 백엔드(포트 8080) 및 프론트엔드(포트 3000) 개발 서버 정상 가동 완료.

### 🚀 [v2.9.1] 헤더 API 라이브 뱃지 삭제 및 웹툰 프롬프트 100% 일본어 전면 현지화
**Date:** 2026-10-08
* **[UX/UI] 상단 헤더 우측 'API LIVE' 뱃지 및 3초 주기 폴링 인터벌 완전 삭제 (`Header.tsx`)**:
  - 요청-응답 사이의 인터벌 인식 한계 및 불필요한 주기적 헬스체크 오버헤드를 제거하고 상단 네비게이션 헤더를 심플하고 쾌적하게 정리.
* **[AI/i18n] Log-10 웹툰 스토리보드 생성 프롬프트 및 예시 100% 현지화 (`comic_engine.py`)**:
  - **원인 분석**: `comic_engine.py` 내부의 시스템 지침과 컷 2~5의 JSON 스키마 예시 텍스트("컷 소제목", "주인공 대사", "10일 후" 등)가 한국어로 하드코딩되어 있어, 일본어 요청 시에도 Gemini가 한국어 단어를 모방하거나 출력에 섞는 현상 발생.
  - **해결 조치**:
    - `locale == 'ja'` 시 프롬프트 지침, 5대 시계열 구성 원칙, JSON 스키마 플레이스홀더를 전면 일본어로 재작성하고, "韓国語（ハングル文字）は絶対に出力に含めないでください" 강력 지시 주입.
    - `locale == 'en'` 및 `locale == 'ko'` 전용 독립 프롬프트 파이프라인 구축.
    - 웹툰 파싱 후 `scale_label`("10⁰ (1日)" ~ "10⁴ (30年)") 및 `timeframe`("今夜" ~ "約30年後")을 선택 언어 사전(`SCALE_MAP`, `TIMEFRAME_MAP`)으로 100% 일괄 동기화.
* **[Mock Data/i18n] 일본어 전용 시나리오 프리셋 구축 (`mock_data/presets_ja.json`, `main.py`)**:
  - 프리셋 시나리오 1~3(충동 지출, 고연봉 스타트업, 연속 야근 모빌리티)의 입력 발화 및 판결문이 일본어로 완비된 `presets_ja.json`을 신규 생성하고, `req.locale == 'ja'` 시 자동 로드되도록 백엔드 라우팅 연동 완료.
  - 엔드투엔드 테스트 결과: 5컷 만화 제목 및 모든 컷의 소제목, 대사, 나레이션이 100% 일본어로 깨끗하게 생성됨을 최종 검증 완료.

### 🚀 [v2.9.0] Gemini API 키 전면 교체(인증 복구) 및 5개 심의 레이어 풀 파이프라인 완주 검증
**Date:** 2026-10-08
* **[Security/Auth] 사용자 지정 인증 키(`AQ.Ab8RN6ITW...`) 전면 동기화**:
  - `backend/.env` 및 루트 `.env`의 `GEMINI_API_KEY`와 `GEMINI_IMAGE_API_KEY`를 유효한 인증 키(`AQ.Ab8RN6ITW...REDACTED...`)로 일괄 교체.
  - **Layer 0 중단 현상 원인 규명 및 해결**:
    - 기존 백엔드에 잔류하던 이전 키에서 `401 Unauthorized (UNAUTHENTICATED - ACCESS_TOKEN_TYPE_UNSUPPORTED)`가 발생하여, Layer 0(DLP 마스킹) 완료 직후 Layer 1(Context Orchestrator) 단계에서 예외가 발생하며 스트리밍이 중단되었던 현상 확인.
    - 인증 키 교체 후 **Layer 0 (DLP) ➔ Layer 1 (Orchestrator) ➔ Layer 2 (3대 도메인 위원회) ➔ Layer 3 (최고 중재관) ➔ Layer 4 (Log-10 궤적 & 5컷 웹툰) ➔ Layer 5 (Ekispert MCP 행동 처방)** 전 단계 및 **gemini-3.1-flash-image 1MB 실시간 웹툰 컷 이미지 생성**까지 100% 정상 완주 검증 완료.
* **[Frontend/UX] 프론트엔드 SSE 스트림 에러 핸들링 보강 (`page.tsx`)**:
  - SSE 이벤트에서 `stage === 'error'` 또는 `stageErr` 수신 시 내부 catch로 숨기지 않고 상단 에러 배너(`setError`)에 명확히 표출하도록 개선.
* **[Backend] FastAPI 서버 실시간 리로드 및 무결성 재기동 완료**.

### 🚀 [v2.8.9] 웹툰 컷 상세 모달 클리핑 버그 완전 해결 (createPortal 최상위 포탈 렌더링)
**Date:** 2026-10-08
* **[Fix/UX] 웹툰 컷 상세 확대 모달의 컨테이너 경계 잘림 현상(Clipping) 완전 해결 (`Log10ComicStripViewer.tsx`)**:
  - **원인 분석**: 부모 웹툰 카드 컴포넌트에 적용된 `backdrop-blur-xl`, `relative`, `overflow-hidden` 및 `animate-fade-in` 속성으로 인해 CSS 사양상 새로운 Stacking Context(쌓임 맥락) 및 Containing Block이 생성되어, 자식 `position: fixed` 요소가 브라우저 뷰포트가 아닌 5컷 카드 내부 영역에 갇히고 위아래가 잘려나가는 현상 발생.
  - **해결 조치**: React의 `createPortal(..., document.body)`을 도입하여 모달 DOM을 최상위 `document.body`로 탈출시킴.
  - **모달 UX/UI 전면 개편**:
    - `fixed inset-0 z-[9999]`의 전면 오버레이 및 딤 처리(`bg-black/85 backdrop-blur-md`).
    - 헤더(타이틀, 타임프레임, 닫기 X 버튼) 및 푸터(라이프 밸런스 점수, 닫기 버튼)를 `shrink-0`으로 고정.
    - 본문 컨텐츠 영역에 `max-h-[88vh]`, `overflow-y-auto flex-1 overscroll-contain`을 부여하여 모바일/데스크톱 화면 높이를 초과하지 않고 부드럽게 내부 스크롤되도록 구조화.
    - ESC 키 누름 및 배경 바깥 클릭 시 닫기, 모달 활성화 시 `document.body.style.overflow = 'hidden'` 배경 스크롤 차단 적용.
    - AI 이미지 생성 에러 메시지(`429` 쿼터 초과 등)의 줄바꿈(`break-words`, `whitespace-normal`) 보정으로 가로 넘침 방지.
* **[Fix] `Log10ComicStripViewer.tsx` 일괄 생성 상태(`batchProgress`, `setBatchProgress`) 복원 및 TypeScript 컴파일 오류 해결 (0 Errors 통과)**.

### 🚀 [v2.8.8] Ekispert 소요 시간 단위 다국어화(分/min/분) 및 이미지 생성기 동적 ON/OFF 배지 연동
**Date:** 2026-10-08
* **[Fix/i18n] Ekispert 소요 시간 단위 한국어 잔여 버그('12분', '24분' ➔ '12分', '24分') 완전 해결**:
  - `backend/tools/ekispert_mcp.py`: `if locale != 'en': '분'`으로 인해 일본어 모드에서도 한국어 단위가 붙던 로직을 `unit = '分' if locale == 'ja' else (' mins' if locale == 'en' else '분')`으로 정밀 분기.
  - `backend/main.py`: 프리셋(시나리오 3) 실행 시에도 하드코딩된 정적 한국어 데이터 대신 실시간 Ekispert 모빌리티 처방(`locale` 기반)을 동적으로 생성하여 주입하도록 개선.
  - `frontend/src/components/EkispertActionCard.tsx`: `formatDuration` 헬퍼 함수를 신설하여 최단 경로, 총 소요 시간, 세부 보행 구간 소요 시간의 단위를 현재 언어(`ja` ➔ `分`, `en` ➔ `min`, `ko` ➔ `분`)에 맞춰 2중 방어 치환.
* **[UX/UI] 웹툰 뷰어 이미지 생성기 상태 배지 동적 연동 (`Log10ComicStripViewer.tsx`)**:
  - 기존에 UI 상에서 `画像生成器: OFF`로 정적 고정되어 있던 배지를 `comic.image_generation_enabled` 값과 실시간 연동.
  - `.env`에서 `ENABLE_IMAGE_GENERATION=True` 설정 시, 보라색 펄스 뱃지 **`画像生成器: ON (gemini-3.1-flash-image)`**로 자동 활성화 표시되며 컷 이미지 자동 생성 및 일괄 재생성이 정상 동작하도록 UI 동기화 완료.

### 🚀 [v2.8.7] 이미지 생성기 활성화, 기본 언어 일본어(ja) 전환 및 Gemini Live 엔진 배지 개편
**Date:** 2026-10-08
* **[Feature/Multimodal] AI 이미지 생성기 활성화 (`ENABLE_IMAGE_GENERATION=True`)**:
  - `backend/.env` 및 루트 `.env`의 `ENABLE_IMAGE_GENERATION` 값을 `True`로 전환하여 5컷 만화 씬 생성 시 `gemini-3.1-flash-image` 실시간 고해상도 웹툰 컷 이미지 자동 생성 재개.
* **[Architecture/i18n] 시스템 기본 언어(Default Locale) 일본어(`ja`)로 전면 전환**:
  - `frontend/src/i18n.ts`: 요청 로케일이 없을 때 기본 언어를 `'ja'`로 설정.
  - `frontend/src/middleware.ts`: `defaultLocale: 'ja'`로 변경하여 접속 시 `/ja`로 자동 라우팅.
  - `backend/main.py`: `AnalyzeRequest`, `GoalChatRequest`, `GoalLiveVoiceRequest`, `/api/goals`, `/api/state/current`, `/api/ekispert/prescription` 등 모든 엔드포인트의 기본 `locale` 매개변수를 `"ja"`로 일괄 동기화.
* **[UX/UI/i18n] EkispertActionCard 100% 다국어화 (한국어 하드코딩 완전 제거)**:
  - `frontend/src/messages/components/EkispertActionCard_*.json` (ko/ja/en) 사전 구축 및 `merge_translations.py` 통합.
  - `EkispertActionCard.tsx`에 `useTranslations('EkispertActionCard')` 적용: 타이틀, Before/After 루트 레이블, 교통수단/혼잡도, 절약 금액/차단 칼로리/웰니스 효과 텍스트를 선택 언어에 맞게 완벽 전환.
* **[UX/UI] Gemini Live 인터페이스 모델 셀렉터 제거 및 단일 엔진 고정 배지 도입**:
  - `GoalConstitutionStudio.tsx`: `gemini-3.8-live` 단일 네이티브 오디오 모델로 구동되는 음성 코칭 환경의 특성에 맞추어, 불필요한 모델 선택 드롭다운을 제거하고 **`Gemini 3.8 Live [Fixed]`** 펄스 뱃지로 인터페이스를 직관적으로 개선.
  - `npx tsc --noEmit` 무결성 검증 통과 (0 Errors).

### 🚀 [v2.8.6] Layer 5: Ekispert API MCP 서버 실시간 연동 및 2-Tier 클라우드 배포 파이프라인 구축
**Date:** 2026-10-08
* **[Sponsor API/MCP] 株式会社ヴァル研究所(Val Lab) 駅すぱあと(Ekispert) API 라이브 연동**:
  - `backend/tools/ekispert_mcp.py` 신규 구현: 제공된 API 키(`TpVHj3qTS9Hft63Q`)를 활용하여 일본 철도/대중교통 실시간 경로 탐색(`/search/course/extreme`) 및 역 정보 검색(`/station`) 연동 완료.
  - **Layer 5 물리적 마이크로 모빌리티 처방(`generate_healing_walk_prescription`)**: 3일 연속 야근/번아웃 감지 시, 신주쿠역 최단 지하철 환승 대신 신주쿠교엔 외곽 녹지를 거치는 '15분 힐링 도보 환승 산책로'를 자동 계산. 야식비 3만 원 및 1,200kcal 축적을 물리적으로 차단하는 실시간 처방 카드 발행.
  - **Model Context Protocol (MCP) 표준 인터페이스 구현**: `MCP_TOOLS_MANIFEST` 및 `handle_mcp_call` 디스패처를 구축하여 AI 에이전트 도구 호출 규격 준수.
  - **백엔드 메인 파이프라인 통합 (`main.py`)**: `/api/ekispert/manifest`, `/api/ekispert/call`, `/api/ekispert/prescription` REST API 엔드포인트 신설 및 메인 심의(`analyze`, `analyze_stream`) 파이프라인에 `ekispert_prescription` 자동 주입.
* **[Frontend/UI] EkispertActionCard 대시보드 렌더링 통합**:
  - `frontend/src/app/[locale]/page.tsx`: 최고 중재관 판결문 하단에 `EkispertActionCard`를 배치하여 실시간 스트리밍 도착 시 힐링 도보 환승 타임라인 및 절약 지표를 직관적으로 시각화.
  - `npx tsc --noEmit` 무결성 검증 완료.
* **[Cloud Deployment] Next.js 프론트엔드 Cloud Run & Firebase App Hosting 설정 파일 및 가이드 구축**:
  - `frontend/Dockerfile`: Next.js 15 Standalone 경량 컨테이너 이미지 빌드 구성.
  - `frontend/apphosting.yaml`: Google Cloud 공식 권장 Firebase App Hosting 자동 배포 명세서 작성.
  - `docs/deployment_guide_cloud_run_firebase.md`: Cloud Run(백엔드) + Firebase App Hosting(프론트엔드) 2-Tier 서버리스 배포 완벽 가이드 문서 발행.

### 🚀 [v2.8.5] 해커톤 제출 요건 준수 명세화 및 서버 재기동
**Date:** 2026-10-08
* **[Documentation] 아키텍처 블루프린트 해커톤 요건 동기화 (`docs/chronoslife_architecture_blueprint.md`)**:
  - `Phase 6: 배포 및 심사 준비` 챕터를 `Phase 6: 해커톤 규정 완벽 준수 및 배포`로 고도화하여 대회 공식 심사 규정 충족 사실을 명시.
  - **백엔드**: FastAPI의 Cloud Run 배포 명시 (GCP 컴퓨팅 필수 환경 요건 충족).
  - **프론트엔드**: Next.js의 Firebase App Hosting 배포 명시 (Live Web URL 및 Firebase 사용 특전 요건 충족).
  - **계정 정책**: 기업망 차단 방지를 위한 개인 Gmail 기반 GCP 프로젝트($300 크레딧) 배포 프로세스 반영.
* **[System] 런타임 환경 무결성 검증 및 재가동**:
  - 시스템 재부팅으로 인해 중단되었던 FastAPI 백엔드(포트 8080)와 Next.js 프론트엔드(포트 3000) 데몬 백그라운드 태스크 재기동 완료.
  - `frontend/src/components/InteractiveInputConsole.tsx` 내부 배열 닫힘 괄호(`]`) 누락 문법 오류 핫픽스 검증 및 `npx tsc --noEmit` 무결성 테스트 통과 확인.
  - 전면 다국어(i18n) 적용 이후 발견된 잔여 하드코딩 텍스트(예: "1일부터 30년까지", "가족 유대감 및 저녁 일상 사수" 등) 완전 제거 검증 완료.

### 🚀 [v2.8.4] Layer 0 Privacy Sandbox: Gemini 맥락 정제 ➔ Google Cloud DLP 2단계 직렬 연계 파이프라인 구축
**Date:** 2026-10-08
* **[Architecture/DLP] Gemini 1차 맥락 마스킹 ➔ Google Cloud DLP 2차 엔터프라이즈 비식별화 직렬 체인**:
  - `privacy_guard.py`: 단독 대체가 아닌, **Gemini가 1차 마스킹한 텍스트를 Google Cloud DLP API(`deidentify_content`)에 직접 전달하는 직렬 파이프라인**으로 재설계.
  - **1단계 (Gemini AI)**: 비정형 다국어 맥락(한국어/일본어 가족 호칭, 성명, 비정형 은행명, 보너스 금액, 쇼핑몰, 역명)을 지능적으로 감지하여 1차 가상 토큰화(`[PERSON_NAME]`, `[CONFIDENTIAL_BONUS]`, `[FINANCIAL_INSTITUTION]` 등).
  - **2단계 (Google Cloud DLP)**: Gemini가 정제한 텍스트를 인계받아 공식 엔터프라이즈 규제 표준 InfoType(`CREDIT_CARD_NUMBER`, `EMAIL_ADDRESS`, `PHONE_NUMBER`, `FINANCIAL_ACCOUNT_NUMBER`, `PASSPORT`, `US_SOCIAL_SECURITY_NUMBER` 등)을 최종 심층 검사 및 비식별화.
  - **감사 추적(Audit Trail)**: 파이프라인 단계별 메타데이터(`stage 1: Gemini output`, `stage 2: Cloud DLP action & status`)를 투명하게 통합 반환.
  - **GCP 연동 안정성**: `DlpServiceClient`에 `ClientOptions(quota_project_id=self.project_id)`를 주입하여 ADC Quota Project 문제를 선제 해결하고, 미활성화 시 안전망 엔진으로 무중단 폴백 지원.

### 🚀 [v2.8.3] Privacy Sandbox LLM 기반 PII 검출 전환 (정규식 의존 탈피)
**Date:** 2026-10-06
* **[Security/DLP] Gemini 기반 언어 무관 PII 검출 + 코드 치환 파이프라인**:
  - `privacy_guard.py`: `_sanitize_llm()` 신설. Gemini(`temperature=0`, JSON 출력)가 원문에서 PII *조각(exact substring)과 유형*만 반환하고, 실제 치환은 코드가 수행하여 LLM이 문장을 재작성/환각하지 않도록 설계.
  - 안전장치: ① 반환 조각이 원문에 실재할 때만 채택(환각·프롬프트 인젝션 방어) ② 긴 조각 우선 치환 ③ 기존 정규식을 **안전망**으로 후단 적용 ④ 구매 금액은 마스킹하지 않고 급여/보너스 금액만 `[CONFIDENTIAL_BONUS: …]`로 표기(재정 분석 보존).
  - 폴백 체계: LLM 실패 시 기존 Cloud DLP+정규식 → 정규식 순으로 자동 폴백. 결과 `method` 필드(`gemini_llm(<model>)+regex_safety_net` / `cloud_dlp+regex` / `regex`)로 실제 사용 경로를 투명하게 기록.
  - 설정: `DLP_MODE=llm|rules`(기본 `llm`), `DLP_LLM_MODELS`(쉼표 구분 모델 우선순위).
  - 검증: 정규식이 놓치던 `田中美咲`, `楽天銀行`, `Maria Gonzalez`, `박도윤`, 상세 주소, 전화번호(기존 계좌번호로 오분류)를 모두 정확히 분류·마스킹.

### 🚀 [v2.8.2] 다국어(JA/EN/KO) DLP 개인정보 마스킹 강화 및 에이전트 다국어 생성 무결성 확보
**Date:** 2026-10-06
* **[Security/DLP] 프라이버시 샌드박스 다국어 심층 방어(Defense-in-Depth) 및 엔티티 정규식 고도화**:
  - `privacy_guard.py`: 일본어/영어 가족 호칭(`妻のスジン`, `wife Sujin`), 다국어 금융기관(`新韓銀行`, `みずほ`, `三菱UFJ`, `Chase`), 다국어 성과급/보너스(`ボーナス300万ウォン`, `bonus`), 이커머스(`クーパン`, `Coupang`, `アマゾン`), 주요 역명(`新宿駅`, `Shinjuku`) 정규식 필터 확장.
  - 일본어/한국어 조사(`と`, `に`, `が`, `は`, `を`, `과/와`) 및 호칭(`さん`, `様`, `님`) 전방탐색(lookahead)을 적용하여 성명 토큰만 정밀 마스킹 (`妻 [PERSON_NAME]` + `と一緒に`).
  - Google Cloud DLP API와 도메인 룰 엔진을 결합한 하이브리드 심층 방어 체계 구축 (엔티티 누락 없는 100% PII 마스킹 보장).
* **[Backend/LLM] 에이전트 시스템 프롬프트 100% 네이티브 현지화 및 언어 혼입(Drift) 원천 차단**:
  - `chief_governor.py`: 일본어/영어/한국어 전용 헌법 조항(`CONSTITUTION_TENETS_JA`, `_EN`, `_KO`) 및 프롬프트 템플릿 전면 분리. 일본어 요청 시 판결(`条件付き修正`), 위반 조항(`第2条`), 판결 이유, 파레토 카운터오퍼를 자연스러운 원어민 수준 일본어로 일체 생성.
  - `orchestrator.py`: 인텐트 라벨(`💳 衝動的な支出・買い物`), 금액 요약, 에이전트 하달 지침을 원어민 수준 일문/영문으로 전면 현지화.
  - `subagents` (`finance_agent.py`, `career_agent.py`, `wellbeing_agent.py`): 시스템 프롬프트 본문을 요청 언어(JA/EN/KO)로 100% 네이티브 분기하여 한국어 혼입 원천 제거.
  - `comic_engine.py`: 5컷 스토리텔링 프롬프트에 로케일별 스케일(`10⁰ (1日)` ~ `10⁴ (30年)`) 및 시계열 지평(`今夜` ~ `約30年後`) 지침을 엄격 주입.
* **[Frontend/UI] 웹툰 뷰어 및 중재 콘솔 다국어 렌더링 무결성 개선**:
  - `Log10ComicStripViewer.tsx`: 5컷 스트립 상단 배지 및 모달 확대 팝업의 스케일(`getScaleLabel`), 시간대(`getTimeframe`)를 `useLocale` 및 사전 맵과 연동하여 한국어 잔여 문자열 완전 해소.
  - `ArbitrationConsole.tsx`: 일본어 판결 스탠스(`'承認'`, `'条件付き修正'`, `'条件付き'`, `'棄却'`) 뱃지 색상, 텍스트 및 아이콘 렌더링 동기화.
  - `Log10Visualizer.tsx`: `TIER_INFO.map(t => ...)`가 번역 함수 `t`를 가려(shadowing) 런타임 오류를 유발하던 문제를 `tierInfo`로 변수명 변경하여 해결. `Header.tsx`: `latency`가 `null`일 때의 타입 오류 수정. `npx tsc --noEmit` 통과 확인.

### 🚀 [v2.8.1] 5대 목표(Goals) 및 초기 시뮬레이션 프롬프트 전면 다국어화 (KO/EN/JA)
**Date:** 2026-10-06
* **[Backend/API] 5대 인생 목표(Goals) & 라이프 바이탈(Life State) 다국어 동기화**:
  - `goal_manager.py`: `DEFAULT_GOALS_KO`, `DEFAULT_GOALS_EN`, `DEFAULT_GOALS_JA` 3개 국어 데이터셋 구축 및 `get_goals(locale)` 지원.
  - `main.py`: `/api/goals?locale=...` 및 `/api/state/current?locale=...` 쿼리 파라미터 연동.
  - `state_engine.py`: 최근 7일간 누적 분석 요약문(`context_summary_for_council`) 3개 국어 템플릿화.
* **[Frontend/UI] 헌법 스튜디오 및 오케스트레이션 콘솔 잔여 한국어 문자열 완전 해소**:
  - `GoalConstitutionStudio.tsx`: `INITIAL_PROMPTS_MAP`, `VOICE_SIMULATION_CHIPS_MAP`, `WELCOME_MESSAGES_MAP`을 구축하여 선택 언어(`locale`)에 따라 음성 칩, 추천 프롬프트, 환영 인사가 완벽히 전환되도록 개편.
  - `InteractiveInputConsole.tsx`: 상단 오케스트레이션 콘솔 제목, 설명, 모델 동기화 배지, 초기화 버튼을 `t(...)` 다국어 사전과 연동.
  - `LifeVitalRadar.tsx`: 언어 변경 시 `/api/state/current?locale=...` 재호출 연동.

### 🚀 [v2.8.0] 전 계층 다국어(i18n) 지원 체계 구축 (한국어 · 영어 · 일본어 E2E 지원)
**Date:** 2026-10-06
* **[Architecture/i18n] Next.js App Router 기반 다국어 라우팅 및 상태 관리 (`next-intl`)**:
  - `next-intl` 라이브러리를 도입하여 `src/middleware.ts`와 `src/i18n.ts`를 신설하고 언어 감지 및 `/[locale]` 동적 라우팅 구축.
  - `src/app/page.tsx` 및 `layout.tsx`를 `src/app/[locale]/` 하위로 마이그레이션하고 `NextIntlClientProvider` 적용.
  - `useLocale()` 훅을 통해 현재 선택된 언어 코드(`ko`, `en`, `ja`)를 백엔드 스트리밍 API(`/api/analyze/stream`) 호출 시 동적으로 전달.
* **[Backend/LLM] 멀티 에이전트 다국어 다이내믹 프롬프트 주입 및 API 스키마 확장**:
  - `main.py`: `AnalyzeRequest`, `GoalChatRequest`, `GoalLiveVoiceRequest` 모델에 `locale: Optional[str] = "ko"` 파라미터 추가.
  - `ContextOrchestrator`, `DomainCouncil`(및 3대 하위 에이전트 Finance/Career/Wellbeing), `ChiefGovernor`, `ComicEngine`의 시스템 프롬프트에 `[IMPORTANT LANGUAGE INSTRUCTION]` 영역 신설. JSON 키 구조를 영어로 유지하면서 이유, 설명, 만화 대사 등 모든 값(Value)을 사용자가 요청한 언어로 생성하도록 강제.
  - `GoalManager`: `evaluate_action_impact` 내부의 5대 영역("재정", "커리어", "건강", "가족", "개인 취미") 명칭 및 평가 사유(Reason)에 대한 3개 국어(KO/EN/JA) 다국어 매핑 로직 추가.
  - `composite_trajectory` 내 3중 궤적(As-Is, Governed) 서사 요약문 영문/일문 템플릿 신설.
* **[Frontend/UI] 전면 14개 UI 컴포넌트 하드코딩 텍스트 추출 및 사전 통합**:
  - `Header.tsx`, `InteractiveInputConsole.tsx`, `page.tsx`를 비롯하여 전체 11개 주요 컴포넌트(`GoalConstitutionStudio`, `ArbitrationConsole`, `Log10Visualizer`, `Log10ComicStripViewer`, `OrchestratorTraceViewer`, `GoalImpactMatrix`, `DlpComparisonViewer`, `ProgressivePipelineTracker`, `DeliberationHistoryTracker`, `DevLogInspector`, `LifeVitalRadar`)에 `useTranslations` 적용.
  - 컴포넌트 단위 번역 딕셔너리(`src/messages/components/*`) 생성 후 파이썬 병합 스크립트(`merge_translations.py`)를 통해 `src/messages/ko.json`, `en.json`, `ja.json`으로 완전 통합 완료.

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
