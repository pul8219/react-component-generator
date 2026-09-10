import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { usePersistentState } from './usePersistentState';

beforeEach(() => {
  localStorage.clear();
});

describe('usePersistentState', () => {
  it('저장된 값이 없으면 초기값을 사용한다', () => {
    const { result } = renderHook(() => usePersistentState('k', 'init'));
    expect(result.current[0]).toBe('init');
  });

  it('localStorage에 저장된 값이 있으면 그것으로 복원한다', () => {
    localStorage.setItem('k', JSON.stringify('stored'));
    const { result } = renderHook(() => usePersistentState('k', 'init'));
    expect(result.current[0]).toBe('stored');
  });

  it('값을 바꾸면 localStorage에 저장한다', () => {
    const { result } = renderHook(() => usePersistentState('k', 'init'));
    act(() => result.current[1]('next'));
    expect(result.current[0]).toBe('next');
    expect(JSON.parse(localStorage.getItem('k')!)).toBe('next');
  });

  it('deserialize 옵션으로 복원 값을 변환한다', () => {
    localStorage.setItem('k', JSON.stringify({ n: 1 }));
    const { result } = renderHook(() =>
      usePersistentState('k', { n: 0 }, { deserialize: (raw) => ({ n: (raw as { n: number }).n + 10 }) }),
    );
    expect(result.current[0]).toEqual({ n: 11 });
  });
});
