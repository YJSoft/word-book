const API_BASE_URL = 'http://localhost:4000/api/words';

/**
 * API 에러를 표현하는 커스텀 에러 클래스.
 * status와 서버가 반환한 에러 body를 포함한다.
 */
export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/**
 * fetch 응답을 처리하고, 실패 시 ApiError를 던진다.
 * 204(No Content)는 null을 반환한다.
 */
async function handleResponse(res) {
  if (res.status === 204) {
    return null;
  }

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      body?.error || `요청 실패 (status ${res.status})`,
      res.status,
      body
    );
  }

  return body;
}

/** 전체 단어 목록을 조회한다. */
export async function getWords() {
  const res = await fetch(API_BASE_URL);
  return handleResponse(res);
}

/**
 * 새 단어를 추가한다.
 * @param {{word: string, definition: string, force?: boolean}} payload
 */
export async function addWord(payload) {
  const res = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/**
 * 기존 단어를 수정한다.
 * @param {number} id
 * @param {{word: string, definition: string}} payload
 */
export async function updateWord(id, payload) {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/** 외움 상태를 토글한다. */
export async function toggleWord(id) {
  const res = await fetch(`${API_BASE_URL}/${id}/toggle`, {
    method: 'PATCH',
  });
  return handleResponse(res);
}

/** 단어를 삭제한다. */
export async function deleteWord(id) {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}
