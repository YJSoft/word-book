# Word Book - Packaging (Debian .deb)

Word Book 애플리케이션을 `.deb` 패키지로 빌드하기 위한 스크립트와 systemd 서비스 정의.

## 구성

- `build-deb.sh` — frontend 프로덕션 빌드 + backend 소스를 묶어 `.deb` 패키지 생성
- `debian/control` — 패키지 메타데이터
- `debian/postinst` — 설치 후: 시스템 사용자 생성, npm 의존성 설치, systemd 서비스 등록/활성화
- `debian/prerm` — 제거 전: 서비스 중지/비활성화
- `debian/postrm` — purge 시: 데이터/애플리케이션 파일/시스템 사용자 완전 삭제
- `debian/word-book.service` — systemd 유닛 파일 (backend가 frontend 정적 파일을 함께 서빙하도록 환경변수 설정)
- `INSTALL.md` — 최종 사용자용 설치/구동/제거 안내서
- `dist/word-book_1.0.0_all.deb` — 빌드 산출물 (빌드 스크립트로 재생성 가능, 저장소에는 유지하지 않음)

## 빌드

```bash
./packaging/build-deb.sh
```

산출물: `packaging/dist/word-book_1.0.0_all.deb`

## 아키텍처 결정

배포판에서는 개발 환경과 달리 backend(Express)가 frontend 프로덕션 빌드 결과물을 정적 파일로 함께 서빙하여 단일 프로세스/단일 포트(4000)로 통합한다. 이를 위해 `backend/src/app.js`에 `staticDir` 옵션을 추가했고 (`WORD_BOOK_STATIC_DIR` 환경변수), `backend/src/server.js`가 이 환경변수를 읽어 `createApp()`에 전달한다. 개발 시(`npm run dev`)에는 이 옵션이 비활성 상태이므로 기존 개발 워크플로우(backend 4000 + frontend dev server 5173)에는 영향이 없다.

## 검증 내역 (실제 실행됨, Ubuntu 24.04 VM)

- `sudo dpkg -i` 설치 → 시스템 사용자 생성, npm install, systemd 서비스 등록 확인
- `sudo systemctl start/status` → 서비스 정상 기동, frontend+API 통합 서빙 확인
- curl로 `/`(frontend), `/health`, `/api/words`(CRUD) 모두 검증
- 서비스 재시작 후 데이터 유지 확인
- `sudo dpkg -P` (purge) → `/opt/word-book`, `/var/lib/word-book`, 시스템 사용자 완전 삭제 확인
