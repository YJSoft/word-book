# Dependencies

## Internal Dependencies

```mermaid
flowchart LR
    frontend -->|"HTTP REST (fetch)"| backend
    backend -->|"파일 I/O"| SQLite[("data/wordbook.db")]
    packaging -->|"빌드 산출물 포함"| frontend
    packaging -->|"소스 포함"| backend

    style frontend fill:#BBDEFB,stroke:#1565C0,color:#000
    style backend fill:#C8E6C9,stroke:#2E7D32,color:#000
    style packaging fill:#FFE0B2,stroke:#E65100,color:#000
    style SQLite fill:#FFF59D,stroke:#F57F17,color:#000
```

### frontend depends on backend
- **Type**: Runtime (HTTP)
- **Reason**: 모든 데이터 조작을 backend REST API를 통해 수행 (직접 DB 접근 없음)

### packaging depends on backend, frontend
- **Type**: Build-time
- **Reason**: .deb 빌드 시 frontend를 프로덕션 빌드하고 backend 소스를 함께 패키징

## External Dependencies

### express
- **Version**: 4.21.2
- **Purpose**: HTTP 서버/라우팅
- **License**: MIT

### cors
- **Version**: 2.8.5
- **Purpose**: CORS 헤더 처리 (frontend origin 허용)
- **License**: MIT

### react / react-dom
- **Version**: 18.3.1
- **Purpose**: UI 렌더링
- **License**: MIT

### vite
- **Version**: 6.0.7
- **Purpose**: 빌드/개발 서버
- **License**: MIT

### vitest, @testing-library/react
- **Version**: 2.1.8 / 16.1.0
- **Purpose**: frontend 테스트
- **License**: MIT
