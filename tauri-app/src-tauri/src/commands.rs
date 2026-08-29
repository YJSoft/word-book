use crate::models::Word;
use crate::repository;
use crate::AppState;
use tauri::State;

fn is_blank(s: &str) -> bool {
    s.trim().is_empty()
}

fn validate_payload(word: &str, definition: &str) -> Result<(), String> {
    if is_blank(word) {
        return Err("단어(word)는 필수이며 공백일 수 없습니다.".to_string());
    }
    if is_blank(definition) {
        return Err("뜻(definition)은 필수이며 공백일 수 없습니다.".to_string());
    }
    Ok(())
}

/// 전체 단어 목록을 조회한다 (최근 추가순).
#[tauri::command]
pub async fn get_words(state: State<'_, AppState>) -> Result<Vec<Word>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    repository::get_all_words(&conn).map_err(|e| e.to_string())
}

/// 새 단어를 추가한다. 중복 단어는 `force`가 true가 아니면 에러를 반환한다.
#[tauri::command]
pub async fn add_word(
    state: State<'_, AppState>,
    word: String,
    definition: String,
    force: Option<bool>,
) -> Result<Word, String> {
    let word = word.trim().to_string();
    let definition = definition.trim().to_string();
    validate_payload(&word, &definition)?;

    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let existing = repository::find_by_word(&conn, &word).map_err(|e| e.to_string())?;
    if existing.is_some() && !force.unwrap_or(false) {
        return Err("DUPLICATE_WORD: 이미 존재하는 단어입니다.".to_string());
    }

    repository::create_word(&conn, &word, &definition).map_err(|e| e.to_string())
}

/// 기존 단어를 수정한다.
#[tauri::command]
pub async fn update_word(
    state: State<'_, AppState>,
    id: i64,
    word: String,
    definition: String,
) -> Result<Word, String> {
    let word = word.trim().to_string();
    let definition = definition.trim().to_string();
    validate_payload(&word, &definition)?;

    let conn = state.db.lock().map_err(|e| e.to_string())?;
    repository::update_word(&conn, id, &word, &definition)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "NOT_FOUND: 해당 항목을 찾을 수 없습니다.".to_string())
}

/// 외움 상태를 토글한다.
#[tauri::command]
pub async fn toggle_word(state: State<'_, AppState>, id: i64) -> Result<Word, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    repository::toggle_memorized(&conn, id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "NOT_FOUND: 해당 항목을 찾을 수 없습니다.".to_string())
}

/// 단어를 삭제한다.
#[tauri::command]
pub async fn delete_word(state: State<'_, AppState>, id: i64) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let deleted = repository::delete_word(&conn, id).map_err(|e| e.to_string())?;
    if deleted {
        Ok(())
    } else {
        Err("NOT_FOUND: 해당 항목을 찾을 수 없습니다.".to_string())
    }
}
