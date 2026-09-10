# React 컴포넌트 생성기

프롬프트를 입력하면 AI가 React 컴포넌트를 즉시 생성하고, 실시간 미리보기와 코드를 제공합니다.

## 기술 스택

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Bun (AI API 프록시 서버)
- **AI Provider**: Anthropic Claude / Google Gemini (선택 가능)
- **미리보기**: react-live (런타임 렌더링)

## 실행 방법

```bash
# 의존성 설치
bun install

# (선택) .env에 API 키 설정
cp .env.example .env
# .env 파일에 ANTHROPIC_API_KEY 또는 GOOGLE_API_KEY 입력

# API 서버 + 프론트엔드 동시 실행
bun run dev
```

브라우저에서 `http://localhost:5173` 접속 후 사용할 수 있습니다.

- `.env`에 API 키를 설정하면 UI에서 별도 입력 없이 바로 사용 가능
- `.env` 없이도 UI에서 직접 API 키를 입력하여 사용 가능

## 주요 기능

- **멀티 프로바이더**: Anthropic Claude / Google Gemini 선택
- **실시간 미리보기**: 생성된 컴포넌트를 즉시 렌더링
- **새로고침**: 애니메이션 컴포넌트를 리마운트하여 다시 보기
- **재생성**: 같은 프롬프트로 AI에 다시 요청
- **예시 프롬프트**: 시각적 임팩트가 큰 예시 제공
- **최근 프롬프트**: 제출한 프롬프트를 히스토리로 모아 클릭 한 번으로 다시 생성
- **상태 유지**: API 키, 선택한 Provider, 프롬프트 히스토리, 생성된 컴포넌트 목록을 localStorage에 저장해 새로고침해도 유지 (API 키는 편의를 위해 브라우저에 저장되며, 공용 PC에서는 주의)

## 디자인

UI를 부품을 찍어내는 기계처럼 표현한 **픽셀(도트) 테마**입니다.

- **콘셉트**: 도트 그리드 배경, 두꺼운 테두리와 오프셋 픽셀 그림자, 라운드 없는 각진 면
- **컬러**: 자주(plum) 잉크 + 본(bone) 배경의 듀오톤에 앰버 포인트 1색, 라이브 상태에만 청록 LED
- **폰트**: 한글·영문·모노를 모두 지원하는 픽셀 서체 [Galmuri](https://github.com/quiple/galmuri)(OFL) — `public/fonts/`에 self-host (외부 CDN 런타임 의존 없음)
  - `Galmuri14`(디스플레이) / `Galmuri11`(본문·UI) / `Galmuri9`(마이크로 라벨) / `GalmuriMono11`(코드)
- **모션**: 생성 중 스캔라인 스윕 1회, 버튼은 클릭 시 그림자 안으로 눌리는 동작만 사용 (`prefers-reduced-motion` 대응)
