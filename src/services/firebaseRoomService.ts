import {
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  onDisconnect,
  runTransaction,
} from 'firebase/database';
import { rtdb, sanitizeFirebaseKey } from './firebaseClient';
import { ChatMessage, DuelRole, Question } from '../types/game';
import { QUESTIONS_BANK } from '../data/questions';
import { questionTracker } from '../utils/questionTracker';

export interface FirebaseContestant {
  id: string;
  deviceId?: string;
  name: string;
  avatar: string;
  country: string;
  role: DuelRole;
  isHost?: boolean;
  isBot?: boolean;
  score: number;
  status: 'idle' | 'reading' | 'thinking' | 'answered' | 'eliminated';
  selectedOption?: number | null;
  responseTime?: number | null;
  answeredRound?: number | null;
  lastIsCorrect?: boolean | null;
  lastPointsEarned?: number | null;
}

export interface FirebaseRoomState {
  roomId: string;
  matchType: '1v1_friend' | '4player';
  category: string;
  lang: 'ar' | 'en';
  status: 'waiting' | 'playing' | 'revealed' | 'finished';
  currentIndex: number;
  totalQuestions: number;
  questionIds: string[];
  roundStartedAt: number;
  createdAt: number;
  updatedAt: number;
  player1_score: number;
  player2_score: number;
  player3_score: number;
  player4_score: number;
  forfeitedBy: string | null;
  forfeiterName: string | null;
  winnerRole: string | null;
  contestants: FirebaseContestant[];
}

export interface QueuePlayerEntry {
  deviceId: string;
  playerId: string;
  name: string;
  avatar: string;
  country: string;
  category: string;
  lang: 'ar' | 'en';
  joinedAt: number;
}

export interface Match4pAssignment {
  matched: true;
  roomId: string;
  role: DuelRole;
  createdAt: number;
}

const BOT_PROFILES = [
  { name: 'الأمير خالد', avatar: '🦅', country: 'SA' },
  { name: 'نور الهدى', avatar: '🌸', country: 'EG' },
  { name: 'صقر الخليج', avatar: '⚡', country: 'AE' },
  { name: 'فارس المعرفة', avatar: '🦁', country: 'JO' },
  { name: 'عمر الذكي', avatar: '🧠', country: 'KW' },
  { name: 'سارة المتميزة', avatar: '🌟', country: 'MA' },
  { name: 'بطل التحدي', avatar: '🚀', country: 'QA' },
  { name: 'يوسف النجم', avatar: '🏆', country: 'OM' },
];

const ROLE_ORDER: DuelRole[] = [
  'player1_host',
  'player2_guest',
  'player3_guest',
  'player4_guest',
];

function roleOrderIndex(role: DuelRole): number {
  const idx = ROLE_ORDER.indexOf(role);
  return idx === -1 ? 99 : idx;
}

function mapToContestantsArray(
  mapObj: Record<string, FirebaseContestant> | FirebaseContestant[] | null | undefined
): FirebaseContestant[] {
  if (!mapObj) return [];
  const list = Array.isArray(mapObj) ? mapObj.filter(Boolean) : Object.values(mapObj).filter(Boolean);
  return list.sort((a, b) => roleOrderIndex(a.role) - roleOrderIndex(b.role));
}

function computeScoresFromContestants(contestants: FirebaseContestant[]) {
  const scores = {
    player1_score: 0,
    player2_score: 0,
    player3_score: 0,
    player4_score: 0,
  };
  for (const c of contestants) {
    if (c.role === 'player1_host') scores.player1_score = Number(c.score) || 0;
    else if (c.role === 'player2_guest') scores.player2_score = Number(c.score) || 0;
    else if (c.role === 'player3_guest') scores.player3_score = Number(c.score) || 0;
    else if (c.role === 'player4_guest') scores.player4_score = Number(c.score) || 0;
  }
  return scores;
}

export function hydrateQuestionsFromIds(
  questionIds: string[] | null | undefined,
  fallbackCount = 10,
  category = 'all',
  roomSeed = ''
): Question[] {
  const bank = questionTracker.getBank().length > 0 ? questionTracker.getBank() : QUESTIONS_BANK;
  const byId = new Map<string, Question>();
  for (const q of bank) byId.set(q.id, q);
  for (const q of QUESTIONS_BANK) {
    if (!byId.has(q.id)) byId.set(q.id, q);
  }

  if (Array.isArray(questionIds) && questionIds.length > 0) {
    const resolved = questionIds.map((id) => byId.get(id)).filter((q): q is Question => Boolean(q));
    if (resolved.length >= Math.min(fallbackCount, questionIds.length)) {
      return resolved;
    }
  }
  return questionTracker.getMultiplayerQuestions(fallbackCount, category, roomSeed);
}

