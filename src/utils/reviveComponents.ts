import type { GeneratedComponent } from '../types';

const REQUIRED_KEYS = ['id', 'prompt', 'code', 'createdAt'] as const;

function isValidRawComponent(item: unknown): item is Record<string, unknown> {
  if (typeof item !== 'object' || item === null) return false;
  return REQUIRED_KEYS.every((key) => key in item && (item as Record<string, unknown>)[key] != null);
}

/**
 * localStorage에서 읽은 값을 GeneratedComponent[]로 복원한다.
 * JSON 직렬화 과정에서 문자열이 된 createdAt을 Date로 되살린다.
 * 배열이 아니거나 요소가 손상(누락 필드·null)된 경우, 앱을 크래시시키지 않고
 * 유효한 요소만 남긴다.
 */
export function reviveComponents(raw: unknown): GeneratedComponent[] {
  if (!Array.isArray(raw)) return [];

  return raw.filter(isValidRawComponent).map((item) => ({
    id: String(item.id),
    prompt: String(item.prompt),
    code: String(item.code),
    createdAt: new Date(item.createdAt as string),
  }));
}
