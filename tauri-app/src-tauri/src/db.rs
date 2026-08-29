use rusqlite::Connection;
use std::fs;
use std::path::PathBuf;

/// `words` 테이블 스키마를 생성한다 (없으면).
fn create_schema(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS words (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            word TEXT NOT NULL,
            definition TEXT NOT NULL,
            memorized INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        )",
        [],
    )?;
    Ok(())
}

/// 지정된 경로에 SQLite 데이터베이스를 열고 스키마를 초기화한다.
/// `db_path`가 `None`이면 in-memory DB를 사용한다 (테스트용).
pub fn init_database(db_path: Option<PathBuf>) -> rusqlite::Result<Connection> {
    let conn = match db_path {
        Some(path) => {
            if let Some(parent) = path.parent() {
                fs::create_dir_all(parent).map_err(|e| {
                    rusqlite::Error::InvalidPath(std::path::PathBuf::from(format!(
                        "데이터 디렉토리 생성 실패: {e}"
                    )))
                })?;
            }
            Connection::open(path)?
        }
        None => Connection::open_in_memory()?,
    };

    create_schema(&conn)?;
    Ok(conn)
}

/// 앱 데이터 디렉토리 하위의 DB 파일 경로를 계산한다.
pub fn resolve_db_path(app_data_dir: PathBuf) -> PathBuf {
    app_data_dir.join("wordbook.db")
}
