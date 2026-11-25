import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  PhoneIncoming,
  Volume2,
  VolumeX,
  SwitchCamera,
  Minimize2,
  Maximize2,
  Ban,
  Flag,
} from 'lucide-react';
import { rtcCallManager, RtcSnapshot, RemotePeerStream } from '../services/rtcCallManager';
import { vipBillingService, VipServiceSnapshot } from '../services/vipBillingService';
import { Language } from '../types/game';
import { sounds } from '../utils/soundEffects';
import { ReportPlayerModal, ReportTarget } from './ReportPlayerModal';

interface LiveCallDockProps {
  lang: Language;
  activeRoomId: string;
  onOpenRoomsModal: () => void;
  isVip?: boolean;
  onOpenVip?: () => void;
}

const RemoteMediaTile: React.FC<{
  peer: RemotePeerStream;
  speakerMuted: boolean;
  showVideoStage: boolean;
  lang: Language;
  onBlock: (peer: RemotePeerStream) => void;
  onReport: (peer: RemotePeerStream) => void;
}> = ({ peer, speakerMuted, showVideoStage, lang, onBlock, onReport }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const tryPlayMedia = () => {
      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      }
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
    };
    if (videoRef.current && videoRef.current.srcObject !== peer.stream) {
      videoRef.current.srcObject = peer.stream;
    }
    if (audioRef.current && audioRef.current.srcObject !== peer.stream) {
      audioRef.current.srcObject = peer.stream;
      audioRef.current.volume = 1;
    }
    tryPlayMedia();
    const timer = window.setInterval(tryPlayMedia, 2000);
    window.addEventListener('pointerdown', tryPlayMedia);
    window.addEventListener('touchstart', tryPlayMedia);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('pointerdown', tryPlayMedia);
      window.removeEventListener('touchstart', tryPlayMedia);
    };
  }, [peer.stream, showVideoStage]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = speakerMuted;
    if (audioRef.current) {
      audioRef.current.muted = speakerMuted;
      audioRef.current.volume = 1;
      if (!speakerMuted) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [speakerMuted]);

  const hasVideo = peer.camOn && peer.stream.getVideoTracks().some((t) => t.readyState === 'live');

  if (!showVideoStage) {
    return (
      <audio
        ref={audioRef}
        autoPlay
        playsInline
        muted={speakerMuted}
        onLoadedMetadata={(e) => e.currentTarget.play().catch(() => {})}
        onCanPlay={(e) => e.currentTarget.play().catch(() => {})}
        className="sr-only"
      />
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/80 aspect-video flex items-center justify-center shadow-lg">
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={speakerMuted}
          onLoadedMetadata={(e) => e.currentTarget.play().catch(() => {})}
          className="w-full h-full object-cover"
        />
      ) : (
        <>
          <audio
            ref={audioRef}
            autoPlay
            playsInline
            muted={speakerMuted}
            onLoadedMetadata={(e) => e.currentTarget.play().catch(() => {})}
            onCanPlay={(e) => e.currentTarget.play().catch(() => {})}
            className="sr-only"
          />
          <div className="flex flex-col items-center justify-center gap-1.5 p-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-amber-500/40 flex items-center justify-center text-2xl">
              {peer.avatar || '👤'}
            </div>
            <span className="text-xs font-bold text-slate-200 truncate max-w-[140px]">
              {peer.name}
            </span>
          </div>
        </>
      )}

      {/* Block + Report Caller Buttons inside tile */}
      <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
        <button
          type="button"
          onClick={() => onBlock(peer)}
          className="px-1.5 py-0.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white text-[10px] font-bold flex items-center gap-0.5 shadow"
          title={lang === 'ar' ? 'حظر المتصل' : 'Block Caller'}
        >
          <Ban className="w-2.5 h-2.5" />
          <span>{lang === 'ar' ? 'حظر' : 'Block'}</span>
        </button>
        <button
          type="button"
          onClick={() => onReport(peer)}
          className="px-1.5 py-0.5 rounded-lg bg-amber-500/90 hover:bg-amber-400 text-slate-950 text-[10px] font-black flex items-center gap-0.5 shadow"
          title={lang === 'ar' ? 'إبلاغ عن هذا اللاعب' : 'Report Player'}
        >
          <Flag className="w-2.5 h-2.5" />
          <span>{lang === 'ar' ? 'إبلاغ' : 'Report'}</span>
        </button>
      </div>

      <div className="absolute bottom-1.5 inset-x-1.5 flex items-center justify-between px-2 py-0.5 rounded-lg bg-slate-950/90 text-[10px] text-slate-200">
        <span className="truncate font-bold">{peer.name}</span>
        <span className={peer.micOn ? 'text-emerald-400' : 'text-rose-400'}>
          {peer.micOn ? '🎙️' : '🔇'}
        </span>
      </div>
    </div>
  );
};

