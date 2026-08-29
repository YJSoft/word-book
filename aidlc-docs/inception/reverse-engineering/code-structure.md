# Code Structure

## Build System
- **Backend**: npm, ESM(`"type": "module"`), 빌드 단계 없음(Node.js 인터프리터 실행)
- **Frontend**: npm + Vite (`vite build`)
- **Packaging**: 커스텀 shell 스크립트(`build-deb.sh`) + `dpkg-deb`

## Existing Files Inventory

### backend/
- `backend/package.json` - 의존성(express, cors), scripts(start/test)
- `backend/src/server.js` - 엔트리포인트, DB 초기화, graceful shutdown
- `backend/src/app.js` - Express 앱 조립: CORS, JSON 파싱, 라우터 연결, 정적 파일 서빙(옵션), 에러 핸들러
- `backend/src/db/database.js` - `node:sqlite` `DatabaseSync` 초기화, 스키마 생성(`words` 테이블)
- `backend/src/repositories/wordRepository.js` - CRUD 데이터 액세스 함수 8개
- `backend/src/routes/wordsRouter.js` - REST 라우터: 5개 엔드포인트, 입력 검증, 중복 처리
- `backend/test/wordRepository.test.js` - Repository 단위 테스트 (9개)
- `backend/test/wordsRouter.test.js` - API 통합 테스트 (13개)

### frontend/
- `frontend/package.json` - 의존성(react, react-dom), devDependencies(vite, vitest, testing-library)
- `frontend/vite.config.js` - Vite 설정 (포트 5173, vitest 통합)
- `frontend/index.html` - HTML 엔트리
- `frontend/src/main.jsx` - React 렌더 엔트리포인트
- `frontend/src/App.jsx` - 최상위 상태관리 (단어목록/로딩/에러/수정중항목/확인대기작업)
- `frontend/src/api/wordsApi.js` - fetch 기반 API 클라이언트, `ApiError` 클래스
- `frontend/src/components/WordForm.jsx` - 추가/수정 겸용 폼
- `frontend/src/components/WordItem.jsx` - 개별 항목 (토글/수정/삭제)
- `frontend/src/components/WordList.jsx` - 목록 렌더링
- `frontend/src/components/ConfirmDialog.jsx` - 재사용 확인 다이얼로그
- `frontend/src/index.css` - 전역 스타일
- `frontend/src/App.test.jsx`, `WordForm.test.jsx`, `WordItem.test.jsx`, `api/wordsApi.test.js` - 테스트 (25개)

### packaging/
- `packaging/build-deb.sh` - .deb 빌드 스크립트
- `packaging/debian/{control,postinst,prerm,postrm,word-book.service}` - 패키지 메타/systemd
- `packaging/INSTALL.md`, `packaging/README.md` - 문서

## Design Patterns

### Layered Architecture (backend)
- **Location**: `backend/src/{routes,repositories,db}`
- **Purpose**: 관심사 분리 (라우팅/검증 ↔ 데이터 액세스 ↔ DB 연결)
- **Implementation**: 라우터가 검증+비즈니스 규칙(중복 처리) 담당, Repository는 순수 CRUD만 수행

### Container/Presentational 유사 패턴 (frontend)
- **Location**: `frontend/src/App.jsx` vs `components/*`
- **Purpose**: 상태관리를 App에 집중, 컴포넌트는 props 기반 렌더링+이벤트 콜백
- **Implementation**: `App.jsx`가 API 호출/상태를 전담, 하위 컴포넌트는 순수 프레젠테이션

## Critical Dependencies

### express (backend)
- **Version**: 4.21.2
- **Usage**: HTTP 라우팅, JSON 미들웨어
- **Purpose**: REST API 서버

### node:sqlite (backend, Node.js 내장)
- **Version**: Node.js v22.5+ 내장 (experimental), v24+ 정식
- **Usage**: `DatabaseSync`로 동기 쿼리 실행
- **Purpose**: 네이티브 컴파일 불필요한 로컬 영속성

### react (frontend)
- **Version**: 18.3.1
- **Usage**: UI 컴포넌트, 상태관리(useState/useEffect/useCallback)
- **Purpose**: SPA 렌더링

### vite (frontend)
- **Version**: 6.0.7
- **Usage**: 개발 서버, 프로덕션 빌드
- **Purpose**: 빠른 개발 경험, ESM 기반 번들링
