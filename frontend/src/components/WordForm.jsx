import { useState, useEffect } from 'react';

/**
 * 단어/뜻 입력 폼. 추가와 수정 모드를 겸용한다.
 * @param {{word: string, definition: string}|null} editingWord - 수정 중인 항목 (없으면 추가 모드)
 * @param {(payload: {word: string, definition: string}) => void} onSubmit
 * @param {() => void} onCancelEdit - 수정 모드 취소
 */
export default function WordForm({ editingWord, onSubmit, onCancelEdit }) {
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [error, setError] = useState('');

  const isEditMode = Boolean(editingWord);

  useEffect(() => {
    if (editingWord) {
      setWord(editingWord.word);
      setDefinition(editingWord.definition);
    } else {
      setWord('');
      setDefinition('');
    }
    setError('');
  }, [editingWord]);

  function handleSubmit(e) {
    e.preventDefault();

    if (!word.trim()) {
      setError('단어를 입력해주세요.');
      return;
    }
    if (!definition.trim()) {
      setError('뜻을 입력해주세요.');
      return;
    }

    setError('');
    onSubmit({ word: word.trim(), definition: definition.trim() });

    if (!isEditMode) {
      setWord('');
      setDefinition('');
    }
  }

  return (
    <form className="word-form" onSubmit={handleSubmit} data-testid="word-form">
      <div className="word-form-field">
        <label htmlFor="word-input">단어</label>
        <input
          id="word-input"
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          data-testid="word-form-word-input"
        />
      </div>
      <div className="word-form-field">
        <label htmlFor="definition-input">뜻</label>
        <input
          id="definition-input"
          type="text"
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
          data-testid="word-form-definition-input"
        />
      </div>

      {error && (
        <p className="word-form-error" data-testid="word-form-error">
          {error}
        </p>
      )}

      <div className="word-form-actions">
        <button type="submit" data-testid="word-form-submit-button">
          {isEditMode ? '수정 완료' : '단어 추가'}
        </button>
        {isEditMode && (
          <button
            type="button"
            onClick={onCancelEdit}
            data-testid="word-form-cancel-button"
          >
            취소
          </button>
        )}
      </div>
    </form>
  );
}
