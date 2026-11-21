import { QUESTIONS_BANK, QUESTIONS_BANK_SIGNATURE } from '../data/questions';
import { Question } from '../types/game';

const STORAGE_KEY = 'millionaire_global_used_questions_all_modes';
const LAST_TOPIC_KEY = 'millionaire_last_picked_topic_map';
const LAST_RUN_KEY = 'millionaire_last_classic_run_ids';
const CACHED_BANK_KEY = 'millionaire_cached_questions_v1';
const BANK_SIGNATURE_KEY = 'millionaire_bank_signature_v1';

/**
 * Global Question Tracker
 * Guarantees zero question repetition across all 3 modes:
 * 1. Play vs Computer (اللعب مع الكمبيوتر)
 * 2. 1v1 Friend Duel (تحدي اثنين)
 * 3. 4-Player Online Challenge (تحدي أربعة)
 *
 * - Auto-clears stale question-tracking localStorage keys whenever the bank signature updates
 *   while preserving player points, profile, and unlocked badges.
 * - Keeps sections strictly within their 100-question banks and interleaves topics cleanly.
 */
class QuestionTracker {
  private usedIds: Set<string> = new Set();
  private lastRunIds: Set<string> = new Set();
  private lastTopicByCat: Record<string, string> = {};
  private activeBank: Question[] = QUESTIONS_BANK;

  constructor() {
    this.syncBankSignature(QUESTIONS_BANK_SIGNATURE);
    this.ensureOfflineBankStored();
    this.loadFromStorage();
  }

  private ensureOfflineBankStored() {
    try {
      const existing = localStorage.getItem(CACHED_BANK_KEY);
      if (!existing) {
        localStorage.setItem(
          CACHED_BANK_KEY,
          JSON.stringify({
            questionsHash: QUESTIONS_BANK_SIGNATURE,
            questions: this.activeBank,
          })
        );
      } else {
        const parsed = JSON.parse(existing);
        if (
          parsed &&
          parsed.questionsHash &&
          parsed.questionsHash === QUESTIONS_BANK_SIGNATURE &&
          Array.isArray(parsed.questions) &&
          parsed.questions.length >= 100
        ) {
          this.activeBank = parsed.questions;
        } else {
          localStorage.setItem(
            CACHED_BANK_KEY,
            JSON.stringify({
              questionsHash: QUESTIONS_BANK_SIGNATURE,
              questions: QUESTIONS_BANK,
            })
          );
        }
      }
    } catch {
      // Storage unavailable or quota tight; keep embedded QUESTIONS_BANK
      this.activeBank = QUESTIONS_BANK;
    }
  }

  private syncBankSignature(expectedSig: string) {
    if (!expectedSig) return;
    try {
      const savedSig = localStorage.getItem(BANK_SIGNATURE_KEY);
      if (savedSig !== expectedSig) {
        // Auto-clear old question memory only; keep points, profile, and badges intact!
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(LAST_RUN_KEY);
        localStorage.removeItem(LAST_TOPIC_KEY);
        localStorage.removeItem(CACHED_BANK_KEY);
        localStorage.setItem(BANK_SIGNATURE_KEY, expectedSig);
        this.usedIds.clear();
        this.lastRunIds.clear();
        this.lastTopicByCat = {};
      }
    } catch {
      // Storage unavailable
    }
  }

  public applyLiveQuestions(liveQuestions: Question[], liveSignature?: string) {
    if (!Array.isArray(liveQuestions) || liveQuestions.length < 100) return;
    this.activeBank = liveQuestions;
    if (liveSignature) {
      this.syncBankSignature(liveSignature);
    }
    try {
      localStorage.setItem(
        CACHED_BANK_KEY,
        JSON.stringify({
          questionsHash: liveSignature || QUESTIONS_BANK_SIGNATURE,
          questions: liveQuestions,
        })
      );
    } catch {}
    const validIds = new Set(this.activeBank.map((q) => q.id));
    this.usedIds = new Set(Array.from(this.usedIds).filter((id) => validIds.has(id)));
    this.saveToStorage();
  }

  public getBank(): Question[] {
    return this.activeBank;
  }

