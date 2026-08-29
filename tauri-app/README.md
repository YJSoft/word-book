# Word Book - Tauri v2 Desktop App

단어 암기 애플리케이션의 Tauri v2 데스크톱 버전. Rust 백엔드(`rusqlite`) + React frontend, Tauri IPC로 통신하는 완전한 네이티브 데스크톱 앱.

## v1(웹 버전)과의 관계

이 앱은 `../backend/`, `../frontend/`(웹 버전, v1)를 **완전히 대체**하는 신규 데스크톱 앱입니다. v1 코드는 삭제하지 않고 저장소에 보존되지만, 더 이상 유지보수 대상이 아닙니다. 두 버전은 완전히 독립적이며 데이터베이스도 공유하지 않습니다.

| | v1 (웹) | v2 (Tauri, 이 디렉토리) |
|---|---|---|
| Backend | Node.js + Express | Rust + Tauri 커맨드 |
| 통신 | HTTP REST | Tauri IPC (`invoke`) |
| DB 드라이버 | `node:sqlite` | `rusqlite` |
| DB 위치 | `data/wordbook.db` | OS별 앱 데이터 디렉토리 |
| 실행 형태 | 브라우저 + 별도 서버 프로세스 | 단일 네이티브 앱 |

## 요구 사항

- **Rust** (stable, rustup 권장) — https://www.rust-lang.org/tools/install
- **Node.js 18 이상**
- **Linux(Ubuntu/Debian) 시스템 의존성**:
  ```bash
  sudo apt update
  sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file \
    libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
  ```
- **Windows/macOS**: https://tauri.app/start/prerequisites/ 참고 (이 프로젝트에서는 실제 빌드 검증을 하지 않았음 — 아래 "플랫폼 지원 현황" 참고)

## 개발 모드 실행

```bash
cd tauri-app
npm install
npm run tauri dev
```

> **참고**: 이 저장소를 생성한 개발 환경은 헤드리스(GUI 없는) VM이라 `tauri dev`의 실제 창 실행은 검증하지 못했습니다. GUI가 있는 로컬 환경에서 실행해주세요.

## 프로덕션 빌드

```bash
cd tauri-app
npm run tauri build
```

Linux에서는 `src-tauri/target/release/bundle/`에 `.deb`, `.AppImage` 등이 생성됩니다.

## 테스트

```bash
# Rust 단위 테스트
cd tauri-app/src-tauri
cargo test

# Frontend 테스트
cd tauri-app
npm test
```

## 데이터 저장 위치

OS별 표준 앱 데이터 디렉토리 (Tauri `app_data_dir()`):
- **Linux**: `~/.local/share/com.wordbook.app/`
- **Windows**: `%APPDATA%\com.wordbook.app\`
- **macOS**: `~/Library/Application Support/com.wordbook.app/`

## 플랫폼 지원 현황

| 플랫폼 | 코드/설정 준비 | 실제 빌드/실행 검증 |
|---|---|---|
| Linux (Ubuntu 24.04) | ✅ | ✅ (이 세션에서 실행됨) |
| Windows | ✅ (`tauri.conf.json`, CI 워크플로우) | ❌ (환경 없음, 미검증) |
| macOS | ✅ (`tauri.conf.json`, CI 워크플로우) | ❌ (환경 없음, 미검증) |

Windows/macOS는 Tauri의 크로스플랫폼 특성상 대부분 코드가 그대로 동작할 것으로 예상되나, 실제로 해당 OS에서 빌드해보기 전까지는 보장할 수 없습니다. `.github/workflows/build.yml`의 CI가 실제로 트리거되면 3개 OS 모두에서 빌드를 시도합니다.

## API 계약 (Tauri Commands)

| Command | 파라미터 | 반환 | 설명 |
|---|---|---|---|
| `get_words` | - | `Word[]` | 목록 조회 (최근순) |
| `add_word` | `word, definition, force?` | `Word` | 추가 (중복 시 force 없으면 `Err("DUPLICATE_WORD: ...")`) |
| `update_word` | `id, word, definition` | `Word` | 수정 |
| `toggle_word` | `id` | `Word` | 외움 상태 토글 |
| `delete_word` | `id` | `()` | 삭제 |

`Word`: `{ id, word, definition, memorized, createdAt }`

## 디렉토리 구조

```
tauri-app/
├── src-tauri/           # Rust 백엔드
│   ├── src/
│   │   ├── lib.rs       # State 관리, 앱 초기화
│   │   ├── db.rs        # DB 초기화, 경로 계산
│   │   ├── models.rs    # Word struct
│   │   ├── repository.rs # CRUD 함수 + 단위 테스트
│   │   └── commands.rs  # Tauri 커맨드 5개
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                 # React frontend
│   ├── api/wordsApi.js  # invoke 기반 API 클라이언트
│   ├── components/       # WordForm, WordItem, WordList, ConfirmDialog
│   ├── App.jsx
│   └── main.jsx
└── package.json
```
