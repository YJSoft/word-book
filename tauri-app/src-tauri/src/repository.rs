use crate::models::Word;
use chrono::Utc;
use rusqlite::{Connection, OptionalExtension, params};

fn row_to_word(row: &rusqlite::Row) -> rusqlite::Result<Word> {
    Ok(Word {
        id: row.get(0)?,
        word: row.get(1)?,
        definition: row.get(2)?,
        memorized: row.get::<_, i64>(3)? != 0,
        created_at: row.get(4)?,
    })
}

/// 전체 단어 목록을 최근 추가순(내림차순)으로 조회한다.
pub fn get_all_words(conn: &Connection) -> rusqlite::Result<Vec<Word>> {
    let mut stmt = conn.prepare(
        "SELECT id, word, definition, memorized, created_at FROM words ORDER BY created_at DESC, id DESC",
    )?;
    let rows = stmt.query_map([], row_to_word)?;
    rows.collect()
}

/// 정확히 일치하는 단어를 검색한다 (중복 체크용).
pub fn find_by_word(conn: &Connection, word: &str) -> rusqlite::Result<Option<Word>> {
    conn.query_row(
        "SELECT id, word, definition, memorized, created_at FROM words WHERE word = ?1",
        params![word],
        row_to_word,
    )
    .optional()
}

/// id로 단일 항목을 조회한다.
pub fn find_by_id(conn: &Connection, id: i64) -> rusqlite::Result<Option<Word>> {
    conn.query_row(
        "SELECT id, word, definition, memorized, created_at FROM words WHERE id = ?1",
        params![id],
        row_to_word,
    )
    .optional()
}

/// 새 단어 항목을 생성한다.
pub fn create_word(conn: &Connection, word: &str, definition: &str) -> rusqlite::Result<Word> {
    let created_at = Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO words (word, definition, memorized, created_at) VALUES (?1, ?2, 0, ?3)",
        params![word, definition, created_at],
    )?;
    let id = conn.last_insert_rowid();
    find_by_id(conn, id).map(|opt| opt.expect("방금 생성한 항목을 찾을 수 없음"))
}

/// 기존 항목의 단어/뜻을 수정한다. 존재하지 않으면 `None`을 반환한다.
pub fn update_word(
    conn: &Connection,
    id: i64,
    word: &str,
    definition: &str,
) -> rusqlite::Result<Option<Word>> {
    if find_by_id(conn, id)?.is_none() {
        return Ok(None);
    }
    conn.execute(
        "UPDATE words SET word = ?1, definition = ?2 WHERE id = ?3",
        params![word, definition, id],
    )?;
    find_by_id(conn, id)
}

/// 외움(memorized) 상태를 토글한다. 존재하지 않으면 `None`을 반환한다.
pub fn toggle_memorized(conn: &Connection, id: i64) -> rusqlite::Result<Option<Word>> {
    let existing = match find_by_id(conn, id)? {
        Some(w) => w,
        None => return Ok(None),
    };
    let new_value = if existing.memorized { 0 } else { 1 };
    conn.execute(
        "UPDATE words SET memorized = ?1 WHERE id = ?2",
        params![new_value, id],
    )?;
    find_by_id(conn, id)
}

/// 항목을 삭제한다. 삭제되었으면 `true`, 대상이 없었으면 `false`를 반환한다.
pub fn delete_word(conn: &Connection, id: i64) -> rusqlite::Result<bool> {
    let affected = conn.execute("DELETE FROM words WHERE id = ?1", params![id])?;
    Ok(affected > 0)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::init_database;

    fn setup() -> Connection {
        init_database(None).expect("in-memory DB 초기화 실패")
    }

    #[test]
    fn create_word_생성_기본값_확인() {
        let conn = setup();
        let created = create_word(&conn, "apple", "사과").unwrap();

        assert_eq!(created.word, "apple");
        assert_eq!(created.definition, "사과");
        assert!(!created.memorized);
        assert!(created.id > 0);
    }

    #[test]
    fn get_all_words_최근순_정렬() {
        let conn = setup();
        create_word(&conn, "first", "첫번째").unwrap();
        create_word(&conn, "second", "두번째").unwrap();
        create_word(&conn, "third", "세번째").unwrap();

        let words = get_all_words(&conn).unwrap();

        assert_eq!(words.len(), 3);
        assert_eq!(words[0].word, "third");
        assert_eq!(words[1].word, "second");
        assert_eq!(words[2].word, "first");
    }

    #[test]
    fn find_by_word_정확히_일치() {
        let conn = setup();
        create_word(&conn, "banana", "바나나").unwrap();

        let found = find_by_word(&conn, "banana").unwrap();
        let not_found = find_by_word(&conn, "nonexistent").unwrap();

        assert!(found.is_some());
        assert_eq!(found.unwrap().word, "banana");
        assert!(not_found.is_none());
    }

    #[test]
    fn update_word_존재하는_항목_수정() {
        let conn = setup();
        let created = create_word(&conn, "cat", "고양이").unwrap();

        let updated = update_word(&conn, created.id, "cat", "고양이(수정)").unwrap();

        assert!(updated.is_some());
        assert_eq!(updated.unwrap().definition, "고양이(수정)");
    }

    #[test]
    fn update_word_존재하지않는_id_는_none() {
        let conn = setup();
        let result = update_word(&conn, 9999, "x", "y").unwrap();
        assert!(result.is_none());
    }

    #[test]
    fn toggle_memorized_상태_토글() {
        let conn = setup();
        let created = create_word(&conn, "dog", "개").unwrap();
        assert!(!created.memorized);

        let toggled1 = toggle_memorized(&conn, created.id).unwrap().unwrap();
        assert!(toggled1.memorized);

        let toggled2 = toggle_memorized(&conn, created.id).unwrap().unwrap();
        assert!(!toggled2.memorized);
    }

    #[test]
    fn toggle_memorized_존재하지않는_id_는_none() {
        let conn = setup();
        let result = toggle_memorized(&conn, 9999).unwrap();
        assert!(result.is_none());
    }

    #[test]
    fn delete_word_존재하는_항목_삭제() {
        let conn = setup();
        let created = create_word(&conn, "elephant", "코끼리").unwrap();

        let deleted = delete_word(&conn, created.id).unwrap();
        let after = find_by_id(&conn, created.id).unwrap();

        assert!(deleted);
        assert!(after.is_none());
    }

    #[test]
    fn delete_word_존재하지않는_id_는_false() {
        let conn = setup();
        let result = delete_word(&conn, 9999).unwrap();
        assert!(!result);
    }
}
