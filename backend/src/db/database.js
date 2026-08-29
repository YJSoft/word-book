import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// data/ 디렉토리는 프로젝트 루트 기준 (backend/src/db -> ../../../data)
const DATA_DIR = join(__dirname, '..', '..', '..', 'data');
const DB_PATH = join(DATA_DIR, 'wordbook.db');

/**
 * SQLite 데이터베이스를 초기화하고 연결을 반환한다.
 * data/ 디렉토리가 없으면 생성하고, words 테이블이 없으면 생성한다.
 * @returns {DatabaseSync}
 */
export function initDatabase(dbPath = DB_PATH) {
  if (dbPath !== ':memory:') {
    const dir = dirname(dbPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  const db = new DatabaseSync(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL,
      definition TEXT NOT NULL,
      memorized INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);

  return db;
}

export { DB_PATH };