function normalizeRoomSnapshot(roomId: string, raw: Record<string, unknown> | null): FirebaseRoomState | null {
  if (!raw || typeof raw !== 'object') return null;
  const contestants = mapToContestantsArray(
    raw.contestantsMap as Record<string, FirebaseContestant> | undefined
  );
  const scores = computeScoresFromContestants(contestants);
  const qIds = Array.isArray(raw.questionIds)
    ? (raw.questionIds as string[])
    : raw.questionIds && typeof raw.questionIds === 'object'
    ? Object.values(raw.questionIds as Record<string, string>)
    : [];

  return {
    roomId: String(raw.roomId || roomId),
    matchType: raw.matchType === '4player' ? '4player' : '1v1_friend',
    category: String(raw.category || 'all'),
    lang: raw.lang === 'en' ? 'en' : 'ar',
    status:
      raw.status === 'playing' || raw.status === 'revealed' || raw.status === 'finished'
        ? raw.status
        : 'waiting',
    currentIndex: typeof raw.currentIndex === 'number' ? raw.currentIndex : 0,
    totalQuestions: typeof raw.totalQuestions === 'number' ? raw.totalQuestions : 10,
    questionIds: qIds,
    roundStartedAt: typeof raw.roundStartedAt === 'number' ? raw.roundStartedAt : Date.now(),
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now(),
    player1_score: typeof raw.player1_score === 'number' ? raw.player1_score : scores.player1_score,
    player2_score: typeof raw.player2_score === 'number' ? raw.player2_score : scores.player2_score,
    player3_score: typeof raw.player3_score === 'number' ? raw.player3_score : scores.player3_score,
    player4_score: typeof raw.player4_score === 'number' ? raw.player4_score : scores.player4_score,
    forfeitedBy: typeof raw.forfeitedBy === 'string' ? raw.forfeitedBy : null,
    forfeiterName: typeof raw.forfeiterName === 'string' ? raw.forfeiterName : null,
    winnerRole: typeof raw.winnerRole === 'string' ? raw.winnerRole : null,
    contestants,
  };
}

/**
 * Pick an unused 4-digit PIN (or use preferredPin if not currently active) and create a 1v1 room in Firebase RTDB.
 */
export async function create1v1Room(params: {
  preferredPin?: string;
  category: string;
  lang: 'ar' | 'en';
  totalQuestions: number;
  hostId: string;
  hostDeviceId?: string;
  hostName: string;
  hostAvatar: string;
  excludeIds?: string[];
}): Promise<{ success: boolean; roomId: string; questions: Question[]; room: FirebaseRoomState }> {
  const now = Date.now();
  let chosenPin =
    params.preferredPin && /^\d{4}$/.test(params.preferredPin)
      ? params.preferredPin
      : String(Math.floor(1000 + Math.random() * 9000));

  // Avoid overwriting an active recent waiting/playing room created in the last 30 minutes
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const existingSnap = await get(ref(rtdb, `rooms/${chosenPin}`));
      const existingVal = existingSnap.val();
      const isActiveRecent =
        existingVal &&
        existingVal.status !== 'finished' &&
        typeof existingVal.updatedAt === 'number' &&
        now - existingVal.updatedAt < 30 * 60 * 1000 &&
        existingVal.hostId !== params.hostId;
      if (!isActiveRecent) break;
      chosenPin = String(Math.floor(1000 + Math.random() * 9000));
    } catch {
      break;
    }
  }

  const excludeSet = new Set(params.excludeIds || []);
  const questions = questionTracker.getMultiplayerQuestions(
    params.totalQuestions || 10,
    params.category || 'all',
    `${chosenPin}_${now}`,
    excludeSet
  );
  const questionIds = questions.map((q) => q.id);

  const hostKey = sanitizeFirebaseKey(params.hostId);
  const hostContestant: FirebaseContestant = {
    id: params.hostId,
    deviceId: params.hostDeviceId || params.hostId,
    name: params.hostName || 'المتسابق',
    avatar: params.hostAvatar || '👑',
    country: 'SA',
    role: 'player1_host',
    isHost: true,
    isBot: false,
    score: 0,
    status: 'idle',
    selectedOption: null,
    responseTime: null,
    answeredRound: null,
    lastIsCorrect: null,
    lastPointsEarned: null,
  };

  const payload = {
    roomId: chosenPin,
    hostId: params.hostId,
    matchType: '1v1_friend',
    category: params.category || 'all',
    lang: params.lang || 'ar',
    status: 'waiting',
    currentIndex: 0,
    totalQuestions: params.totalQuestions || 10,
    questionIds,
    roundStartedAt: now,
    createdAt: now,
    updatedAt: now,
    player1_score: 0,
    player2_score: 0,
    player3_score: 0,
    player4_score: 0,
    forfeitedBy: null,
    forfeiterName: null,
    winnerRole: null,
    contestantsMap: {
      [hostKey]: hostContestant,
    },
  };

  await set(ref(rtdb, `rooms/${chosenPin}`), payload);

  // Clear old messages for a fresh room PIN
  remove(ref(rtdb, `room_messages/${chosenPin}`)).catch(() => {});

  return {
    success: true,
    roomId: chosenPin,
    questions,
    room: normalizeRoomSnapshot(chosenPin, payload)!,
  };
}

