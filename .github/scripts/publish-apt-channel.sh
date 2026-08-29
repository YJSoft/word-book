#!/bin/bash
# GPG로 서명된 APT 저장소 채널(nightly 또는 main)에 .deb 패키지를 게시한다.
# 게시 대상은 이 repo의 `repo`라는 이름의 브랜치 (GitHub Pages로 호스팅되는 APT repo).
#
# 사용법: publish-apt-channel.sh <channel>
#   channel: "nightly" 또는 "main"
#
# 필요한 환경변수:
#   GPG_KEY_ID       - 임포트된 GPG 서명 키 ID (import-gpg 단계에서 설정됨)
#   GPG_PASSPHRASE   - GPG 키 암호
#
# 필요한 사전 조건:
#   - dpkg-dev (dpkg-scanpackages), gpg 설치되어 있어야 함
#   - tauri-app/src-tauri/target/release/bundle/deb/*.deb 가 이미 빌드되어 있어야 함
#   - git이 이 repo의 origin remote에 push 가능한 인증 정보를 가지고 있어야 함 (GITHUB_TOKEN)

set -euo pipefail

CHANNEL="${1:?사용법: publish-apt-channel.sh <nightly|main>}"
if [[ "$CHANNEL" != "nightly" && "$CHANNEL" != "main" ]]; then
  echo "오류: channel은 'nightly' 또는 'main'이어야 합니다 (입력값: $CHANNEL)" >&2
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DEB_SOURCE_DIR="${REPO_ROOT}/tauri-app/src-tauri/target/release/bundle/deb"
REPO_BRANCH_DIR="$(mktemp -d)"
APT_ROOT="${REPO_BRANCH_DIR}/apt"
CHANNEL_DIR="${APT_ROOT}/${CHANNEL}"

echo "==> 1. .deb 파일 확인"
shopt -s nullglob
DEB_FILES=("${DEB_SOURCE_DIR}"/*.deb)
if [[ ${#DEB_FILES[@]} -eq 0 ]]; then
  echo "오류: ${DEB_SOURCE_DIR} 에 .deb 파일이 없습니다. 먼저 'npm run tauri build'를 실행하세요." >&2
  exit 1
fi
echo "발견된 .deb 파일: ${DEB_FILES[*]}"

echo "==> 2. repo 브랜치 클론 (없으면 새로 생성)"
git clone --branch repo --single-branch "https://x-access-token:${GITHUB_TOKEN:-}@github.com/${GITHUB_REPOSITORY:?}.git" "$REPO_BRANCH_DIR" 2>/dev/null \
  || git clone "https://x-access-token:${GITHUB_TOKEN:-}@github.com/${GITHUB_REPOSITORY:?}.git" "$REPO_BRANCH_DIR"

cd "$REPO_BRANCH_DIR"
if ! git rev-parse --verify repo >/dev/null 2>&1; then
  git checkout --orphan repo
  git rm -rf . >/dev/null 2>&1 || true
fi

echo "==> 3. 채널 디렉토리에 새 .deb 파일 복사 (기존 채널 파일은 유지, 신규/갱신만 추가)"
mkdir -p "$CHANNEL_DIR"
# .deb 파일명의 공백을 하이픈으로 정규화한다 (APT 저장소에서 공백 포함 파일명은
# URL 인코딩/클라이언트 호환성 문제를 일으킬 수 있음. 예: "Word Book_0.1.0_amd64.deb" -> "Word-Book_0.1.0_amd64.deb")
for src in "${DEB_FILES[@]}"; do
  base="$(basename "$src")"
  normalized="${base// /-}"
  cp "$src" "${CHANNEL_DIR}/${normalized}"
done

echo "==> 4. Packages 인덱스 생성 (dpkg-scanpackages)"
# flat repository 구조이므로 채널 디렉토리 자체에서 스캔해야 Filename이
# 순수 파일명(현재 디렉토리 기준 상대경로)으로 기록된다.
# (APT_ROOT에서 스캔하면 Filename에 "nightly/파일명"처럼 채널명이 중복 포함되어
#  "deb URL ./" 형식의 flat repo에서 실제 다운로드 경로가 어긋나는 버그가 있었음)
cd "$CHANNEL_DIR"
dpkg-scanpackages --multiversion . > "Packages"
gzip -k -f "Packages"

echo "==> 5. Release 파일 생성"
# 이 시점의 작업 디렉토리는 $CHANNEL_DIR 이므로 모든 파일명은 상대경로(파일명만)로 참조한다.
cat > "Release" <<EOF
Origin: Word Book
Label: Word Book
Suite: ${CHANNEL}
Codename: ${CHANNEL}
Architectures: arm64 amd64
Components: main
Description: Word Book APT repository (${CHANNEL} channel)
Date: $(date -Ru)
EOF

# Packages/Packages.gz의 체크섬을 Release 파일에 추가
{
  echo "MD5Sum:"
  for f in "Packages" "Packages.gz"; do
    printf ' %s %16d %s\n' "$(md5sum "$f" | cut -d' ' -f1)" "$(stat -c%s "$f")" "$(basename "$f")"
  done
  echo "SHA256:"
  for f in "Packages" "Packages.gz"; do
    printf ' %s %16d %s\n' "$(sha256sum "$f" | cut -d' ' -f1)" "$(stat -c%s "$f")" "$(basename "$f")"
  done
} >> "Release"

echo "==> 6. Release 파일 GPG 서명 (InRelease + Release.gpg)"
# GPG_PASSPHRASE가 설정되지 않았거나 빈 값이면 passphrase 없는 키(%no-protection)로 간주하고
# --passphrase '' 로 서명한다. GitHub Secrets는 빈 값으로 생성할 수 없으므로,
# passphrase가 필요 없는 키를 쓰는 경우 이 Secret 자체를 등록하지 않아도 되도록 처리.
GPG_PASSPHRASE="${GPG_PASSPHRASE:-}"
gpg --batch --yes --pinentry-mode loopback --passphrase "${GPG_PASSPHRASE}" \
  --default-key "${GPG_KEY_ID:?}" \
  --clearsign -o "InRelease" "Release"
gpg --batch --yes --pinentry-mode loopback --passphrase "${GPG_PASSPHRASE}" \
  --default-key "${GPG_KEY_ID:?}" \
  --detach-sign -o "Release.gpg" "Release"

echo "==> 7. 공개키를 repo 루트에 게시 (사용자가 apt-key/trusted.gpg.d에 추가할 수 있도록)"
gpg --batch --armor --export "${GPG_KEY_ID}" > "${APT_ROOT}/wordbook-apt-key.asc"

echo "==> 8. repo 브랜치에 커밋 및 push"
cd "$REPO_BRANCH_DIR"
git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"
git add apt/
if git diff --cached --quiet; then
  echo "변경 사항 없음 - 커밋 스킵"
else
  git commit -m "Publish to ${CHANNEL} APT channel ($(date -u +%Y-%m-%dT%H:%M:%SZ))"
  git push origin repo
fi

echo ""
echo "완료: ${CHANNEL} 채널이 repo 브랜치에 게시되었습니다."
echo "사용자 설치 안내 (flat repository 형식, 끝의 './' 필수):"
echo "  curl -fsSL https://<owner>.github.io/<repo>/apt/wordbook-apt-key.asc | sudo gpg --dearmor -o /usr/share/keyrings/wordbook.gpg"
echo "  echo 'deb [signed-by=/usr/share/keyrings/wordbook.gpg] https://<owner>.github.io/<repo>/apt/${CHANNEL} ./' | sudo tee /etc/apt/sources.list.d/wordbook.list"
