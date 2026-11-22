import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database, ref, onValue, off } from 'firebase/database';

// Firebase Web App configuration (supports Cloudflare Pages VITE_FIREBASE_* env overrides)
const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env || {};

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyBBw-oFUmt8e1AeO4nzzG6GLpNbyQT5I5E',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'gen-lang-client-0032838250.firebaseapp.com',
  databaseURL:
    env.VITE_FIREBASE_DATABASE_URL ||
    'https://gen-lang-client-0032838250-default-rtdb.firebaseio.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'gen-lang-client-0032838250',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'gen-lang-client-0032838250.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '878148503555',
  appId: env.VITE_FIREBASE_APP_ID || '1:878148503555:web:b7c046af142fd893646636',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || 'G-C028J7MG6K',
};

export const firebaseApp: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const rtdb: Database = getDatabase(firebaseApp, firebaseConfig.databaseURL);

let analyticsInitialized = false;

/**
 * Lazily initialize Firebase Analytics only when online and supported by the browser/WebView.
 */
export function initFirebaseAnalyticsIfOnline(): void {
  if (analyticsInitialized || typeof window === 'undefined') return;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
  analyticsInitialized = true;
  import('firebase/analytics')
    .then(async ({ getAnalytics, isSupported }) => {
      try {
        const supported = await isSupported();
        if (supported) {
          getAnalytics(firebaseApp);
        }
      } catch {
        // Analytics unavailable in restricted WebView/offline contexts
      }
    })
    .catch(() => {});
}

/**
 * Sanitize strings used as Firebase Realtime Database path keys (forbids . # $ [ ] /).
 */
export function sanitizeFirebaseKey(raw: string): string {
  return String(raw || '')
    .trim()
    .replace(/[.#$\[\]\/]/g, '_')
    .slice(0, 96);
}

/**
 * Frontend-only connectivity check using Firebase RTDB `.info/connected` with a safe HTTPS fallback.
 * Never depends on a local /api/* backend, so it works seamlessly on Cloudflare Pages & Android WebView.
 */
export async function checkFirebaseConnectivity(timeoutMs = 3500): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return false;
  }

  return new Promise<boolean>((resolve) => {
    let settled = false;
    const connectedRef = ref(rtdb, '.info/connected');

    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        off(connectedRef, 'value', handler);
      } catch {}
      resolve(ok);
    };

    const handler = (snap: { val: () => unknown }) => {
      if (snap.val() === true) {
        finish(true);
      }
    };

    const timer = setTimeout(async () => {
      if (settled) return;
      // Fallback lightweight check against Firebase RTDB endpoint in case WebSocket handshake is still warming up
      try {
        const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const t = ctrl ? setTimeout(() => ctrl.abort(), 1800) : null;
        await fetch(`${firebaseConfig.databaseURL}/.json?shallow=true&t=${Date.now()}`, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-store',
          signal: ctrl?.signal,
        });
        if (t) clearTimeout(t);
        finish(true);
      } catch {
        finish(typeof navigator !== 'undefined' ? navigator.onLine !== false : true);
      }
    }, timeoutMs);

    try {
      onValue(connectedRef, handler, () => {
        // Ignore error and let fallback/timeout resolve
      });
    } catch {
      finish(typeof navigator !== 'undefined' ? navigator.onLine !== false : true);
    }
  });
}
