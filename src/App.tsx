import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Sparkles,
  Play,
  Volume2,
  Users,
  ShieldCheck,
  Award,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Clock,
  Menu,
  Music,
  Globe,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Zap,
  Share2,
  PhoneOff,
  Award as AwardIcon,
  Gift,
  RefreshCw,
  WifiOff,
} from 'lucide-react';
import {
  Question,
  Language,
  GameMode,
  GameStatus,
  LifelinesState,
  AudienceVoteResult,
  PhoneFriendResult,
  UserProfile,
  DEFAULT_USER_PROFILE,
} from './types/game';
import { QUESTIONS_BANK, getRandomQuestionByLevel } from './data/questions';
import { LADDER, MAX_LADDER_STEP, formatCurrency } from './data/ladder';
import { sounds } from './utils/soundEffects';
import { questionTracker } from './utils/questionTracker';

// Components
import { GameHeader } from './components/GameHeader';
import { QuestionCard } from './components/QuestionCard';
import { LadderPanel } from './components/LadderPanel';
import { LifelinesBar } from './components/LifelinesBar';
import { AudiencePollModal } from './components/AudiencePollModal';
import { PhoneFriendModal } from './components/PhoneFriendModal';
import { AudioSettingsModal } from './components/AudioSettingsModal';
import { QuestionsBrowserModal } from './components/QuestionsBrowserModal';
import { MultiplayerArena } from './components/MultiplayerArena';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { AppCreatorModal } from './components/AppCreatorModal';
import { StudioSpotlights } from './components/StudioSpotlights';
import { RevivalModal } from './components/RevivalModal';
import { TournamentModal } from './components/TournamentModal';
import { UserProfileModal } from './components/UserProfileModal';
import { LiveCallDock } from './components/LiveCallDock';
import { RoomsCallModal } from './components/RoomsCallModal';
import { BadgesModal } from './components/BadgesModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { MicPermissionsModal } from './components/MicPermissionsModal';
import { speechService } from './utils/speechService';
import { rewardsService, NewlyUnlockedReward } from './services/rewardsService';
import {
  generatePrivateRoomCode,
  normalizePrivateRoomCode,
  rtcCallManager,
} from './services/rtcCallManager';

const CLASSIC_CATEGORIES: { key: string; ar: string; en: string; icon: string }[] = [
  { key: 'all', ar: 'شامل (الكل)', en: 'All', icon: '🌟' },
  { key: 'islamic', ar: 'ديني وإسلامي', en: 'Islamic', icon: '🕌' },
  { key: 'entertainment', ar: 'أفلام ومسلسلات', en: 'Movies & Series', icon: '🎬' },
];