  private loadFromStorage() {
    try {
      const validIds = new Set(this.activeBank.map((q) => q.id));
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.usedIds = new Set(parsed.filter((id) => typeof id === 'string' && validIds.has(id)));
        }
      }
      const rawLast = localStorage.getItem(LAST_RUN_KEY);
      if (rawLast) {
        const parsedLast = JSON.parse(rawLast);
        if (Array.isArray(parsedLast)) {
          this.lastRunIds = new Set(parsedLast.filter((id) => typeof id === 'string' && validIds.has(id)));
        }
      }
      const rawTopics = localStorage.getItem(LAST_TOPIC_KEY);
      if (rawTopics) {
        const parsedTopics = JSON.parse(rawTopics);
        if (parsedTopics && typeof parsedTopics === 'object') {
          this.lastTopicByCat = parsedTopics;
        }
      }
    } catch {
      this.usedIds = new Set();
      this.lastRunIds = new Set();
      this.lastTopicByCat = {};
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.usedIds)));
      localStorage.setItem(LAST_TOPIC_KEY, JSON.stringify(this.lastTopicByCat));
    } catch {
      // Storage unavailable or quota exceeded
    }
  }

  public recordLastRunQuestion(id: string) {
    if (!id) return;
    this.lastRunIds.add(id);
    try {
      const arr = Array.from(this.lastRunIds).slice(-150);
      localStorage.setItem('millionaire_last_classic_run_ids', JSON.stringify(arr));
    } catch {}
  }

  public clearLastRunTrackerForNewAttempt(keepPreviousRunExcluded = true) {
    if (!keepPreviousRunExcluded) {
      this.lastRunIds.clear();
      try {
        localStorage.removeItem('millionaire_last_classic_run_ids');
      } catch {}
    }
  }

  public matchesCategory(q: Question, category?: string): boolean {
    if (!category || category === 'all') return true;
    if (category === 'general') return q.category === 'general';
    if (category === 'islamic') return q.category === 'islamic';
    if (category === 'entertainment') return q.category === 'sports' || q.category === 'cinema';
    return q.category === category;
  }

  public matchesGameplayCategory(q: Question, category?: string): boolean {
    if (!category || category === 'all' || category === 'general') {
      return q.category === 'general';
    }
    if (category === 'islamic') return q.category === 'islamic';
    if (category === 'entertainment') return q.category === 'sports' || q.category === 'cinema';
    return q.category === category;
  }

  public getUsedIds(): Set<string> {
    return this.usedIds;
  }

  public getUsedCount(): number {
    return this.usedIds.size;
  }

  public getTotalQuestionsCount(): number {
    return this.activeBank.length;
  }

  public markAsUsed(id: string) {
    if (!id) return;
    this.usedIds.add(id);
    this.saveToStorage();
  }

  public markManyAsUsed(ids: string[]) {
    if (!ids || ids.length === 0) return;
    ids.forEach((id) => this.usedIds.add(id));
    this.saveToStorage();
  }

  public isUsed(id: string): boolean {
    return this.usedIds.has(id);
  }

  /**
   * Reset tracker ONLY for questions in the exhausted scope
   */
  public resetIfExhausted(threshold = this.activeBank.length) {
    if (this.usedIds.size >= threshold) {
      this.usedIds.clear();
      this.saveToStorage();
    }
  }

  private getTopicKey(q: Question): string {
    return q.topic || `${q.category}_${q.id}`;
  }

  /**
   * Pick randomly from candidates while guaranteeing consecutive questions
   * never share the same topic/prophet, and preventing late-deck topic clustering.
   */
  private pickWithTopicShuffle(candidates: Question[], prevTopic: string): Question {
    const nonSame = candidates.filter((q) => this.getTopicKey(q) !== prevTopic);
    const pool = nonSame.length > 0 ? nonSame : candidates;

    // Count remaining per topic across all candidates to avoid stranding a dominant topic at the end
    const counts = new Map<string, number>();
    for (const q of candidates) {
      const t = this.getTopicKey(q);
      counts.set(t, (counts.get(t) || 0) + 1);
    }

    const halfCeil = Math.ceil(candidates.length / 2);
    let dominantTopic: string | null = null;
    let dominantCount = 0;
    for (const [topic, cnt] of counts.entries()) {
      if (topic !== prevTopic && cnt >= halfCeil && cnt > dominantCount) {
        dominantTopic = topic;
        dominantCount = cnt;
      }
    }

    const finalPool = dominantTopic
      ? pool.filter((q) => this.getTopicKey(q) === dominantTopic)
      : pool;

    const pickFrom = finalPool.length > 0 ? finalPool : pool;
    return pickFrom[Math.floor(Math.random() * pickFrom.length)];
  }

  /**
   * Fetch a guaranteed unused question for Classic mode (1..100 stages),
   * never repeating any question until the section's entire bank is exhausted,
   * and interleaving topics so no two consecutive questions share a prophet/subject.
   */
  public getClassicQuestion(
    stage: number,
    sessionExclude?: Set<string>,
    category: string = 'all'
  ): Question {
    const fullBank = this.activeBank;
    const catQuestions = fullBank.filter((q) => this.matchesGameplayCategory(q, category));
    const bank = catQuestions.length > 0 ? catQuestions : fullBank;
    const catKey = !category || category === 'all' ? 'general' : category;
    const prevTopic = this.lastTopicByCat[catKey] || '';
    const isDedicated100Cycle = catKey === 'general' || catKey === 'islamic' || catKey === 'entertainment';

    // Dedicated strict cycle for all 100-question sections (General, Islamic, Movies & Series):
    // Never repeat ANY question in the category until ALL 100 are played!
    let pool = bank.filter(
      (q) => !this.usedIds.has(q.id) && (!sessionExclude || !sessionExclude.has(q.id))
    );

    // If all questions in this category have been exhausted across runs:
    if (pool.length === 0) {
      const catIdSet = new Set(bank.map((q) => q.id));
      for (const id of Array.from(this.usedIds)) {
        if (catIdSet.has(id)) {
          this.usedIds.delete(id);
        }
      }
      this.saveToStorage();
      pool = bank.filter((q) => !sessionExclude || !sessionExclude.has(q.id));
      if (pool.length === 0) {
        pool = bank;
      }
    }

    let selected: Question;
    if (isDedicated100Cycle) {
      // Pure randomized topic-interleaved shuffle across all remaining unseen questions (no level lock)
      selected = this.pickWithTopicShuffle(pool, prevTopic);
    } else {
      // Map stage 1..100 -> difficulty tier 1..15 for Entertainment
      const mappedLevel = Math.min(15, Math.max(1, Math.ceil((stage / 100) * 15)));
      const notLastRun = pool.filter((q) => !this.lastRunIds.has(q.id));
      const basePool = notLastRun.length > 0 ? notLastRun : pool;

      const exactLevel = basePool.filter((q) => q.level === mappedLevel);
      if (exactLevel.length > 0) {
        selected = this.pickWithTopicShuffle(exactLevel, prevTopic);
      } else {
        const tierMin = mappedLevel <= 5 ? 1 : mappedLevel <= 10 ? 6 : 11;
        const tierMax = mappedLevel <= 5 ? 5 : mappedLevel <= 10 ? 10 : 15;
        const tierPool = basePool.filter((q) => q.level >= tierMin && q.level <= tierMax);
        selected = this.pickWithTopicShuffle(tierPool.length > 0 ? tierPool : basePool, prevTopic);
      }
    }

    this.lastTopicByCat[catKey] = this.getTopicKey(selected);
    this.markAsUsed(selected.id);
    this.recordLastRunQuestion(selected.id);
    if (sessionExclude) sessionExclude.add(selected.id);
    return selected;
  }

  /**
   * Fetch a series of guaranteed non-repeating questions for 1v1 and 4-Player rounds,
   * with interleaved topic shuffle so no two consecutive questions share the same topic.
   */
  public getMultiplayerQuestions(
    count: number,
    category?: string,
    roomSeed?: string,
    excludeIds?: Set<string>
  ): Question[] {
    const fullBank = this.activeBank;
    const catPool = fullBank.filter((q) => this.matchesGameplayCategory(q, category));
    const pool = catPool.length >= count ? catPool : fullBank;
    const isDedicated100Cycle =
      !category || category === 'all' || category === 'general' || category === 'islamic' || category === 'entertainment';

    let seed = 0;
    const effectiveSeed = roomSeed || `ROOM_${Date.now()}`;
    for (let i = 0; i < effectiveSeed.length; i++) {
      seed = (seed * 31 + effectiveSeed.charCodeAt(i)) % 2147483647;
    }

    const selected: Question[] = [];
    const selectedIds = new Set<string>();
    const skipIds = excludeIds || this.usedIds;
    let prevTopic = '';

    for (let i = 0; i < count; i++) {
      let candidates = pool.filter((q) => !skipIds.has(q.id) && !selectedIds.has(q.id));
      if (candidates.length === 0) {
        candidates = pool.filter((q) => !selectedIds.has(q.id));
      }
      if (candidates.length === 0) {
        candidates = fullBank.filter((q) => !selectedIds.has(q.id));
      }

      if (!isDedicated100Cycle) {
        const targetLevel = Math.min(15, i + 1);
        const levelMatches = candidates.filter((q) => q.level === targetLevel);
        if (levelMatches.length > 0) {
          candidates = levelMatches;
        }
      }

      const nonSameTopic = candidates.filter((q) => this.getTopicKey(q) !== prevTopic);
      const activePool = nonSameTopic.length > 0 ? nonSameTopic : candidates;

      const idx = Math.abs(seed + i * 997) % activePool.length;
      const chosen = activePool[idx];
      selected.push(chosen);
      selectedIds.add(chosen.id);
      prevTopic = this.getTopicKey(chosen);
    }

    return selected;
  }
}

export const questionTracker = new QuestionTracker();