/**
 * Join an existing 1v1 room by 4-digit PIN in Firebase Realtime Database.
 */
export async function join1v1Room(params: {
  roomCode: string;
  playerId: string;
  deviceId?: string;
  name: string;
  avatar: string;
  country?: string;
  requireExisting?: boolean;
}): Promise<{
  success: boolean;
  error?: string;
  role?: DuelRole;
  room?: FirebaseRoomState;
  questions?: Question[];
}> {
  const cleanCode = sanitizeFirebaseKey(params.roomCode);
  if (!cleanCode) {
    return { success: false, error: 'كود الغرفة غير صحيح' };
  }

  const roomRef = ref(rtdb, `rooms/${cleanCode}`);
  const initialSnap = await get(roomRef);
  if (!initialSnap.exists()) {
    return {
      success: false,
      error: 'كود الغرفة غير موجود أو لم يتم إنشاؤه بعد',
    };
  }

  const initialVal = initialSnap.val() as Record<string, unknown>;
  if (initialVal.status === 'finished' || initialVal.forfeitedBy) {
    return {
      success: false,
      error: 'هذه الغرفة انتهت أو تم إغلاقها بالفعل',
    };
  }

  const playerKey = sanitizeFirebaseKey(params.playerId);
  let assignedRole: DuelRole = 'player2_guest';
  let txError: string | null = null;

  const txResult = await runTransaction(roomRef, (current) => {
    if (!current) return current;
    if (current.status === 'finished' || current.forfeitedBy) {
      txError = 'هذه الغرفة انتهت بالفعل';
      return;
    }

    const map: Record<string, FirebaseContestant> = current.contestantsMap || {};
    if (map[playerKey]) {
      assignedRole = map[playerKey].role || 'player2_guest';
      map[playerKey] = {
        ...map[playerKey],
        name: params.name || map[playerKey].name,
        avatar: params.avatar || map[playerKey].avatar,
      };
    } else {
      const existingList = Object.values(map);
      if (existingList.length >= 2 && current.matchType !== '4player') {
        txError = 'الغرفة ممتلئة بالفعل (يوجد لاعبان داخل التحدي)';
        return;
      }
      assignedRole = existingList.some((c) => c.role === 'player1_host')
        ? 'player2_guest'
        : 'player1_host';

      map[playerKey] = {
        id: params.playerId,
        deviceId: params.deviceId || params.playerId,
        name: params.name || 'الصديق',
        avatar: params.avatar || '⚡',
        country: params.country || 'SA',
        role: assignedRole,
        isHost: assignedRole === 'player1_host',
        isBot: false,
        score: 0,
        status: 'thinking',
        selectedOption: null,
        responseTime: null,
        answeredRound: null,
        lastIsCorrect: null,
        lastPointsEarned: null,
      };
    }

    const list = mapToContestantsArray(map);
    if (list.length >= 2 && current.status === 'waiting') {
      current.status = 'playing';
      current.roundStartedAt = Date.now();
      for (const k of Object.keys(map)) {
        map[k].status = 'thinking';
      }
    }

    current.contestantsMap = map;
    current.updatedAt = Date.now();
    return current;
  });

  if (txError || !txResult.committed || !txResult.snapshot.exists()) {
    return {
      success: false,
      error: txError || 'تعذر الانضمام إلى الغرفة حالياً',
    };
  }

  const normalized = normalizeRoomSnapshot(cleanCode, txResult.snapshot.val());
  if (!normalized) {
    return { success: false, error: 'بيانات الغرفة غير صالحة' };
  }

  const questions = hydrateQuestionsFromIds(
    normalized.questionIds,
    normalized.totalQuestions,
    normalized.category,
    cleanCode
  );

  return {
    success: true,
    role: assignedRole,
    room: normalized,
    questions,
  };
}

