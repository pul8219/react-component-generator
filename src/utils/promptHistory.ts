export const MAX_PROMPT_HISTORY = 20;

/**
 * 제출한 프롬프트를 히스토리 맨 앞에 추가한다.
 * - 앞뒤 공백 제거, 공백뿐이면 무시
 * - 이미 있으면 중복 없이 맨 앞으로 이동
 * - 최대 MAX_PROMPT_HISTORY개만 유지(오래된 것부터 제거)
 */
export function addPromptToHistory(history: string[], prompt: string): string[] {
  const trimmed = prompt.trim();
  if (!trimmed) return history;

  const deduped = history.filter((p) => p !== trimmed);
  return [trimmed, ...deduped].slice(0, MAX_PROMPT_HISTORY);
}
