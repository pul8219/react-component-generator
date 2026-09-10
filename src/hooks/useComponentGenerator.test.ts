import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useComponentGenerator } from './useComponentGenerator';

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: 'render(<div/>)' }),
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useComponentGenerator - 영속화', () => {
  it('생성에 성공하면 프롬프트가 히스토리에 기록된다', async () => {
    const { result } = renderHook(() => useComponentGenerator());

    await act(async () => {
      await result.current.generate('카드 컴포넌트', undefined, 'google');
    });

    await waitFor(() => expect(result.current.promptHistory).toContain('카드 컴포넌트'));
  });

  it('생성된 컴포넌트가 localStorage에 저장된다', async () => {
    const { result } = renderHook(() => useComponentGenerator());

    await act(async () => {
      await result.current.generate('버튼', undefined, 'google');
    });

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('rcg:components')!);
      expect(saved).toHaveLength(1);
      expect(saved[0].prompt).toBe('버튼');
    });
  });

  it('생성에 실패하면 프롬프트를 히스토리에 기록하지 않는다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'boom' }),
      }),
    );
    const { result } = renderHook(() => useComponentGenerator());

    await act(async () => {
      await result.current.generate('실패 프롬프트', undefined, 'google');
    });

    expect(result.current.error).toBe('boom');
    expect(result.current.promptHistory).not.toContain('실패 프롬프트');
  });
});
