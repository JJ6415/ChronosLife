# [공동 2위] ChronosLife 최신 아키텍처 및 상세 구현 청사진
## 로그 등간격(Log-10) 5단계 계층 시계열 인생 거버넌스 및 자율 라이프가드 에이전트

---

## 1. Executive Summary

* **프로젝트명**: ChronosLife (Log-10 Hierarchical Temporal LifeOS)
* **대회 테마 부합도**: **완벽 부합 (100%)**
  * 사내/개인 민감정보 보호 거버넌스 (Google Cloud Sensitive Data Protection / Cloud DLP - Ingress Perimeter)
  * 인라인 AI 영합(Sycophancy) 및 탈선 차단 (Google Cloud Model Armor & L4 인생 헌법 RAG)
  * 런타임 자율 제어 루프 및 멀티 에이전트 가치 상충 중재 (Gemini 3.5 Flash / Flash Lite Multi-Model Resilience + Chief Governor)
  * 인그레스 개인정보 보호 샌드박스(Layer 0) 및 상위 컨텍스트 오케스트레이터(Layer 1)를 통한 발화 의도 분해 및 투명 감사 로그(Audit Trace) 제공
  * 5단계 시계열 지평($10^0 \to 10^4$일)에 걸친 5대 인생 목표 3중 궤적 선그래프(Temporal Trajectory Visualizer: 기준선/원안/중재안) 실시간 투영
* **핵심 미션**: 
  $10^0\text{일}(1\text{일})$의 미세 충동 행동부터 $10^4\text{일}(\approx 30\text{년})$의 궁극적 인생 헌법까지, 인접 계층 간 $10\times$ 배율의 **로그 등간격 5단계 계층 메모리(Log-10 HTM)**를 통해 시계열 인과 단절(Vanishing Causality) 문제를 수학적으로 해결하고, 삶의 유한 자원(시간·체력·자본)을 둘러싼 재정·커리어·가족·건강·**개인 취미(Hobby)** 영역 간의 제로섬 갈등을 자율 중재하는 전인적 라이프 거버넌스 시스템.

---

## 2. Log-10 5단계 계층 시간 모델 (Log-10 Hierarchical Temporal Architecture)

ChronosLife는 인간의 인지적 할인율(Hyperbolic Discounting)과 제어공학의 다중 주기 제어 이론(Multi-Rate Control Theory)에 기반하여, 전체 시간 축을 $10^k\text{일} \ (k \in \{0, 1, 2, 3, 4\})$의 로그 등간격 5개 티어로 엄격히 모듈화합니다.

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               Log-10 5-Tier Hierarchical Framework                                │
├───────┬──────────────────────┬─────────────┬──────────────────────────┬───────────────────────────┤
│ Tier  │ 시간 스케일          │ 통칭        │ 핵심 거버넌스 미션        │ 제어 주기 및 모델 레이턴시 │
├───────┼──────────────────────┼─────────────┼──────────────────────────┼───────────────────────────┤
│ $L_4$ │ $10^4$일 (~30년)     │ Life Vision │ 은퇴·평생자산·인생 헌법  │ 연 1회 갱신 (추론 지연 무관)│
│ $L_3$ │ $10^3$일 (~3년)      │ Strategic   │ 커리어 점프·시드머니 OKR │ 분기/연간 갱신 (심층 추론) │
│ $L_2$ │ $10^2$일 (~100일)    │ Tactical    │ 분기 마일스톤·습관 안착  │ 월/격주 갱신 (배치 시뮬)   │
│ $L_1$ │ $10^1$일 (~10일)     │ Sprint      │ 단기 스프린트·지출 회고  │ 10일 주기 회고 (경량 추론) │
│ $L_0$ │ $10^0$일 (1일/실시간)│ Execution   │ 충동 방어·일일 루틴 실행 │ 실시간 밀리초~초 단위 인라인│
└───────┴──────────────────────┴─────────────┴──────────────────────────┴───────────────────────────┘
```

---

## 3. 엔드투엔드 시스템 6계층 아키텍처 (Detailed Layered Architecture)

```
 [사용자 엔드포인트: Next.js 대시보드 / 1:1 인생 헌법 설계 스튜디오 / 웹훅]
                                     │ (Raw User Prompt)
                                     ▼
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │ Layer 0: Privacy Sandbox & Ingress Perimeter                                 │
 │  (Google Cloud Sensitive Data Protection / Cloud DLP)                        │
 │  - 사용자 입력 인그레스 최전선에서 원본 텍스트 직접 수신                     │
 │  - 양방향 결정론적 가상 토큰화 (Deterministic De-identification)              │
 │  - 금융 정보(계좌, 급여), 가족 실명, 질병 진단 기록 프롬프트 원천 마스킹       │
 │  - Salt 기반 Secure Token Vault 관리 (외부 LLM 유출 절대 차단)              │
 └───────────────────────────────────┬──────────────────────────────────────────┘
                                     │ (Sanitized Context)
                                     ▼
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │ Layer 1: Context Orchestrator & Transparency Audit Trace (Gemini 3.5/Lite)   │
 │  - 비식별 프롬프트 수신 후 안전하게 발화 의도 분해: 지출 vs 인플로우 vs 스트레스 │
 │  - 전문 에이전트 특화 프롬프트 동적 생성 & 하달 (Finance, Career, Wellbeing) │
 │  - 투명 감사 로그(Audit Trace): 하달된 프롬프트 원문 백로그 실시간 시각화   │
 │  - Multi-Model Resilience: 503/429 발생 시 Flash Lite 즉시 폴백 체인 탑재   │
 └───────────────────────────────────┬──────────────────────────────────────────┘
                                     │ (Orchestrated Directives & Intent Context)
                                     ▼
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │ Layer 2: Multi-Agent Domain Council (Gemini Multi-Model Fallback)            │
 │  ┌───────────────────────┬──────────────────────┬─────────────────────────┐  │
 │  │ 1. Finance Agent      │ 2. Career Agent      │ 3. Well-being Agent     │  │
 │  │ - 복리 자산 축적 시뮬 │ - 직무 스킬/연봉 로드│ - 생체 리듬/수면 부채   │  │
 │  │ - 가처분 예산 한도 통제│ - 번아웃 임계점 감시 │ - 가족 시간 & 취미 쿼터 │  │
 │  └───────────┬───────────┴──────────┬───────────┴────────────┬────────────┘  │
 └──────────────┼──────────────────────┼────────────────────────┼───────────────┘
                └──────────────────────┼────────────────────────┘
                                       ▼ (도메인별 분석 의견 및 상충 보고서)
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │ Layer 3: Chief Governor & Constitution Engine (Gemini Chief Governor)        │
 │  - $L_4$ 인생 헌법(제1조~제5조) RAG 대조 및 파레토 최적화 상충 중재          │
 │  - Anti-Sycophancy Guardrail (비현실적 자기기만 차단 및 카운터오퍼 제시)      │
 │  - 상충 감지 및 중재 완료 상태 투명 리포팅                                  │
 └───────────────────────────────────┬──────────────────────────────────────────┘
                                     │ (중재된 제어 명령 및 인과 전파)
                                     ▼
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │ Layer 4: Log-10 Temporal Forecasting & 5-Horizon Multi-Line Trajectory       │
 │  - Upward Perturbation Propagation: $L_0 \to L_1 \to L_2 \to L_3 \to L_4$    │
 │  - 5대 인생 목표 5단계 시계열 3중 궤적 선그래프 (Baseline 점선 vs Projected 실선 vs Arbitrated 수렴선)│
 │  - 이동 폭(Delta) 및 자원 확장(+)/잠식(-) 면적 셰이딩 시각화                │
 └───────────────────────────────────┬──────────────────────────────────────────┘
                                     │ (구체적 일일 행동 트리거)
                                     ▼
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │ Layer 5: Micro Action & Physical Mobility Layer (Cloud Run + Ekispert MCP)   │
 │  - 스폰서 연동: Ekispert API MCP 서버를 통한 일상 멘탈 웰빙 이동 경로 산출   │
 │  - $L_0$ 단위 인라인 푸시: 과소비 즉시 차단, 야근 시 강제 환승 산책로 처방 │
 └──────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. 레이어별 상세 컴포넌트 명세

