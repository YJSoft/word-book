# Backend Unit - Code Generation Plan

## Unit Context

- **Unit Name**: backend
- **Responsibility**: 단어 항목에 대한 REST API 및 SQLite 데이터 영속성 제공
- **Requirements Covered**: FR-1(추가/중복처리), FR-2(목록), FR-3(수정), FR-4(삭제), FR-5(외움 체크 토글), FR-6(영구 저장)
- **Dependencies**: 없음 (최하위 계층, frontend가 이 유닛에 의존)
- **Consumers**: frontend 유닛 (HTTP로 API 호출)
- **Workspace Root**: `/workshop/word-book` (aidlc-state.md 기준)
- **Code Location**: `/workshop/word-book/backend/` (Greenfield multi-unit 구조)
- **Data Location**: `/workshop/word-book/data/wordbook.db`

## Database 스키마

테이블 `words`:
| 컬럼 | 타입 | 제약 |
|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| word | TEXT | NOT NULL |
| definition | TEXT | NOT NULL |
| memorized | INTEGER | NOT NULL DEFAULT 0 (0/1 boolean) |
| created_at | TEXT | NOT NULL (ISO timestamp, 정렬용) |

## API 계약 (Backend가 제공하는 인터페이스)

| Method | Path | 설명 | 요청 Body | 응답 |
|---|---|---|---|---|
| GET | /api/words | 전체 단어 목록 (최근 추가순) | - | `Word[]` |
| POST | /api/words | 단어 추가 | `{word, definition, force?}` | `Word` (201) / 409 (중복, force 없을 때) |
| PUT | /api/words/:id | 단어/뜻 수정 | `{word, definition}` | `Word` (200) / 404 |
| PATCH | /api/words/:id/toggle | 외움 상태 토글 | - | `Word` (200) / 404 |
| DELETE | /api/words/:id | 단어 삭제 | - | 204 / 404 |

`Word` 객체: `{ id, word, definition, memorized, createdAt }`

## 실행 계획

### Step 1: Project Structure Setup (Greenfield)
- [x] 1.1 `backend/` 디렉토리 및 하위 구조 생성: `backend/src/`, `backend/src/db/`, `backend/src/routes/`, `backend/src/repositories/`, `backend/test/`
- [x] 1.2 `backend/package.json` 생성 (Express 의존성, `node:sqlite` 사용, type: module, scripts: start/test)
- [x] 1.3 `.gitignore` 생성/갱신 (node_modules, data/*.db 등)

### Step 2: Repository Layer Generation
- [x] 2.1 `backend/src/db/database.js` - SQLite 연결 초기화(`node:sqlite` `DatabaseSync`), `words` 테이블 생성 (없으면), `data/` 디렉토리 자동 생성
- [x] 2.2 `backend/src/repositories/wordRepository.js` - CRUD 함수: `getAllWords`, `findByWord`, `createWord`, `updateWord`, `toggleMemorized`, `deleteWord`

### Step 3: Repository Layer Unit Testing
- [x] 3.1 `backend/test/wordRepository.test.js` - repository 함수별 단위 테스트 (in-memory SQLite 사용, node:test + assert)

### Step 4: Repository Layer Summary
- [x] 4.1 `aidlc-docs/construction/backend/code/repository-layer-summary.md` 작성

### Step 5: Business/API Layer Generation
- [x] 5.1 `backend/src/routes/wordsRouter.js` - Express 라우터: 5개 엔드포인트 구현, 입력 검증(빈 값 방지, trim), 중복 체크 로직(force 플래그 처리), 에러 응답 처리
- [x] 5.2 `backend/src/app.js` - Express 앱 설정 (JSON 미들웨어, CORS 허용 for localhost:5173, 라우터 연결, 에러 핸들러)
- [x] 5.3 `backend/src/server.js` - 서버 기동 엔트리포인트 (포트 4000)

### Step 6: API Layer Unit/Integration Testing
- [x] 6.1 `backend/test/wordsRouter.test.js` - API 레벨 통합 테스트 (supertest 없이 node:http 기반 또는 fetch로 실제 요청, 각 엔드포인트의 성공/실패 케이스, 중복 처리, 검증 실패 케이스)

### Step 7: API Layer Summary
- [x] 7.1 `aidlc-docs/construction/backend/code/api-layer-summary.md` 작성 (엔드포인트 목록, 요청/응답 예시)

### Step 8: Documentation Generation
- [x] 8.1 `backend/README.md` - 설치/실행/테스트 방법, API 문서 링크

## Story/Requirement Traceability
- FR-1 (추가+중복처리) → Step 5.1 (POST /api/words, force 플래그)
- FR-2 (목록, 최근순) → Step 2.2 getAllWords (ORDER BY created_at DESC), Step 5.1 (GET)
- FR-3 (수정) → Step 5.1 (PUT)
- FR-4 (삭제) → Step 5.1 (DELETE)
- FR-5 (외움 체크) → Step 5.1 (PATCH toggle)
- FR-6 (영구 저장) → Step 2.1 (SQLite 파일 기반 저장)

## 총 단계 수
8개 주요 단계, 12개 세부 체크박스
