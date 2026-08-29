mod commands;
mod db;
mod models;
mod repository;

use rusqlite::Connection;
use std::sync::Mutex;
use tauri::Manager;

/// 앱 전역에서 공유되는 상태. DB 커넥션을 Mutex로 감싸 동시 접근을 직렬화한다.
pub struct AppState {
    pub db: Mutex<Connection>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("앱 데이터 디렉토리를 확인할 수 없습니다");
            let db_path = db::resolve_db_path(app_data_dir);
            let conn = db::init_database(Some(db_path)).expect("데이터베이스 초기화 실패");
            app.manage(AppState { db: Mutex::new(conn) });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_words,
            commands::add_word,
            commands::update_word,
            commands::toggle_word,
            commands::delete_word,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