/**
 * Subscribe in real time to a room's full state via Firebase RTDB `onValue`.
 */
export function subscribeRoomState(
  roomCode: string,
  onUpdate: (room: FirebaseRoomState) => void
): () => void {
  const cleanCode = sanitizeFirebaseKey(roomCode);
  if (!cleanCode) return () => {};
  const roomRef = ref(rtdb, `rooms/${cleanCode}`);
  const unsub = onValue(
    roomRef,
    (snap) => {
      if (!snap.exists()) return;
      const normalized = normalizeRoomSnapshot(cleanCode, snap.val());
      if (normalized) onUpdate(normalized);
    },
    () => {}
  );
  return () => {
    try {
      unsub();
    } catch {}
  };
}

/**
 * Submit a player's answer atomically. Both players in 1v1 and all 4 players in 4P
 * write to their own slot in `contestantsMap` without blocking or overwriting each other!
 */
export async function submitRoomAnswer(params: {
  roomCode: string;
  playerId: string;
  role: DuelRole;
  optionIndex: number;
  roundIndex: number;
  responseTime: number;
  isCorrect: boolean;
  pointsEarned: number;
}): Promise<{
  success: boolean;
  room?: FirebaseRoomState;
  allAnswered?: boolean;
}> {
  const cleanCode = sanitizeFirebaseKey(params.roomCode);
  if (!cleanCode) return { success: false };

  const playerKey = sanitizeFirebaseKey(params.playerId);
  const roomRef = ref(rtdb, `rooms/${cleanCode}`);

  const txResult = await runTransaction(roomRef, (current) => {
    if (!current || current.status === 'finished') return current;
    if (typeof current.currentIndex === 'number' && params.roundIndex !== current.currentIndex) {
      return current;
    }

    const map: Record<string, FirebaseContestant> = current.contestantsMap || {};
    const existing = map[playerKey];
    if (!existing) {
      map[playerKey] = {
        id: params.playerId,
        name: 'متسابق',
        avatar: '👤',
        country: 'SA',
        role: params.role,
        score: 0,
        status: 'thinking',
      };
    }

    // Prevent double-scoring the same round for the same player
    if (map[playerKey].answeredRound === params.roundIndex && map[playerKey].status === 'answered') {
      return current;
    }

    const prevScore = Number(map[playerKey].score) || 0;
    const addedPts = params.isCorrect ? Number(params.pointsEarned) || 50 : 0;

    map[playerKey] = {
      ...map[playerKey],
      score: prevScore + addedPts,
      status: 'answered',
      selectedOption: params.optionIndex,
      responseTime: params.responseTime,
      answeredRound: params.roundIndex,
      lastIsCorrect: params.isCorrect,
      lastPointsEarned: addedPts,
    };

    const list = mapToContestantsArray(map);
    const scores = computeScoresFromContestants(list);
    current.player1_score = scores.player1_score;
    current.player2_score = scores.player2_score;
    current.player3_score = scores.player3_score;
    current.player4_score = scores.player4_score;

    const allAnswered =
      list.length >= 2 &&
      list.every(
        (c) =>
          (c.status === 'answered' && c.answeredRound === params.roundIndex) ||
          c.status === 'eliminated'
      );

    if (allAnswered) {
      current.status = 'revealed';
    }

    current.contestantsMap = map;
    current.updatedAt = Date.now();
    return current;
  });

  const normalized = txResult.snapshot.exists()
    ? normalizeRoomSnapshot(cleanCode, txResult.snapshot.val())
    : null;

  return {
    success: Boolean(normalized),
    room: normalized || undefined,
    allAnswered: normalized?.status === 'revealed',
  };
}

/**
 * Advance to the next question atomically (guarded so no player is cut off before all answer or 40s timeout).
 */
