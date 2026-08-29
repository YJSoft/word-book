# Build Instructions

## Prerequisites
- **Build Tool**: npm (Node.js 패키지 매니저)
- **Runtime**: Node.js v22.5.0 이상 (v24.x 권장 — `node:sqlite`가 experimental 플래그 없이 동작)
- **Dependencies**: `backend/package.json`, `frontend/package.json`에 정의됨 (Express, cors, React, Vite, Vitest 등)
- **Environment Variables**: 없음 (필요 시 backend `PORT` 환경변수로 포트 변경 가능, 기본 4000)
- **System Requirements**: 로컬 개발 머신, 특별한 메모리/디스크 요구사항 없음

## Build Steps

### 1. Install Dependencies

**Backend**:
```bash
cd backend
npm install
```

**Frontend**:
```bash
cd frontend
npm install
```

> **참고**: frontend 설치 시 esbuild의 postinstall 스크립트 승인이 필요할 수 있습니다 (`npm install-scripts approve esbuild`). 이는 npm의 표준 보안 기능이며 esbuild는 잘 알려진 정상 패키지입니다.

### 2. Configure Environment

별도 환경 설정 불필요. backend는 기본적으로 포트 4000, frontend 개발 서버는 포트 5173을 사용합니다.

### 3. Build All Units

**Backend**: 별도 빌드 단계 없음 (Node.js는 인터프리터 언어, 트랜스파일 불필요)

**Frontend** (프로덕션 빌드, 선택 사항 — 로컬 실행에는 `npm run dev`로 충분):
```bash
cd frontend
npm run build
```

### 4. Verify Build Success

- **Backend**: `npm install` 성공 시 `backend/node_modules/`가 생성됨
- **Frontend Build**: `npm run build` 성공 시 `frontend/dist/`에 `index.html`, `assets/*.js`, `assets/*.css` 생성됨
- **Common Warnings**: npm audit의 취약점 경고는 개발 의존성(devDependencies) 대상이며 로컬 전용 프로젝트 특성상 낮은 우선순위. esbuild deprecated 경고는 무해함.

## Troubleshooting

### Build Fails with Dependency Errors
- **Cause**: Node.js 버전이 너무 낮음 (`node:sqlite` 미지원)
- **Solution**: `node --version`으로 확인 후 22.5.0 이상으로 업그레이드. 22.x대에서는 `node --experimental-sqlite` 플래그 필요할 수 있음.

### npm install 시 esbuild 스크립트 차단
- **Cause**: npm의 install-scripts 보안 기능이 처음 설치 시 postinstall 스크립트를 차단함
- **Solution**: `npm install-scripts approve esbuild` 실행 후 `npm install` 재실행