### Layer 0: Privacy Sandbox & Data Hygiene (Ingress Perimeter)
* **엔진**: Google Cloud Sensitive Data Protection (DLP API v2)
* **목적**: 네트워크 인그레스 최전선에서 사용자 원본 프롬프트를 직접 수신하여, 초민감 개인정보(PII, 금융 자산, 질병 이력)가 LLM 외부 추론으로 전달되는 것을 원천 봉쇄.
* **동작 프로토콜**:
  1. **실시간 감지 (Inspection)**:
     * `FINANCIAL_ACCOUNT_NUMBER`, `CREDIT_CARD_NUMBER`
     * `PERSON_NAME` (가족, 배우자, 자녀 실명)
     * Custom InfoType: `KR_SALARY_AMOUNT` (급여 및 보너스), `MEDICAL_DIAGNOSIS` (건강검진 질환명)
  2. **결정론적 가상 치환 (Deterministic Tokenization)**:
     * "신한은행 110-333" $\to$ `[TOKEN_BANK_ACCOUNT_A]`
     * "아내 이수진" $\to$ `[TOKEN_SPOUSE]`
     * "대장내시경 용종 제거 25만 원" $\to$ `[MEDICAL_EXPENSE: 250,000 KRW]`
  3. **수치 맥락 보존**:
     * 연산에 필요한 순수 수치(지출액, 금리)는 남기되, 고유 식별 명칭만 익명 토큰으로 치환하여 계산의 정확성과 개인정보 보호를 동시 달성.
  4. **인그레스 안전 격리**:
     * 상위 LLM 오케스트레이터 및 하위 위원회가 호출되기 전 완전한 비식별화 보장.

---

### Layer 1: Context Orchestrator & Transparency Audit Trace
* **엔진**: Google Gemini Multi-Model Engine (`gemini-3.5-flash`, `gemini-flash-lite-latest` Fallback Chain)
* **목적**: Layer 0에서 비식별화된 안전한 프롬프트를 수신하여 사용자의 발화 본질(실제 재정 지출 vs 연봉 인상 오퍼 vs 연속 야근 스트레스 vs 취미 활동)을 정밀 규명하고, 각 하위 전문 도메인 에이전트에게 맞춤형 심의 프롬프트를 동적 하달하며, 모든 하달 내역을 투명 감사 백로그(Audit Trace)로 공개.
* **핵심 기능**:
  1. **인텐트 분해 & 지출 성격 규명 (Intent Dissection)**:
     * '연봉 3,500만 원 인상 스타트업 이직 제안' 발화 시, 3,500만 원을 '소비 지출(Outflow)'로 오인하여 복리 기회비용을 왜곡 적용하는 치명적 오류를 방지.
     * `is_financial_expense: false` 및 `INFLOW`로 판정하여 역전파 지출 계산을 차단하고, 미래 소득 증대 및 근무시간(주 70시간)과 웰빙 가치 간의 상충 중재 컨텍스트로 라우팅.
  2. **특화 심의 지침 프롬프트 동적 생성 (Dynamic Prompt Dispatching)**:
     * Finance: 3년 시드머니 1억 형성 및 세후 저축률 검증 지침 하달.
     * Career: 초기 스타트업 고강도 몰입의 시장 가치 상승과 번아웃 위험도 비교 지침 하달.
     * Wellbeing: 주 70시간 근무에 따른 수면 7시간 및 취미 쿼터 박탈 위험 경고 지침 하달.
     * Chief Governor: L4 헌법 제1조·제3조 위배 여부 및 주 52시간 캡 카운터오퍼 도출 지침 하달.
  3. **투명 감사 백로그 (Audit Trace UI)**:
     * 상위 오케스트레이터의 사고 과정(Reasoning), 식별된 인텐트, 각 에이전트에 실시간 주입된 프롬프트 원문을 대시보드 상단 아코디언 카드에서 투명하게 공개 (복사 기능 제공).
  4. **Multi-Model Resilience & UI Selector**:
     * 특정 모델의 일시적 503(Service Unavailable) 또는 429(Quota) 발생 시, `preferred_model` $\to$ `gemini-3.5-flash` $\to$ `gemini-flash-latest` $\to$ `gemini-flash-lite-latest` $\to$ `gemini-3.5-flash-lite` 순으로 무중단 자동 폴백.
     * 프론트엔드 대화 콘솔 상단에 Gemini 모델 셀렉터 드롭다운을 제공하여 사용자가 원하는 모델을 직접 선택 가능.

---

### Layer 2: Multi-Agent Domain Council (전문 영역별 서브 에이전트)

각 에이전트는 독립된 페르소나와 최적화 함수(Objective Function)를 갖는 **Gemini 3.8 Flash** 인스턴스로 병렬 구동됩니다.

```
┌───────────────────────────────────────────────────────────────────────────┐
│                    Domain Sub-Agent Specifications                        │
├────────────────────┬─────────────────────────┬────────────────────────────┤
│ 서브 에이전트       │ 최적화 목적 함수 (Objective)│ 핵심 제약 조건 (Constraints) │
├────────────────────┼─────────────────────────┼────────────────────────────┤
│ 1. Finance Agent   │ 30년 복리 순자산 극대화   │ $L_1$ 가처분 예산 한도 준수,│
│                    │ 및 비상 자금 안정성     │ 고위험 레버리지 차단       │
├────────────────────┼─────────────────────────┼────────────────────────────┤
│ 2. Career Agent    │ 시장 연봉 및 전문성      │ 주당 최대 노동 시간 상한,  │
│                    │ 성장 속도 극대화        │ 번아웃 지수 $\le 0.70$     │
├────────────────────┼─────────────────────────┼────────────────────────────┤
│ 3. Well-being      │ 생체 항상성 유지, 가족  │ 주당 가족 식사 $\ge 3$회,   │
│    (Family, Health,│ 유대감 및 개인 취미     │ 일일 수면 $\ge 7$시간,     │
│     Hobby) Agent   │ 몰입 시간 극대화        │ 주당 개인 취미 $\ge 4$시간 │
└────────────────────┴─────────────────────────┴────────────────────────────┘
```

