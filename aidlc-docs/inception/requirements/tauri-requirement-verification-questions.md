# Requirements 확인 질문 (Word Book - Tauri v2 포팅)

기존 웹 앱(React SPA + Express + SQLite)을 Tauri v2 데스크톱 앱(멀티플랫폼, Rust 백엔드)으로 전환하는 작업입니다. 아키텍처 전환 범위가 커서, 진행 전에 핵심 결정을 확인하겠습니다.

## Question 1
"Node.js 백엔드를 Rust로 포팅"이라 하셨는데, 이는 다음 중 어떤 형태를 의미하나요?

A) Tauri의 Rust 커맨드(`#[tauri::command]`)로 백엔드 로직을 재작성 — frontend가 HTTP 대신 Tauri IPC(`invoke`)로 Rust 함수를 직접 호출 (독립 실행형 데스크톱 앱, 별도 서버 프로세스 없음)

B) Rust로 별도의 로컬 HTTP 서버(예: Axum/Actix)를 계속 유지하고, Tauri 앱이 이를 localhost로 호출 (기존 클라이언트-서버 구조를 언어만 교체)

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
데이터 저장은 어떻게 할까요? (Tauri v2는 공식 SQL 플러그인으로 SQLite/sqlx를 지원합니다)

A) Tauri 공식 SQL 플러그인(`@tauri-apps/plugin-sql`, sqlx 기반) 사용 — frontend에서 JS API로 직접 쿼리, Rust 커맨드 최소화

B) Rust 커맨드 내에서 `rusqlite` 등으로 직접 SQLite 제어 — frontend는 여전히 `invoke()`로 커맨드만 호출 (기존 backend의 계층 구조와 유사)

C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 3
기존 frontend(React 컴포넌트, App.jsx 상태관리, 테스트)를 최대한 재사용할까요, 새로 작성할까요?

A) 최대한 재사용 — API 클라이언트 계층(`wordsApi.js`)만 `fetch` 대신 Tauri `invoke()` 호출로 교체, 컴포넌트/상태관리 로직은 거의 그대로 유지

B) 새로 작성 — Tauri 생태계 관례에 맞춰 컴포넌트 구조도 재설계

C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 4
기존 웹 버전(backend/frontend 분리 실행, .deb 배포)은 계속 유지할까요, Tauri 버전으로 완전히 대체할까요?

A) 웹 버전 유지 + Tauri 버전 신규 추가 (두 가지 배포 형태 병행, 코드는 최대한 공유)

B) Tauri 버전으로 완전 대체 (기존 backend/frontend/packaging은 더 이상 유지하지 않음, 다만 코드는 삭제하지 않고 보존)

C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 5
기능 범위는 기존과 동일한가요, 추가/변경되는 기능이 있나요?

A) 기능 동일 — 단어 추가(중복확인)/목록/수정/삭제(확인)/외움토글, 원래 requirements.md의 FR-1~FR-6 그대로

B) 추가 기능 있음 (아래 Other에 명시)

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
멀티플랫폼(Windows/Linux/macOS) 빌드는 이 워크플로우에서 어느 수준까지 다룰까요? (실제 크로스 컴파일에는 각 OS별 빌드 환경이나 CI가 필요한 경우가 많습니다)

A) 빌드 스크립트/설정(tauri.conf.json, GitHub Actions 등 CI 정의)까지 준비하되, 실제 3개 OS 전체에서의 빌드 실행/검증은 이 로컬 Linux VM에서 가능한 범위(Linux 타겟)로 한정

B) 이 세션에서는 Linux(Ubuntu)만 실제 빌드/검증하고, Windows/macOS는 코드/설정만 준비 (교차 컴파일 시도 안 함)

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
기존 .deb 패키징(systemd 서비스 방식)은 Tauri 버전에도 필요한가요?

A) 필요 — Tauri 앱도 Linux용 `.deb`로 패키징 (Tauri는 기본적으로 `.deb`/`.AppImage`/`.rpm` 빌드를 지원함)

B) 불필요 — 이번 범위에서는 Tauri 앱 실행/테스트까지만, 패키징은 별도 후속 작업으로 분리

C) Other (please describe after [Answer]: tag below)

[Answer]: A
