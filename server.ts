import express from 'express';
import { createServer } from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { QUESTIONS_BANK } from './src/data/questions.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = fs.existsSync(path.join(__dirname, 'package.json'))
  ? __dirname
  : path.resolve(__dirname, '..');

const questionsMap = new Map(QUESTIONS_BANK.map((q) => [q.id, q]));
const playerSeenQuestions = new Map<string, Set<string>>();
const globalRecentRoomQuestionIds = new Set<string>();

function getCombinedExcludeIds(playerIds: (string | undefined)[], clientExcludeIds?: string[]): string[] {
  const combined = new Set<string>();
  if (Array.isArray(clientExcludeIds)) {
    for (const id of clientExcludeIds) {
      if (typeof id === 'string' && id.length > 0) combined.add(id);
    }
  }
  for (const pid of playerIds) {
    if (!pid) continue;
    const seen = playerSeenQuestions.get(pid);
    if (seen) {
      seen.forEach((id) => combined.add(id));
    }
  }
  return Array.from(combined);
}

function recordSeenQuestionsForPlayers(playerIds: (string | undefined)[], qIds: string[]) {
  if (!Array.isArray(qIds) || qIds.length === 0) return;
  for (const id of qIds) {
    globalRecentRoomQuestionIds.add(id);
  }
  if (globalRecentRoomQuestionIds.size >= QUESTIONS_BANK.length - 10) {
    globalRecentRoomQuestionIds.clear();
    for (const id of qIds) globalRecentRoomQuestionIds.add(id);
  }
  for (const pid of playerIds) {
    if (!pid) continue;
    let set = playerSeenQuestions.get(pid);
    if (!set) {
      set = new Set<string>();
      playerSeenQuestions.set(pid, set);
    }
    for (const id of qIds) {
      set.add(id);
    }
    if (set.size >= QUESTIONS_BANK.length) {
      set.clear();
      for (const id of qIds) set.add(id);
    }
  }
}

function generateRoomQuestionIds(
  roomId: string,
  count = 10,
  category = 'all',
  excludeIds?: string[]
): string[] {
  const effectiveCat = !category || category === 'all' ? 'general' : category;
  const catPool = QUESTIONS_BANK.filter((q) => {
    if (effectiveCat === 'general') return q.category === 'general';
    if (effectiveCat === 'islamic') return q.category === 'islamic';
    if (effectiveCat === 'entertainment') return q.category === 'sports' || q.category === 'cinema';
    return q.category === effectiveCat;
  });
  const pool = catPool.length >= count ? catPool : QUESTIONS_BANK;
  const isStrictCategory =
    effectiveCat === 'general' || effectiveCat === 'islamic' || effectiveCat === 'entertainment';
  const isDedicated100 = isStrictCategory;

  const excludeSet = new Set<string>(
    Array.isArray(excludeIds) ? excludeIds.filter((id) => typeof id === 'string' && id.length > 0) : []
  );

  let seed = Date.now() ^ Math.floor(Math.random() * 1000003);
  for (let i = 0; i < roomId.length; i++) {
    seed = (seed * 31 + roomId.charCodeAt(i)) % 2147483647;
  }

  const selectedIds: string[] = [];
  let prevTopic = '';
  const getTopic = (q: (typeof QUESTIONS_BANK)[number]) => q.topic || `${q.category}_${q.id}`;

  for (let i = 0; i < count; i++) {
    const targetLevel = Math.min(15, i + 1);
    const levelPool = isDedicated100 ? pool : pool.filter((q) => q.level === targetLevel);
    const baseSubPool = levelPool.length > 0 ? levelPool : pool;

    // Prioritize completely unseen (not in excludeSet AND not in globalRecentRoomQuestionIds)
    let candidates = baseSubPool.filter(
      (q) => !excludeSet.has(q.id) && !globalRecentRoomQuestionIds.has(q.id) && !selectedIds.includes(q.id)
    );
    if (candidates.length === 0) {
      candidates = pool.filter(
        (q) => !excludeSet.has(q.id) && !globalRecentRoomQuestionIds.has(q.id) && !selectedIds.includes(q.id)
      );
    }
    if (candidates.length === 0 && !isStrictCategory) {
      candidates = QUESTIONS_BANK.filter(
        (q) => !excludeSet.has(q.id) && !globalRecentRoomQuestionIds.has(q.id) && !selectedIds.includes(q.id)
      );
    }
    // Next: unseen for this player(s) even if seen by another room
    if (candidates.length === 0) {
      candidates = baseSubPool.filter((q) => !excludeSet.has(q.id) && !selectedIds.includes(q.id));
    }
    if (candidates.length === 0) {
      candidates = pool.filter((q) => !excludeSet.has(q.id) && !selectedIds.includes(q.id));
    }
    if (candidates.length === 0 && !isStrictCategory) {
      candidates = QUESTIONS_BANK.filter((q) => !excludeSet.has(q.id) && !selectedIds.includes(q.id));
    }
    // Only wrap after all questions in the category/bank have been exhausted
    if (candidates.length === 0) {
      candidates = baseSubPool.filter((q) => !selectedIds.includes(q.id));
    }
    if (candidates.length === 0) {
      candidates = pool.filter((q) => !selectedIds.includes(q.id));
    }
    if (candidates.length === 0 && !isStrictCategory) {
      candidates = QUESTIONS_BANK.filter((q) => !selectedIds.includes(q.id));
    }

    const nonSameTopic = candidates.filter((q) => getTopic(q) !== prevTopic);
    const finalCandidates = nonSameTopic.length > 0 ? nonSameTopic : candidates;

    const pickIndex = Math.abs(seed + i * 997) % finalCandidates.length;
    const picked = finalCandidates[pickIndex];
    selectedIds.push(picked.id);
    prevTopic = getTopic(picked);
  }

  return selectedIds;
}

const app = express();
const server = createServer(app);

function resolveServerPort(): number {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--port' && args[i + 1]) {
      const parsed = parseInt(args[i + 1], 10);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    } else if (arg.startsWith('--port=')) {
      const parsed = parseInt(arg.slice('--port='.length), 10);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
  }
  if (
    process.env.NGINX_PORT &&
    process.env.PORT === process.env.NGINX_PORT &&
    process.env.DEFAULT_APP_PORT
  ) {
    const fallback = parseInt(process.env.DEFAULT_APP_PORT, 10);
    if (Number.isFinite(fallback) && fallback > 0) return fallback;
  }
  const envPort = parseInt(process.env.PORT || process.env.DEFAULT_APP_PORT || '3000', 10);
  return Number.isFinite(envPort) && envPort > 0 ? envPort : 3000;
}

const PORT = resolveServerPort();

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]:', reason);
});

app.use(express.json());

// Allow AppCreator24 WebViews, mobile clients, and cross-origin platform URLs to connect seamlessly
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// In-Memory cache for Arabic & English TTS MP3 buffers for near-zero latency
const ttsCache = new Map<string, Buffer>();

function fetchTtsChunk(text: string, lang: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(lang)}&client=tw-ob&q=${encodeURIComponent(text)}`;
    let settled = false;
    const req = https.get(
      url,
      {
        timeout: 3500,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          if (!settled) {
            settled = true;
            reject(new Error(`TTS failed with status ${res.statusCode}`));
          }
          res.resume();
          return;
        }
        const chunks: Buffer[] = [];
        res.on('data', (d) => chunks.push(d));
        res.on('end', () => {
          if (!settled) {
            settled = true;
            resolve(Buffer.concat(chunks));
          }
        });
        res.on('error', (err) => {
          if (!settled) {
            settled = true;
            reject(err);
          }
        });
      }
    );
    req.setTimeout(3500, () => {
      if (!settled) {
        settled = true;
        req.destroy(new Error('TTS request timeout'));
      }
    });
    req.on('error', (err) => {
      if (!settled) {
        settled = true;
        reject(err);
      }
    });
  });
}

function splitTextIntoTtsChunks(text: string, maxLen = 140): string[] {
  const sentences = text.split(/(?<=[.!?؟،\n])\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + ' ' + sentence).trim().length <= maxLen) {
      current = (current + ' ' + sentence).trim();
    } else {
      if (current) chunks.push(current);
      if (sentence.length > maxLen) {
        const words = sentence.split(' ');
        let sub = '';
        for (const w of words) {
          if ((sub + ' ' + w).trim().length <= maxLen) {
            sub = (sub + ' ' + w).trim();
          } else {
            if (sub) chunks.push(sub);
            sub = w;
          }
        }
        if (sub) current = sub;
        else current = '';
      } else {
        current = sentence;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks.filter((c) => c.trim().length > 0);
}

// Universal AI Voice Proxy: Plays 100% reliably on all phones (Samsung, Xiaomi, iPhone, Android WebViews)
app.get('/api/tts', async (req, res) => {
  try {
    const rawText = String(req.query.text || '').trim().slice(0, 800);
    const lang = String(req.query.lang || 'ar').toLowerCase().startsWith('en') ? 'en' : 'ar';

    if (!rawText) {
      return res.status(400).send('Missing text parameter');
    }

    const cacheKey = `${lang}_${rawText}`;
    if (ttsCache.has(cacheKey)) {
      const cached = ttsCache.get(cacheKey)!;
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(cached);
    }

    const chunks = splitTextIntoTtsChunks(rawText, 140);
    const settledResults = await Promise.allSettled(
      chunks.map((chunk) => fetchTtsChunk(chunk, lang))
    );

    const audioBuffers: Buffer[] = [];
    settledResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        audioBuffers.push(result.value);
      } else if (result.status === 'rejected') {
        console.error('Error fetching TTS chunk:', result.reason);
      }
    });

    if (audioBuffers.length === 0) {
      return res.status(500).send('Failed to generate speech');
    }

    const finalBuffer = Buffer.concat(audioBuffers);
    if (ttsCache.size < 600) {
      ttsCache.set(cacheKey, finalBuffer);
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(finalBuffer);
  } catch (error) {
    console.error('TTS endpoint error:', error);
    return res.status(500).send('Internal TTS error');
  }
});

const QUESTIONS_HASH = crypto
  .createHash('sha1')
  .update(JSON.stringify(QUESTIONS_BANK.map((q) => q.id + '|' + q.questionAr + '|' + q.level)))
  .digest('hex')
  .slice(0, 12);

const COMPACT_QUESTIONS_CACHE = QUESTIONS_BANK.map((q) => ({
  id: q.id,
  lvl: q.level,
  cat: q.category,
  ...(q.topic ? { t: q.topic } : {}),
  qa: q.questionAr,
  qe: q.questionEn,
  oa: q.optionsAr,
  oe: q.optionsEn,
  ans: q.correctIndex,
  ea: q.explanationAr,
  ee: q.explanationEn,
}));

let cachedBundleStatKey = '';
let cachedBundleVersion = '';

function getLiveAppMeta() {
  const bundlePath = path.join(ROOT_DIR, 'appcreator24_code.html');
  const distIndexPath = path.join(ROOT_DIR, 'dist', 'index.html');
  let bundleMtime = 0;
  let distMtime = 0;
  try {
    bundleMtime = fs.statSync(bundlePath).mtimeMs;
  } catch {}
  try {
    distMtime = fs.statSync(distIndexPath).mtimeMs;
  } catch {}

  const statKey = `${bundleMtime}_${distMtime}_${QUESTIONS_HASH}`;
  if (statKey !== cachedBundleStatKey || !cachedBundleVersion) {
    cachedBundleStatKey = statKey;
    let extractedBundleVer = '';
    try {
      const headChunk = fs.readFileSync(bundlePath, 'utf8');
      const match = headChunk.match(/const\s+LOCAL_BUILD_VERSION\s*=\s*['"]([A-Za-z0-9_-]+)['"]/);
      if (match && match[1]) {
        extractedBundleVer = match[1];
      }
    } catch {}
    cachedBundleVersion =
      extractedBundleVer ||
      `v_${crypto.createHash('sha1').update(statKey).digest('hex').slice(0, 12)}`;
  }

  return {
    version: cachedBundleVersion,
    questionsHash: QUESTIONS_HASH,
    totalQuestions: QUESTIONS_BANK.length,
    liveBundleUrl: '/appcreator24.html',
    webAppUrl: '/',
    updatedAt: Math.round(Math.max(bundleMtime, distMtime) || Date.now()),
  };
}

// Temporary profile snapshot store so mobile HTML-section clients upgrading to live URL keep points, badges & usedIds
interface SyncedPlayerProfile {
  data: Record<string, unknown>;
  expiresAt: number;
}
const syncedProfiles = new Map<string, SyncedPlayerProfile>();

function pruneSyncedProfiles() {
  const now = Date.now();
  syncedProfiles.forEach((entry, key) => {
    if (entry.expiresAt <= now) syncedProfiles.delete(key);
  });
}

// Live OTA version metadata endpoint (zero cache)
app.get('/api/app-meta', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  return res.json({
    success: true,
    ...getLiveAppMeta(),
  });
});

// Live Question Bank synchronization endpoint (supports compact for mobile HTML and full for web app)
app.get('/api/questions/bank', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  const meta = getLiveAppMeta();
  const clientV = String(req.query.v || '').trim();
  const format = String(req.query.format || 'compact').trim();

  if (clientV && (clientV === meta.questionsHash || clientV === meta.version)) {
    return res.json({
      success: true,
      upToDate: true,
      version: meta.version,
      questionsHash: meta.questionsHash,
      totalQuestions: meta.totalQuestions,
    });
  }

  return res.json({
    success: true,
    upToDate: false,
    version: meta.version,
    questionsHash: meta.questionsHash,
    totalQuestions: meta.totalQuestions,
    questions: format === 'full' ? QUESTIONS_BANK : COMPACT_QUESTIONS_CACHE,
  });
});

// Profile migration bridge for mobile WebViews upgrading from local file:// HTML to live hosted URL
app.post('/api/profile/sync', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  pruneSyncedProfiles();
  const playerId = String(req.body?.playerId || '').trim();
  if (!playerId || playerId.length > 120) {
    return res.status(400).json({ success: false, error: 'Invalid playerId' });
  }
  const payload = req.body?.data && typeof req.body.data === 'object' ? req.body.data : {};
  syncedProfiles.set(playerId, {
    data: payload,
    expiresAt: Date.now() + 15 * 60 * 1000,
  });
  return res.json({ success: true });
});

app.get('/api/profile/:playerId', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  pruneSyncedProfiles();
  const playerId = String(req.params.playerId || '').trim();
  const entry = syncedProfiles.get(playerId);
  if (!entry) {
    return res.json({ success: true, found: false, data: null });
  }
  return res.json({ success: true, found: true, data: entry.data });
});

// Serve standalone AppCreator24 bundle HTML directly (always fresh, zero stale cache)
app.get(['/appcreator24.html', '/appcreator24', '/appcreator'], (_req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  const filePath = path.join(ROOT_DIR, 'appcreator24_code.html');
  res.sendFile(filePath);
});
// Lightweight tiny auto-updating shell for AppCreator24 HTML Section (always loads latest live platform version)
app.get('/appcreator24/live-loader.html', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  const liveOrigin = 'https://ais-pre-dforsaebo7nl3hpgeoyqed-960882533050.europe-west2.run.app';
  const loaderHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>تحدي الابطال :مسابقة لايف</title>
  <style>
    body{margin:0;min-height:100vh;background:#030712;color:#f8fafc;font-family:sans-serif;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px}
    .box{max-width:340px;width:100%;background:#0f172a;border:1px solid #334155;border-radius:20px;padding:24px}
    .btn{display:inline-block;margin-top:14px;padding:10px 20px;background:#f59e0b;color:#020617;font-weight:800;border-radius:12px;text-decoration:none;border:0;cursor:pointer}
  </style>
</head>
<body>
  <div class="box">
    <div style="font-size:40px;margin-bottom:8px">🏆</div>
    <h2 style="margin:0 0 8px;color:#fbbf24;font-size:18px">تحدي الابطال :مسابقة لايف</h2>
    <p id="status" style="margin:0;color:#cbd5e1;font-size:13px">جاري الاتصال بالمنصة وتحميل أحدث نسخة...</p>
    <button id="retry" onclick="goLive()" class="btn" style="display:none">إعادة المحاولة</button>
  </div>
  <script>
    var TARGET = '${liveOrigin}/appcreator24.html';
    function goLive() {
      var st = document.getElementById('status');
      var rt = document.getElementById('retry');
      if (st) st.textContent = 'جاري الاتصال بالمنصة وتحميل أحدث نسخة...';
      if (rt) rt.style.display = 'none';
      fetch('${liveOrigin}/api/app-meta?t=' + Date.now(), { cache: 'no-store' })
        .then(function(r){ return r.json(); })
        .then(function(d){
          var ver = (d && d.version) ? d.version : String(Date.now());
          window.location.replace(TARGET + '?v=' + encodeURIComponent(ver));
        })
        .catch(function(){
          if (st) st.textContent = 'تعذر الاتصال بالإنترنت. تأكد من الاتصال واضغط إعادة المحاولة.';
          if (rt) rt.style.display = 'inline-block';
        });
    }
    goLive();
  </script>
</body>
</html>`;
  res.type('text/html; charset=utf-8').send(loaderHtml);
});
// Direct download endpoint (AppCreator24 filename)
app.get(['/download-appcreator24', '/appcreator24/download'], (_req, res) => {
  const filePath = path.join(ROOT_DIR, 'appcreator24_code.html');
  res.download(filePath, 'appcreator24_code.html');
});
// Direct download endpoint as standalone single-file index.html
app.get(['/download-index', '/index.html.download'], (_req, res) => {
  const filePath = path.join(ROOT_DIR, 'standalone', 'index.html');
  const fallback = path.join(ROOT_DIR, 'appcreator24_code.html');
  res.download(fs.existsSync(filePath) ? filePath : fallback, 'index.html');
});
app.get('/standalone-index.html', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const filePath = path.join(ROOT_DIR, 'standalone', 'index.html');
  const fallback = path.join(ROOT_DIR, 'appcreator24_code.html');
  res.sendFile(fs.existsSync(filePath) ? filePath : fallback);
});
// Plain text endpoint for instant copy-pasting on mobile and desktop
app.get(['/appcreator24.txt', '/appcreator24/raw'], (_req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const filePath = path.join(ROOT_DIR, 'appcreator24_code.html');
  res.type('text/plain; charset=utf-8').sendFile(filePath);
});
app.get('/google_play_cover.jpg', (_req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'public', 'google_play_cover.jpg'));
});
app.get('/google_play_icon.jpg', (_req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'public', 'google_play_icon.jpg'));
});

