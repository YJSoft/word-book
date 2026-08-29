import { useState, useEffect, useCallback } from 'react';
import WordForm from './components/WordForm.jsx';
import WordList from './components/WordList.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import { getWords, addWord, updateWord, toggleWord, deleteWord, ApiError } from './api/wordsApi.js';

/**
 * pendingAction 형태:
 * - { type: 'delete', id: number }
 * - { type: 'duplicate', payload: {word, definition} }
 */

export default function App() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [editingWord, setEditingWord] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  const loadWords = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await getWords();
      setWords(data);
    } catch (err) {
      setErrorMessage('단어 목록을 불러오지 못했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  async function handleAddOrUpdate(payload) {
    setErrorMessage('');

    if (editingWord) {
      try {
        await updateWord(editingWord.id, payload);
        setEditingWord(null);
        await loadWords();
      } catch (err) {
        setErrorMessage(err instanceof ApiError ? err.message : '수정 중 오류가 발생했습니다.');
      }
      return;
    }

    try {
      await addWord(payload);
      await loadWords();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setPendingAction({ type: 'duplicate', payload });
        return;
      }
      setErrorMessage(err instanceof ApiError ? err.message : '추가 중 오류가 발생했습니다.');
    }
  }

  function handleEdit(item) {
    setEditingWord(item);
  }

  function handleCancelEdit() {
    setEditingWord(null);
  }

  async function handleToggle(id) {
    setErrorMessage('');
    try {
      await toggleWord(id);
      await loadWords();
    } catch (err) {
      setErrorMessage('외움 상태 변경 중 오류가 발생했습니다.');
    }
  }

  function handleDeleteRequest(id) {
    setPendingAction({ type: 'delete', id });
  }

  async function handleConfirm() {
    if (!pendingAction) return;

    setErrorMessage('');
    try {
      if (pendingAction.type === 'delete') {
        await deleteWord(pendingAction.id);
      } else if (pendingAction.type === 'duplicate') {
        await addWord({ ...pendingAction.payload, force: true });
      }
      await loadWords();
    } catch (err) {
      setErrorMessage('작업 처리 중 오류가 발생했습니다.');
    } finally {
      setPendingAction(null);
    }
  }

  function handleCancelDialog() {
    setPendingAction(null);
  }

  const dialogMessage =
    pendingAction?.type === 'delete'
      ? '정말 삭제하시겠습니까?'
      : pendingAction?.type === 'duplicate'
      ? '중복 단어입니다. 정말 다시 추가할까요?'
      : '';

  return (
    <div className="app">
      <h1>단어 암기 Word Book</h1>

      <WordForm
        editingWord={editingWord}
        onSubmit={handleAddOrUpdate}
        onCancelEdit={handleCancelEdit}
      />

      {errorMessage && (
        <p className="app-error" data-testid="app-error-message" role="alert">
          {errorMessage}
        </p>
      )}

      {loading ? (
        <p data-testid="app-loading">불러오는 중...</p>
      ) : (
        <WordList
          words={words}
          onToggle={handleToggle}
          onEdit={handleEdit}
          onDeleteRequest={handleDeleteRequest}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingAction)}
        message={dialogMessage}
        onConfirm={handleConfirm}
        onCancel={handleCancelDialog}
      />
    </div>
  );
}
