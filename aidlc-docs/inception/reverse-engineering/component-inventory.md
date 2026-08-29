# Component Inventory

## Application Packages
- `backend` - Express REST API + SQLite 영속성 (Node.js)
- `frontend` - React SPA (Vite)

## Infrastructure Packages
- `packaging` - .deb 패키지 빌드 + systemd 서비스 정의 (Shell script)

## Shared Packages
- 없음 (단일 저장소 내 3개 유닛, 코드 공유 없음 — frontend가 backend의 API 계약을 HTTP로만 소비)

## Test Packages
- `backend/test/` - Unit + API Integration (node:test, 22개)
- `frontend/src/**/*.test.jsx` - Unit + Component Integration (Vitest + RTL, 25개)

## Total Count
- **Total Packages**: 3
- **Application**: 2 (backend, frontend)
- **Infrastructure**: 1 (packaging)
- **Shared**: 0
- **Test**: 통합됨 (각 애플리케이션 패키지 내부에 위치)
