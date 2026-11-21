export type Language = 'ar' | 'en';

export type QuestionCategory =
  | 'sports'
  | 'cinema'
  | 'islamic'
  | 'general';

export interface Question {
  id: string;
  level: number; // 1 to 15
  questionAr: string;
  questionEn: string;
  optionsAr: [string, string, string, string];
  optionsEn: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  category: QuestionCategory;
  topic?: string;
  explanationAr: string;
  explanationEn: string;
}

export interface LadderTier {
  step: number;
  amount: number;
  isMilestone: boolean;
  label: string;
}

export type LifelineType = 'fiftyFifty' | 'askAudience' | 'phoneFriend' | 'switchQuestion';

export interface LifelinesState {
  fiftyFifty: boolean; // true if available, false if used
  askAudience: boolean;
  phoneFriend: boolean;
  switchQuestion: boolean;
}

export interface AudienceVoteResult {
  percentages: [number, number, number, number];
}

export interface PhoneFriendResult {
  friendName: string;
  avatar: string;
  confidence: number;
  suggestedIndex: number;
  messageAr: string;
  messageEn: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  time: string;
  isSystem?: boolean;
  deleted?: boolean;
}

export type DuelRole = 'player1_host' | 'player2_guest' | 'player3_guest' | 'player4_guest';

export interface DuelAnswer {
  optionIndex: number;
  responseTime: number;
  timestamp: number;
}

export interface DuelPlayer {
  id: string;
  name: string;
  avatar: string;
  country: string;
  role: DuelRole;
  score: number;
  isBot: boolean;
  status: 'idle' | 'reading' | 'thinking' | 'answered' | 'eliminated';
  hasAnswered?: boolean;
  selectedOption?: number;
}

export interface MultiplayerContestant {
  id: string;
  name: string;
  avatar: string;
  isHost?: boolean;
  isBot?: boolean;
  isMe?: boolean;
  role?: DuelRole;
  country?: string;
  currentStep: number;
  score: number;
  status: 'idle' | 'reading' | 'thinking' | 'answered' | 'eliminated';
  selectedOption?: number;
  isCorrect?: boolean;
  responseTime?: number; // seconds
}

export type GameMode = 'classic' | 'multiplayer4' | 'questionsBrowser';

export type GameStatus =
  | 'lobby'
  | 'intro'
  | 'playing'
  | 'selected'
  | 'revealed'
  | 'walkaway'
  | 'gameover'
  | 'victory';

export interface UserProfile {
  name: string;
  avatar: string;
  gender: 'male' | 'female' | 'unspecified';
  birthDate: string; // YYYY-MM-DD
  country?: string;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'المتسابق الذهبي',
  avatar: '👑',
  gender: 'male',
  birthDate: '2000-01-01',
  country: '🇸🇦 السعودية',
};

