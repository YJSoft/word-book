# Requirements: Word Book - Debian 패키징 (.deb)

## Intent Analysis Summary
- **User Request**: 기존 word-book 앱(backend+frontend)을 .deb 패키지로 만들어 로컬 VM에 설치 가능하게 하고, 설치법/구동법 문서와 함께 zip으로 묶어 croc으로 공유
- **Request Type**: New Feature (배포 패키징) — 원 requirements.md의 "실배포는 범위 밖" 전제를 사용자가 명시적으로 확장
- **Scope Estimate**: Single Component (신규 packaging 유닛 추가, 기존 backend/frontend 코드는 변경 없음)
- **Complexity Estimate**: Simple (표준 dpkg-deb 패키징 + systemd 서비스 등록)

## 확정된 결정 (사용자 답변 기반)
1. **범위**: 신규 요구사항으로 처리 (원 프로젝트의 "실배포 범위 밖" 전제에서 예외)
2. **아키텍처**: systemd 서비스 방식
   - backend는 systemd 서비스로 등록되어 자동 실행
   - Express(backend)가 frontend 빌드 결과물(정적 파일)을 함께 서빙하여 단일 프로세스/단일 포트로 통합
3. **대상 환경**: 로컬 VM (Ubuntu 24.04 확인됨), Debian 계열
4. **공유 방식**: croc 전송은 범위에서 제외됨 (2026-08-29 사용자 지시로 최종 인도물에서 제외). `.deb`와 문서는 `packaging/` 디렉토리에 산출물로 보관.

## 기능 요구사항
- FR-P1: backend가 frontend의 프로덕션 빌드(`dist/`)를 정적 파일로 서빙 (단일 Express 프로세스가 API + 정적 파일 모두 처리)
- FR-P2: `.deb` 패키지 설치 시 애플리케이션 파일이 `/opt/word-book/`에 배치되고, systemd 서비스(`word-book.service`)가 등록됨
- FR-P3: 서비스는 설치 후 활성화(enable) 및 시작(start) 가능해야 하며, VM 재부팅 시에도 자동 시작되도록 설정 가능
- FR-P4: `.deb` 제거(purge) 시 서비스 중지/비활성화 및 관련 파일 정리
- FR-P5: 설치법/구동법을 담은 마크다운 문서 제공 (설치, 서비스 관리, 접속 URL, 삭제 방법)
- FR-P6: ~~`.deb`와 문서를 하나의 zip 파일로 묶고, `croc`으로 전송 가능한 상태로 준비~~ **(제외됨 — 2026-08-29 사용자 지시)**

## 비기능 요구사항
- 데이터(`data/wordbook.db`)는 `/var/lib/word-book/` 등 시스템 표준 경로에 저장 (FHS 준수)
- 포트: 통합 후 단일 포트 4000 사용 (frontend 정적 파일 + API 모두 이 포트로 서빙되므로 5173 dev 서버는 배포판에서 불필요)
- root 권한 설치 전제 (`dpkg -i`, systemd 등록은 관리자 권한 필요) — 이는 표준 Linux 패키징 관례

## 산출물
- 신규 유닛: `packaging/` — .deb 빌드 스크립트, systemd unit 파일, 설치 문서
- `backend`에 정적 파일 서빙 코드 소폭 추가 (frontend dist 서빙)
