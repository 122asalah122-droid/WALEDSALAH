import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Users,
  MessageSquare,
  Send,
  Trophy,
  Clock,
  Sparkles,
  Check,
  RotateCcw,
  Globe,
  Radio,
  Copy,
  Zap,
  Play,
  ArrowRight,
  ArrowLeft,
  Trash2,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
  Shield,
  Medal,
  Award,
  HelpCircle,
  Phone,
  BarChart3,
  Heart,
  Lock,
  Mic,
  MicOff,
  PhoneOff,
  KeyRound,
  Ban,
  Flag,
  Crown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, Language, ChatMessage, DuelRole, AudienceVoteResult, PhoneFriendResult, UserProfile } from '../types/game';
import { QUESTIONS_BANK } from '../data/questions';
import { sounds } from '../utils/soundEffects';
import { speechService } from '../utils/speechService';
import { questionTracker } from '../utils/questionTracker';
import { rtcCallManager, RemotePeerStream } from '../services/rtcCallManager';
import { rewardsService, NewlyUnlockedReward } from '../services/rewardsService';
import { AudiencePollModal } from './AudiencePollModal';
import { PhoneFriendModal } from './PhoneFriendModal';
import { ReportPlayerModal, ReportTarget } from './ReportPlayerModal';
import {
  create1v1Room,
  join1v1Room,
  subscribeRoomState,
  submitRoomAnswer,
  advanceRoomRound,
  forfeitRoom,
  registerRoomPresenceHeartbeat,
  submitBotAnswerForRound,
  join4PlayerQueue,
  fill4PlayerWithBots,
  subscribe4PlayerQueue,
  leave4PlayerQueue,
  subscribeRoomMessages,
  sendRoomMessage,
  deleteRoomMessage,
  hydrateQuestionsFromIds,
  FirebaseRoomState,
} from '../services/firebaseRoomService';

interface MultiplayerArenaProps {
  lang: Language;
  onExit: () => void;
  initialRoomCode?: string;
  initialCategory?: string;
  initialMatchType?: '1v1_friend' | '4player' | 'custom_room' | 'world_live';
  userPoints?: number;
  onSpendPoints?: (amount: number) => void;
  onEarnPoints?: (amount: number) => void;
  userProfile?: UserProfile;
  onActiveRoomChange?: (roomCode: string) => void;
  onOpenPrivateCallRoom?: () => void;
  onRewardsUnlocked?: (awards: NewlyUnlockedReward[]) => void;
  isVip?: boolean;
  onOpenVip?: () => void;
}

const CATEGORIES: { key: string; ar: string; en: string; icon: string; descAr: string }[] = [
  { key: 'all', ar: 'شامل (جميع المجالات)', en: 'All Categories (Comprehensive)', icon: '🌟', descAr: '100 سؤال معلومات عامة شامل بدون تكرار (جغرافيا، تاريخ، علوم، رياضة، اختراعات، طبيعة وثقافة)' },
  { key: 'islamic', ar: 'ديني وإسلامي', en: 'Islamic Heritage', icon: '🕌', descAr: '100 سؤال جديد وشامل عن الـ 25 نبياً وحرفهم ومعجزاتهم، القرآن وزوجات النبي ﷺ' },
  { key: 'entertainment', ar: 'أفلام ومسلسلات', en: 'Movies & Series', icon: '🎬', descAr: '100 سؤال جديد ومتنوع عن الأفلام والمسلسلات المصرية والتركية بدون تكرار' },
];

interface ContestantInfo {
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
  selectedOption?: number;
  responseTime?: number;
  answeredRound?: number;
  lastIsCorrect?: boolean;
  lastPointsEarned?: number;
}

const MatchAudioSink: React.FC<{
  stream: MediaStream;
  muted?: boolean;
  onPlaybackBlocked?: () => void;
  onPlaybackStarted?: () => void;
}> = ({ stream, muted = false, onPlaybackBlocked, onPlaybackStarted }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.srcObject !== stream) {
      el.srcObject = stream;
    }
    el.autoplay = true;
    el.muted = muted;
    el.volume = 1;

    const tryPlay = () => {
      if (muted) return;
      const playPromise = el.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => {
            if (onPlaybackStarted) onPlaybackStarted();
          })
          .catch(() => {
            if (onPlaybackBlocked) onPlaybackBlocked();
          });
      }
    };
    tryPlay();

    const retryTimer = window.setInterval(() => {
      if (el.paused && !muted) tryPlay();
    }, 1800);
    window.addEventListener('pointerdown', tryPlay);
    window.addEventListener('touchstart', tryPlay);
    return () => {
      window.clearInterval(retryTimer);
      window.removeEventListener('pointerdown', tryPlay);
      window.removeEventListener('touchstart', tryPlay);
    };
  }, [stream, muted]);

  return (
    <audio
      ref={audioRef}
      autoPlay
      playsInline
      muted={muted}
      onLoadedMetadata={(e) => {
        if (!muted) e.currentTarget.play().catch(() => {});
      }}
      onCanPlay={(e) => {
        if (!muted) e.currentTarget.play().catch(() => {});
      }}
      className="sr-only"
    />
  );
};

