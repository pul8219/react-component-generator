import { useEffect, useRef, useState } from 'react';

interface LivePreviewProps {
  code: string;
}

// 생성 코드를 실행하는 격리 페이지. allow-same-origin 없이 로드되어 불투명 오리진이 된다.
const SANDBOX_SRC = `${import.meta.env.BASE_URL}preview-sandbox.html`;

/**
 * 생성된 컴포넌트를 `sandbox="allow-scripts"` iframe 안에서 실행한다.
 * iframe이 불투명 오리진을 가지므로 실행 코드가 부모의 localStorage(API 키 등)에
 * 접근할 수 없다. 코드는 postMessage로 전달한다.
 */
export function LivePreview({ code }: LivePreviewProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [height, setHeight] = useState(240);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.source !== frameRef.current?.contentWindow) return;
      const data = e.data;
      if (data?.type === 'sandbox-ready') {
        setReady(true);
      } else if (data?.type === 'sandbox-height' && typeof data.height === 'number') {
        setHeight(Math.max(120, data.height + 24));
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // 샌드박스가 준비된 뒤, 그리고 코드가 바뀔 때마다 코드를 전달한다.
  useEffect(() => {
    if (!ready) return;
    frameRef.current?.contentWindow?.postMessage({ type: 'render', code }, '*');
  }, [ready, code]);

  return (
    <div className="preview-panel">
      <div className="panel-header">
        <h3>미리보기</h3>
      </div>
      <div className="preview-content">
        <iframe
          ref={frameRef}
          title="미리보기"
          src={SANDBOX_SRC}
          sandbox="allow-scripts"
          className="preview-frame"
          style={{ height }}
        />
      </div>
    </div>
  );
}
