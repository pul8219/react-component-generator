---
name: create-pr
description: 현재 브랜치의 변경사항을 분석해 컨벤션에 맞는 제목·본문으로 Pull Request를 생성한다. 사용자가 "PR", "PR 생성해줘", "PR 만들어줘", "변경사항 원격에 반영해줘", "원격 저장소에 올려줘", "create PR", "open a pull request" 등 변경 내용을 원격 저장소의 PR로 올리려는 의도를 보이면 반드시 이 스킬을 사용한다. 단순 push나 커밋만 원할 때는 사용하지 않는다.
context: fork
---

# create-pr

이 스킬은 **fork 서브에이전트에서 실행된다**(frontmatter의 `context: fork`). 큰 출력을 내는 git·gh 명령의 소음을 메인 대화에 쌓지 않으면서, fork가 지금까지의 대화 맥락(무엇을 왜 바꿨는지)을 그대로 물려받아 정확한 PR 본문을 쓴다. 런타임이 이 필드를 자동 처리하지 않으면 `Agent` 도구를 `subagent_type: "fork"`로 직접 호출해 아래 절차를 위임한다.

목표는 **리뷰어가 PR 제목·본문만 보고 "무엇을, 왜 바꿨는지" 파악할 수 있게** 만드는 것이다.

## 절차

### 1. 사전 확인

커밋되지 않은 변경이 있는지 본다.

```bash
git status --short
```

- 커밋 안 된 변경이 남아 있으면 PR에 담을 것인지 확인하고 **`commit` 스킬로 먼저 커밋**한다. 커밋되지 않은 변경은 PR에 포함되지 않는다.
- 현재 브랜치가 `main`/`master`이면 새 브랜치를 만든다(2단계). 팀 관행상 직접 PR이 맞는지 애매하면 사용자에게 먼저 확인한다.

### 2. 베이스/현재 브랜치 파악

```bash
git rev-parse --abbrev-ref HEAD                        # 현재 브랜치
git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null  # 기본(base) 브랜치, 보통 origin/main
```

현재 브랜치가 base와 같으면(=`main`에서 작업 중) 변경 성격을 요약한 이름으로 새 브랜치를 만든다: `git switch -c <feat|fix|...>/<요약>`.

### 3. 변경 분석

base와의 diff/log를 읽어 실제로 무엇이 바뀌었는지 파악한다. 파일명 추측 금지.

```bash
git log --oneline origin/main..HEAD
git diff origin/main...HEAD
```

### 4. push

```bash
git push -u origin HEAD
```

### 5. 제목·본문 작성

- **제목**: `용도: 변경사항 요약` (§제목 규칙 참조).
- **본문**: **`references/pr-template-ko.md`(한글)**를 사용한다(현재 프로젝트 기본값). 각 섹션을 실제 내용으로 채우고, 안내 주석과 해당 없는 섹션은 삭제한다. 영어 PR이 필요할 때만 `references/pr-template-en.md`를 쓴다.

### 6. PR 생성

`gh`는 remote 호스트에 맞춰 실행한다. 이 레포처럼 remote가 `github.nhnent.com`이 아닐 수 있으므로 **호스트를 하드코딩하지 말고 remote에서 유도**한다.

```bash
HOST=$(git remote get-url origin | sed -E 's#(https?://|git@)([^/:]+).*#\2#')
BODY_FILE=$(mktemp)   # 작성한 본문을 여기에 기록
GH_HOST="$HOST" gh pr create \
  --base "$(basename "$(git symbolic-ref refs/remotes/origin/HEAD)")" \
  --head "$(git rev-parse --abbrev-ref HEAD)" \
  --title "용도: 요약" \
  --body-file "$BODY_FILE"
```

### 7. 결과 보고

생성된 **PR URL**과 제목, base←head 브랜치를 사용자에게 보고한다.

## 제목 규칙

형식: `용도: 변경사항을 요약한 제목`

- `용도`는 Conventional Commit 타입으로 변경 성격을 나타내고 콜론(`:`)으로 잇는다: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test` 등.
- 요약 제목은 한국어로 간결하게, "무엇을 했는지"가 드러나게 쓴다.

**예시**
- `feat: 프롬프트 500자 길이 검증 및 카운터 추가`
- `fix: 컴포넌트 생성 시 props 타입 누락 수정`
- `refactor: 템플릿 렌더링 로직 분리`
- `docs: AGENTS.md 거버넌스 규칙 추가`

## 주의사항

- **PR 생성은 외부(원격)로 나가는 행위다.** base/head 브랜치와 제목이 맞는지 확인하고, 되돌리기 어려운 실수(잘못된 base로 대량 커밋 노출 등)가 없는지 짚는다.
- 본문의 "테스트" 섹션은 **실제 실행 결과만** 적는다. 돌리지 않은 검증을 통과했다고 쓰지 않는다.
- `.env`·키·토큰 등 민감 파일이 diff에 섞이지 않았는지 확인한다.
- attribution 규칙은 저장소·세션 지침을 따른다. 별도 지침이 없으면 PR 본문에 도구 서명을 넣지 않는다.
- 영어 템플릿(`en`)이 필요하면 사용자가 명시할 때만 사용한다. 기본은 한글이다.
