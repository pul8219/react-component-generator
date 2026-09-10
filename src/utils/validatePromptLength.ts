// 프롬프트 길이 검증 순수 함수. 부수효과가 없어 단위 테스트가 가능하다.
export const MAX_PROMPT_LENGTH = 500;

export interface PromptValidation {
  valid: boolean;
  length: number;
  error: string | null;
}

/** 프롬프트가 최대 길이를 넘지 않는지 검증한다. */
export function validatePromptLength(prompt: string): PromptValidation {
  const length = prompt.length;

  if (length > MAX_PROMPT_LENGTH) {
    return {
      valid: false,
      length,
      error: `프롬프트는 최대 ${MAX_PROMPT_LENGTH}자까지 입력할 수 있습니다.`,
    };
  }

  return { valid: true, length, error: null };
}