export async function advanceRoomRound(params: {
  roomCode: string;
  currentRound: number;
  forceTimeout?: boolean;
}): Promise<{ success: boolean; deferred?: boolean; room?: FirebaseRoomState }> {
  const cleanCode = sanitizeFirebaseKey(params.roomCode);
  if (!cleanCode) return { success: false };

  const roomRef = ref(rtdb, `rooms/${cleanCode}`);
  let wasDeferred = false;

  const txResult = await runTransaction(roomRef, (current) => {
    if (!current || current.status === 'finished') return current;
    const expectedIdx = Math.max(0, params.currentRound - 1);
    if (current.currentIndex > expectedIdx) {
      // Already advanced by the other device
      return current;
    }

    const map: Record<string, FirebaseContestant> = current.contestantsMap || {};
    const list = mapToContestantsArray(map);
    const elapsedMs = Date.now() - (Number(current.roundStartedAt) || 0);
    const allAnswered =
      list.length >= 2 &&
      list.every(
        (c) =>
          (c.status === 'answered' && c.answeredRound === expectedIdx) ||
          c.status === 'eliminated'
      );

    if (!allAnswered && !params.forceTimeout && elapsedMs < 39500) {
      wasDeferred = true;
      return;
    }

    const total = Number(current.totalQuestions) || 10;
    const nextIdx = expectedIdx + 1;
    if (nextIdx >= total) {
      current.currentIndex = total;
      current.status = 'finished';
      current.updatedAt = Date.now();
      return current;
    }

    current.currentIndex = nextIdx;
    current.status = 'playing';
    current.roundStartedAt = Date.now();
    for (const k of Object.keys(map)) {
      map[k] = {
        ...map[k],
        status: 'thinking',
        selectedOption: null,
        responseTime: null,
        lastIsCorrect: null,
        lastPointsEarned: null,
      };
    }
    current.contestantsMap = map;
    current.updatedAt = Date.now();
    return current;
  });

  const normalized = txResult.snapshot.exists()
    ? normalizeRoomSnapshot(cleanCode, txResult.snapshot.val())
    : null;

  return {
    success: !wasDeferred,
    deferred: wasDeferred,
    room: normalized || undefined,
  };
}

/**
 * Mark a room as forfeited (1v1 closes & locks for both phones; 4P replaces leaving player with a bot).
 */
export async function forfeitRoom(params: {
  roomCode: string;
  playerId: string;
  role: DuelRole;
  matchType: '1v1_friend' | '4player';
  playerName?: string;
}): Promise<void> {
  const cleanCode = sanitizeFirebaseKey(params.roomCode);
  if (!cleanCode) return;

  const roomRef = ref(rtdb, `rooms/${cleanCode}`);
  const playerKey = sanitizeFirebaseKey(params.playerId);

  await runTransaction(roomRef, (current) => {
    if (!current || current.status === 'finished') return current;

    if (params.matchType === '4player') {
      const map: Record<string, FirebaseContestant> = current.contestantsMap || {};
      if (map[playerKey]) {
        const bot = BOT_PROFILES[Math.floor(Math.random() * BOT_PROFILES.length)];
        map[playerKey] = {
          ...map[playerKey],
          name: bot.name,
          avatar: bot.avatar,
          country: bot.country,
          isBot: true,
        };
        current.contestantsMap = map;
        current.updatedAt = Date.now();
      }
      return current;
    }

    // 1v1 strict forfeit
    current.status = 'finished';
    current.forfeitedBy = params.role;
    current.forfeiterName = params.playerName || null;
    current.winnerRole = params.role === 'player1_host' ? 'player2_guest' : 'player1_host';
    current.updatedAt = Date.now();
    return current;
  }).catch(() => {});
}

/**
 * Presence heartbeat for active multiplayer room (auto-clears on browser/WebView disconnect).
 */
export function registerRoomPresenceHeartbeat(roomCode: string, playerId: string): () => void {
  const cleanCode = sanitizeFirebaseKey(roomCode);
  const cleanPlayer = sanitizeFirebaseKey(playerId);
  if (!cleanCode || !cleanPlayer) return () => {};
  const hbRef = ref(rtdb, `rooms/${cleanCode}/heartbeats/${cleanPlayer}`);
  try {
    set(hbRef, Date.now()).catch(() => {});
    onDisconnect(hbRef).remove().catch(() => {});
  } catch {}
  return () => {
    remove(hbRef).catch(() => {});
  };
}

/**
 * Submit an automated bot answer for a bot contestant in a 4-Player match.
 */
export async function submitBotAnswerForRound(params: {
  roomCode: string;
  bot: FirebaseContestant;
  roundIndex: number;
  correctIndex: number;
}): Promise<void> {
  const isCorrect = Math.random() < 0.72;
  let optionIndex = params.correctIndex;
  if (!isCorrect) {
    const wrongs = [0, 1, 2, 3].filter((i) => i !== params.correctIndex);
    optionIndex = wrongs[Math.floor(Math.random() * wrongs.length)];
  }
  const responseTime = parseFloat((3 + Math.random() * 11).toFixed(1));
  await submitRoomAnswer({
    roomCode: params.roomCode,
    playerId: params.bot.id,
    role: params.bot.role,
    optionIndex,
    roundIndex: params.roundIndex,
    responseTime,
    isCorrect,
    pointsEarned: isCorrect ? 50 : 0,
  }).catch(() => {});
}

// ============================================================================
// 4-PLAYER WORLDWIDE MATCHMAKING QUEUE (100% FIREBASE RTDB)
// ============================================================================

