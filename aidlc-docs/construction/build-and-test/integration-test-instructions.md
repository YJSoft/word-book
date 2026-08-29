# Integration Test Instructions

## Purpose
backend(Express+SQLite API)와 frontend(React SPA)가 실제로 연동되어 동작하는지, 그리고 backend의 REST API가 요구사항(FR-1~FR-6)을 만족하는지 확인한다.

## Test Scenarios

### Scenario 1: Backend API 전체 CRUD 흐름
- **Description**: curl로 backend API를 직접 호출하여 추가/중복처리/조회/수정/토글/삭제 전체 흐름 검증
- **Setup**: `cd backend && npm start` (포트 4000)
- **Test Steps**:
  1. `GET /api/words` → 빈 배열 확인
  2. `POST /api/words {"word":"apple","definition":"사과"}` → 201, 생성된 객체 반환
  3. 동일 단어로 다시 `POST` (force 없음) → 409, `code: DUPLICATE_WORD`
  4. 동일 단어로 `POST` with `force:true` → 201 (강제 추가됨)
  5. `GET /api/words` → 최근 추가한 항목이 먼저 오는지 확인
  6. `PATCH /api/words/:id/toggle` → memorized 값 반전 확인
  7. `PUT /api/words/:id` → definition 갱신 확인
  8. `DELETE /api/words/:id` → 204, 목록에서 제거 확인
- **Expected Results**: 모든 단계가 문서화된 상태 코드와 응답 형식을 따름
- **Cleanup**: `rm data/wordbook.db`

### Scenario 2: CORS 통합 확인 (frontend origin)
- **Description**: frontend(5173)에서 backend(4000)로의 요청이 CORS에 의해 차단되지 않는지 확인
- **Setup**: backend 실행 중
- **Test Steps**: `curl -i -X OPTIONS http://localhost:4000/api/words -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: POST"`
- **Expected Results**: `Access-Control-Allow-Origin: http://localhost:5173` 헤더 포함, 204 응답

### Scenario 3: 데이터 영속성 (서버 재시작)
- **Description**: 서버를 재시작해도 SQLite에 저장된 데이터가 유지되는지 확인 (FR-6)
- **Setup**: backend 실행 → 단어 추가 → 서버 종료(Ctrl+C) → 서버 재시작
- **Test Steps**: 재시작 후 `GET /api/words`로 이전에 추가한 데이터 확인
- **Expected Results**: 데이터가 그대로 유지됨

### Scenario 4: Frontend-Backend 전체 연동 (수동 브라우저 테스트)
- **Description**: 실제 브라우저에서 UI를 통한 전체 사용자 시나리오 확인
- **Setup**: backend(`npm start`, 포트 4000)와 frontend(`npm run dev`, 포트 5173)를 동시에 실행
- **Test Steps**: 브라우저에서 `http://localhost:5173` 접속 후 requirements.md의 "사용자 시나리오" 6단계를 수동으로 수행
- **Expected Results**: 단어 추가/중복확인/수정/삭제확인/토글이 UI에서 정상 동작하고, 새로고침해도 데이터 유지

## Setup Integration Test Environment

### 1. Start Required Services
```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm run dev
```

### 2. Configure Service Endpoints
별도 설정 불필요. frontend의 `src/api/wordsApi.js`에 backend URL(`http://localhost:4000`)이 하드코딩되어 있음 (로컬 전용 프로젝트 특성상 환경변수화하지 않음).

## Run Integration Tests

### 1. Execute Integration Test Suite
이 프로젝트는 별도의 자동화된 integration test 스크립트를 구성하지 않았다 (frontend의 `App.test.jsx`가 API를 mock하여 프론트-백 연동 로직을 검증하고, backend의 `wordsRouter.test.js`가 실제 HTTP 요청으로 API 계약을 검증함 — 두 test suite가 계약의 양쪽을 각각 커버). 위 Scenario 1~4는 수동 실행 절차이다.

### 2. Verify Service Interactions
- **Test Scenarios**: 위 4개 시나리오
- **Expected Results**: Troubleshooting 섹션 참고
- **Logs Location**: 각 서버의 터미널 콘솔 출력

### 3. Cleanup
```bash
# 각 터미널에서 Ctrl+C로 서버 종료
rm -f data/wordbook.db  # 테스트 데이터 초기화 (선택)
```

## 검증 결과 (실제 실행됨)

이 프로젝트에서는 Build and Test 단계에서 위 4개 시나리오를 모두 실제로 실행하여 검증했습니다:
- **Scenario 1**: 전체 CRUD 흐름 curl로 검증 — 추가(201), 중복(409), 강제추가(201), 정렬 확인, 토글, 수정, 삭제(204) 모두 정상
- **Scenario 2**: CORS preflight 응답에 `Access-Control-Allow-Origin: http://localhost:5173` 확인됨
- **Scenario 3**: 서버 재시작 후 이전 데이터(`apple` 항목)가 그대로 조회됨을 확인
- **Scenario 4**: backend(4000)와 frontend dev 서버(5173)를 동시 기동하여 정상 응답 확인 (수동 브라우저 클릭 테스트는 로컬 GUI 환경이 필요하여 사용자가 직접 수행 권장)
