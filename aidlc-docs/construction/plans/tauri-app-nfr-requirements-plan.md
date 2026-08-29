# NFR Requirements 질문 (tauri-app 유닛)

tauri-execution-plan.md에서 이미 확정된 사항(Rust 커맨드+IPC, rusqlite, Linux만 실제검증, CI 파일 작성)을 기반으로, 구체적인 기술/빌드 설계를 위한 질문입니다.

## Question 1
Tauri 프로젝트 구조를 어떻게 생성할까요?

A) `npm create tauri-app@latest`로 공식 스캐폴딩 생성 후, 기존 요구사항(FR-T1~T6)에 맞게 커스터마이징

B) 수동으로 `Cargo.toml`, `tauri.conf.json` 등을 직접 작성 (스캐폴딩 도구 사용 안 함)

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
Rust 측 코드 구조는 기존 backend(routes→repositories→db)와 유사하게 모듈을 나눌까요?

A) 예 — `commands.rs`(Tauri 커맨드 5개) + `repository.rs`(rusqlite CRUD 함수) + `db.rs`(연결/스키마 초기화)로 backend와 대응되는 구조 유지

B) 단일 파일(`lib.rs` 또는 `main.rs`)에 모두 작성 (소규모 프로젝트이므로 분리 불필요)

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
Rust 코드의 테스트는 어느 수준까지 작성할까요?

A) `#[cfg(test)]` 단위 테스트로 repository 함수들 검증 (in-memory SQLite, 기존 backend의 wordRepository.test.js와 동등한 커버리지)

B) 테스트 작성하지 않음 (프로토타입 수준)

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
frontend(새로 작성)의 테스트는 어느 수준까지 작성할까요?

A) Vitest + Testing Library로 컴포넌트/통합 테스트 작성 (`invoke` mock 사용), 기존 v1 frontend 테스트와 유사한 커버리지 목표

B) 테스트 작성하지 않음

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
GitHub Actions CI 워크플로우의 트리거 조건은 무엇으로 할까요? (파일만 작성, 실제 실행은 검증 안 됨을 이미 확인함)

A) `push`/`pull_request` (main 브랜치 대상) 시 3-OS 매트릭스로 빌드만 수행 (릴리스 아티팩트 업로드 없음)

B) 위 A + 태그 push 시(`v*`) 릴리스 아티팩트(각 OS 설치파일)까지 업로드하는 release 워크플로우 추가

C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 6
Rust 진영의 에러 처리 방식은?

A) 커맨드 반환 타입을 `Result<T, String>`으로 통일 — 에러 메시지를 문자열로 frontend에 전달 (frontend에서 그대로 표시), 기존 backend의 에러 메시지 문구(예: "이미 존재하는 단어입니다.") 재사용

B) 커스텀 에러 타입 + `serde`로 구조화된 에러 객체 전달 (`{code, message}` 형태, v1의 `ApiError` 패턴과 유사)

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
빌드 산출물 정리 — 이번 세션에서 실제로 실행할 명령은?

A) `npm run tauri dev`(개발모드 실행 검증) + `npm run tauri build`(Linux `.deb`/AppImage 프로덕션 빌드까지) 모두 실행

B) `npm run tauri build`만 실행 (dev 모드는 GUI 필요로 헤드리스 VM에서 실행 곤란할 수 있음 — 빌드 성공 여부로 검증)

C) Other (please describe after [Answer]: tag below)

[Answer]: B