const QUEUE_STALE_MS = 95 * 1000;

async function create4PlayerMatchedRoom(
  humans: QueuePlayerEntry[],
  fillMissingWithBots: boolean,
  excludeIds?: string[]
): Promise<{ roomId: string; room: FirebaseRoomState; questions: Question[] }> {
  const now = Date.now();
  const roomId = `4P${String(Math.floor(1000 + Math.random() * 9000))}`;
  const primary = humans[0];
  const category = primary?.category || 'all';
  const lang = primary?.lang || 'ar';
  const totalQuestions = 10;

  const questions = questionTracker.getMultiplayerQuestions(
    totalQuestions,
    category,
    `${roomId}_${now}`,
    new Set(excludeIds || [])
  );
  const questionIds = questions.map((q) => q.id);

  const contestantsMap: Record<string, FirebaseContestant> = {};
  const assignments: Record<string, Match4pAssignment> = {};

  humans.slice(0, 4).forEach((h, idx) => {
    const role = ROLE_ORDER[idx] || 'player4_guest';
    const key = sanitizeFirebaseKey(h.playerId);
    contestantsMap[key] = {
      id: h.playerId,
      deviceId: h.deviceId,
      name: h.name || `لاعب ${idx + 1}`,
      avatar: h.avatar || '👑',
      country: h.country || 'SA',
      role,
      isHost: idx === 0,
      isBot: false,
      score: 0,
      status: 'thinking',
      selectedOption: null,
      responseTime: null,
      answeredRound: null,
      lastIsCorrect: null,
      lastPointsEarned: null,
    };
    assignments[sanitizeFirebaseKey(h.deviceId)] = {
      matched: true,
      roomId,
      role,
      createdAt: now,
    };
  });

  if (fillMissingWithBots) {
    const usedNames = new Set(Object.values(contestantsMap).map((c) => c.name));
    const shuffledBots = [...BOT_PROFILES].sort(() => Math.random() - 0.5);
    let botCursor = 0;

    for (let idx = humans.length; idx < 4; idx++) {
      const role = ROLE_ORDER[idx];
      let bot = shuffledBots[botCursor % shuffledBots.length];
      botCursor++;
      if (usedNames.has(bot.name)) {
        bot = shuffledBots[botCursor % shuffledBots.length];
        botCursor++;
      }
      usedNames.add(bot.name);
      const botId = `bot_${roomId}_${idx}`;
      contestantsMap[sanitizeFirebaseKey(botId)] = {
        id: botId,
        deviceId: botId,
        name: bot.name,
        avatar: bot.avatar,
        country: bot.country,
        role,
        isHost: false,
        isBot: true,
        score: 0,
        status: 'thinking',
        selectedOption: null,
        responseTime: null,
        answeredRound: null,
        lastIsCorrect: null,
        lastPointsEarned: null,
      };
    }
  }

  const roomPayload = {
    roomId,
    hostId: primary?.playerId || '',
    matchType: '4player',
    category,
    lang,
    status: 'playing',
    currentIndex: 0,
    totalQuestions,
    questionIds,
    roundStartedAt: now,
    createdAt: now,
    updatedAt: now,
    player1_score: 0,
    player2_score: 0,
    player3_score: 0,
    player4_score: 0,
    forfeitedBy: null,
    forfeiterName: null,
    winnerRole: null,
    contestantsMap,
  };

  await set(ref(rtdb, `rooms/${roomId}`), roomPayload);

  // Atomically publish assignments & remove matched players from queue
  const updates: Record<string, unknown> = {};
  for (const h of humans.slice(0, 4)) {
    const dKey = sanitizeFirebaseKey(h.deviceId);
    updates[`matchmaking_4p/assignments/${dKey}`] = assignments[dKey];
    updates[`matchmaking_4p/queue/${dKey}`] = null;
  }
  await update(ref(rtdb), updates);

  return {
    roomId,
    room: normalizeRoomSnapshot(roomId, roomPayload)!,
    questions,
  };
}

