export interface BadgeDefinition {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  icon: string;
  section: 'classic' | '1v1' | '4player' | 'tournament' | 'daily';
  sectionLabelAr: string;
  sectionLabelEn: string;
  giftPoints: number;
}

export interface UnlockedBadgeRecord {
  unlockedAt: number;
  giftPoints: number;
}

export interface RewardsStats {
  classicCorrectTotal: number;
  classicBestStreak: number;
  classicWins: number;
  duelPlayed: number;
  duelWins: number;
  groupPlayed: number;
  groupWins: number;
  tournamentPlayed: number;
  lastDailyGiftAt: number;
}

export interface RewardsState {
  unlocked: Record<string, UnlockedBadgeRecord>;
  stats: RewardsStats;
}

export interface NewlyUnlockedReward {
  badge: BadgeDefinition;
  giftPoints: number;
}

const REWARDS_STORAGE_KEY = 'millionaire_badges_gifts_v1';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'daily_gift',
    titleAr: 'صندوق الهدية اليومية',
    titleEn: 'Daily Gift Chest',
    descAr: 'هدية تشجيعية متجددة كل 24 ساعة لدعم نقاطك في جميع الأقسام',
    descEn: 'Daily encouragement gift box to boost your points across all modes',
    icon: '🎁',
    section: 'daily',
    sectionLabelAr: 'هدية يومية',
    sectionLabelEn: 'Daily Gift',
    giftPoints: 30,
  },
  {
    id: 'classic_first_correct',
    titleAr: 'بداية الأبطال',
    titleEn: 'Hero Start',
    descAr: 'تحقيق أول إجابة صحيحة في تحدي الكمبيوتر',
    descEn: 'Answer your first question correctly vs Computer',
    icon: '🌟',
    section: 'classic',
    sectionLabelAr: 'مع الكمبيوتر',
    sectionLabelEn: 'Classic',
    giftPoints: 15,
  },
  {
    id: 'classic_streak_5',
    titleAr: 'سلسلة نارية (5)',
    titleEn: 'Fire Streak (5)',
    descAr: '5 إجابات صحيحة متتالية بدون خطأ في التحدي الفردي',
    descEn: '5 consecutive correct answers without mistake',
    icon: '🔥',
    section: 'classic',
    sectionLabelAr: 'مع الكمبيوتر',
    sectionLabelEn: 'Classic',
    giftPoints: 25,
  },
  {
    id: 'classic_milestone_10',
    titleAr: 'عبقري الاستوديو',
    titleEn: 'Studio Genius',
    descAr: 'الوصول للمستوى العاشر في تحدي الكمبيوتر',
    descEn: 'Reach Level 10 in Classic mode',
    icon: '🧠',
    section: 'classic',
    sectionLabelAr: 'مع الكمبيوتر',
    sectionLabelEn: 'Classic',
    giftPoints: 40,
  },
  {
    id: 'classic_jackpot',
    titleAr: 'بطل القمة',
    titleEn: 'Summit Champion',
    descAr: 'الفوز بالجائزة الكبرى وإتمام الـ 15 سؤالاً',
    descEn: 'Complete all 15 questions and win the Grand Prize',
    icon: '👑',
    section: 'classic',
    sectionLabelAr: 'مع الكمبيوتر',
    sectionLabelEn: 'Classic',
    giftPoints: 100,
  },
  {
    id: 'duel_participant',
    titleAr: 'فارس المبارزة',
    titleEn: 'Duel Knight',
    descAr: 'خوض أول تحدي ثنائي مباشر بالكود مع صديق',
    descEn: 'Play your first 1v1 Friend Duel match',
    icon: '⚔️',
    section: '1v1',
    sectionLabelAr: 'اللعب الثنائي',
    sectionLabelEn: '1v1 Duel',
    giftPoints: 25,
  },
  {
    id: 'duel_champion',
    titleAr: 'بطل التحدي الثنائي',
    titleEn: '1v1 Duel Champion',
    descAr: 'تحقيق الفوز بالمركز الأول في التحدي الثنائي',
    descEn: 'Win 1st place in a 1v1 Friend Duel',
    icon: '🥇',
    section: '1v1',
    sectionLabelAr: 'اللعب الثنائي',
    sectionLabelEn: '1v1 Duel',
    giftPoints: 50,
  },
  {
    id: 'group_star',
    titleAr: 'نجم الحلبة الجماعية',
    titleEn: '4P Arena Star',
    descAr: 'المشاركة في تحدي 4 لاعبين أونلاين حول العالم',
    descEn: 'Compete in the 4-Player Online Worldwide Arena',
    icon: '🌍',
    section: '4player',
    sectionLabelAr: 'اللعب الجماعي',
    sectionLabelEn: '4-Player',
    giftPoints: 25,
  },
  {
    id: 'group_king',
    titleAr: 'ملك الساحة الجماعية',
    titleEn: '4P Arena King',
    descAr: 'تحقيق المركز الأول في تحدي الـ 4 لاعبين',
    descEn: 'Win 1st place in a 4-Player Arena match',
    icon: '🏆',
    section: '4player',
    sectionLabelAr: 'اللعب الجماعي',
    sectionLabelEn: '4-Player',
    giftPoints: 75,
  },
  {
    id: 'tournament_hero',
    titleAr: 'بطل الـ 72 ساعة',
    titleEn: '72h Cup Hero',
    descAr: 'المشاركة في بطولة الـ 72 ساعة الدورية',
    descEn: 'Enter and compete in the 72-Hour Championship',
    icon: '🎖️',
    section: 'tournament',
    sectionLabelAr: 'البطولة',
    sectionLabelEn: 'Tournament',
    giftPoints: 50,
  },
];

