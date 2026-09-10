import type { Provider } from '../types';

const VALID_PROVIDERS: readonly Provider[] = ['anthropic', 'google'];
const DEFAULT_PROVIDER: Provider = 'google';

/**
 * localStorage 등에서 복원한 provider 값을 검증한다.
 * 지원하는 값이 아니면 기본값(google)으로 폴백해 undefined 역참조 크래시를 막는다.
 */
export function normalizeProvider(value: unknown): Provider {
  return VALID_PROVIDERS.includes(value as Provider) ? (value as Provider) : DEFAULT_PROVIDER;
}
