# NFR Requirements - tauri-app

## Scalability Requirements
- 단일 사용자 로컬 데스크톱 앱 — 확장성 요구사항 없음 (v1과 동일한 전제)

## Performance Requirements
- 명시적 성능 목표 없음. Tauri/Rust 특성상 Node.js 대비 낮은 메모리 사용량과 빠른 기동 시간이 기대되나 별도 벤치마크는 수행하지 않음

## Availability Requirements
- 로컬 데스크톱 앱 — 가동률/장애복구 개념 해당 없음

## Security Requirements
- Security Baseline 확장 비활성화 유지 (v1과 동일 결정)
- Tauri의 기본 CSP(Content Security Policy) 및 IPC 권한 모델(allowlist)은 기본값 사용

## Tech Stack Selection
| 영역 | 선택 | 근거 |
|---|---|---|
| 프로젝트 스캐폴딩 | `npm create tauri-app@latest` (React+TypeScript 템플릿 또는 JS) | 공식 도구로 표준 구조 확보 |
| Rust 코드 구조 | `commands.rs` + `repository.rs` + `db.rs` 계층 분리 | v1 backend(routes/repositories/db)와 대응, 마이그레이션 명확성 |
| DB 드라이버 | `rusqlite` (bundled feature) | 네이티브 SQLite 바인딩, 별도 시스템 SQLite 설치 불필요 |
| 에러 처리 | 커맨드 반환 `Result<T, String>` | 단순하고 명확한 IPC 에러 전달, frontend에서 문자열 그대로 표시 |
| Frontend 프레임워크 | React + Vite (v1과 동일 라이브러리, 컴포넌트는 새로 작성) | 팀의 기존 React 숙련도 활용 |

## Reliability Requirements
- Rust의 타입 시스템과 `Result` 기반 에러 처리로 컴파일 타임 안전성 확보
- panic 발생 시 Tauri 프로세스 전체가 종료될 수 있으므로, DB 작업은 `Result`로 감싸 unwrap/panic 최소화

## Maintainability Requirements
- **테스트**: Rust 측 `#[cfg(test)]` 단위 테스트(repository 계층), frontend Vitest 테스트(v1과 유사 커버리지)
- **CI**: `.github/workflows/`에 두 워크플로우 작성
  - `build.yml`: push/PR 시 3-OS(ubuntu-latest, windows-latest, macos-latest) 매트릭스 빌드 (실행 미검증, 파일만 준비)
  - `release.yml`: 태그(`v*`) push 시 3-OS 빌드 + 릴리스 아티팩트 업로드 (실행 미검증)
- **문서화**: JSDoc/Rust doc comment 유지 (v1 스타일 일관성)

## Usability Requirements
- v1과 동일한 UX 흐름 (추가/중복확인/목록/수정/삭제확인/토글) — 데스크톱 네이티브 창으로 실행되는 점만 차이

## 검증 범위 (이번 세션)
- **실제 실행**: `npm run tauri build` (Linux, 헤드리스 VM 특성상 `tauri dev`의 GUI 모드는 제외)
- **미검증(설정만)**: Windows/macOS 빌드, GitHub Actions 워크플로우 실제 트리거
