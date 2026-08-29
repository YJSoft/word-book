# Tauri 요구사항 - 후속 확인 질문

Q6에서 "CI 정의까지 준비"를 선택하셨는데, 범위를 명확히 하기 위해 하나만 더 확인하겠습니다.

## Question 8
GitHub Actions 등 CI 워크플로우 파일을 실제로 작성할까요?

A) 예 — `.github/workflows/`에 Windows/Linux/macOS 각각에서 Tauri 빌드를 수행하는 CI 워크플로우 파일을 작성 (실제 실행/트리거는 GitHub 저장소가 필요하므로 이 세션에서는 실행 검증 불가, 파일 작성까지만)

B) 아니오 — CI 워크플로우 파일은 생성하지 않고, `tauri.conf.json`의 플랫폼별 빌드 설정(bundle targets 등)만 준비. 실제 크로스 플랫폼 빌드 자동화는 이번 범위 밖

C) Other (please describe after [Answer]: tag below)

[Answer]: A
