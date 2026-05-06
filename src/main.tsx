import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Patch ResizeObserver to prevent "ResizeObserver loop limit exceeded" and "loop completed with undelivered notifications" errors.
const OriginalResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends OriginalResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    super((entries, observer) => {
      window.requestAnimationFrame(() => {
        callback(entries, observer);
      });
    });
  }
};

const resizeObserverLoopErrs = [
  'ResizeObserver loop limit exceeded',
  'ResizeObserver loop completed with undelivered notifications.'
];

window.addEventListener('error', (e) => {
  if (resizeObserverLoopErrs.includes(e.message)) {
    e.stopImmediatePropagation();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