1. **Finance Agent (재정 분석관)**:
   * 입력: 카드 승인 내역, 월 고정비, 투자 포트폴리오, $L_2$ 저축 목표.
   * 로직: 일일 복리 이율 $r = \frac{\text{연이율}}{365}$을 적용하여 $L_0$ 지출이 $L_3$(3년 시드머니) 및 $L_4$(은퇴 자산)에 미치는 기회비용을 상시 계산.
2. **Career Agent (커리어 분석관)**:
   * 입력: 캘린더 근무 시간, 업무 커뮤니케이션 로그, 직무 역량 마일스톤.
   * 로직: 누적 근무 시간이 임계치를 초과할 경우 "지속 불가능한 번아웃 모드"로 판정하고, 추가 업무 및 야근 제안에 즉시 거부권(Veto) 행사.
3. **Well-being Agent (가족·건강·취미 수호관)**:
   * 입력: 스마트워치 수면 데이터, 심박변이도(HRV), 주말 가족 일정, 개인 취미(악기, 운동, 창작, 독서) 시간 로그.
   * 로직: 수면 부채(Sleep Debt), 가족 결합 시간, **개인 취미 몰입 쿼터(주당 최소 4시간)**를 동시 감시하며, 취미가 장기 박탈될 경우 번아웃 위험 경보를 발령하고 커리어/재정 요구를 제어.

---

### Layer 3: Chief Governor & Constitution Engine (최고 거버넌스 중재관)
* **엔진**: **Gemini 3.1 Pro** (복합 추론 및 다자간 가치 상충 중재 두뇌)
* **주요 기능**:
  1. **인생 헌법(Immutable Constitution) RAG 대조**:
     * 사용자가 사전에 정의한 절대적 핵심 가치(예: "제1조: 어떤 금전적 이익도 가족과의 기본 식사 시간과 주말 취미 몰입을 영구히 침해할 수 없다")를 벡터 스토어에서 인출하여 최고 판례로 삼음.
  2. **파레토 최적화 중재 (Pareto Arbitration)**:
     * Finance와 Career가 찬성하더라도 Well-being이 결사 반대하는 안건(예: "주 75시간 근무 및 주말 출근 조건의 연봉 3천만 원 인상 이직")에 대해, 맹목적 승인이 아닌 **"100일($L_2$) 유예기간 부여 및 주 52시간 상한, 주 1회 취미 블록 사수 조건부 카운터오퍼 제시"**라는 고차원적 타협안 도출.
  3. **Anti-Sycophancy Guardrail (AI 영합 및 망상 차단)**:
     * 사용자가 "이번 달만 적금 깨서 300만 원짜리 취미 장비 사고 다음 달에 아끼겠다"는 자기기만적 프롬프트를 입력할 경우, Model Armor와 Gemini 3.1 Pro가 이를 즉시 감지하여 차가운 통계와 과거 실패 로그를 제시하며 안건 반려.

---

### Layer 4: Log-10 Temporal Forecasting & 5-Horizon Multi-Line Trajectory

$10^0$일부터 $10^4$일까지의 데이터를 안정적으로 순환시키는 양방향 전파 메커니즘이자, 5대 인생 목표에 미치는 시계열 궤적을 직관적 선그래프로 투영하는 시각화 엔진입니다.

```
       [Top-down: 불변 헌법 제약 조건 투영 (Constraint Projection)]
       $L_4$ (30년 헌법) ──▶ $L_3$ (3년 전략) ──▶ $L_2$ (100일 목표) ──▶ $L_1$ (10일 스프린트) ──▶ $L_0$ (오늘의 예산/행동)
         ▲                     ▲                    ▲                    ▲                     │
         │                     │                    │                    │                     ▼
       $L_4$ (은퇴 지연/가속) ◀── $L_3$ (시드머니 손실/달성) ◀── $L_2$ (분기 습관) ◀── $L_1$ (완충재 소진) ◀── $L_0$ (마이크로 일탈 발생)
       [Bottom-up: 로그 등간격 점진적 인과 역전파 (Upward Perturbation Cascade)]
```

#### 5대 인생 목표 5단계 시계열 3중 궤적 선그래프 (Temporal Trajectory Line Visualizer) & 라이프 바이탈 레이더
단순한 1차원 정적 점수 매트릭스를 탈피하여, 사용자의 의사결정이 5단계 시간 지평에 걸쳐 미치는 궤적의 이동을 다차원 3중 선그래프로 시각화합니다:
1. **3중 궤적 곡선 (Tri-Line Trajectory: Baseline vs Projected vs Arbitrated)**:
   * **기준선 (Baseline Curve)**: 현재 상태를 평온하게 유지할 때의 정상 궤적 (Cyan/Slate 대시 점선).
   * **원안 강행선 (Projected As-Is Curve)**: 이번 안건을 무지성 강행했을 때 5단계 기간에 걸쳐 선이 급변하는 위험/편향 궤적 (로즈 레드/앰버 발광 실선).
   * **중재 타협선 (Arbitrated Governed Curve)**: 최고 중재관의 헌법 가드레일 및 파레토 카운터오퍼를 수용했을 때 건강·가족·재정이 최적 균형을 회복하는 궤적 (에메랄드 그린/인디고 수렴 실선).
2. **이동 면적 셰이딩 (Dynamic Gap Area Shading)**:
   * 기준선과 예상선 사이의 간격에 영역 채움(Area fill)을 적용하여, **자원 확장(+)일 때는 에메랄드 그린 반투명 그라데이션**, **자원 잠식(-)일 때는 로즈 레드 반투명 그라데이션**으로 직관적 위험/기회 체감.
3. **인터랙티브 도메인 전환 탭**:
   * `[✨ 종합 라이프 밸런스 지수]`, `[💰 재정: 30년 복리 자산]`, `[📈 커리어: 시장 가치 & 전문성]`, `[🏃 건강: 생체 항상성 & 수면]`, `[👨‍👩‍👧 가족: 헌법 제1조 식사 & 유대]`, `[🎨 취미: 주 4시간 쿼터]` 탭을 통해 클릭 한 번으로 각 영역별 궤적을 실시간 스위칭.
4. **5단계 시간 지평별 인과 서사 카드 (5-Horizon Breakdown)**:
   * $L_0$(1일 즉각), $L_1$(10일 단기 완충), $L_2$(100일 분기 습관), $L_3$(3년 중기 마일스톤), $L_4$(30년 인생 헌법)의 5개 기간별 카드에 원안 vs 중재안의 구체적 비교 인과 서사와 수치를 병렬 제시.
