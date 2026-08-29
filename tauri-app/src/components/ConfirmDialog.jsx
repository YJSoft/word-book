/**
 * 재사용 가능한 확인 다이얼로그.
 * 삭제 확인, 중복 단어 강제 추가 확인 등에 사용된다.
 */
export default function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="confirm-dialog-overlay" role="presentation">
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-label={message}
        data-testid="confirm-dialog"
      >
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <button
            type="button"
            onClick={onCancel}
            data-testid="confirm-dialog-cancel-button"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            data-testid="confirm-dialog-confirm-button"
            className="confirm-dialog-confirm"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
