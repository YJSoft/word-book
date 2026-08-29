import { invoke } from '@tauri-apps/api/core';

/**
 * Tauri 커맨드 에러(문자열)를 표현하는 커스텀 에러 클래스.
 * Rust 커맨드는 `Result<T, String>`을 반환하므로, invoke 실패 시 문자열 메시지를 받는다.
 * 문자열에 `CODE: message` 형식이 포함되면 code/message로 분리해 파싱한다.
 */
export class ApiError extends Error {
  constructor(rawMessage) {
    const match = /^([A-Z_]+):\s*(.*)$/.exec(rawMessage);
    const message = match ? match[2] : rawMessage;
    const code = match ? match[1] : null;
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.rawMessage = rawMessage;
  }
}

/** invoke 호출을 감싸 실패 시 ApiError를 던진다. */
async function callCommand(command, args) {
  try {
    return args === undefined ? await invoke(command) : await invoke(command, args);
  } catch (err) {
    const message = typeof err === 'string' ? err : String(err);
    throw new ApiError(message);
  }
}

/** 전체 단어 목록을 조회한다. */
export async function getWords() {
  return callCommand('get_words');
}

/**
 * 새 단어를 추가한다.
 * @param {{word: string, definition: string, force?: boolean}} payload
 */
export async function addWord(payload) {
  return callCommand('add_word', payload);
}

/**
 * 기존 단어를 수정한다.
 * @param {number} id
 * @param {{word: string, definition: string}} payload
 */
export async function updateWord(id, payload) {
  return callCommand('update_word', { id, ...payload });
}

/** 외움 상태를 토글한다. */
export async function toggleWord(id) {
  return callCommand('toggle_word', { id });
}

/** 단어를 삭제한다. */
export async function deleteWord(id) {
  return callCommand('delete_word', { id });
}
