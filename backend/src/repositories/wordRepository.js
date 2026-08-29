/**
 * Word Repository - words 테이블에 대한 데이터 액세스 함수 모음.
 * 모든 함수는 초기화된 DatabaseSync 인스턴스를 첫 인자로 받는다.
 */

/**
 * DB row를 API에서 사용하는 Word 객체 형태로 변환한다.
 */
function toWord(row) {
  if (!row) return null;
  return {
    id: row.id,
    word: row.word,
    definition: row.definition,
    memorized: Boolean(row.memorized),
    createdAt: row.created_at,
  };
}

/**
 * 전체 단어 목록을 최근 추가순(내림차순)으로 조회한다.
 * @param {import('node:sqlite').DatabaseSync} db
 * @returns {Array<object>}
 */
export function getAllWords(db) {
  const rows = db
    .prepare('SELECT * FROM words ORDER BY created_at DESC, id DESC')
    .all();
  return rows.map(toWord);
}

/**
 * 정확히 일치하는 단어(word)를 가진 항목이 있는지 조회한다 (중복 체크용).
 * @param {import('node:sqlite').DatabaseSync} db
 * @param {string} word
 * @returns {object|null}
 */
export function findByWord(db, word) {
  const row = db.prepare('SELECT * FROM words WHERE word = ?').get(word);
  return toWord(row);
}

/**
 * 단일 항목을 id로 조회한다.
 * @param {import('node:sqlite').DatabaseSync} db
 * @param {number} id
 * @returns {object|null}
 */
export function findById(db, id) {
  const row = db.prepare('SELECT * FROM words WHERE id = ?').get(id);
  return toWord(row);
}

/**
 * 새 단어 항목을 생성한다.
 * @param {import('node:sqlite').DatabaseSync} db
 * @param {{word: string, definition: string}} data
 * @returns {object} 생성된 Word 객체
 */
export function createWord(db, { word, definition }) {
  const createdAt = new Date().toISOString();
  const result = db
    .prepare(
      'INSERT INTO words (word, definition, memorized, created_at) VALUES (?, ?, 0, ?)'
    )
    .run(word, definition, createdAt);
  return findById(db, Number(result.lastInsertRowid));
}

/**
 * 기존 항목의 단어/뜻을 수정한다.
 * @param {import('node:sqlite').DatabaseSync} db
 * @param {number} id
 * @param {{word: string, definition: string}} data
 * @returns {object|null} 수정된 Word 객체, 없으면 null
 */
export function updateWord(db, id, { word, definition }) {
  const existing = findById(db, id);
  if (!existing) return null;

  db.prepare('UPDATE words SET word = ?, definition = ? WHERE id = ?').run(
    word,
    definition,
    id
  );
  return findById(db, id);
}

/**
 * 항목의 외움(memorized) 상태를 토글한다.
 * @param {import('node:sqlite').DatabaseSync} db
 * @param {number} id
 * @returns {object|null} 갱신된 Word 객체, 없으면 null
 */
export function toggleMemorized(db, id) {
  const existing = findById(db, id);
  if (!existing) return null;

  const newValue = existing.memorized ? 0 : 1;
  db.prepare('UPDATE words SET memorized = ? WHERE id = ?').run(newValue, id);
  return findById(db, id);
}

/**
 * 항목을 삭제한다.
 * @param {import('node:sqlite').DatabaseSync} db
 * @param {number} id
 * @returns {boolean} 삭제되었으면 true, 대상이 없었으면 false
 */
export function deleteWord(db, id) {
  const result = db.prepare('DELETE FROM words WHERE id = ?').run(id);
  return result.changes > 0;
}
