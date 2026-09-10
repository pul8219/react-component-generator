#!/usr/bin/env bash
#
# PreToolUse(Write|Edit) 훅: .ts/.tsx 프로덕션 코드를 생성·수정하기 직전에
# .claude/rules/tdd.md 의 TDD 규칙을 다시 확인하도록 에이전트에게 리마인더를 주입한다.
#
#  - 프로덕션 소스(.ts/.tsx)에만 반응. 테스트·타입·설정 파일은 TDD 대상 밖이라 제외.
#  - 세션당 1회만 주입(반복 편집 시 노이즈 방지). session_id 기준 마커 파일 사용.
#  - 쓰기를 차단하지 않는다(비차단). additionalContext 로 안내만 하고 그대로 진행시킨다.
#
# 입력: PreToolUse 훅 JSON(stdin). 출력: additionalContext JSON(stdout) 또는 무출력.

input="$(cat)"

# jq 가 없으면 조용히 통과 — 훅 때문에 쓰기가 막히면 안 된다.
command -v jq >/dev/null 2>&1 || exit 0

file_path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')"
session_id="$(printf '%s' "$input" | jq -r '.session_id // "nosession"')"

[ -n "$file_path" ] || exit 0

case "$file_path" in
  *.test.ts|*.test.tsx|*.spec.ts|*.spec.tsx|*.d.ts|*.config.ts|*.config.tsx)
    exit 0 ;;   # 테스트·타입·설정 파일 → 리마인더 생략
  *.ts|*.tsx)
    : ;;        # 프로덕션 TS/TSX → 아래로 진행
  *)
    exit 0 ;;   # 그 외 확장자 → 무시
esac

# 세션당 1회 가드: 이미 이번 세션에 리마인더를 줬으면 통과.
marker="${TMPDIR:-/tmp}/claude-tdd-reminder-${session_id}"
[ -f "$marker" ] && exit 0
: > "$marker" 2>/dev/null || true

reminder="TDD 리마인더 — .ts/.tsx 프로덕션 코드를 쓰기 전에 .claude/rules/tdd.md(Rigid, 변형 금지)를 다시 확인하라. \
(1) 이 변경이 TDD 적용 대상인가? 비즈니스 로직·API/핸들러·순수 함수·버그 수정이면 적용, 타입·설정·순수 UI면 제외, 모호하면 적용. \
(2) 적용 대상이면 실패하는 테스트를 먼저 작성하고 실행해 '기능 미구현'으로 실패함을 눈으로 확인했는가(RED)? 오타·컴파일 에러로 인한 실패는 RED가 아니다. \
(3) 테스트보다 프로덕션 코드를 먼저 썼다면 그 코드를 삭제하고 RED부터 다시 시작하라(삭제 강제, 주석 처리도 금지). \
(4) GREEN은 통과시키는 최소 코드만(YAGNI), REFACTOR는 green을 유지하며 구조만 개선. \
이미 절차를 지키는 중이면 그대로 진행하라."

# jq 로 안전하게 JSON 인코딩하여 additionalContext 주입(비차단).
jq -n --arg ctx "$reminder" '{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    additionalContext: $ctx
  }
}'
exit 0
