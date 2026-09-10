import { useEffect, useRef, useState } from 'react';
import { LiveProvider, LivePreview as ReactLivePreview, LiveError } from 'react-live';

/**
 * `sandbox="allow-scripts"` iframe(불투명 오리진) 안에서 실행되는 미리보기 앱.
 * 부모와 오리진이 분리되므로, 생성된 컴포넌트 코드가 여기서 실행돼도
 * 부모의 localStorage(예: rcg:apiKey)에 접근할 수 없다.
 * 부모로부터 postMessage로 코드를 받아 react-live로 렌더한다.
 */
export function SandboxApp() {
  const [code, setCode] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const data = e.data;
      if (data && data.type === 'render' && typeof data.code === 'string') {
        setCode(data.code);
      }
    }
    window.addEventListener('message', onMessage);
    // 리스너 등록 후 부모에게 준비 완료를 알린다(그때 부모가 코드를 보낸다).
    window.parent.postMessage({ type: 'sandbox-ready' }, '*');
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // 콘텐츠 높이를 부모에 보고해 iframe 높이를 맞춘다.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const report = () =>
      window.parent.postMessage({ type: 'sandbox-height', height: el.scrollHeight }, '*');
    const observer = new ResizeObserver(report);
    observer.observe(el);
    report();
    return () => observer.disconnect();
  }, [code]);

  return (
    <div ref={rootRef} className="sandbox-root">
      {code ? (
        <LiveProvider code={code} noInline>
          <div className="preview-render">
            <ReactLivePreview />
          </div>
          <LiveError className="preview-error" />
        </LiveProvider>
      ) : null}
    </div>
  );
}