export const MultiplayerArena: React.FC<MultiplayerArenaProps> = ({
  lang,
  onExit,
  initialRoomCode,
  initialCategory,
  initialMatchType = '1v1_friend',
  userPoints = 150,
  onSpendPoints,
  onEarnPoints,
  userProfile,
  onActiveRoomChange,
  onOpenPrivateCallRoom,
  onRewardsUnlocked,
  isVip = false,
  onOpenVip,
}) => {
  // Unique Per-Tab + Per-Device Fingerprint so multiple tabs & global devices never collide
  const myDeviceId = useMemo(() => {
    try {
      let did = localStorage.getItem('millionaire_device_uuid');
      if (!did) {
        did = `dev_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('millionaire_device_uuid', did);
      }
      let tabId = sessionStorage.getItem('millionaire_tab_uuid');
      if (!tabId) {
        tabId = Math.random().toString(36).substring(2, 7);
        sessionStorage.setItem('millionaire_tab_uuid', tabId);
      }
      return `${did}_${tabId}`;
    } catch {
      return `dev_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
    }
  }, []);

  const myPlayerId = useMemo(() => {
    try {
      let pid = sessionStorage.getItem('millionaire_player_id');
      if (!pid || !pid.includes(myDeviceId)) {
        pid = `p_${myDeviceId}`;
        sessionStorage.setItem('millionaire_player_id', pid);
      }
      return pid;
    } catch {
      return `p_${myDeviceId}`;
    }
  }, [myDeviceId]);

  // Persistent Custom Nickname & Avatar from UserProfile
  const [playerName, setPlayerName] = useState<string>(() => {
    if (userProfile?.name) return userProfile.name;
    try {
      const saved = localStorage.getItem('millionaire_player_name');
      if (saved && saved.trim()) return saved.trim();
    } catch {}
    return lang === 'ar' ? 'المتسابق' : 'Contestant';
  });

  const [playerAvatar, setPlayerAvatar] = useState<string>(() => {
    if (userProfile?.avatar) return userProfile.avatar;
    try {
      const saved = localStorage.getItem('millionaire_player_avatar');
      if (saved && saved.trim()) return saved.trim();
    } catch {}
    return '👑';
  });

  useEffect(() => {
    if (userProfile?.name) setPlayerName(userProfile.name);
    if (userProfile?.avatar) setPlayerAvatar(userProfile.avatar);
  }, [userProfile]);

  const handleUpdateNickname = (newName: string) => {
    setPlayerName(newName);
    try {
      localStorage.setItem('millionaire_player_name', newName);
      sessionStorage.setItem('millionaire_player_name', newName);
    } catch {}
  };

  const [selectedCategory, setSelectedCategory] = useState<string>(() => initialCategory || 'all');
  const [roundsCount] = useState<number>(10);

  // Match Mode: '1v1_friend' (Single Friend Duel via 4-Digit Code ONLY) | '4player' (4 Players Online)
  const [matchType, setMatchType] = useState<'1v1_friend' | '4player'>(() => {
    if (initialMatchType === '4player') return '4player';
    return '1v1_friend';
  });

  // Arena Flow State: 'setup' | 'searching_4p' | 'waiting_friend' | 'playing' | 'podium'
  const [arenaState, setArenaState] = useState<'setup' | 'searching_4p' | 'waiting_friend' | 'playing' | 'podium'>(() => {
    if (initialRoomCode) return 'waiting_friend';
    if (initialMatchType === '4player') return 'searching_4p';
    return 'setup';
  });

  // Strictly 4-digit numeric room PIN for 1v1 (e.g., 8202)
  const [roomCode, setRoomCode] = useState<string>(() => {
    const cleanedInit = initialRoomCode ? initialRoomCode.replace(/\D/g, '').slice(0, 4) : '';
    return cleanedInit.length === 4 ? cleanedInit : String(Math.floor(1000 + Math.random() * 9000));
  });
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [joinCodeError, setJoinCodeError] = useState<string | null>(null);
  const [isJoiningByCode, setIsJoiningByCode] = useState<boolean>(false);
  const [myRole, setMyRole] = useState<DuelRole>(() => (initialRoomCode ? 'player2_guest' : 'player1_host'));
  const joinedInitCodeRef = useRef<string>('');
  const createdHostRoomRef = useRef<string>('');

  // Contestants list in room
  const [contestants, setContestants] = useState<ContestantInfo[]>([]);

  // Mic, Live Match Voice Bridge & Active Call state synced with rtcCallManager
  const [micOn, setMicOn] = useState<boolean>(() => rtcCallManager.getSnapshot().micOn);
  const [micLevel, setMicLevel] = useState<number>(0);
  const [rtcInCall, setRtcInCall] = useState<boolean>(() => rtcCallManager.getSnapshot().inCall);
  const [matchRemoteStreams, setMatchRemoteStreams] = useState<RemotePeerStream[]>(
    () => rtcCallManager.getSnapshot().matchRemoteStreams
  );
  const [speakerMuted, setSpeakerMuted] = useState<boolean>(() => rtcCallManager.getSnapshot().speakerMuted);
  const [audioPlaybackBlocked, setAudioPlaybackBlocked] = useState<boolean>(false);
  const [blockedPeerIds, setBlockedPeerIds] = useState<Set<string>>(
    () => new Set(rtcCallManager.getSnapshot().blockedPeers.map((b) => b.peerId))
  );
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [reportToast, setReportToast] = useState<string | null>(null);

  const isPlayerBlocked = useCallback(
    (id?: string) => {
      if (!id) return false;
      const rtcAlias = id.startsWith('p_') ? `rtc_${id.slice(2)}` : id;
      return blockedPeerIds.has(id) || blockedPeerIds.has(rtcAlias);
    },
    [blockedPeerIds]
  );

  const handleBlockRoomPlayer = useCallback(
    (id: string, name: string, avatar = '👤') => {
      if (!id || id === myPlayerId) return;
      rtcCallManager.blockCaller(id, name, avatar);
      if (id.startsWith('p_')) {
        rtcCallManager.blockCaller(`rtc_${id.slice(2)}`, name, avatar);
      }
      setBlockedPeerIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        if (id.startsWith('p_')) next.add(`rtc_${id.slice(2)}`);
        return next;
      });
    },
    [myPlayerId]
  );

  const handleUnblockRoomPlayer = useCallback((id: string) => {
    if (!id) return;
    rtcCallManager.unblockCaller(id);
    if (id.startsWith('p_')) {
      rtcCallManager.unblockCaller(`rtc_${id.slice(2)}`);
    }
    setBlockedPeerIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      if (id.startsWith('p_')) next.delete(`rtc_${id.slice(2)}`);
      return next;
    });
  }, []);

  // Stop all background lobby/tension music inside 1v1 & 4-Player rooms so voice chat stays crystal clear
  useEffect(() => {
    sounds.stopIntroTheme();
    sounds.stopTensionAmbience();
    return () => {
      sounds.stopTensionAmbience();
    };
  }, []);

  useEffect(() => {
    return rtcCallManager.subscribe((s) => {
      setMicOn(s.micOn);
      setMicLevel(s.micLevel);
      setRtcInCall(s.inCall);
      setMatchRemoteStreams(s.matchRemoteStreams);
      setSpeakerMuted(s.speakerMuted);
      setBlockedPeerIds(new Set(s.blockedPeers.map((b) => b.peerId)));
    });
  }, []);

  useEffect(() => {
    if (onActiveRoomChange) {
      onActiveRoomChange(roomCode);
    }
  }, [roomCode, onActiveRoomChange]);

  // Connect live WebRTC Mesh voice session for BOTH 1v1 & 4-Player rooms once VIP is active
  useEffect(() => {
    if (isVip && (arenaState === 'playing' || arenaState === 'waiting_friend') && roomCode && !rtcInCall) {
      sounds.stopIntroTheme();
      sounds.stopTensionAmbience();
      rtcCallManager.startMatchMicSession(roomCode).catch(() => {});
      return () => {
        // Only tear down if leaving the active room entirely (handled when arenaState changes away)
      };
    } else if (!isVip || (arenaState !== 'playing' && arenaState !== 'waiting_friend')) {
      rtcCallManager.stopMatchMicSession();
    }
  }, [arenaState, roomCode, rtcInCall, isVip]);

  // Ensure mic session is always stopped on unmount
  useEffect(() => {
    return () => {
      rtcCallManager.stopMatchMicSession();
    };
  }, []);

  // Automatically register and join room if joining via friend link or code (Firebase RTDB)
  useEffect(() => {
    if (!roomCode || !initialRoomCode) return;
    if (joinedInitCodeRef.current === roomCode) return;
    joinedInitCodeRef.current = roomCode;

    setMyRole('player2_guest');
    join1v1Room({
      roomCode,
      playerId: myPlayerId,
      deviceId: myDeviceId,
      name: playerName,
      avatar: playerAvatar,
      country: 'SA',
    })
      .then((d) => {
        if (!d.success || !d.room) {
          joinedInitCodeRef.current = '';
          return;
        }
        if (d.role) setMyRole(d.role);
        if (d.room.category) setSelectedCategory(d.room.category);
        if (Array.isArray(d.room.contestants)) {
          setContestants(d.room.contestants as ContestantInfo[]);
        }
        if (Array.isArray(d.questions) && d.questions.length > 0) {
          setServerQuestions(d.questions);
          questionTracker.markManyAsUsed(d.questions.map((q) => q.id));
        }
        if (d.room.status === 'finished' || d.room.forfeitedBy) {
          setForfeitClosedInfo({
            forfeiterName: d.room.forfeiterName || undefined,
            forfeitedRole: d.room.forfeitedBy || undefined,
            winnerRole: d.room.winnerRole || undefined,
          });
          setArenaState('podium');
        } else if (d.room.status === 'playing' || d.room.contestants.length >= 2) {
          setArenaState('playing');
          sounds.playQuestionIntro();
        }
      })
      .catch(() => {
        joinedInitCodeRef.current = '';
      });
  }, [initialRoomCode, roomCode, myPlayerId, myDeviceId, playerName, playerAvatar]);

  // Live Score paths
  const [liveScores, setLiveScores] = useState<{
    player1_score: number;
    player2_score: number;
    player3_score: number;
    player4_score: number;
  }>({
    player1_score: 0,
    player2_score: 0,
    player3_score: 0,
    player4_score: 0,
  });

  // 4-Player 60-Second Search Counter & Auto-Fill Bots
  const [searchTimeoutLeft, setSearchTimeoutLeft] = useState<number>(60);
  const [fourPlayerQueueCount, setFourPlayerQueueCount] = useState<number>(1);
  const [fourPlayersNeeded, setFourPlayersNeeded] = useState<number>(3);
  const [waitingPlayersList, setWaitingPlayersList] = useState<{ id: string; name: string; avatar: string; country: string }[]>([]);
  const hasJoined4pRef = useRef<boolean>(false);
  const hasFilledBotsRef = useRef<boolean>(false);
  const hasMatched4pRef = useRef<boolean>(false);
  const rewardRecordedRef = useRef<boolean>(false);

  // Current Question & Rounds
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [isRoundRevealed, setIsRoundRevealed] = useState<boolean>(false);
  const currentRoundRef = useRef<number>(1);
  const isRoundRevealedRef = useRef<boolean>(false);
  const selectedOptionRef = useRef<number | null>(null);
  const advancingFromRoundRef = useRef<number>(0);
  const initializedRoundKeyRef = useRef<string>('');
  const spokenQuestionKeyRef = useRef<string>('');
  useEffect(() => {
    currentRoundRef.current = currentRound;
  }, [currentRound]);
  useEffect(() => {
    isRoundRevealedRef.current = isRoundRevealed;
  }, [isRoundRevealed]);
  useEffect(() => {
    selectedOptionRef.current = selectedOption;
  }, [selectedOption]);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);

  // Lifelines (50:50, Audience, Phone, Switch) for 1v1 & 4-Player
  const [lifelines, setLifelines] = useState({
    fiftyFifty: true,
    askAudience: true,
    phoneFriend: true,
    switchQuestion: true,
  });
  const [audienceResult, setAudienceResult] = useState<AudienceVoteResult | null>(null);
  const [phoneResult, setPhoneResult] = useState<PhoneFriendResult | null>(null);
  const [isRevivalOpen, setIsRevivalOpen] = useState<boolean>(false);
  const [wrongConfirmOptionIdx, setWrongConfirmOptionIdx] = useState<number | null>(null);

  // TTS & Timer Synchronization
  const [autoRead, setAutoRead] = useState<boolean>(() => speechService.getAutoRead());
  const [isReadingTTS, setIsReadingTTS] = useState<boolean>(true);
  const [isSpeakingLive, setIsSpeakingLive] = useState<boolean>(() => speechService.getIsSpeaking());
  const [timeLeft, setTimeLeft] = useState<number>(40);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    const unsub = speechService.subscribe((st) => {
      setIsSpeakingLive(st.isSpeaking);
    });
    return () => unsub();
  }, []);

  // Forfeit confirmation & closed match state
  const [showForfeitModal, setShowForfeitModal] = useState<boolean>(false);
  const [forfeitClosedInfo, setForfeitClosedInfo] = useState<{
    forfeiterName?: string;
    forfeitedRole?: string;
    winnerRole?: string;
  } | null>(null);
  const [autoReviveNotice, setAutoReviveNotice] = useState<boolean>(false);
  const [wrongAttemptFlash, setWrongAttemptFlash] = useState<number | null>(null);
  const autoAdvanceTimersRef = useRef<NodeJS.Timeout[]>([]);

  // Real-time Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'c_init',
      senderId: 'system',
      senderName: lang === 'ar' ? 'المذيع والحكم' : 'Referee',
      senderAvatar: '🎙️',
      text: lang === 'ar'
        ? 'أهلاً بكم في التحدي المباشر! الدردشة متزامنة فوراً مع ميزة حذف الرسائل لدى الجميع.'
        : 'Welcome to the Live Duel! Real-time chat synchronized with Delete for Everyone.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(true);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Toast notifications
  const [copyPinToast, setCopyPinToast] = useState<boolean>(false);

  // Authoritative Synchronized Questions from Firebase RTDB (100% Identical on All Devices)
  const [serverQuestions, setServerQuestions] = useState<Question[]>([]);
  const syncedQuestionSigRef = useRef<string>('');

  const questionsList = useMemo(() => {
    if (serverQuestions.length >= roundsCount) {
      return serverQuestions;
    }
    return questionTracker.getMultiplayerQuestions(roundsCount, selectedCategory, roomCode);
  }, [serverQuestions, roomCode, selectedCategory, roundsCount]);

  const currentQuestion: Question = questionsList[currentRound - 1] || QUESTIONS_BANK[0];
  const currentQuestionRef = useRef<Question>(currentQuestion);
  currentQuestionRef.current = currentQuestion;

  useEffect(() => {
    if (arenaState === 'playing' && currentQuestion?.id) {
      questionTracker.markAsUsed(currentQuestion.id);
    }
  }, [arenaState, currentQuestion?.id]);

  // Auto-scroll chat strictly inside its own container (never hijack outer page scroll)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isChatOpen]);

  // Reset outer viewport to top whenever arena view changes
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch {}
  }, [arenaState]);

  const arenaStateRef = useRef(arenaState);
  arenaStateRef.current = arenaState;
  const matchTypeRef = useRef(matchType);
  matchTypeRef.current = matchType;
  const roomCodeRef = useRef(roomCode);
  roomCodeRef.current = roomCode;
  const myPlayerIdRef = useRef(myPlayerId);
  myPlayerIdRef.current = myPlayerId;
  const myRoleRef = useRef(myRole);
  myRoleRef.current = myRole;
  const forfeitSentRef = useRef<boolean>(false);

  // REQUIREMENT 1: Strict Audio, Speech & Unmount Exit Forfeit Reset (Firebase RTDB)
  useEffect(() => {
    return () => {
      speechService.stop();
      sounds.stopTensionAmbience();
      sounds.stopIntroTheme();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      const code = roomCodeRef.current;
      const st = arenaStateRef.current;
      if (
        code &&
        !forfeitSentRef.current &&
        (st === 'playing' || (matchTypeRef.current === '1v1_friend' && st === 'waiting_friend'))
      ) {
        forfeitSentRef.current = true;
        forfeitRoom({
          roomCode: code,
          playerId: myPlayerIdRef.current,
          role: myRoleRef.current,
          matchType: matchTypeRef.current,
        }).catch(() => {});
      }
    };
  }, []);

  // =========================================================================
  // REAL-TIME FIREBASE RTDB ROOM STATE & CHAT SYNCHRONIZATION (ZERO BACKEND)
  // =========================================================================
  useEffect(() => {
    const effectiveRoom = roomCode || 'M-GLOBAL';
    let initialLoaded = false;
    let prevCount = 0;

    const unsubChat = subscribeRoomMessages(effectiveRoom, (incoming) => {
      if (initialLoaded && incoming.length > prevCount) {
        const newest = incoming[incoming.length - 1];
        if (newest && newest.senderId !== myPlayerId) {
          sounds.playChatMessage();
        }
      }
      initialLoaded = true;
      prevCount = incoming.length;
      setChatMessages((prev) => {
        const initMsg = prev.find((m) => m.id === 'c_init');
        return initMsg ? [initMsg, ...incoming] : incoming;
      });
    });

    return () => {
      unsubChat();
    };
  }, [roomCode, myPlayerId]);

  // Real-time Firebase RTDB Room State listener for waiting_friend & playing
  useEffect(() => {
    if ((arenaState !== 'waiting_friend' && arenaState !== 'playing') || !roomCode) return;

    if (arenaState === 'playing') {
      forfeitSentRef.current = false;
    }

    const stopHeartbeat = registerRoomPresenceHeartbeat(roomCode, myPlayerId);

    const closeMatchNow = (
      forfeitedByVal?: string | null,
      winnerRoleVal?: string | null,
      forfeiterNameVal?: string | null
    ) => {
      forfeitSentRef.current = true;
      autoAdvanceTimersRef.current.forEach((t) => clearTimeout(t));
      autoAdvanceTimersRef.current = [];
      speechService.stop();
      sounds.stopTensionAmbience();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsTimerRunning(false);
      setIsRevivalOpen(false);
      setAudienceResult(null);
      setPhoneResult(null);
      setShowForfeitModal(false);
      if (forfeitedByVal) {
        setForfeitClosedInfo({
          forfeiterName: forfeiterNameVal || undefined,
          forfeitedRole: forfeitedByVal,
          winnerRole: winnerRoleVal || undefined,
        });
        setArenaState('podium');
        sounds.playWrong();
      } else {
        setForfeitClosedInfo(null);
        setArenaState('podium');
        sounds.playJackpotWin();
      }
    };

    const unsubRoom = subscribeRoomState(roomCode, (room: FirebaseRoomState) => {
      // Hydrate exact shared question set from RTDB questionIds once per room
      if (Array.isArray(room.questionIds) && room.questionIds.length > 0) {
        const sig = `${room.roomId}:${room.questionIds.join(',')}`;
        if (syncedQuestionSigRef.current !== sig) {
          syncedQuestionSigRef.current = sig;
          if (room.category) setSelectedCategory(room.category);
          const hydrated = hydrateQuestionsFromIds(
            room.questionIds,
            room.totalQuestions || roundsCount,
            room.category,
            room.roomId
          );
          setServerQuestions(hydrated);
          questionTracker.markManyAsUsed(hydrated.map((q) => q.id));
        }
      }

      setLiveScores({
        player1_score: room.player1_score ?? 0,
        player2_score: room.player2_score ?? 0,
        player3_score: room.player3_score ?? 0,
        player4_score: room.player4_score ?? 0,
      });

      if (Array.isArray(room.contestants) && room.contestants.length > 0) {
        setContestants(room.contestants as ContestantInfo[]);
      }

      // Transition from waiting_friend -> playing as soon as friend enters with the 4-digit PIN
      if (arenaStateRef.current === 'waiting_friend') {
        if (room.forfeitedBy || room.status === 'finished') {
          closeMatchNow(room.forfeitedBy, room.winnerRole, room.forfeiterName);
          return;
        }
        if (room.status === 'playing' || room.contestants.length >= 2) {
          setArenaState('playing');
          sounds.playQuestionIntro();
        }
        return;
      }

      // Active gameplay sync
      if (matchType === '1v1_friend' && (room.status === 'finished' || room.forfeitedBy)) {
        closeMatchNow(room.forfeitedBy, room.winnerRole, room.forfeiterName);
        return;
      }
      if (matchType === '4player' && room.status === 'finished') {
        closeMatchNow(null, null, null);
        return;
      }

      const myEntry = room.contestants.find((c) => c.id === myPlayerIdRef.current);
      const allAnswered =
        room.contestants.length >= 2 &&
        room.contestants.every(
          (c) =>
            (c.status === 'answered' && c.answeredRound === currentRoundRef.current - 1) ||
            c.status === 'eliminated'
        );
      const roundTimedOut = Boolean(
        room.roundStartedAt && Date.now() - Number(room.roundStartedAt) >= 41000
      );
      const safeToReveal =
        selectedOptionRef.current !== null ||
        (myEntry?.status === 'answered' && myEntry?.answeredRound === currentRoundRef.current - 1) ||
        allAnswered ||
        roundTimedOut;

      if (typeof room.currentIndex === 'number') {
        if (room.currentIndex >= roundsCount) {
          closeMatchNow(null, null, null);
        } else if (room.currentIndex + 1 > currentRoundRef.current) {
          handleRoundAdvanced(room.currentIndex + 1);
        } else if (
          room.currentIndex === currentRoundRef.current - 1 &&
          room.status === 'revealed' &&
          !isRoundRevealedRef.current &&
          safeToReveal
        ) {
          revealRoundResults();
        }
      }
    });

    const handlePageExitForfeit = () => {
      if (forfeitSentRef.current) return;
      forfeitSentRef.current = true;
      forfeitRoom({
        roomCode,
        playerId: myPlayerId,
        role: myRole,
        matchType,
        playerName,
      }).catch(() => {});
    };

    window.addEventListener('pagehide', handlePageExitForfeit);
    window.addEventListener('beforeunload', handlePageExitForfeit);

    return () => {
      unsubRoom();
      stopHeartbeat();
      window.removeEventListener('pagehide', handlePageExitForfeit);
      window.removeEventListener('beforeunload', handlePageExitForfeit);
    };
  }, [arenaState, roomCode, matchType, myPlayerId, myRole, playerName, roundsCount]);

  // Schedule AI bot answers directly from host client in 4-Player matches (zero backend needed)
  useEffect(() => {
    if (arenaState !== 'playing' || matchType !== '4player' || !roomCode) return;
    if (myRole !== 'player1_host') return;
    const bots = contestants.filter((c) => c.isBot);
    if (bots.length === 0) return;

    const roundIdx = Math.max(0, currentRound - 1);
    const correctIdx = currentQuestion.correctIndex;
    const timers: ReturnType<typeof setTimeout>[] = [];

    bots.forEach((bot) => {
      if (bot.status === 'answered' && bot.answeredRound === roundIdx) return;
      const delayMs = 4500 + Math.floor(Math.random() * 10500);
      const t = setTimeout(() => {
        if (arenaStateRef.current !== 'playing' || currentRoundRef.current - 1 !== roundIdx) return;
        submitBotAnswerForRound({
          roomCode,
          bot,
          roundIndex: roundIdx,
          correctIndex: correctIdx,
        }).catch(() => {});
      }, delayMs);
      timers.push(t);
    });

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [arenaState, matchType, roomCode, myRole, currentRound, currentQuestion.correctIndex, contestants.length]);

  // Send message with actual player nickname via Firebase Realtime Database
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = chatInput.trim();
    if (!textToSend) return;

    sounds.playChatMessage();
    const msgId = `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const effectiveRoom = roomCode || 'M-GLOBAL';

    const newMsg: ChatMessage = {
      id: msgId,
      senderId: myPlayerId,
      senderName: playerName,
      senderAvatar: playerAvatar,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    sendRoomMessage(effectiveRoom, newMsg).catch(() => {});
  };

  const handleDeleteChatMessage = (messageId: string) => {
    setChatMessages((prev) => prev.filter((m) => m.id !== messageId));
    const effectiveRoom = roomCode || 'M-GLOBAL';
    deleteRoomMessage(effectiveRoom, messageId).catch(() => {});
  };

  // =========================================================================
  // 4-PLAYERS 60-SEC WORLDWIDE MATCHMAKING & INSTANT BOT FILL
  // =========================================================================
  const enterMatched4pRoom = useCallback((data: any) => {
    if (!data?.matched || !data?.roomId || hasMatched4pRef.current) return;
    hasMatched4pRef.current = true;
    hasFilledBotsRef.current = true;
    forfeitSentRef.current = false;
    rewardRecordedRef.current = false;
    advancingFromRoundRef.current = 0;
    initializedRoundKeyRef.current = '';
    spokenQuestionKeyRef.current = '';
    currentRoundRef.current = 1;
    selectedOptionRef.current = null;
    isRoundRevealedRef.current = false;
    setCurrentRound(1);
    setSelectedOption(null);
    setEliminatedOptions([]);
    setIsRoundRevealed(false);
    setAutoAdvanceCountdown(null);
    setIsRevivalOpen(false);
    setWrongConfirmOptionIdx(null);
    setAutoReviveNotice(false);
    setAudienceResult(null);
    setPhoneResult(null);
    setLifelines({ fiftyFifty: true, askAudience: true, phoneFriend: true, switchQuestion: true });
    setForfeitClosedInfo(null);
    setLiveScores({
      player1_score: data.room?.player1_score || 0,
      player2_score: data.room?.player2_score || 0,
      player3_score: data.room?.player3_score || 0,
      player4_score: data.room?.player4_score || 0,
    });
    setRoomCode(data.roomId);
    setMyRole(data.role || 'player1_host');
    if (data.contestants) setContestants(data.contestants);
    if (Array.isArray(data.room?.questions) && data.room.questions.length > 0) {
      setServerQuestions(data.room.questions);
      questionTracker.markManyAsUsed(data.room.questions.map((q: Question) => q.id));
    }
    setArenaState('playing');
    sounds.playJackpotWin();
  }, []);

  const triggerBotFillFor4P = useCallback(() => {
    if (hasMatched4pRef.current || hasFilledBotsRef.current) return;
    hasFilledBotsRef.current = true;

    fill4PlayerWithBots({
      deviceId: myDeviceId,
      playerId: myPlayerId,
      name: playerName,
      avatar: playerAvatar,
      country: 'SA',
      category: selectedCategory,
      lang,
      excludeIds: Array.from(questionTracker.getUsedIds()),
    })
      .then((data) => {
        if (data.matched && data.roomId && data.room) {
          enterMatched4pRoom({
            matched: true,
            roomId: data.roomId,
            role: data.role,
            contestants: data.room.contestants,
            room: { ...data.room, questions: data.questions },
          });
        } else {
          hasFilledBotsRef.current = false;
        }
      })
      .catch(() => {
        hasFilledBotsRef.current = false;
      });
  }, [myDeviceId, myPlayerId, playerName, playerAvatar, selectedCategory, lang, enterMatched4pRoom]);

  const start4PlayerMatchmaking = useCallback(() => {
    if (hasJoined4pRef.current) return;
    speechService.prime();
    hasJoined4pRef.current = true;
    hasFilledBotsRef.current = false;
    hasMatched4pRef.current = false;
    rewardRecordedRef.current = false;
    syncedQuestionSigRef.current = '';
    setServerQuestions([]);
    setMatchType('4player');
    setArenaState('searching_4p');
    setSearchTimeoutLeft(60);
    sounds.playSelectAnswer();

    join4PlayerQueue({
      deviceId: myDeviceId,
      playerId: myPlayerId,
      name: playerName,
      avatar: playerAvatar,
      country: 'SA',
      category: selectedCategory,
      lang,
      excludeIds: Array.from(questionTracker.getUsedIds()),
    })
      .then((data) => {
        if (data.matched && data.roomId && data.room) {
          enterMatched4pRoom({
            matched: true,
            roomId: data.roomId,
            role: data.role,
            contestants: data.room.contestants,
            room: { ...data.room, questions: data.questions },
          });
        } else {
          const count = data.queueCount || 1;
          setFourPlayerQueueCount(count);
          setFourPlayersNeeded(Math.max(0, 4 - count));
          if (data.players) {
            setWaitingPlayersList(
              data.players.map((p) => ({
                id: p.playerId,
                name: p.name,
                avatar: p.avatar,
                country: p.country,
              }))
            );
          }
        }
      })
      .catch(() => {});
  }, [myDeviceId, myPlayerId, playerName, playerAvatar, selectedCategory, lang, enterMatched4pRoom]);

  // 1-Minute Waiting Countdown & Real-Time Firebase RTDB 4-Player Queue Listener
  useEffect(() => {
    if (arenaState !== 'searching_4p') return;

    const countdown = setInterval(() => {
      if (hasMatched4pRef.current) return;
      setSearchTimeoutLeft((prev) => {
        if (prev <= 1) {
          if (!hasMatched4pRef.current) {
            triggerBotFillFor4P();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const unsubQueue = subscribe4PlayerQueue(myDeviceId, {
      onQueueUpdate: (players) => {
        if (hasMatched4pRef.current) return;
        const count = Math.max(1, Math.min(4, players.length));
        setFourPlayerQueueCount(count);
        setFourPlayersNeeded(Math.max(0, 4 - count));
        setWaitingPlayersList(
          players.slice(0, 4).map((p) => ({
            id: p.playerId,
            name: p.name,
            avatar: p.avatar,
            country: p.country,
          }))
        );
      },
      onMatched: (data) => {
        clearInterval(countdown);
        enterMatched4pRoom({
          matched: true,
          roomId: data.roomId,
          role: data.role,
          contestants: data.room.contestants,
          room: { ...data.room, questions: data.questions },
        });
      },
    });

    return () => {
      clearInterval(countdown);
      unsubQueue();
    };
  }, [arenaState, myDeviceId, triggerBotFillFor4P, enterMatched4pRoom]);

  // Launch on mount if initialMatchType was set
  useEffect(() => {
    if (initialMatchType === '4player' && !initialRoomCode && arenaState === 'searching_4p' && !hasJoined4pRef.current) {
      start4PlayerMatchmaking();
    }
  }, [initialMatchType, initialRoomCode, arenaState, start4PlayerMatchmaking]);

  // Join 1v1 Friend Duel using strictly 4-digit PIN code
  const handleJoin1v1ByCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPin = joinCodeInput.replace(/\D/g, '').slice(0, 4);
    if (cleanPin.length !== 4) {
      setJoinCodeError(lang === 'ar' ? 'يرجى إدخال كود مكون من 4 أرقام صحيحة' : 'Please enter a valid 4-digit PIN');
      return;
    }

    setJoinCodeError(null);
    setIsJoiningByCode(true);
    speechService.prime();
    sounds.playSelectAnswer();

    try {
      const data = await join1v1Room({
        roomCode: cleanPin,
        playerId: myPlayerId,
        deviceId: myDeviceId,
        name: playerName,
        avatar: playerAvatar,
        country: 'SA',
        requireExisting: true,
      });

      if (!data.success || !data.room) {
        setJoinCodeError(data.error || (lang === 'ar' ? 'كود الغرفة غير صحيح أو غير متاح' : 'Invalid or closed room code'));
        sounds.playWrong();
        setIsJoiningByCode(false);
        return;
      }

      forfeitSentRef.current = false;
      rewardRecordedRef.current = false;
      advancingFromRoundRef.current = 0;
      initializedRoundKeyRef.current = '';
      spokenQuestionKeyRef.current = '';
      syncedQuestionSigRef.current = '';
      currentRoundRef.current = 1;
      selectedOptionRef.current = null;
      isRoundRevealedRef.current = false;
      setCurrentRound(1);
      setSelectedOption(null);
      setEliminatedOptions([]);
      setIsRoundRevealed(false);
      setAutoAdvanceCountdown(null);
      setIsRevivalOpen(false);
      setWrongConfirmOptionIdx(null);
      setAutoReviveNotice(false);
      setAudienceResult(null);
      setPhoneResult(null);
      setLifelines({ fiftyFifty: true, askAudience: true, phoneFriend: true, switchQuestion: true });
      setLiveScores({
        player1_score: data.room.player1_score || 0,
        player2_score: data.room.player2_score || 0,
        player3_score: 0,
        player4_score: 0,
      });
      setMatchType('1v1_friend');
      setRoomCode(cleanPin);
      setMyRole(data.role || 'player2_guest');
      setForfeitClosedInfo(null);
      if (data.room.category) setSelectedCategory(data.room.category);
      if (Array.isArray(data.room.contestants)) {
        setContestants(data.room.contestants as ContestantInfo[]);
      }
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setServerQuestions(data.questions);
        questionTracker.markManyAsUsed(data.questions.map((q) => q.id));
      }

      setArenaState('playing');
      sounds.playQuestionIntro();
    } catch {
      setJoinCodeError(lang === 'ar' ? 'تعذر الاتصال بقاعدة البيانات — تأكد من الشبكة' : 'Connection failed');
    } finally {
      setIsJoiningByCode(false);
    }
  };

  // =========================================================================
  // TTS & TIMER SYNCHRONIZATION (PAUSED IF ACTIVE CALL IS RUNNING)
  // Uses separate initializedRoundKeyRef and spokenQuestionKeyRef so late serverQuestions updates
  // never reset round state, while still speaking the authoritative synced question!
  // =========================================================================
  useEffect(() => {
    if (arenaState !== 'playing' || isRoundRevealed) return;

    if (rtcInCall) {
      speechService.stop();
      sounds.stopTensionAmbience();
      setIsTimerRunning(false);
      setIsReadingTTS(false);
      return;
    }

    const roundKey = `${roomCode}:${currentRound}`;
    const alreadyInit = initializedRoundKeyRef.current === roundKey;

    if (!alreadyInit) {
      initializedRoundKeyRef.current = roundKey;
      setSelectedOption(null);
      setEliminatedOptions([]);
      setIsRoundRevealed(false);
      isRoundRevealedRef.current = false;
      selectedOptionRef.current = null;
      setAudienceResult(null);
      setPhoneResult(null);
      setAutoAdvanceCountdown(null);
      setTimeLeft(40);
      setIsTimerRunning(!autoRead);
      setIsReadingTTS(autoRead);
      sounds.playQuestionIntro();
    } else if (selectedOptionRef.current !== null || isRoundRevealedRef.current) {
      return;
    }

    const qId = currentQuestion?.id || '';
    const speakKey = `${roundKey}:${qId}:${lang}`;

    if (!autoRead) {
      setIsReadingTTS(false);
      if (!isRoundRevealedRef.current && selectedOptionRef.current === null && !rtcCallManager.getSnapshot().inCall) {
        setIsTimerRunning(true);
      }
      return;
    }

    if (spokenQuestionKeyRef.current === speakKey) {
      return;
    }
    spokenQuestionKeyRef.current = speakKey;

    // Stop any previously playing speech before reading current round question
    speechService.stop();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    if (!isTimerRunning) {
      setIsReadingTTS(true);
    }

    const speakTimer = window.setTimeout(() => {
      if (isRoundRevealedRef.current || selectedOptionRef.current !== null || rtcCallManager.getSnapshot().inCall) {
        setIsReadingTTS(false);
        return;
      }
      speechService.speakQuestionAndOptions(
        currentQuestionRef.current,
        lang,
        currentRound,
        () => {
          setIsReadingTTS(false);
          if (!isRoundRevealedRef.current && selectedOptionRef.current === null && !rtcCallManager.getSnapshot().inCall) {
            setIsTimerRunning(true);
          }
        }
      );
    }, 180);

    const safetyTimeout = window.setTimeout(() => {
      setIsReadingTTS(false);
      if (!isRoundRevealedRef.current && selectedOptionRef.current === null && !rtcCallManager.getSnapshot().inCall) {
        setIsTimerRunning(true);
      }
    }, 12000);

    return () => {
      clearTimeout(speakTimer);
      clearTimeout(safetyTimeout);
    };
  }, [arenaState, currentRound, roomCode, rtcInCall, lang, currentQuestion?.id, autoRead]);

  // Stop speech cleanly if round gets revealed or player leaves playing screen
  useEffect(() => {
    if (arenaState !== 'playing' || isRoundRevealed) {
      speechService.stop();
      setIsReadingTTS(false);
    }
  }, [arenaState, isRoundRevealed]);

  // Countdown timer loop - ONLY runs when isTimerRunning === true AND NOT in an active call
  useEffect(() => {
    if (!isTimerRunning || arenaState !== 'playing' || isRoundRevealed || rtcInCall) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          revealRoundResults();
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
  }, [isTimerRunning, arenaState, isRoundRevealed, rtcInCall]);

  const handleSkipTTS = () => {
    speechService.prime();
    speechService.stop();
    setIsReadingTTS(false);
    setIsTimerRunning(true);
  };

  const handleToggleMpSpeak = () => {
    if (rtcInCall || isRoundRevealed) return;
    speechService.prime();
    sounds.playSelectAnswer();
    if (isSpeakingLive || isReadingTTS) {
      speechService.stop();
      setIsReadingTTS(false);
      if (!isTimerRunning && selectedOptionRef.current === null && !isRoundRevealedRef.current) {
        setIsTimerRunning(true);
      }
    } else {
      speechService.speakQuestionAndOptions(
        currentQuestionRef.current,
        lang,
        currentRound,
        () => {
          setIsReadingTTS(false);
          if (!isRoundRevealedRef.current && selectedOptionRef.current === null && !rtcCallManager.getSnapshot().inCall) {
            setIsTimerRunning(true);
          }
        }
      );
    }
  };

  const handleToggleMpAutoRead = () => {
    speechService.prime();
    sounds.playSelectAnswer();
    const nextVal = !autoRead;
    setAutoRead(nextVal);
    speechService.setAutoRead(nextVal);
    if (nextVal && !isSpeakingLive && !rtcInCall && !isRoundRevealed) {
      speechService.speakQuestionAndOptions(currentQuestionRef.current, lang, currentRound);
    } else if (!nextVal && isReadingTTS) {
      speechService.stop();
      setIsReadingTTS(false);
      if (!isRoundRevealedRef.current && selectedOptionRef.current === null && !rtcCallManager.getSnapshot().inCall) {
        setIsTimerRunning(true);
      }
    }
  };

  const submitOptionAnswer = (idx: number, isCorrect: boolean) => {
    const responseSec = parseFloat(Math.max(0, 40 - timeLeft).toFixed(1));
    const roundIdx = Math.max(0, currentRoundRef.current - 1);
    sounds.playSelectAnswer();
    selectedOptionRef.current = idx;
    setSelectedOption(idx);

    const pts = isCorrect ? 50 : 0;

    if (isCorrect && onEarnPoints) {
      onEarnPoints(pts);
    }

    submitRoomAnswer({
      roomCode,
      playerId: myPlayerId,
      role: myRole,
      optionIndex: idx,
      roundIndex: roundIdx,
      responseTime: responseSec,
      isCorrect,
      pointsEarned: pts,
    })
      .then((data) => {
        if (data.room) {
          setLiveScores({
            player1_score: data.room.player1_score || 0,
            player2_score: data.room.player2_score || 0,
            player3_score: data.room.player3_score || 0,
            player4_score: data.room.player4_score || 0,
          });
          if (Array.isArray(data.room.contestants)) {
            setContestants(data.room.contestants as ContestantInfo[]);
          }
        }
        if (data.allAnswered || data.room?.status === 'revealed') {
          revealRoundResults();
        }
      })
      .catch(() => {});
  };

  // =========================================================================
  // ANSWER SELECTION & FORCED AUTO-ADVANCE (NO SKIPPING)
  // =========================================================================
  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null || isRoundRevealed || isRevivalOpen) return;

    speechService.stop();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const isCorrect = idx === currentQuestion.correctIndex;

    // On wrong answer: if player has >= 50 pts, ask whether they want to deduct 50 pts to continue!
    if (!isCorrect && userPoints >= 50) {
      sounds.playWrong();
      setWrongAttemptFlash(idx);
      setTimeout(() => setWrongAttemptFlash(null), 900);
      setWrongConfirmOptionIdx(idx);
      setIsRevivalOpen(true);
      return;
    }

    submitOptionAnswer(idx, isCorrect);
  };

  // Reveal results and initiate forced auto-advance without any manual buttons (idempotent)
  const revealRoundResults = () => {
    if (isRoundRevealedRef.current) return;
    isRoundRevealedRef.current = true;
    setIsRoundRevealed(true);
    setIsRevivalOpen(false);
    setWrongConfirmOptionIdx(null);
    setIsTimerRunning(false);
    sounds.stopTensionAmbience();

    if (selectedOptionRef.current === currentQuestionRef.current.correctIndex) {
      sounds.playCorrect();
    } else {
      sounds.playWrong();
    }

    triggerAutoAdvance();
  };

  // REQUIREMENT 3: FORCED AUTO-ADVANCE (لا أزرار يدوية للسؤال التالي)
  const triggerAutoAdvance = () => {
    autoAdvanceTimersRef.current.forEach((t) => clearTimeout(t));
    setAutoAdvanceCountdown(3);
    const step1 = setTimeout(() => setAutoAdvanceCountdown(2), 900);
    const step2 = setTimeout(() => setAutoAdvanceCountdown(1), 1800);
    const step3 = setTimeout(() => {
      setAutoAdvanceCountdown(null);
      handleExecuteNextRound();
    }, 2700);
    autoAdvanceTimersRef.current = [step1, step2, step3];
  };

  const handleExecuteNextRound = async () => {
    const roundNow = currentRoundRef.current;
    if (advancingFromRoundRef.current >= roundNow) return;
    advancingFromRoundRef.current = roundNow;

    // Kill all speech immediately to prevent audio overlap!
    speechService.stop();
    sounds.stopTensionAmbience();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    try {
      const d = await advanceRoomRound({
        roomCode,
        currentRound: roundNow,
        forceTimeout: timeLeft <= 1,
      });
      if (d && d.deferred) {
        // Still waiting for the other connected player to finish answering within 40s window
        advancingFromRoundRef.current = Math.max(0, roundNow - 1);
        return;
      }
    } catch {}

    if (roundNow >= roundsCount) {
      setForfeitClosedInfo(null);
      setArenaState('podium');
      sounds.playJackpotWin();
      try {
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.55 } });
      } catch {}
      return;
    }

    handleRoundAdvanced(roundNow + 1);
  };

  const handleRoundAdvanced = (nextRoundNum: number) => {
    if (nextRoundNum > roundsCount) {
      setForfeitClosedInfo(null);
      setArenaState('podium');
      sounds.playJackpotWin();
      return;
    }
    if (nextRoundNum <= currentRoundRef.current) return;
    autoAdvanceTimersRef.current.forEach((t) => clearTimeout(t));
    autoAdvanceTimersRef.current = [];
    speechService.stop();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    currentRoundRef.current = nextRoundNum;
    isRoundRevealedRef.current = false;
    selectedOptionRef.current = null;
    setCurrentRound(nextRoundNum);
    setSelectedOption(null);
    setEliminatedOptions([]);
    setIsRoundRevealed(false);
    setAutoAdvanceCountdown(null);
    setIsRevivalOpen(false);
    setWrongConfirmOptionIdx(null);
    setAutoReviveNotice(false);
    setTimeLeft(40);
  };

  // =========================================================================
  // LIFELINES IMPLEMENTATION FOR BOTH 1v1 DUEL & 4-PLAYER ARENA
  // =========================================================================
  const handle5050 = () => {
    if (!lifelines.fiftyFifty || selectedOption !== null || isRoundRevealed || isRevivalOpen || rtcInCall) return;
    speechService.prime();
    sounds.playFiftyFifty();
    setLifelines((prev) => ({ ...prev, fiftyFifty: false }));
    const wrongIdxs = [0, 1, 2, 3].filter((i) => i !== currentQuestion.correctIndex);
    const toElim = wrongIdxs.sort(() => 0.5 - Math.random()).slice(0, 2);
    setEliminatedOptions(toElim);
  };

  const handleAskAudience = () => {
    if (!lifelines.askAudience || selectedOption !== null || isRoundRevealed || isRevivalOpen || rtcInCall) return;
    speechService.prime();
    sounds.playAudienceVote();
    setLifelines((prev) => ({ ...prev, askAudience: false }));

    const correctIdx = currentQuestion.correctIndex;
    const activeWrongs = [0, 1, 2, 3].filter((i) => i !== correctIdx && !eliminatedOptions.includes(i));
    const pcts: [number, number, number, number] = [0, 0, 0, 0];

    if (activeWrongs.length <= 1) {
      const correctPct = Math.floor(Math.random() * 18) + 74;
      pcts[correctIdx] = correctPct;
      if (activeWrongs[0] !== undefined) pcts[activeWrongs[0]] = 100 - correctPct;
    } else {
      const correctPct = Math.floor(Math.random() * 25) + 60;
      const remain = 100 - correctPct;
      if (activeWrongs.length === 2) {
        const p1 = Math.floor(Math.random() * (remain - 2)) + 1;
        pcts[correctIdx] = correctPct;
        pcts[activeWrongs[0]] = p1;
        pcts[activeWrongs[1]] = remain - p1;
      } else {
        const p1 = Math.floor(Math.random() * (remain - 4));
        const p2 = Math.floor(Math.random() * (remain - p1 - 2));
        const p3 = remain - p1 - p2;
        pcts[correctIdx] = correctPct;
        pcts[activeWrongs[0]] = p1;
        pcts[activeWrongs[1]] = p2;
        pcts[activeWrongs[2]] = p3;
      }
    }

    setAudienceResult({ percentages: pcts });
  };

  const handlePhoneFriend = () => {
    if (!lifelines.phoneFriend || selectedOption !== null || isRoundRevealed || isRevivalOpen || rtcInCall) return;
    speechService.prime();
    sounds.playPhoneFriend();
    setLifelines((prev) => ({ ...prev, phoneFriend: false }));

    const letterLabels = lang === 'ar' ? ['أ', 'ب', 'ج', 'د'] : ['A', 'B', 'C', 'D'];
    const correctIdx = currentQuestion.correctIndex;
    setPhoneResult({
      friendName: lang === 'ar' ? 'د. مروان (أستاذ جامعي)' : 'Dr. Marwan (Professor)',
      avatar: '👨‍🏫',
      confidence: 88,
      suggestedIndex: correctIdx,
      messageAr: `أهلاً بك! أنا واثق بنسبة 88% أن الإجابة الصحيحة هي الخيار (${letterLabels[correctIdx]})!`,
      messageEn: `Hello! I am 88% confident that option (${letterLabels[correctIdx]}) is the correct answer!`,
    });
  };

  // Question switching is strictly disabled in 1v1 so both players share identical questions!

  // REVIVAL WITH POINTS: Spend 50 points to stay in the duel WITHOUT eliminating any options
  const handleReviveWithPoints = () => {
    if (userPoints < 50) return;
    if (onSpendPoints) onSpendPoints(50);
    sounds.playCorrect();
    setIsRevivalOpen(false);
    setWrongConfirmOptionIdx(null);
    setSelectedOption(null);
    setAutoReviveNotice(true);
    setTimeout(() => setAutoReviveNotice(false), 2600);
  };

  const handleDeclineRevive = () => {
    const idxToSubmit = wrongConfirmOptionIdx !== null ? wrongConfirmOptionIdx : 0;
    setIsRevivalOpen(false);
    setWrongConfirmOptionIdx(null);
    submitOptionAnswer(idxToSubmit, false);
  };

  // Global Back to Main Menu Handler
  const handleRequestBack = () => {
    if (arenaState === 'playing') {
      setShowForfeitModal(true);
    } else {
      speechService.stop();
      sounds.stopTensionAmbience();
      sounds.stopIntroTheme();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setServerQuestions([]);
      try {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      } catch {}
      onExit();
    }
  };

  const handleConfirmForfeit = () => {
    setShowForfeitModal(false);
    forfeitSentRef.current = true;
    autoAdvanceTimersRef.current.forEach((t) => clearTimeout(t));
    autoAdvanceTimersRef.current = [];
    speechService.stop();
    sounds.stopTensionAmbience();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsTimerRunning(false);
    setServerQuestions([]);

    forfeitRoom({
      roomCode,
      playerId: myPlayerId,
      role: myRole,
      matchType,
      playerName,
    }).catch(() => {});

    if (matchType === '4player') {
      // In 4-Player mode, an AI bot with rotating name replaces the departing player so others continue!
      onExit();
      return;
    }

    setForfeitClosedInfo({
      forfeiterName: playerName,
      forfeitedRole: myRole,
      winnerRole: myRole === 'player1_host' ? 'player2_guest' : 'player1_host',
    });
    setArenaState('podium');
  };

  const getScoreForRole = (role: DuelRole) => {
    if (role === 'player1_host') return liveScores.player1_score;
    if (role === 'player2_guest') return liveScores.player2_score;
    if (role === 'player3_guest') return liveScores.player3_score;
    if (role === 'player4_guest') return liveScores.player4_score;
    return 0;
  };

  // Record Badges & Encouragement Rewards once upon reaching podium
  useEffect(() => {
    if (arenaState !== 'podium' || rewardRecordedRef.current) return;
    rewardRecordedRef.current = true;

    const myScore = getScoreForRole(myRole);
    const activeScores = [liveScores.player1_score, liveScores.player2_score];
    if (matchType === '4player') {
      activeScores.push(liveScores.player3_score, liveScores.player4_score);
    }
    const maxScore = Math.max(...activeScores);
    const wonByOpponentForfeit = Boolean(forfeitClosedInfo && forfeitClosedInfo.winnerRole === myRole);
    const isWinner = wonByOpponentForfeit || (!forfeitClosedInfo && myScore > 0 && myScore >= maxScore);

    const awards = rewardsService.recordMultiplayerResult({
      mode: matchType === '4player' ? '4player' : '1v1_friend',
      isWinner,
    });

    if (awards.length > 0) {
      const totalPts = awards.reduce((sum, a) => sum + a.giftPoints, 0);
      if (totalPts > 0 && onEarnPoints) {
        onEarnPoints(totalPts);
      }
      onRewardsUnlocked?.(awards);
    }
  }, [arenaState, forfeitClosedInfo, liveScores, matchType, myRole, onEarnPoints, onRewardsUnlocked]);

  const letterLabels = lang === 'ar' ? ['أ', 'ب', 'ج', 'د'] : ['A', 'B', 'C', 'D'];
  const questionText = lang === 'ar' ? currentQuestion.questionAr : currentQuestion.questionEn;
  const options = lang === 'ar' ? currentQuestion.optionsAr : currentQuestion.optionsEn;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 animate-fadeIn">
      {/* =========================================================================
          TOP NAVIGATION BAR WITH FIXED BACK BUTTON TO MAIN MENU
         ========================================================================= */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <button
          onClick={handleRequestBack}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-700/80 transition-all font-bold text-xs shadow active:scale-95"
          title={lang === 'ar' ? 'الرجوع للقائمة الرئيسية' : 'Back to Main Menu'}
        >
          {lang === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{lang === 'ar' ? 'الرجوع للقائمة الرئيسية' : 'Back to Main Menu'}</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          {/* Standalone Private Call Room (Only outside active gameplay) */}
          {arenaState !== 'playing' && onOpenPrivateCallRoom && (
            <button
              onClick={onOpenPrivateCallRoom}
              className="px-2.5 py-1 rounded-xl bg-purple-600/20 hover:bg-purple-600/35 border border-purple-500/50 text-purple-200 font-bold text-[11px] flex items-center gap-1 shadow transition"
              title={lang === 'ar' ? 'غرفة اتصال خاصة (بالكود فقط + حظر المتصل)' : 'Private Call Room'}
            >
              <Lock className="w-3.5 h-3.5 text-purple-300" />
              <span>{lang === 'ar' ? 'غرفة خاصة للاتصال' : 'Private Call Room'}</span>
            </button>
          )}

          {/* User Points Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>{userPoints} {lang === 'ar' ? 'نقطة' : 'pts'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">
              {matchType === '4player'
                ? (lang === 'ar' ? 'تحدي 4 لاعبين أونلاين' : '4-Player Arena')
                : (lang === 'ar' ? 'تحدي ثنائي (لاعب ضد صديق)' : '1v1 Friend Duel')}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20 font-bold">
              {matchType === '4player' ? '4 PLAYERS' : '1v1 DUEL'}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          STAGE 1: SETUP SCREEN (2 CLEAN MODES: 1v1 Friend Duel OR 4-Player Arena)
         ========================================================================= */}
      {arenaState === 'setup' && (
        <div className="max-w-2xl mx-auto p-5 sm:p-8 bg-slate-900/95 border-2 border-amber-500/40 rounded-3xl shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border-2 border-amber-400 flex items-center justify-center text-amber-400">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-300">
              {lang === 'ar' ? 'صالة التحديات والمنافسات المباشرة' : 'Live Multiplayer Arena'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {lang === 'ar'
                ? 'اختر نمط اللعب: تحدي ثنائي مع صديقك بالكود الرباعي فقط، أو خوض معركة الـ 4 لاعبين حول العالم.'
                : 'Choose your challenge: 1v1 duel with a friend via 4-digit PIN only, or join the 4-player battle.'}
            </p>
          </div>

          {/* CATEGORY SELECTION: Comprehensive domains */}
          <div className="space-y-2 pt-1 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <span>🎯</span>
                <span>{lang === 'ar' ? 'اختر مجال الأسئلة والتحدي:' : 'Choose Question Category:'}</span>
              </label>
              <span className="text-[10px] text-slate-400">
                {CATEGORIES.find((c) => c.key === selectedCategory)?.ar || 'شامل'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.key);
                      sounds.playSelectAnswer();
                    }}
                    className={`p-2.5 rounded-2xl border text-start transition-all relative ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md ring-1 ring-amber-400/50 scale-[1.02]'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-xs font-black truncate">{cat.ar}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 leading-tight line-clamp-2">
                      {cat.descAr}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TWO PRIMARY MULTIPLAYER MODES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* 1. FRIEND 1v1 DUEL VIA 4-DIGIT CODE ONLY */}
            <button
              onClick={() => {
                speechService.prime();
                const freshPin = String(Math.floor(1000 + Math.random() * 9000));
                createdHostRoomRef.current = '';
                forfeitSentRef.current = false;
                rewardRecordedRef.current = false;
                advancingFromRoundRef.current = 0;
                initializedRoundKeyRef.current = '';
                spokenQuestionKeyRef.current = '';
                currentRoundRef.current = 1;
                selectedOptionRef.current = null;
                isRoundRevealedRef.current = false;
                setCurrentRound(1);
                setSelectedOption(null);
                setEliminatedOptions([]);
                setIsRoundRevealed(false);
                setAutoAdvanceCountdown(null);
                setIsRevivalOpen(false);
                setWrongConfirmOptionIdx(null);
                setAutoReviveNotice(false);
                setAudienceResult(null);
                setPhoneResult(null);
                setLifelines({ fiftyFifty: true, askAudience: true, phoneFriend: true, switchQuestion: true });
                setLiveScores({ player1_score: 0, player2_score: 0, player3_score: 0, player4_score: 0 });
                setServerQuestions([]);
                setRoomCode(freshPin);
                setMatchType('1v1_friend');
                setMyRole('player1_host');
                setForfeitClosedInfo(null);
                setContestants([
                  {
                    id: myPlayerId,
                    deviceId: myDeviceId,
                    name: playerName,
                    avatar: playerAvatar,
                    country: 'SA',
                    role: 'player1_host',
                    isHost: true,
                    score: 0,
                    status: 'idle',
                  },
                ]);
                setArenaState('waiting_friend');
                sounds.playSelectAnswer();
                syncedQuestionSigRef.current = '';
                create1v1Room({
                  preferredPin: freshPin,
                  category: selectedCategory,
                  lang,
                  totalQuestions: roundsCount,
                  hostId: myPlayerId,
                  hostDeviceId: myDeviceId,
                  hostName: playerName,
                  hostAvatar: playerAvatar,
                  excludeIds: Array.from(questionTracker.getUsedIds()),
                })
                  .then((d) => {
                    const confirmedRoomId = d?.roomId || freshPin;
                    createdHostRoomRef.current = confirmedRoomId;
                    if (d.roomId) setRoomCode(d.roomId);
                    if (d.success && Array.isArray(d.questions) && d.questions.length > 0) {
                      setServerQuestions(d.questions);
                      questionTracker.markManyAsUsed(d.questions.map((q: Question) => q.id));
                    }
                  })
                  .catch(() => {
                    createdHostRoomRef.current = freshPin;
                  });
              }}
              className="p-5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 active:scale-98 rounded-3xl text-slate-950 text-start space-y-2.5 shadow-xl transition-all"
            >
              <div className="flex items-center justify-between">
                <KeyRound className="w-7 h-7 text-slate-950" />
                <span className="text-[10px] font-black px-2.5 py-0.5 bg-slate-950 text-amber-400 rounded-full">
                  4-DIGIT PIN
                </span>
              </div>
              <h3 className="font-black text-slate-950 text-base sm:text-lg">
                {lang === 'ar' ? 'تحدي ثنائي (إنشاء كود من 4 أرقام)' : '1v1 Duel (4-Digit PIN)'}
              </h3>
              <p className="text-xs text-slate-950/90 leading-relaxed font-semibold">
                {lang === 'ar'
                  ? 'أنشئ كود غرفة من 4 أرقام وأعطه لصديقك ليدخل فوراً في التحدي دون إرسال أي روابط.'
                  : 'Create a 4-digit PIN room and give the code to your friend to join directly without links.'}
              </p>
            </button>

            {/* 2. 4-PLAYERS WORLDWIDE BATTLE */}
            <button
              onClick={() => {
                hasJoined4pRef.current = false;
                setMatchType('4player');
                start4PlayerMatchmaking();
              }}
              className="p-5 bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 active:scale-98 rounded-3xl border-2 border-purple-400/50 text-start space-y-2.5 shadow-xl transition-all"
            >
              <div className="flex items-center justify-between">
                <Users className="w-7 h-7 text-purple-200" />
                <span className="text-[10px] font-black px-2.5 py-0.5 bg-black/40 text-purple-300 rounded-full">
                  4 PLAYERS • 60s
                </span>
              </div>
              <h3 className="font-extrabold text-white text-base sm:text-lg">
                {lang === 'ar' ? 'تحدي 4 لاعبين حول العالم' : '4-Player Worldwide Arena'}
              </h3>
              <p className="text-xs text-purple-200/90 leading-relaxed font-medium">
                {lang === 'ar'
                  ? 'يستقبل جميع الأجهزة المفتوحة حول العالم لمدة دقيقة قبل الانطلاق التلقائي للتحدي.'
                  : 'Matches all open devices worldwide for 60s before automatic match launch.'}
              </p>
            </button>
          </div>

          {/* JOIN FRIEND 1v1 DUEL BY 4-DIGIT PIN ONLY */}
          <form
            onSubmit={handleJoin1v1ByCode}
            className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/40 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>{lang === 'ar' ? 'لديك كود من صديقك؟ ادخل التحدي الثنائي بالكود (4 أرقام):' : 'Have a 4-digit PIN from a friend? Join 1v1 Duel:'}</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={joinCodeInput}
                onChange={(e) => {
                  setJoinCodeError(null);
                  setJoinCodeInput(e.target.value.replace(/\D/g, '').slice(0, 4));
                }}
                placeholder={lang === 'ar' ? 'أدخل 4 أرقام مثل 8202' : 'Enter 4 digits e.g. 8202'}
                dir="ltr"
                className="flex-1 bg-slate-900 border-2 border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-center font-mono font-black text-base tracking-[0.4em] text-amber-300 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isJoiningByCode || joinCodeInput.length !== 4}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition active:scale-95"
              >
                {isJoiningByCode
                  ? (lang === 'ar' ? 'جاري الدخول...' : 'Joining...')
                  : (lang === 'ar' ? 'دخول بالكود الآن ⚡' : 'Join by PIN ⚡')}
              </button>
            </div>

            {joinCodeError && (
              <div className="text-xs font-bold text-rose-400 text-center">
                ⚠️ {joinCodeError}
              </div>
            )}
          </form>

          {/* Standalone Private Call Room Banner (Separate from gameplay & not open to all) */}
          {onOpenPrivateCallRoom && (
            <button
              type="button"
              onClick={onOpenPrivateCallRoom}
              className="w-full p-3.5 rounded-2xl bg-purple-950/30 hover:bg-purple-950/50 border border-purple-500/40 flex items-center justify-between gap-3 text-start transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-purple-200">
                    {lang === 'ar' ? '🔐 غرفة اتصال خاصة (معزولة بكود + حظر المتصل)' : '🔐 Standalone Private Call Room (PIN + Block Caller)'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {lang === 'ar'
                      ? 'الاتصال غير متاح للجميع وأثناء اللعب — ادخل غرفة خاصة بدعوة وتحكم بحظر المتصلين'
                      : 'Calls are private-only (never during gameplay or public) with caller blocking'}
                  </div>
                </div>
              </div>
              <span className="text-xs font-black text-purple-300 shrink-0">
                {lang === 'ar' ? 'فتح ←' : 'Open →'}
              </span>
            </button>
          )}

          {/* Nickname & Avatar Customization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                {lang === 'ar' ? 'اسمك المستعار في المسابقة (يُحفظ تلقائياً):' : 'Your Nickname (Saved Automatically):'}
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => handleUpdateNickname(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                {lang === 'ar' ? 'أفاتار المتسابق:' : 'Contestant Avatar:'}
              </label>
              <div className="flex items-center gap-2">
                {['👑', '🦁', '⚡', '🚀', '🧠', '🦅', '🌸'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setPlayerAvatar(emoji)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border transition-all ${
                      playerAvatar === emoji ? 'bg-amber-500/20 border-amber-400 scale-110' : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 2A: WAITING FOR FRIEND (1V1 FRIEND DUEL BY 4-DIGIT PIN ONLY - NO LINKS)
         ========================================================================= */}
      {arenaState === 'waiting_friend' && (
        <div className="max-w-xl mx-auto p-6 sm:p-10 bg-slate-900/95 border-2 border-amber-500/50 rounded-3xl shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border-2 border-amber-400 flex items-center justify-center text-amber-400">
            <KeyRound className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-amber-300">
              {lang === 'ar' ? 'غرفة التحدي الثنائي جاهزة بالكود!' : '1v1 Duel PIN Ready!'}
            </h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <span>مجال الأسئلة:</span>
              <span className="text-amber-400">{CATEGORIES.find((c) => c.key === selectedCategory)?.icon}</span>
              <span>{CATEGORIES.find((c) => c.key === selectedCategory)?.ar || 'شامل'}</span>
            </div>
          </div>

          {/* 4-Digit PIN Card ONLY (No Links) */}
          <div className="p-5 rounded-3xl bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-amber-400/70 shadow-inner space-y-3">
            <div className="text-xs font-bold text-slate-400">
              {lang === 'ar' ? 'كود الدخول الخاص بالغرفة (4 أرقام فقط):' : 'Private 4-Digit Room PIN:'}
            </div>
            <div dir="ltr" className="text-4xl sm:text-5xl font-mono font-black tracking-[0.35em] text-amber-300 select-all">
              {roomCode}
            </div>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(roomCode).catch(() => {});
                setCopyPinToast(true);
                setTimeout(() => setCopyPinToast(false), 2000);
              }}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
            >
              <Copy className="w-4 h-4" />
              <span>
                {copyPinToast
                  ? (lang === 'ar' ? `✓ تم نسخ الكود (${roomCode}) بنجاح!` : `✓ PIN (${roomCode}) Copied!`)
                  : (lang === 'ar' ? '📋 نسخ كود الغرفة (4 أرقام فقط)' : '📋 Copy 4-Digit PIN')}
              </span>
            </button>
          </div>

          {/* Real-time Waiting Card */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-black text-amber-300">
                {lang === 'ar'
                  ? 'بانتظار إدخال صديقك للكود في خانة «دخول بالكود»...'
                  : 'Waiting for your friend to enter the 4-digit PIN...'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-slate-400 text-[10px]">{lang === 'ar' ? 'المتسابق الأول (أنت)' : 'Player 1 (You)'}</div>
                <div className="font-bold text-amber-300 flex items-center justify-center gap-1 mt-0.5">
                  <span>{playerAvatar}</span>
                  <span className="truncate">{playerName}</span>
                  <span className="text-emerald-400 text-xs font-bold">✓ متصل</span>
                </div>
              </div>

              <div className={`p-2.5 rounded-xl bg-slate-900 border ${contestants.length >= 2 ? 'border-emerald-500/60 bg-emerald-950/30' : 'border-dashed border-amber-500/40'} text-center transition-all`}>
                <div className="text-slate-400 text-[10px]">{lang === 'ar' ? 'المتسابق الثاني (صديقك)' : 'Player 2 (Friend)'}</div>
                {contestants.length >= 2 ? (
                  <div className="font-bold text-emerald-300 flex items-center justify-center gap-1 mt-0.5">
                    <span>{contestants[1]?.avatar || '⚡'}</span>
                    <span className="truncate">{contestants[1]?.name || (lang === 'ar' ? 'الصديق' : 'Friend')}</span>
                    <span className="text-emerald-400 text-xs font-bold">✓ دخل بالكود</span>
                  </div>
                ) : (
                  <div className="font-bold text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                    <span className="text-amber-400 text-xs">⏳</span>
                    <span className="text-[11px] text-amber-300/80">{lang === 'ar' ? 'بانتظار إدخال الكود' : 'Waiting for PIN'}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 font-bold">
              {contestants.length >= 2
                ? (lang === 'ar' ? '✅ دخل زميلك بالكود! جاري بدء المبارزة تلقائياً...' : '✅ Friend joined! Starting duel...')
                : (lang === 'ar' ? '🔒 سيبدأ التحدي وتظهر الأسئلة المتطابقة على الجهازين فور إدخال صديقك لهذا الكود' : '🔒 Starts simultaneously when friend enters this 4-digit PIN')}
            </div>
          </div>

          <button
            onClick={() => {
              if (matchType === '1v1_friend' && roomCode) {
                forfeitSentRef.current = true;
                forfeitRoom({
                  roomCode,
                  playerId: myPlayerId,
                  role: myRole,
                  matchType: '1v1_friend',
                  playerName,
                }).catch(() => {});
              }
              setArenaState('setup');
            }}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
          >
            {lang === 'ar' ? 'إلغاء والعودة' : 'Cancel & Back'}
          </button>
        </div>
      )}

      {/* =========================================================================
          STAGE 2B: 4-PLAYER 60-SEC WORLDWIDE SEARCH LOBBY WITH SMART BOT FILL
         ========================================================================= */}
      {arenaState === 'searching_4p' && (
        <div className="max-w-xl mx-auto p-6 sm:p-10 bg-slate-900/95 border-2 border-purple-500/50 rounded-3xl shadow-2xl text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <span className="absolute inline-flex h-20 w-20 rounded-full bg-purple-600/35"></span>
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xl">
              <span className="font-mono font-black text-xl">{searchTimeoutLeft}s</span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-purple-300">
              {lang === 'ar' ? 'جاري البحث عن 4 لاعبين حول العالم...' : 'Searching Worldwide for 4 Players...'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {lang === 'ar'
                ? `الأجهزة المتصلة الآن: (${fourPlayerQueueCount} من 4) — متبقي ${searchTimeoutLeft} ثانية لاكتمال التحدي وانطلاق الأسئلة تلقائياً.`
                : `Open devices connected: (${fourPlayerQueueCount} of 4) — ${searchTimeoutLeft}s remaining until match launch.`}
            </p>
          </div>

          {/* 4 Contestant Slots */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[0, 1, 2, 3].map((slotIdx) => {
              const isFilled = slotIdx < fourPlayerQueueCount;
              const slotPlayer = waitingPlayersList[slotIdx];
              return (
                <div
                  key={slotIdx}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isFilled
                      ? 'bg-purple-950/40 border-purple-500 text-purple-200 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="text-2xl mb-1">{isFilled ? (slotPlayer?.avatar || playerAvatar) : '⏳'}</div>
                  <div className="font-bold text-xs truncate">
                    {isFilled
                      ? (slotPlayer?.name || (slotIdx === 0 ? playerName : `لاعب ${slotIdx + 1}`))
                      : (lang === 'ar' ? 'مقعد مفتوح...' : 'Open seat...')}
                  </div>
                  <div className="text-[10px] mt-0.5 opacity-70">
                    {isFilled ? 'متصل ✓' : 'ينتظر جهازاً...'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-xs text-purple-200 font-bold">
            {lang === 'ar'
              ? `🌍 أي جهاز يفتح الآن ينضم معك في نفس الغرفة فوراً (${fourPlayersNeeded} مقاعد متبقية) — يبدأ التحدي تلقائياً عند انتهاء العداد.`
              : `🌍 Any device worldwide joins this room immediately (${fourPlayersNeeded} left) — launches automatically at 0s.`}
          </div>

          <div className="pt-1 flex items-center justify-center">
            <button
              onClick={() => {
                hasJoined4pRef.current = false;
                hasFilledBotsRef.current = false;
                hasMatched4pRef.current = false;
                leave4PlayerQueue(myDeviceId).catch(() => {});
                setArenaState('setup');
              }}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
            >
              {lang === 'ar' ? 'إلغاء الانتظار' : 'Cancel Waiting'}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 3: LIVE PLAYING ARENA (FORCED AUTO-ADVANCE & LIFELINES & SCORE SYNC)
         ========================================================================= */}
      {arenaState === 'playing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Contest Stage (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Live Scoreboard Strip */}
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
                <span className="font-bold flex items-center gap-1.5 text-amber-300">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'ar' ? 'لوحة النقاط المباشرة' : 'Live Scoreboard'}</span>
                </span>
                <span className="font-mono text-slate-400">
                  {lang === 'ar' ? `السؤال ${currentRound} من ${roundsCount}` : `Question ${currentRound} of ${roundsCount}`}
                </span>
              </div>

              {/* Contestants Cards (1v1 or 4-Players) */}
              <div className={`grid gap-2.5 ${matchType === '4player' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}`}>
                {(contestants.length >= 2 ? contestants : ([
                  { id: myPlayerId, name: playerName, avatar: playerAvatar, country: 'SA', role: myRole, score: getScoreForRole(myRole), status: (selectedOption !== null ? 'answered' : 'thinking'), lastIsCorrect: selectedOption !== null ? (selectedOption === currentQuestion.correctIndex) : undefined, lastPointsEarned: selectedOption !== null ? (selectedOption === currentQuestion.correctIndex ? 50 : 0) : undefined },
                  { id: 'opp', name: (lang === 'ar' ? 'الخصم' : 'Opponent'), avatar: '⚡', country: 'AE', role: (myRole === 'player1_host' ? 'player2_guest' : 'player1_host'), score: (myRole === 'player1_host' ? liveScores.player2_score : liveScores.player1_score), status: 'thinking' },
                ] as ContestantInfo[])).map((cont, cIdx, arr) => {
                  const roleScore = getScoreForRole(cont.role as DuelRole);
                  const displayScore = typeof cont.score === 'number' ? Math.max(roleScore, cont.score) : roleScore;
                  const hasMyIdInList = arr.some((x) => x.id === myPlayerId);
                  const isMe = hasMyIdInList ? cont.id === myPlayerId : cont.role === myRole;
                  const hasAnswered = isMe
                    ? selectedOption !== null
                    : (cont.status === 'answered' && (cont.answeredRound === undefined || cont.answeredRound === currentRound - 1));
                  const answeredCorrectly = isMe
                    ? (selectedOption === currentQuestion.correctIndex)
                    : cont.lastIsCorrect;
                  const earnedPts = isMe
                    ? (selectedOption === currentQuestion.correctIndex ? 50 : 0)
                    : (typeof cont.lastPointsEarned === 'number' ? cont.lastPointsEarned : (answeredCorrectly ? 50 : 0));

                  return (
                    <div
                      key={cIdx}
                      className={`p-2.5 rounded-2xl border text-center transition-all ${
                        isMe
                          ? 'bg-amber-500/10 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                          : hasAnswered && answeredCorrectly === true
                          ? 'bg-emerald-950/30 border-emerald-500/50'
                          : hasAnswered && answeredCorrectly === false
                          ? 'bg-rose-950/30 border-rose-500/50'
                          : 'bg-slate-950/80 border-slate-800'
                      }`}
                    >
                      <div className="text-xl mb-1">{cont.avatar || '👤'}</div>
                      <div className="font-black text-xs text-slate-100 truncate flex items-center justify-center gap-1">
                        <span>{cont.name}</span>
                        {isMe && <span className="text-[9px] px-1 bg-amber-400 text-slate-950 rounded font-bold">{lang === 'ar' ? 'أنت' : 'You'}</span>}
                      </div>

                      {/* Live Score Display */}
                      <div className="text-xs font-mono font-black text-amber-400 mt-1">
                        {displayScore.toLocaleString()} {lang === 'ar' ? 'نقطة' : 'pts'}
                      </div>

                      {/* Immediate Live Result Badge on Both Devices */}
                      <div className="mt-1.5 text-[10px] font-bold">
                        {hasAnswered ? (
                          answeredCorrectly === true ? (
                            <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded-full border border-emerald-500/40">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>{lang === 'ar' ? `صحيحة (+${earnedPts})` : `Correct (+${earnedPts})`}</span>
                            </span>
                          ) : answeredCorrectly === false ? (
                            <span className="inline-flex items-center gap-1 text-rose-300 bg-rose-500/15 px-1.5 py-0.5 rounded-full border border-rose-500/40">
                              <XCircle className="w-3 h-3 text-rose-400" />
                              <span>{lang === 'ar' ? 'خاطئة (0)' : 'Wrong (0)'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>{lang === 'ar' ? 'أجاب ✓' : 'Answered'}</span>
                            </span>
                          )
                        ) : isReadingTTS ? (
                          <span className="inline-flex items-center gap-1 text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-full border border-blue-500/20">
                            <Volume2 className="w-3 h-3" />
                            <span>{lang === 'ar' ? 'استماع...' : 'Reading'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            <span>{lang === 'ar' ? 'يفكر...' : 'Thinking'}</span>
                          </span>
                        )}
                      </div>

                      {/* Block & Report Controls for every remote opponent inside the room */}
                      {!isMe && !cont.isBot && cont.id && (
                        <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-center gap-1">
                          {isPlayerBlocked(cont.id) ? (
                            <button
                              type="button"
                              onClick={() => handleUnblockRoomPlayer(cont.id)}
                              className="px-1.5 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-[10px] font-bold flex items-center gap-0.5 transition"
                              title={lang === 'ar' ? 'إلغاء الحظر' : 'Unblock'}
                            >
                              <Ban className="w-2.5 h-2.5 text-emerald-400" />
                              <span>{lang === 'ar' ? 'محظور' : 'Blocked'}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleBlockRoomPlayer(cont.id, cont.name, cont.avatar || '👤')}
                              className="px-1.5 py-0.5 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white text-[10px] font-bold flex items-center gap-0.5 transition"
                              title={lang === 'ar' ? 'حظر هذا اللاعب وكتم صوته' : 'Block player'}
                            >
                              <Ban className="w-2.5 h-2.5" />
                              <span>{lang === 'ar' ? 'حظر' : 'Block'}</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setReportTarget({
                                id: cont.id,
                                name: cont.name,
                                avatar: cont.avatar || '👤',
                                roomId: roomCode,
                              })
                            }
                            className="px-1.5 py-0.5 rounded-lg bg-amber-500/85 hover:bg-amber-400 text-slate-950 text-[10px] font-black flex items-center gap-0.5 transition"
                            title={lang === 'ar' ? 'إبلاغ عن هذا اللاعب' : 'Report player'}
                          >
                            <Flag className="w-2.5 h-2.5" />
                            <span>{lang === 'ar' ? 'إبلاغ' : 'Report'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LIFELINES BAR + MIC BUTTON (For BOTH 1v1 Duel & 4-Player Group Arena) */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-around gap-2">
              <button
                onClick={handle5050}
                disabled={!lifelines.fiftyFifty || selectedOption !== null || isRoundRevealed || isRevivalOpen || rtcInCall}
                className={`flex-1 py-2 px-2 rounded-xl border flex flex-col items-center gap-1 transition ${
                  lifelines.fiftyFifty && selectedOption === null && !isRoundRevealed && !isRevivalOpen && !rtcInCall
                    ? 'bg-slate-900 border-amber-500/40 text-amber-300 hover:bg-slate-800 active:scale-95'
                    : 'bg-slate-950 border-slate-800 text-slate-600 line-through opacity-40 cursor-not-allowed'
                }`}
                title={lang === 'ar' ? 'حذف خيارين 50:50' : '50:50 Lifeline'}
              >
                <span className="font-mono font-black text-xs">50:50</span>
                <span className="text-[10px]">{lang === 'ar' ? 'حذف إجابتين' : '50:50'}</span>
              </button>

              <button
                onClick={handleAskAudience}
                disabled={!lifelines.askAudience || selectedOption !== null || isRoundRevealed || isRevivalOpen || rtcInCall}
                className={`flex-1 py-2 px-2 rounded-xl border flex flex-col items-center gap-1 transition ${
                  lifelines.askAudience && selectedOption === null && !isRoundRevealed && !isRevivalOpen && !rtcInCall
                    ? 'bg-slate-900 border-blue-500/40 text-blue-300 hover:bg-slate-800 active:scale-95'
                    : 'bg-slate-950 border-slate-800 text-slate-600 line-through opacity-40 cursor-not-allowed'
                }`}
                title={lang === 'ar' ? 'رأي الجمهور' : 'Ask Audience'}
              >
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span className="text-[10px]">{lang === 'ar' ? 'الجمهور' : 'Audience'}</span>
              </button>

              <button
                onClick={handlePhoneFriend}
                disabled={!lifelines.phoneFriend || selectedOption !== null || isRoundRevealed || isRevivalOpen || rtcInCall}
                className={`flex-1 py-2 px-2 rounded-xl border flex flex-col items-center gap-1 transition ${
                  lifelines.phoneFriend && selectedOption === null && !isRoundRevealed && !isRevivalOpen && !rtcInCall
                    ? 'bg-slate-900 border-emerald-500/40 text-emerald-300 hover:bg-slate-800 active:scale-95'
                    : 'bg-slate-950 border-slate-800 text-slate-600 line-through opacity-40 cursor-not-allowed'
                }`}
                title={lang === 'ar' ? 'اتصال بصديق' : 'Phone a Friend'}
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px]">{lang === 'ar' ? 'صديق' : 'Friend'}</span>
              </button>

              {/* Mic Button directly next to Lifelines for both 1v1 and Group play */}
              <button
                onClick={() => {
                  if (!isVip) {
                    onOpenVip?.();
                    return;
                  }
                  rtcCallManager.toggleMic();
                }}
                className={`flex-1 py-2 px-2 rounded-xl border flex flex-col items-center gap-1 transition active:scale-95 ${
                  !isVip
                    ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 hover:bg-amber-500/25'
                    : micOn
                    ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300 hover:bg-emerald-500/25'
                    : 'bg-rose-500/15 border-rose-500/60 text-rose-300 hover:bg-rose-500/25'
                }`}
                title={
                  !isVip
                    ? lang === 'ar'
                      ? 'افتح الميكروفون عبر عضوية VIP'
                      : 'Unlock Microphone with VIP'
                    : lang === 'ar'
                    ? 'فتح أو قفل الميكروفون'
                    : 'Open or Close Microphone'
                }
              >
                <div className="flex items-center gap-1">
                  {!isVip ? (
                    <Crown className="w-4 h-4 text-amber-400" />
                  ) : micOn ? (
                    <Mic className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <MicOff className="w-4 h-4 text-rose-400" />
                  )}
                  {isVip && micOn && micLevel > 10 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </div>
                <span className="text-[10px] font-black">
                  {!isVip
                    ? lang === 'ar'
                      ? 'مايك VIP'
                      : 'VIP Mic'
                    : micOn
                    ? lang === 'ar'
                      ? 'المايك مفتوح'
                      : 'Mic ON'
                    : lang === 'ar'
                    ? 'المايك مقفول'
                    : 'Mic OFF'}
                </span>
              </button>
            </div>

            {/* Live Voice Status & Speaker Controls for 1v1 & 4-Player Rooms */}
            {reportToast && (
              <div className="px-3 py-2 bg-emerald-500/15 border border-emerald-400/60 rounded-xl text-center text-xs font-black text-emerald-300 animate-fadeIn">
                ✅ {reportToast}
              </div>
            )}
            {audioPlaybackBlocked && matchRemoteStreams.length > 0 && !speakerMuted && (
              <button
                type="button"
                onClick={() => {
                  setAudioPlaybackBlocked(false);
                  document.querySelectorAll('audio').forEach((el) => {
                    try {
                      el.muted = false;
                      el.volume = 1;
                      el.play().catch(() => {});
                    } catch {}
                  });
                }}
                className="w-full px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg animate-pulse"
              >
                <Volume2 className="w-4 h-4" />
                <span>
                  {lang === 'ar'
                    ? '🔊 اضغط هنا لتفعيل سماع صوت اللاعبين المباشر'
                    : '🔊 Tap here to enable live player voice audio'}
                </span>
              </button>
            )}
            {matchRemoteStreams.length > 0 && (
              <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-[11px] text-emerald-300 font-bold">
                <div className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {lang === 'ar'
                      ? `🎙️ الصوت المباشر متصل (${matchRemoteStreams.length} لاعب) — تسمعون بعضكم الآن`
                      : `🎙️ Live Match Voice Connected (${matchRemoteStreams.length} player)`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => rtcCallManager.toggleSpeaker()}
                  className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:border-emerald-400 transition"
                >
                  {speakerMuted ? (lang === 'ar' ? '🔇 السماعة مكتومة' : 'Speaker Muted') : (lang === 'ar' ? '🔊 السماعة مفتوحة' : 'Speaker ON')}
                </button>
              </div>
            )}


            {/* Auto-Revive with Reward Points Banner */}
            {autoReviveNotice && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-400/60 rounded-2xl text-center text-xs font-black text-emerald-300">
                {lang === 'ar'
                  ? '⚡ إجابة غير صحيحة — تم خصم 50 نقطة من رصيدك لتكمل في نفس السؤال بدون حذف أي خيار!'
                  : '⚡ Wrong answer — 50 points used so you can continue the same question with all choices intact!'}
              </div>
            )}

            {/* Active Call Question Disconnect / Pause Guard */}
            {rtcInCall ? (
              <div className="p-6 sm:p-8 bg-slate-900/95 border-2 border-rose-500/60 rounded-3xl shadow-2xl text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/50 flex items-center justify-center text-rose-300">
                  <PhoneOff className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-rose-200">
                  {lang === 'ar'
                    ? 'مكالمة نشطة الآن — تم فصل الأسئلة مؤقتاً'
                    : 'Call Active — Questions Paused Temporarily'}
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  {lang === 'ar'
                    ? 'أثناء المكالمات يتم فصل الأسئلة وإيقاف المؤقت تلقائياً حتى تنتهي المكالمة.'
                    : 'Questions and timers pause automatically while an audio/video call is active.'}
                </p>
                <button
                  onClick={() => rtcCallManager.hangup()}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg transition inline-flex items-center gap-2"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'إنهاء المكالمة واستئناف الأسئلة' : 'End Call & Resume Questions'}</span>
                </button>
              </div>
            ) : (
            /* Question Card */
            <div className="p-5 sm:p-7 bg-slate-900 border-2 border-amber-500/30 rounded-3xl shadow-2xl space-y-4">
              {/* Category, AI Narrator Controls & Timer Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-full">
                  {CATEGORIES.find((c) => c.key === selectedCategory)?.ar || currentQuestion.category}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Manual Play / Stop AI Question Narrator */}
                  <button
                    type="button"
                    onClick={handleToggleMpSpeak}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition active:scale-95 ${
                      isSpeakingLive || isReadingTTS
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                    title={lang === 'ar' ? 'تشغيل أو إيقاف ناطق الأسئلة' : 'Play or Stop Question Narrator'}
                  >
                    {isSpeakingLive || isReadingTTS ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                        <span>{lang === 'ar' ? 'إيقاف الصوت' : 'Stop Voice'}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>{lang === 'ar' ? 'ناطق السؤال' : 'Read Question'}</span>
                      </>
                    )}
                  </button>

                  {/* Auto-Read Toggle */}
                  <button
                    type="button"
                    onClick={handleToggleMpAutoRead}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition active:scale-95 ${
                      autoRead
                        ? 'bg-blue-600/20 text-blue-300 border-blue-500/60'
                        : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                    title={lang === 'ar' ? 'تفعيل أو إيقاف القراءة التلقائية' : 'Toggle auto-read'}
                  >
                    <Radio className={`w-3 h-3 ${autoRead ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span>{lang === 'ar' ? (autoRead ? 'تلقائي ✓' : 'تلقائي ✕') : (autoRead ? 'Auto ✓' : 'Auto ✕')}</span>
                  </button>

                  {/* Timer Badge (clickable during TTS to skip straight to 40s countdown) */}
                  {isReadingTTS && !isTimerRunning ? (
                    <button
                      type="button"
                      onClick={handleSkipTTS}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-black border bg-blue-950/70 hover:bg-blue-900/80 border-blue-400 text-blue-200 transition active:scale-95"
                      title={lang === 'ar' ? 'تخطي القراءة وبدء المؤقت فوراً' : 'Skip reading & start timer'}
                    >
                      <Play className="w-3.5 h-3.5 text-amber-300" />
                      <span>{lang === 'ar' ? 'صوت المذيع (تخطي)' : 'AI Voice (Skip)'}</span>
                    </button>
                  ) : (
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-black border transition-all ${
                        timeLeft <= 8
                          ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                          : 'bg-slate-950 border-slate-700 text-amber-400'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>{timeLeft}s</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-100 leading-relaxed text-center py-2">
                {questionText}
              </h2>

              {/* 4 Answer Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {options.map((optText, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQuestion.correctIndex;
                  const isWrong = isSelected && !isCorrect;
                  const isEliminated = eliminatedOptions.includes(idx);

                  let btnStyle = 'bg-slate-950/90 border-slate-700/80 text-slate-200 hover:border-amber-400 hover:bg-slate-800/90';

                  if (isEliminated) {
                    btnStyle = 'bg-slate-950/20 border-slate-900 text-slate-700 opacity-20 pointer-events-none line-through';
                  } else if (isRoundRevealed) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-500/20';
                    } else if (isWrong) {
                      btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-200';
                    } else {
                      btnStyle = 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-50';
                    }
                  } else if (isSelected) {
                    btnStyle = 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/50';
                  } else if (wrongAttemptFlash === idx) {
                    btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-200 ring-2 ring-rose-500/40';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={selectedOption !== null || isRoundRevealed || isEliminated}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 text-start flex items-center justify-between gap-3 transition-all duration-200 active:scale-98 ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-amber-400 text-xs shrink-0">
                          {letterLabels[idx]}
                        </span>
                        <span className="font-bold text-xs sm:text-sm">{optText}</span>
                      </div>

                      {isRoundRevealed && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                      {isRoundRevealed && isWrong && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Non-blocking Live Opponent Result Strip when an opponent answered BEFORE local player */}
              {selectedOption === null && !isRoundRevealed && contestants.some((c) => c.id !== myPlayerId && c.role !== myRole && c.status === 'answered' && (c.answeredRound === undefined || c.answeredRound === currentRound - 1)) && (
                <div className="p-3 bg-indigo-950/40 border border-indigo-500/40 rounded-2xl text-center space-y-1.5 animate-fadeIn">
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-black">
                    {contestants
                      .filter((c) => c.id !== myPlayerId && c.role !== myRole && c.status === 'answered' && (c.answeredRound === undefined || c.answeredRound === currentRound - 1))
                      .map((c, idx) => (
                        <span
                          key={c.id || idx}
                          className={`px-2.5 py-1 rounded-xl border ${
                            c.lastIsCorrect === true
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                              : c.lastIsCorrect === false
                              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                              : 'bg-slate-900 border-slate-700 text-amber-300'
                          }`}
                        >
                          📣 {c.avatar || '⚡'} {c.name}:{' '}
                          {c.lastIsCorrect === true
                            ? (lang === 'ar' ? `✅ إجابة صحيحة (+${c.lastPointsEarned ?? 50})` : `✅ Correct (+${c.lastPointsEarned ?? 50})`)
                            : c.lastIsCorrect === false
                            ? (lang === 'ar' ? '❌ إجابة خاطئة (0)' : '❌ Wrong (0)')
                            : (lang === 'ar' ? 'أجاب ✓' : 'Answered ✓')}{' '}
                          • {Math.max(getScoreForRole(c.role), c.score || 0)} {lang === 'ar' ? 'نقطة' : 'pts'}
                        </span>
                      ))}
                  </div>
                  <div className="text-[11px] text-amber-300 font-bold">
                    {lang === 'ar'
                      ? '👇 اختر إجابتك الآن من جهازك — الخيارات مفتوحة لك!'
                      : '👇 Choose your own answer now — all your buttons remain open!'}
                  </div>
                </div>
              )}

              {/* Local Player Immediate Result + Live Points while Waiting for Remaining Players */}
              {selectedOption !== null && !isRoundRevealed && (
                <div
                  className={`p-3.5 rounded-2xl text-center space-y-1.5 animate-fadeIn border ${
                    selectedOption === currentQuestion.correctIndex
                      ? 'bg-emerald-950/35 border-emerald-500/50'
                      : 'bg-rose-950/35 border-rose-500/50'
                  }`}
                >
                  <div
                    className={`text-xs font-black flex items-center justify-center gap-1.5 ${
                      selectedOption === currentQuestion.correctIndex ? 'text-emerald-300' : 'text-rose-300'
                    }`}
                  >
                    {selectedOption === currentQuestion.correctIndex ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{lang === 'ar' ? '✅ إجابتك صحيحة! (+50 نقطة)' : '✅ Correct Answer! (+50 pts)'}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>{lang === 'ar' ? '❌ إجابتك خاطئة (0 نقطة)' : '❌ Wrong Answer (0 pts)'}</span>
                      </>
                    )}
                  </div>
                  <div className="text-[11px] font-mono font-bold text-amber-300">
                    {matchType === '1v1_friend'
                      ? (lang === 'ar'
                          ? `نقاطك: ${getScoreForRole(myRole)} نقطة | الخصم: ${myRole === 'player1_host' ? liveScores.player2_score : liveScores.player1_score} نقطة`
                          : `You: ${getScoreForRole(myRole)} pts | Opponent: ${myRole === 'player1_host' ? liveScores.player2_score : liveScores.player1_score} pts`)
                      : (lang === 'ar' ? `نقاطك الآن: ${getScoreForRole(myRole)} نقطة` : `Your score: ${getScoreForRole(myRole)} pts`)}
                  </div>
                  <div className="text-[11px] text-slate-300 font-semibold">
                    {lang === 'ar'
                      ? '⏱️ بانتظار إجابة بقية المتسابقين — لن ينتقل السؤال قبل إجابة الجميع أو انتهاء الـ 40 ثانية.'
                      : '⏱️ Waiting for remaining players — question advances after all answer or 40s timer ends.'}
                  </div>
                </div>
              )}

              {/* FORCED AUTO-ADVANCE BANNER (No manual Next button!) */}
              {isRoundRevealed && (
                <div className="pt-3 border-t border-slate-800 space-y-3 animate-fadeIn">
                  {/* All Players Round Result Summary */}
                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-2 text-center shadow-lg">
                    <div className="font-bold text-amber-300">
                      {lang === 'ar'
                        ? (matchType === '4player' ? '📊 نتائج المتسابقين الأربعة:' : '📊 نتيجة السؤال بينكما:')
                        : (matchType === '4player' ? '📊 4-Player Scores:' : '📊 Round Result Comparison:')}
                    </div>
                    {matchType === '4player' && contestants.length > 0 ? (
                      <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono font-black">
                        {contestants.map((c, rIdx) => {
                          const hasMyIdInList = contestants.some((x) => x.id === myPlayerId);
                          const isMe = hasMyIdInList ? c.id === myPlayerId : c.role === myRole;
                          return (
                            <span
                              key={c.id || rIdx}
                              className={`px-2 py-0.5 rounded-lg border ${
                                isMe
                                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                                  : 'border-slate-800 bg-slate-900 text-slate-300'
                              }`}
                            >
                              {c.avatar} {isMe ? (lang === 'ar' ? 'أنت' : 'You') : c.name}: {getScoreForRole(c.role as DuelRole)}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-4 text-xs font-mono font-black">
                        <span className={selectedOption === currentQuestion.correctIndex ? 'text-emerald-400' : 'text-rose-400'}>
                          {lang === 'ar' ? 'أنت' : 'You'}: {selectedOption === currentQuestion.correctIndex ? (lang === 'ar' ? 'صح ✅' : 'Correct') : (lang === 'ar' ? 'خطأ ❌' : 'Wrong')} ({getScoreForRole(myRole)} نقطة)
                        </span>
                        <span className="text-slate-600">|</span>
                        <span className="text-blue-300">
                          {lang === 'ar' ? 'الخصم' : 'Opponent'}: {myRole === 'player1_host' ? liveScores.player2_score : liveScores.player1_score} نقطة
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs text-slate-300">
                    <span className="font-bold text-amber-400">💡 {lang === 'ar' ? 'التوضيح:' : 'Explanation:'} </span>
                    <span>{lang === 'ar' ? currentQuestion.explanationAr : currentQuestion.explanationEn}</span>
                  </div>

                  {/* Automatic Auto-Advance Countdown Indicator */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center gap-2 text-amber-300 font-bold text-xs">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>
                      {autoAdvanceCountdown !== null
                        ? (lang === 'ar'
                            ? `الانتقال التلقائي للسؤال التالي بعد نزول العداد خلال ${autoAdvanceCountdown} ثوانٍ...`
                            : `Auto-advancing to next question in ${autoAdvanceCountdown}s...`)
                        : (lang === 'ar' ? 'جاري الانتقال التلقائي...' : 'Advancing automatically...')}
                    </span>
                  </div>
                </div>
              )}
            </div>
            )}
          </div>

          {/* Realtime Chat Column (1 Col) with Delete for Everyone */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl flex flex-col h-[560px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span className="font-black text-xs text-slate-200">
                  {lang === 'ar' ? 'الدردشة المباشرة للمبارزة' : 'Live Duel Chat'}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">● متصل</span>
            </div>

            {/* Chat Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
              {chatMessages.map((msg) => {
                const isMine = msg.senderId === myPlayerId;
                const isSys = msg.isSystem;

                if (isSys) {
                  return (
                    <div key={msg.id} className="text-center py-1">
                      <span className="text-[10px] text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-full border border-slate-800 inline-block">
                        {msg.senderAvatar} {msg.text}
                      </span>
                    </div>
                  );
                }

                if (!isMine && isPlayerBlocked(msg.senderId)) {
                  return null;
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col group ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-bold">
                        {msg.senderAvatar} {msg.senderName}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">{msg.time}</span>
                      {!isMine && msg.senderId && msg.senderId !== 'system' && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              handleBlockRoomPlayer(msg.senderId, msg.senderName, msg.senderAvatar || '👤')
                            }
                            className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-0.5"
                            title={lang === 'ar' ? 'حظر اللاعب' : 'Block Player'}
                          >
                            <Ban className="w-2.5 h-2.5" />
                            <span>{lang === 'ar' ? 'حظر' : 'Block'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setReportTarget({
                                id: msg.senderId,
                                name: msg.senderName,
                                avatar: msg.senderAvatar || '👤',
                                roomId: roomCode,
                              })
                            }
                            className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5"
                            title={lang === 'ar' ? 'إبلاغ عن اللاعب' : 'Report Player'}
                          >
                            <Flag className="w-2.5 h-2.5" />
                            <span>{lang === 'ar' ? 'إبلاغ' : 'Report'}</span>
                          </button>
                        </>
                      )}
                    </div>

                    <div
                      className={`relative max-w-[85%] px-3 py-1.5 rounded-2xl text-xs break-words shadow ${
                        isMine
                          ? 'bg-amber-500 text-slate-950 font-bold rounded-tr-none'
                          : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/80'
                      }`}
                    >
                      <span>{msg.text}</span>
                      {isMine && (
                        <button
                          onClick={() => handleDeleteChatMessage(msg.id)}
                          className="opacity-70 hover:opacity-100 text-[10px] ml-1.5 inline-block text-rose-900 hover:text-rose-950 transition"
                          title={lang === 'ar' ? 'حذف لدى الجميع' : 'Delete for Everyone'}
                        >
                          <Trash2 className="w-3 h-3 inline" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Emojis */}
            <div className="flex items-center gap-1 py-1.5 overflow-x-auto no-scrollbar border-t border-slate-800">
              {['👏', '🧠', '😱', '🔥', '🏆', '🤔', '💯', '🤝', '👑', '⚡'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setChatInput((prev) => prev + emoji)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-sm transition"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={lang === 'ar' ? 'اكتب رسالة للجميع...' : 'Type a message...'}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-slate-950 rounded-xl transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 4: CHAMPIONSHIP PODIUM (تتويج المراكز والنتائج النهائية)
         ========================================================================= */}
      {arenaState === 'podium' && (
        <div className="max-w-2xl mx-auto p-6 sm:p-10 bg-slate-900/95 border-2 border-amber-500/50 rounded-3xl shadow-2xl text-center space-y-6 animate-fadeIn">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 p-1 shadow-2xl flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-amber-400">
              {forfeitClosedInfo ? <Lock className="w-10 h-10 text-rose-400" /> : <Trophy className="w-10 h-10" />}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">
              {forfeitClosedInfo
                ? (lang === 'ar' ? 'تم إغلاق المسابقة عند الطرفين' : 'Match Closed for Both Players')
                : (lang === 'ar' ? 'منصة التتويج والنتائج الرسمية' : 'Championship Podium & Results')}
            </h2>
            <p className="text-xs text-slate-300">
              {forfeitClosedInfo
                ? (lang === 'ar'
                    ? `🔒 انسحب (${forfeitClosedInfo.forfeiterName || 'أحد المتسابقين'}) من التحدي، فتم قفل الأسئلة وإنهاء المبارزة عندكما فوراً.`
                    : `🔒 A player withdrew from the duel. Questions have been locked and the match is closed for both sides.`)
                : (lang === 'ar'
                    ? 'انتهت المسابقة بنجاح! الترتيب النهائي للمتسابقين بناءً على مجموع النقاط وسرعة الإجابة.'
                    : 'Match concluded! Final standings based on total score and response speed.')}
            </p>
          </div>

          {/* Sorted Scoreboard Ranking */}
          <div className="space-y-2.5">
            {[
              { role: 'player1_host' as DuelRole, defaultName: 'المتسابق الأول', avatar: '👑' },
              { role: 'player2_guest' as DuelRole, defaultName: 'المتسابق الثاني', avatar: '⚡' },
              { role: 'player3_guest' as DuelRole, defaultName: 'المتسابق الثالث', avatar: '🦅' },
              { role: 'player4_guest' as DuelRole, defaultName: 'المتسابق الرابع', avatar: '🌟' },
            ]
              .slice(0, matchType === '4player' ? 4 : 2)
              .map((slot) => {
                const cont = contestants.find((c) => c.role === slot.role);
                const score = getScoreForRole(slot.role);
                const isMe = slot.role === myRole;
                return {
                  role: slot.role,
                  name: isMe ? playerName : (cont?.name || slot.defaultName),
                  avatar: isMe ? playerAvatar : (cont?.avatar || slot.avatar),
                  score,
                  isMe,
                };
              })
              .sort((a, b) => b.score - a.score)
              .map((contestant, rankIdx) => {
                const medals = ['🥇', '🥈', '🥉', '🎖️'];
                const rankLabels = lang === 'ar'
                  ? ['المركز الأول (البطل 🏆)', 'المركز الثاني 🥈', 'المركز الثالث 🥉', 'المركز الرابع 🎖️']
                  : ['1st Place (Champion 🏆)', '2nd Place 🥈', '3rd Place 🥉', '4th Place 🎖️'];

                return (
                  <div
                    key={rankIdx}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      rankIdx === 0
                        ? 'bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-500/20'
                        : rankIdx === 1
                        ? 'bg-slate-800/80 border-slate-600'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{medals[rankIdx]}</span>
                      <span className="text-xl">{contestant.avatar}</span>
                      <div className="text-start">
                        <div className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
                          <span>{contestant.name}</span>
                          {contestant.isMe && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded font-black">
                              {lang === 'ar' ? 'أنت' : 'You'}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">{rankLabels[rankIdx]}</div>
                      </div>
                    </div>

                    <div className="text-end">
                      <div className="text-base font-black font-mono text-amber-400">
                        {contestant.score.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500">{lang === 'ar' ? 'نقطة' : 'points'}</div>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={handleRequestBack}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition"
            >
              {lang === 'ar' ? 'الرجوع للقائمة الرئيسية' : 'Back to Main Menu'}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          INTERACTIVE MODALS (LIFELINES, REVIVAL WITH POINTS, FORFEIT WARNING)
         ========================================================================= */}
      {/* 1. Audience Poll Modal */}
      <AudiencePollModal
        isOpen={audienceResult !== null}
        onClose={() => setAudienceResult(null)}
        voteResult={audienceResult}
        lang={lang}
        options={options}
      />

      {/* 2. Phone a Friend Modal */}
      <PhoneFriendModal
        isOpen={phoneResult !== null}
        onClose={() => setPhoneResult(null)}
        result={phoneResult}
        lang={lang}
        options={options}
      />

      {/* 3. Revival With Points Modal (لو عاوز يكمل يخصم 50 نقطة) */}
      {isRevivalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border-2 border-amber-500/70 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border-2 border-amber-400 flex items-center justify-center text-amber-400">
              <Heart className="w-7 h-7 fill-amber-400 text-amber-400" />
            </div>

            <h3 className="text-lg font-black text-amber-300">
              {lang === 'ar' ? 'إجابة خاطئة! هل تريد خصم 50 نقطة للمواصلة؟' : 'Incorrect! Deduct 50 Points to Continue?'}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'ar'
                ? `رصيدك الحالي: ${userPoints} نقطة — يمكنك خصم 50 نقطة للمواصلة ومحاولة الإجابة على نفس السؤال، أو عدم الخصم وتسجيل الإجابة الخاطئة.`
                : `Current balance: ${userPoints} pts — Spend 50 points to continue on this question, or record the wrong answer without deducting.`}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleDeclineRevive}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
              >
                {lang === 'ar' ? 'لا، أكمل بدون خصم' : 'No, Record Wrong'}
              </button>
              <button
                onClick={handleReviveWithPoints}
                disabled={userPoints < 50}
                className="py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl shadow-lg transition"
              >
                {lang === 'ar' ? 'مواصلة (خصم 50 نقطة)' : 'Continue (-50 pts)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Forfeit Warning Modal */}
      {showForfeitModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border-2 border-rose-500/60 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border-2 border-rose-500 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-rose-300">
              {lang === 'ar' ? 'تحذير: الانسحاب من المباراة!' : 'Warning: Forfeit Challenge!'}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'ar'
                ? 'الخروج الآن يعني الانسحاب وخسارة التحدي! سيتم احتساب النتيجة لصالح المنافس.'
                : 'Exiting now means forfeiting and losing the match! Opponent will be awarded the win.'}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowForfeitModal(false)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition"
              >
                {lang === 'ar' ? 'البقاء في اللعبة' : 'Stay in Game'}
              </button>
              <button
                onClick={handleConfirmForfeit}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg transition"
              >
                {lang === 'ar' ? 'تأكيد الانسحاب والخروج' : 'Confirm Forfeit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Always-mounted Live Remote Voice Audio Sinks for 1v1 & 4-Player Rooms (waiting + playing) */}
      {(arenaState === 'playing' || arenaState === 'waiting_friend') &&
        matchRemoteStreams.map((rs) => (
          <MatchAudioSink
            key={rs.peerId}
            stream={rs.stream}
            muted={speakerMuted}
            onPlaybackBlocked={() => setAudioPlaybackBlocked(true)}
            onPlaybackStarted={() => setAudioPlaybackBlocked(false)}
          />
        ))}

      {/* 5. Report Player Modal */}
      <ReportPlayerModal
        isOpen={reportTarget !== null}
        target={reportTarget}
        lang={lang}
        reporterId={myPlayerId}
        reporterName={playerName}
        onClose={() => setReportTarget(null)}
        onBlockPlayer={(t) => handleBlockRoomPlayer(t.id, t.name, t.avatar || '👤')}
        onReported={(rec) => {
          setReportToast(
            lang === 'ar'
              ? `تم حفظ البلاغ ضد (${rec.reportedName}) بنجاح`
              : `Report against (${rec.reportedName}) saved successfully`
          );
          window.setTimeout(() => setReportToast(null), 4500);
        }}
      />
    </div>
  );
};
