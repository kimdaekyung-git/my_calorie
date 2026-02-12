# Coding Convention & AI Collaboration Guide - 헬스메이트

> 고품질/유지보수/보안을 위한 인간-AI 협업 운영 지침서입니다.

---

## MVP 캡슐

| # | 항목 | 내용 |
|---|------|------|
| 1 | 목표 | 귀찮은 입력 과정을 간소화하여 식단을 꾸준히 기록할 수 있게 하기 |
| 2 | 페르소나 | 다이어트 중인 사람 |
| 3 | 핵심 기능 | FEAT-1: 간편 식단 기록 |
| 4 | 성공 지표 (노스스타) | 매일 3끼 기록 달성률 |
| 5 | 입력 지표 | 일일 기록 횟수, 주간 연속 기록 일수 |
| 6 | 비기능 요구 | 식단 입력 3초 이내 완료 |
| 7 | Out-of-scope | 운동 기록, 소셜, 다크 모드, 회원가입/로그인 |
| 8 | Top 리스크 | 입력 귀찮아서 3일 만에 포기 |
| 9 | 완화/실험 | 음식 검색 자동완성 + 최근 기록 재사용 |
| 10 | 다음 단계 | 식단 기록 화면 프로토타입 구현 |

---

## 1. 핵심 원칙

### 1.1 신뢰하되, 검증하라 (Don't Trust, Verify)

AI가 생성한 코드는 반드시 검증해야 합니다:

- [ ] 코드 리뷰: 생성된 코드 직접 확인
- [ ] 테스트 실행: 자동화 테스트 통과 확인
- [ ] 보안 검토: 민감 정보 노출 여부 확인
- [ ] 동작 확인: 실제로 실행하여 기대 동작 확인

### 1.2 최종 책임은 인간에게

- AI는 도구이고, 최종 결정과 책임은 개발자에게 있습니다
- 이해하지 못하는 코드는 사용하지 않습니다
- 의심스러운 부분은 반드시 질문합니다

---

## 2. 프로젝트 구조

### 2.1 디렉토리 구조

```
healthmate/
├── frontend/
│   ├── src/
│   │   ├── components/        # 재사용 컴포넌트
│   │   │   ├── ui/            # 기본 UI (Button, Input, Card)
│   │   │   └── meal/          # 식단 관련 컴포넌트
│   │   ├── pages/             # 페이지 컴포넌트
│   │   ├── hooks/             # 커스텀 훅
│   │   ├── utils/             # 유틸리티 함수
│   │   ├── services/          # API 호출
│   │   ├── stores/            # Zustand 스토어
│   │   ├── types/             # TypeScript 타입
│   │   ├── db/                # Dexie.js 데이터베이스
│   │   ├── mocks/             # MSW Mock 핸들러
│   │   │   ├── handlers/
│   │   │   └── data/
│   │   └── __tests__/         # 테스트
│   ├── e2e/                   # E2E 테스트
│   ├── public/                # 정적 파일, PWA 아이콘
│   └── index.html
├── backend/
│   ├── app/
│   │   ├── routes/            # API 라우트
│   │   ├── schemas/           # Pydantic 스키마
│   │   ├── services/          # 외부 API 호출
│   │   └── utils/             # 유틸리티
│   └── tests/
│       └── api/               # API 테스트
├── contracts/                 # API 계약 (BE/FE 공유)
│   ├── types.ts
│   └── food.contract.ts
├── docs/
│   └── planning/             # 기획 문서
└── docker-compose.yml
```

### 2.2 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 파일 (컴포넌트) | PascalCase | `MealCard.tsx` |
| 파일 (유틸) | camelCase | `formatCalories.ts` |
| 파일 (Python) | snake_case | `food_service.py` |
| 컴포넌트 | PascalCase | `MealRecordForm` |
| 함수/변수 | camelCase | `getMealsByDate` |
| 상수 | UPPER_SNAKE | `MAX_SEARCH_RESULTS` |
| CSS 클래스 | TailwindCSS 유틸리티 | `bg-primary text-white` |
| 타입/인터페이스 | PascalCase | `MealRecord` |

---

## 3. 아키텍처 원칙

### 3.1 뼈대 먼저 (Skeleton First)

1. 전체 구조를 먼저 잡고
2. 빈 함수/컴포넌트로 스켈레톤 생성
3. 하나씩 구현 채워나가기

### 3.2 작은 모듈로 분해

- 한 파일에 200줄 이하 권장
- 한 함수에 50줄 이하 권장
- 한 컴포넌트에 100줄 이하 권장

### 3.3 관심사 분리

