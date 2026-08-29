# APT Repository CI - 설정 및 사용 안내

`tauri-app`의 `.deb` 패키지를 GPG로 서명하여 이 repo의 **`repo`라는 이름의 브랜치**에 APT 저장소 형태로 게시하는 CI 자동화입니다.

## 구조

- **브랜치**: `repo` (단일 브랜치, GitHub Pages 소스로 사용)
- **채널(디렉토리)**:
  - `apt/nightly/` — `main` 브랜치에 push될 때마다 갱신 (build.yml)
  - `apt/main/` — 태그(`v*`) push 시(릴리스) 갱신 (release.yml)
- **공개키**: `apt/wordbook-apt-key.asc` (repo 루트, 두 채널 공통)

## 트리거 매핑

| 이벤트 | 워크플로우 | 게시 채널 |
|---|---|---|
| `main` 브랜치 push | `build.yml` | `repo` 브랜치의 `apt/nightly/` |
| 태그(`v*`) push (release) | `release.yml` | `repo` 브랜치의 `apt/main/` |

## 필요한 GitHub 설정 (CI 실행 전 사용자가 준비해야 함)

### 1. GPG 키 생성 및 등록
CI가 패키지를 서명할 GPG 키가 필요합니다. 로컬에서 생성 후 GitHub Secrets에 등록하세요:

```bash
# 키 생성 (passphrase 설정)
gpg --batch --gen-key <<EOF
%no-protection
Key-Type: RSA
Key-Length: 4096
Name-Real: Word Book APT Repo
Name-Email: noreply@example.com
Expire-Date: 0
EOF

# 개인키 export (Secrets에 등록할 값)
gpg --armor --export-secret-keys <KEY_ID> > private.asc
```

GitHub 저장소 Settings → Secrets and variables → Actions에 등록:
- `APT_GPG_PRIVATE_KEY`: `private.asc` 내용 전체
- `APT_GPG_PASSPHRASE`: 키 생성 시 사용한 암호

> **passphrase 없는 키(`%no-protection`)를 사용하는 경우**: GitHub Secrets는 빈 값으로 생성할 수 없으므로, `APT_GPG_PASSPHRASE` Secret 자체를 등록하지 않으면 됩니다. `publish-apt-channel.sh`는 이 Secret이 없으면 자동으로 빈 passphrase로 서명을 시도합니다 (`${GPG_PASSPHRASE:-}` 기본값 처리).

> **보안 주의**: `private.asc` 파일은 등록 후 로컬에서 안전하게 삭제하세요. 이 키는 저장소의 모든 CI 실행에서 사용 가능하므로, 저장소 접근 권한 관리에 유의해야 합니다.

### 2. `repo` 브랜치 및 GitHub Pages 설정
- 워크플로우가 최초 실행되면 `repo` 브랜치가 없을 경우 자동으로 생성합니다 (`git checkout --orphan repo`)
- GitHub 저장소 Settings → Pages에서 **Source: Deploy from a branch → `repo` 브랜치**로 설정하면 `https://<owner>.github.io/<repo-name>/apt/...` 형태로 접근 가능합니다

### 3. 워크플로우의 `repo` 브랜치 push 권한
`publish-apt-channel.sh`는 기본 제공되는 `secrets.GITHUB_TOKEN`을 사용해 `repo` 브랜치에 커밋/push합니다. 이 토큰이 push 권한을 가지려면 워크플로우 job에 다음이 필요합니다 (이미 `build.yml`/`release.yml`에 반영됨):
```yaml
jobs:
  build: # 또는 release
    permissions:
      contents: write
```
이 설정이 없으면(또는 저장소 Settings → Actions → General에서 "Workflow permissions"가 "Read repository contents"로 제한되어 있으면) `git push` 시 `Authentication failed` 또는 `Permission denied` 오류가 발생합니다. 저장소 Settings → Actions → General → Workflow permissions에서 "Read and write permissions"가 선택되어 있는지도 확인하세요 (organization/repository 정책에 따라 이 설정이 우선 적용될 수 있음).

## 사용자 설치 방법 (안내용, 실제 URL은 저장소명에 맞게 치환)

이 APT 저장소는 **flat repository** 구조입니다(`dists/<suite>/` 하위 디렉토리 없이 `Release`/`Packages`가 채널 디렉토리에 바로 위치). sources.list 항목은 반드시 `./`로 끝나는 flat 형식이어야 합니다. **일반(non-flat) 형식(`URL SUITE COMPONENT`)을 사용하면 apt가 `URL/dists/SUITE/Release`를 찾으러 가서 404가 발생합니다.**

