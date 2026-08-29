import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getWords, addWord, updateWord, toggleWord, deleteWord, ApiError } from './wordsApi.js';

function mockFetchResponse({ status = 200, body = null }) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: vi.fn().mockResolvedValue(body),
  };
}

beforeEach(() => {
  global.fetch = vi.fn();
});

describe('getWords', () => {
  it('GET 요청을 보내고 목록을 반환한다', async () => {
    const words = [{ id: 1, word: 'apple', definition: '사과', memorized: false }];
    global.fetch.mockResolvedValue(mockFetchResponse({ status: 200, body: words }));

    const result = await getWords();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/api/words');
    expect(result).toEqual(words);
  });
});

describe('addWord', () => {
  it('POST 요청으로 단어를 추가한다', async () => {
    const created = { id: 1, word: 'apple', definition: '사과', memorized: false };
    global.fetch.mockResolvedValue(mockFetchResponse({ status: 201, body: created }));

    const result = await addWord({ word: 'apple', definition: '사과' });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/words',
      expect.objectContaining({ method: 'POST' })
    );
    expect(result).toEqual(created);
  });

  it('중복 단어(409) 시 ApiError를 던진다', async () => {
    const errorBody = { error: '이미 존재하는 단어입니다.', code: 'DUPLICATE_WORD' };
    global.fetch.mockResolvedValue(mockFetchResponse({ status: 409, body: errorBody }));

    await expect(addWord({ word: 'apple', definition: '사과' })).rejects.toThrow(ApiError);
  });
});

describe('updateWord', () => {
  it('PUT 요청으로 단어를 수정한다', async () => {
    const updated = { id: 1, word: 'apple', definition: '사과(수정)', memorized: false };
    global.fetch.mockResolvedValue(mockFetchResponse({ status: 200, body: updated }));

    const result = await updateWord(1, { word: 'apple', definition: '사과(수정)' });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/words/1',
      expect.objectContaining({ method: 'PUT' })
    );
    expect(result).toEqual(updated);
  });
});

describe('toggleWord', () => {
  it('PATCH 요청으로 외움 상태를 토글한다', async () => {
    const toggled = { id: 1, word: 'apple', definition: '사과', memorized: true };
    global.fetch.mockResolvedValue(mockFetchResponse({ status: 200, body: toggled }));

    const result = await toggleWord(1);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/words/1/toggle',
      expect.objectContaining({ method: 'PATCH' })
    );
    expect(result).toEqual(toggled);
  });
});

describe('deleteWord', () => {
  it('DELETE 요청으로 단어를 삭제하고 204는 null을 반환한다', async () => {
    global.fetch.mockResolvedValue(mockFetchResponse({ status: 204, body: null }));

    const result = await deleteWord(1);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/words/1',
      expect.objectContaining({ method: 'DELETE' })
    );
    expect(result).toBeNull();
  });

  it('404 시 ApiError를 던진다', async () => {
    global.fetch.mockResolvedValue(
      mockFetchResponse({ status: 404, body: { error: '해당 항목을 찾을 수 없습니다.' } })
    );

    await expect(deleteWord(999)).rejects.toThrow(ApiError);
  });
});
