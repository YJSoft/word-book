# API Documentation

## REST APIs

### GET /api/words
- **Method**: GET
- **Path**: `/api/words`
- **Purpose**: 전체 단어 목록 조회 (최근 추가순)
- **Request**: 없음
- **Response**: `200` — `Word[]`

### POST /api/words
- **Method**: POST
- **Path**: `/api/words`
- **Purpose**: 새 단어 추가
- **Request**: `{ word: string, definition: string, force?: boolean }`
- **Response**: `201` (생성됨) / `400` (검증 실패) / `409` (중복, force 없음 — `{error, code: 'DUPLICATE_WORD', existing}`)

### PUT /api/words/:id
- **Method**: PUT
- **Path**: `/api/words/:id`
- **Purpose**: 기존 단어 수정
- **Request**: `{ word: string, definition: string }`
- **Response**: `200` (수정됨) / `400` / `404`

### PATCH /api/words/:id/toggle
- **Method**: PATCH
- **Path**: `/api/words/:id/toggle`
- **Purpose**: 외움 상태 토글
- **Request**: 없음
- **Response**: `200` (토글됨) / `404`

### DELETE /api/words/:id
- **Method**: DELETE
- **Path**: `/api/words/:id`
- **Purpose**: 단어 삭제
- **Request**: 없음
- **Response**: `204` / `404`

### GET /health
- **Method**: GET
- **Path**: `/health`
- **Purpose**: 헬스체크
- **Response**: `200` — `{status: "ok"}`

## Internal APIs (Repository Layer)

### wordRepository.js
- `getAllWords(db)` → `Word[]`
- `findByWord(db, word)` → `Word | null`
- `findById(db, id)` → `Word | null`
- `createWord(db, {word, definition})` → `Word`
- `updateWord(db, id, {word, definition})` → `Word | null`
- `toggleMemorized(db, id)` → `Word | null`
- `deleteWord(db, id)` → `boolean`

## Data Models

### Word
- **Fields**:
  - `id: number` — PK, autoincrement
  - `word: string` — 필수, 공백 불가
  - `definition: string` — 필수, 공백 불가
  - `memorized: boolean` — 기본값 false
  - `createdAt: string` — ISO timestamp (DB 컬럼명 `created_at`)
- **Relationships**: 없음 (단일 테이블)
- **Validation**: word/definition 빈 값(공백만 있는 경우 포함) 방지, word 중복 시 기본 차단(force로 우회 가능)
