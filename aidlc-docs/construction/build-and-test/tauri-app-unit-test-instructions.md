# Unit Test Execution - tauri-app

## Run Unit Tests

### 1. Execute All Unit Tests

**Rust** (`cargo test`):
```bash
cd tauri-app/src-tauri
cargo test
```

**Frontend** (Vitest):
```bash
cd tauri-app
npm test
```

### 2. Review Test Results

- **Rust Expected**: 9 tests pass, 0 failures
  - `repository.rs` 내 `#[cfg(test)] mod tests` — create/get_all/find_by_word/update/toggle/delete 각각 성공+실패(대상없음) 케이스
- **Frontend Expected**: 25 tests pass, 0 failures
  - `wordsApi.test.js` (7개) — invoke 호출 검증, ApiError 코드 파싱
  - `WordForm.test.jsx` (5개), `WordItem.test.jsx` (5개), `App.test.jsx` (8개)
- **Test Report Location**: 콘솔 출력 (`cargo test` 기본 출력, Vitest 기본 출력)

### 3. Fix Failing Tests
1. 콘솔 출력에서 실패한 테스트명과 assertion 오류 확인
2. `src-tauri/src/` 또는 `src/` 해당 파일에서 원인 파악
3. 수정 후 재실행

## 실제 실행 결과 (검증됨, Ubuntu 24.04, Rust 1.98.0, Node v24.20.0)
- Rust: **9/9 통과**
- Frontend: **25/25 통과** (1건 버그 수정: `wordsApi.js`의 `callCommand`가 `args=undefined`일 때 `invoke(command, undefined)`를 호출하던 것을 `invoke(command)`로 수정)