| 레이어 | 역할 | 예시 |
|--------|------|------|
| UI | 화면 표시 | React 컴포넌트 (`MealCard`) |
| 상태 | 데이터 관리 | Zustand 스토어 (`useMealStore`) |
| DB | 로컬 데이터 | Dexie.js (`db.meals`) |
| 서비스 | API 통신 | Axios 래퍼 (`foodApi.search()`) |
| 유틸 | 순수 함수 | `formatCalories(1500)` → "1,500 kcal" |

---

## 4. AI 소통 원칙

### 4.1 하나의 채팅 = 하나의 작업

- 한 번에 하나의 명확한 작업만 요청
- 작업 완료 후 다음 작업 진행
- 컨텍스트가 길어지면 새 대화 시작

### 4.2 컨텍스트 명시

**좋은 예:**
> "TASKS 문서의 T2.1을 구현해주세요.
> Database Design의 MEAL_RECORD를 참조하고,
> TRD의 기술 스택(Dexie.js)을 따라주세요."

**나쁜 예:**
> "식단 기록 만들어줘"

### 4.3 프롬프트 템플릿

```
## 작업
{{무엇을 해야 하는지}}

## 참조 문서
- {{문서명}} 섹션 {{번호}}

## 제약 조건
- {{지켜야 할 것}}

## 예상 결과
- {{생성될 파일}}
- {{기대 동작}}
```

---

## 5. 보안 체크리스트

### 5.1 절대 금지

- [ ] 비밀정보 하드코딩 금지 (API 키)
- [ ] .env 파일 커밋 금지
- [ ] 사용자 입력 그대로 출력 금지 (XSS)

### 5.2 필수 적용

- [ ] 모든 사용자 입력 검증
- [ ] HTTPS 사용 (PWA 필수)
- [ ] CORS 설정 (백엔드)
- [ ] 환경 변수로 API 키 관리

### 5.3 환경 변수 관리

```bash
# .env.example (커밋 O)
VITE_API_BASE_URL=http://localhost:8000
FOOD_API_KEY=your-food-api-key-here

# .env (커밋 X)
VITE_API_BASE_URL=http://localhost:8000
FOOD_API_KEY=actual-api-key
```

---

## 6. 테스트 워크플로우

### 6.1 즉시 실행 검증

코드 작성 후 바로 테스트:

```bash
# 백엔드
pytest backend/tests/ -v

# 프론트엔드
npm run test

# E2E
npx playwright test
```

### 6.2 오류 로그 공유 규칙

오류 발생 시 AI에게 전달할 정보:

1. 전체 에러 메시지
2. 관련 코드 스니펫
3. 재현 단계
4. 이미 시도한 해결책

---

## 7. Git 워크플로우

### 7.1 브랜치 전략

```
main          # 프로덕션
├── develop   # 개발 통합
│   ├── feature/feat-1-meal-record
│   ├── feature/feat-0-onboarding
│   ├── feature/feat-2-calorie
│   └── fix/search-result-empty
```

### 7.2 커밋 메시지

```
<type>(<scope>): <subject>

<body>
```

**타입:**
- `feat`: 새 기능
- `fix`: 버그 수정
- `refactor`: 리팩토링
- `docs`: 문서
- `test`: 테스트
- `chore`: 기타

**예시:**
```
feat(meal): 식단 기록 추가 기능 구현

- 음식 검색 API 연동
- IndexedDB에 기록 저장
- FEAT-1 T2.1 완료
```

---

## 8. 코드 품질 도구

### 8.1 필수 설정

| 도구 | 프론트엔드 | 백엔드 |
|------|-----------|--------|
| 린터 | ESLint | Ruff |
| 포매터 | Prettier | Black |
| 타입 체크 | TypeScript (strict) | mypy (선택) |

### 8.2 TailwindCSS 규칙

- 유틸리티 클래스 우선 사용
- 커스텀 CSS 최소화
- `tailwind.config.ts`에서 디자인 시스템 토큰 정의
- 반응형: `sm:` (640px), `md:` (768px), `lg:` (1024px)

---

## Decision Log

| ID | 항목 | 선택 | 근거 |
|----|------|------|------|
| D-C01 | 린터 | ESLint + Ruff | 각 언어별 표준 도구 |
| D-C02 | 포매터 | Prettier + Black | 일관된 코드 스타일 |
| D-C03 | 브랜치 전략 | Git Flow (간소화) | 개인 프로젝트에 적합 |
| D-C04 | 스타일링 방식 | TailwindCSS 유틸리티 | 빠른 개발, 디자인 시스템 통합 |
