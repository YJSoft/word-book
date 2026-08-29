import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { initDatabase } from '../src/db/database.js';
import {
  getAllWords,
  findByWord,
  findById,
  createWord,
  updateWord,
  toggleMemorized,
  deleteWord,
} from '../src/repositories/wordRepository.js';

/** @type {import('node:sqlite').DatabaseSync} */
let db;

beforeEach(() => {
  db = initDatabase(':memory:');
});

test('createWord - 새 항목을 생성하고 기본값을 확인한다', () => {
  const created = createWord(db, { word: 'apple', definition: '사과' });

  assert.equal(created.word, 'apple');
  assert.equal(created.definition, '사과');
  assert.equal(created.memorized, false);
  assert.ok(created.id);
  assert.ok(created.createdAt);
});

test('getAllWords - 최근 추가한 항목이 먼저 오도록 정렬된다', () => {
  createWord(db, { word: 'first', definition: '첫번째' });
  createWord(db, { word: 'second', definition: '두번째' });
  createWord(db, { word: 'third', definition: '세번째' });

  const words = getAllWords(db);

  assert.equal(words.length, 3);
  assert.equal(words[0].word, 'third');
  assert.equal(words[1].word, 'second');
  assert.equal(words[2].word, 'first');
});

test('findByWord - 정확히 일치하는 단어를 찾는다', () => {
  createWord(db, { word: 'banana', definition: '바나나' });

  const found = findByWord(db, 'banana');
  const notFound = findByWord(db, 'nonexistent');

  assert.equal(found.word, 'banana');
  assert.equal(notFound, null);
});

test('updateWord - 존재하는 항목을 수정한다', () => {
  const created = createWord(db, { word: 'cat', definition: '고양이' });

  const updated = updateWord(db, created.id, {
    word: 'cat',
    definition: '고양이 (수정됨)',
  });

  assert.equal(updated.definition, '고양이 (수정됨)');
});

test('updateWord - 존재하지 않는 id는 null을 반환한다', () => {
  const result = updateWord(db, 9999, { word: 'x', definition: 'y' });
  assert.equal(result, null);
});

test('toggleMemorized - 외움 상태를 토글한다', () => {
  const created = createWord(db, { word: 'dog', definition: '개' });
  assert.equal(created.memorized, false);

  const toggled1 = toggleMemorized(db, created.id);
  assert.equal(toggled1.memorized, true);

  const toggled2 = toggleMemorized(db, created.id);
  assert.equal(toggled2.memorized, false);
});

test('toggleMemorized - 존재하지 않는 id는 null을 반환한다', () => {
  const result = toggleMemorized(db, 9999);
  assert.equal(result, null);
});

test('deleteWord - 존재하는 항목을 삭제하고 true를 반환한다', () => {
  const created = createWord(db, { word: 'elephant', definition: '코끼리' });

  const deleted = deleteWord(db, created.id);
  const afterDelete = findById(db, created.id);

  assert.equal(deleted, true);
  assert.equal(afterDelete, null);
});

test('deleteWord - 존재하지 않는 id는 false를 반환한다', () => {
  const result = deleteWord(db, 9999);
  assert.equal(result, false);
});
