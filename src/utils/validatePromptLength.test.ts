import { describe, it, expect } from 'vitest';
import { validatePromptLength, MAX_PROMPT_LENGTH } from './validatePromptLength';

describe('validatePromptLength', () => {
  it('500자 이하는 유효하다', () => {
    const result = validatePromptLength('a'.repeat(100));
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('정확히 500자는 유효하다 (경계)', () => {
    const result = validatePromptLength('a'.repeat(MAX_PROMPT_LENGTH));
    expect(result.valid).toBe(true);
  });

  it('500자를 초과하면 유효하지 않다', () => {
    const result = validatePromptLength('a'.repeat(MAX_PROMPT_LENGTH + 1));
    expect(result.valid).toBe(false);
  });

  it('초과 시 에러 메시지를 제공한다', () => {
    const result = validatePromptLength('a'.repeat(MAX_PROMPT_LENGTH + 1));
    expect(result.error).toContain(String(MAX_PROMPT_LENGTH));
  });

  it('입력 길이를 함께 반환한다', () => {
    expect(validatePromptLength('hello').length).toBe(5);
  });
});
