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

```bash
# 공개키 등록
curl -fsSL https://<owner>.github.io/<repo-name>/apt/wordbook-apt-key.asc \
  | sudo gpg --dearmor -o /usr/share/keyrings/wordbook.gpg

# nightly 채널 추가 (또는 main으로 교체하여 안정 버전 사용)
echo "deb [signed-by=/usr/share/keyrings/wordbook.gpg] https://<owner>.github.io/<repo-name>/apt/nightly nightly main" \
  | sudo tee /etc/apt/sources.list.d/wordbook.list

sudo apt update
sudo apt install word-book
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
