import { describe, it, expect } from 'vitest';
import { addPromptToHistory, MAX_PROMPT_HISTORY } from './promptHistory';

describe('addPromptToHistory', () => {
  it('빈 히스토리에 프롬프트를 추가한다', () => {
    expect(addPromptToHistory([], '카드 컴포넌트')).toEqual(['카드 컴포넌트']);
  });

  it('최신 프롬프트를 맨 앞에 넣는다', () => {
    expect(addPromptToHistory(['a'], 'b')).toEqual(['b', 'a']);
  });

  it('이미 있는 프롬프트는 중복 없이 맨 앞으로 이동한다', () => {
    expect(addPromptToHistory(['a', 'b', 'c'], 'c')).toEqual(['c', 'a', 'b']);
  });

  it('앞뒤 공백을 제거해 저장한다', () => {
    expect(addPromptToHistory([], '  카드  ')).toEqual(['카드']);
  });

  it('공백뿐인 프롬프트는 무시하고 히스토리를 그대로 둔다', () => {
    expect(addPromptToHistory(['a'], '   ')).toEqual(['a']);
  });

  it(`최대 ${MAX_PROMPT_HISTORY}개까지만 유지하고 오래된 것을 버린다`, () => {
    const full = Array.from({ length: MAX_PROMPT_HISTORY }, (_, i) => `p${i}`);
    const result = addPromptToHistory(full, 'newest');
    expect(result).toHaveLength(MAX_PROMPT_HISTORY);
    expect(result[0]).toBe('newest');
    expect(result).not.toContain(`p${MAX_PROMPT_HISTORY - 1}`);
  });
});
