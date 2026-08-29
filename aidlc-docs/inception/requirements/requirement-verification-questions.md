# Requirements 확인 질문 (Word Book 앱)

요구사항 문서(`requirements/word-book-requirements.md`)를 검토했습니다. 대부분 명확하지만, 구현 세부사항을 확정하기 위해 몇 가지 질문에 답해주세요.

각 질문에 A/B/C... 중 하나를 선택하여 `[Answer]:` 뒤에 적어주세요. 옵션이 마음에 들지 않으면 마지막 "Other"를 선택하고 설명을 적어주세요.

## Question 1
단어/뜻 입력 시 필수값 검증(빈 값 방지) 외에, 중복 단어 입력을 허용할까요?

A) 중복 허용 (같은 단어를 여러 번 추가할 수 있음)

B) 중복 방지 (이미 존재하는 단어는 추가 시 에러 또는 안내 메시지)

C) Other (please describe after [Answer]: tag below)

[Answer]: 중복 방지가 기본이나 강제 추가할수 있게 허용(중복 단어입니다. 정말 다시 추가할까요? 같은)

## Question 2
단어 목록의 기본 정렬 순서는 어떻게 할까요? (정렬 "기능"은 제외 대상이지만, 목록을 보여줄 때의 기본 순서는 정해야 합니다)

A) 추가한 순서대로 (오래된 것 먼저)

B) 추가한 순서의 역순 (최근 추가한 것 먼저)

C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 3
단어/뜻 입력값의 길이 제한이 있나요?

A) 제한 없음 (단, 빈 값은 불가)

B) 적당한 제한 적용 (예: 단어 200자, 뜻 1000자 이내)

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
삭제 시 확인 절차가 필요한가요?

A) 확인 다이얼로그 없이 즉시 삭제

B) 삭제 전 확인 다이얼로그 표시 ("정말 삭제하시겠습니까?")

C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 5
백엔드 API 서버와 프론트엔드 개발 서버의 포트는 어떻게 할까요?

A) 백엔드 3001, 프론트엔드 3000 (React 기본값 + 별도 API 포트)

B) 백엔드 4000, 프론트엔드 5173 (Vite 기본값 + 별도 API 포트)

C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 6
SQLite 데이터베이스 파일은 어디에 저장할까요?

A) 프로젝트 내 `data/` 디렉토리 (예: `data/wordbook.db`)

B) 백엔드 유닛 루트에 직접 저장 (예: `backend/wordbook.db`)

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
React 프론트엔드는 어떤 빌드 도구를 사용할까요?

A) Vite (빠른 개발 서버, 최신 표준)

B) Create React App (CRA, 전통적 방식)

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)

B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question: Resiliency Extensions
Should the resiliency baseline be applied to this project?

A) Yes — apply the resiliency baseline as directional best practices and design-time guidance

B) No — skip the resiliency baseline (suitable for PoCs, prototypes, and experimental projects where rapid iteration matters more than reliability)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints

B) Partial — enforce PBT rules only for pure functions and serialization round-trips

C) No — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers with no significant business logic)

X) Other (please describe after [Answer]: tag below)

[Answer]: C
