# Frontend Unit - Code Generation Plan

## Unit Context

- **Unit Name**: frontend
- **Responsibility**: 단어 관리를 위한 React SPA UI (추가/목록/수정/삭제/외움 체크)
- **Requirements Covered**: FR-1~FR-6 (사용자 시나리오 1~6 전체)
- **Dependencies**: backend 유닛 (`http://localhost:4000/api/words` REST API, 이미 구현 완료·승인됨)
- **Consumers**: 없음 (최상위 계층, 최종 사용자가 브라우저로 접근)
- **Workspace Root**: `/workshop/word-book`
- **Code Location**: `/workshop/word-book/frontend/`

## Backend API 계약 (참조 — backend-code-generation-plan.md 및 api-layer-summary.md 기준)

| Method | Path | 설명 |
|---|---|---|
| GET | /api/words | 목록 조회 (최근순) |
| POST | /api/words | 추가 (`{word, definition, force?}`), 중복 시 409 |
| PUT | /api/words/:id | 수정 |
| PATCH | /api/words/:id/toggle | 외움 상태 토글 |
| DELETE | /api/words/:id | 삭제 |

## UI 구성 요소

- **WordForm**: 단어/뜻 입력 폼 (추가 및 수정 겸용)
- **WordList**: 단어 목록 표시 (최근순)
- **WordItem**: 개별 항목 (외움 체크박스, 수정/삭제 버튼)
- **ConfirmDialog**: 삭제 확인 / 중복 단어 강제 추가 확인에 재사용하는 공용 확인 다이얼로그
- **App**: 최상위 컴포넌트, 상태 관리 및 API 연동

## 실행 계획

### Step 1: Project Structure Setup (Greenfield)
- [x] 1.1 `frontend/` 디렉토리 생성, Vite React 템플릿 구조 구성: `frontend/src/`, `frontend/src/components/`, `frontend/src/api/`
- [x] 1.2 `frontend/package.json` 생성 (react, react-dom, vite, @vitejs/plugin-react, vitest, @testing-library/react 등)
- [x] 1.3 `frontend/vite.config.js`, `frontend/index.html` 생성

### Step 2: API Client Layer Generation
- [x] 2.1 `frontend/src/api/wordsApi.js` - fetch 기반 API 클라이언트 (getWords, addWord, updateWord, toggleWord, deleteWord), 백엔드 base URL `http://localhost:4000`

### Step 3: API Client Unit Testing
- [x] 3.1 `frontend/src/api/wordsApi.test.js` - fetch mock을 이용한 API 클라이언트 단위 테스트

### Step 4: Frontend Components Generation
- [x] 4.1 `frontend/src/components/ConfirmDialog.jsx` - 재사용 가능한 확인 다이얼로그
- [x] 4.2 `frontend/src/components/WordForm.jsx` - 단어/뜻 입력 폼 (추가/수정 겸용, 빈 값 검증)
- [x] 4.3 `frontend/src/components/WordItem.jsx` - 개별 단어 항목 (외움 토글 체크박스, 수정/삭제 버튼)
- [x] 4.4 `frontend/src/components/WordList.jsx` - 목록 렌더링 (빈 목록 안내 문구 포함)
- [x] 4.5 `frontend/src/App.jsx` - 전체 상태 관리(단어 목록, 로딩/에러), API 연동, 중복/삭제 확인 다이얼로그 흐름 조립
- [x] 4.6 `frontend/src/main.jsx`, `frontend/src/index.css` - 앱 엔트리포인트 및 기본 스타일

### Step 5: Frontend Components Unit Testing
- [x] 5.1 `frontend/src/components/WordForm.test.jsx` - 입력 검증, 제출 이벤트 테스트
- [x] 5.2 `frontend/src/components/WordItem.test.jsx` - 토글/수정/삭제 버튼 클릭 이벤트 테스트
- [x] 5.3 `frontend/src/App.test.jsx` - API mock을 이용한 통합 시나리오 테스트 (추가, 중복 확인 후 강제추가, 삭제 확인, 토글)

### Step 6: Frontend Components Summary
- [x] 6.1 `aidlc-docs/construction/frontend/code/components-summary.md` 작성

### Step 7: Documentation Generation
- [x] 7.1 `frontend/README.md` - 설치/실행/테스트 방법, backend 의존성 안내

## Story/Requirement Traceability
- FR-1 (추가+중복확인) → Step 4.2(WordForm), 4.5(App 중복 다이얼로그 흐름)
- FR-2 (목록, 최근순) → Step 2.1(getWords), 4.4(WordList) — 정렬은 backend가 이미 보장
- FR-3 (수정) → Step 4.2(WordForm 겸용), 4.3(WordItem 수정 버튼)
- FR-4 (삭제+확인) → Step 4.1(ConfirmDialog), 4.3(WordItem 삭제 버튼)
- FR-5 (외움 체크) → Step 4.3(WordItem 토글)
- FR-6 (영구 저장) → backend 의존, frontend는 API 호출만 담당

## 접근성/자동화 규칙 적용
- 모든 인터랙티브 요소(버튼, 입력, 체크박스)에 `data-testid` 부여 (예: `word-form-submit-button`, `word-item-toggle-checkbox`)
- 폼 입력에 `label` 연결, 다이얼로그에 적절한 ARIA role 적용

## 총 단계 수
7개 주요 단계, 15개 세부 체크박스
