import { Router } from 'express';
import {
  getAllWords,
  findByWord,
  findById,
  createWord,
  updateWord,
  toggleMemorized,
  deleteWord,
} from '../repositories/wordRepository.js';

/**
 * 문자열이 비어있는지(공백만 있는 경우 포함) 확인한다.
 * @param {unknown} value
 * @returns {boolean}
 */
function isBlank(value) {
  return typeof value !== 'string' || value.trim().length === 0;
}

/**
 * word/definition 요청 body를 검증한다.
 * @param {unknown} body
 * @returns {string|null} 에러 메시지, 유효하면 null
 */
function validateWordPayload(body) {
  if (!body || typeof body !== 'object') {
    return '요청 본문이 올바르지 않습니다.';
  }
  if (isBlank(body.word)) {
    return '단어(word)는 필수이며 공백일 수 없습니다.';
  }
  if (isBlank(body.definition)) {
    return '뜻(definition)은 필수이며 공백일 수 없습니다.';
  }
  return null;
}

/**
 * id 경로 파라미터를 정수로 파싱한다.
 * @param {string} raw
 * @returns {number|null}
 */
function parseId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/**
 * words 관련 REST API 라우터를 생성한다.
 * @param {import('node:sqlite').DatabaseSync} db
 * @returns {Router}
 */
export function createWordsRouter(db) {
  const router = Router();

  // GET /api/words - 전체 목록 조회 (최근 추가순)
  router.get('/', (req, res) => {
    const words = getAllWords(db);
    res.json(words);
  });

  // POST /api/words - 단어 추가 (중복 시 force 플래그 없으면 409)
  router.post('/', (req, res) => {
    const validationError = validateWordPayload(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const word = req.body.word.trim();
    const definition = req.body.definition.trim();
    const force = req.body.force === true;

    const existing = findByWord(db, word);
    if (existing && !force) {
      return res.status(409).json({
        error: '이미 존재하는 단어입니다.',
        code: 'DUPLICATE_WORD',
        existing,
      });
    }

    const created = createWord(db, { word, definition });
    res.status(201).json(created);
  });

  // PUT /api/words/:id - 단어/뜻 수정
  router.put('/:id', (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: '유효하지 않은 id입니다.' });
    }

    const validationError = validateWordPayload(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const word = req.body.word.trim();
    const definition = req.body.definition.trim();

    const updated = updateWord(db, id, { word, definition });
    if (!updated) {
      return res.status(404).json({ error: '해당 항목을 찾을 수 없습니다.' });
    }
    res.json(updated);
  });

  // PATCH /api/words/:id/toggle - 외움 상태 토글
  router.patch('/:id/toggle', (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: '유효하지 않은 id입니다.' });
    }

    const toggled = toggleMemorized(db, id);
    if (!toggled) {
      return res.status(404).json({ error: '해당 항목을 찾을 수 없습니다.' });
    }
    res.json(toggled);
  });

  // DELETE /api/words/:id - 단어 삭제
  router.delete('/:id', (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: '유효하지 않은 id입니다.' });
    }

    const existing = findById(db, id);
    if (!existing) {
      return res.status(404).json({ error: '해당 항목을 찾을 수 없습니다.' });
    }

    deleteWord(db, id);
    res.status(204).end();
  });

  return router;
}