5. **상단 실시간 라이프 바이탈 레이더 (Life Vital Radar)**:
   * 로그 등간격 시계열 그래프와의 스케일 왜곡 혼선을 방지하기 위해, 과거 7일간의 히스토리컬 일일 지출 및 야근 추세를 대화 입력 콘솔 상단 전용 레이더 배너로 독립 분리 배치.

---

### 부가 모듈: 1:1 대화형 인생 헌법 & 5대 목표 관리 스튜디오 (Constitution Studio)
* **엔진**: Gemini 3.5 Flash / Flash Lite Multi-Turn Conversation Architect
* **역할**: 사용자와 1:1 대화 인터뷰를 나누며 30년 인생 헌법 제1조~제5조와 5대 카테고리 목표(수치·규칙)를 실시간으로 맞춤 정립.
* **핵심 기능**:
  * 헌법 5개 조항 고유 넘버링 수호 (제1조: 가족/취미 불가침, 제2조: 충동 지출 완충, 제3조: 수면/건강 우선, 제4조: 30년 은퇴 자산 보호, 제5조: 100일 유예기간 검증).
  * 대화 히스토리(`history`) 기반의 멀티턴 맥락 유지 및 5대 목표 실시간 양방향 동기화.
  * 방금 나눈 대화 맥락에 꼬리를 무는 **AI 지능형 후속 추천 질문 3종(`suggested_next_prompts`)** 즉석 생성.

---

### Layer 5: Micro Action & Physical Mobility Layer (스폰서 기술 연동)
* **엔진**: Google Cloud Run + **스폰서: Ekispert API MCP 서버**
* **역할**: 추상적인 조언을 사용자의 물리적 행동 및 동선으로 완결 짓는 실행 레이어.
* **작동 시나리오**:
  * $L_0$ 캘린더 감시 중 사용자가 3일 연속 22시 이후 야근으로 극심한 스트레스 상태임을 감지.
  * 충동 배달음식 주문 확률이 $85\%$로 치솟는 시점에, **Ekispert API MCP 서버**를 호출하여 최단 지하철 환승 대신 **"중간 역에서 하차하여 공원을 15분간 가로지르는 힐링 도보 환승 경로"**를 자동 탐색하여 신체 회복을 물리적으로 유도.

---

## 5. 핵심 구현 코드 명세 (Python 3.11+ / Google GenAI SDK)

### 1) Privacy Sandbox: 양방향 결정론적 DLP 토크나이저 (`privacy_guard.py`)

```python
import os
from google.cloud import dlp_v2
from typing import Tuple, Dict

class ChronosPrivacySandbox:
    def __init__(self, project_id: str):
        self.client = dlp_v2.DlpServiceClient()
        self.parent = f"projects/{project_id}/locations/global"

    def sanitize_user_input(self, text: str) -> Tuple[str, bool]:
        """
        사용자의 가계부, 일기 속 PII 및 금융 계좌를 실시간 토큰화
        """
        inspect_config = {
            "info_types": [
                {"name": "PERSON_NAME"},
                {"name": "FINANCIAL_ACCOUNT_NUMBER"},
                {"name": "CREDIT_CARD_NUMBER"},
                {"name": "EMAIL_ADDRESS"},
            ],
            "min_likelihood": dlp_v2.Likelihood.LIKELY,
        }

        # 결정론적 가상 치환 (De-identification)
        deidentify_config = {
            "info_type_transformations": {
                "transformations": [{
                    "primitive_transformation": {
                        "replace_with_info_type_config": {}
                    }
                }]
            }
        }

        item = {"value": text}
        response = self.client.deidentify_content(
            request={
                "parent": self.parent,
                "deidentify_config": deidentify_config,
                "inspect_config": inspect_config,
                "item": item,
            }
        )

        sanitized_text = response.item.value
        has_pii = (sanitized_text != text)
        return sanitized_text, has_pii
```

### 2) Log-10 5단계 계층 인과 역전파 계산기 (`log10_engine.py`)

```python
import math
from dataclasses import dataclass
from typing import List, Dict, Any

@dataclass
class Log10CascadeResult:
    l0_daily: Dict[str, Any]
    l1_sprint: Dict[str, Any]
    l2_quarter: Dict[str, Any]
    l3_chapter: Dict[str, Any]
    l4_constitution: Dict[str, Any]
    summary_verdict: str

class Log10TemporalEngine:
    def __init__(self, daily_budget: float = 40000.0, annual_interest: float = 0.06):
        self.daily_budget = daily_budget
        self.daily_r = annual_interest / 365.0

    def compute_bottom_up_cascade(self, micro_deviation: float, remaining_years: int = 28) -> Log10CascadeResult:
        # L0 (10^0 days: 1일)
        l0_ratio = round((micro_deviation / self.daily_budget) * 100, 1)
        l0 = {
            "tier": "L0_10^0_Days",
            "overspend": micro_deviation,
            "budget_drain_pct": l0_ratio,
            "status": "CRITICAL" if l0_ratio > 100 else "WARNING"
        }

        # L1 (10^1 days: 10일 스프린트 완충)
        sprint_budget = self.daily_budget * 10
        sprint_absorb = micro_deviation / sprint_budget
        l1 = {
            "tier": "L1_10^1_Days",
            "sprint_budget_eaten_pct": round(sprint_absorb * 100, 1),
            "remedy_action": f"다음 3일간 일일 가처분 한도를 {int(micro_deviation / 3):,}원씩 자동 차감"
        }

        # L2 (10^2 days: 100일 분기 OKR)
        quarterly_reserve = 3000000.0
        l2_slippage = round((micro_deviation / quarterly_reserve) * 100, 2)
        l2 = {
            "tier": "L2_10^2_Days",
            "quarterly_goal_slippage_pct": l2_slippage,
            "warning": "분기 비상 적립금 목표에 균열 감지" if l2_slippage > 3.0 else "정상 흡수 가능"
        }

        # L3 (10^3 days: 1,000일 / 3년 전략 챕터)
        days_l3 = 1000
        l3_loss = micro_deviation * math.pow(1 + self.daily_r, days_l3)
        l3 = {
            "tier": "L3_10^3_Days",
            "future_seed_loss": round(l3_loss, 0),
            "milestone_impact": f"3년 차 시드머니 적립금 {int(l3_loss):,}원 감소 효과"
        }

        # L4 (10^4 days: 10,000일 / ~30년 은퇴 헌법)
        total_days = remaining_years * 365
        l4_compound_loss = micro_deviation * math.pow(1 + self.daily_r, total_days)
        daily_retire_cost = 75000.0
        delayed_days = round(l4_compound_loss / daily_retire_cost, 1)
        l4 = {
            "tier": "L4_10^4_Days",
            "terminal_loss_30yr": round(l4_compound_loss, 0),
            "delayed_retirement_days": delayed_days,
            "verdict": f"30년 복리 환산 기회손실 {int(l4_compound_loss):,}원 (은퇴 {delayed_days}일 지연)"
        }

        summary = (
            f"오늘의 {int(micro_deviation):,}원 충동 소비는 L1(10일 가처분)의 {l0_ratio}%를 태우고, "
            f"L3(3년 시드)에서 {int(l3_loss):,}원을 잠식하며, "
            f"최종 L4(30년 은퇴) 시점을 {delayed_days}일 지연시킵니다."
        )

        return Log10CascadeResult(l0, l1, l2, l3, l4, summary)
```

