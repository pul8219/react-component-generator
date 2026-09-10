import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SandboxApp } from './SandboxApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SandboxApp />
  </StrictMode>,
);
