# Build Instructions - tauri-app

## Prerequisites
- **Rust**: stable toolchain (rustup 권장) — 이 세션에서 1.98.0 설치/검증됨
- **Node.js**: 18 이상 — 이 세션에서 v24.20.0 사용
- **Linux(Ubuntu/Debian) 시스템 의존성**:
  ```bash
  sudo apt update
  sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file \
    libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev xdg-utils
  ```
  (`xdg-utils`는 AppImage 번들링에 필요 — 이 세션에서 최초 빌드 시 누락되어 추가 설치함)
- **Windows/macOS**: https://tauri.app/start/prerequisites/ (이 세션에서는 미검증, 아래 참고)

## Build Steps

### 1. Install Dependencies
```bash
cd tauri-app
npm install
```
> Rust 의존성(`Cargo.toml`)은 `cargo build`/`npm run tauri build` 시 자동으로 다운로드됩니다.

### 2. Configure Environment
별도 환경변수 불필요. `tauri.conf.json`의 `identifier`(`com.wordbook.app`)가 앱 데이터 디렉토리 이름을 결정합니다.

### 3. Build All Units

**개발 모드** (GUI 필요, 헤드리스 환경에서는 실행 불가):
```bash
npm run tauri dev
```

**프로덕션 빌드** (Linux):
```bash
npm run tauri build
```

### 4. Verify Build Success
- **Expected Output**: `Finished 1 bundle at: .../target/release/bundle/...`
- **Build Artifacts** (Linux):
  - `src-tauri/target/release/bundle/deb/*.deb`
  - `src-tauri/target/release/bundle/rpm/*.rpm`
  - `src-tauri/target/release/bundle/appimage/*.AppImage`
- **Common Warnings**: npm audit 취약점 경고(devDependencies 대상, 로컬 앱이라 낮은 우선순위)

## Troubleshooting

### "xdg-open binary not found" (AppImage 빌드 실패)
- **Cause**: `xdg-utils` 패키지 미설치
- **Solution**: `sudo apt install xdg-utils` 후 `npm run tauri build -- --bundles appimage`로 재시도 (다른 번들은 이미 성공했으므로 해당 타겟만 재실행 가능)

### Rust 컴파일 오류 (webkit2gtk 관련)
- **Cause**: 시스템 의존성 미설치
- **Solution**: 위 Prerequisites의 apt install 명령 실행

### 빌드가 매우 느림 (첫 빌드 시 4~5분)
- **Cause**: Rust는 최초 빌드 시 모든 의존성을 컴파일함 (정상 동작)
- **Solution**: 이후 빌드는 캐시로 인해 빠름. CI에서는 `actions/cache`로 `~/.cargo`, `target/` 캐싱 권장 (현재 워크플로우에는 미포함 — 단순성 우선)
