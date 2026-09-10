import { describe, it, expect } from 'vitest';
import { reviveComponents } from './reviveComponents';

describe('reviveComponents', () => {
  it('저장된 컴포넌트의 createdAt 문자열을 Date로 복원한다', () => {
    const raw = [
      { id: '1', prompt: 'p', code: 'render(<div/>)', createdAt: '2026-09-10T00:00:00.000Z' },
    ];
    const result = reviveComponents(raw);
    expect(result[0].createdAt).toBeInstanceOf(Date);
    expect(result[0].createdAt.toISOString()).toBe('2026-09-10T00:00:00.000Z');
  });

  it('id, prompt, code를 보존한다', () => {
    const raw = [{ id: '42', prompt: '카드', code: 'render(1)', createdAt: '2026-01-01T00:00:00.000Z' }];
    expect(reviveComponents(raw)[0]).toMatchObject({ id: '42', prompt: '카드', code: 'render(1)' });
  });

  it('배열이 아니면 빈 배열을 반환한다', () => {
    expect(reviveComponents(null)).toEqual([]);
    expect(reviveComponents({})).toEqual([]);
    expect(reviveComponents('nope')).toEqual([]);
  });
});