interface PlayerAnswer {
  optionIndex: number;
  responseTime: number;
  timestamp: number;
}

interface RoomContestant {
  id: string;
  deviceId?: string;
  name: string;
  avatar: string;
  country: string;
  role?: 'player1_host' | 'player2_guest' | 'player3_guest' | 'player4_guest';
  isHost: boolean;
  isBot?: boolean;
  score: number;
  status: 'idle' | 'reading' | 'thinking' | 'answered' | 'eliminated';
  selectedOption?: number;
  responseTime?: number;
  answeredRound?: number;
  lastIsCorrect?: boolean;
  lastPointsEarned?: number;
  lastHeartbeat?: number;
}

interface RoomChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  time: string;
  isSystem?: boolean;
}

interface CallParticipant {
  peerId: string;
  name: string;
  avatar: string;
  callMode: 'audio' | 'video';
  micOn: boolean;
  camOn: boolean;
  inCall: boolean;
  lastSeen: number;
}

interface RtcSignal {
  id: string;
  seq: number;
  fromId: string;
  fromName: string;
  fromAvatar: string;
  toId?: string;
  type: 'offer' | 'answer' | 'ice' | 'ring' | 'accept' | 'reject' | 'hangup' | 'media_state';
  callMode?: 'audio' | 'video';
  payload?: unknown;
  ts: number;
}

interface GameRoom {
  id: string;
  category: string;
  lang: string;
  mode: '1v1' | '4player';
  createdExplicitly?: boolean;
  totalQuestions: number;
  currentIndex: number;
  questionIds: string[];
  status: 'waiting' | 'reading' | 'playing' | 'revealed' | 'finished';
  roundStartedAt: number;
  gameStartedAt?: number;
  contestants: RoomContestant[];
  // Live score paths for each player as requested:
  player1_score: number;
  player2_score: number;
  player3_score: number;
  player4_score: number;
  // Separated player answer paths:
  player1_answer?: PlayerAnswer | null;
  player2_answer?: PlayerAnswer | null;
  player3_answer?: PlayerAnswer | null;
  player4_answer?: PlayerAnswer | null;
  forfeitedBy?: string | null;
  winnerRole?: string | null;
  usedBotNames?: string[];
  botTimers?: NodeJS.Timeout[];
  messages: RoomChatMessage[];
  listeners: ((data: string) => void)[];
  callParticipants?: Map<string, CallParticipant>;
  rtcSignals?: RtcSignal[];
  rtcSeq?: number;
}

const rooms = new Map<string, GameRoom>();
const activeSseByRoomPlayer = new Map<string, number>();
const sseDisconnectTimers = new Map<string, NodeJS.Timeout>();

interface WsClient {
  ws: WebSocket;
  roomId: string;
  peerId: string;
}
const wsClientsByRoom = new Map<string, Set<WsClient>>();

// Diverse Contestants Bot Pool across Arab and international regions
const WORLD_BOT_POOL = [
  { name: 'فهد التميمي', avatar: '🦅', country: 'SA' },
  { name: 'مريم الشاذلي', avatar: '🌸', country: 'EG' },
  { name: 'عمر القاسمي', avatar: '⚡', country: 'AE' },
  { name: 'ياسين بلقاسم', avatar: '🦁', country: 'DZ' },
  { name: 'سناء بن جلون', avatar: '🌟', country: 'MA' },
  { name: 'حيدر البابلي', avatar: '🚀', country: 'IQ' },
  { name: 'ريان العتيبي', avatar: '👑', country: 'SA' },
  { name: 'أحمد عبد الرحمن', avatar: '🧠', country: 'EG' },
  { name: 'شما المزروعي', avatar: '🌺', country: 'AE' },
  { name: 'نورة الغامدي', avatar: '💎', country: 'SA' },
  { name: 'يوسف الإدريسي', avatar: '🎯', country: 'MA' },
  { name: 'معاذ الطراونة', avatar: '🏆', country: 'JO' },
  { name: 'زينب الكرخي', avatar: '✨', country: 'IQ' },
  { name: 'أسامة بن ناصر', avatar: '🔥', country: 'DZ' },
  { name: 'تركي الحربي', avatar: '⚔️', country: 'SA' },
  { name: 'محمود الصاوي', avatar: '📚', country: 'EG' },
  { name: 'عبد العزيز الصباح', avatar: '🏅', country: 'KW' },
  { name: 'خليفة المري', avatar: '🐎', country: 'AE' },
  { name: 'سلطان المعمري', avatar: '⛵', country: 'OM' },
  { name: 'خديجة الفاسي', avatar: '🌷', country: 'MA' },
  { name: 'إلياس بن عاشور', avatar: '☀️', country: 'TN' },
  { name: 'مشاري الشمري', avatar: '🛡️', country: 'SA' },
  { name: 'ياسمين فريد', avatar: '🎀', country: 'EG' },
  { name: 'دلال المطيري', avatar: '🌟', country: 'KW' },
  { name: 'ليان المجالي', avatar: '💫', country: 'JO' },
  { name: 'سارة الدوسري', avatar: '🌙', country: 'SA' },
  { name: 'أمينة بوحامد', avatar: '🦋', country: 'DZ' },
  { name: 'مصطفى الجبوري', avatar: '🦅', country: 'IQ' },
  { name: 'فاطمة البوسعيدي', avatar: '🌹', country: 'OM' },
  { name: 'منصور المنصوري', avatar: '⚡', country: 'AE' },
  { name: 'Alex Johnson', avatar: '🧠', country: 'US' },
  { name: 'Oliver Smith', avatar: '👑', country: 'GB' },
];

const BOT_CHAT_GREETINGS = [
  'مساء الخير جميعاً وبالتوفيق للجميع! 🌟',
  'أهلاً بكم في التحدي! متحمس جداً للمبارزة 🔥',
  'جاهزون للتحدي الكبير اليوم 💪',
  'تحدي رائع، يا رب الفوز 🏆',
  'بالتوفيق للجميع، لنرى من سيحصد أعلى النقاط!'
];

const BOT_CHAT_REPLIES = [
  'بالتوفيق يا بطل! التحدي مشتعل 🔥',
  'أهلاً بك، لنرى من سيصل للمركز الأول 💪',
  'سؤال قوي ورائع، أحسنت 👏',
  'المنافسة قوية جداً بيننا اليوم 🎯',
  'ما شاء الله، إجابات سريعة وتركيز عالي!',
  'أحسنت! سأحاول التعويض في السؤال القادم 👏',
  'تحدي ممتع ومنافسة شريفة 🌟',
  'يا بطل، مستواك عالي جداً!'
];

// Helper to broadcast SSE & WebSocket event to all connected devices in a room
function broadcastRoomUpdate(room: GameRoom, eventName: string, payload: unknown) {
  const data = JSON.stringify({ event: eventName, data: payload });
  room.listeners.forEach((listener) => {
    try {
      listener(data);
    } catch {
      // client disconnected
    }
  });
  const wsSet = wsClientsByRoom.get(room.id);
  if (wsSet) {
    wsSet.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(data);
        } catch {}
      }
    });
  }
}

function getActiveCallParticipants(room: GameRoom): CallParticipant[] {
  if (!room.callParticipants) room.callParticipants = new Map();
  const now = Date.now();
  for (const [pid, p] of room.callParticipants.entries()) {
    if (now - p.lastSeen > 22000) {
      room.callParticipants.delete(pid);
    }
  }
  return Array.from(room.callParticipants.values());
}

// Global Online Matchmaking Queue for 1v1
interface QueueItem {
  playerId: string;
  deviceId?: string;
  name: string;
  avatar: string;
  country: string;
  category: string;
  lang: string;
  joinedAt: number;
  excludeIds?: string[];
  matchedRoomId?: string;
  assignedRole?: 'player1_host' | 'player2_guest';
  opponent?: {
    id: string;
    name: string;
    avatar: string;
    country: string;
    role: 'player1_host' | 'player2_guest';
    isBot: boolean;
  };
}

const matchmakingQueue = new Map<string, QueueItem>();

// Dedicated 4-Player Matchmaking Queue: strictly wait for 4 real players (playersCount == 4)
interface FourPlayerQueueItem {
  deviceId: string;
  playerId: string;
  name: string;
  avatar: string;
  country: string;
  category: string;
  lang: string;
  joinedAt: number;
  lastSeen: number;
  matchedRoomId?: string;
  assignedRole?: 'player1_host' | 'player2_guest' | 'player3_guest' | 'player4_guest';
  contestants?: RoomContestant[];
  excludeIds?: string[];
}

const fourPlayerQueue = new Map<string, FourPlayerQueueItem>();
const recent4pMatches = new Map<
  string,
  {
    roomId: string;
    role: 'player1_host' | 'player2_guest' | 'player3_guest' | 'player4_guest';
    matchedAt: number;
  }
>();

function pruneRecent4pMatches() {
  const cutoff = Date.now() - 90000;
  for (const [k, v] of recent4pMatches.entries()) {
    if (v.matchedAt < cutoff) recent4pMatches.delete(k);
  }
}

