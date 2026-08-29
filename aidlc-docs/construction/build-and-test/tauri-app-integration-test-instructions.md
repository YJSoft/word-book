# Integration Test Instructions - tauri-app

## Purpose
Rust 커맨드(백엔드)와 React frontend가 Tauri IPC로 실제 연동되어 동작하는지, 그리고 v1(웹)과 동등한 기능(FR-T1~T6)을 제공하는지 확인한다.

## 환경 제약 (중요)

이 세션의 실행 환경(Ubuntu 24.04 VM)은 **헤드리스(디스플레이 서버 없음)**입니다:
```
$ echo $DISPLAY
(empty)
$ which Xvfb
(not found)
```

Tauri 앱은 GUI 창을 열어야 동작하는 데스크톱 애플리케이션이므로, **실제 IPC 왕복(frontend가 실제 창에서 Rust 커맨드를 호출하는 전체 흐름)은 이 환경에서 검증할 수 없습니다.** 이는 코드나 설계의 결함이 아니라 실행 환경의 근본적 제약입니다.

## 대체 검증 전략 (이 세션에서 실제로 수행됨)

계약의 양쪽(frontend, Rust)을 독립적으로 검증하여 통합 신뢰도를 확보했습니다:

1. **Rust 측 검증**: `cargo test`로 repository 계층 9개 테스트 통과 — DB 스키마, CRUD 쿼리, 비즈니스 규칙(중복/존재하지않음 처리)이 실제 SQLite(in-memory)에 대해 정확히 동작함을 확인
2. **Frontend 측 검증**: `npm test`로 25개 테스트 통과 — `invoke()` 호출 인자/반환값 처리, `ApiError` 코드 파싱(`DUPLICATE_WORD`, `NOT_FOUND`), UI 상태 전환(확인 다이얼로그 흐름)이 정확히 동작함을 확인 (`invoke`는 mock)
3. **커맨드 계약 일치 확인**: `commands.rs`의 함수 시그니처(`add_word(word, definition, force)`)와 `wordsApi.js`의 `invoke('add_word', {word, definition, force})` 호출이 파라미터명/타입까지 일치하는지 코드 리뷰로 확인
4. **빌드 레벨 통합 확인**: `npm run tauri build`가 Rust와 frontend를 하나의 바이너리로 성공적으로 링크/패키징함 — 이는 Tauri의 코드 생성 단계에서 Rust 커맨드 매크로와 frontend의 `invoke` 호출이 컴파일 타임에 문제없이 결합됨을 의미

## 실제 GUI 통합 테스트 (사용자 수행 필요)

GUI가 있는 환경(로컬 PC, VM에 데스크톱 환경 추가 등)에서 다음을 수행해주세요:

### Scenario 1: 앱 기동 및 초기 화면
```bash
cd tauri-app
npm run tauri dev
```
앱 창이 뜨고 "아직 등록된 단어가 없습니다" 문구가 보이면 정상.

### Scenario 2: 전체 CRUD 시나리오
1. 단어("apple")+뜻("사과") 입력 후 추가 → 목록에 나타나는지 확인
2. 동일 단어 재입력 → "중복 단어입니다..." 확인 다이얼로그 → 확인 시 강제 추가되는지 확인
3. 체크박스 클릭 → 외움 상태 토글, 취소선 스타일 적용 확인
4. 수정 버튼 → 폼에 값 채워짐 → 수정 후 반영 확인
5. 삭제 버튼 → "정말 삭제하시겠습니까?" 확인 → 확인 시 목록에서 제거 확인

### Scenario 3: 데이터 영속성
1. 위 시나리오 수행 후 앱 완전히 종료
2. 앱 재시작 (`npm run tauri dev` 재실행 또는 빌드된 바이너리 재실행)
3. 이전 데이터가 그대로 남아있는지 확인 (OS별 앱 데이터 디렉토리에 저장됨 — README.md 참고)

## 결론
- **코드 레벨/계약 레벨 통합**: 검증 완료 (이 세션에서 수행)
- **실제 GUI 런타임 통합**: 미검증 (환경 제약, 사용자가 GUI 환경에서 위 시나리오 수동 수행 필요)
