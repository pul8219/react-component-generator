import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LivePreview } from './LivePreview';

describe('LivePreview - 샌드박스 격리', () => {
  it('생성 코드를 격리된 iframe에서 실행한다', () => {
    render(<LivePreview code="render(<div/>)" />);
    const frame = screen.getByTitle('미리보기') as HTMLIFrameElement;
    expect(frame.tagName).toBe('IFRAME');
    expect(frame.getAttribute('src')).toContain('preview-sandbox.html');
  });

  it('iframe은 allow-scripts만 허용하고 allow-same-origin은 주지 않는다 (localStorage 격리)', () => {
    render(<LivePreview code="render(<div/>)" />);
    const frame = screen.getByTitle('미리보기') as HTMLIFrameElement;
    const sandbox = frame.getAttribute('sandbox') ?? '';
    const tokens = sandbox.split(/\s+/).filter(Boolean);
    expect(tokens).toContain('allow-scripts');
    expect(tokens).not.toContain('allow-same-origin');
  });
});
