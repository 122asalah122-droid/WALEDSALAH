import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

try {
  if ('serviceWorker' in navigator) {
    registerSW({
      immediate: true,
      onRegisterError() {
        // Silently ignore in restricted WebViews that disable serviceWorker
      },
    });
  }
} catch {}

createRoot(document.getElementById('root')!).render(<App />);

