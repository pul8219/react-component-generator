import type { GeneratedComponent } from '../types';

/**
 * localStorage에서 읽은 값을 GeneratedComponent[]로 복원한다.
 * JSON 직렬화 과정에서 문자열이 된 createdAt을 Date로 되살린다.
 * 배열이 아니면 빈 배열을 반환한다.
 */
export function reviveComponents(raw: unknown): GeneratedComponent[] {
  if (!Array.isArray(raw)) return [];

  return raw.map((item) => ({
    id: String(item.id),
    prompt: String(item.prompt),
    code: String(item.code),
    createdAt: new Date(item.createdAt),
  }));
}
