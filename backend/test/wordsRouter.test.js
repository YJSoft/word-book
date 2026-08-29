import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { initDatabase } from '../src/db/database.js';

/** @type {import('node:sqlite').DatabaseSync} */
let db;
/** @type {import('http').Server} */
let server;
let baseUrl;

beforeEach(async () => {
  db = initDatabase(':memory:');
  const app = createApp(db);
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

afterEach(async () => {
  await new Promise((resolve) => server.close(resolve));
  db.close();
});

test('GET /api/words - 초기 상태는 빈 배열', async () => {
  const res = await fetch(`${baseUrl}/api/words`);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.deepEqual(body, []);
});

test('POST /api/words - 정상 생성 시 201과 생성된 항목을 반환', async () => {
  const res = await fetch(`${baseUrl}/api/words`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word: 'apple', definition: '사과' }),
  });
  const body = await res.json();

  assert.equal(res.status, 201);
  assert.equal(body.word, 'apple');
  assert.equal(body.definition, '사과');
  assert.equal(body.memorized, false);
});

test('POST /api/words - 빈 word는 400 에러', async () => {
  const res = await fetch(`${baseUrl}/api/words`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word: '   ', definition: '사과' }),
  });

  assert.equal(res.status, 400);
});

test('POST /api/words - 빈 definition은 400 에러', async () => {
  const res = await fetch(`${baseUrl}/api/words`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word: 'apple', definition: '' }),
  });

  assert.equal(res.status, 400);
});

test('POST /api/words - 중복 단어는 force 없이 409 에러', async () => {
  await fetch(`${baseUrl}/api/words`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word: 'apple', definition: '사과' }),
  });

  const res = await fetch(`${baseUrl}/api/words`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word: 'apple', definition: '사과2' }),
  });
  const body = await res.json();

  assert.equal(res.status, 409);
  assert.equal(body.code, 'DUPLICATE_WORD');
});

test('POST /api/words - 중복 단어도 force=true면 강제 추가됨', async () => {
  await fetch(`${baseUrl}/api/words`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word: 'apple', definition: '사과' }),
  });

  const res = await fetch(`${baseUrl}/api/words`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word: 'apple', definition: '사과2', force: true }),
  });

  assert.equal(res.status, 201);

  const listRes = await fetch(`${baseUrl}/api/words`);
  const list = await listRes.json();
  assert.equal(list.length, 2);
});

test('GET /api/words - 최근 추가한 항목이 먼저 온다', async () => {
  await fetch(`${baseUrl}/api/words`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word: 'first', definition: '첫번째' }),
  });
  await fetch(`${baseUrl}/api/words`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word: 'second', definition: '두번째' }),
  });

  const res = await fetch(`${baseUrl}/api/words`);
  const body = await res.json();

  assert.equal(body[0].word, 'second');
  assert.equal(body[1].word, 'first');
});

test('PUT /api/words/:id - 정상 수정', async () => {
  const createRes = await fetch(`${baseUrl}/api/words`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word: 'cat', definition: '고양이' }),
  });
  const created = await createRes.json();

  const res = await fetch(`${baseUrl}/api/words/${created.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word: 'cat', definition: '고양이(수정)' }),
  });
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.definition, '고양이(수정)');
});

test('PUT /api/words/:id - 존재하지 않는 id는 404', async () => {
  const res = await fetch(`${baseUrl}/api/words/9999`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word: 'x', definition: 'y' }),
  });

  assert.equal(res.status, 404);
});

test('PATCH /api/words/:id/toggle - 외움 상태 토글', async () => {
  const createRes = await fetch(`${baseUrl}/api/words`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word: 'dog', definition: '개' }),
  });
  const created = await createRes.json();

  const res = await fetch(`${baseUrl}/api/words/${created.id}/toggle`, {
    method: 'PATCH',
  });
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.memorized, true);
});

test('PATCH /api/words/:id/toggle - 존재하지 않는 id는 404', async () => {
  const res = await fetch(`${baseUrl}/api/words/9999/toggle`, {
    method: 'PATCH',
  });

  assert.equal(res.status, 404);
});

test('DELETE /api/words/:id - 정상 삭제 시 204', async () => {
  const createRes = await fetch(`${baseUrl}/api/words`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word: 'elephant', definition: '코끼리' }),
  });
  const created = await createRes.json();

  const res = await fetch(`${baseUrl}/api/words/${created.id}`, {
    method: 'DELETE',
  });

  assert.equal(res.status, 204);

  const listRes = await fetch(`${baseUrl}/api/words`);
  const list = await listRes.json();
  assert.equal(list.length, 0);
});

test('DELETE /api/words/:id - 존재하지 않는 id는 404', async () => {
  const res = await fetch(`${baseUrl}/api/words/9999`, {
    method: 'DELETE',
  });

  assert.equal(res.status, 404);
});
