import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WordForm from './WordForm.jsx';

describe('WordForm', () => {
  it('빈 단어로 제출하면 에러 메시지를 표시하고 onSubmit을 호출하지 않는다', () => {
    const onSubmit = vi.fn();
    render(<WordForm editingWord={null} onSubmit={onSubmit} onCancelEdit={vi.fn()} />);

    fireEvent.click(screen.getByTestId('word-form-submit-button'));

    expect(screen.getByTestId('word-form-error')).toHaveTextContent('단어를 입력해주세요.');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('빈 뜻으로 제출하면 에러 메시지를 표시한다', () => {
    const onSubmit = vi.fn();
    render(<WordForm editingWord={null} onSubmit={onSubmit} onCancelEdit={vi.fn()} />);

    fireEvent.change(screen.getByTestId('word-form-word-input'), {
      target: { value: 'apple' },
    });
    fireEvent.click(screen.getByTestId('word-form-submit-button'));

    expect(screen.getByTestId('word-form-error')).toHaveTextContent('뜻을 입력해주세요.');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('유효한 입력으로 제출하면 onSubmit이 trim된 값으로 호출된다', () => {
    const onSubmit = vi.fn();
    render(<WordForm editingWord={null} onSubmit={onSubmit} onCancelEdit={vi.fn()} />);

    fireEvent.change(screen.getByTestId('word-form-word-input'), {
      target: { value: '  apple  ' },
    });
    fireEvent.change(screen.getByTestId('word-form-definition-input'), {
      target: { value: '  사과  ' },
    });
    fireEvent.click(screen.getByTestId('word-form-submit-button'));

    expect(onSubmit).toHaveBeenCalledWith({ word: 'apple', definition: '사과' });
  });

  it('수정 모드에서는 기존 값이 채워지고 취소 버튼이 표시된다', () => {
    const editingWord = { id: 1, word: 'apple', definition: '사과', memorized: false };
    render(<WordForm editingWord={editingWord} onSubmit={vi.fn()} onCancelEdit={vi.fn()} />);

    expect(screen.getByTestId('word-form-word-input')).toHaveValue('apple');
    expect(screen.getByTestId('word-form-definition-input')).toHaveValue('사과');
    expect(screen.getByTestId('word-form-cancel-button')).toBeInTheDocument();
    expect(screen.getByTestId('word-form-submit-button')).toHaveTextContent('수정 완료');
  });

  it('취소 버튼 클릭 시 onCancelEdit이 호출된다', () => {
    const onCancelEdit = vi.fn();
    const editingWord = { id: 1, word: 'apple', definition: '사과', memorized: false };
    render(<WordForm editingWord={editingWord} onSubmit={vi.fn()} onCancelEdit={onCancelEdit} />);

    fireEvent.click(screen.getByTestId('word-form-cancel-button'));

    expect(onCancelEdit).toHaveBeenCalled();
  });
});
