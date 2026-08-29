# Word Book Frontend

단어 암기 애플리케이션의 프론트엔드. React SPA (Vite).

## 요구 사항

- Node.js 18 이상
- **backend 서버가 `http://localhost:4000`에서 실행 중이어야 합니다** (`../backend/README.md` 참고)

## 설치

```bash
cd frontend
npm install
```

## 실행 (개발 서버)

```bash
npm run dev
```

`http://localhost:5173`에서 앱이 실행됩니다. backend 서버를 먼저 실행해두어야 정상 동작합니다.

## 테스트

```bash
npm test
```

Vitest + React Testing Library로 API 클라이언트 및 컴포넌트 테스트를 실행합니다 (실제 backend 서버 불필요, 모두 mock 처리).

## 프로덕션 빌드

```bash
npm run build
```

`dist/` 디렉토리에 정적 파일이 생성됩니다. `npm run preview`로 빌드 결과를 미리 볼 수 있습니다.

## 주요 기능

- 단어 추가 (중복 시 확인 다이얼로그 후 강제 추가 가능)
- 단어 목록 조회 (최근 추가순)
- 단어 수정
- 단어 삭제 (확인 다이얼로그)
- 외움 상태 체크 토글

## 디렉토리 구조

```
frontend/
├── src/
│   ├── api/wordsApi.js          # backend REST API 클라이언트
│   ├── components/
│   │   ├── WordForm.jsx         # 추가/수정 폼
│   │   ├── WordItem.jsx         # 개별 항목
│   │   ├── WordList.jsx         # 목록
│   │   └── ConfirmDialog.jsx    # 확인 다이얼로그
│   ├── App.jsx                  # 상태 관리 및 조립
│   ├── main.jsx                 # 엔트리포인트
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```
