# AGENTS.md

프롬프트로 React 컴포넌트를 생성하고 react-live로 즉시 렌더링하는 도구. 프로젝트 소개·기술 스택·설치·디자인은 `README.md` 참조. 이 문서는 에이전트 전용 지침만 다룬다.

## Operational Commands

패키지 매니저는 `bun` 고정. npm/yarn/pnpm/node 사용 금지 (`bun.lock`, `@types/bun` 기준).

- `bun install` — 의존성 설치
- `bun run dev` — API 서버(:3002) + Vite(:5173) 동시 실행 (`concurrently`)
- `bun run server` — API 서버만 실행 (`bun --watch run server/index.ts`)
- `bun run build` — 타입체크 후 빌드 (`tsc -b && vite build`)
- `bun run lint` — ESLint (`eslint .`)
- `bun run test` — 전체 테스트 1회 (`vitest run`)
- `bun run test:watch` — 테스트 워치 모드

테스트는 vitest가 `src/**/*.test.{ts,tsx}`와 `server/**/*.test.ts`를 함께 수집한다 (`vite.config.ts:16-21`). 서버 테스트도 이 명령 하나로 돌아간다.

프론트엔드는 `/api`를 :3002으로 프록시한다 (`vite.config.ts:8-14`). 프론트 코드에서 API 호스트를 하드코딩하지 말고 `/api/...` 상대 경로만 호출한다.

## Golden Rules

### Immutable (보안 경계)

- **API 키를 클라이언트로 반환하지 마라.** `/api/config`는 키 값이 아니라 존재 여부 boolean만 내려준다 (`server/index.ts:147-157`, `envKeys: { anthropic: !!ENV_KEYS.anthropic, ... }`). 이 엔드포인트에 키 문자열을 절대 추가하지 마라.
- **키 해석은 서버에서만.** `resolveApiKey`가 `clientKey || process.env` 순으로 서버에서 결정한다 (`server/index.ts:59-66`). 환경변수 키를 클라이언트로 흘리는 경로를 만들지 마라.
- **클라이언트 키는 localStorage에 영속화한다 (소유자 결정, 위험 감수).** 프론트는 `usePersistentState('rcg:apiKey', ...)`로 API 키를 localStorage에 저장하며 프로바이더 전환 시 비운다 (`src/App.tsx`, `src/hooks/usePersistentState.ts`). 이는 원래 "영속 저장 금지" 규칙을 프로젝트 소유자가 명시적으로 완화한 것으로, XSS 등으로 키가 노출될 수 있는 위험을 감수한 결정이다. **위 두 규칙(키를 응답으로 반환 금지 · 키 해석은 서버에서만)은 그대로 유효하다** — 클라이언트 저장 허용이 그 서버 경계까지 여는 것은 아니다. 이 완화를 되돌리려면(=다시 저장 금지로) 소유자 확인을 받아라.

### 생성 코드 계약 (하드 제약 + 이중 방어)

생성되는 컴포넌트 코드는 react-live에서 실행 가능해야 한다. 다음은 깨지면 미리보기가 즉시 죽는 제약이다.

- **`render(...)` 호출 필수.** `LivePreview`는 `noInline` 모드라 `render()`가 없으면 아무것도 그리지 않는다 (`src/components/LivePreview.tsx:14`). 이 호출은 두 겹으로 방어된다: SYSTEM_PROMPT가 모델에 지시하고(`server/index.ts:12`), 응답에 없으면 `ensureRenderCall`이 서버에서 주입한다(`server/generator.ts:16-23`). **`ensureRenderCall`을 제거하지 마라** — 프롬프트만 믿으면 모델이 빠뜨렸을 때 빈 화면이 된다.
- **생성 코드에 `import`·TypeScript 문법 금지.** React는 전역 스코프에 이미 있고, 타입 주석/인터페이스/제네릭/`as`는 금지다 (`server/index.ts:10-20`). react-live는 모듈 해석을 못 하므로 import가 있으면 실행이 깨진다. SYSTEM_PROMPT를 수정할 때 이 규칙을 유지하라.
- **마크다운 코드펜스도 이중 방어된다.** 프롬프트가 "펜스 없이"를 요구하지만(`server/index.ts:16`), `stripCodeFences`가 서버에서 한 번 더 제거한다(`server/generator.ts:5-10`). 이 정규화를 제거하지 마라.

### 프로바이더 비대칭 (의도된 차이)

Anthropic과 Google 경로는 대칭이 아니다. 한쪽을 고칠 때 다른 쪽도 같다고 가정하지 마라.

- **모델 폴백은 Google에만 있다.** `GOOGLE_MODELS` 배열을 `withModelFallback`으로 순차 시도한다 (`server/index.ts:5`, `:134-136`, `server/fallback.ts`). Anthropic은 단일 모델 하드코딩이다 (`server/index.ts:77`, `claude-haiku-4-5-20251001`).
- **truncation 처리도 Google에만 있다.** Google은 `finishReason === 'MAX_TOKENS'`를 명시적으로 잡아 에러로 바꾸고(`server/index.ts:123-125`) `maxOutputTokens: 8192`를 쓰는 반면, Anthropic은 `max_tokens: 4096`이다 (`server/index.ts:78`, `:107`).

### Do's & Don'ts

- **Do:** 요청 정규화·순수 로직은 `server/generator.ts` 같은 순수 함수에 넣어라. `Bun.serve` 핸들러(`server/index.ts`)는 테스트가 없다 — 로직을 인라인으로 넣으면 테스트 경계 밖으로 밀려난다 (`server/generator.ts:1-2` 주석이 이 분리 의도를 명시).
- **Do:** 서버는 Bun 런타임이다 (`Bun.serve`, `server/index.ts:138`). Node 전용 모듈(`http`, `express` 등)을 도입하지 마라.
- **Don't:** API 키·시크릿을 코드나 커밋에 넣지 마라. `.env`는 `.gitignore` 대상이며 `.env.example`에는 빈 값만 둔다.

## Standards & References

- 코딩 컨벤션: ESLint 플랫 설정(`eslint.config.js`) 준수. 커밋/PR 전 `bun run lint`와 `bun run test` 통과 필수.
- 타입: 공유 타입은 `src/types/index.ts`에 정의된 `Provider`, `GeneratedComponent`를 재사용한다. 같은 개념을 중복 정의하지 마라.
- Git: Conventional Commit 접두사 사용 (`feat`/`fix`/`refactor`/`chore`/`docs`/`style`/`test`). 요약은 한국어. `.claude/skills/commit`에 커밋 워크플로 스킬이 있으니 커밋 시 활용한다.
- 하위 규칙: 서버 작업 시 `server/AGENTS.md`를 함께 참조한다.
- Maintenance Policy: 이 문서의 규칙이 실제 코드와 어긋나면, 코드를 규칙에 억지로 맞추지 말고 어긋난 지점을 근거와 함께 보고하고 문서 업데이트를 제안하라.
