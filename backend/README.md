# Word Book Backend

단어 암기 애플리케이션의 백엔드. Express REST API + SQLite(`node:sqlite`) 영속성.

## 요구 사항

- **Node.js 22.5.0 이상** (`node:sqlite` 내장 모듈 필요)
- Node 24.x 이상에서는 플래그 없이 정상 동작합니다 (v24.20.0에서 검증됨). Node 22.x대에서는 `--experimental-sqlite` 플래그가 필요할 수 있습니다.

## 설치

```bash
cd backend
npm install
```

## 실행

```bash
npm start
```

기본적으로 `http://localhost:4000` 에서 서버가 기동됩니다. `PORT` 환경변수로 포트를 변경할 수 있습니다.

만약 Node 버전이 experimental 플래그를 요구하면:
```bash
node --experimental-sqlite src/server.js
```

## 테스트

```bash
npm test
```

`node --test`로 `test/` 디렉토리의 모든 테스트를 실행합니다 (in-memory SQLite 사용, 실제 DB 파일에 영향 없음).

## 데이터 저장

SQLite 데이터베이스 파일은 프로젝트 루트의 `data/wordbook.db`에 생성됩니다 (최초 실행 시 자동 생성).

## API 문서

`aidlc-docs/construction/backend/code/api-layer-summary.md` 참고.

## 디렉토리 구조

```
backend/
├── src/
│   ├── db/database.js          # SQLite 초기화 및 스키마
│   ├── repositories/wordRepository.js  # CRUD 데이터 액세스
│   ├── routes/wordsRouter.js   # REST API 라우터
│   ├── app.js                  # Express 앱 설정
│   └── server.js               # 서버 엔트리포인트
├── test/
│   ├── wordRepository.test.js
│   └── wordsRouter.test.js
└── package.json
```