```bash
# 공개키 등록
curl -fsSL https://yjsoft.github.io/word-book/apt/wordbook-apt-key.asc \
  | sudo gpg --dearmor -o /usr/share/keyrings/wordbook.gpg

# nightly 채널 추가 (flat repo 형식, 끝의 './' 필수) — 또는 main으로 교체하여 안정 버전 사용
echo "deb [signed-by=/usr/share/keyrings/wordbook.gpg] https://yjsoft.github.io/word-book/apt/nightly ./" \
  | sudo tee /etc/apt/sources.list.d/wordbook.list

sudo apt update
sudo apt install word-book
```

**이미 잘못된 형식(`nightly main`)으로 등록했다면**, 파일을 삭제 후 위 명령으로 다시 등록하세요:
```bash
sudo rm /etc/apt/sources.list.d/wordbook.list
# 위 echo 명령 재실행
```

## 이 세션에서의 검증 범위

이 워크스페이스는 로컬 환경이며 원격 GitHub 저장소에 연결되어 있는지 확인할 수 없어(Q3 답변상 "GitHub 저장소 있음"으로 확인됨), 다음은 **작성/문법 검증만 완료**했고 **실제 GitHub Actions 실행은 검증하지 못했습니다**:
- `build.yml`, `release.yml` — YAML 문법 유효성 검증 완료 (Python yaml 파서로 파싱 성공)
- `.github/scripts/publish-apt-channel.sh` — bash 문법 검증 완료 (`bash -n`)

**실제 실행 검증을 위해 사용자가 수행해야 할 것**:
1. GPG 키 생성 및 Secrets 등록 (위 "필요한 GitHub 설정" 참고)
2. 이 저장소를 실제 GitHub에 push
3. `main` 브랜치에 push하여 `build.yml`이 트리거되는지, `repo` 브랜치의 `apt/nightly/`에 파일이 게시되는지 확인
4. GitHub Pages 설정(`repo` 브랜치를 소스로) 후 실제 URL로 APT 저장소 접근 가능한지 확인

## 트러블슈팅 (실제 사용 중 발견된 이슈)

### `git push` 인증 실패 (`Authentication failed`)
- **원인**: Publish 스텝의 `env`에 `GITHUB_TOKEN`이 전달되지 않았거나, job에 `contents: write` 권한이 없음
- **해결**: `build.yml`/`release.yml`에 이미 반영됨 (2026-08-29 수정). 저장소 Settings → Actions → General → **Workflow permissions**가 "Read and write permissions"인지도 확인 (repo/org 정책이 파일 내 `permissions:` 선언보다 우선할 수 있음)

### `apt update` 시 `404 Not Found` 또는 `does not have a Release file`
- **실제 근본 원인 (확인됨)**: sources.list 항목이 `deb [...] URL SUITE COMPONENT` (예: `nightly main`) 형식으로 되어 있으면, apt는 이를 **표준(non-flat) 저장소**로 인식하여 `URL/dists/SUITE/Release`를 요청합니다. 하지만 이 저장소는 `dists/` 하위 구조가 없는 **flat repository**(Release/Packages가 채널 디렉토리에 바로 위치)이므로 해당 경로는 존재하지 않아 항상 404가 발생합니다. **캐시나 배포 지연 문제가 아니라 URL 형식 자체의 오류였습니다.**
- **해결**: sources.list 항목을 flat repo 형식으로 수정 (끝이 `./`로 끝나야 함):
  ```
  deb [signed-by=/usr/share/keyrings/wordbook.gpg] https://<owner>.github.io/<repo>/apt/nightly ./
  ```
  (2026-08-29 안내 문서 및 스크립트의 안내 출력 모두 이 형식으로 수정함)
- **추가로 수정된 관련 버그**: `dpkg-scanpackages`를 채널 디렉토리 상위(`apt/`)에서 실행하고 있어 `Packages`의 `Filename` 필드가 `nightly/파일명`처럼 채널명이 중복 포함되어 있었습니다(flat repo에서는 `./파일명`이어야 함). 채널 디렉토리 자체에서 스캔하도록 스크립트를 수정하여 해결했습니다.
- **확인 방법**: `curl -s -o /dev/null -w "%{http_code}\n" https://<owner>.github.io/<repo>/apt/<channel>/Release` 로 실제 상태 코드를 직접 확인 (파일 자체는 200이었지만, apt가 잘못된 경로인 `dists/<channel>/Release`를 요청했던 것이 문제였음)

### `apt update` 로그에 `무시:` (Ignored) 표시
- **원인**: `InRelease`(서명된 통합 파일)를 가져왔지만 GPG 서명 검증에 실패해 무시되고, 서명 없는 `Release`로 폴백을 시도한 것일 수 있습니다.
- **해결**: 공개키가 로컬에 올바르게 등록되었는지 확인:
  ```bash
  curl -fsSL https://<owner>.github.io/<repo>/apt/wordbook-apt-key.asc | sudo gpg --dearmor -o /usr/share/keyrings/wordbook.gpg
  ```
  그리고 `sources.list.d`의 항목이 `signed-by=/usr/share/keyrings/wordbook.gpg`를 정확히 참조하는지 확인하세요.
