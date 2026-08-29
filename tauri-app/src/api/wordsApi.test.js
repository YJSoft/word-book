import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/core';
import { getWords, addWord, updateWord, toggleWord, deleteWord, ApiError } from './wordsApi.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getWords', () => {
  it('get_words 커맨드를 호출하고 목록을 반환한다', async () => {
    const words = [{ id: 1, word: 'apple', definition: '사과', memorized: false }];
    invoke.mockResolvedValue(words);

    const result = await getWords();

    expect(invoke).toHaveBeenCalledWith('get_words');
    expect(result).toEqual(words);
  });
});

describe('addWord', () => {
  it('add_word 커맨드를 호출한다', async () => {
    const created = { id: 1, word: 'apple', definition: '사과', memorized: false };
    invoke.mockResolvedValue(created);

    const result = await addWord({ word: 'apple', definition: '사과' });

    expect(invoke).toHaveBeenCalledWith('add_word', { word: 'apple', definition: '사과' });
    expect(result).toEqual(created);
  });

  it('DUPLICATE_WORD 에러 시 code가 파싱된 ApiError를 던진다', async () => {
    invoke.mockRejectedValue('DUPLICATE_WORD: 이미 존재하는 단어입니다.');

    await expect(addWord({ word: 'apple', definition: '사과' })).rejects.toMatchObject({
      name: 'ApiError',
      code: 'DUPLICATE_WORD',
      message: '이미 존재하는 단어입니다.',
    });
  });
});

describe('updateWord', () => {
  it('update_word 커맨드를 id와 함께 호출한다', async () => {
    const updated = { id: 1, word: 'apple', definition: '사과(수정)', memorized: false };
    invoke.mockResolvedValue(updated);

    const result = await updateWord(1, { word: 'apple', definition: '사과(수정)' });

    expect(invoke).toHaveBeenCalledWith('update_word', {
      id: 1,
      word: 'apple',
      definition: '사과(수정)',
    });
    expect(result).toEqual(updated);
  });
});

describe('toggleWord', () => {
  it('toggle_word 커맨드를 호출한다', async () => {
    const toggled = { id: 1, word: 'apple', definition: '사과', memorized: true };
    invoke.mockResolvedValue(toggled);

    const result = await toggleWord(1);

    expect(invoke).toHaveBeenCalledWith('toggle_word', { id: 1 });
    expect(result).toEqual(toggled);
  });
});

describe('deleteWord', () => {
  it('delete_word 커맨드를 호출한다', async () => {
    invoke.mockResolvedValue(null);

    await deleteWord(1);

    expect(invoke).toHaveBeenCalledWith('delete_word', { id: 1 });
  });

  it('NOT_FOUND 에러 시 ApiError를 던진다', async () => {
    invoke.mockRejectedValue('NOT_FOUND: 해당 항목을 찾을 수 없습니다.');

    await expect(deleteWord(999)).rejects.toThrow(ApiError);
  });
});
