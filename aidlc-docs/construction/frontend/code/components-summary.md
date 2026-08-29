# Frontend - Components Summary

## 생성된 파일

### API 클라이언트
- `frontend/src/api/wordsApi.js` - fetch 기반 API 클라이언트 (`getWords`, `addWord`, `updateWord`, `toggleWord`, `deleteWord`), `ApiError` 커스텀 에러 클래스
- `frontend/src/api/wordsApi.test.js` - fetch mock 기반 단위 테스트 (7개)

### 컴포넌트
| 파일 | 역할 |
|---|---|
| `WordForm.jsx` | 단어/뜻 입력 폼. `editingWord` prop 유무로 추가/수정 모드 겸용. 빈 값(공백만 있는 경우 포함) 검증 |
| `WordItem.jsx` | 개별 단어 항목. 외움 체크박스, 수정/삭제 버튼 |
| `WordList.jsx` | 목록 렌더링, 빈 목록 시 안내 문구 표시 |
| `ConfirmDialog.jsx` | 재사용 가능한 확인 다이얼로그 (삭제 확인 / 중복 단어 강제 추가 확인 겸용) |
| `App.jsx` | 최상위 상태 관리(목록/로딩/에러/수정중 항목/대기중 확인작업), backend API 연동 |

### 엔트리포인트/스타일
- `frontend/src/main.jsx`, `frontend/index.html`, `frontend/src/index.css`

## 상태 관리 흐름 (App.jsx)

- `words`: 현재 단어 목록 (backend에서 항상 재조회하여 갱신, 클라이언트 측 캐시 없음)
- `editingWord`: 수정 중인 항목 (null이면 추가 모드)
- `pendingAction`: 확인이 필요한 대기 작업 — `{type: 'delete', id}` 또는 `{type: 'duplicate', payload}`
  - 삭제 버튼 클릭 → `pendingAction`에 `delete` 설정 → ConfirmDialog "정말 삭제하시겠습니까?" 표시 → 확인 시 `deleteWord` 호출
  - 중복 단어(409 응답) → `pendingAction`에 `duplicate` 설정 → ConfirmDialog "중복 단어입니다. 정말 다시 추가할까요?" 표시 → 확인 시 `addWord({..., force: true})` 재호출

## data-testid 규칙

`{component}-{element-role}[-{id}]` 형식 사용 (예: `word-form-submit-button`, `word-item-toggle-checkbox-1`, `confirm-dialog-confirm-button`)

## 테스트 커버리지

Vitest + React Testing Library, 총 25개 테스트:
- `wordsApi.test.js` (7): 각 API 함수의 요청/응답 처리, ApiError 발생 케이스
- `WordForm.test.jsx` (5): 빈 값 검증, trim 처리, 추가/수정 모드 전환, 취소
- `WordItem.test.jsx` (5): 렌더링, 토글/수정/삭제 이벤트 호출, memorized 상태 반영
- `App.test.jsx` (8): 초기 로드, 빈 목록, 추가, 중복 확인 후 강제추가, 삭제 확인(확인/취소), 토글, 수정

## 검증 결과

- `npm install`, `npm test` (25/25 통과), `npm run build` (프로덕션 빌드 성공, 약 148KB JS) 모두 실제 실행하여 확인함 (Node v24.20.0).
