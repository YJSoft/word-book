# Logical Components - tauri-app

## Component: DB Connection State
- **Type**: Tauri Managed State (`State<Mutex<Connection>>`)
- **Purpose**: 앱 전역에서 단일 SQLite 커넥션을 안전하게 공유
- **Lifecycle**: 앱 시작(`setup` 훅)에서 초기화 및 스키마 생성, 앱 종료까지 유지
- **Integration**: 모든 Tauri 커맨드가 `tauri::State<'_, Mutex<Connection>>` 파라미터로 주입받아 사용

## Component: Tauri Commands (IPC Layer)
- **Type**: `#[tauri::command]` 함수 5개
- **Purpose**: frontend의 `invoke()` 호출을 받아 repository 계층 함수를 호출하고 결과를 `Result<T, String>`으로 반환
- **Commands**: `get_words`, `add_word`, `update_word`, `toggle_word`, `delete_word`
- **Integration**: `tauri::generate_handler![...]`로 앱 빌더에 등록

## Component: Repository Layer (Rust)
- **Type**: 순수 함수 모듈 (`repository.rs`)
- **Purpose**: rusqlite를 이용한 CRUD 쿼리 실행 (v1의 `wordRepository.js`에 대응)
- **Integration**: Tauri 커맨드에서 호출, DB 커넥션은 파라미터로 전달받음

## Component: DB Initialization
- **Type**: 모듈 (`db.rs`)
- **Purpose**: `app_data_dir()` 경로 계산, 디렉토리 생성, 커넥션 오픈, 스키마 마이그레이션(`CREATE TABLE IF NOT EXISTS`)
- **Integration**: 앱 `setup()` 훅에서 1회 호출되어 `Connection`을 생성 후 `app.manage()`로 등록

## 인프라 컴포넌트 (해당 없음)
- 큐, 캐시, 서킷브레이커, 로드밸런서: **N/A** (단일 프로세스 로컬 앱)

## CI 로지컬 컴포넌트
- **build workflow**: GitHub Actions job (3-OS 매트릭스) — Rust/Node 툴체인 설치 → 의존성 설치 → `tauri build` 실행
- **release workflow**: build workflow와 동일 구조 + GitHub Release 아티팩트 업로드 스텝
