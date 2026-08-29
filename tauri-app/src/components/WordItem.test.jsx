import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WordItem from './WordItem.jsx';

const sampleItem = { id: 1, word: 'apple', definition: '사과', memorized: false };

describe('WordItem', () => {
  it('단어와 뜻을 표시한다', () => {
    render(
      <WordItem item={sampleItem} onToggle={vi.fn()} onEdit={vi.fn()} onDeleteRequest={vi.fn()} />
    );

    expect(screen.getByText('apple')).toBeInTheDocument();
    expect(screen.getByText(/사과/)).toBeInTheDocument();
  });

  it('체크박스 클릭 시 onToggle이 해당 id로 호출된다', () => {
    const onToggle = vi.fn();
    render(
      <WordItem item={sampleItem} onToggle={onToggle} onEdit={vi.fn()} onDeleteRequest={vi.fn()} />
    );

    fireEvent.click(screen.getByTestId('word-item-toggle-checkbox-1'));

    expect(onToggle).toHaveBeenCalledWith(1);
  });

  it('수정 버튼 클릭 시 onEdit이 item 객체로 호출된다', () => {
    const onEdit = vi.fn();
    render(
      <WordItem item={sampleItem} onToggle={vi.fn()} onEdit={onEdit} onDeleteRequest={vi.fn()} />
    );

    fireEvent.click(screen.getByTestId('word-item-edit-button-1'));

    expect(onEdit).toHaveBeenCalledWith(sampleItem);
  });

  it('삭제 버튼 클릭 시 onDeleteRequest가 해당 id로 호출된다', () => {
    const onDeleteRequest = vi.fn();
    render(
      <WordItem
        item={sampleItem}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDeleteRequest={onDeleteRequest}
      />
    );

    fireEvent.click(screen.getByTestId('word-item-delete-button-1'));

    expect(onDeleteRequest).toHaveBeenCalledWith(1);
  });

  it('memorized가 true이면 체크박스가 체크된 상태로 렌더링된다', () => {
    const memorizedItem = { ...sampleItem, memorized: true };
    render(
      <WordItem
        item={memorizedItem}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDeleteRequest={vi.fn()}
      />
    );

    expect(screen.getByTestId('word-item-toggle-checkbox-1')).toBeChecked();
  });
});
