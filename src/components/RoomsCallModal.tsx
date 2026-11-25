import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  Lock,
  Video,
  Phone,
  PhoneOff,
  Send,
  Trash2,
  Copy,
  Check,
  Mic,
  MicOff,
  Users,
  PlusCircle,
  LogIn,
  Ban,
  Flag,
  ShieldCheck,
  Wifi,
  Crown,
} from 'lucide-react';
import { ChatMessage, Language, UserProfile } from '../types/game';
import {
  generatePrivateRoomCode,
  normalizePrivateRoomCode,
  rtcCallManager,
  RtcSnapshot,
} from '../services/rtcCallManager';
import { sounds } from '../utils/soundEffects';
import { ReportPlayerModal, ReportTarget } from './ReportPlayerModal';
import {
  subscribeRoomMessages,
  sendRoomMessage,
  deleteRoomMessage,
} from '../services/firebaseRoomService';
import {
  vipBillingService,
  VipServiceSnapshot,
  VIDEO_QUOTA_LIMIT_MINUTES,
} from '../services/vipBillingService';

interface RoomsCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  userProfile: UserProfile;
  initialTab?: 'public' | 'private';
  privateRoomId: string;
  onChangePrivateRoomId: (roomId: string) => void;
  isVip?: boolean;
  onOpenVip?: () => void;
}