### 3) Chief Governor: 상충 중재 및 헌법 심의 엔진 (`chief_governor.py`)

```python
import os
from google import genai
from google.genai import types

client = genai.Client()

async def arbitrate_multi_agent_conflict(
    constitution_tenets: str,
    proposal_title: str,
    domain_evaluations: dict,
    cascade_summary: str
) -> str:
    prompt = f"""
    당신은 사용자의 Log-10 전인적 인생 최고 거버넌스 중재관(Chief Governor Agent, Gemini 3.1 Pro)입니다.

    [L4 인생 헌법 핵심 원칙 (불변의 법률)]
    {constitution_tenets}

    [상신된 의사결정 안건]
    안건명: {proposal_title}

    [Log-10 시계열 인과 영향 분석 ($L_0 \to L_4$)]
    {cascade_summary}

    [각 영역별 서브 에이전트 심의 의견 (Gemini 3.8 Flash)]
    1. Finance Agent: {domain_evaluations.get('finance')}
    2. Career Agent: {domain_evaluations.get('career')}
    3. Well-being (Family, Health & Hobby) Agent: {domain_evaluations.get('wellbeing')}

    [중재 및 판결 지침]
    1. AI 영합(Sycophancy) 금지: 사용자의 비현실적 야망이나 자기합리화에 동조하지 마십시오.
    2. 파레토 최적화: 단순히 기각하는 대신, $L_4$ 헌법을 수호하면서도 $L_2$(100일) 차원에서 실행 가능한 '조건부 수정 승인안'을 제시하십시오.
    3. 결과는 [최종 판결: 승인 / 조건부수정 / 기각], [위반 헌법 조항], [중재 권고안] 순으로 출력하십시오.
    """

    response = client.models.generate_content(
        model="gemini-3.1-pro",
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.15,
            max_output_tokens=1024
        )
    )
    return response.text
```

---

## 6. 핵심 라이프 거버넌스 UX 시나리오 3선 (User Experience Scenarios)

### 시나리오 1: [$L_0 \to L_1 \to L_4$] 야밤의 충동 지출 발생과 30년 복리 역전파의 인지적 충격
* **상황**: 금요일 밤 23시 40분, 업무 스트레스를 받은 30대 직장인 김철수 씨가 온라인 쇼핑몰에서 98,000원 상당의 한정판 기계식 키보드를 결제함.
* **사용자 경험 흐름**:
  1. 결제 승인 SMS 웹훅이 인입되는 즉시, **Layer 1(Cloud DLP)**이 카드번호와 계좌를 안전하게 비식별화.
  2. $0.3\text{초}$ 만에 ChronosLife 푸시 알림 도착:
     * **$L_0$(1일)**: 일일 가처분 잔여 한도(40,000원)의 $245\%$ 초과 소진.
     * **$L_1$(10일)**: 이번 주말 가처분 예산 전액 고갈 $\to$ *"내일부터 3일간 하루 외식비 32,600원씩 강제 차감 스케줄 적용"*.
     * **$L_4$(30년)**: 98,000원의 28년 연 $6\%$ 복리 기회비용은 **502,400원**. 김철수 씨의 목표 은퇴 시점이 **2.4일 지연**됨을 인터랙티브 그래프로 직관적 시각화.
  3. 사용자는 "고작 9만 원인데"라는 안일한 자기합리화 대신, 수십 년의 노후와 10일의 일상이 즉각 연결되는 충격적인 시각적 인과관계를 체감하고 구매 취소 버튼을 누르거나 3일간 절약 루틴을 수용.

### 시나리오 2: [$L_2 \to L_3$] 고연봉 스타트업 이직 제안과 Well-being(가족·건강·취미) 상충 중재
* **상황**: 사용자가 헤드헌터로부터 "연봉 3,500만 원 인상, 단 주 70시간 근무 및 주말 출근 빈번" 조건의 초기 스타트업 이직 오퍼를 받고, 앱에 *"연봉을 크게 올려서 3년 시드머니를 빨리 채우고 싶은데 이직할까?"*라고 문의함.
* **사용자 경험 흐름**:
  1. **Layer 2(서브 에이전트 위원회)** 즉시 소집:
     * **Finance Agent**: 찬성 (*"3년 내 순자산 1억 달성 속도를 11개월 단축시킴"*).
     * **Well-being Agent (Family/Health/Hobby)**: 결사 반대 (*"현재 심박변이도(HRV) 기준 체력 고갈 상태이며, 첫째 아이 유치원 입학 및 주말 밴드/러닝 취미 활동 전면 박탈로 삶의 지속가능성 붕괴 위험"*).
  2. 일반적인 상용 AI라면 사용자의 욕망에 영합(Sycophancy)하여 "멋진 기회네요, 도전하세요!"라고 하겠지만, **Gemini 3.1 Pro Chief Governor**가 개입하여 **[조건부 수정 승인 권고]**를 발행:
     > *"판결: 원안 기각. 타협 권고안 도출. $L_4$ 인생 헌법(가족 저녁 식사 주 3회 및 개인 취미 블록 주 4시간 보장)을 위배하므로 현 조건의 이직은 영구 불가합니다. 대신 연봉 인상폭을 2,000만 원으로 낮추되 주 52시간 상한 및 재택근무 주 2회를 보장받는 '카운터오퍼 협상 가이드'를 제시합니다. 또한 $L_2$(100일) 간의 건강 지표 회복을 선결 조건으로 명시합니다."*
  3. 사용자는 맹목적 야망으로 인한 번아웃과 일상의 소중한 취미·가족을 잃는 파탄을 사전에 차단하고, 삶의 균형을 지키는 정교한 협상 전략을 획득.