const INITIAL_LIFELINES: LifelinesState = {
  fiftyFifty: true,
  askAudience: true,
  phoneFriend: true,
  switchQuestion: true,
};

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [gameStatus, setGameStatus] = useState<GameStatus>('lobby');

  // Shared Link auto-detect (when opened via shared URL from phone 1 to phone 2)
  const [incomingRoomCode, setIncomingRoomCode] = useState<string | undefined>(undefined);
  const [incomingCategory, setIncomingCategory] = useState<string | undefined>(undefined);

  // Classic Game State
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<Question>(() => getRandomQuestionByLevel(1));
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [lifelines, setLifelines] = useState<LifelinesState>(INITIAL_LIFELINES);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [isMobileLadderOpen, setIsMobileLadderOpen] = useState<boolean>(false);

  // Local points system saved to localStorage (every player starts with 150 points only)
  const [userPoints, setUserPoints] = useState<number>(() => {
    try {
      const migrated = localStorage.getItem('millionaire_points_v150_applied');
      if (!migrated) {
        localStorage.setItem('millionaire_points_v150_applied', '1');
        localStorage.setItem('millionaire_player_points', '150');
        return 150;
      }
      const saved = localStorage.getItem('millionaire_player_points');
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 0) return parsed;
      }
    } catch {}
    return 150;
  });

  // Track used question IDs in current session to guarantee zero repetition from the 1,500 questions
  const sessionUsedQuestionIds = useRef<Set<string>>(new Set());

  // Score tracking across all 15 questions
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [wrongAnswersCount, setWrongAnswersCount] = useState<number>(0);
  const [autoReviveMessage, setAutoReviveMessage] = useState<string | null>(null);
  const autoNextTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Intro music state
  const [isIntroMusicPlaying, setIsIntroMusicPlaying] = useState<boolean>(false);

  // Modals state
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isQuestionsBrowserOpen, setIsQuestionsBrowserOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isAppCreatorModalOpen, setIsAppCreatorModalOpen] = useState(false);
  const [pendingMultiplayerEntry, setPendingMultiplayerEntry] = useState<{
    matchType: '1v1_friend' | '4player';
    roomCode?: string;
    category?: string;
  } | null>(null);
  const [isRevivalModalOpen, setIsRevivalModalOpen] = useState(false);
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
  const [isTournamentMode, setIsTournamentMode] = useState(false);
  const [multiplayerMatchType, setMultiplayerMatchType] = useState<'1v1_friend' | '4player' | 'custom_room' | 'world_live'>('1v1_friend');
  const [audienceResult, setAudienceResult] = useState<AudienceVoteResult | null>(null);
  const [phoneResult, setPhoneResult] = useState<PhoneFriendResult | null>(null);

  // User Profile (الملف الشخصي)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const raw = localStorage.getItem('millionaire_user_profile');
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_USER_PROFILE;
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Private Call Room State (4-digit PIN only, no PRIV- prefix)
  const [isRoomsModalOpen, setIsRoomsModalOpen] = useState(false);
  const [roomsModalTab, setRoomsModalTab] = useState<'public' | 'private'>('private');
  const [privateRoomId, setPrivateRoomId] = useState<string>(() => generatePrivateRoomCode());
  const [activeCallRoomId, setActiveCallRoomId] = useState<string>('');

  const [classicCategory, setClassicCategory] = useState<string>('all');
  const [lossReason, setLossReason] = useState<string | null>(null);
  const [rtcInCall, setRtcInCall] = useState<boolean>(() => rtcCallManager.getSnapshot().inCall);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState<boolean>(false);
  const [badgesCount, setBadgesCount] = useState<number>(() => rewardsService.getUnlockedCount());
  const [hasDailyGift, setHasDailyGift] = useState<boolean>(() => rewardsService.canClaimDailyGift());
  const [rewardToast, setRewardToast] = useState<{ title: string; points: number; icon: string } | null>(null);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState<boolean>(false);
  const [isCheckingOnline, setIsCheckingOnline] = useState<boolean>(false);

  // Sound settings
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Requirement 7: Stop all background processes (TTS, tension sounds) on exit/tab switch
  useEffect(() => {
    const handleStopProcesses = () => {
      speechService.stop();
      sounds.stopTensionAmbience();
      sounds.stopIntroTheme();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleStopProcesses();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handleStopProcesses);
    window.addEventListener('beforeunload', handleStopProcesses);

    const unsubscribeSpeech = speechService.subscribe((status) => {
      setIsSpeaking(status.isSpeaking);
    });

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleStopProcesses);
      window.removeEventListener('beforeunload', handleStopProcesses);
      unsubscribeSpeech();
      handleStopProcesses();
    };
  }, []);

  // Save points to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('millionaire_player_points', userPoints.toString());
    } catch {}
  }, [userPoints]);

  // Sync profile with rtcCallManager & pause active questions whenever a call is active
  useEffect(() => {
    rtcCallManager.setProfile(userProfile.name, userProfile.avatar);
  }, [userProfile]);

  useEffect(() => {
    return rtcCallManager.subscribe((snap) => {
      setRtcInCall(snap.inCall);
      if (snap.inCall) {
        speechService.stop();
        sounds.stopTensionAmbience();
        setIsTimerActive(false);
      }
    });
  }, []);

  useEffect(() => {
    return rewardsService.subscribe(() => {
      setBadgesCount(rewardsService.getUnlockedCount());
      setHasDailyGift(rewardsService.canClaimDailyGift());
    });
  }, []);

  const triggerRewardsToast = (awards: NewlyUnlockedReward[]) => {
    if (!awards || awards.length === 0) return;
    let totalBonus = 0;
    awards.forEach((a) => {
      totalBonus += a.giftPoints;
    });
    if (totalBonus > 0) {
      setUserPoints((prev) => prev + totalBonus);
    }
    const first = awards[0];
    sounds.playMilestoneWin();
    setRewardToast({
      icon: first.badge.icon,
      title: lang === 'ar'
        ? `🎉 وسام جديد: ${first.badge.titleAr}`
        : `🎉 New Badge: ${first.badge.titleEn}`,
      points: totalBonus,
    });
    setTimeout(() => setRewardToast(null), 4500);
  };

  // Detect URL shared room params (?room=M-1234&cat=islamic&lang=en or ?privateRoom=8202)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      let urlRoom = params.get('room');
      let urlPrivateRoom = params.get('privateRoom');
      const urlCat = params.get('cat');
      const urlLang = params.get('lang');

      if (!urlRoom) {
        const href = window.location.href || '';
        const match = href.match(/[?&]room=([A-Za-z0-9_-]+)/i);
        if (match && match[1]) urlRoom = match[1];
      }
      if (!urlPrivateRoom) {
        const href = window.location.href || '';
        const matchPriv = href.match(/[?&]privateRoom=([A-Za-z0-9_-]+)/i);
        if (matchPriv && matchPriv[1]) urlPrivateRoom = matchPriv[1];
      }

      if (urlLang === 'en' || urlLang === 'ar') {
        setLang(urlLang);
      }

      if (urlPrivateRoom) {
        const cleanPriv = normalizePrivateRoomCode(urlPrivateRoom);
        if (cleanPriv.length === 4) {
          void verifyInternetBeforeOnline(() => {
            setPrivateRoomId(cleanPriv);
            setActiveCallRoomId(cleanPriv);
            setRoomsModalTab('private');
            setIsRoomsModalOpen(true);
          });
        }
      } else if (urlRoom) {
        void verifyInternetBeforeOnline(() => {
          sounds.stopIntroTheme();
          sounds.stopTensionAmbience();
          setIsIntroMusicPlaying(false);
          setPendingMultiplayerEntry({
            matchType: '1v1_friend',
            roomCode: urlRoom || undefined,
            category: urlCat || undefined,
          });
        });
      }
    } catch {}
  }, []);

  // Set document dir when language changes
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Only check internet connectivity when the player explicitly chooses Online / 1v1 Duel / Call Room.
  // Never runs on app open, Home Lobby, or "Play vs Computer".
  const verifyInternetBeforeOnline = async (onOnline: () => void) => {
    if (isCheckingOnline) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setIsOfflineModalOpen(true);
      return;
    }
    setIsCheckingOnline(true);
    try {
      const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timer = ctrl ? setTimeout(() => ctrl.abort(), 2500) : null;
      const res = await fetch(`/api/app-meta?ping=1&t=${Date.now()}`, {
        cache: 'no-store',
        signal: ctrl?.signal,
      });
      if (timer) clearTimeout(timer);
      if (!res.ok) {
        setIsOfflineModalOpen(true);
        return;
      }
      onOnline();
    } catch {
      setIsOfflineModalOpen(true);
    } finally {
      setIsCheckingOnline(false);
    }
  };

  // Start enthusiastic intro music ONLY in Classic Lobby (never inside multiplayer/call rooms)
  useEffect(() => {
    if (gameMode !== 'classic' || gameStatus !== 'lobby' || pendingMultiplayerEntry || isRoomsModalOpen) {
      sounds.stopIntroTheme();
      setIsIntroMusicPlaying(false);
      return;
    }

    const playIntro = () => {
      if (!sounds.getMuted() && gameStatus === 'lobby' && gameMode === 'classic' && !pendingMultiplayerEntry && !isRoomsModalOpen) {
        try {
          sounds.playGrandIntroTheme();
          setIsIntroMusicPlaying(true);
        } catch {}
      }
    };

    // Attempt direct autoplay on mount
    playIntro();

    // Fallback for browsers/WebViews that enforce user interaction before AudioContext
    const handleFirstUserInteraction = () => {
      playIntro();
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
    };

    window.addEventListener('click', handleFirstUserInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstUserInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
    };
  }, [gameStatus, gameMode, pendingMultiplayerEntry, isRoomsModalOpen]);

  // Toggle Intro Theme Music
  const handleToggleIntroMusic = () => {
    if (isIntroMusicPlaying) {
      sounds.stopIntroTheme();
      setIsIntroMusicPlaying(false);
    } else {
      sounds.playGrandIntroTheme();
      setIsIntroMusicPlaying(true);
    }
  };

  // Audio mute handler
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.setMuted(next);
    if (next) {
      sounds.stopIntroTheme();
      setIsIntroMusicPlaying(false);
    }
  };

  // Start new Classic Game in chosen language & chosen category - guaranteed different questions on restart
  const startClassicGame = (chosenLang: Language = lang, isTournament = false, overrideCategory?: string) => {
    sounds.stopIntroTheme();
    setIsIntroMusicPlaying(false);
    speechService.prime();
    sounds.playQuestionIntro();

    const activeCat = overrideCategory || classicCategory || 'all';
    if (chosenLang !== lang) {
      setLang(chosenLang);
    }
    setIsTournamentMode(isTournament);
    setLossReason(null);

    sessionUsedQuestionIds.current.clear();
    const q1 = questionTracker.getClassicQuestion(1, sessionUsedQuestionIds.current, activeCat);
    sessionUsedQuestionIds.current.add(q1.id);

    setCurrentLevel(1);
    setCurrentQuestion(q1);
    setSelectedOption(null);
    setEliminatedOptions([]);
    setLifelines(INITIAL_LIFELINES);
    setTimeLeft(45);
    setCorrectAnswersCount(0);
    setWrongAnswersCount(0);
    setAutoReviveMessage(null);
    setIsRevivalModalOpen(false);
    setGameStatus('playing');
    sounds.startTensionAmbience(1);

    if (rtcCallManager.getSnapshot().inCall) {
      setIsTimerActive(false);
      return;
    }

    // TTS & Timer Sync: Pause timer while narrator speaks
    if (speechService.getAutoRead()) {
      setIsTimerActive(false);
      speechService.speakQuestionAndOptions(q1, chosenLang, 1, () => {
        if (!rtcCallManager.getSnapshot().inCall) {
          setIsTimerActive(true);
        }
      });
      setTimeout(() => {
        if (!rtcCallManager.getSnapshot().inCall) {
          setIsTimerActive(true);
        }
      }, 12000);
    } else {
      setIsTimerActive(true);
    }
  };

  // Timer loop for classic game (strictly paused while in a call)
  useEffect(() => {
    if (!isTimerActive || gameStatus !== 'playing' || rtcInCall) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeExpired();
          return 0;
        }
        if (prev <= 8) {
          sounds.playClockTick(true);
        } else if (prev % 5 === 0) {
          sounds.playHeartbeat(1.1);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerActive, gameStatus, currentLevel, rtcInCall]);

  // Time expired handler: continuation strictly requires 50 points; otherwise player loses immediately
  const handleTimeExpired = () => {
    speechService.stop();
    setIsTimerActive(false);
    sounds.stopTensionAmbience();
    sounds.playWrong();
    setWrongAnswersCount((prev) => prev + 1);

    if (userPoints < 50) {
      setLossReason(
        lang === 'ar'
          ? 'انتهى الوقت وليس لديك 50 نقطة لإجابة السؤال ومواصلة اللعب!'
          : 'Time expired and you have less than 50 points to continue!'
      );
      setGameStatus('gameover');
      return;
    }

    setIsRevivalModalOpen(true);
  };

  // Select Option and Lock in immediately
  const handleSelectOption = (index: number) => {
    if (selectedOption !== null || gameStatus !== 'playing' || rtcInCall) return;

    speechService.stop();
    sounds.playSelectAnswer();
    setSelectedOption(index);
    setIsTimerActive(false);
    setGameStatus('selected');

    setTimeout(() => {
      revealAnswer(index);
    }, 1400);
  };

  // Reveal Answer Logic:
  // - Never delete options automatically on wrong answer!
  // - Answering/passing the question costs 50 points (or invoking an unused lifeline).
  // - If neither unused lifeline nor 50 points exists, player loses immediately!
  const revealAnswer = (chosenIndex: number) => {
    setGameStatus('revealed');
    sounds.stopTensionAmbience();

    const isCorrect = chosenIndex === currentQuestion.correctIndex;

    if (isCorrect) {
      const nextCorrect = correctAnswersCount + 1;
      setCorrectAnswersCount(nextCorrect);

      const pointsEarned = 50;
      setUserPoints((prev) => prev + pointsEarned);

      const newAwards = rewardsService.recordClassicProgress({
        correctCount: nextCorrect,
        currentLevel,
        isVictory: currentLevel === MAX_LADDER_STEP,
        isTournament: isTournamentMode,
      });
      if (newAwards.length > 0) {
        triggerRewardsToast(newAwards);
      }

      if (currentLevel === MAX_LADDER_STEP) {
        sounds.playJackpotWin();
        setGameStatus('victory');
        try {
          confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.5 },
          });
        } catch {}
      } else {
        if (currentLevel % 10 === 0) {
          sounds.playMilestoneWin();
        } else {
          sounds.playCorrect();
        }

        autoNextTimeoutRef.current = setTimeout(() => {
          handleNextQuestion();
        }, 1500);
      }
    } else {
      setWrongAnswersCount((prev) => prev + 1);
      sounds.playWrong();

      setTimeout(() => {
        if (userPoints < 50) {
          setLossReason(
            lang === 'ar'
              ? 'إجابة غير صحيحة! خسرت المحاولة لعدم توفر 50 نقطة لإجابة السؤال ومواصلة اللعب.'
              : 'Wrong answer! You lost because you do not have 50 points to continue.'
          );
          setGameStatus('gameover');
        } else {
          setIsRevivalModalOpen(true);
        }
      }, 950);
    }
  };

  // Option 1 in RevivalModal: Answer/Solve current question for 50 points and advance cleanly
  const handleReviveWithPoints = () => {
    if (userPoints < 50) return;
    setUserPoints((prev) => Math.max(0, prev - 50));
    setIsRevivalModalOpen(false);
    sounds.playCorrect();
    setAutoReviveMessage(
      lang === 'ar'
        ? '✅ تم استخدام 50 نقطة لإجابة السؤال ومواصلة التقدم للسؤال التالي!'
        : '✅ Spent 50 points to solve the question and continue to the next level!'
    );
    setTimeout(() => setAutoReviveMessage(null), 3500);

    if (currentLevel >= MAX_LADDER_STEP) {
      setGameStatus('victory');
      sounds.playJackpotWin();
      return;
    }
    handleNextQuestion();
  };

  // Advance to Next Question with Guaranteed Zero Repetition & Category Filter
  const handleNextQuestion = () => {
    speechService.stop();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (autoNextTimeoutRef.current) {
      clearTimeout(autoNextTimeoutRef.current);
      autoNextTimeoutRef.current = null;
    }

    if (currentLevel >= MAX_LADDER_STEP) {
      setGameStatus(correctAnswersCount >= Math.floor(MAX_LADDER_STEP * 0.5) ? 'victory' : 'gameover');
      return;
    }

    const nextLvl = currentLevel + 1;
    sounds.playQuestionIntro();
    sounds.startTensionAmbience(nextLvl);

    const nextQ = questionTracker.getClassicQuestion(nextLvl, sessionUsedQuestionIds.current, classicCategory);
    sessionUsedQuestionIds.current.add(nextQ.id);

    setCurrentLevel(nextLvl);
    setCurrentQuestion(nextQ);
    setSelectedOption(null);
    setEliminatedOptions([]);
    setTimeLeft(45);
    setGameStatus('playing');

    if (rtcCallManager.getSnapshot().inCall) {
      setIsTimerActive(false);
      return;
    }

    if (speechService.getAutoRead()) {
      setIsTimerActive(false);
      speechService.speakQuestionAndOptions(nextQ, lang, nextLvl, () => {
        if (!rtcCallManager.getSnapshot().inCall) setIsTimerActive(true);
      });
      setTimeout(() => {
        if (!rtcCallManager.getSnapshot().inCall) setIsTimerActive(true);
      }, 12000);
    } else {
      setIsTimerActive(true);
    }
  };

  // Walk Away Handler
  const handleWalkAway = () => {
    speechService.stop();
    if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
    sounds.stopTensionAmbience();
    sounds.playSelectAnswer();
    setGameStatus('walkaway');
  };

  // Lifelines (only way options are eliminated during gameplay)
  const handleFiftyFifty = () => {
    const correctIdx = currentQuestion.correctIndex;
    const wrongIndices = [0, 1, 2, 3].filter((i) => i !== correctIdx);
    const shuffledWrong = wrongIndices.sort(() => Math.random() - 0.5);
    const toEliminate = shuffledWrong.slice(0, 2);

    setEliminatedOptions(toEliminate);
    setLifelines((prev) => ({ ...prev, fiftyFifty: false }));
  };

  const handleAskAudience = () => {
    const correctIdx = currentQuestion.correctIndex;
    const accuracy = Math.max(45, Math.round(88 - (currentLevel / MAX_LADDER_STEP) * 43));
    const remaining = 100 - accuracy;

    const p1 = Math.floor(remaining * 0.5);
    const p2 = Math.floor(remaining * 0.3);
    const p3 = remaining - p1 - p2;

    const distribution: [number, number, number, number] = [0, 0, 0, 0];
    distribution[correctIdx] = accuracy;

    const wrongSlots = [0, 1, 2, 3].filter((i) => i !== correctIdx);
    distribution[wrongSlots[0]] = p1;
    distribution[wrongSlots[1]] = p2;
    distribution[wrongSlots[2]] = p3;

    setAudienceResult({ percentages: distribution });
    setLifelines((prev) => ({ ...prev, askAudience: false }));
  };

  const handlePhoneFriend = () => {
    const friends = [
      { name: 'د. وسيم الباحث', avatar: '👨‍🏫', confidence: Math.max(60, Math.round(95 - (currentLevel / MAX_LADDER_STEP) * 35)) },
      { name: 'المهندسة ريم', avatar: '👩‍💻', confidence: Math.max(55, Math.round(90 - (currentLevel / MAX_LADDER_STEP) * 35)) },
      { name: 'الأستاذ سامي', avatar: '🧑‍🏫', confidence: Math.max(50, Math.round(85 - (currentLevel / MAX_LADDER_STEP) * 35)) },
    ];
    const pickedFriend = friends[Math.floor(Math.random() * friends.length)];
    const correctIdx = currentQuestion.correctIndex;

    const letterLabelsAr = ['أ', 'ب', 'ج', 'د'];
    const letterLabelsEn = ['A', 'B', 'C', 'D'];
    const choiceNameAr = currentQuestion.optionsAr[correctIdx];
    const choiceNameEn = currentQuestion.optionsEn[correctIdx];

    const result: PhoneFriendResult = {
      friendName: pickedFriend.name,
      avatar: pickedFriend.avatar,
      confidence: pickedFriend.confidence,
      suggestedIndex: correctIdx,
      messageAr: `أهلاً بك! أنا واثق بنسبة ${pickedFriend.confidence}% أن الإجابة الصحيحة هي (${letterLabelsAr[correctIdx]}: ${choiceNameAr})، بالتوفيق!`,
      messageEn: `Hello! I am about ${pickedFriend.confidence}% confident that the correct answer is (${letterLabelsEn[correctIdx]}: ${choiceNameEn}). Best of luck!`,
    };

    setPhoneResult(result);
    setLifelines((prev) => ({ ...prev, phoneFriend: false }));
  };

  const handleSwitchQuestion = () => {
    speechService.stop();
    const newQ = questionTracker.getClassicQuestion(currentLevel, sessionUsedQuestionIds.current, classicCategory);
    sessionUsedQuestionIds.current.add(newQ.id);
    setCurrentQuestion(newQ);
    setSelectedOption(null);
    setEliminatedOptions([]);
    setTimeLeft(45);
    setLifelines((prev) => ({ ...prev, switchQuestion: false }));
    if (!rtcCallManager.getSnapshot().inCall) {
      speechService.speakQuestionAndOptions(newQ, lang, currentLevel);
    }
  };

  const handleUseLifeline = (type: keyof LifelinesState) => {
    if (type === 'fiftyFifty') handleFiftyFifty();
    else if (type === 'askAudience') handleAskAudience();
    else if (type === 'phoneFriend') handlePhoneFriend();
    else if (type === 'switchQuestion') handleSwitchQuestion();
  };

  // Instantaneous prize calculation
  const calculateFinalPrize = (): number => {
    if (gameStatus === 'victory') return 1000000;
    if (gameStatus === 'walkaway') {
      const prevStep = currentLevel > 1 ? currentLevel - 1 : 0;
      const tier = LADDER.find((t) => t.step === prevStep);
      return tier ? tier.amount : 0;
    }
    const tier = LADDER[Math.max(0, Math.min(MAX_LADDER_STEP - 1, correctAnswersCount - 1))];
    return tier ? tier.amount : 0;
  };

  const scrollToTopInstant = () => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch {}
    try {
      document.documentElement.scrollTop = 0;
      document.documentElement.scrollLeft = 0;
      document.body.scrollTop = 0;
      document.body.scrollLeft = 0;
    } catch {}
  };

  useEffect(() => {
    scrollToTopInstant();
    const raf = requestAnimationFrame(scrollToTopInstant);
    return () => cancelAnimationFrame(raf);
  }, [gameMode, gameStatus]);

  // Requirement 1 & 8: Global Back to Main Menu Navigation
  const handleBackToMainMenu = () => {
    speechService.stop();
    sounds.stopTensionAmbience();
    sounds.stopIntroTheme();
    if (autoNextTimeoutRef.current) {
      clearTimeout(autoNextTimeoutRef.current);
      autoNextTimeoutRef.current = null;
    }
    setIsTimerActive(false);

    // Close all modals immediately
    setIsAudioModalOpen(false);
    setIsQuestionsBrowserOpen(false);
    setIsPrivacyModalOpen(false);
    setIsAppCreatorModalOpen(false);
    setIsRevivalModalOpen(false);
    setIsTournamentModalOpen(false);
    setIsMobileLadderOpen(false);
    setAudienceResult(null);
    setPhoneResult(null);

    // Cleanly return to main menu lobby and anchor scroll at top
    setGameMode('classic');
    setGameStatus('lobby');
    scrollToTopInstant();
  };

  const finalPrizeAmount = calculateFinalPrize();

  const spotlightMode =
    gameStatus === 'victory'
      ? 'victory'
      : gameStatus === 'gameover'
      ? 'gameover'
      : gameStatus === 'playing' && timeLeft <= 8
      ? 'urgent'
      : gameStatus === 'playing'
      ? 'playing'
      : 'intro';

  return (
    <div className="min-h-screen w-full max-w-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Dynamic TV Studio Lights & Volumetric Spotlights */}
      <StudioSpotlights mode={spotlightMode} />

      {/* Top Bar Header */}
      <GameHeader
        canGoBack={gameMode !== 'classic' || gameStatus !== 'lobby'}
        onBack={handleBackToMainMenu}
        currentMode={gameMode}
        onSelectMode={(mode) => {
          sounds.playSelectAnswer();
          if (mode === 'multiplayer4') {
            speechService.prime();
            void verifyInternetBeforeOnline(() => {
              setMultiplayerMatchType('4player');
              setGameMode('multiplayer4');
            });
          } else {
            setGameMode(mode);
          }
        }}
        lang={lang}
        onToggleLang={() => {
          sounds.playSelectAnswer();
          const nextLang = lang === 'ar' ? 'en' : 'ar';
          setLang(nextLang);
          if (gameStatus === 'playing') {
            speechService.speakQuestionAndOptions(currentQuestion, nextLang, currentLevel);
          }
        }}
        onOpenAudioSettings={() => {
          sounds.playSelectAnswer();
          setIsAudioModalOpen(true);
        }}
        onOpenQuestionBrowser={() => {
          sounds.playSelectAnswer();
          setIsQuestionsBrowserOpen(true);
        }}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        userPoints={userPoints}
        onOpenTournament={() => {
          sounds.playSelectAnswer();
          setIsTournamentModalOpen(true);
        }}
        onOpenAppCreator={() => {
          sounds.playSelectAnswer();
          setIsAppCreatorModalOpen(true);
        }}
        userProfile={userProfile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenBadges={() => {
          sounds.playSelectAnswer();
          setIsBadgesModalOpen(true);
        }}
        badgesCount={badgesCount}
        hasDailyGift={hasDailyGift}
      />

      {/* Celebratory Badge / Encouragement Gift Toast */}
      {rewardToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-2xl border-2 border-white/60 flex items-center gap-2.5 animate-fadeIn">
          <span className="text-xl">{rewardToast.icon}</span>
          <span>{rewardToast.title}</span>
          {rewardToast.points > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 font-mono text-xs">
              +{rewardToast.points} 🪙
            </span>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-6 pt-3 sm:pt-6 pb-8 flex flex-col justify-start relative z-10 overflow-x-hidden">
        {gameMode === 'multiplayer4' ? (
          /* ================= MULTIPLAYER ARENA ================= */
          <MultiplayerArena
            lang={lang}
            onExit={() => {
              setActiveCallRoomId(privateRoomId);
              setGameMode('classic');
              setGameStatus('lobby');
              scrollToTopInstant();
            }}
            initialRoomCode={incomingRoomCode}
            initialCategory={incomingCategory}
            initialMatchType={multiplayerMatchType}
            userPoints={userPoints}
            onSpendPoints={(amt) => setUserPoints((p) => Math.max(0, p - amt))}
            onEarnPoints={(amt) => setUserPoints((p) => p + amt)}
            onRewardsUnlocked={triggerRewardsToast}
            userProfile={userProfile}
            onActiveRoomChange={(code) => setActiveCallRoomId(code || privateRoomId)}
            onOpenPrivateCallRoom={() => {
              void verifyInternetBeforeOnline(() => {
                setRoomsModalTab('private');
                setIsRoomsModalOpen(true);
              });
            }}
          />
        ) : gameStatus === 'lobby' ? (
          /* ================= LOBBY / HERO STAGE ================= */
          <div className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8 py-4 sm:py-6 text-center animate-fadeIn">
            {/* Spotlight Emblem with Playable Music Indicator */}
            <div className="relative inline-block">
              <div
                className="absolute -inset-6 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(245,158,11,0.22) 0%, rgba(245,158,11,0) 70%)',
                }}
              />
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 p-1 shadow-2xl shadow-amber-500/25 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[22px] flex flex-col items-center justify-center text-amber-400">
                  <Trophy className="w-10 h-10 sm:w-12 sm:h-12" />
                </div>
              </div>
            </div>

            {/* Title & Tagline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 tracking-tight">
                {lang === 'ar' ? 'تحدي الابطال :مسابقة لايف' : 'Champions Challenge : Live Quiz'}
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
                {lang === 'ar'
                  ? 'المسابقة الكبرى مع أنوار ومؤثرات الاستوديو التلفزيوني الحقيقية، وقارئ صوتي للأسئلة، وتحديات مباشرة مشوقة.'
                  : 'The premier quiz game featuring real TV studio lights, voice narrator, and dramatic live challenges.'}
              </p>
            </div>

            {/* Powerful Opening Intro Music Control Banner */}
            <div className="max-w-md mx-auto space-y-2.5">
              <button
                onClick={handleToggleIntroMusic}
                className={`w-full py-3 px-5 rounded-2xl border flex items-center justify-center gap-3 transition-colors duration-200 ${
                  isIntroMusicPlaying
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/50'
                    : 'bg-slate-900/95 border-slate-700/80 hover:border-amber-500/60 text-slate-200 hover:text-amber-300 shadow-md'
                }`}
              >
                <Music className={`w-5 h-5 ${isIntroMusicPlaying ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className="font-bold text-xs sm:text-sm">
                  {isIntroMusicPlaying
                    ? (lang === 'ar' ? '🔊 جاري عزف شارة تحدي الأبطال (إيقاف)' : '🔊 Playing Champions Challenge Intro Theme (Stop)')
                    : (lang === 'ar' ? '🎵 تشغيل الشارة الموسيقية القوية (تحدي الأبطال)' : '🎵 Play Grand Intro Music (Champions Challenge)')}
                </span>
              </button>

              {/* Visual Studio Lights & AI Narration Status Badge */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'ar' ? 'أنوار ومؤثرات الاستوديو هادئة ومستقرة' : 'TV Studio Lights Steady'}</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-full">
                  <span>✈️</span>
                  <span>{lang === 'ar' ? 'الأسئلة مخزنة ويعمل بدون نت مع الكمبيوتر' : '300 Questions Stored • Offline vs Computer'}</span>
                </span>
              </div>

              {/* Prominent PWA Offline Install Prompt */}
              <div className="flex justify-center">
                <PWAInstallButton lang={lang} />
              </div>
            </div>

            {/* Mode 1, Mode 2, Mode 3 Action Grid */}
            <div className="max-w-2xl mx-auto space-y-3.5 pt-2">
              {/* MODE 1: اللعب الفردي مع الكمبيوتر */}
              <div className="p-4 bg-slate-900/90 border border-amber-500/40 rounded-2xl shadow-xl text-start space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-amber-300 flex flex-wrap items-center gap-2">
                        <span>{lang === 'ar' ? 'اللعب مع الكمبيوتر' : 'Play vs Computer'}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold">
                          {lang === 'ar' ? '✈️ يعمل بدون نت' : '✈️ Works Offline'}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        {lang === 'ar'
                          ? 'طور اللعب الفردي الكلاسيكي - 100 مرحلة متدرجة (الأسئلة مخزنة بالكامل داخل التطبيق)'
                          : 'Classic single-player mode - 100 consecutive stages stored locally offline'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold shrink-0">
                    {QUESTIONS_BANK.length} Qs
                  </span>
                </div>

                {/* Category Selector for Play vs Computer */}
                <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                  <div className="text-[11px] font-bold text-amber-300 flex items-center justify-between">
                    <span>🎯 {lang === 'ar' ? 'اختر مجال الأسئلة (سلم من 100 مرحلة):' : 'Choose Category (100 Stages):'}</span>
                    <span className="text-slate-400">
                      {CLASSIC_CATEGORIES.find((c) => c.key === classicCategory)?.[lang === 'ar' ? 'ar' : 'en']}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {CLASSIC_CATEGORIES.map((cat) => {
                      const active = classicCategory === cat.key;
                      return (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => {
                            setClassicCategory(cat.key);
                            sounds.playSelectAnswer();
                          }}
                          className={`px-2.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                            active
                              ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-1 ring-amber-400/50'
                              : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span>{cat.icon}</span>
                          <span className="truncate">{lang === 'ar' ? cat.ar : cat.en}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* Start in Arabic */}
                  <button
                    onClick={() => startClassicGame('ar')}
                    className="py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 active:scale-98 text-slate-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
                  >
                    <Play className="w-4 h-4 fill-slate-950 shrink-0" />
                    <span>{lang === 'ar' ? 'ابدأ المسابقة بالعربية' : 'Play in Arabic'}</span>
                    <span className="text-[10px] bg-slate-950/20 px-2 py-0.5 rounded-full font-bold">AR</span>
                  </button>

                  {/* Start in English */}
                  <button
                    onClick={() => startClassicGame('en')}
                    className="py-3 px-4 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-98 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all border border-blue-400/30"
                  >
                    <Globe className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>Play in English</span>
                    <span className="text-[10px] bg-black/25 px-2 py-0.5 rounded-full font-bold">EN</span>
                  </button>
                </div>
              </div>

              {/* MULTIPLAYER MODES (1v1 Friend Duel with 4-Digit PIN Code ONLY & 4-Player Arena) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* MODE: تحدي ثنائي (بالكود فقط 4 أرقام) */}
                <button
                  onClick={() => {
                    sounds.playSelectAnswer();
                    speechService.prime();
                    void verifyInternetBeforeOnline(() => {
                      sounds.stopIntroTheme();
                      sounds.stopTensionAmbience();
                      setIsIntroMusicPlaying(false);
                      setPendingMultiplayerEntry({ matchType: '1v1_friend' });
                    });
                  }}
                  className="p-4 bg-gradient-to-br from-blue-950/70 via-slate-900 to-indigo-950/60 hover:from-blue-900/70 hover:to-indigo-900/70 active:scale-98 text-start rounded-2xl border-2 border-blue-500/50 hover:border-blue-400 transition-all shadow-xl group flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30 font-mono font-black text-sm">
                      #4
                    </div>
                    <div>
                      <div className="font-black text-sm sm:text-base text-blue-200 group-hover:text-blue-100 transition-colors">
                        {lang === 'ar' ? 'تحدي ثنائي (بكود 4 أرقام فقط)' : '1v1 Friend Duel (4-Digit Code)'}
                      </div>
                      <div className="text-[11px] text-blue-300/80">
                        {lang === 'ar' ? 'إنشاء أو دخول مباشر بكود مكون من 4 أرقام بدون روابط' : 'Create or join directly using a 4-digit room code'}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-300/90 bg-slate-950/40 p-2 rounded-xl border border-blue-500/20 leading-relaxed">
                    {lang === 'ar'
                      ? '⚡ كود رقمي فقط • إغلاق فوري عند انسحاب أحد الصديقين • فصل الأسئلة أثناء المكالمات • زر المايك جنب المساعدة'
                      : '⚡ Numeric code only • Instant close on forfeit • Call-safe question pause • Mic next to lifelines'}
                  </div>
                  <div className="text-xs text-blue-400 font-bold flex items-center justify-between pt-1">
                    <span>{lang === 'ar' ? 'دخول التحدي الثنائي ←' : 'Start 1v1 Friend Duel →'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 font-mono">1 VS 1</span>
                  </div>
                </button>

                {/* MODE: تحدي 4 لاعبين أونلاين */}
                <button
                  onClick={() => {
                    sounds.playSelectAnswer();
                    speechService.prime();
                    void verifyInternetBeforeOnline(() => {
                      sounds.stopIntroTheme();
                      sounds.stopTensionAmbience();
                      setIsIntroMusicPlaying(false);
                      setPendingMultiplayerEntry({ matchType: '4player' });
                    });
                  }}
                  className="p-4 bg-gradient-to-br from-purple-950/70 via-slate-900 to-indigo-950/60 hover:from-purple-900/70 hover:to-indigo-900/70 active:scale-98 text-start rounded-2xl border-2 border-purple-500/50 hover:border-purple-400 transition-all shadow-xl group flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 border border-purple-500/30">
                      <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <div className="font-black text-sm sm:text-base text-purple-200 group-hover:text-purple-100 transition-colors">
                        {lang === 'ar' ? 'تحدي 4 لاعبين أونلاين' : '4-Player Online Arena'}
                      </div>
                      <div className="text-[11px] text-purple-300/80">
                        {lang === 'ar' ? 'بحث عالمي لجميع الأجهزة (60 ثانية)' : 'Worldwide multi-device queue (60s)'}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-300/90 bg-slate-950/40 p-2 rounded-xl border border-purple-500/20 leading-relaxed">
                    {lang === 'ar'
                      ? '🌍 استقبال جميع الأجهزة حول العالم • استمرارية التحدي حتى النهاية • تحويل تلقائي للأسئلة'
                      : '🌍 Worldwide device matching • Seamless match continuity • Forced auto-advance'}
                  </div>
                  <div className="text-xs text-purple-300 font-bold flex items-center justify-between pt-1">
                    <span>{lang === 'ar' ? 'دخول حلبة الـ 4 لاعبين ←' : 'Enter 4-Player Arena →'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono">4 PLAYERS</span>
                  </div>
                </button>
              </div>

              {/* Badges & Encouragement Gifts Banner */}
              <div
                onClick={() => {
                  sounds.playSelectAnswer();
                  setIsBadgesModalOpen(true);
                }}
                className="p-3.5 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-amber-950/40 border-2 border-emerald-500/40 hover:border-emerald-400 rounded-2xl shadow-lg cursor-pointer transition-all flex items-center justify-between gap-3 text-start"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-xl shrink-0">
                    🎁
                  </div>
                  <div>
                    <div className="font-black text-sm text-emerald-300 flex items-center gap-2">
                      <span>{lang === 'ar' ? 'الأوسمة والهدايا التشجيعية في كل الأقسام' : 'Badges & Encouragement Gifts'}</span>
                      {hasDailyGift && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black">
                          {lang === 'ar' ? 'هدية جاهزة!' : 'Gift Ready!'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {lang === 'ar'
                        ? 'اجمع الأوسمة والمكافآت الفورية (+15 إلى +100 نقطة) عند الفوز والتقدم في كل الأقسام'
                        : 'Unlock medals and bonus points (+15 to +100 pts) across all game modes'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-300 shrink-0">
                  {badgesCount}/10 🏅
                </span>
              </div>

              {/* 72-HOUR PERIODIC TOURNAMENT BANNER (Every 72 hours recurring) */}
              <div
                onClick={() => {
                  sounds.playSelectAnswer();
                  setIsTournamentModalOpen(true);
                }}
                className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border-2 border-amber-500/50 hover:border-amber-400 rounded-2xl shadow-lg cursor-pointer transition-colors flex items-center justify-between gap-3 text-start group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-md shadow-amber-500/20 shrink-0">
                    <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-amber-400">
                      <Trophy className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-amber-300">
                        {lang === 'ar' ? 'بطولة الـ 72 ساعة الدورية' : '72-Hour Periodic Championship'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold uppercase">
                        {lang === 'ar' ? 'نقاط x2 مضاعفة' : '2x Points'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {lang === 'ar'
                        ? 'تحدي دوري يتكرر تلقائياً كل 3 أيام لزيادة نقاطك ومواصلة اللعب عند الخسارة'
                        : 'Recurring every 3 days. Earn double revival points!'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                  <span>{lang === 'ar' ? 'دخول البطولة' : 'Enter'}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </div>
              </div>
            </div>

            {/* Utility links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 pt-2">
              <button
                onClick={() => {
                  sounds.playSelectAnswer();
                  setIsPrivacyModalOpen(true);
                }}
                className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'ar' ? 'سياسة الخصوصية وأمان Google Play' : 'Privacy Policy (Google Play)'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* ================= CLASSIC GAME PLAYING STAGE ================= */
          <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
            {/* Left Main Interactive Area */}
            <div className="flex-1 w-full space-y-4">
              {/* Top Navigation Row: Back Button to Main Menu (Requirement 1) */}
              <div className="flex items-center justify-between pb-1">
                <button
                  onClick={handleBackToMainMenu}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-700/80 font-bold text-xs shadow-md transition-all active:scale-95"
                  title={lang === 'ar' ? 'الرجوع للقائمة الرئيسية' : 'Back to Main Menu'}
                >
                  {lang === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                  <span>{lang === 'ar' ? 'الرجوع للقائمة الرئيسية' : 'Main Menu'}</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    {lang === 'ar' ? `المستوى ${currentLevel} من ${MAX_LADDER_STEP}` : `Stage ${currentLevel} of ${MAX_LADDER_STEP}`}
                  </span>
                </div>
              </div>

              {/* Lifelines Toolbar */}
              <LifelinesBar
                lifelines={lifelines}
                onUseLifeline={handleUseLifeline}
                onWalkAway={handleWalkAway}
                disabled={gameStatus !== 'playing'}
                lang={lang}
                canWalkAway={currentLevel > 1 && gameStatus === 'playing'}
              />

              {/* Status & Timer Strip */}
              <div className="flex items-center justify-between px-2">
                {/* Mobile Ladder toggle */}
                <button
                  onClick={() => setIsMobileLadderOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-amber-400"
                >
                  <Menu className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'سلّم الجوائز' : 'Prize Ladder'}</span>
                </button>

                {/* Question Score Counter */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{correctAnswersCount}</span>
                  </span>
                  <span className="flex items-center gap-1 text-rose-400 font-mono font-bold">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{wrongAnswersCount}</span>
                  </span>
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center gap-2 mx-auto lg:mx-0">
                  <div
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm ${
                      !isTimerActive && gameStatus === 'playing'
                        ? 'bg-blue-950/60 border-blue-500/60 text-blue-300 ring-2 ring-blue-500/30'
                        : timeLeft <= 8
                        ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                        : 'bg-slate-900 border-slate-800 text-slate-200'
                    }`}
                  >
                    <Clock className={`w-4 h-4 ${!isTimerActive && gameStatus === 'playing' ? 'text-blue-400' : timeLeft <= 8 ? 'text-rose-400' : 'text-amber-400'}`} />
                    <span>{timeLeft}s</span>
                    {!isTimerActive && gameStatus === 'playing' && (
                      <span className="text-[10px] text-blue-300 font-sans font-bold hidden sm:inline">
                        ({lang === 'ar' ? 'العداد متوقف أثناء القراءة' : 'Paused during reading'})
                      </span>
                    )}
                  </div>
                </div>

                {/* Target prize indicator */}
                <div className="text-right">
                  <div className="text-[10px] text-slate-500">
                    {lang === 'ar' ? 'قيمة السؤال' : 'Prize Value'}
                  </div>
                  <div className="font-mono font-black text-amber-400 text-sm">
                    {formatCurrency(LADDER[currentLevel - 1]?.amount || 100, lang)}
                  </div>
                </div>
              </div>

              {/* Narrator Reading Status Banner */}
              {isSpeaking && gameStatus === 'playing' && (
                <div className="flex items-center justify-center gap-2 py-2 px-3 bg-blue-950/50 border border-blue-500/30 rounded-xl text-blue-300 text-xs text-center">
                  <Volume2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>
                    {lang === 'ar'
                      ? '🎙️ جاري نطق السؤال والخيارات بصوت المذيع... يبدأ العداد التنازلي فور اكتمال النطق!'
                      : '🎙️ Announcer is reading the question and 4 options... 45s countdown starts when reading finishes!'}
                  </span>
                </div>
              )}

              {/* Auto-Revive with Reward Points Banner */}
              {autoReviveMessage && (
                <div className="p-3 bg-emerald-950/80 border-2 border-emerald-500/60 rounded-xl text-emerald-200 text-xs font-bold flex items-center justify-center gap-2 text-center shadow-lg animate-fadeIn">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{autoReviveMessage}</span>
                </div>
              )}

              {/* Call Active Overlay — pauses/disconnects questions during calls */}
              {rtcInCall ? (
                <div className="p-6 sm:p-8 bg-slate-900 border-2 border-emerald-500/60 rounded-3xl text-center space-y-4 shadow-2xl">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-400 flex items-center justify-center text-3xl">
                    📞
                  </div>
                  <h3 className="text-lg font-black text-emerald-300">
                    {lang === 'ar'
                      ? 'مكالمة نشطة الآن — تم فصل الأسئلة مؤقتاً'
                      : 'Call Active — Questions Paused'}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                    {lang === 'ar'
                      ? 'يتم إيقاف السؤال والعداد التنازلي تلقائياً أثناء إجراء المكالمات، وستعود للمنافسة فور إنهاء المكالمة.'
                      : 'Questions and timer are paused while you are in a call. Resume once the call ends.'}
                  </p>
                  <button
                    onClick={() => rtcCallManager.hangup()}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs inline-flex items-center gap-2 shadow-lg transition"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'إنهاء المكالمة والعودة للسؤال' : 'End Call & Resume Question'}</span>
                  </button>
                </div>
              ) : (
                <QuestionCard
                  question={currentQuestion}
                  selectedIndex={selectedOption}
                  onSelectOption={handleSelectOption}
                  gameStatus={gameStatus}
                  eliminatedOptions={eliminatedOptions}
                  lang={lang}
                />
              )}

              {/* Automatic Transition Status Banner */}
              {!rtcInCall && gameStatus === 'revealed' && (
                <div className="space-y-3 pt-2 animate-fadeIn">
                  {selectedOption === currentQuestion.correctIndex ? (
                    <div className="p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-emerald-200 text-xs">
                      <div className="flex items-center gap-2 font-bold">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <span>
                          {lang === 'ar'
                            ? `إجابة صحيحة! أحسنت! (+${formatCurrency(LADDER[currentLevel - 1]?.amount || 100, lang)})`
                            : `Correct Answer! Great Job! (+${formatCurrency(LADDER[currentLevel - 1]?.amount || 100, lang)})`}
                        </span>
                      </div>
                      {currentLevel < MAX_LADDER_STEP && (
                        <span className="text-[11px] text-emerald-300 font-bold">
                          {lang === 'ar' ? '⏳ جاري الانتقال التلقائي للسؤال التالي...' : '⏳ Advancing automatically...'}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="p-3.5 bg-rose-950/80 border-2 border-rose-500/60 rounded-xl flex items-center justify-between gap-3 text-rose-200 text-xs shadow-lg">
                      <div className="flex items-center gap-2.5">
                        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                        <div>
                          <div className="font-bold text-rose-300">
                            {lang === 'ar' ? 'إجابة غير صحيحة!' : 'Incorrect Answer!'}
                          </div>
                          <div className="text-[11px] text-rose-300/80">
                            {lang === 'ar'
                              ? 'لا يُحذف أي خيار تلقائياً — يمكنك استخدام 50 نقطة لإجابة السؤال ومواصلة اللعب.'
                              : 'No free elimination — continuation requires 50 points.'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Desktop Ladder Panel */}
            <div className="hidden lg:block shrink-0">
              <LadderPanel currentLevel={currentLevel} lang={lang} />
            </div>
          </div>
        )}
      </main>

      {/* Mobile Ladder Modal Drawer */}
      {isMobileLadderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 lg:hidden animate-fadeIn">
          <LadderPanel
            currentLevel={currentLevel}
            lang={lang}
            isMobileModal
            onClose={() => setIsMobileLadderOpen(false)}
          />
        </div>
      )}

      {/* Victory / Game Over / Final Score Modal: Instantaneous load with zero lag */}
      {(gameStatus === 'gameover' || gameStatus === 'victory' || gameStatus === 'walkaway') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fadeIn">
          <div className="relative w-full max-w-md p-6 bg-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl text-center space-y-5 text-slate-100">
            {/* Top Back to Main Menu Header (Requirement 1) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <button
                onClick={handleBackToMainMenu}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/90 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-700 font-bold text-xs shadow-md transition-all active:scale-95"
                title={lang === 'ar' ? 'الرجوع للقائمة الرئيسية' : 'Back to Main Menu'}
              >
                {lang === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                <span>{lang === 'ar' ? 'الرجوع للقائمة الرئيسية' : 'Main Menu'}</span>
              </button>
              <span className="text-xs text-amber-400 font-mono font-bold">
                {gameStatus === 'victory' ? '🏆 JACKPOT' : 'GAME OVER'}
              </span>
            </div>

            {/* Icon Banner */}
            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border-2 border-amber-400 flex items-center justify-center">
              {gameStatus === 'victory' ? (
                <Sparkles className="w-10 h-10 text-amber-400" />
              ) : gameStatus === 'walkaway' ? (
                <Award className="w-10 h-10 text-emerald-400" />
              ) : (
                <Trophy className="w-10 h-10 text-amber-400" />
              )}
            </div>

            {/* Title */}
            <div>
              <h2 className="text-2xl font-black text-amber-300">
                {gameStatus === 'victory'
                  ? (lang === 'ar' ? '🎉 مبارك! لقد ربحت المليون! 🎉' : '🎉 Congratulations! You Won $1,000,000! 🎉')
                  : gameStatus === 'walkaway'
                  ? (lang === 'ar' ? 'قرار حكيم! انسحاب رابح' : 'Wise Decision! Safe Walkaway')
                  : (lang === 'ar' ? `نهاية جولة الـ ${MAX_LADDER_STEP} سؤالاً!` : `Completed All ${MAX_LADDER_STEP} Questions!`)}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {lossReason
                  ? lossReason
                  : gameStatus === 'victory'
                  ? (lang === 'ar' ? `أجبت على كافة الأسئلة الـ ${MAX_LADDER_STEP} بدقة وعبقرية فذة` : `You mastered all ${MAX_LADDER_STEP} questions to claim the grand prize!`)
                  : gameStatus === 'walkaway'
                  ? (lang === 'ar' ? 'اخترت الحفاظ على أرباحك وتجنب المخاطرة' : 'You chose to safeguard your accumulated bank.')
                  : (lang === 'ar' ? 'تفاصيل أدائك ومجموع الإجابات الصحيحة في المسابقة' : 'Here is your overall quiz score and performance breakdown')}
              </p>
            </div>

            {/* Score Stats Summary Box */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl">
                <span className="text-slate-400 block text-[11px] mb-1">
                  {lang === 'ar' ? 'الإجابات الصحيحة' : 'Correct Answers'}
                </span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {correctAnswersCount} / {MAX_LADDER_STEP}
                </span>
              </div>
              <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl">
                <span className="text-slate-400 block text-[11px] mb-1">
                  {lang === 'ar' ? 'الإجابات الخاطئة' : 'Wrong Answers'}
                </span>
                <span className="text-xl font-bold font-mono text-rose-400">
                  {wrongAnswersCount} / {MAX_LADDER_STEP}
                </span>
              </div>
            </div>

            {/* Prize Won Banner */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">
                {lang === 'ar' ? 'الرصيد النهائي المحقق:' : 'Total Prize Bank:'}
              </span>
              <div className="text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
                {formatCurrency(finalPrizeAmount, lang)}
              </div>
            </div>

            {/* Action Buttons: Play Again with Fresh Questions + Main Menu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={() => startClassicGame(lang, isTournamentMode)}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{lang === 'ar' ? 'ابدأ من الأول (أسئلة جديدة)' : 'Restart (Fresh Questions)'}</span>
              </button>
              <button
                onClick={handleBackToMainMenu}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs sm:text-sm rounded-xl border border-slate-700 transition-all"
              >
                <span>{lang === 'ar' ? '🏠 القائمة الرئيسية' : '🏠 Main Menu'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lifeline Modals */}
      <AudiencePollModal
        isOpen={audienceResult !== null}
        onClose={() => setAudienceResult(null)}
        voteResult={audienceResult}
        lang={lang}
        options={lang === 'ar' ? currentQuestion.optionsAr : currentQuestion.optionsEn}
      />

      <PhoneFriendModal
        isOpen={phoneResult !== null}
        onClose={() => setPhoneResult(null)}
        result={phoneResult}
        lang={lang}
        options={lang === 'ar' ? currentQuestion.optionsAr : currentQuestion.optionsEn}
      />

      {/* Settings & Bank Modals */}
      <AudioSettingsModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        lang={lang}
      />

      <QuestionsBrowserModal
        isOpen={isQuestionsBrowserOpen}
        onClose={() => setIsQuestionsBrowserOpen(false)}
        lang={lang}
      />

      {/* Privacy Policy Modal (Google Play Compliance) */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        lang={lang}
      />

      {/* AppCreator24 & Google Play Code Modal */}
      <AppCreatorModal
        isOpen={isAppCreatorModalOpen}
        onClose={() => setIsAppCreatorModalOpen(false)}
        lang={lang}
      />

      {/* User Profile Modal (الملف الشخصي للمتسابق) */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        lang={lang}
        profile={userProfile}
        onSaveProfile={(p) => setUserProfile(p)}
      />

      {/* 50-Points Continuation Modal */}
      <RevivalModal
        isOpen={isRevivalModalOpen}
        lang={lang}
        currentPoints={userPoints}
        revivalCost={50}
        currentLevel={currentLevel}
        onRevive={handleReviveWithPoints}
        onReturnToMainMenu={handleBackToMainMenu}
      />

      {/* Badges & Encouragement Gifts Modal */}
      <BadgesModal
        isOpen={isBadgesModalOpen}
        onClose={() => setIsBadgesModalOpen(false)}
        lang={lang}
        onClaimGiftPoints={(pts, badge) => {
          triggerRewardsToast([{ badge, giftPoints: pts }]);
        }}
      />

      {/* 72-Hour Periodic Tournament Modal (Requirement 1 & 2) */}
      <TournamentModal
        isOpen={isTournamentModalOpen}
        onClose={() => setIsTournamentModalOpen(false)}
        onReturnToMainMenu={handleBackToMainMenu}
        lang={lang}
        onStartTournament={() => {
          setIsTournamentModalOpen(false);
          startClassicGame(lang, true);
        }}
        userPoints={userPoints}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {lang === 'ar'
              ? 'تحدي الأبطال - لعبة المسابقة الثقافية الكبرى'
              : 'Champions Challenge - Grand Quiz Challenge'}
          </span>
          <div className="flex items-center gap-3 text-slate-400">
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="text-amber-400 hover:underline"
            >
              {lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </button>
            <span>·</span>
            <span>{lang === 'ar' ? 'تحدي الأبطال المباشر' : 'Live Champions Challenge'}</span>
            <span>·</span>
            <span>{lang === 'ar' ? 'تزامن مباشر بين الأجهزة' : 'Live Multi-Device Sync'}</span>
          </div>
        </div>
      </footer>

      {/* Public Online Chat Room & Private Room Modal */}
      <RoomsCallModal
        isOpen={isRoomsModalOpen}
        onClose={() => setIsRoomsModalOpen(false)}
        lang={lang}
        userProfile={userProfile}
        initialTab={roomsModalTab}
        privateRoomId={privateRoomId}
        onChangePrivateRoomId={(id) => {
          setPrivateRoomId(id);
          setActiveCallRoomId(id);
        }}
      />

      {/* Persistent Global Auto-Mic & Video/Voice Call Dock Across ALL Stages */}
      <LiveCallDock
        lang={lang}
        activeRoomId={activeCallRoomId}
        onOpenRoomsModal={() => {
          void verifyInternetBeforeOnline(() => setIsRoomsModalOpen(true));
        }}
      />

      {/* Microphone Permissions Screen BEFORE Entering 1v1 or 4-Player Rooms */}
      <MicPermissionsModal
        isOpen={pendingMultiplayerEntry !== null}
        lang={lang}
        modeLabel={
          pendingMultiplayerEntry?.matchType === '4player'
            ? (lang === 'ar' ? 'تحدي 4 لاعبين أونلاين' : '4-Player Online Arena')
            : (lang === 'ar' ? 'تحدي ثنائي (1 ضد 1)' : '1v1 Friend Duel')
        }
        onCancel={() => setPendingMultiplayerEntry(null)}
        onContinue={() => {
          const entry = pendingMultiplayerEntry;
          setPendingMultiplayerEntry(null);
          if (!entry) return;
          sounds.stopIntroTheme();
          sounds.stopTensionAmbience();
          setIsIntroMusicPlaying(false);
          if (entry.roomCode) {
            setIncomingRoomCode(entry.roomCode);
            setActiveCallRoomId(entry.roomCode);
          }
          if (entry.category) {
            setIncomingCategory(entry.category);
          }
          setMultiplayerMatchType(entry.matchType);
          setGameMode('multiplayer4');
        }}
      />

      {/* Offline Modal Shown ONLY When Clicking Online / Duel / Call While Disconnected */}
      {isOfflineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-amber-500/60 p-5 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <WifiOff className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-amber-300">
                {lang === 'ar' ? 'لا يوجد اتصال بالإنترنت حالياً' : 'No Internet Connection'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === 'ar'
                  ? 'وضع الأونلاين، التحدي الثنائي، والمكالمات الصوتية والفيديو تتطلب اتصالاً بالإنترنت. يمكنك اللعب الآن مع الكمبيوتر بدون نت مع جميع الأسئلة الـ 300 المخزنة!'
                  : 'Online duels, multiplayer, and voice/video calls require an internet connection. You can play vs Computer offline right now with all 300 stored questions!'}
              </p>
            </div>
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsOfflineModalOpen(false);
                  startClassicGame(lang);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-lg"
              >
                {lang === 'ar' ? '🎮 اللعب مع الكمبيوتر بدون نت' : '🎮 Play vs Computer Offline'}
              </button>
              <button
                type="button"
                onClick={() => setIsOfflineModalOpen(false)}
                className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs"
              >
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Status Pill when Internet is Disconnected */}
      <OfflineIndicator
        lang={lang}
        totalOfflineQuestions={questionTracker.getTotalQuestionsCount()}
      />
    </div>
  );
}