const DEFAULT_STATE: RewardsState = {
  unlocked: {},
  stats: {
    classicCorrectTotal: 0,
    classicBestStreak: 0,
    classicWins: 0,
    duelPlayed: 0,
    duelWins: 0,
    groupPlayed: 0,
    groupWins: 0,
    tournamentPlayed: 0,
    lastDailyGiftAt: 0,
  },
};

class RewardsService {
  private state: RewardsState = DEFAULT_STATE;
  private listeners = new Set<(state: RewardsState) => void>();

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(REWARDS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          this.state = {
            unlocked: parsed.unlocked || {},
            stats: { ...DEFAULT_STATE.stats, ...(parsed.stats || {}) },
          };
        }
      }
    } catch {
      this.state = { ...DEFAULT_STATE };
    }
  }

  private save() {
    try {
      localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(this.state));
    } catch {}
    this.listeners.forEach((cb) => {
      try {
        cb(this.getState());
      } catch {}
    });
  }

  public getState(): RewardsState {
    return {
      unlocked: { ...this.state.unlocked },
      stats: { ...this.state.stats },
    };
  }

  public subscribe(cb: (state: RewardsState) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  public canClaimDailyGift(): boolean {
    const dayMs = 24 * 60 * 60 * 1000;
    return Date.now() - (this.state.stats.lastDailyGiftAt || 0) >= dayMs;
  }

  public claimDailyGift(): NewlyUnlockedReward | null {
    if (!this.canClaimDailyGift()) return null;
    const def = BADGE_DEFINITIONS.find((b) => b.id === 'daily_gift')!;
    this.state.stats.lastDailyGiftAt = Date.now();
    this.state.unlocked['daily_gift'] = {
      unlockedAt: Date.now(),
      giftPoints: def.giftPoints,
    };
    this.save();
    return { badge: def, giftPoints: def.giftPoints };
  }

  private unlockBadge(badgeId: string): NewlyUnlockedReward | null {
    if (this.state.unlocked[badgeId]) return null;
    const def = BADGE_DEFINITIONS.find((b) => b.id === badgeId);
    if (!def) return null;
    this.state.unlocked[badgeId] = {
      unlockedAt: Date.now(),
      giftPoints: def.giftPoints,
    };
    return { badge: def, giftPoints: def.giftPoints };
  }

  public recordClassicProgress(opts: {
    correctCount: number;
    currentLevel: number;
    isVictory?: boolean;
    isTournament?: boolean;
  }): NewlyUnlockedReward[] {
    const awards: NewlyUnlockedReward[] = [];
    this.state.stats.classicCorrectTotal += 1;
    if (opts.correctCount > this.state.stats.classicBestStreak) {
      this.state.stats.classicBestStreak = opts.correctCount;
    }

    const r1 = this.unlockBadge('classic_first_correct');
    if (r1) awards.push(r1);

    if (opts.correctCount >= 5) {
      const r2 = this.unlockBadge('classic_streak_5');
      if (r2) awards.push(r2);
    }
    if (opts.currentLevel >= 10) {
      const r3 = this.unlockBadge('classic_milestone_10');
      if (r3) awards.push(r3);
    }
    if (opts.isVictory) {
      this.state.stats.classicWins += 1;
      const r4 = this.unlockBadge('classic_jackpot');
      if (r4) awards.push(r4);
    }
    if (opts.isTournament) {
      this.state.stats.tournamentPlayed += 1;
      const r5 = this.unlockBadge('tournament_hero');
      if (r5) awards.push(r5);
    }

    this.save();
    return awards;
  }

  public recordMultiplayerResult(opts: {
    mode: '1v1_friend' | '4player';
    isWinner: boolean;
  }): NewlyUnlockedReward[] {
    const awards: NewlyUnlockedReward[] = [];
    if (opts.mode === '1v1_friend') {
      this.state.stats.duelPlayed += 1;
      const r1 = this.unlockBadge('duel_participant');
      if (r1) awards.push(r1);
      if (opts.isWinner) {
        this.state.stats.duelWins += 1;
        const r2 = this.unlockBadge('duel_champion');
        if (r2) awards.push(r2);
      }
    } else {
      this.state.stats.groupPlayed += 1;
      const r1 = this.unlockBadge('group_star');
      if (r1) awards.push(r1);
      if (opts.isWinner) {
        this.state.stats.groupWins += 1;
        const r2 = this.unlockBadge('group_king');
        if (r2) awards.push(r2);
      }
    }

    this.save();
    return awards;
  }

  public getUnlockedCount(): number {
    return Object.keys(this.state.unlocked).length;
  }
}

export const rewardsService = new RewardsService();