// 1. Create Room (Strictly 4-digit PIN code for 1v1 Friend Duel)
app.post('/api/rooms/create', (req, res) => {
  const { category = 'all', lang = 'ar', totalQuestions = 10, hostId, hostName = 'المتسابق الأول', hostAvatar = '👑', country = 'SA', roomId: reqRoomId, excludeIds } = req.body;
  const cleanedReq = reqRoomId ? String(reqRoomId).replace(/\D/g, '').slice(0, 4) : '';
  const roomId = (cleanedReq.length === 4 ? cleanedReq : String(Math.floor(1000 + Math.random() * 9000)));

  const existingPlaceholder = rooms.get(roomId);
  const existingListeners = existingPlaceholder?.listeners || [];
  const existingCallParticipants = existingPlaceholder?.callParticipants;
  const existingRtcSignals = existingPlaceholder?.rtcSignals;
  const existingRtcSeq = existingPlaceholder?.rtcSeq;
  const existingGuest =
    existingPlaceholder && !existingPlaceholder.createdExplicitly
      ? existingPlaceholder.contestants.find((c) => c.id !== hostId && !c.isHost)
      : undefined;

  const host: RoomContestant = {
    id: hostId || `p_${Date.now()}`,
    name: hostName,
    avatar: hostAvatar,
    country,
    role: 'player1_host',
    isHost: true,
    isBot: false,
    score: 0,
    status: 'idle',
    lastHeartbeat: Date.now(),
  };

  const contestants: RoomContestant[] = [host];
  if (existingGuest) {
    existingGuest.role = 'player2_guest';
    existingGuest.isHost = false;
    contestants.push(existingGuest);
  }

  const mergedExclude = getCombinedExcludeIds([host.id], Array.isArray(excludeIds) ? excludeIds : undefined);
  const questionIds = generateRoomQuestionIds(roomId, totalQuestions, category, mergedExclude);
  recordSeenQuestionsForPlayers([host.id], questionIds);
  const now = Date.now();
  const hasBothAlready = contestants.length >= 2;
  const newRoom: GameRoom = {
    id: roomId,
    category,
    lang,
    mode: '1v1',
    createdExplicitly: true,
    totalQuestions,
    currentIndex: 0,
    questionIds,
    status: hasBothAlready ? 'reading' : 'waiting',
    roundStartedAt: now,
    gameStartedAt: hasBothAlready ? now : undefined,
    contestants,
    player1_score: 0,
    player2_score: 0,
    player3_score: 0,
    player4_score: 0,
    player1_answer: null,
    player2_answer: null,
    player3_answer: null,
    player4_answer: null,
    messages: [
      {
        id: `m_${now}`,
        senderId: 'system',
        senderName: 'المذيع / Host',
        senderAvatar: '🎙️',
        text: lang === 'ar'
          ? `تم إنشاء غرفة التحدي الثنائي بكود (${roomId})! أعطِ الكود لصديقك للدخول فوراً.`
          : `1v1 room (${roomId}) created! Share this 4-digit code with your friend to join.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
    listeners: existingListeners,
    callParticipants: existingCallParticipants,
    rtcSignals: existingRtcSignals,
    rtcSeq: existingRtcSeq,
  };

  rooms.set(roomId, newRoom);
  if (hasBothAlready) {
    newRoom.contestants.forEach((c) => {
      c.status = 'reading';
      c.lastHeartbeat = now;
    });
    broadcastRoomUpdate(newRoom, 'game:started', {
      currentIndex: newRoom.currentIndex,
      roundStartedAt: newRoom.roundStartedAt,
      status: newRoom.status,
      contestants: newRoom.contestants,
      questionIds: newRoom.questionIds,
    });
  }
  const questions = questionIds.map((id) => questionsMap.get(id)).filter(Boolean);
  res.json({ success: true, roomId, room: { ...newRoom, listeners: undefined, botTimers: undefined }, playerId: host.id, questions });
});

function getOrCreateRoom(
  roomId: string,
  lang = 'ar',
  mode: '1v1' | '4player' = '1v1',
  excludeIds?: string[],
  playerIds?: string[]
): GameRoom {
  let room = rooms.get(roomId);
  if (!room) {
    const isWorld = roomId === 'WORLD-CHALLENGE' || roomId === 'WORLD-ARENA' || roomId === 'M-GLOBAL';
    const effectiveMode = roomId.startsWith('4P_') ? '4player' : mode;
    const mergedExclude = getCombinedExcludeIds(playerIds || [], excludeIds);
    const questionIds = generateRoomQuestionIds(roomId, 10, 'all', mergedExclude);
    if (playerIds && playerIds.length > 0) {
      recordSeenQuestionsForPlayers(playerIds, questionIds);
    }
    room = {
      id: roomId,
      category: 'all',
      lang,
      mode: effectiveMode,
      totalQuestions: 10,
      currentIndex: 0,
      questionIds,
      status: 'waiting',
      roundStartedAt: Date.now(),
      contestants: [],
      player1_score: 0,
      player2_score: 0,
      player3_score: 0,
      player4_score: 0,
      player1_answer: null,
      player2_answer: null,
      player3_answer: null,
      player4_answer: null,
      messages: [
        {
          id: `m_init_${Date.now()}`,
          senderId: 'system',
          senderName: lang === 'ar' ? 'المذيع والحكم الدولي' : 'Host & Global Referee',
          senderAvatar: '🎙️',
          text: isWorld
            ? (lang === 'ar'
                ? '🌍 أهلاً بكم في صالة تحدي أذكياء العالم! الدردشة المباشرة متزامنة الآن بين جميع الأجهزة والبلدان.'
                : '🌍 Welcome to the World Champions Arena! Live chat is synchronized across all devices worldwide.')
            : (lang === 'ar'
                ? `أهلاً بكم في غرفة التحدي ${roomId}! شارك الرمز أو الرابط وتنافسوا على الهواء مباشرة.`
                : `Welcome to room ${roomId}! Share PIN or link to compete live.`),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      listeners: [],
    };
    rooms.set(roomId, room);
  }
  return room;
}

// Pre-initialize world arenas
getOrCreateRoom('WORLD-CHALLENGE', 'ar');
getOrCreateRoom('WORLD-ARENA', 'ar');
getOrCreateRoom('M-GLOBAL', 'ar');

// ==========================================
// 1. ONLINE MATCHMAKING QUEUE (نظام مطابقة اللاعبين حول العالم)
// ==========================================
app.post('/api/matchmaking/join', (req, res) => {
  const { playerId, name = 'متسابق', avatar = '👑', country = 'SA', category = 'all', lang = 'ar', excludeIds } = req.body;
  if (!playerId) return res.status(400).json({ success: false, error: 'Missing playerId' });
  const cleanExclude = Array.isArray(excludeIds) ? excludeIds.filter((id: unknown) => typeof id === 'string') : [];

  const now = Date.now();

  // Clean stale queue entries older than 25s
  for (const [key, item] of matchmakingQueue.entries()) {
    if (now - item.joinedAt > 25000 && !item.matchedRoomId) {
      matchmakingQueue.delete(key);
    }
  }

  // Look for a real opponent waiting in the queue
  let waitingOpponent: QueueItem | null = null;
  for (const [qId, item] of matchmakingQueue.entries()) {
    if (qId !== playerId && !item.matchedRoomId && now - item.joinedAt < 18000) {
      waitingOpponent = item;
      break;
    }
  }

  if (waitingOpponent) {
    // MATCH FOUND between two real players!
    const roomId = `1V1_${Math.floor(100000 + Math.random() * 900000)}`;

    const p1: RoomContestant = {
      id: waitingOpponent.playerId,
      name: waitingOpponent.name,
      avatar: waitingOpponent.avatar,
      country: waitingOpponent.country,
      role: 'player1_host',
      isHost: true,
      isBot: false,
      score: 0,
      status: 'idle',
      lastHeartbeat: now,
    };

    const p2: RoomContestant = {
      id: playerId,
      name,
      avatar,
      country,
      role: 'player2_guest',
      isHost: false,
      isBot: false,
      score: 0,
      status: 'idle',
      lastHeartbeat: now,
    };

    const duelExclude = getCombinedExcludeIds(
      [waitingOpponent.playerId, playerId],
      [...(waitingOpponent.excludeIds || []), ...cleanExclude]
    );
    const duelQuestionIds = generateRoomQuestionIds(roomId, 10, category, duelExclude);
    recordSeenQuestionsForPlayers([waitingOpponent.playerId, playerId], duelQuestionIds);

    const duelRoom: GameRoom = {
      id: roomId,
      category,
      lang,
      mode: '1v1',
      totalQuestions: 10,
      currentIndex: 0,
      questionIds: duelQuestionIds,
      status: 'reading',
      roundStartedAt: now,
      contestants: [p1, p2],
      player1_score: 0,
      player2_score: 0,
      player3_score: 0,
      player4_score: 0,
      player1_answer: null,
      player2_answer: null,
      messages: [
        {
          id: `m_match_${now}`,
          senderId: 'system',
          senderName: lang === 'ar' ? 'المذيع الدولي' : 'Match Referee',
          senderAvatar: '🎙️',
          text: lang === 'ar'
            ? `🔥 تم العثور على خصم حقيقي! المواجهة المباشرة بين (${p1.name}) و (${p2.name}). بالتوفيق!`
            : `🔥 Match found! Live duel between (${p1.name}) and (${p2.name}). Good luck!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      listeners: [],
    };

    rooms.set(roomId, duelRoom);

    // Update the waiting player's queue record so their polling / SSE picks it up immediately
    waitingOpponent.matchedRoomId = roomId;
    waitingOpponent.assignedRole = 'player1_host';
    waitingOpponent.opponent = {
      id: p2.id,
      name: p2.name,
      avatar: p2.avatar,
      country: p2.country,
      role: 'player2_guest',
      isBot: false,
    };

    return res.json({
      success: true,
      matched: true,
      roomId,
      role: 'player2_guest',
      opponent: {
        id: p1.id,
        name: p1.name,
        avatar: p1.avatar,
        country: p1.country,
        role: 'player1_host',
        isBot: false,
      },
    });
  }

  // No real opponent available right this second: register in queue
  matchmakingQueue.set(playerId, {
    playerId,
    name,
    avatar,
    country,
    category,
    lang,
    joinedAt: now,
    excludeIds: cleanExclude,
  });

  res.json({ success: true, matched: false, status: 'searching' });
});

// Matchmaking Queue Status Check (called every 1s by waiting client)
app.get('/api/matchmaking/status', (req, res) => {
  const playerId = String(req.query.playerId || '');
  if (!playerId) return res.status(400).json({ success: false, error: 'Missing playerId' });

  const item = matchmakingQueue.get(playerId);
  if (!item) {
    return res.json({ success: true, matched: false, status: 'idle' });
  }

  // If already matched with another real player
  if (item.matchedRoomId) {
    const roomId = item.matchedRoomId;
    const role = item.assignedRole || 'player1_host';
    const opponent = item.opponent;
    matchmakingQueue.delete(playerId);
    return res.json({
      success: true,
      matched: true,
      roomId,
      role,
      opponent,
    });
  }

  // If waiting for more than 5.5 seconds, seamlessly match with an intelligent AI Bot challenger!
  const elapsed = Date.now() - item.joinedAt;
  if (elapsed > 5500) {
    matchmakingQueue.delete(playerId);
    const botTemplate = WORLD_BOT_POOL[Math.floor(Math.random() * WORLD_BOT_POOL.length)];
    const roomId = `1V1_${Math.floor(100000 + Math.random() * 900000)}`;

    const p1: RoomContestant = {
      id: item.playerId,
      name: item.name,
      avatar: item.avatar,
      country: item.country,
      role: 'player1_host',
      isHost: true,
      isBot: false,
      score: 0,
      status: 'idle',
      lastHeartbeat: Date.now(),
    };

    const p2: RoomContestant = {
      id: `bot_${Date.now()}`,
      name: botTemplate.name,
      avatar: botTemplate.avatar,
      country: botTemplate.country,
      role: 'player2_guest',
      isHost: false,
      isBot: true,
      score: 0,
      status: 'idle',
      lastHeartbeat: Date.now(),
    };

    const botDuelExclude = getCombinedExcludeIds([item.playerId], item.excludeIds);
    const botDuelQuestionIds = generateRoomQuestionIds(roomId, 10, item.category, botDuelExclude);
    recordSeenQuestionsForPlayers([item.playerId], botDuelQuestionIds);

    const duelRoom: GameRoom = {
      id: roomId,
      category: item.category || 'all',
      lang: item.lang || 'ar',
      mode: '1v1',
      totalQuestions: 10,
      currentIndex: 0,
      questionIds: botDuelQuestionIds,
      status: 'reading',
      roundStartedAt: Date.now(),
      contestants: [p1, p2],
      player1_score: 0,
      player2_score: 0,
      player3_score: 0,
      player4_score: 0,
      player1_answer: null,
      player2_answer: null,
      messages: [
        {
          id: `m_match_${Date.now()}`,
          senderId: 'system',
          senderName: item.lang === 'ar' ? 'المذيع الدولي' : 'Match Referee',
          senderAvatar: '🎙️',
          text: item.lang === 'ar'
            ? `🔥 تم بدء التحدي المباشر بين (${p1.name}) و (${p2.name}). بالتوفيق لكلا المتسابقين!`
            : `🔥 Match started between (${p1.name}) and (${p2.name}). Good luck!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      listeners: [],
    };

    rooms.set(roomId, duelRoom);

    return res.json({
      success: true,
      matched: true,
      roomId,
      role: 'player1_host',
      opponent: {
        id: p2.id,
        name: p2.name,
        avatar: p2.avatar,
        country: p2.country,
        role: 'player2_guest',
        isBot: true,
      },
    });
  }

  res.json({ success: true, matched: false, status: 'searching', elapsed });
});

app.post('/api/matchmaking/leave', (req, res) => {
  const { playerId, deviceId } = req.body;
  if (playerId) matchmakingQueue.delete(playerId);
  if (deviceId) fourPlayerQueue.delete(deviceId);
  res.json({ success: true });
});

// Helper: pick an unused fresh bot with rotating name so bots never repeat the same name
function pickFreshBotTemplate(room?: GameRoom) {
  const used = new Set<string>(room?.usedBotNames || []);
  if (room) {
    room.contestants.forEach((c) => used.add(c.name));
  }
  const candidates = WORLD_BOT_POOL.filter((b) => !used.has(b.name));
  const pool = candidates.length > 0 ? candidates : WORLD_BOT_POOL;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  if (room) {
    if (!room.usedBotNames) room.usedBotNames = [];
    room.usedBotNames.push(picked.name);
  }
  return picked;
}

function clearRoomBotTimers(room: GameRoom) {
  if (room.botTimers && room.botTimers.length > 0) {
    room.botTimers.forEach((t) => clearTimeout(t));
  }
  room.botTimers = [];
}

function processAnswerIntoRoom(
  room: GameRoom,
  params: {
    playerId?: string;
    role?: string;
    optionIndex: number;
    responseTime: number;
    isCorrect: boolean;
    pointsEarned?: number;
    roundIndex?: number;
  }
) {
  const { playerId, role, optionIndex, responseTime, isCorrect, pointsEarned, roundIndex } = params;

  // Reject stale answers belonging to an earlier round so they never mark or reveal the active round
  if (typeof roundIndex === 'number' && !Number.isNaN(roundIndex) && roundIndex !== room.currentIndex) {
    return room.status === 'revealed';
  }

  const calculatedPoints =
    typeof pointsEarned === 'number'
      ? pointsEarned
      : isCorrect
      ? Math.round(1000 + Math.max(0, (40 - (responseTime || 5)) * 25))
      : 0;

  const answerPayload: PlayerAnswer = {
    optionIndex,
    responseTime: responseTime || 5.0,
    timestamp: Date.now(),
  };

  // Match strictly by playerId FIRST so two linked devices NEVER overwrite the same contestant slot!
  let contestant = playerId ? room.contestants.find((c) => c.id === playerId) : undefined;
  if (!contestant && role) {
    contestant = room.contestants.find((c) => c.role === role && (!playerId || c.id === playerId || c.isBot));
    if (!contestant) {
      contestant = room.contestants.find((c) => c.role === role);
    }
  }

  // Defensive registration if a guest/player answers cleanly after reconnect before contestant slot settled
  if (!contestant && playerId && room.contestants.length < (room.mode === '4player' ? 4 : 2)) {
    const rolesOrder: ('player1_host' | 'player2_guest' | 'player3_guest' | 'player4_guest')[] = [
      'player1_host',
      'player2_guest',
      'player3_guest',
      'player4_guest',
    ];
    const usedRoles = new Set(room.contestants.map((c) => c.role));
    const preferredRole =
      role && !usedRoles.has(role as any)
        ? (role as 'player1_host' | 'player2_guest' | 'player3_guest' | 'player4_guest')
        : rolesOrder.find((r) => !usedRoles.has(r)) || 'player2_guest';
    contestant = {
      id: playerId,
      name: room.lang === 'ar' ? 'المتسابق' : 'Contestant',
      avatar: '⚡',
      country: 'SA',
      role: preferredRole,
      isHost: preferredRole === 'player1_host',
      isBot: false,
      score: 0,
      status: 'reading',
      lastHeartbeat: Date.now(),
    };
    room.contestants.push(contestant);
  }

  if (contestant) {
    // Prevent duplicate scoring if the same contestant already answered THIS round
    if (contestant.status === 'answered' && contestant.answeredRound === room.currentIndex) {
      const minRequired = room.mode === '4player' ? Math.max(2, room.contestants.length) : 2;
      const alreadyAll =
        room.contestants.length >= minRequired &&
        room.contestants.every(
          (c) => (c.status === 'answered' && c.answeredRound === room.currentIndex) || c.status === 'eliminated'
        );
      return alreadyAll || room.status === 'revealed';
    }
    contestant.status = 'answered';
    contestant.answeredRound = room.currentIndex;
    contestant.selectedOption = optionIndex;
    contestant.responseTime = responseTime;
    contestant.lastIsCorrect = isCorrect;
    contestant.lastPointsEarned = calculatedPoints;
    contestant.score += calculatedPoints;
    contestant.lastHeartbeat = Date.now();
  }

  const effectiveRole = (contestant ? contestant.role : role) || 'player1_host';
  if (effectiveRole === 'player1_host') {
    room.player1_score = contestant ? contestant.score : room.player1_score + calculatedPoints;
    room.player1_answer = answerPayload;
  } else if (effectiveRole === 'player2_guest') {
    room.player2_score = contestant ? contestant.score : room.player2_score + calculatedPoints;
    room.player2_answer = answerPayload;
  } else if (effectiveRole === 'player3_guest') {
    room.player3_score = contestant ? contestant.score : room.player3_score + calculatedPoints;
    room.player3_answer = answerPayload;
  } else if (effectiveRole === 'player4_guest') {
    room.player4_score = contestant ? contestant.score : room.player4_score + calculatedPoints;
    room.player4_answer = answerPayload;
  }

  const scoresPayload = {
    role: effectiveRole,
    playerId: contestant?.id || playerId,
    currentIndex: room.currentIndex,
    roundIndex: room.currentIndex,
    roundStartedAt: room.roundStartedAt,
    hasAnswered: true,
    lastAnswer: {
      playerId: contestant?.id || playerId,
      name: contestant?.name || (room.lang === 'ar' ? 'المتسابق' : 'Contestant'),
      avatar: contestant?.avatar || '⚡',
      role: effectiveRole,
      isCorrect: Boolean(isCorrect),
      pointsEarned: calculatedPoints,
      score: contestant?.score ?? 0,
      roundIndex: room.currentIndex,
    },
    player1_score: room.player1_score,
    player2_score: room.player2_score,
    player3_score: room.player3_score,
    player4_score: room.player4_score,
    contestants: room.contestants.map((c) => ({
      id: c.id,
      name: c.name,
      avatar: c.avatar,
      country: c.country,
      role: c.role,
      status: c.status,
      answeredRound: c.answeredRound,
      lastIsCorrect: c.lastIsCorrect,
      lastPointsEarned: c.lastPointsEarned,
      score: c.score,
      isBot: c.isBot,
    })),
  };

  broadcastRoomUpdate(room, 'duel:player_answered', scoresPayload);
  broadcastRoomUpdate(room, 'score:updated', scoresPayload);

  // STRICT REVEAL GATING:
  // - In 1v1: NEVER reveal until BOTH players (contestants.length >= 2) have answered this round!
  // - In 4player: NEVER reveal until ALL 4 contestants in the room have answered (or been eliminated) this round!
  const requiredCount = room.mode === '4player' ? Math.max(4, room.contestants.length) : 2;
  const allContestantsAnswered =
    room.contestants.length >= requiredCount &&
    room.contestants.every(
      (c) => (c.status === 'answered' && c.answeredRound === room.currentIndex) || c.status === 'eliminated'
    );

  const both1v1Answered =
    room.mode === '1v1' &&
    room.contestants.length >= 2 &&
    room.player1_answer !== null &&
    room.player2_answer !== null &&
    room.contestants[0].status === 'answered' &&
    room.contestants[1].status === 'answered' &&
    room.contestants[0].answeredRound === room.currentIndex &&
    room.contestants[1].answeredRound === room.currentIndex;

  const shouldReveal = room.mode === '4player' ? allContestantsAnswered : allContestantsAnswered && both1v1Answered;

  if (shouldReveal && room.status !== 'revealed' && room.status !== 'finished') {
    room.status = 'revealed';
    broadcastRoomUpdate(room, 'duel:round_revealed', {
      status: 'revealed',
      currentIndex: room.currentIndex,
      roundIndex: room.currentIndex,
      roundStartedAt: room.roundStartedAt,
      player1_answer: room.player1_answer,
      player2_answer: room.player2_answer,
      player3_answer: room.player3_answer,
      player4_answer: room.player4_answer,
      player1_score: room.player1_score,
      player2_score: room.player2_score,
      player3_score: room.player3_score,
      player4_score: room.player4_score,
      contestants: room.contestants,
    });
  }

  return shouldReveal;
}

function scheduleBotAnswersForRoom(room: GameRoom, onlyBotId?: string) {
  if (room.mode !== '4player' || room.status === 'finished' || room.status === 'revealed') return;
  const botTimers = (room.botTimers ??= []);

  const qId = room.questionIds[room.currentIndex];
  const question = qId ? questionsMap.get(qId) : undefined;
  const correctIdx = question ? question.correctIndex : 0;
  const expectedRoundIndex = room.currentIndex;

  room.contestants.forEach((c) => {
    if (!c.isBot || c.status === 'answered') return;
    if (onlyBotId && c.id !== onlyBotId) return;

    const delayMs = 5500 + Math.floor(Math.random() * 6500);
    const timer = setTimeout(() => {
      if (!rooms.has(room.id)) return;
      if (room.currentIndex !== expectedRoundIndex) return;
      if (room.status === 'finished' || room.status === 'revealed') return;
      const latestCont = room.contestants.find((item) => item.id === c.id);
      if (!latestCont || !latestCont.isBot || latestCont.status === 'answered') return;

      const isCorrect = Math.random() < 0.72;
      const chosen = isCorrect ? correctIdx : (correctIdx + 1 + Math.floor(Math.random() * 3)) % 4;
      const respTime = parseFloat((delayMs / 1000).toFixed(1));
      const pts = isCorrect ? 50 : 0;

      processAnswerIntoRoom(room, {
        playerId: latestCont.id,
        role: latestCont.role,
        optionIndex: chosen,
        responseTime: respTime,
        isCorrect,
        pointsEarned: pts,
        roundIndex: expectedRoundIndex,
      });
    }, delayMs);

    botTimers.push(timer);
  });
}

function replaceHumanWithFreshBot(room: GameRoom, departing: RoomContestant) {
  const newBotTpl = pickFreshBotTemplate(room);
  const oldName = departing.name;
  const newBotId = `bot_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  departing.id = newBotId;
  departing.deviceId = `bot_dev_${Date.now()}`;
  departing.name = newBotTpl.name;
  departing.avatar = newBotTpl.avatar;
  departing.country = newBotTpl.country;
  departing.isBot = true;
  departing.isHost = false;
  departing.lastHeartbeat = Date.now();
  if (departing.status !== 'answered') {
    departing.status = 'thinking';
  }

  // Reassign host if a human host left
  if (!room.contestants.some((c) => !c.isBot && c.isHost)) {
    const firstHuman = room.contestants.find((c) => !c.isBot);
    if (firstHuman) firstHuman.isHost = true;
  }

  const greetMsg: RoomChatMessage = {
    id: `m_bot_hi_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    senderId: newBotId,
    senderName: newBotTpl.name,
    senderAvatar: newBotTpl.avatar,
    text: BOT_CHAT_GREETINGS[Math.floor(Math.random() * BOT_CHAT_GREETINGS.length)],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  room.messages.push(greetMsg);

  broadcastRoomUpdate(room, 'room:bot_replaced', {
    oldName,
    newBot: {
      id: newBotId,
      name: newBotTpl.name,
      avatar: newBotTpl.avatar,
      country: newBotTpl.country,
      role: departing.role,
    },
    contestants: room.contestants,
    messages: [greetMsg],
  });
  broadcastRoomUpdate(room, 'chat:message', { message: greetMsg });

  if (room.status === 'reading' || room.status === 'playing') {
    scheduleBotAnswersForRoom(room, newBotId);
  }
}

// ==========================================
// 1.5 DEDICATED 4-PLAYER WORLDWIDE MATCHMAKING QUEUE
// Accepts ALL searching devices globally; at 60s fills empty slots with rotating AI bots!
// ==========================================
const FOUR_PLAYER_SEARCH_TIMEOUT_MS = 60000;

function launch4PlayerRoomWithBots(realPlayers: FourPlayerQueueItem[]): GameRoom {
  const roomId = `4P_${Math.floor(100000 + Math.random() * 900000)}`;
  const roles: ('player1_host' | 'player2_guest' | 'player3_guest' | 'player4_guest')[] = [
    'player1_host',
    'player2_guest',
    'player3_guest',
    'player4_guest',
  ];

  const now = Date.now();
  const contestants: RoomContestant[] = [];
  const usedBotNames: string[] = [];

  // 1. Add all real devices currently searching worldwide (1..4)
  realPlayers.forEach((item, idx) => {
    contestants.push({
      id: item.playerId,
      deviceId: item.deviceId,
      name: item.name,
      avatar: item.avatar,
      country: item.country,
      role: roles[idx],
      isHost: idx === 0,
      isBot: false,
      score: 0,
      status: 'reading',
      lastHeartbeat: now,
    });
  });

  // 2. Fill remaining empty slots with diverse, unique AI bots whose names rotate every time
  const shuffledBots = [...WORLD_BOT_POOL].sort(() => 0.5 - Math.random());
  const existingNames = new Set(contestants.map((c) => c.name));

  while (contestants.length < 4) {
    const roleIdx = contestants.length;
    const botTemplate =
      shuffledBots.find((b) => !existingNames.has(b.name) && !usedBotNames.includes(b.name)) ||
      shuffledBots[roleIdx % shuffledBots.length];
    existingNames.add(botTemplate.name);
    usedBotNames.push(botTemplate.name);

    contestants.push({
      id: `bot_${roleIdx}_${now}_${Math.floor(Math.random() * 1000)}`,
      deviceId: `bot_dev_${roleIdx}`,
      name: botTemplate.name,
      avatar: botTemplate.avatar,
      country: botTemplate.country,
      role: roles[roleIdx],
      isHost: false,
      isBot: true,
      score: 0,
      status: 'reading',
      lastHeartbeat: now,
    });
  }

  const greetingBot = contestants.find((c) => c.isBot);
  const initialMessages: RoomChatMessage[] = [
    {
      id: `m_match4_${now}`,
      senderId: 'system',
      senderName: 'المذيع الدولي',
      senderAvatar: '🎙️',
      text: `🔥 انطلقت معركة الـ 4 لاعبين! المتسابقون: (${contestants.map((c) => c.name).join(' و ')}). بالتوفيق للجميع!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ];

  if (greetingBot) {
    initialMessages.push({
      id: `m_bot_greet_${now}`,
      senderId: greetingBot.id,
      senderName: greetingBot.name,
      senderAvatar: greetingBot.avatar,
      text: BOT_CHAT_GREETINGS[Math.floor(Math.random() * BOT_CHAT_GREETINGS.length)],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }

  const chosenCat = realPlayers.find((p) => p.category && p.category !== 'all')?.category || 'all';
  const combinedExclude = getCombinedExcludeIds(
    realPlayers.flatMap((p) => [p.playerId, p.deviceId]),
    realPlayers.flatMap((p) => (Array.isArray(p.excludeIds) ? p.excludeIds : []))
  );
  const generated4pIds = generateRoomQuestionIds(roomId, 10, chosenCat, combinedExclude);
  recordSeenQuestionsForPlayers(
    realPlayers.flatMap((p) => [p.playerId, p.deviceId]),
    generated4pIds
  );
  const fourRoom: GameRoom = {
    id: roomId,
    category: chosenCat,
    lang: realPlayers[0]?.lang || 'ar',
    mode: '4player',
    createdExplicitly: true,
    totalQuestions: 10,
    currentIndex: 0,
    questionIds: generated4pIds,
    status: 'reading',
    roundStartedAt: now,
    gameStartedAt: now,
    contestants,
    usedBotNames,
    botTimers: [],
    player1_score: 0,
    player2_score: 0,
    player3_score: 0,
    player4_score: 0,
    player1_answer: null,
    player2_answer: null,
    player3_answer: null,
    player4_answer: null,
    messages: initialMessages,
    listeners: [],
  };

  rooms.set(roomId, fourRoom);

  realPlayers.forEach((item, idx) => {
    item.matchedRoomId = roomId;
    item.assignedRole = roles[idx];
    item.contestants = contestants;
    recent4pMatches.set(item.deviceId, { roomId, role: roles[idx], matchedAt: now });
    if (item.playerId && item.playerId !== item.deviceId) {
      recent4pMatches.set(item.playerId, { roomId, role: roles[idx], matchedAt: now });
    }
  });

  // Schedule authoritative server bot answers for Round 1
  scheduleBotAnswersForRoom(fourRoom);

  return fourRoom;
}

app.post('/api/matchmaking/4p/join', (req, res) => {
  const {
    deviceId: rawDeviceId,
    playerId: rawPlayerId,
    name = 'متسابق',
    avatar = '👑',
    country = 'SA',
    category = 'all',
    lang = 'ar',
    excludeIds,
  } = req.body;

  const deviceId = (rawDeviceId || rawPlayerId || `dev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`).toString();
  const playerId = (rawPlayerId || deviceId).toString();
  const now = Date.now();
  const cleanExclude = Array.isArray(excludeIds) ? excludeIds.filter((id: unknown) => typeof id === 'string') : [];
  pruneRecent4pMatches();
  recent4pMatches.delete(deviceId);
  recent4pMatches.delete(playerId);

  // Clean stale unmatched entries (> 45s without poll) and expired matched entries (> 60s)
  for (const [key, item] of fourPlayerQueue.entries()) {
    if (!item.matchedRoomId && now - item.lastSeen > 45000) {
      fourPlayerQueue.delete(key);
    } else if (item.matchedRoomId && now - item.lastSeen > 60000) {
      fourPlayerQueue.delete(key);
    }
  }

  // Always start/refresh clean queue entry for this device
  const existing = fourPlayerQueue.get(deviceId);
  let myItem: FourPlayerQueueItem;
  if (!existing || existing.matchedRoomId) {
    myItem = {
      deviceId,
      playerId,
      name,
      avatar,
      country,
      category,
      lang,
      joinedAt: now,
      lastSeen: now,
      excludeIds: cleanExclude,
    };
    fourPlayerQueue.set(deviceId, myItem);
  } else {
    myItem = existing;
    myItem.playerId = playerId;
    myItem.name = name;
    myItem.avatar = avatar;
    myItem.country = country;
    myItem.category = category;
    myItem.lastSeen = now;
    if (cleanExclude.length > 0) myItem.excludeIds = cleanExclude;
  }

  // Gather ALL real devices currently searching worldwide (not already matched)
  const waitingDevices: FourPlayerQueueItem[] = [];
  for (const item of fourPlayerQueue.values()) {
    if (!item.matchedRoomId && now - item.lastSeen < 45000) {
      waitingDevices.push(item);
    }
  }

  if (waitingDevices.length >= 4) {
    const group = waitingDevices.slice(0, 4);
    const fourRoom = launch4PlayerRoomWithBots(group);
    const myIndex = group.findIndex((g) => g.deviceId === deviceId);
    const assignedRole = myIndex >= 0 ? group[myIndex].assignedRole! : 'player1_host';
    fourPlayerQueue.delete(deviceId);
    const questions = fourRoom.questionIds.map((id) => questionsMap.get(id)).filter(Boolean);

    return res.json({
      success: true,
      matched: true,
      roomId: fourRoom.id,
      role: assignedRole,
      contestants: fourRoom.contestants,
      room: { id: fourRoom.id, contestants: fourRoom.contestants, questions },
      queueCount: 4,
    });
  }

  const earliestJoin = waitingDevices.reduce((min, p) => Math.min(min, p.joinedAt), now);
  const searchSecondsLeft = Math.max(1, Math.ceil((FOUR_PLAYER_SEARCH_TIMEOUT_MS - (now - earliestJoin)) / 1000));

  res.json({
    success: true,
    matched: false,
    status: 'waiting_players',
    queueCount: waitingDevices.length,
    playersNeeded: Math.max(0, 4 - waitingDevices.length),
    searchSecondsLeft,
    players: waitingDevices.map((p) => ({
      id: p.deviceId,
      name: p.name,
      avatar: p.avatar,
      country: p.country,
    })),
  });
});

// 4-Player Queue Status Check (called every 1s by waiting clients)
app.get('/api/matchmaking/4p/status', (req, res) => {
  const deviceId = String(req.query.deviceId || req.query.playerId || '');
  if (!deviceId) return res.status(400).json({ success: false, error: 'Missing deviceId' });

  pruneRecent4pMatches();
  const now = Date.now();
  const item = fourPlayerQueue.get(deviceId);
  if (!item) {
    const recent = recent4pMatches.get(deviceId);
    if (recent) {
      const matchedRoom = rooms.get(recent.roomId);
      if (matchedRoom && matchedRoom.status !== 'finished') {
        const questions = matchedRoom.questionIds.map((id) => questionsMap.get(id)).filter(Boolean);
        return res.json({
          success: true,
          matched: true,
          roomId: matchedRoom.id,
          role: recent.role,
          contestants: matchedRoom.contestants,
          room: { id: matchedRoom.id, contestants: matchedRoom.contestants, questions },
          queueCount: 4,
        });
      }
    }
    return res.json({ success: true, matched: false, status: 'idle', queueCount: 0, playersNeeded: 4 });
  }

  item.lastSeen = now;

  // If already matched into a room by another joining/polling device
  if (item.matchedRoomId && item.assignedRole) {
    const roomId = item.matchedRoomId;
    const role = item.assignedRole;
    const matchedRoom = rooms.get(roomId);
    const contestants = matchedRoom ? matchedRoom.contestants : (item.contestants || []);
    const questions = matchedRoom
      ? matchedRoom.questionIds.map((id) => questionsMap.get(id)).filter(Boolean)
      : [];
    fourPlayerQueue.delete(deviceId);
    return res.json({
      success: true,
      matched: true,
      roomId,
      role,
      contestants,
      room: { id: roomId, contestants, questions },
      queueCount: 4,
    });
  }

  // Only include UNMATCHED active devices currently searching worldwide!
  const activePlayers = Array.from(fourPlayerQueue.values()).filter(
    (p) => !p.matchedRoomId && now - p.lastSeen < 45000
  );
  const earliestJoined = activePlayers.reduce((min, p) => Math.min(min, p.joinedAt), item.joinedAt);
  const elapsed = now - earliestJoined;
  const searchSecondsLeft = Math.max(0, Math.ceil((FOUR_PLAYER_SEARCH_TIMEOUT_MS - elapsed) / 1000));

  // Match immediately when 4 real players gather, OR at 60s fill any remaining empty slots with AI bots!
  if (activePlayers.length >= 4 || (elapsed >= FOUR_PLAYER_SEARCH_TIMEOUT_MS && activePlayers.length >= 1)) {
    const group = activePlayers.slice(0, 4);
    const room = launch4PlayerRoomWithBots(group);
    const role = item.assignedRole || 'player1_host';
    const questions = room.questionIds.map((id) => questionsMap.get(id)).filter(Boolean);
    fourPlayerQueue.delete(deviceId);
    return res.json({
      success: true,
      matched: true,
      roomId: room.id,
      role,
      contestants: room.contestants,
      room: { id: room.id, contestants: room.contestants, questions },
      queueCount: 4,
    });
  }

  res.json({
    success: true,
    matched: false,
    status: 'waiting_players',
    queueCount: activePlayers.length,
    playersNeeded: Math.max(0, 4 - activePlayers.length),
    elapsed,
    searchSecondsLeft,
    players: activePlayers.map((p) => ({
      id: p.deviceId,
      name: p.name,
      avatar: p.avatar,
      country: p.country,
    })),
  });
});

app.post('/api/matchmaking/4p/fill-bots', (req, res) => {
  const rawId = req.body?.deviceId || req.body?.playerId;
  if (!rawId) return res.status(400).json({ success: false, error: 'Missing deviceId' });
  const deviceId = String(rawId);
  const playerId = String(req.body?.playerId || deviceId);

  pruneRecent4pMatches();
  const now = Date.now();
  let item = fourPlayerQueue.get(deviceId);

  // Idempotent lookup: if this device was already matched a moment ago by /status or another player
  const recent = recent4pMatches.get(deviceId) || recent4pMatches.get(playerId);
  if ((!item || !item.matchedRoomId) && recent) {
    const matchedRoom = rooms.get(recent.roomId);
    if (matchedRoom && matchedRoom.status !== 'finished') {
      if (item) fourPlayerQueue.delete(deviceId);
      const questions = matchedRoom.questionIds.map((id) => questionsMap.get(id)).filter(Boolean);
      return res.json({
        success: true,
        matched: true,
        roomId: matchedRoom.id,
        role: recent.role,
        contestants: matchedRoom.contestants,
        room: { id: matchedRoom.id, contestants: matchedRoom.contestants, questions },
      });
    }
  }

  if (item && item.matchedRoomId && item.assignedRole) {
    const matchedRoom = rooms.get(item.matchedRoomId);
    const contestants = matchedRoom ? matchedRoom.contestants : (item.contestants || []);
    const questions = matchedRoom
      ? matchedRoom.questionIds.map((id) => questionsMap.get(id)).filter(Boolean)
      : [];
    const resp = {
      success: true,
      matched: true,
      roomId: item.matchedRoomId,
      role: item.assignedRole,
      contestants,
      room: { id: item.matchedRoomId, contestants, questions },
    };
    fourPlayerQueue.delete(deviceId);
    return res.json(resp);
  }

  const fillExclude = Array.isArray(req.body?.excludeIds) ? req.body.excludeIds : [];
  if (!item) {
    item = {
      deviceId,
      playerId,
      name: String(req.body?.name || 'متسابق'),
      avatar: String(req.body?.avatar || '👑'),
      country: String(req.body?.country || 'SA'),
      category: String(req.body?.category || 'all'),
      lang: String(req.body?.lang || 'ar'),
      joinedAt: now,
      lastSeen: now,
      excludeIds: fillExclude,
    };
    fourPlayerQueue.set(deviceId, item);
  } else if (fillExclude.length > 0) {
    item.excludeIds = fillExclude;
  }

  const activePlayers = Array.from(fourPlayerQueue.values()).filter(
    (p) => !p.matchedRoomId && now - p.lastSeen < 45000
  );
  const group = activePlayers.length > 0 ? activePlayers.slice(0, 4) : [item];
  const room = launch4PlayerRoomWithBots(group);
  const role = item.assignedRole || 'player1_host';
  const questions = room.questionIds.map((id) => questionsMap.get(id)).filter(Boolean);
  fourPlayerQueue.delete(deviceId);

  res.json({
    success: true,
    matched: true,
    roomId: room.id,
    role,
    contestants: room.contestants,
    room: { id: room.id, contestants: room.contestants, questions },
  });
});

app.post('/api/matchmaking/4p/leave', (req, res) => {
  const { deviceId, playerId } = req.body;
  if (deviceId) {
    fourPlayerQueue.delete(deviceId);
    recent4pMatches.delete(deviceId);
  }
  if (playerId) {
    fourPlayerQueue.delete(playerId);
    recent4pMatches.delete(playerId);
  }
  res.json({ success: true });
});

// ==========================================
// 2. ANSWER SUBMISSION & LIVE SCORE SYNC (نظام حساب وعرض نقاط كل لاعب)
// ==========================================
const handlePlayerAnswerSubmission = (req: express.Request, res: express.Response) => {
  const { roomId } = req.params;
  const { playerId, role, optionIndex, responseTime, isCorrect, pointsEarned, roundIndex } = req.body;
  const room = getOrCreateRoom(roomId);

  if (room.forfeitedBy || room.status === 'finished') {
    return res.json({
      success: true,
      status: 'finished',
      forfeitedBy: room.forfeitedBy || null,
      winnerRole: room.winnerRole || null,
      bothAnswered: false,
      allAnswered: false,
      player1_score: room.player1_score,
      player2_score: room.player2_score,
      player3_score: room.player3_score,
      player4_score: room.player4_score,
      contestants: room.contestants,
    });
  }

  const parsedRound = typeof roundIndex === 'number' ? roundIndex : (roundIndex !== undefined ? Number(roundIndex) : undefined);
  const isStaleRound = typeof parsedRound === 'number' && !Number.isNaN(parsedRound) && parsedRound !== room.currentIndex;
  const shouldReveal = processAnswerIntoRoom(room, {
    playerId,
    role,
    optionIndex,
    responseTime,
    isCorrect,
    pointsEarned,
    roundIndex: parsedRound,
  });

  res.json({
    success: true,
    staleRound: isStaleRound,
    status: room.status,
    currentIndex: room.currentIndex,
    forfeitedBy: room.forfeitedBy || null,
    winnerRole: room.winnerRole || null,
    bothAnswered: shouldReveal,
    allAnswered: shouldReveal,
    player1_score: room.player1_score,
    player2_score: room.player2_score,
    player3_score: room.player3_score,
    player4_score: room.player4_score,
    player1_answer: room.player1_answer,
    player2_answer: room.player2_answer,
    player3_answer: room.player3_answer,
    player4_answer: room.player4_answer,
    contestants: room.contestants,
  });
};

app.post('/api/rooms/:roomId/1v1/answer', handlePlayerAnswerSubmission);
app.post('/api/rooms/:roomId/answer', handlePlayerAnswerSubmission);

// Live Scores Endpoint
app.get('/api/rooms/:roomId/scores', (req, res) => {
  const { roomId } = req.params;
  const room = getOrCreateRoom(roomId);
  res.json({
    success: true,
    player1_score: room.player1_score,
    player2_score: room.player2_score,
    player3_score: room.player3_score,
    player4_score: room.player4_score,
    contestants: room.contestants.map((c) => ({
      id: c.id,
      name: c.name,
      avatar: c.avatar,
      role: c.role,
      score: c.score,
      status: c.status,
      answeredRound: c.answeredRound,
      lastIsCorrect: c.lastIsCorrect,
      lastPointsEarned: c.lastPointsEarned,
    })),
  });
});

// Next Round in Duel / 4-Player Arena
const handleNextRoundProgression = (req: express.Request, res: express.Response) => {
  const { roomId } = req.params;
  const room = getOrCreateRoom(roomId);
  const fromRound = req.body?.currentRound !== undefined ? Number(req.body.currentRound) : undefined;

  if (room.forfeitedBy || room.status === 'finished') {
    return res.json({
      success: true,
      currentIndex: room.currentIndex,
      status: 'finished',
      forfeitedBy: room.forfeitedBy || null,
      winnerRole: room.winnerRole || null,
      player1_score: room.player1_score,
      player2_score: room.player2_score,
      player3_score: room.player3_score,
      player4_score: room.player4_score,
    });
  }

  // Prevent duplicate increment if already advanced to next round
  if (fromRound !== undefined && room.currentIndex >= fromRound) {
    return res.json({
      success: true,
      currentIndex: room.currentIndex,
      status: room.status,
      player1_score: room.player1_score,
      player2_score: room.player2_score,
      player3_score: room.player3_score,
      player4_score: room.player4_score,
    });
  }

  // Prevent ONE device from skipping a question while another connected human player is still choosing
  // (unless all contestants answered so room.status === 'revealed', or 42s server round window elapsed)
  const elapsedRoundMs = Date.now() - (room.roundStartedAt || 0);
  const pendingHumans = room.contestants.some(
    (c) => !c.isBot && c.status !== 'eliminated' && !(c.status === 'answered' && c.answeredRound === room.currentIndex)
  );
  if (room.status !== 'revealed' && pendingHumans && elapsedRoundMs < 42000) {
    return res.json({
      success: true,
      deferred: true,
      waitingForPlayers: true,
      currentIndex: room.currentIndex,
      status: room.status,
      player1_score: room.player1_score,
      player2_score: room.player2_score,
      player3_score: room.player3_score,
      player4_score: room.player4_score,
    });
  }

  // Debounce if called within 1500ms of last advance
  if (elapsedRoundMs < 1500 && room.currentIndex > 0) {
    return res.json({
      success: true,
      currentIndex: room.currentIndex,
      status: room.status,
      player1_score: room.player1_score,
      player2_score: room.player2_score,
      player3_score: room.player3_score,
      player4_score: room.player4_score,
    });
  }

  clearRoomBotTimers(room);
  room.currentIndex += 1;
  room.player1_answer = null;
  room.player2_answer = null;
  room.player3_answer = null;
  room.player4_answer = null;

  if (room.currentIndex >= room.totalQuestions) {
    room.status = 'finished';
  } else {
    room.status = 'reading'; // TTS reading phase first
    room.roundStartedAt = Date.now();
    room.contestants.forEach((c) => {
      c.status = 'reading';
      c.answeredRound = undefined;
      c.selectedOption = undefined;
      c.responseTime = undefined;
      c.lastIsCorrect = undefined;
      c.lastPointsEarned = undefined;
    });
    if (room.mode === '4player') {
      scheduleBotAnswersForRoom(room);
      // Natural bot interaction with rotating names
      const bots = room.contestants.filter((c) => c.isBot);
      if (bots.length > 0 && Math.random() < 0.45) {
        const chosenBot = bots[Math.floor(Math.random() * bots.length)];
        const botMsg: RoomChatMessage = {
          id: `m_bot_rnd_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
          senderId: chosenBot.id,
          senderName: chosenBot.name,
          senderAvatar: chosenBot.avatar,
          text: BOT_CHAT_REPLIES[Math.floor(Math.random() * BOT_CHAT_REPLIES.length)],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        room.messages.push(botMsg);
        if (room.messages.length > 100) room.messages.shift();
        broadcastRoomUpdate(room, 'chat:message', { message: botMsg });
      }
    }
  }

  broadcastRoomUpdate(room, 'duel:next_round', {
    currentIndex: room.currentIndex,
    status: room.status,
    roundStartedAt: room.roundStartedAt,
    player1_score: room.player1_score,
    player2_score: room.player2_score,
    player3_score: room.player3_score,
    player4_score: room.player4_score,
    contestants: room.contestants,
  });

  res.json({
    success: true,
    currentIndex: room.currentIndex,
    status: room.status,
    player1_score: room.player1_score,
    player2_score: room.player2_score,
    player3_score: room.player3_score,
    player4_score: room.player4_score,
  });
};

app.post('/api/rooms/:roomId/1v1/next', handleNextRoundProgression);
app.post('/api/rooms/:roomId/next', handleNextRoundProgression);

// ==========================================
// 3. STRICT MATCH LOCK ON 1v1 FORFEIT / WITHDRAWAL
// ==========================================
function trigger1v1Forfeit(
  room: GameRoom,
  forfeiter?: RoomContestant | null,
  role?: string,
  playerId?: string
) {
  if (room.forfeitedBy || room.status === 'finished') return;

  const resolvedForfeiter =
    forfeiter ||
    room.contestants.find((c) => (role ? c.role === role : playerId ? c.id === playerId : false));
  const remaining = room.contestants.find((c) => c !== resolvedForfeiter);

  room.status = 'finished';
  room.forfeitedBy = role || resolvedForfeiter?.role || resolvedForfeiter?.id || playerId || 'unknown';
  room.winnerRole =
    remaining?.role || (room.forfeitedBy === 'player1_host' ? 'player2_guest' : 'player1_host');

  // Clear any pending disconnect timers for this room
  for (const c of room.contestants) {
    const k = `${room.id}::${c.id}`;
    const t = sseDisconnectTimers.get(k);
    if (t) {
      clearTimeout(t);
      sseDisconnectTimers.delete(k);
    }
  }

  const forfeiterName =
    resolvedForfeiter?.name || (room.lang === 'ar' ? 'أحد المتسابقين' : 'A contestant');
  const noticeMsg: RoomChatMessage = {
    id: `m_forfeit_${Date.now()}`,
    senderId: 'system',
    senderName: room.lang === 'ar' ? 'المذيع والحكم' : 'Referee',
    senderAvatar: '🔒',
    text:
      room.lang === 'ar'
        ? `🔒 انسحب (${forfeiterName}) من التحدي! تم إغلاق الأسئلة وإنهاء المسابقة عند كلا اللاعبين.`
        : `🔒 ${forfeiterName} withdrew from the duel! Questions are locked and the match is closed for both players.`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  room.messages.push(noticeMsg);

  broadcastRoomUpdate(room, 'duel:forfeited', {
    status: 'finished',
    forfeitedBy: room.forfeitedBy,
    forfeitedRole: resolvedForfeiter?.role || role,
    forfeiterName,
    winnerRole: room.winnerRole,
    player1_score: room.player1_score,
    player2_score: room.player2_score,
    contestants: room.contestants,
    message: noticeMsg,
  });
}

app.post('/api/rooms/:roomId/1v1/forfeit', (req, res) => {
  const { roomId } = req.params;
  const { role, playerId } = req.body || {};
  const room = getOrCreateRoom(roomId);

  const forfeiter = room.contestants.find((c) => (role ? c.role === role : c.id === playerId));
  trigger1v1Forfeit(room, forfeiter, role, playerId);

  res.json({
    success: true,
    status: room.status,
    forfeitedBy: room.forfeitedBy,
    winnerRole: room.winnerRole,
    contestants: room.contestants,
  });
});

// ==========================================
// 3B. MID-GAME 4-PLAYER WITHDRAWAL -> REPLACE HUMAN WITH DYNAMICALLY NAMED BOT
// ==========================================
app.post('/api/rooms/:roomId/4p/forfeit', (req, res) => {
  const { roomId } = req.params;
  const { role, playerId } = req.body;
  const room = rooms.get(roomId);
  if (!room) {
    return res.json({ success: true, status: 'not_found' });
  }

  const departing = room.contestants.find(
    (c) => !c.isBot && (role ? c.role === role : c.id === playerId)
  );
  if (departing) {
    replaceHumanWithFreshBot(room, departing);
  }

  const humansLeft = room.contestants.filter((c) => !c.isBot).length;
  if (humansLeft === 0) {
    clearRoomBotTimers(room);
    room.status = 'finished';
  }

  res.json({
    success: true,
    status: room.status,
    contestants: room.contestants,
  });
});

// Heartbeat to keep connection alive, detect sudden disconnects, and check forfeit/bot replacements
app.post('/api/rooms/:roomId/1v1/heartbeat', (req, res) => {
  const { roomId } = req.params;
  const { role, playerId } = req.body || {};
  const room = rooms.get(roomId);
  if (!room) {
    return res.json({ success: true, status: 'waiting', contestants: [] });
  }

  const now = Date.now();
  const player = room.contestants.find((c) => (playerId ? c.id === playerId : role ? c.role === role : false))
    || room.contestants.find((c) => (role ? c.role === role : false));
  if (player) {
    player.lastHeartbeat = now;
    const tKey = `${roomId}::${player.id}`;
    const pending = sseDisconnectTimers.get(tKey);
    if (pending) {
      clearTimeout(pending);
      sseDisconnectTimers.delete(tKey);
    }
  }

  // Detect abrupt disconnection of opponent in active 1v1 match (> 15s without heartbeat so mobile WebViews never false-forfeit)
  if (
    room.mode === '1v1' &&
    (room.status === 'reading' || room.status === 'playing' || room.status === 'revealed') &&
    !room.forfeitedBy &&
    room.contestants.length >= 2 &&
    now - (room.gameStartedAt || room.roundStartedAt || now) > 15000
  ) {
    const staleOpp = room.contestants.find(
      (c) =>
        !c.isBot &&
        c !== player &&
        c.lastHeartbeat &&
        now - c.lastHeartbeat > 15000
    );
    if (staleOpp) {
      trigger1v1Forfeit(room, staleOpp, staleOpp.role, staleOpp.id);
    }
  }

  // Detect abrupt disconnection in 4P match -> swap missing human for fresh named bot
  if (
    room.mode === '4player' &&
    (room.status === 'reading' || room.status === 'playing') &&
    now - (room.gameStartedAt || room.roundStartedAt || now) > 14000
  ) {
    const staleHumans = room.contestants.filter(
      (c) =>
        !c.isBot &&
        c !== player &&
        c.lastHeartbeat &&
        now - c.lastHeartbeat > 14000
    );
    staleHumans.forEach((h) => replaceHumanWithFreshBot(room, h));
  }

  res.json({
    success: true,
    status: room.status,
    forfeitedBy: room.forfeitedBy || null,
    winnerRole: room.winnerRole || null,
    contestants: room.contestants,
  });
});

// ==========================================
// 4. CHAT DELETE FOR EVERYONE (ميزة حذف الرسائل من الطرفين)
// ==========================================
app.post('/api/rooms/:roomId/chat/delete', (req, res) => {
  const { roomId } = req.params;
  const { messageId, requesterId } = req.body;
  if (!messageId) return res.status(400).json({ success: false, error: 'Missing messageId' });

  const room = getOrCreateRoom(roomId);
  const msgIndex = room.messages.findIndex((m) => m.id === messageId);
  if (msgIndex === -1) {
    return res.json({ success: true, messageId });
  }

  const targetMsg = room.messages[msgIndex];

  // Verify permission: only the sender (or referee/host) can delete their message
  if (requesterId && targetMsg.senderId !== requesterId && targetMsg.senderId !== 'system') {
    return res.status(403).json({ success: false, error: 'Cannot delete messages sent by others' });
  }

  // Remove the message from server room messages list
  room.messages.splice(msgIndex, 1);

  // Broadcast deletion to all devices via SSE in real time
  broadcastRoomUpdate(room, 'chat:deleted', { messageId });

  res.json({ success: true, messageId, remainingCount: room.messages.length });
});

// 2. Get Room Status & State
app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = getOrCreateRoom(roomId);
  res.json({ success: true, room: { ...room, listeners: undefined, botTimers: undefined } });
});

app.get('/api/rooms/:roomId/state', (req, res) => {
  const { roomId } = req.params;
  const room = getOrCreateRoom(roomId);

  // Auto-promote 1v1 match if friend has connected but status is still waiting
  if (room.mode === '1v1' && room.contestants.length >= 2 && room.status === 'waiting') {
    const now = Date.now();
    room.status = 'reading';
    room.currentIndex = 0;
    room.roundStartedAt = now;
    room.gameStartedAt = now;
    room.contestants.forEach((c) => {
      c.lastHeartbeat = now;
    });
    broadcastRoomUpdate(room, 'game:started', {
      currentIndex: room.currentIndex,
      roundStartedAt: room.roundStartedAt,
      status: room.status,
      contestants: room.contestants,
      questionIds: room.questionIds,
    });
  }

  res.json({
    success: true,
    room: {
      id: room.id,
      mode: room.mode,
      category: room.category,
      status: room.status,
      forfeitedBy: room.forfeitedBy || null,
      winnerRole: room.winnerRole || null,
      currentIndex: room.currentIndex,
      roundStartedAt: room.roundStartedAt,
      questionIds: room.questionIds,
      contestants: room.contestants,
      player1_score: room.player1_score,
      player2_score: room.player2_score,
      player3_score: room.player3_score,
      player4_score: room.player4_score,
      player1_answer: room.player1_answer ? { hasAnswered: true } : null,
      player2_answer: room.player2_answer ? { hasAnswered: true } : null,
      player3_answer: room.player3_answer ? { hasAnswered: true } : null,
      player4_answer: room.player4_answer ? { hasAnswered: true } : null,
      messages: room.messages,
      onlineCount: Math.max(1, room.listeners.length, room.contestants.length),
    },
  });
});

// Authoritative synchronized questions endpoint for both devices in the room
app.get('/api/rooms/:roomId/questions', (req, res) => {
  const { roomId } = req.params;
  const playerId = typeof req.query.playerId === 'string' ? req.query.playerId : '';
  const queryExclude = typeof req.query.excludeIds === 'string'
    ? req.query.excludeIds.split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  const room = getOrCreateRoom(roomId, 'ar', '1v1', queryExclude, playerId ? [playerId] : undefined);
  if (!room.questionIds || room.questionIds.length === 0) {
    const mergedExclude = getCombinedExcludeIds(playerId ? [playerId] : [], queryExclude);
    room.questionIds = generateRoomQuestionIds(roomId, room.totalQuestions || 10, room.category || 'all', mergedExclude);
  }
  if (playerId) {
    recordSeenQuestionsForPlayers([playerId], room.questionIds);
  }
  const questions = room.questionIds.map((id) => questionsMap.get(id)).filter(Boolean);
  res.json({
    success: true,
    roomId,
    category: room.category || 'all',
    questionIds: room.questionIds,
    questions,
  });
});

app.get('/api/rooms/:roomId/messages', (req, res) => {
  const { roomId } = req.params;
  const room = getOrCreateRoom(roomId);
  res.json({
    success: true,
    messages: room.messages,
    onlineCount: Math.max(1, room.listeners.length, room.contestants.length),
  });
});

app.get('/api/rooms/:roomId/chat', (req, res) => {
  const { roomId } = req.params;
  const room = getOrCreateRoom(roomId);
  res.json({
    success: true,
    messages: room.messages,
    onlineCount: Math.max(1, room.listeners.length, room.contestants.length),
  });
});

// 3. Join Room (supports strict 4-digit PIN code validation via requireExisting)
app.post('/api/rooms/:roomId/join', (req, res) => {
  const { roomId } = req.params;
  const { id: playerId, name = 'متسابق جديد', avatar = '⚡', country = 'SA', requireExisting = false } = req.body;

  if (requireExisting && !rooms.has(roomId)) {
    return res.status(404).json({
      success: false,
      error: 'كود الغرفة غير صحيح أو لم يتم إنشاؤه بعد',
    });
  }

  const room = getOrCreateRoom(roomId);

  if (requireExisting && !room.createdExplicitly && room.contestants.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'كود الغرفة غير صحيح أو لم يتم إنشاؤه بعد',
    });
  }

  if (requireExisting && (room.status === 'finished' || room.forfeitedBy)) {
    return res.status(410).json({
      success: false,
      error: 'انتهت هذه المبارزة بالفعل أو تم إغلاقها',
    });
  }

  const isWorld = roomId === 'WORLD-CHALLENGE' || roomId === 'WORLD-ARENA' || roomId === 'M-GLOBAL';

  const isGuestJoin = req.body.isGuest === true || req.body.role === 'player2_guest';
  let existingPlayer = playerId ? room.contestants.find((c) => c.id === playerId) : null;

  if (room.mode === '1v1' && room.contestants.length === 1 && (isGuestJoin || (existingPlayer && existingPlayer.isHost))) {
    existingPlayer = null;
  }

  if (existingPlayer) {
    if (existingPlayer.status !== 'answered') {
      existingPlayer.status = room.status === 'reading' ? 'reading' : 'idle';
    }
    if (avatar) existingPlayer.avatar = avatar;
    if (country) existingPlayer.country = country;

    // If 2 contestants exist and status is waiting, auto-start!
    if (room.mode === '1v1' && room.contestants.length >= 2 && room.status === 'waiting') {
      room.status = 'reading';
      room.currentIndex = 0;
      room.roundStartedAt = Date.now();
      room.gameStartedAt = Date.now();
      broadcastRoomUpdate(room, 'game:started', {
        currentIndex: room.currentIndex,
        roundStartedAt: room.roundStartedAt,
        status: room.status,
        contestants: room.contestants,
        questionIds: room.questionIds,
      });
    }

    return res.json({ success: true, room: { ...room, listeners: undefined }, playerId: existingPlayer.id, role: existingPlayer.role });
  }

  // Limit custom 1v1 rooms cleanly to 2 contestants and custom 4p rooms to 4
  if (!isWorld && room.mode === '1v1' && room.contestants.length >= 2) {
    const existingGuest = room.contestants.find((c) => c.role === 'player2_guest') || room.contestants[1];
    if (existingGuest) {
      existingGuest.lastHeartbeat = Date.now();
      return res.json({
        success: true,
        room: { ...room, listeners: undefined },
        playerId: existingGuest.id,
        role: existingGuest.role,
      });
    }
  }
  if (!isWorld && room.contestants.length >= 4) {
    return res.json({ success: true, room: { ...room, listeners: undefined }, playerId: room.contestants[0].id });
  }

  // Generate unique ID for new player
  const assignedId = (playerId && !room.contestants.some((c) => c.id === playerId))
    ? playerId
    : `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const role: 'player1_host' | 'player2_guest' = room.contestants.length === 0 ? 'player1_host' : 'player2_guest';

  // Ensure unique display name if identical to host
  let cleanName = (typeof name === 'string' && name.trim()) ? name.trim() : (room.lang === 'ar' ? 'المتسابق' : 'Contestant');
  if (room.contestants.some((c) => c.name === cleanName)) {
    cleanName = room.lang === 'ar' ? `${cleanName} (الضيف)` : `${cleanName} (Guest)`;
  }

  const newPlayer: RoomContestant = {
    id: assignedId,
    name: cleanName,
    avatar,
    country,
    role,
    isHost: room.contestants.length === 0,
    isBot: false,
    score: 0,
    status: 'idle',
    lastHeartbeat: Date.now(),
  };

  room.contestants.push(newPlayer);
  recordSeenQuestionsForPlayers([newPlayer.id], room.questionIds || []);
  const joinMsg: RoomChatMessage = {
    id: `m_join_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    senderId: 'system',
    senderName: room.lang === 'ar' ? 'الحكم' : 'Referee',
    senderAvatar: '👋',
    text: `${avatar} ${cleanName} ${room.lang === 'ar' ? 'انضم إلى المنافسة والدردشة المباشرة!' : 'joined the live match & chat!'}`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  room.messages.push(joinMsg);
  if (room.messages.length > 80) room.messages.shift();

  broadcastRoomUpdate(room, 'player:joined', { contestants: room.contestants, messages: room.messages });
  broadcastRoomUpdate(room, 'chat:message', { message: joinMsg });

  // 1v1 FRIEND DUEL REQUIREMENT:
  // Automatically start the match on both phones the exact moment the friend opens the link and joins!
  if (room.mode === '1v1' && room.contestants.length >= 2 && room.status === 'waiting') {
    const now = Date.now();
    room.status = 'reading';
    room.currentIndex = 0;
    room.roundStartedAt = now;
    room.gameStartedAt = now;
    room.player1_answer = null;
    room.player2_answer = null;
    room.contestants.forEach((c) => {
      c.status = 'reading';
      c.answeredRound = undefined;
      c.selectedOption = undefined;
      c.responseTime = undefined;
      c.lastIsCorrect = undefined;
      c.lastPointsEarned = undefined;
      c.lastHeartbeat = now;
    });

    const autoStartMsg: RoomChatMessage = {
      id: `m_autostart_${Date.now()}`,
      senderId: 'system',
      senderName: room.lang === 'ar' ? 'المذيع والحكم الدولي' : 'Match Referee',
      senderAvatar: '🎙️',
      text: room.lang === 'ar'
        ? `🔥 فتح زميلك الرابط وانضم للمبارزة! انطلق التحدي الثنائي الآن في نفس اللحظة بالأسئلة المتطابقة.`
        : `🔥 Your friend joined via the link! 1v1 duel started simultaneously on both phones.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    room.messages.push(autoStartMsg);

    broadcastRoomUpdate(room, 'game:started', {
      currentIndex: room.currentIndex,
      roundStartedAt: room.roundStartedAt,
      status: room.status,
      contestants: room.contestants,
      questionIds: room.questionIds,
    });
  }

  res.json({ success: true, room: { ...room, listeners: undefined }, playerId: newPlayer.id, role });
});

// 4. Start Game (Strict 2-player check for 1v1 so nobody can enter alone)
app.post('/api/rooms/:roomId/start', (req, res) => {
  const { roomId } = req.params;
  const room = getOrCreateRoom(roomId);

  if (room.mode === '1v1' && room.contestants.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Cannot start 1v1 duel until your friend joins',
    });
  }

  const now = Date.now();
  room.status = 'reading';
  room.currentIndex = 0;
  room.roundStartedAt = now;
  room.gameStartedAt = now;
  room.player1_answer = null;
  room.player2_answer = null;
  room.contestants.forEach((c) => {
    c.status = 'reading';
    c.answeredRound = undefined;
    c.selectedOption = undefined;
    c.responseTime = undefined;
    c.lastIsCorrect = undefined;
    c.lastPointsEarned = undefined;
    c.lastHeartbeat = now;
  });

  broadcastRoomUpdate(room, 'game:started', {
    currentIndex: room.currentIndex,
    roundStartedAt: room.roundStartedAt,
    status: room.status,
    contestants: room.contestants,
  });

  res.json({ success: true, room: { ...room, listeners: undefined } });
});

// 7. Chat Message in Room - Ultra-Fast Real-Time Broadcast via SSE & Polling
const handleIncomingChatMessage = (req: express.Request, res: express.Response) => {
  const roomId = req.params.roomId || (req.body && req.body.roomId) || 'M-GLOBAL';
  const rawText = req.body.text || req.body.message || req.body.msg || req.body.content || '';
  const text = typeof rawText === 'string' ? rawText.trim() : String(rawText).trim();

  if (!text) {
    return res.status(400).json({ success: false, error: 'Empty message' });
  }

  const room = getOrCreateRoom(roomId);
  const senderName = (req.body.senderName || req.body.name || (req.body.senderId === 'system' ? 'المذيع' : 'متسابق')).toString().trim();
  const senderAvatar = (req.body.senderAvatar || req.body.avatar || '👤').toString();
  const senderId = (req.body.senderId || req.body.playerId || req.body.id || `p_${Date.now()}`).toString();
  const msgId = req.body.id || `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const time = req.body.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const msg: RoomChatMessage = {
    id: msgId,
    senderId,
    senderName,
    senderAvatar,
    text,
    time,
  };

  // Add message if not duplicate
  if (!room.messages.some((m) => m.id === msg.id)) {
    room.messages.push(msg);
    if (room.messages.length > 100) room.messages.shift();
  }

  // Push immediately to all SSE listeners in real time
  broadcastRoomUpdate(room, 'chat:message', { message: msg });

  // BOT INTERACTIVE CHAT ENGINE:
  // If the room contains AI bot contestants, have a bot reply naturally after 1.4s - 2.8s
  if (senderId !== 'system' && !senderId.startsWith('bot_') && room.contestants.some((c) => c.isBot)) {
    const botsInRoom = room.contestants.filter((c) => c.isBot);
    const chosenBot = botsInRoom[Math.floor(Math.random() * botsInRoom.length)];
    const replyDelay = 1400 + Math.floor(Math.random() * 1400);

    setTimeout(() => {
      if (!rooms.has(room.id)) return;
      const botReplyText = BOT_CHAT_REPLIES[Math.floor(Math.random() * BOT_CHAT_REPLIES.length)];
      const botMsg: RoomChatMessage = {
        id: `m_bot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        senderId: chosenBot.id,
        senderName: chosenBot.name,
        senderAvatar: chosenBot.avatar,
        text: botReplyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      room.messages.push(botMsg);
      if (room.messages.length > 100) room.messages.shift();
      broadcastRoomUpdate(room, 'chat:message', { message: botMsg });
    }, replyDelay);
  }

  res.json({ success: true, message: msg, allMessages: room.messages, count: room.messages.length });
};

app.post('/api/rooms/:roomId/chat', handleIncomingChatMessage);
app.post('/api/chat/send', handleIncomingChatMessage);
app.get('/api/chat/messages', (req, res) => {
  const room = getOrCreateRoom('M-GLOBAL');
  res.json({ success: true, messages: room.messages, onlineCount: Math.max(1, room.listeners.length, room.contestants.length) });
});

// 8. Server-Sent Events (SSE) stream for Real-Time Multi-Device Sync
app.get('/api/rooms/:roomId/events', (req, res) => {
  const { roomId } = req.params;
  const playerId = String(req.query.playerId || '').trim();
  const role = String(req.query.role || '').trim();
  const room = getOrCreateRoom(roomId);

  let isClosed = false;
  const sseKey = playerId ? `${roomId}::${playerId}` : '';

  if (sseKey) {
    activeSseByRoomPlayer.set(sseKey, (activeSseByRoomPlayer.get(sseKey) || 0) + 1);
    const pendingTimer = sseDisconnectTimers.get(sseKey);
    if (pendingTimer) {
      clearTimeout(pendingTimer);
      sseDisconnectTimers.delete(sseKey);
    }
    const c = room.contestants.find((x) => x.id === playerId || (role && x.role === role));
    if (c) c.lastHeartbeat = Date.now();
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send initial room snapshot immediately
  try {
    res.write(`data: ${JSON.stringify({ event: 'init', data: { ...room, listeners: undefined } })}\n\n`);
  } catch {}

  const listener = (data: string) => {
    if (isClosed) return;
    try {
      res.write(`data: ${data}\n\n`);
    } catch {
      cleanup();
    }
  };

  room.listeners.push(listener);

  // Keep-alive heartbeat every 15s to keep connection open across all mobile WebViews
  const keepAlive = setInterval(() => {
    if (isClosed) {
      clearInterval(keepAlive);
      return;
    }
    try {
      res.write(': keep-alive\n\n');
    } catch {
      cleanup();
    }
  }, 15000);

  const cleanup = () => {
    if (isClosed) return;
    isClosed = true;
    clearInterval(keepAlive);
    room.listeners = room.listeners.filter((l) => l !== listener);

    if (sseKey) {
      const remainingCount = Math.max(0, (activeSseByRoomPlayer.get(sseKey) || 1) - 1);
      if (remainingCount === 0) {
        activeSseByRoomPlayer.delete(sseKey);
        const disconnectedAt = Date.now();
        // Mobile-friendly disconnect forfeit check: wait 4.5s for reconnect/heartbeat before closing 1v1 match
        if (
          room.mode === '1v1' &&
          room.contestants.length >= 2 &&
          (room.status === 'reading' || room.status === 'playing' || room.status === 'revealed') &&
          !room.forfeitedBy
        ) {
          const existingTimer = sseDisconnectTimers.get(sseKey);
          if (existingTimer) clearTimeout(existingTimer);
          const timer = setTimeout(() => {
            sseDisconnectTimers.delete(sseKey);
            const currentRoom = rooms.get(roomId);
            if (!currentRoom || currentRoom.forfeitedBy || currentRoom.status === 'finished') return;
            if ((activeSseByRoomPlayer.get(sseKey) || 0) > 0) return;
            const leavingContestant = currentRoom.contestants.find(
              (x) => x.id === playerId || (role && x.role === role)
            );
            if (!leavingContestant) return;
            if ((leavingContestant.lastHeartbeat || 0) > disconnectedAt + 150) return;
            trigger1v1Forfeit(currentRoom, leavingContestant, role || leavingContestant.role, playerId);
          }, 4500);
          sseDisconnectTimers.set(sseKey, timer);
        }
      } else {
        activeSseByRoomPlayer.set(sseKey, remainingCount);
      }
    }

    try {
      res.end();
    } catch {}
  };

  req.on('close', cleanup);
  req.on('end', cleanup);
  res.on('close', cleanup);
  res.on('error', cleanup);
});

// ==========================================
// 9. REAL-TIME WEBRTC VIDEO / VOICE CALL SIGNALING & PRESENCE
// ==========================================
app.post('/api/rooms/:roomId/rtc/join', (req, res) => {
  const { roomId } = req.params;
  const { peerId, name = 'متسابق', avatar = '👤', callMode = 'audio', micOn = true, camOn = false, inCall = true } = req.body;
  if (!peerId) return res.status(400).json({ success: false, error: 'Missing peerId' });

  const room = getOrCreateRoom(roomId);
  if (!room.callParticipants) room.callParticipants = new Map();

  const participant: CallParticipant = {
    peerId: String(peerId),
    name: String(name),
    avatar: String(avatar),
    callMode: callMode === 'video' ? 'video' : 'audio',
    micOn: Boolean(micOn),
    camOn: Boolean(camOn),
    inCall: Boolean(inCall),
    lastSeen: Date.now(),
  };

  room.callParticipants.set(participant.peerId, participant);
  const participants = getActiveCallParticipants(room);

  broadcastRoomUpdate(room, 'rtc:peer_joined', {
    participant,
    participants,
  });

  res.json({
    success: true,
    roomId,
    participants,
    seq: room.rtcSeq || 0,
  });
});

app.post('/api/rooms/:roomId/rtc/leave', (req, res) => {
  const { roomId } = req.params;
  const { peerId } = req.body;
  if (!peerId) return res.status(400).json({ success: false, error: 'Missing peerId' });

  const room = getOrCreateRoom(roomId);
  if (!room.callParticipants) room.callParticipants = new Map();
  room.callParticipants.delete(String(peerId));

  const participants = getActiveCallParticipants(room);
  broadcastRoomUpdate(room, 'rtc:peer_left', {
    peerId: String(peerId),
    participants,
  });

  res.json({ success: true, participants });
});

app.post('/api/rooms/:roomId/rtc/media', (req, res) => {
  const { roomId } = req.params;
  const { peerId, micOn, camOn, callMode, inCall, name, avatar } = req.body;
  if (!peerId) return res.status(400).json({ success: false, error: 'Missing peerId' });

  const room = getOrCreateRoom(roomId);
  if (!room.callParticipants) room.callParticipants = new Map();
  const existing = room.callParticipants.get(String(peerId));
  const updated: CallParticipant = {
    peerId: String(peerId),
    name: name ? String(name) : (existing?.name || 'متسابق'),
    avatar: avatar ? String(avatar) : (existing?.avatar || '👤'),
    callMode: callMode === 'video' || callMode === 'audio' ? callMode : (existing?.callMode || 'audio'),
    micOn: typeof micOn === 'boolean' ? micOn : (existing?.micOn ?? true),
    camOn: typeof camOn === 'boolean' ? camOn : (existing?.camOn ?? false),
    inCall: typeof inCall === 'boolean' ? inCall : (existing?.inCall ?? true),
    lastSeen: Date.now(),
  };
  room.callParticipants.set(updated.peerId, updated);
  const participants = getActiveCallParticipants(room);

  broadcastRoomUpdate(room, 'rtc:media_state', {
    participant: updated,
    participants,
  });

  res.json({ success: true, participant: updated, participants });
});

app.post('/api/rooms/:roomId/rtc/signal', (req, res) => {
  const { roomId } = req.params;
  const { fromId, fromName = 'متسابق', fromAvatar = '👤', toId, type, callMode, payload } = req.body;
  if (!fromId || !type) {
    return res.status(400).json({ success: false, error: 'Missing fromId or type' });
  }

  const room = getOrCreateRoom(roomId);
  if (!room.rtcSignals) room.rtcSignals = [];
  room.rtcSeq = (room.rtcSeq || 0) + 1;

  const sig: RtcSignal = {
    id: `sig_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    seq: room.rtcSeq,
    fromId: String(fromId),
    fromName: String(fromName),
    fromAvatar: String(fromAvatar),
    toId: toId ? String(toId) : undefined,
    type,
    callMode: callMode === 'video' ? 'video' : callMode === 'audio' ? 'audio' : undefined,
    payload,
    ts: Date.now(),
  };

  room.rtcSignals.push(sig);
  const cutoff = Date.now() - 35000;
  room.rtcSignals = room.rtcSignals.filter((s) => s.ts >= cutoff).slice(-250);

  broadcastRoomUpdate(room, 'rtc:signal', sig);
  res.json({ success: true, seq: sig.seq });
});

app.get('/api/rooms/:roomId/rtc/state', (req, res) => {
  const { roomId } = req.params;
  const peerId = String(req.query.peerId || '');
  const since = Number(req.query.since || 0);
  const keepAlive = req.query.ping === '1';

  const room = getOrCreateRoom(roomId);
  if (keepAlive && peerId && room.callParticipants?.has(peerId)) {
    const p = room.callParticipants.get(peerId)!;
    p.lastSeen = Date.now();
  }

  const participants = getActiveCallParticipants(room);
  const cutoff = Date.now() - 35000;
  const allSignals = (room.rtcSignals || []).filter((s) => s.ts >= cutoff);
  const signals = allSignals.filter(
    (s) => s.seq > since && s.fromId !== peerId && (!s.toId || s.toId === peerId)
  );

  res.json({
    success: true,
    roomId,
    participants,
    signals,
    seq: room.rtcSeq || 0,
  });
});

// ==========================================
// 10. PLAYER SAFETY REPORTS (إبلاغ عن لاعب داخل الغرفة)
// ==========================================
interface PlayerReportEntry {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedId: string;
  reportedName: string;
  roomId: string;
  reason: string;
  reasonLabel: string;
  details: string;
  createdAt: number;
}

const playerReportsStore: PlayerReportEntry[] = [];

app.post('/api/reports', (req, res) => {
  const {
    reporterId = 'anonymous',
    reporterName = 'متسابق',
    reportedId = '',
    reportedName = 'لاعب',
    roomId = '',
    reason = 'other',
    reasonLabel = '',
    details = '',
  } = req.body || {};

  if (!reportedId && !reportedName) {
    return res.status(400).json({ success: false, error: 'Missing reported player info' });
  }

  const entry: PlayerReportEntry = {
    id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    reporterId: String(reporterId).slice(0, 120),
    reporterName: String(reporterName).slice(0, 80),
    reportedId: String(reportedId || reportedName).slice(0, 120),
    reportedName: String(reportedName).slice(0, 80),
    roomId: String(roomId).slice(0, 80),
    reason: String(reason).slice(0, 60),
    reasonLabel: String(reasonLabel).slice(0, 120),
    details: String(details || '').slice(0, 400),
    createdAt: Date.now(),
  };

  playerReportsStore.unshift(entry);
  if (playerReportsStore.length > 500) {
    playerReportsStore.length = 500;
  }

  res.json({
    success: true,
    reportId: entry.id,
    savedAt: entry.createdAt,
  });
});

// WebSocket Server for real-time signaling & instant chat delivery on /ws
// Use noServer: true so non-/ws upgrades (e.g. Vite dev client WS) are never aborted with 400
const wss = new WebSocketServer({ noServer: true });
server.on('upgrade', (request, socket, head) => {
  try {
    const pathname = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`).pathname;
    if (pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  } catch {
    socket.destroy();
  }
});
wss.on('error', (err) => {
  console.error('[WS ERROR]:', err);
});
wss.on('connection', (ws, req) => {
  const url = new URL(req.url || '/ws', `http://${req.headers.host || 'localhost'}`);
  const roomId = (url.searchParams.get('roomId') || 'M-GLOBAL').trim();
  const peerId = (url.searchParams.get('peerId') || `ws_${Date.now()}`).trim();

  const clientEntry: WsClient = { ws, roomId, peerId };
  if (!wsClientsByRoom.has(roomId)) {
    wsClientsByRoom.set(roomId, new Set());
  }
  wsClientsByRoom.get(roomId)!.add(clientEntry);

  const room = getOrCreateRoom(roomId);
  try {
    ws.send(
      JSON.stringify({
        event: 'rtc:welcome',
        data: {
          roomId,
          participants: getActiveCallParticipants(room),
          seq: room.rtcSeq || 0,
        },
      })
    );
  } catch {}

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (!msg || !msg.event) return;
      const targetRoom = getOrCreateRoom(msg.roomId || roomId);

      if (msg.event === 'rtc:signal' && msg.data) {
        if (!targetRoom.rtcSignals) targetRoom.rtcSignals = [];
        targetRoom.rtcSeq = (targetRoom.rtcSeq || 0) + 1;
        const sig: RtcSignal = {
          id: `sig_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          seq: targetRoom.rtcSeq,
          fromId: String(msg.data.fromId || peerId),
          fromName: String(msg.data.fromName || 'متسابق'),
          fromAvatar: String(msg.data.fromAvatar || '👤'),
          toId: msg.data.toId ? String(msg.data.toId) : undefined,
          type: msg.data.type,
          callMode: msg.data.callMode,
          payload: msg.data.payload,
          ts: Date.now(),
        };
        targetRoom.rtcSignals.push(sig);
        targetRoom.rtcSignals = targetRoom.rtcSignals.slice(-250);
        broadcastRoomUpdate(targetRoom, 'rtc:signal', sig);
      } else if (msg.event === 'rtc:ping') {
        if (targetRoom.callParticipants?.has(peerId)) {
          targetRoom.callParticipants.get(peerId)!.lastSeen = Date.now();
        }
      }
    } catch {}
  });

  ws.on('close', () => {
    const set = wsClientsByRoom.get(roomId);
    if (set) {
      set.delete(clientEntry);
      if (set.size === 0) wsClientsByRoom.delete(roomId);
    }
    const targetRoom = rooms.get(roomId);
    if (targetRoom && targetRoom.callParticipants?.has(peerId)) {
      targetRoom.callParticipants.delete(peerId);
      broadcastRoomUpdate(targetRoom, 'rtc:peer_left', {
        peerId,
        participants: getActiveCallParticipants(targetRoom),
      });
    }
  });
});

// Dev / Prod Vite setup
async function start() {
  app.get('/sw.js', (_req, res, next) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Service-Worker-Allowed', '/');
    const distSw = path.join(ROOT_DIR, 'dist', 'sw.js');
    const pubSw = path.join(ROOT_DIR, 'public', 'sw.js');
    if (process.env.NODE_ENV === 'production' && fs.existsSync(distSw)) {
      return res.sendFile(distSw);
    }
    if (fs.existsSync(pubSw)) {
      return res.sendFile(pubSw);
    }
    return next();
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: { server },
        allowedHosts: true,
        ws: { server },
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(ROOT_DIR, 'dist'), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('sw.js')) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Service-Worker-Allowed', '/');
        } else if (filePath.endsWith('manifest.webmanifest')) {
          res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
        } else if (filePath.endsWith('index.html') || filePath.endsWith('appcreator24.html')) {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        }
      }
    }));
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(path.join(ROOT_DIR, 'dist', 'index.html'));
    });
  }

  server.on('error', (err) => {
    console.error('[SERVER LISTEN ERROR]:', err);
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start();
