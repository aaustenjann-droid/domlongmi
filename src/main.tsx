// Safeguard window.fetch against environments where fetch is getter-only
try {
  let _currentFetch = typeof window !== 'undefined' && window.fetch ? window.fetch.bind(window) : null;
  const desc = typeof window !== 'undefined' ? Object.getOwnPropertyDescriptor(window, 'fetch') : null;
  if (!desc || !desc.set) {
    Object.defineProperty(window, 'fetch', {
      get() {
        return _currentFetch;
      },
      set(fn) {
        _currentFetch = fn;
      },
      configurable: true,
      enumerable: true,
    });
  }
} catch (_) {}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { StoreProvider } from './store.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
);
