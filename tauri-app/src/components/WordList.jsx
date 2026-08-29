import WordItem from './WordItem.jsx';

/**
 * 단어 목록을 렌더링한다. 목록이 비어있으면 안내 문구를 표시한다.
 * @param {Array<object>} words
 */
export default function WordList({ words, onToggle, onEdit, onDeleteRequest }) {
  if (words.length === 0) {
    return (
      <p className="word-list-empty" data-testid="word-list-empty">
        아직 등록된 단어가 없습니다. 위 폼에서 단어를 추가해보세요.
      </p>
    );
  }

  return (
    <ul className="word-list" data-testid="word-list">
      {words.map((item) => (
        <WordItem
          key={item.id}
          item={item}
          onToggle={onToggle}
          onEdit={onEdit}
          onDeleteRequest={onDeleteRequest}
        />
      ))}
    </ul>
  );
}