export const RoomsCallModal: React.FC<RoomsCallModalProps> = ({
  isOpen,
  onClose,
  lang,
  userProfile,
  privateRoomId,
  onChangePrivateRoomId,
  isVip = false,
  onOpenVip,
}) => {
  const [joinInput, setJoinInput] = useState<string>('');
  const [joinError, setJoinError] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatText, setChatText] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showBlockedList, setShowBlockedList] = useState<boolean>(false);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [snap, setSnap] = useState<RtcSnapshot>(() => rtcCallManager.getSnapshot());
  const [vipSnap, setVipSnap] = useState<VipServiceSnapshot>(() => vipBillingService.getSnapshot());
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const chatListRef = useRef<HTMLDivElement | null>(null);

  const selectedRoomId = useMemo(() => {
    const normalized = normalizePrivateRoomCode(privateRoomId);
    return normalized.length === 4 ? normalized : generatePrivateRoomCode();
  }, [privateRoomId]);

  const mySenderId = useMemo(() => rtcCallManager.getPeerId(), []);

  useEffect(() => {
    return rtcCallManager.subscribe(setSnap);
  }, []);

  useEffect(() => {
    return vipBillingService.subscribe(setVipSnap);
  }, []);

  useEffect(() => {
    if (!isOpen || !selectedRoomId) return;
    sounds.stopIntroTheme();
    sounds.stopTensionAmbience();
    rtcCallManager.watchRoom(selectedRoomId);
  }, [isOpen, selectedRoomId]);

  // Real-time Firebase Realtime Database room chat sync (no local server required)
  useEffect(() => {
    if (!isOpen || !selectedRoomId) return;

    let initialLoaded = false;
    let prevCount = 0;

    const unsub = subscribeRoomMessages(selectedRoomId, (incoming) => {
      if (initialLoaded && incoming.length > prevCount) {
        const newest = incoming[incoming.length - 1];
        if (newest && newest.senderId !== mySenderId) {
          sounds.playChatMessage();
        }
      }
      initialLoaded = true;
      prevCount = incoming.length;
      setMessages(incoming);
    });

    return () => {
      unsub();
    };
  }, [isOpen, selectedRoomId, mySenderId]);

  useEffect(() => {
    if (isOpen && chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const privateShareUrl = (() => {
    try {
      const origin = window.location.origin || '';
      if (!origin || origin.startsWith('file:') || origin === 'null') {
        return `?privateRoom=${encodeURIComponent(selectedRoomId)}&lang=${lang}`;
      }
      const cleanOrigin = origin.includes('ais-dev-') ? origin.replace('ais-dev-', 'ais-pre-') : origin;
      return `${cleanOrigin}${window.location.pathname || ''}?privateRoom=${encodeURIComponent(selectedRoomId)}&lang=${lang}`;
    } catch {
      return `?privateRoom=${encodeURIComponent(selectedRoomId)}&lang=${lang}`;
    }
  })();

  const handleCloseModal = () => {
    if (!snap.inCall) {
      rtcCallManager.stopWatching();
    }
    onClose();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const txt = chatText.trim();
    if (!txt) return;
    setChatText('');
    sounds.playChatMessage();
    const msgId = `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newMsg: ChatMessage = {
      id: msgId,
      senderId: mySenderId,
      senderName: userProfile.name || 'متسابق',
      senderAvatar: userProfile.avatar || '👑',
      text: txt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);

    // Persist instantaneously to Firebase Realtime Database
    sendRoomMessage(selectedRoomId, newMsg).catch(() => {});
  };

  const handleDelete = (msgId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    deleteRoomMessage(selectedRoomId, msgId).catch(() => {});
  };

  const handleCreatePrivateRoom = () => {
    const code = generatePrivateRoomCode();
    setMessages([]);
    setJoinError('');
    onChangePrivateRoomId(code);
  };

  const handleJoinPrivateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = normalizePrivateRoomCode(joinInput);
    if (digits.length !== 4) {
      setJoinError(
        lang === 'ar' ? 'يرجى إدخال كود مكون من 4 أرقام فقط (مثال: 8202)' : 'Please enter a 4-digit PIN (e.g. 8202)'
      );
      return;
    }
    setJoinError('');
    setMessages([]);
    onChangePrivateRoomId(digits);
    setJoinInput('');
  };

  const roomPeers = snap.participants;
  const activeCallers = snap.participants.filter((p) => p.inCall);
  const isInThisRoomCall = snap.inCall && snap.activeRoomId === selectedRoomId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-purple-500/50 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        {/* Header - Standalone Private Room ONLY */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-300">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-purple-300 flex items-center gap-2">
                <span>{lang === 'ar' ? `الغرفة الخاصة (${selectedRoomId})` : `Private Room (${selectedRoomId})`}</span>
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 border ${
                    snap.peerReady
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  }`}
                >
                  <Wifi className="w-3 h-3" />
                  <span>
                    {snap.peerReady
                      ? lang === 'ar'
                        ? 'Firebase مباشر'
                        : 'Firebase Live'
                      : lang === 'ar'
                      ? 'جاري الربط...'
                      : 'Connecting...'}
                  </span>
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {lang === 'ar'
                  ? `اتصال فيديو وصوت مباشر عبر WebRTC TURN بين جميع الهواتف بالكود (${selectedRoomId})`
                  : `Direct WebRTC TURN video & voice connection across all phones using PIN (${selectedRoomId})`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowBlockedList((v) => !v)}
              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition ${
                showBlockedList
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-rose-500/50'
              }`}
              title={lang === 'ar' ? 'قائمة المحظورين' : 'Blocked Callers'}
            >
              <Ban className="w-3.5 h-3.5 text-rose-400" />
              <span>{lang === 'ar' ? `المحظورون (${snap.blockedPeers.length})` : `Blocked (${snap.blockedPeers.length})`}</span>
            </button>

            <button
              onClick={handleCloseModal}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Blocked Callers List Panel */}
        {showBlockedList && (
          <div className="p-3 bg-rose-950/20 border-b border-rose-500/30 space-y-2 text-xs">
            <div className="font-black text-rose-300 flex items-center gap-1.5">
              <Ban className="w-4 h-4" />
              <span>{lang === 'ar' ? 'المتصلون المحظورون (لا يمكنهم الاتصال بك):' : 'Blocked Callers (Cannot reach you):'}</span>
            </div>
            {snap.blockedPeers.length === 0 ? (
              <div className="text-[11px] text-slate-400">
                {lang === 'ar' ? 'لا يوجد متصلون محظورون حالياً.' : 'No blocked callers yet.'}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {snap.blockedPeers.map((b) => (
                  <div
                    key={b.peerId}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-rose-500/40 flex items-center gap-2"
                  >
                    <span>{b.avatar}</span>
                    <span className="font-bold text-slate-200">{b.name}</span>
                    <button
                      onClick={() => rtcCallManager.unblockCaller(b.peerId)}
                      className="px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 font-bold text-[10px] flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>{lang === 'ar' ? 'فك الحظر' : 'Unblock'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Private Room Controls (Create 4-digit PIN / Join by 4-digit PIN / Share Invite Link) */}
        <div className="p-3 bg-purple-950/20 border-b border-slate-800 space-y-2.5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">{lang === 'ar' ? 'كود غرفتك الخاصة:' : 'Private Room PIN:'}</span>
              <span className="px-3 py-1 rounded-lg bg-slate-950 border border-purple-500/50 text-purple-300 font-mono text-sm font-black tracking-widest">
                {selectedRoomId}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCreatePrivateRoom}
                className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'غرفة جديدة' : 'New Room'}</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(privateShareUrl).catch(() => {});
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-300 font-bold text-[11px] flex items-center gap-1"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? (lang === 'ar' ? 'تم النسخ' : 'Copied') : (lang === 'ar' ? 'نسخ الرابط' : 'Copy Link')}</span>
              </button>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  lang === 'ar'
                    ? `🔐 انضم معي إلى الغرفة الخاصة رقم (${selectedRoomId}) للاتصال:\n${privateShareUrl}`
                    : `🔐 Join my Private Room (${selectedRoomId}):\n${privateShareUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-[11px]"
              >
                {lang === 'ar' ? 'واتساب' : 'WhatsApp'}
              </a>
            </div>
          </div>

          <form onSubmit={handleJoinPrivateRoom} className="space-y-1">
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={joinInput}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setJoinInput(digitsOnly);
                  if (joinError) setJoinError('');
                }}
                placeholder={lang === 'ar' ? 'أدخل كود من 4 أرقام (مثال: 8202)...' : 'Enter 4-digit code (e.g. 8202)...'}
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-purple-400 rounded-xl px-3 py-1.5 text-xs font-mono tracking-widest text-slate-100 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'دخول' : 'Join'}</span>
              </button>
            </div>
            {joinError && <div className="text-[11px] text-rose-400 font-bold">{joinError}</div>}
          </form>
        </div>

        {/* Video Call, Voice Call & Mic Control Strip */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!isVip) {
                  onOpenVip?.();
                  return;
                }
                rtcCallManager.toggleMic();
              }}
              className={`px-3 py-2 rounded-xl border text-xs font-black flex items-center gap-1.5 transition ${
                !isVip
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 hover:bg-amber-500/25'
                  : snap.micOn
                  ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/60 text-rose-300'
              }`}
            >
              {!isVip ? (
                <Crown className="w-4 h-4 text-amber-400" />
              ) : snap.micOn ? (
                <Mic className="w-4 h-4" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
              <span>
                {!isVip
                  ? (lang === 'ar' ? 'المايك (VIP)' : 'Mic (VIP)')
                  : snap.micOn
                  ? (lang === 'ar' ? 'المايك مفتوح' : 'Mic Open')
                  : (lang === 'ar' ? 'المايك مقفول' : 'Mic Closed')}
              </span>
            </button>

            <span className="text-[11px] text-slate-300 flex items-center gap-1 font-bold">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {lang === 'ar'
                  ? `${roomPeers.length} أجهزة بالغرفة (${activeCallers.length} بالمكالمة)`
                  : `${roomPeers.length} in room (${activeCallers.length} calling)`}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isInThisRoomCall ? (
              <button
                onClick={() => rtcCallManager.hangup()}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1.5 shadow"
              >
                <PhoneOff className="w-4 h-4" />
                <span>{lang === 'ar' ? 'إنهاء المكالمة' : 'End Call'}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    if (!isVip) {
                      onOpenVip?.();
                      return;
                    }
                    if (!vipBillingService.canUseCamera()) {
                      vipBillingService.setQuotaAlert(lang);
                      return;
                    }
                    rtcCallManager.startCall(selectedRoomId, 'video');
                  }}
                  className={`px-3 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shadow ${
                    !isVip
                      ? 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300'
                      : vipSnap.videoQuotaExhausted
                      ? 'bg-slate-800 border border-rose-500/50 text-rose-300'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {isVip ? <Video className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
                  <span>
                    {!isVip
                      ? lang === 'ar'
                        ? 'فيديو VIP'
                        : 'VIP Video'
                      : vipSnap.videoQuotaExhausted
                      ? lang === 'ar'
                        ? 'انتهى رصيد الكاميرا'
                        : 'Camera Limit Used'
                      : lang === 'ar'
                      ? `مكالمة فيديو (${vipSnap.videoRemainingMinutes} د)`
                      : `Video (${vipSnap.videoRemainingMinutes}m)`}
                  </span>
                </button>
                <button
                  onClick={() => {
                    if (!isVip) {
                      onOpenVip?.();
                      return;
                    }
                    rtcCallManager.startCall(selectedRoomId, 'audio');
                  }}
                  className={`px-3 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shadow ${
                    isVip
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-300'
                  }`}
                >
                  {isVip ? <Phone className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
                  <span>{isVip ? (lang === 'ar' ? 'اتصال عادي' : 'Voice Call') : (lang === 'ar' ? 'صوت VIP' : 'VIP Voice')}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* VIP Monthly Camera Quota Status Strip (Voice Mic & Chat remain unlimited) */}
        {isVip && (
          <div className="px-3 py-2 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span className="text-slate-300 font-semibold">
              {lang === 'ar'
                ? `رصيد الكاميرا الشهري: ${vipSnap.videoRemainingMinutes} / ${VIDEO_QUOTA_LIMIT_MINUTES} دقيقة · المايك والدردشة بلا حدود`
                : `Monthly Camera: ${vipSnap.videoRemainingMinutes} / ${VIDEO_QUOTA_LIMIT_MINUTES} min · Voice & Chat Unlimited`}
            </span>
            <span className="text-slate-400 font-mono tabular-nums">
              {lang === 'ar'
                ? `تجدد: ${new Date(vipSnap.videoQuotaResetAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}`
                : `Renews: ${new Date(vipSnap.videoQuotaResetAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            </span>
          </div>
        )}

        {vipSnap.quotaAlertMessage && (
          <div className="px-3 py-2.5 bg-rose-950/60 border-b border-rose-500/40 flex items-center justify-between gap-2 text-xs text-rose-200">
            <span>{vipSnap.quotaAlertMessage}</span>
            <button
              type="button"
              onClick={() => vipBillingService.clearQuotaAlert()}
              className="px-2 py-1 rounded-lg bg-slate-900 text-slate-300 hover:text-white text-[11px] font-bold shrink-0"
            >
              {lang === 'ar' ? 'حسناً' : 'OK'}
            </button>
          </div>
        )}

        {/* Connected Devices in Room (Firebase RTDB + WebRTC Presence) with Block Caller button */}
        {roomPeers.length > 0 && (
          <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-bold shrink-0">
              {lang === 'ar' ? 'المتواجدون بالغرفة:' : 'In Room:'}
            </span>
            {roomPeers.map((p) => {
              const isMe = p.peerId === mySenderId;
              return (
                <div
                  key={p.peerId}
                  className={`px-2 py-1 rounded-xl border text-slate-200 flex items-center gap-1.5 shrink-0 ${
                    p.inCall ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-slate-900 border-slate-700'
                  }`}
                >
                  <span>{p.avatar || '👤'}</span>
                  <span className="font-bold">{isMe ? `${p.name} (أنت)` : p.name}</span>
                  <span>{p.inCall ? (p.callMode === 'video' ? '📹' : '📞') : '💬'}</span>
                  <span>{p.micOn ? '🎙️' : '🔇'}</span>
                  {!isMe && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => rtcCallManager.blockCaller(p.peerId, p.name, p.avatar)}
                        className="px-1.5 py-0.5 rounded bg-rose-600/80 hover:bg-rose-500 text-white text-[10px] font-bold flex items-center gap-0.5"
                        title={lang === 'ar' ? 'حظر هذا المتصل' : 'Block caller'}
                      >
                        <Ban className="w-2.5 h-2.5" />
                        <span>{lang === 'ar' ? 'حظر' : 'Block'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setReportTarget({
                            id: p.peerId,
                            name: p.name,
                            avatar: p.avatar,
                            roomId: selectedRoomId,
                          })
                        }
                        className="px-1.5 py-0.5 rounded bg-amber-500/85 hover:bg-amber-400 text-slate-950 text-[10px] font-black flex items-center gap-0.5"
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
        )}

        {/* Private Room Chat History */}
        <div ref={chatListRef} className="flex-1 overflow-y-auto p-3.5 space-y-2.5 bg-slate-950/50 min-h-[200px]">
          {messages.length === 0 ? (
            <div className="text-center text-xs text-slate-500 py-10">
              {lang === 'ar'
                ? `غرفة خاصة برقم (${selectedRoomId}) — افتح نفس الرقم على الموبايل واللابتوب للتحدث فيديو وصوت ورسائل فورية عبر Firebase و WebRTC!`
                : `Private Room (${selectedRoomId}) — open the same 4-digit PIN on mobile & laptop for live Firebase & WebRTC video, voice, and chat!`}
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.senderId === mySenderId;
              const isBlockedSender = !isMine && rtcCallManager.isBlocked(m.senderId);
              if (isBlockedSender) return null;
              return (
                <div key={m.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5">
                    <span className="font-bold">{m.senderAvatar} {m.senderName}</span>
                    <span className="font-mono">{m.time}</span>
                    {!isMine && m.senderId !== 'system' && (
                      <>
                        <button
                          type="button"
                          onClick={() => rtcCallManager.blockCaller(m.senderId, m.senderName, m.senderAvatar)}
                          className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-0.5"
                          title={lang === 'ar' ? 'حظر المتصل' : 'Block Caller'}
                        >
                          <Ban className="w-2.5 h-2.5" />
                          <span>{lang === 'ar' ? 'حظر' : 'Block'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setReportTarget({
                              id: m.senderId,
                              name: m.senderName,
                              avatar: m.senderAvatar,
                              roomId: selectedRoomId,
                            })
                          }
                          className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5"
                          title={lang === 'ar' ? 'إبلاغ عن هذا اللاعب' : 'Report Player'}
                        >
                          <Flag className="w-2.5 h-2.5" />
                          <span>{lang === 'ar' ? 'إبلاغ' : 'Report'}</span>
                        </button>
                      </>
                    )}
                  </div>
                  <div
                    className={`max-w-[85%] px-3 py-1.5 rounded-2xl text-xs break-words flex items-center gap-2 ${
                      isMine
                        ? 'bg-amber-500 text-slate-950 font-bold rounded-tr-none'
                        : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none'
                    }`}
                  >
                    <span>{m.text}</span>
                    {isMine && (
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="opacity-70 hover:opacity-100 text-rose-900"
                        title={lang === 'ar' ? 'حذف لدى الجميع' : 'Delete for everyone'}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Send Message Input */}
        <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            placeholder={lang === 'ar' ? 'اكتب رسالة فورية داخل الغرفة...' : 'Send live room message...'}
            className="flex-1 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!chatText.trim()}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs flex items-center gap-1"
          >
            <Send className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إرسال' : 'Send'}</span>
          </button>
        </form>
      </div>

      <ReportPlayerModal
        isOpen={reportTarget !== null}
        target={reportTarget}
        lang={lang}
        reporterId={mySenderId}
        reporterName={userProfile.name || 'متسابق'}
        onClose={() => setReportTarget(null)}
        onBlockPlayer={(t) => rtcCallManager.blockCaller(t.id, t.name, t.avatar || '👤')}
      />
    </div>
  );
};
