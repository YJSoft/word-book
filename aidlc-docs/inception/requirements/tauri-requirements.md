# Requirements: Word Book - Tauri v2 Desktop Port

## Intent Analysis Summary
- **User Request**: 기존 웹 프론트엔드를 Tauri v2로 포팅, Node.js 백엔드를 Rust로 포팅 및 Tauri v2 연동, 멀티플랫폼(Windows/Linux-Ubuntu/macOS) 지원
- **Request Type**: Migration (아키텍처 전환) — Brownfield
- **Scope Estimate**: System-wide (기존 backend+frontend 전체를 새 기술 스택으로 재작성)
- **Complexity Estimate**: Complex (언어 전환 Node.js→Rust, 아키텍처 전환 HTTP client-server→IPC 단일프로세스, 멀티플랫폼 빌드 고려)

## 확정된 아키텍처 결정 (사용자 답변 기반)

| 결정 항목 | 선택 | 근거 |
|---|---|---|
| Backend 형태 | Rust 커맨드(`#[tauri::command]`) + Tauri IPC | 별도 서버 프로세스 없는 완전한 네이티브 데스크톱 앱 |
| DB 접근 방식 | Rust 커맨드 내 `rusqlite` 직접 제어 | 기존 backend의 routes→repository→db 계층 구조를 Rust로 대응 가능 |
| Frontend 재사용 | 새로 작성 | 기존 웹 버전은 완전 대체 대상이므로 재사용 압박 없음, Tauri 관례에 맞게 재설계 |
| 웹 버전(v1) 처리 | 완전 대체 — 유지보수 대상에서 제외, 코드는 저장소에 보존(삭제 안 함) |
| 기능 범위 | 기존과 동일 (FR-1~FR-6, requirements.md 그대로) |
| 멀티플랫폼 빌드 실행 범위 | 실제 빌드/검증은 Linux(Ubuntu, 이 VM)로 한정. Windows/macOS는 설정+CI 파일까지 준비, 실행 검증은 이 세션에서 불가 |
| CI | GitHub Actions 워크플로우 파일(`.github/workflows/`) 작성 — 3개 OS 매트릭스, 실제 트리거/실행은 GitHub 저장소 필요로 이 세션에서 검증 불가 |
| Linux 패키징 | `.deb` 패키징 필요 (Tauri 기본 bundler로 생성) |

## 기능 요구사항 (기존과 동일, Rust/Tauri로 재구현)

### FR-T1. 단어 추가
- 단어(word)+뜻(definition) 입력, 필수값 검증(공백만 있는 값 방지)
- 중복 단어는 기본적으로 차단, 사용자 확인 후 강제 추가 가능

### FR-T2. 단어 목록 보기
- 최근 추가한 것이 먼저 오는 순서로 전체 목록 표시

### FR-T3. 단어 수정
- 기존 단어/뜻 갱신, 동일한 빈 값 검증 적용

### FR-T4. 단어 삭제
- 삭제 전 확인 다이얼로그, 확인 시에만 실제 삭제

### FR-T5. 외움 체크
- 항목별 외움/안외움 상태 토글

### FR-T6. 로컬 영구 저장
- SQLite(`rusqlite`)로 앱 재시작/OS 재부팅 후에도 데이터 유지
- 저장 위치: Tauri의 OS별 앱 데이터 디렉토리 표준 경로 사용 (`tauri::api::path::app_data_dir()` 등, 플랫폼별로 자동 결정)

## 비기능 요구사항

### NFR-T1. 플랫폼 지원
- **실제 빌드/실행/테스트 검증**: Linux (Ubuntu, 이 VM)
- **코드/설정 준비만**: Windows, macOS (Tauri의 크로스플랫폼 특성상 대부분 코드는 공유되나, 실제 OS별 빌드 실행은 각 OS 환경 필요 — 이 세션에서 검증 불가함을 명확히 인지)

### NFR-T2. IPC 통신
- frontend(TypeScript/JS)와 Rust 커맨드 간 통신은 Tauri의 `invoke()` API 사용
- 기존 REST API의 5개 엔드포인트에 대응하는 5개 Tauri 커맨드로 재구현: `get_words`, `add_word`, `update_word`, `toggle_word`, `delete_word`

### NFR-T3. 데이터 마이그레이션
- v1(웹 버전)과 v2(Tauri) 간 데이터 자동 마이그레이션은 범위 밖 (완전 별도 앱으로 취급, v1의 `data/wordbook.db`와 v2의 앱 데이터는 독립적)

### NFR-T4. 확장 규칙
- 기존 v1 결정과 동일하게 Security/Resiliency/Property-Based Testing 확장 모두 비활성화 유지 (개인용 로컬 앱 특성 변화 없음)

## 기술 스택

| 영역 | v1 (웹) | v2 (Tauri) |
|---|---|---|
| Frontend UI | React 18 + Vite | React 18 + Vite (Tauri 프론트엔드로 재사용되는 빌드 파이프라인, 컴포넌트는 새로 작성) |
| Backend 로직 | Node.js + Express | Rust + Tauri v2 커맨드 |
| DB 드라이버 | `node:sqlite` | `rusqlite` |
| IPC/통신 | HTTP REST (fetch) | Tauri IPC (`invoke`) |
| 패키징 | `.deb` (systemd 서비스) | Tauri bundler (`.deb`/`.AppImage` 등, Linux 실제 검증) + Windows/macOS 설정 준비 |
| CI | 없음 | GitHub Actions (`.github/workflows/`), 3-OS 매트릭스 (파일 준비만, 실행 미검증) |

## 데이터 모델 (기존과 동일)

```
{
  id: 정수 (PK, autoincrement),
  word: string (필수, 공백 불가),
  definition: string (필수, 공백 불가),
  memorized: boolean (기본값 false),
  createdAt: string (ISO timestamp)
}
```

## 산출물 구조

- **신규 유닛**: `tauri-app/` — Tauri v2 프로젝트 (Rust 백엔드 `src-tauri/` + React frontend `src/`)
- **기존 유닛 처리**: `backend/`, `frontend/`, `packaging/`(v1) — 코드는 보존, 신규 개발/유지보수 대상에서 제외
- **신규 문서**: `.github/workflows/tauri-build.yml` (또는 유사) — 3-OS 빌드 매트릭스

## 요약

기존 웹 앱(v1)을 완전히 대체하는 새로운 Tauri v2 데스크톱 앱(v2)을 별도 유닛(`tauri-app/`)으로 신규 개발합니다. Rust 커맨드 + `rusqlite`로 백엔드 로직을 재구현하고, frontend는 Tauri 관례에 맞춰 새로 작성하되 기능 범위(FR-T1~FR-T6)는 v1과 동일합니다. 실제 빌드/실행 검증은 이 Linux VM에서만 가능하며, Windows/macOS는 CI 워크플로우 파일과 빌드 설정까지만 준비하고 실행 검증은 하지 않습니다. v1 코드는 삭제하지 않고 저장소에 보존합니다.
