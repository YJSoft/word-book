# Tech Stack Decisions - tauri-app

| 결정 | 선택 | 대안 검토 | 근거 |
|---|---|---|---|
| Desktop 프레임워크 | Tauri v2 | Electron | 사용자가 명시적으로 Tauri v2 요청, Rust 기반으로 더 작은 바이너리/낮은 메모리 사용 |
| Backend 언어 | Rust | Node.js 유지 | 사용자가 명시적으로 Rust 포팅 요청 |
| IPC 방식 | Tauri `#[tauri::command]` + `invoke()` | 로컬 HTTP 서버(Axum 등) | tauri-requirements.md Q1 결정(별도 서버 프로세스 없는 완전 네이티브 앱) |
| DB 드라이버 | `rusqlite` (bundled) | Tauri SQL 플러그인(sqlx) | tauri-requirements.md Q2 결정(기존 backend 계층 구조와 유사하게 Rust 커맨드에서 직접 제어) |
| Frontend 프레임워크 | React + Vite | Svelte, Vue (Tauri 공식 템플릿에서 흔히 사용) | 기존 팀 숙련도(v1도 React), 요구사항에 프레임워크 변경 언급 없음 |
| 직렬화 | `serde` + `serde_json` | 수동 파싱 | Rust ↔ JS 간 구조체 자동 직렬화, Tauri 표준 관례 |
| 에러 전달 | `Result<T, String>` | 구조화된 에러 객체(`{code, message}`) | NFR Q6 사용자 결정 — 단순성 우선 |
| 스캐폴딩 도구 | `npm create tauri-app@latest` | 수동 구성 | NFR Q1 사용자 결정 — 표준 구조로 시작해 안정성 확보 |
| CI | GitHub Actions, 3-OS 매트릭스 | GitLab CI, CircleCI | 저장소가 GitHub 기준이라고 가정(가장 일반적), NFR Q5 결정으로 release 워크플로우도 포함 |
