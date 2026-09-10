/**
 * localStorage에서 JSON 값을 안전하게 읽는다.
 * 키가 없거나 파싱에 실패하면 fallback을 반환한다.
 */
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * 값을 JSON으로 직렬화해 localStorage에 저장한다.
 * 저장 실패(용량 초과·프라이빗 모드 등)는 조용히 무시한다.
 */
export function saveToStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 영속화 실패가 앱 동작을 막지 않도록 무시한다.
  }
}
