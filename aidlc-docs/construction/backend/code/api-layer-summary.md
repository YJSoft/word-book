# Backend - API Layer Summary

## 생성된 파일

- `backend/src/routes/wordsRouter.js` - `/api/words` 하위 5개 엔드포인트, 입력 검증, 중복 처리 로직
- `backend/src/app.js` - Express 앱 설정 (CORS, JSON 파싱, 라우터 연결, 에러 핸들러)
- `backend/src/server.js` - 서버 기동 엔트리포인트 (기본 포트 4000)
- `backend/test/wordsRouter.test.js` - API 레벨 통합 테스트 (실제 HTTP 요청, in-memory DB)

## API 엔드포인트

### GET /api/words
전체 단어 목록을 최근 추가순으로 반환한다.

응답 예시 (200):
```json
[
  { "id": 2, "word": "banana", "definition": "바나나", "memorized": false, "createdAt": "2026-08-29T07:10:00.000Z" },
  { "id": 1, "word": "apple", "definition": "사과", "memorized": true, "createdAt": "2026-08-29T07:09:00.000Z" }
]
```

### POST /api/words
새 단어를 추가한다.

요청 body: `{ "word": "apple", "definition": "사과", "force": false }`
- `force`는 선택 필드 (기본 false). 중복 단어를 강제로 추가하려면 `true`로 전달.

응답:
- 201: 생성된 Word 객체
- 400: `word` 또는 `definition`이 비어있음(공백만 있는 경우 포함)
- 409: 중복 단어이며 `force`가 없음 — `{ "error": "...", "code": "DUPLICATE_WORD", "existing": {...} }`

### PUT /api/words/:id
기존 항목의 단어/뜻을 수정한다.

요청 body: `{ "word": "apple", "definition": "사과(수정)" }`

응답:
- 200: 수정된 Word 객체
- 400: 유효하지 않은 id 또는 검증 실패
- 404: 해당 id 없음

### PATCH /api/words/:id/toggle
외움 상태를 토글한다 (body 불필요).

응답:
- 200: 갱신된 Word 객체
- 404: 해당 id 없음

### DELETE /api/words/:id
항목을 삭제한다.

응답:
- 204: 삭제 성공 (본문 없음)
- 404: 해당 id 없음

## 설계 노트

- 입력 검증(빈 값/공백 방지)과 중복 처리(force 플래그) 등 비즈니스 규칙은 라우터 계층에서 처리하고, Repository는 순수 데이터 액세스만 담당하도록 계층을 분리했다.
- CORS는 프론트엔드 개발 서버(`http://localhost:5173`)만 허용하도록 제한했다.
- 공통 에러 핸들러로 예기치 못한 예외를 500으로 처리하고 콘솔에 로그를 남긴다.

## 테스트 커버리지

`node --test` 기반, 각 테스트마다 임시 HTTP 서버(임의 포트) + in-memory DB를 새로 띄워 격리:
- 목록 조회(빈 상태/정렬), 생성(성공/검증실패/중복409/force강제추가), 수정(성공/404), 토글(성공/404), 삭제(성공/404)
