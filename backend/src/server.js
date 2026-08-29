import { createApp } from './app.js';
import { initDatabase, DB_PATH } from './db/database.js';

const PORT = process.env.PORT || 4000;
// 배포판(systemd) 환경에서는 WORD_BOOK_DB_PATH, WORD_BOOK_STATIC_DIR 환경변수로 경로를 지정한다.
const dbPath = process.env.WORD_BOOK_DB_PATH || DB_PATH;
const staticDir = process.env.WORD_BOOK_STATIC_DIR || null;

const db = initDatabase(dbPath);
const app = createApp(db, { staticDir });

app.listen(PORT, () => {
  console.log(`Word Book backend server listening on http://localhost:${PORT}`);
  if (staticDir) {
    console.log(`Serving frontend static files from: ${staticDir}`);
  }
});

// 프로세스 종료 시 DB 연결을 안전하게 닫는다.
function shutdown() {
  db.close();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
