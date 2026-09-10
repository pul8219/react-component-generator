# AGENTS.md — server/

AI 프로바이더(Anthropic/Google)를 호출해 컴포넌트 코드를 생성·정규화하는 Bun HTTP 서버. 루트 `AGENTS.md`의 규칙을 상속하며, 여기서는 서버 범위의 세부 규칙만 다룬다.

## Tech Stack & Constraints

- 런타임은 Bun (`Bun.serve`, `index.ts:138`). Node 표준 서버(`http`/`express`)를 쓰지 마라.
- HTTP 클라이언트는 전역 `fetch`만 사용한다 (`index.ts:69`, `:101`). axios 등 추가 의존성을 넣지 마라.
- 포트 3002 고정 (`index.ts:139`). 변경 시 `vite.config.ts`의 프록시 target도 함께 바꿔야 한다.
- 모든 응답에 `CORS_HEADERS`를 붙인다 (`index.ts:51-55`). 새 라우트를 추가하면 성공·에러 응답 모두에 헤더를 포함하라.

## Implementation Patterns

- **순수 함수 분리:** 텍스트 정규화 등 부수효과 없는 로직은 `generator.ts`/`fallback.ts`에 두고 export 한다. `index.ts`의 `Bun.serve` 핸들러에는 라우팅·I/O만 남긴다 (`generator.ts:1-2` 주석 참조).
- **프로바이더 추가 절차:** `Provider` 유니온(`index.ts:57`)과 `ENV_KEYS`(`index.ts:59-62`)에 항목을 넣고, `call<Provider>` 함수를 만들고, `/api/generate` 분기(`index.ts:183-186`)와 `/api/config`(`index.ts:150-153`)에 연결한다. 루트 `src/types/index.ts`의 `Provider`도 동기화하라.
- **에러 매핑:** 상위 API의 HTTP 상태를 문자열에 담아 던지고(`throw new Error('... error: ${status}')`), 핸들러에서 `message.includes('503'/'429')`로 사용자 메시지에 매핑한다 (`index.ts:84-85`, `:194-206`).

## Testing Strategy

- 테스트 명령은 루트와 동일: `bun run test` (vitest가 `server/**/*.test.ts`도 수집).
- 테스트는 순수 함수에만 존재한다: `generator.test.ts`, `fallback.test.ts`. `index.ts`(`Bun.serve`)는 테스트가 없다.
- 새 로직을 넣을 때는 테스트 가능하도록 순수 함수로 빼서 `generator.ts`/`fallback.ts`에 추가하고, 대응 테스트를 함께 작성하라. 핸들러에 인라인으로 넣으면 커버리지 밖이 된다.

## Local Golden Rules

- **`ensureRenderCall`·`stripCodeFences`를 우회하지 마라.** `/api/generate`는 반드시 `ensureRenderCall(stripCodeFences(text))`를 거쳐 응답한다 (`index.ts:188`). 이 정규화가 react-live 실행을 보장하는 마지막 방어선이다.
- **프로바이더 비대칭을 유지하라.** Google 경로에만 모델 폴백(`withModelFallback`, `index.ts:135`)과 `MAX_TOKENS` 처리(`index.ts:123-125`)가 있다. Anthropic에 폴백을 넣거나 Google에서 폴백을 빼기 전에, 그 차이가 의도된 것임을 전제하고 이유를 확인하라.
- **키를 로그로 남기지 마라.** `resolveApiKey` 결과나 요청 body의 `apiKey`를 `console.log` 하지 마라. 서버는 키를 응답에도 로그에도 노출하지 않는 것이 원칙이다.
