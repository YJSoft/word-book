# NFR Design Patterns - tauri-app

## Resilience Patterns
**N/A** — 단일 프로세스 로컬 데스크톱 앱, 외부 네트워크 의존성 없음. 재시도/서킷브레이커/타임아웃 패턴 불필요.

## Scalability Patterns
**N/A** — 단일 사용자 대상, 스케일링 트리거나 용량 계획 개념 해당 없음.

## Performance Patterns
**N/A** — SQLite 직접 접근으로 충분한 성능 확보 (로컬 파일 I/O, 데이터량이 매우 작음). 별도 캐싱 계층 불필요.

## Security Patterns
- Tauri 기본 CSP 사용 (커스터마이징 없음)
- IPC 커맨드는 `#[tauri::command]` 매크로로 명시적으로 노출된 5개 함수로 제한 (allowlist 원칙 자연스럽게 적용됨 — Tauri v2는 기본적으로 명시된 커맨드만 invoke 가능)

## 동시성 패턴 (Concurrency)
- **DB 커넥션 관리**: Tauri `State<Mutex<Connection>>`로 앱 전역 단일 커넥션을 관리. `tauri::Builder::manage()`로 앱 초기화 시 등록.
- **커맨드 시그니처**: 모든 커맨드는 `async fn`으로 선언, 내부에서 `state.lock().unwrap()`(또는 `.await` 가능한 async mutex)으로 DB 접근을 직렬화.
- **근거**: 단일 사용자 앱이라 실제 동시 접근 충돌 가능성은 낮지만, Mutex로 안전성을 명시적으로 보장하고 Tauri의 비동기 런타임과 자연스럽게 통합.

## 데이터 저장 경로 패턴
- `tauri::api::path::app_data_dir()` (Tauri v2에서는 `app.path().app_data_dir()`)로 OS별 표준 경로 획득
- 경로 하위에 앱 식별자 디렉토리가 자동 포함됨 (`tauri.conf.json`의 `identifier` 설정에 따라 결정)
- 디렉토리 존재하지 않으면 앱 시작 시 자동 생성 (v1 backend의 `database.js`와 동일한 패턴)

## CI 설계 패턴
- **build.yml**: 단일 job, `strategy.matrix.os: [ubuntu-latest, windows-latest, macos-latest]`로 3-OS 동시 빌드. Rust/Node 셋업 액션 사용(`actions-rs/toolchain` 또는 `dtolnay/rust-toolchain`, `actions/setup-node`), Tauri 공식 액션(`tauri-apps/tauri-action`) 활용 권장.
- **release.yml**: `on.push.tags: ['v*']` 트리거, build.yml과 동일한 매트릭스 + 빌드 산출물을 GitHub Release에 업로드.
