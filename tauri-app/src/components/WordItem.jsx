/**
 * 개별 단어 항목. 외움 체크 토글, 수정/삭제 버튼을 포함한다.
 * @param {{id: number, word: string, definition: string, memorized: boolean}} item
 */
export default function WordItem({ item, onToggle, onEdit, onDeleteRequest }) {
  return (
    <li className="word-item" data-testid={`word-item-${item.id}`}>
      <label className="word-item-checkbox-label">
        <input
          type="checkbox"
          checked={item.memorized}
          onChange={() => onToggle(item.id)}
          data-testid={`word-item-toggle-checkbox-${item.id}`}
        />
        <span className={item.memorized ? 'word-item-memorized' : ''}>
          <strong>{item.word}</strong> — {item.definition}
        </span>
      </label>

      <div className="word-item-actions">
        <button
          type="button"
          onClick={() => onEdit(item)}
          data-testid={`word-item-edit-button-${item.id}`}
        >
          수정
        </button>
        <button
          type="button"
          onClick={() => onDeleteRequest(item.id)}
          data-testid={`word-item-delete-button-${item.id}`}
        >
          삭제
        </button>
      </div>
    </li>
  );
}
