# tauri-app Unit - Code Generation Plan

## Unit Context

- **Unit Name**: tauri-app
- **Responsibility**: Tauri v2 데스크톱 앱 (Rust 백엔드 + React frontend), v1의 웹 앱을 완전 대체하는 신규 데스크톱 앱
- **Requirements Covered**: FR-T1~FR-T6 (tauri-requirements.md)
- **Dependencies**: 없음 (v1 backend/frontend와 코드 공유 없음, 독립 유닛)
- **Workspace Root**: `/workshop/word-book`
- **Code Location**: `/workshop/word-book/tauri-app/`
- **Design References**: nfr-requirements.md, tech-stack-decisions.md, nfr-design-patterns.md, logical-components.md

## Rust 측 커맨드 계약 (v1 API와 대응)

| Tauri Command | v1 대응 API | 설명 |
|---|---|---|
| `get_words()` | GET /api/words | 목록 조회 (최근순) |
| `add_word(word, definition, force)` | POST /api/words | 추가 (중복 시 force 없으면 Err) |
| `update_word(id, word, definition)` | PUT /api/words/:id | 수정 |
| `toggle_word(id)` | PATCH /api/words/:id/toggle | 외움 토글 |
| `delete_word(id)` | DELETE /api/words/:id | 삭제 |

모든 커맨드는 `Result<Word, String>` 또는 `Result<Vec<Word>, String>` / `Result<(), String>` 반환.

## 실행 계획

### Step 1: Project Structure Setup
- [x] 1.1 `npm create tauri-app@latest`로 `tauri-app/` 스캐폴딩 생성 (React + JavaScript 템플릿, npm 패키지 매니저)
- [x] 1.2 생성된 구조 확인 및 불필요한 예제 코드 정리

### Step 2: Rust Dependencies 설정
- [x] 2.1 `tauri-app/src-tauri/Cargo.toml`에 `rusqlite`(bundled feature), `serde`, `serde_json` 의존성 추가

### Step 3: DB Layer Generation (Rust)
- [x] 3.1 `tauri-app/src-tauri/src/db.rs` - DB 초기화, `app_data_dir()` 기반 경로 계산, 스키마 생성
- [x] 3.2 `tauri-app/src-tauri/src/models.rs` - `Word` struct (serde Serialize/Deserialize)

### Step 4: Repository Layer Generation (Rust)
- [x] 4.1 `tauri-app/src-tauri/src/repository.rs` - CRUD 함수 (v1 wordRepository.js 대응)

### Step 5: Repository Layer Unit Testing (Rust)
- [x] 5.1 `repository.rs` 내 `#[cfg(test)] mod tests` - in-memory SQLite(`Connection::open_in_memory()`) 기반 단위 테스트

### Step 6: Commands Layer Generation (Rust)
- [x] 6.1 `tauri-app/src-tauri/src/commands.rs` - 5개 Tauri 커맨드, 입력 검증, 중복 처리
- [x] 6.2 `tauri-app/src-tauri/src/lib.rs` - State 등록(`Mutex<Connection>`), `generate_handler!`, setup 훅에서 DB 초기화

### Step 7: Frontend Generation (React, 새로 작성)
- [x] 7.1 `tauri-app/src/api/wordsApi.js` - `invoke()` 기반 API 클라이언트 (v1과 동일한 함수 시그니처 유지: getWords/addWord/updateWord/toggleWord/deleteWord)
- [x] 7.2 `tauri-app/src/components/{WordForm,WordItem,WordList,ConfirmDialog}.jsx` - v1 컴포넌트를 참고하여 새로 작성 (Tauri 환경에 맞게)
- [x] 7.3 `tauri-app/src/App.jsx` - 상태관리 및 조립
- [x] 7.4 `tauri-app/src/index.css`, `main.jsx` 정리

### Step 8: Frontend Unit Testing
- [x] 8.1 `wordsApi.test.js`, `WordForm.test.jsx`, `WordItem.test.jsx`, `App.test.jsx` - Vitest, `@tauri-apps/api/core`의 `invoke` mock

### Step 9: Tauri 설정
- [x] 9.1 `tauri-app/src-tauri/tauri.conf.json` - 앱 identifier, 윈도우 설정, bundle targets(deb, appimage 등 Linux + 참고용 msi/dmg 명시)

### Step 10: CI 워크플로우 생성
- [x] 10.1 `.github/workflows/build.yml` - 3-OS 매트릭스 빌드
- [x] 10.2 `.github/workflows/release.yml` - 태그 트리거 릴리스

### Step 11: 문서화
- [x] 11.1 `tauri-app/README.md` - 설치/개발/빌드 방법, 플랫폼별 참고사항, v1과의 관계 설명

### Step 12: 실제 빌드 검증
- [x] 12.1 `cargo test` (Rust 단위 테스트) 실행 — 9/9 통과 확인
- [x] 12.2 `npm install && npm test` (frontend 테스트) 실행 — 25/25 통과 확인 (1건 수정: callCommand의 undefined args 처리)
- [x] 12.3 `npm run tauri build` (Linux) 실행 및 결과 확인 — .deb(5.0MB), .rpm(5.0MB), .AppImage(75MB) 모두 생성 확인 (AppImage는 xdg-utils 설치 후 재시도하여 성공)

## Story/Requirement Traceability
- FR-T1(추가+중복) → Step 4(repository), 6(commands), 7(frontend)
- FR-T2(목록,최근순) → Step 3~4, 7
- FR-T3(수정) → Step 4, 6, 7
- FR-T4(삭제+확인) → Step 6, 7(ConfirmDialog)
- FR-T5(외움체크) → Step 4, 6, 7
- FR-T6(영구저장) → Step 3(app_data_dir 기반 SQLite)

## 총 단계 수
12개 주요 단계