### 시나리오 3: [$L_0$ & Ekispert MCP] 연속 야근 번아웃 감지와 물리적 15분 도보 산책로 자동 처방
* **상황**: 목요일 밤 22시 15분, 사용자가 3일 연속 13시간 이상 근무를 마치고 퇴근 지하철역 개찰구로 향함. 스마트워치 생체 데이터상 스트레스 지수는 88(매우 높음)이며, 이 상태 귀가 시 야식 폭식 및 주말 취미 루틴 취소 확률 $85\%$로 예측됨.
* **사용자 경험 흐름**:
  1. $L_0$ 모니터링 엔진이 사용자의 위치(신주쿠역 인근)와 생체 신호를 결합 분석.
  2. **Layer 5(Ekispert API MCP 서버)**가 실시간 구동되어 최단 환승 대신 **"신주쿠교엔 외곽 녹지를 통과하여 15분간 도보로 걸어서 다음 역(센다가야역)에서 승차하는 힐링 환승 경로"**를 산출.
  3. 스마트폰 잠금화면에 잔잔한 햅틱과 함께 알림 카드 도착:
     > *"[L0 라이프가드] 뇌가 지쳐 폭식 충동이 임계점에 달했습니다. 최단 환승 대신 밤공기를 마실 수 있는 '15분 녹지 환승 티켓'을 발급했습니다. 이 산책으로 오늘 밤 3만 원의 야식비와 1,200kcal의 지방 축적을 방어하고, 주말 사진 출사 취미 컨디션을 회복합니다."*
  4. 사용자는 에이전트가 제시한 쾌적한 보행 내비게이션을 따라 걸으며 스트레스를 식히고, 일상의 피로를 물리적 공간 동선으로 치유받는 경험을 누림.

---

