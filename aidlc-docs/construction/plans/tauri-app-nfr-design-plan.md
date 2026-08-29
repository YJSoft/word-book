# NFR Design 질문 (tauri-app 유닛)

로컬 단일사용자 데스크톱 앱이라 대부분의 리질리언스/스케일링 패턴은 해당 없음(N/A)으로 판단됩니다. 핵심 설계 결정만 확인합니다.

## Question 1
Rust 측에서 SQLite 커넥션을 어떻게 관리할까요? (Tauri는 앱 전역 상태를 관리하는 `State` 메커니즘을 제공합니다)

A) Tauri `State<Mutex<Connection>>`로 앱 전역에 커넥션 1개를 관리 (모든 커맨드가 같은 커넥션 공유, Mutex로 동시 접근 직렬화)

B) 커맨드 호출마다 새 커넥션을 열고 닫음 (매번 파일 열기/닫기)

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
DB 파일 저장 위치는 어떻게 결정할까요?

A) Tauri의 `app_data_dir()` API로 OS별 표준 앱 데이터 경로 사용 (Linux: `~/.local/share/`, Windows: `%APPDATA%`, macOS: `~/Library/Application Support/`) — 앱 식별자(예: `com.wordbook.app`) 하위에 `wordbook.db` 저장

B) 항상 실행 파일과 같은 디렉토리에 저장 (포터블 방식)

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
Tauri 커맨드 5개(get_words, add_word, update_word, toggle_word, delete_word)의 동시성 처리 패턴은?

A) 모든 커맨드를 `async fn`으로 선언하되 내부에서 Mutex 락으로 DB 접근 직렬화 (Tauri 기본 비동기 런타임과 자연스럽게 통합)

B) 동기 함수로 선언 (단일 사용자 앱이라 동시 요청 충돌 가능성 매우 낮음)

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
CI 워크플로우(`build.yml`)의 job 구조는?

A) 단일 job에 `strategy.matrix.os: [ubuntu-latest, windows-latest, macos-latest]`로 3-OS 동시 실행 (Tauri 공식 CI 예제 패턴)

B) 3개의 독립된 job을 각 OS별로 명시적으로 작성

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Resilience/Scalability Patterns 평가 (N/A 판단)
- **Resilience Patterns**: N/A — 단일 프로세스 로컬 앱, 외부 장애 지점 없음 (재시도/서킷브레이커 불필요)
- **Scalability Patterns**: N/A — 단일 사용자, 스케일링 개념 없음
- **Performance Patterns**: N/A — 별도 캐싱/최적화 패턴 불필요 (SQLite 직접 접근으로 충분)
- **Logical Components (큐/캐시 등)**: N/A — 해당 없음, DB 커넥션 상태관리(Question 1)가 유일한 로직 컴포넌트
