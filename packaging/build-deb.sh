#!/bin/bash
# Word Book .deb 패키지 빌드 스크립트
# 사용법: ./packaging/build-deb.sh
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PKG_NAME="word-book"
PKG_VERSION="1.0.0"
BUILD_DIR="${PROJECT_ROOT}/packaging/build/${PKG_NAME}_${PKG_VERSION}"
OUTPUT_DEB="${PROJECT_ROOT}/packaging/dist/${PKG_NAME}_${PKG_VERSION}_all.deb"

echo "==> 1. 이전 빌드 정리"
rm -rf "${PROJECT_ROOT}/packaging/build" "${PROJECT_ROOT}/packaging/dist"
mkdir -p "${BUILD_DIR}/DEBIAN"
mkdir -p "${BUILD_DIR}/opt/word-book/backend"
mkdir -p "${BUILD_DIR}/opt/word-book/frontend"
mkdir -p "${BUILD_DIR}/etc/systemd/system"
mkdir -p "${PROJECT_ROOT}/packaging/dist"

echo "==> 2. frontend 프로덕션 빌드"
(cd "${PROJECT_ROOT}/frontend" && npm install --no-audit --no-fund && npm run build)

echo "==> 3. backend 소스 복사 (node_modules 제외, 설치 시점에 postinst에서 설치)"
cp -r "${PROJECT_ROOT}/backend/src" "${BUILD_DIR}/opt/word-book/backend/"
cp "${PROJECT_ROOT}/backend/package.json" "${BUILD_DIR}/opt/word-book/backend/"

echo "==> 4. frontend 빌드 결과물 복사"
cp -r "${PROJECT_ROOT}/frontend/dist/"* "${BUILD_DIR}/opt/word-book/frontend/"

echo "==> 5. DEBIAN 메타/스크립트 파일 배치"
cp "${PROJECT_ROOT}/packaging/debian/control" "${BUILD_DIR}/DEBIAN/control"
cp "${PROJECT_ROOT}/packaging/debian/postinst" "${BUILD_DIR}/DEBIAN/postinst"
cp "${PROJECT_ROOT}/packaging/debian/prerm" "${BUILD_DIR}/DEBIAN/prerm"
cp "${PROJECT_ROOT}/packaging/debian/postrm" "${BUILD_DIR}/DEBIAN/postrm"
chmod 755 "${BUILD_DIR}/DEBIAN/postinst" "${BUILD_DIR}/DEBIAN/prerm" "${BUILD_DIR}/DEBIAN/postrm"

echo "==> 6. systemd 유닛 파일 배치"
cp "${PROJECT_ROOT}/packaging/debian/word-book.service" "${BUILD_DIR}/etc/systemd/system/word-book.service"

echo "==> 7. 패키지 크기 계산 및 control 파일에 반영"
INSTALLED_SIZE=$(du -sk "${BUILD_DIR}/opt" | cut -f1)
sed -i "/^Description:/i Installed-Size: ${INSTALLED_SIZE}" "${BUILD_DIR}/DEBIAN/control"

echo "==> 8. .deb 패키지 빌드"
dpkg-deb --build --root-owner-group "${BUILD_DIR}" "${OUTPUT_DEB}"

echo ""
echo "빌드 완료: ${OUTPUT_DEB}"
dpkg-deb --info "${OUTPUT_DEB}"