## 7. 심사위원 압도 3분 라이브 데모 시나리오

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             3-Minute Live Demo Flow                              │
├─────────────┬────────────────────────────────────────────────────────────────────┤
│ 시간        │ 화면 연출 및 발표 나레이션                                        │
├─────────────┼────────────────────────────────────────────────────────────────────┤
│ 00:00~00:40 │ [문제 제기 & Log-10 스케일 당위성]                                 │
│             │ - "1일의 치킨 값과 30년 은퇴 사이의 10,000배 괴리를 누가 잇습니까?"│
│             │ - 5단계 로그 등간격($10^0 \to 10^4$) 아키텍처 대시보드 조망         │
├─────────────┼────────────────────────────────────────────────────────────────────┤
│ 00:40~01:25 │ [Cloud DLP 실시간 마스킹 & 마이크로 일탈의 5단계 역전파]          │
│             │ - 원클릭 프리셋: '야밤 9만 원 오마카세 결제 내역' 인입             │
│             │ - Cloud DLP가 계좌번호와 식당명을 [TOKEN]으로 마스킹하는 보안 화면 │
│             │ - $L_0 \to L_1 \to L_2 \to L_3 \to L_4$(은퇴 2.3일 지연) 연쇄 시각화│
├─────────────┼────────────────────────────────────────────────────────────────────┤
│ 01:25~02:20 │ [Gemini 3.1 Pro 위원회의 상충 중재 시연]                           │
│             │ - 안건: "연봉 3,500만 원 인상, 주 75시간 야근 스타트업 이직"       │
│             │ - Finance(찬성) vs Well-being(가족/건강/취미 박탈 경고)의 대립     │
│             │ - Governor가 개입하여 "L4 헌법 위배. 주 52시간 캡 조건부 협상안 도출"│
├─────────────┼────────────────────────────────────────────────────────────────────┤
│ 02:20~03:00 │ [Ekispert MCP 마이크로 실행 & 최종 임팩트]                         │
│             │ - Ekispert MCP가 퇴근길 15분 도보 산책 환승 경로를 추천하는 마이크로│
│             │   액션 완결. "인생 30년을 오늘 밤 15분으로 지키는 ChronosLife"     │
└─────────────┴────────────────────────────────────────────────────────────────────┘
```

---

## 8. 개발 공수 및 구현 예상 소요 시간 (시간 단위 Breakdown)

전체 개발 공수는 **총 40시간(Hours)**으로, 주말 몰입 또는 평일 저녁 집중 개발로 1~1.5주 내 완성 가능한 일정입니다.

| 단계 | 세부 작업 내용 | 예상 소요 시간 | 산출물 / 검증 포인트 |
| :--- | :--- | :---: | :--- |
| **Phase 1: 인프라 및 보안 거버넌스** | • GCP 프로젝트 설정 및 Cloud DLP API v2 연동<br>• 계좌/실명/의료 데이터 실시간 토크나이저 모듈 구현 (`privacy_guard.py`) | **5시간** | 원본 텍스트 인입 시 50ms 내 가상 토큰화 검증 단위 테스트 |
| **Phase 2: Log-10 시계열 계산 코어** | • Log-10 5단계 계층 복리 및 인과 역전파 수식 작성 (`log10_engine.py`)<br>• $L_0 \to L_4$ 단계별 감쇠 및 지연일 산출 로직 검증 | **4시간** | $10^0 \sim 10^4$일 간 왜곡 없는 역전파 연산 유닛 테스트 완료 |
| **Phase 3: 멀티 에이전트 위원회 & 중재 엔진** | • Gemini 3.8 Flash 서브 에이전트 프롬프트 및 JSON 스키마 튜닝 (Finance, Career, Well-being)<br>• Gemini 3.1 Pro 인생 헌법 RAG 및 파레토 상충 중재 엔진 (`chief_governor.py`) | **8시간** | 이직/충동 지출 안건에 대한 조건부 타협안 정상 출력 확인 |
| **Phase 4: 스폰서 기술 연동 (Ekispert MCP)** | • Ekispert API MCP 서버 도구 연동 및 대중교통/도보 힐링 경로 쿼리 클라이언트 구현 | **4시간** | 야근/번아웃 상태 시 15분 녹지 환승 경로 반환 확인 |
| **Phase 5: 프론트엔드 대시보드 구축** | • Next.js + Tailwind CSS 기반 대시보드 UI 개발<br>• Cloud DLP 전후 텍스트 비교 뷰어 및 5단계 역전파 인터랙티브 그래프 | **10시간** | 반응형 웹 대시보드 및 원클릭 프리셋 버튼 3종 구현 |
| **Phase 6: 해커톤 규정 완벽 준수 및 배포** | • **백엔드**: FastAPI를 **Cloud Run** 컨테이너 빌드 및 원클릭 배포 (GCP 컴퓨팅 요건 충족)<br>• **프론트엔드**: Next.js 앱을 **Firebase App Hosting**을 통해 배포 (웹 애플리케이션 라이브 URL 요건 충족)<br>• **GCP 계정**: 기업 보안 정책 차단 방지를 위해 **개인 Gmail 계정** 기반 GCP 프로젝트($300 크레딧)에 배포<br>• 심사위원용 테스트 계정 셋업 및 3분 데모 영상 녹화/YouTube 공개 업로드 | **9시간** | Cloud Run / Firebase App Hosting 배포 완료된 Live Web URL 확보 및 YouTube 3분 데모 영상 링크 등록 |
| **합계 (Total)** | **ChronosLife 엔드투엔드 프로덕션 완성** | **40시간** | **해커톤 심사 규정 100% 충족 및 즉시 출품 완료** |

---

## 9. 2026 첨단 기능 업데이트 (Multimodal Comic, Live Audio, History & Observability)

### 9.1. Multimodal Log-10 5컷 라이프 만화 (Webtoon Comic Strip Viewer & Image Engine)
* **배경 및 철학**: 수치와 텍스트 위주의 대시보드를 넘어, 시계열 지평($10^0 \to 10^4$일)의 극적인 인과율을 **웹툰 만화 스타일의 5컷 크로니클**로 시각화하여 사용자의 감정적 몰입과 행동 교정 동기를 극대화.
* **5컷 시계열 스토리보드 아키텍처**:
  1. **Cut 1 ($10^0$일 / 오늘 밤)**: '결단의 기로' (피로/유혹에 흔들리는 주인공과 오케스트레이터의 순간 감지)
  2. **Cut 2 ($10^1$일 / 10일 후)**: '버퍼의 균열' (가계부 잔고 감소 또는 신체 피로 누적의 초기 경고등)
  3. **Cut 3 ($10^2$일 / 100일 후)**: '유예와 쿨다운의 시험' (중재관의 카운터오퍼 실천으로 안착된 새로운 루틴)
  4. **Cut 4 ($10^3$일 / 약 3년 후)**: '복리 눈덩이의 가속' (종잣돈 형성 또는 커리어 도약의 폭발적 결실)
  5. **Cut 5 ($10^4$일 / 약 30년 후)**: '파레토 최적 은퇴 비전' (30년 전 그 사소한 결단 덕분에 누리는 자유롭고 평화로운 삶)
* **듀얼 API 키 및 이미지 생성 엔진 분리 (`GEMINI_IMAGE_API_KEY`)**:
  * 텍스트 추론/음성/거버넌스용 메인 키(`GEMINI_API_KEY`)와 이미지 생성 전용 키(`GEMINI_IMAGE_API_KEY`)를 환경변수 수준에서 엄격히 분리하여 쿼터 경합 방지.
  * **Interactions API 프로토콜**: Google GenAI SDK의 `client.interactions.create(model='gemini-3.1-flash-image')`를 호출하여 고해상도 웹툰 컷 이미지를 실시간 바이너리로 수신 및 `frontend/public/comics/`에 영구 보존.
* **사용자 제어형 기능 토글 (`ENABLE_IMAGE_GENERATION`)**:
  * `ENABLE_IMAGE_GENERATION=False`: 불필요한 이미지 쿼터 소모와 대기 시간(~15초)을 배제하고, 맞춤형 SVG 비주얼 일러스트(`VisualIllustration` - Rainy Neon City, Dawn Buffer Alert 등)를 선명하게 감상.
  * 필요 시 `ENABLE_IMAGE_GENERATION=True`로 원클릭 전환하여 실시간 이미지 자동 생성 재개 가능.

### 9.2. 점진적 실시간 단계별 갱신 스트리밍 (Progressive Staged Revealing UX)
* **엔드포인트**: `POST /api/analyze/stream` (Server-Sent Events / SSE)
* **순수 ASGI 미들웨어 변환을 통한 무지연 0ms 청크 전달**:
  * Starlette `BaseHTTPMiddleware`의 AnyIO 내부 메모리 버퍼링으로 인해 스트리밍 청크가 일괄 지연 방출되던 문제를 **순수 ASGI 미들웨어 (`DevInspectorMiddleware`)**로 전환하여 완전 해결.
  * `/api/analyze/stream` 경로는 0ms 지연으로 실시간 청크를 즉시 클라이언트에 전달.
* **실시간 파이프라인 스테이지 실측 타임라인**:
  * **Stage 1 (Layer 0)**: Context Orchestrator 인텐트 판별 & 프롬프트 디스패치 $\to$ `OrchestratorTraceViewer` 즉시 언락 (**+2.96초**)
  * **Stage 2 (Layer 1)**: Privacy Sandbox DLP 민감정보 마스킹 $\to$ `DlpComparisonViewer` 즉시 언락 (**+3.08초**)
  * **Stage 3 (Layer 2)**: 3대 서브에이전트(Finance, Career, Wellbeing) 심의 $\to$ `ArbitrationConsole` 즉시 언락 및 최고 중재관 펄스 스켈레톤 로더 가동 (**+7.97초**)
  * **Stage 4 (Layer 3)**: 최고 중재관(Chief Governor) 최종 판결 완결 $\to$ 스켈레톤에서 정식 판결문 카드 전환 (**+9.75초**)
  * **Stage 5 (Multimodal & Trajectory)**: 5대 목표 궤적 선그래프 & 5컷 웹툰 스토리보드 완성 (**+15.8초**, 이미지 오프 시)
* **대시보드 순차 배치 (Chronological Alignment)**:
  * 컴포넌트 렌더링 순서를 파이프라인 진행 순서(Stage 1 $\to$ 2 $\to$ 3 $\to$ 4 $\to$ 5)와 100% 일치시켜 시각적 화면 점핑 현상 제거.

### 9.3. 객체지향 캡슐화 서브에이전트군 & 실시간 모델 레지스트리
* **독립 서브에이전트**: `BaseSubAgent` 추상 인터페이스를 상속한 `FinanceSubAgent`, `CareerSubAgent`, `WellbeingSubAgent`.
* **동적 헌법 프로필 연동**: 하드코딩된 수치를 배제하고, 사용자 헌법 스튜디오에서 설정된 동적 프로필(`daily_budget`, `max_weekly_hours`, 필수 수면 시간)을 런타임에 주입받아 평가.
* **실시간 16개 Gemini 모델 동적 탐색**: Google GenAI API의 `client.models.list()`를 연동하여 `gemini-3.5-flash-lite`, `gemini-3.5-flash`, `gemini-flash-latest` 등 가용 모델을 실시간 자동 감지 및 선택 지원.

### 9.4. Google GenAI SDK 기반 공식 Gemini 3.8 Live API 실시간 양방향 오디오 파이프라인
* **도입 배경**: 단순한 텍스트 챗봇이나 일반 REST API를 넘어, **Google 공식 생성형 AI SDK (`google-genai`)**의 `client.aio.live.connect` 양방향 WebSocket 인터페이스를 직결하여 **초저지연 네이티브 오디오 PCM 스트리밍 및 실시간 도구 호출(Function Calling)** 기반의 진정한 Gemini Live 거버넌스를 구현.
* **핵심 아키텍처 및 데이터 흐름**:
  1. **Gemini 3.8 Live 세션 연결 (`gemini_live_session.py`)**:
     * 모델: `gemini-3.8-live` (Bidi Streaming 실시간 모델)
     * 모달리티: `response_modalities=["AUDIO"]` (네이티브 24kHz PCM 오디오 스트리밍)
     * 양방향 WebSocket: `async with client.aio.live.connect(...) as session` 영구 스트리밍 파이프라인 가동.
  2. **오디오 양방향 PCM 스트리밍**:
     * **업스트림 (User $\to$ Gemini)**: 브라우저 마이크에서 16kHz 16비트 Linear PCM 바이트를 실시간 캡처하여 `session.send_realtime_input(audio=types.Blob(data=pcm, mime_type="audio/pcm;rate=16000"))`로 즉시 스트리밍.
     * **다운스트림 (Gemini $\to$ User)**: `session.receive()`의 `part.inline_data.data`를 통해 Gemini의 실제 네이티브 오디오 바이너리를 Web Audio API로 끊김 없이 큐잉 재생.
  3. **실시간 도구 호출 (Tool / Function Calling)**:
     * `update_life_goal(category, title, target_value, rule, tenet)` 도구를 선언하여 세션에 주입.
     * 대화 중 사용자가 가치관이나 규칙(예: 주말 러닝 4시간, 가족 식사 3회, 주 52시간 상한 등)을 말하면, Gemini 3.8 Live가 음성으로 답변하면서 **실시간 도구 호출(`response.tool_call`)**을 즉각 발생시킴.
     * 서버에서 함수를 실행하여 헌법을 갱신하고 `session.send_tool_response(...)`로 회신하며, 클라이언트 화면의 목표 카드를 실시간 자동 갱신.
  4. **Three.js WebGL 3D 사이버네틱 아바타 ([`GeminiLiveAvatar3D.tsx`](file:///c:/Users/Joel_Lee/내%20드라이브/Joel/10_projects/00_Chronos_Life/frontend/src/components/GeminiLiveAvatar3D.tsx))**:
     * 실시간 네이티브 PCM 오디오 스트림에 동기화되는 **실시간 립싱크(Lip-Sync Morphs)**.
     * 마우스 시선 추적(Look-at tracking) 및 360도 3D 드래그 회전 인터랙션.
     * 상태별 지능형 비주얼 피드백: 경청(Listening - 에메랄드 림라이트/틸트), 생각(Thinking - 오비탈 링 고속 회전), 발화(Speaking - 네이티브 음성 립싱크 및 바이올렛 펄스).

### 9.5. 3단계 사용자 여정 패러다임 (3-Stage Workflow Architecture)
* **진입 UX 혁신**: 앱 최초 진입 시 빈 대시보드 노출로 인한 사용자 인지 부하를 해소하기 위해, **'인생 헌법 & 5대 목표 스튜디오'를 기본 시작 탭(Default Landing)**으로 설정.
* **3대 탭 워크플로우**:
  1. **1단계: 인생 헌법 & 5대 목표 스튜디오 (`GoalConstitutionStudio.tsx`)**:
     * AI 인생 헌법 설계관과의 1:1 대화 인터뷰 및 Gemini Live 3D 아바타 음성 코칭.
     * 재정, 커리어, 건강, 가족, 취미 5대 핵심 영역별 목표/가치관/불변 헌법 정립.
  2. **2단계: 실시간 라이프 거버넌스 심의 (`InteractiveInputConsole.tsx` + Dashboard)**:
     * 일상 속 의사결정(지출, 이직 제안, 야근 번아웃 등) 인입 시 5단계 파이프라인 실시간 스트리밍 심의.
  3. **3단계: 누적 심의 히스토리 & 궤적 추적 (`DeliberationHistoryTracker.tsx`)**:
     * 영구 보존된 과거 심의 기록 탐색, 종합 판결 통계, 원클릭 대시보드 복원.

### 9.6. 누적 심의 히스토리 매니저 (`history_manager.py`)
* **아키텍처**:
  * 스트리밍 심의 완료(`stage: complete`) 또는 동기 심의(`/api/analyze`) 종료 시, `backend/logs/history_deliberations.jsonl`에 타임스탬프 기반 JSONL로 자동 영구 적립.
  * 중재관 최종 판결(승인/조건부수정/기각), 위반 헌법 조항, 인텐트 태그, 지출 금액 등 핵심 인덱스를 함께 보존.
* **REST API**:
  * `GET /api/history`: 전체 누적 히스토리 역순 페이징 조회.
  * `GET /api/history/{id}`: 특정 심의 건의 전체 페이로드(오케스트레이터, DLP, 카운슬, 판결, 웹툰, 궤적) 복원.
  * `DELETE /api/history/{id}`: 특정 기록 삭제.

### 9.7. 실시간 개발자 관제 인스펙터 시스템 (`dev_logger.py`, `DevLogInspector.tsx`)
* **엔진**: `DevLogStore` (최신 100건 인메모리 링버퍼 + `backend/logs/llm_calls.jsonl` 회전 파일 기록)
* **관제 항목**:
  * API 요청별 HTTP 메서드, 엔드포인트, 상태 코드, 소요 시간(ms).
  * 내부 LLM 호출별 호출자(ContextOrchestrator, FinanceSubAgent, ChiefGovernor, ComicEngine 등), 사용 모델, 입력 프롬프트 원문, 응답 텍스트, 호출 지연시간.
* **UI**: 프론트엔드 하단에 도킹된 `DevLogInspector.tsx` 접이식 드로어를 통해 실시간 로그 확인 및 복사 기능 제공.
* **로그 비대화 방지**: 거대 바이너리나 중복 페이로드 기록을 원천 차단하여 로그 파일 크기를 메가바이트(MB) 수준으로 엄격히 제한.

## 10. [v2.5] 동적 상태 공간(State-Space) 거버넌스 아키텍처

단발성(Point) 이벤트를 넘어 누적 시계열 행동을 분석하기 위한 Layer 0.5 엔진을 편입하였습니다.

### 10.1. Layer 0.5: State Dynamics Engine (state_engine.py)
* **목적**: 사용자의 수면 부채, 연속 야근, 주간 예산 가속도 등을 비선형 누적 커널로 계산하여 번아웃 지수(Burnout Index) 등 6차원 상태 벡터(LifeStateVector) 갱신.
* **통합**: ContextOrchestrator(Layer 0) 직후에 위치하며, 도출된 상태 메트릭과 이상 징후(예: '의지력 고갈성 보상 소비 감지') 플래그를 cascade_summary에 주입하여 Layer 2(카운슬)와 Layer 3(중재관)에 전달합니다.

### 10.2. Chronos Context Cache Manager (context_cache_manager.py)
* **목적**: Google GenAI SDK의 client.caches.create()를 활용하여 최근 30~60일간의 사용자 대화 및 행동 이력을 Context Cache에 영구 보존(TTL).
* **비용 절감**: 방대한 10만 토큰의 누적 히스토리를 매 호출 시 반복 전송하지 않아 토큰 비용을 80% 이상 절감하고 초저지연 탐색 가능.

### 10.3. 과거 궤적 (Past Trajectory) 시각화 렌더링
* **프론트엔드 연동**: GoalImpactMatrix.tsx 5단계 선그래프의 좌측 영역에, 지난 7일간의 과거 상태(Past Trajectory) 점선과 노드들을 새롭게 연결하여 렌더링함으로써 시간의 연속성을 시각적으로 완성했습니다.
