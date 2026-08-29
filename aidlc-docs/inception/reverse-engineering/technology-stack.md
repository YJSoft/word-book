# Technology Stack

## Programming Languages
- JavaScript (ESM) - Node.js v24.20.0 (개발/검증 환경) - backend, frontend 전체
- Shell (POSIX sh, bash) - packaging 스크립트

## Frameworks
- Express 4.21.2 - backend REST API
- React 18.3.1 - frontend UI
- Vite 6.0.7 - frontend 빌드/개발서버

## Infrastructure
- SQLite (`node:sqlite` 내장) - 로컬 데이터 영속성
- systemd - 배포판 서비스 관리 (Linux)

## Build Tools
- npm - 양쪽 유닛 패키지 매니저
- dpkg-deb - .deb 패키지 빌더

## Testing Tools
- `node --test` (Node.js 내장) - backend 테스트
- Vitest 2.1.8 + @testing-library/react 16.1.0 - frontend 테스트
