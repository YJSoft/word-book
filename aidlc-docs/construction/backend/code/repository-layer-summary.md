# Backend - Repository Layer Summary

## 생성된 파일

- `backend/src/db/database.js` - SQLite 연결 초기화 및 `words` 테이블 스키마 생성
- `backend/src/repositories/wordRepository.js` - `words` 테이블에 대한 CRUD 데이터 액세스 함수
- `backend/test/wordRepository.test.js` - Repository 계층 단위 테스트 (in-memory SQLite 사용)

## 주요 함수 (wordRepository.js)

| 함수 | 설명 |
|---|---|
| `getAllWords(db)` | 전체 목록 조회, 최근 추가순(`created_at DESC`) 정렬 |
| `findByWord(db, word)` | 정확히 일치하는 단어 검색 (중복 체크용) |
| `findById(db, id)` | id로 단일 항목 조회 |
| `createWord(db, {word, definition})` | 신규 항목 생성 (memorized 기본값 false) |
| `updateWord(db, id, {word, definition})` | 기존 항목 수정, 없으면 `null` 반환 |
| `toggleMemorized(db, id)` | 외움 상태 토글, 없으면 `null` 반환 |
| `deleteWord(db, id)` | 항목 삭제, 성공 시 `true` / 대상 없으면 `false` 반환 |

## 설계 노트

- `node:sqlite`의 `DatabaseSync`를 사용 (네이티브 컴파일 불필요, Node 내장 모듈).
- `database.js`는 `data/` 디렉토리가 없으면 자동 생성하고, 파일 경로는 `initDatabase()`에 인자로 전달 가능 (테스트 시 `:memory:` 사용).
- Repository는 순수 데이터 액세스만 담당하며, 입력 검증(빈 값, 중복 처리 등 비즈니스 로직)은 API 라우터 계층에서 처리한다.

## 테스트 커버리지

`node --test` 기반, in-memory DB로 각 테스트가 독립적으로 격리됨:
- 생성, 조회(전체/단건), 정렬 순서, 중복 검색, 수정(성공/대상없음), 토글(성공/대상없음), 삭제(성공/대상없음)