export async function join4PlayerQueue(params: {
  deviceId: string;
  playerId: string;
  name: string;
  avatar: string;
  country?: string;
  category: string;
  lang: 'ar' | 'en';
  excludeIds?: string[];
}): Promise<{
  matched: boolean;
  roomId?: string;
  role?: DuelRole;
  room?: FirebaseRoomState;
  questions?: Question[];
  queueCount?: number;
  players?: QueuePlayerEntry[];
}> {
  const devKey = sanitizeFirebaseKey(params.deviceId);
  const now = Date.now();

  // Clear any old assignment for this device first
  await remove(ref(rtdb, `matchmaking_4p/assignments/${devKey}`)).catch(() => {});

  const entry: QueuePlayerEntry = {
    deviceId: params.deviceId,
    playerId: params.playerId,
    name: params.name || 'متسابق',
    avatar: params.avatar || '👑',
    country: params.country || 'SA',
    category: params.category || 'all',
    lang: params.lang || 'ar',
    joinedAt: now,
  };

  const myQueueRef = ref(rtdb, `matchmaking_4p/queue/${devKey}`);
  await set(myQueueRef, entry);
  onDisconnect(myQueueRef).remove().catch(() => {});

  // Read live queue to see if 4 real players are already ready
  const queueSnap = await get(ref(rtdb, 'matchmaking_4p/queue'));
  const rawQueue = (queueSnap.val() || {}) as Record<string, QueuePlayerEntry>;
  const freshPlayers = Object.values(rawQueue)
    .filter((p) => p && p.deviceId && now - (Number(p.joinedAt) || 0) < QUEUE_STALE_MS)
    .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));

  // If 4+ real players are waiting and we are among the first 4 (and the 4th to trigger), create the room
  if (freshPlayers.length >= 4) {
    const group = freshPlayers.slice(0, 4);
    const myIdx = group.findIndex((p) => p.deviceId === params.deviceId);
    if (myIdx !== -1) {
      const created = await create4PlayerMatchedRoom(group, false, params.excludeIds);
      return {
        matched: true,
        roomId: created.roomId,
        role: ROLE_ORDER[myIdx] || 'player4_guest',
        room: created.room,
        questions: created.questions,
      };
    }
  }

  return {
    matched: false,
    queueCount: Math.max(1, freshPlayers.length),
    players: freshPlayers,
  };
}

export async function fill4PlayerWithBots(params: {
  deviceId: string;
  playerId: string;
  name: string;
  avatar: string;
  country?: string;
  category: string;
  lang: 'ar' | 'en';
  excludeIds?: string[];
}): Promise<{
  matched: boolean;
  roomId?: string;
  role?: DuelRole;
  room?: FirebaseRoomState;
  questions?: Question[];
}> {
  const devKey = sanitizeFirebaseKey(params.deviceId);

  // Check if another device in the queue ALREADY matched us a moment ago
  const existingAssignSnap = await get(ref(rtdb, `matchmaking_4p/assignments/${devKey}`));
  if (existingAssignSnap.exists()) {
    const assign = existingAssignSnap.val() as Match4pAssignment;
    if (assign?.matched && assign.roomId) {
      const roomSnap = await get(ref(rtdb, `rooms/${assign.roomId}`));
      if (roomSnap.exists()) {
        const room = normalizeRoomSnapshot(assign.roomId, roomSnap.val());
        if (room) {
          return {
            matched: true,
            roomId: assign.roomId,
            role: assign.role,
            room,
            questions: hydrateQuestionsFromIds(
              room.questionIds,
              room.totalQuestions,
              room.category,
              assign.roomId
            ),
          };
        }
      }
    }
  }

  const now = Date.now();
  const queueSnap = await get(ref(rtdb, 'matchmaking_4p/queue'));
  const rawQueue = (queueSnap.val() || {}) as Record<string, QueuePlayerEntry>;
  const freshPlayers = Object.values(rawQueue)
    .filter((p) => p && p.deviceId && now - (Number(p.joinedAt) || 0) < QUEUE_STALE_MS)
    .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));

  const group: QueuePlayerEntry[] = freshPlayers.some((p) => p.deviceId === params.deviceId)
    ? freshPlayers.slice(0, 4)
    : [
        {
          deviceId: params.deviceId,
          playerId: params.playerId,
          name: params.name || 'متسابق',
          avatar: params.avatar || '👑',
          country: params.country || 'SA',
          category: params.category || 'all',
          lang: params.lang || 'ar',
          joinedAt: now,
        },
        ...freshPlayers.slice(0, 3),
      ];

  const myIdx = Math.max(0, group.findIndex((p) => p.deviceId === params.deviceId));
  const created = await create4PlayerMatchedRoom(group, true, params.excludeIds);
  return {
    matched: true,
    roomId: created.roomId,
    role: ROLE_ORDER[myIdx] || 'player1_host',
    room: created.room,
    questions: created.questions,
  };
}

