import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App.jsx';
import * as wordsApi from './api/wordsApi.js';

vi.mock('./api/wordsApi.js', async () => {
  const actual = await vi.importActual('./api/wordsApi.js');
  return {
    ...actual,
    getWords: vi.fn(),
    addWord: vi.fn(),
    updateWord: vi.fn(),
    toggleWord: vi.fn(),
    deleteWord: vi.fn(),
  };
});

const sampleWords = [
  { id: 1, word: 'apple', definition: '사과', memorized: false },
  { id: 2, word: 'banana', definition: '바나나', memorized: true },
];

beforeEach(() => {
  vi.clearAllMocks();
  wordsApi.getWords.mockResolvedValue([...sampleWords]);
});

describe('App', () => {
  it('초기 로드 시 단어 목록을 표시한다', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('apple')).toBeInTheDocument();
    });
    expect(screen.getByText('banana')).toBeInTheDocument();
  });

  it('목록이 비어있으면 안내 문구를 표시한다', async () => {
    wordsApi.getWords.mockResolvedValue([]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('word-list-empty')).toBeInTheDocument();
    });
  });

  it('새 단어를 추가하면 addWord가 호출되고 목록이 갱신된다', async () => {
    wordsApi.addWord.mockResolvedValue({
      id: 3,
      word: 'cherry',
      definition: '체리',
      memorized: false,
    });
    render(<App />);
    await waitFor(() => expect(screen.getByText('apple')).toBeInTheDocument());

    fireEvent.change(screen.getByTestId('word-form-word-input'), {
      target: { value: 'cherry' },
    });
    fireEvent.change(screen.getByTestId('word-form-definition-input'), {
      target: { value: '체리' },
    });
    fireEvent.click(screen.getByTestId('word-form-submit-button'));

    await waitFor(() => {
      expect(wordsApi.addWord).toHaveBeenCalledWith({ word: 'cherry', definition: '체리' });
    });
  });

  it('중복 단어(ApiError code=DUPLICATE_WORD) 추가 시 확인 다이얼로그가 뜨고, 확인하면 force=true로 재요청한다', async () => {
    const duplicateError = new wordsApi.ApiError('DUPLICATE_WORD: 이미 존재하는 단어입니다.');
    wordsApi.addWord
      .mockRejectedValueOnce(duplicateError)
      .mockResolvedValueOnce({ id: 4, word: 'apple', definition: '사과2', memorized: false });

    render(<App />);
    await waitFor(() => expect(screen.getByText('apple')).toBeInTheDocument());

    fireEvent.change(screen.getByTestId('word-form-word-input'), {
      target: { value: 'apple' },
    });
    fireEvent.change(screen.getByTestId('word-form-definition-input'), {
      target: { value: '사과2' },
    });
    fireEvent.click(screen.getByTestId('word-form-submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });
    expect(screen.getByText('중복 단어입니다. 정말 다시 추가할까요?')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('confirm-dialog-confirm-button'));

    await waitFor(() => {
      expect(wordsApi.addWord).toHaveBeenCalledWith({
        word: 'apple',
        definition: '사과2',
        force: true,
      });
    });
  });

  it('삭제 버튼 클릭 시 확인 다이얼로그가 뜨고, 확인하면 deleteWord가 호출된다', async () => {
    wordsApi.deleteWord.mockResolvedValue(null);
    render(<App />);
    await waitFor(() => expect(screen.getByText('apple')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('word-item-delete-button-1'));

    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });
    expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('confirm-dialog-confirm-button'));

    await waitFor(() => {
      expect(wordsApi.deleteWord).toHaveBeenCalledWith(1);
    });
  });

  it('삭제 확인 다이얼로그에서 취소하면 deleteWord가 호출되지 않는다', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText('apple')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('word-item-delete-button-1'));
    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('confirm-dialog-cancel-button'));

    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
    expect(wordsApi.deleteWord).not.toHaveBeenCalled();
  });

  it('외움 체크박스 토글 시 toggleWord가 호출된다', async () => {
    wordsApi.toggleWord.mockResolvedValue({ ...sampleWords[0], memorized: true });
    render(<App />);
    await waitFor(() => expect(screen.getByText('apple')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('word-item-toggle-checkbox-1'));

    await waitFor(() => {
      expect(wordsApi.toggleWord).toHaveBeenCalledWith(1);
    });
  });

  it('수정 버튼 클릭 후 제출하면 updateWord가 호출된다', async () => {
    wordsApi.updateWord.mockResolvedValue({ ...sampleWords[0], definition: '사과(수정)' });
    render(<App />);
    await waitFor(() => expect(screen.getByText('apple')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('word-item-edit-button-1'));
    fireEvent.change(screen.getByTestId('word-form-definition-input'), {
      target: { value: '사과(수정)' },
    });
    fireEvent.click(screen.getByTestId('word-form-submit-button'));

    await waitFor(() => {
      expect(wordsApi.updateWord).toHaveBeenCalledWith(1, {
        word: 'apple',
        definition: '사과(수정)',
      });
    });
  });
});