// Active Private Call Floating Stage & Incoming Call Card (NO bottom dock bar)
export const LiveCallDock: React.FC<LiveCallDockProps> = ({ lang, isVip = false, onOpenVip }) => {
  const [snap, setSnap] = useState<RtcSnapshot>(() => rtcCallManager.getSnapshot());
  const [vipSnap, setVipSnap] = useState<VipServiceSnapshot>(() => vipBillingService.getSnapshot());
  const [videoExpanded, setVideoExpanded] = useState<boolean>(true);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return rtcCallManager.subscribe((next) => {
      setSnap(next);
      if (next.inCall) {
        sounds.stopIntroTheme();
        sounds.stopTensionAmbience();
      }
    });
  }, []);

  useEffect(() => {
    return vipBillingService.subscribe(setVipSnap);
  }, []);

  // Live 120-Minute Monthly Camera Quota Enforcement (Voice Mic & Chat remain unlimited)
  useEffect(() => {
    if (!snap.inCall || !snap.camOn || !isVip) return;

    // Immediate guard if camera turned on with 0 remaining seconds
    if (!vipBillingService.canUseCamera()) {
      vipBillingService.setQuotaAlert(lang);
      void rtcCallManager.forceDisableCamera(
        lang === 'ar'
          ? 'انتهى رصيد الكاميرا الشهري (120 دقيقة) — المكالمة الصوتية مستمرة'
          : 'Monthly 120-min camera limit reached — Voice call active'
      );
      return;
    }

    const timer = window.setInterval(() => {
      const res = vipBillingService.consumeVideoSeconds(1, { lang });
      if (res.exhausted) {
        window.clearInterval(timer);
        void rtcCallManager.forceDisableCamera(
          lang === 'ar'
            ? 'انتهى رصيد الكاميرا الشهري (120 دقيقة) — المكالمة الصوتية مستمرة'
            : 'Monthly 120-min camera limit reached — Voice call active'
        );
      }
    }, 1000);

    return () => {
      window.clearInterval(timer);
      // Flush accumulated video usage to Firebase RTDB whenever camera turns off or call ends
      vipBillingService.consumeVideoSeconds(0, { flushToFirebase: true, lang });
    };
  }, [snap.inCall, snap.camOn, isVip, lang]);

  useEffect(() => {
    const el = localVideoRef.current;
    if (el && snap.localStream && snap.camOn) {
      if (el.srcObject !== snap.localStream) {
        el.srcObject = snap.localStream;
      }
      el.muted = true;
      el.play().catch(() => {});
    }
  }, [snap.localStream, snap.camOn, videoExpanded, snap.inCall]);

  useEffect(() => {
    if (snap.inCall && snap.callMode === 'video') {
      setVideoExpanded(true);
    }
  }, [snap.inCall, snap.callMode]);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const showStage = snap.inCall && videoExpanded;

  if (!snap.inCall && !snap.incomingCall && !vipSnap.quotaAlertMessage) {
    return null;
  }

  return (
    <>
      {/* Hidden background audio sinks when video stage is minimized during an active call */}
      {snap.inCall && !showStage && snap.remoteStreams.map((peer) => (
        <RemoteMediaTile
          key={peer.peerId}
          peer={peer}
          speakerMuted={snap.speakerMuted}
          showVideoStage={false}
          lang={lang}
          onBlock={(p) => rtcCallManager.blockCaller(p.peerId, p.name, p.avatar)}
          onReport={(p) =>
            setReportTarget({
              id: p.peerId,
              name: p.name,
              avatar: p.avatar,
              roomId: snap.activeRoomId,
            })
          }
        />
      ))}

      {/* Minimized Active Call Floating Pill */}
      {snap.inCall && !showStage && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-950/95 border-2 border-emerald-500/60 rounded-2xl px-3 py-2 shadow-2xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-mono font-bold text-emerald-300 tabular-nums">
            {formatDuration(snap.callDurationSec)}
          </span>
          <button
            onClick={() => rtcCallManager.toggleMic()}
            className={`p-1.5 rounded-lg border ${snap.micOn ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300' : 'bg-rose-500/15 border-rose-500/50 text-rose-300'}`}
          >
            {snap.micOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setVideoExpanded(true)}
            className="px-2 py-1 rounded-lg bg-slate-900 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'عرض' : 'Show'}</span>
          </button>
          <button
            onClick={() => rtcCallManager.hangup()}
            className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold"
          >
            <PhoneOff className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Incoming Call Ringing Card with Answer / Decline / Block Caller */}
      {snap.incomingCall && !snap.inCall && (
        <div className="fixed bottom-4 inset-x-3 sm:left-auto sm:right-4 sm:w-84 z-50 bg-slate-900/95 border-2 border-emerald-400 rounded-2xl p-3.5 shadow-2xl shadow-emerald-500/20 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-2xl shrink-0">
              {snap.incomingCall.fromAvatar || '👤'}
            </div>
            <div className="min-w-0 flex-1 text-start">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-300">
                <PhoneIncoming className="w-3.5 h-3.5" />
                <span>
                  {snap.incomingCall.callMode === 'video'
                    ? (lang === 'ar' ? 'مكالمة فيديو خاصة واردة' : 'Incoming Private Video Call')
                    : (lang === 'ar' ? 'اتصال صوتي خاص وارد' : 'Incoming Private Voice Call')}
                </span>
              </div>
              <div className="text-sm font-black text-slate-100 truncate">
                {snap.incomingCall.fromName}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {snap.incomingCall.roomId}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-3">
            <button
              type="button"
              onClick={() => {
                if (!isVip) {
                  onOpenVip?.();
                  return;
                }
                if (snap.incomingCall?.callMode === 'video' && !vipBillingService.canUseCamera()) {
                  vipBillingService.setQuotaAlert(lang);
                  const roomId = snap.incomingCall.roomId;
                  rtcCallManager.rejectIncomingCall();
                  void rtcCallManager.startCall(roomId, 'audio');
                  return;
                }
                rtcCallManager.acceptIncomingCall();
              }}
              className="py-2 px-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1 transition active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'رد' : 'Answer'}</span>
            </button>
            <button
              type="button"
              onClick={() => rtcCallManager.rejectIncomingCall()}
              className="py-2 px-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-black text-xs flex items-center justify-center gap-1 transition active:scale-95"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'رفض' : 'Decline'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const inc = snap.incomingCall;
                if (inc) rtcCallManager.blockCaller(inc.fromId, inc.fromName, inc.fromAvatar);
              }}
              className="py-2 px-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-1 transition active:scale-95"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'حظر' : 'Block'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const inc = snap.incomingCall;
                if (inc) {
                  setReportTarget({
                    id: inc.fromId,
                    name: inc.fromName,
                    avatar: inc.fromAvatar,
                    roomId: inc.roomId,
                  });
                }
              }}
              className="py-2 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1 transition active:scale-95"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'إبلاغ' : 'Report'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Expandable Active Video / Voice Call Stage */}
      {showStage && (
        <div className="fixed bottom-4 right-3 left-3 sm:left-auto sm:right-4 sm:w-[420px] z-50 bg-slate-950/95 border-2 border-amber-500/50 rounded-2xl p-3 shadow-2xl space-y-2.5">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-xs font-black text-amber-300 truncate">
                {snap.callMode === 'video'
                  ? (lang === 'ar' ? 'مكالمة فيديو خاصة' : 'Private Video Call')
                  : (lang === 'ar' ? 'اتصال صوتي خاص' : 'Private Voice Call')}
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold tabular-nums">
                {formatDuration(snap.callDurationSec)}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  if (!isVip) {
                    onOpenVip?.();
                    return;
                  }
                  rtcCallManager.toggleMic();
                }}
                className={`p-1.5 rounded-lg border ${snap.micOn ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300' : 'bg-rose-500/15 border-rose-500/50 text-rose-300'}`}
                title={lang === 'ar' ? 'فتح/قفل الميكروفون' : 'Toggle Mic'}
              >
                {snap.micOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  if (!isVip) {
                    onOpenVip?.();
                    return;
                  }
                  if (!snap.camOn && !vipBillingService.canUseCamera()) {
                    vipBillingService.setQuotaAlert(lang);
                    return;
                  }
                  rtcCallManager.toggleCamera();
                }}
                className={`p-1.5 rounded-lg border ${
                  snap.camOn
                    ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                    : vipSnap.videoQuotaExhausted
                    ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                    : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
                title={
                  vipSnap.videoQuotaExhausted
                    ? lang === 'ar'
                      ? 'انتهى رصيد الكاميرا الشهري (120 دقيقة)'
                      : 'Monthly 120-min camera allowance exhausted'
                    : lang === 'ar'
                    ? 'تشغيل/إيقاف الكاميرا'
                    : 'Toggle Camera'
                }
              >
                {snap.camOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
              </button>
              {snap.camOn && (
                <button
                  onClick={() => rtcCallManager.switchCamera()}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200"
                  title={lang === 'ar' ? 'تبديل الكاميرا' : 'Switch Camera'}
                >
                  <SwitchCamera className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => rtcCallManager.toggleSpeaker()}
                className={`p-1.5 rounded-lg border ${snap.speakerMuted ? 'bg-rose-500/20 border-rose-500/50 text-rose-300' : 'bg-slate-900 border-slate-700 text-slate-200'}`}
                title={lang === 'ar' ? 'كتم/تشغيل السماعة' : 'Toggle Speaker'}
              >
                {snap.speakerMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setVideoExpanded(false)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300"
                title={lang === 'ar' ? 'تصغير' : 'Minimize'}
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => rtcCallManager.hangup()}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] flex items-center gap-1"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'إنهاء' : 'End'}</span>
              </button>
            </div>
          </div>

          {isVip && (
            <div className="flex items-center justify-between gap-2 text-[11px] bg-slate-900/90 rounded-lg py-1 px-2.5 border border-slate-800">
              <span className="text-slate-300">
                {lang === 'ar' ? 'رصيد الكاميرا الشهري:' : 'Monthly Camera Left:'}
              </span>
              <span
                className={`font-mono font-bold tabular-nums ${
                  vipSnap.videoQuotaExhausted ? 'text-rose-400' : 'text-amber-300'
                }`}
              >
                {lang === 'ar'
                  ? `${vipSnap.videoRemainingMinutes} دقيقة متبقية`
                  : `${vipSnap.videoRemainingMinutes} min left`}
              </span>
            </div>
          )}

          {snap.callStatusText && (
            <div className="text-[11px] text-slate-300 text-center bg-slate-900/90 rounded-lg py-1 px-2 border border-slate-800">
              {snap.callStatusText} • <span className="font-mono text-amber-300">{snap.activeRoomId}</span>
            </div>
          )}

          {/* Video / Audio Participants Grid */}
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {/* Local Camera / Mic Preview Tile */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-amber-500/50 aspect-video flex items-center justify-center">
              {snap.camOn && snap.localStream ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={(e) => e.currentTarget.play().catch(() => {})}
                  className={`w-full h-full object-cover ${snap.facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />
              ) : (
                <div className="flex flex-col items-center gap-1 text-center p-2">
                  <div className="text-2xl">🎙️</div>
                  <span className="text-[11px] font-bold text-amber-300">
                    {lang === 'ar' ? 'أنت (مباشر)' : 'You (Live)'}
                  </span>
                </div>
              )}
              <div className="absolute bottom-1.5 inset-x-1.5 flex items-center justify-between px-2 py-0.5 rounded-lg bg-slate-950/80 text-[10px] text-slate-200">
                <span className="font-bold">{lang === 'ar' ? 'أنت' : 'You'}</span>
                <span className={snap.micOn ? 'text-emerald-400' : 'text-rose-400'}>
                  {snap.micOn ? '🎙️' : '🔇'}
                </span>
              </div>
            </div>

            {/* Remote Peers */}
            {snap.remoteStreams.length > 0 ? (
              snap.remoteStreams.map((peer) => (
                <RemoteMediaTile
                  key={peer.peerId}
                  peer={peer}
                  speakerMuted={snap.speakerMuted}
                  showVideoStage={true}
                  lang={lang}
                  onBlock={(p) => rtcCallManager.blockCaller(p.peerId, p.name, p.avatar)}
                  onReport={(p) =>
                    setReportTarget({
                      id: p.peerId,
                      name: p.name,
                      avatar: p.avatar,
                      roomId: snap.activeRoomId,
                    })
                  }
                />
              ))
            ) : (
              <div className="rounded-2xl bg-slate-900/80 border border-dashed border-slate-700 aspect-video flex flex-col items-center justify-center p-2 text-center">
                <span className="text-lg">⏳</span>
                <span className="text-[11px] text-slate-400 mt-1">
                  {lang === 'ar' ? 'في انتظار انضمام الصديق...' : 'Waiting for friend to join...'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Monthly Camera Quota Exhausted / Auto-Renewal Notice */}
      {vipSnap.quotaAlertMessage && (
        <div
          className="fixed top-20 inset-x-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-[96] bg-slate-900 border-2 border-amber-500/60 rounded-2xl p-4 shadow-2xl text-start space-y-2.5 animate-fadeIn"
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-black text-amber-300">
              {lang === 'ar' ? 'تنبيه رصيد الكاميرا الشهري (120 دقيقة)' : 'Monthly Camera Limit Notice (120 min)'}
            </span>
            <button
              type="button"
              onClick={() => vipBillingService.clearQuotaAlert()}
              className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-[11px] font-bold"
            >
              {lang === 'ar' ? 'إغلاق' : 'Dismiss'}
            </button>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">{vipSnap.quotaAlertMessage}</p>
        </div>
      )}

      <ReportPlayerModal
        isOpen={reportTarget !== null}
        target={reportTarget}
        lang={lang}
        reporterId={snap.peerId}
        reporterName={lang === 'ar' ? 'متسابق' : 'Player'}
        onClose={() => setReportTarget(null)}
        onBlockPlayer={(t) => rtcCallManager.blockCaller(t.id, t.name, t.avatar || '👤')}
      />
    </>
  );
};