export function subscribe4PlayerQueue(
  deviceId: string,
  callbacks: {
    onQueueUpdate: (players: QueuePlayerEntry[]) => void;
    onMatched: (data: {
      matched: true;
      roomId: string;
      role: DuelRole;
      room: FirebaseRoomState;
      questions: Question[];
    }) => void;
  }
): () => void {
  const devKey = sanitizeFirebaseKey(deviceId);
  const queueRef = ref(rtdb, 'matchmaking_4p/queue');
  const assignRef = ref(rtdb, `matchmaking_4p/assignments/${devKey}`);

  const unsubQueue = onValue(
    queueRef,
    (snap) => {
      const raw = (snap.val() || {}) as Record<string, QueuePlayerEntry>;
      const now = Date.now();
      const fresh = Object.values(raw)
        .filter((p) => p && p.deviceId && now - (Number(p.joinedAt) || 0) < QUEUE_STALE_MS)
        .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
      callbacks.onQueueUpdate(fresh);
    },
    () => {}
  );

  const unsubAssign = onValue(
    assignRef,
    async (snap) => {
      if (!snap.exists()) return;
      const assign = snap.val() as Match4pAssignment;
      if (!assign?.matched || !assign.roomId) return;
      try {
        const roomSnap = await get(ref(rtdb, `rooms/${assign.roomId}`));
        if (!roomSnap.exists()) return;
        const room = normalizeRoomSnapshot(assign.roomId, roomSnap.val());
        if (!room) return;
        const questions = hydrateQuestionsFromIds(
          room.questionIds,
          room.totalQuestions,
          room.category,
          assign.roomId
        );
        callbacks.onMatched({
          matched: true,
          roomId: assign.roomId,
          role: assign.role,
          room,
          questions,
        });
      } catch {}
    },
    () => {}
  );

  return () => {
    try {
      unsubQueue();
      unsubAssign();
    } catch {}
  };
}

export async function leave4PlayerQueue(deviceId: string): Promise<void> {
  const devKey = sanitizeFirebaseKey(deviceId);
  if (!devKey) return;
  await Promise.allSettled([
    remove(ref(rtdb, `matchmaking_4p/queue/${devKey}`)),
    remove(ref(rtdb, `matchmaking_4p/assignments/${devKey}`)),
  ]);
}

// ============================================================================
// REAL-TIME ROOM CHAT (FIREBASE RTDB)
// ============================================================================

export function subscribeRoomMessages(
  roomId: string,
  onChange: (messages: ChatMessage[]) => void
): () => void {
  const cleanRoom = sanitizeFirebaseKey(roomId || 'M-GLOBAL');
  const msgsRef = ref(rtdb, `room_messages/${cleanRoom}`);
  const unsub = onValue(
    msgsRef,
    (snap) => {
      if (!snap.exists()) {
        onChange([]);
        return;
      }
      const raw = snap.val() as Record<string, ChatMessage & { ts?: number }>;
      const list = Object.values(raw)
        .filter((m) => m && m.id && m.text)
        .sort((a, b) => (a.ts || 0) - (b.ts || 0));
      onChange(list);
    },
    () => {}
  );
  return () => {
    try {
      unsub();
    } catch {}
  };
}

export async function sendRoomMessage(roomId: string, msg: ChatMessage): Promise<void> {
  const cleanRoom = sanitizeFirebaseKey(roomId || 'M-GLOBAL');
  const cleanMsgId = sanitizeFirebaseKey(msg.id);
  await set(ref(rtdb, `room_messages/${cleanRoom}/${cleanMsgId}`), {
    id: msg.id,
    senderId: msg.senderId,
    senderName: msg.senderName,
    senderAvatar: msg.senderAvatar,
    text: msg.text,
    time: msg.time,
    isSystem: Boolean(msg.isSystem),
    ts: Date.now(),
  }).catch(() => {});
}

export async function deleteRoomMessage(roomId: string, messageId: string): Promise<void> {
  const cleanRoom = sanitizeFirebaseKey(roomId || 'M-GLOBAL');
  const cleanMsgId = sanitizeFirebaseKey(messageId);
  await remove(ref(rtdb, `room_messages/${cleanRoom}/${cleanMsgId}`)).catch(() => {});
}

// ============================================================================
// PLAYER REPORTS (FIREBASE RTDB)
// ============================================================================

export async function savePlayerReportToFirebase(record: {
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
}): Promise<void> {
  const cleanId = sanitizeFirebaseKey(record.id);
  await set(ref(rtdb, `reports/${cleanId}`), {
    id: record.id,
    reporterId: record.reporterId,
    reporterName: record.reporterName,
    reportedId: record.reportedId,
    reportedName: record.reportedName,
    roomId: record.roomId || '',
    reason: record.reason,
    reasonLabel: record.reasonLabel,
    details: record.details || '',
    createdAt: record.createdAt || Date.now(),
  }).catch(() => {});
}
