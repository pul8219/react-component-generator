import { describe, it, expect } from 'vitest';
import { normalizeProvider } from './normalizeProvider';

describe('normalizeProvider', () => {
  it('유효한 provider는 그대로 반환한다', () => {
    expect(normalizeProvider('anthropic')).toBe('anthropic');
    expect(normalizeProvider('google')).toBe('google');
  });

  it('미지원/손상된 값은 기본값 google로 폴백한다', () => {
    expect(normalizeProvider('openai')).toBe('google');
    expect(normalizeProvider('')).toBe('google');
    expect(normalizeProvider(null)).toBe('google');
    expect(normalizeProvider(undefined)).toBe('google');
    expect(normalizeProvider(42)).toBe('google');
  });
});
