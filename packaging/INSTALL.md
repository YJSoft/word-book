# Word Book - 설치 및 구동 안내

단어 암기 애플리케이션(Word Book)의 Debian 패키지(.deb) 설치 및 사용 안내서입니다.

## 사전 요구사항

- Debian/Ubuntu 계열 Linux (Ubuntu 24.04 LTS에서 빌드 및 검증됨)
- Node.js 22.5.0 이상 (설치 전 `node --version`으로 확인, 없으면 별도 설치 필요)
- `sudo` 권한 (systemd 서비스 등록 및 시스템 사용자 생성을 위해 필요)
- 인터넷 연결 (설치 중 `npm install`로 백엔드 의존성을 내려받음)

## 설치

```bash
sudo dpkg -i word-book_1.0.0_all.deb
```

설치 스크립트가 자동으로 수행하는 작업:
1. 전용 시스템 사용자 `word-book` 생성
2. 데이터 디렉토리 `/var/lib/word-book/` 생성 및 권한 설정
3. 애플리케이션 파일을 `/opt/word-book/`에 배치
4. 백엔드 실행에 필요한 npm 의존성 설치 (`/opt/word-book/backend`에서 `npm install --omit=dev`)
5. `word-book.service` systemd 서비스 등록 및 활성화(enable) — 부팅 시 자동 시작되도록 설정됨 (아직 시작은 되지 않음)

> **의존성 관련**: `Depends: nodejs (>= 22.5.0)`로 선언되어 있으나, apt 저장소의 nodejs 버전이 낮을 경우 `dpkg`가 의존성 경고를 낼 수 있습니다. 이 경우 Node.js 22.5+ 를 별도 설치([nodesource](https://github.com/nodesource/distributions) 등 이용) 후 재설치하세요.

## 서비스 시작

```bash
sudo systemctl start word-book
```

## 상태 확인

```bash
sudo systemctl status word-book
```

`active (running)` 상태이고, 로그에 `Word Book backend server listening on http://localhost:4000`이 보이면 정상입니다.

## 접속

브라우저에서 다음 주소로 접속합니다:

```
http://localhost:4000
```

(개발 환경과 달리 배포판에서는 frontend와 backend가 하나의 프로세스/포트로 통합되어 있어, 별도로 프론트엔드 서버를 실행할 필요가 없습니다.)

## 서비스 관리 명령어

| 동작 | 명령어 |
|---|---|
| 시작 | `sudo systemctl start word-book` |
| 중지 | `sudo systemctl stop word-book` |
| 재시작 | `sudo systemctl restart word-book` |
| 상태 확인 | `sudo systemctl status word-book` |
| 로그 확인 | `sudo journalctl -u word-book -f` |
| 부팅 시 자동시작 활성화 | `sudo systemctl enable word-book` (설치 시 이미 적용됨) |
| 부팅 시 자동시작 비활성화 | `sudo systemctl disable word-book` |

## 데이터 위치

- 데이터베이스 파일: `/var/lib/word-book/wordbook.db` (SQLite)
- 애플리케이션 파일: `/opt/word-book/`
- 설치 로그: `/var/log/word-book-install.log`

## 제거

**서비스와 애플리케이션 파일만 제거 (데이터는 보존)**:
```bash
sudo dpkg -r word-book
```

**완전 제거 (데이터베이스, 시스템 사용자 포함 모두 삭제)**:
```bash
sudo systemctl stop word-book
sudo dpkg -P word-book
```

> **주의**: `dpkg -P` (purge)는 `/var/lib/word-book/wordbook.db`를 포함해 모든 데이터를 삭제합니다. 되돌릴 수 없으니 필요하면 먼저 백업하세요:
> ```bash
> sudo cp /var/lib/word-book/wordbook.db ~/wordbook-backup.db
> ```

## 문제 해결

### 서비스가 시작되지 않음
```bash
sudo journalctl -u word-book -n 50 --no-pager
```
로그에서 원인을 확인합니다. 흔한 원인: Node.js 버전 문제, `npm install` 실패(`/var/log/word-book-install.log` 확인), 포트 4000이 이미 사용 중.

### 포트 충돌
기본 포트는 4000입니다. 다른 프로세스가 사용 중이면 `/etc/systemd/system/word-book.service`의 `Environment=PORT=4000` 값을 변경한 뒤 `sudo systemctl daemon-reload && sudo systemctl restart word-book`을 실행하세요.

### npm install이 설치 중 실패함
인터넷 연결을 확인한 뒤 수동으로 재설치:
```bash
cd /opt/word-book/backend
sudo npm install --omit=dev
sudo systemctl restart word-book
```
