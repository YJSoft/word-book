# Unit Test Execution

## Run Unit Tests

### 1. Execute All Unit Tests

**Backend** (`node --test` 기반):
```bash
cd backend
npm test
```

**Frontend** (Vitest 기반):
```bash
cd frontend
npm test
```

### 2. Review Test Results

- **Backend Expected**: 22 tests pass, 0 failures
  - `test/wordRepository.test.js` (9개): Repository 계층 CRUD 함수
  - `test/wordsRouter.test.js` (13개): API 엔드포인트 (성공/검증실패/중복/404 케이스)
- **Frontend Expected**: 25 tests pass, 0 failures
  - `src/api/wordsApi.test.js` (7개): API 클라이언트
  - `src/components/WordForm.test.jsx` (5개): 입력 검증
  - `src/components/WordItem.test.jsx` (5개): 토글/수정/삭제 이벤트
  - `src/App.test.jsx` (8개): 통합 시나리오 (추가/중복확인/삭제확인/토글/수정)
- **Test Coverage**: 별도 커버리지 리포트 도구는 설정하지 않음 (프로젝트 규모상 불필요). 모든 주요 함수와 사용자 시나리오(FR-1~FR-6)가 테스트로 커버됨.
- **Test Report Location**: 콘솔 출력 (backend: `node --test` 기본 TAP 유사 출력, frontend: Vitest 기본 출력)

### 3. Fix Failing Tests

테스트 실패 시:
1. 콘솔에 출력된 실패한 테스트 이름과 assertion 오류 확인
2. 해당 소스 파일(`backend/src/` 또는 `frontend/src/`)에서 원인 파악
3. 코드 수정 후 `npm test` 재실행
4. 모든 테스트가 통과할 때까지 반복

## 실제 실행 결과 (검증됨)

이 프로젝트에서는 코드 생성 단계에서 이미 실제로 실행하여 검증했습니다 (Node.js v24.20.0):
- Backend: **22/22 통과**
- Frontend: **25/25 통과**
