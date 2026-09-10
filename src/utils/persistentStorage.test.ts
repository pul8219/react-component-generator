import { describe, it, expect, beforeEach } from 'vitest';
import { loadFromStorage, saveToStorage } from './persistentStorage';

beforeEach(() => {
  localStorage.clear();
});

describe('persistentStorage', () => {
  it('저장한 값을 그대로 다시 읽는다 (round-trip)', () => {
    saveToStorage('key', { a: 1, b: ['x'] });
    expect(loadFromStorage('key', null)).toEqual({ a: 1, b: ['x'] });
  });

  it('키가 없으면 fallback을 반환한다', () => {
    expect(loadFromStorage('missing', 'fallback')).toBe('fallback');
  });

  it('저장된 값이 깨진 JSON이면 fallback을 반환한다', () => {
    localStorage.setItem('broken', '{not valid json');
    expect(loadFromStorage('broken', [])).toEqual([]);
  });

  it('문자열 값도 정상 저장/복원한다', () => {
    saveToStorage('str', 'sk-ant-123');
    expect(loadFromStorage('str', '')).toBe('sk-ant-123');
  });
});
