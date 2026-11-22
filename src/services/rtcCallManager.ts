import {
  ref,
  set,
  push,
  remove,
  onValue,
  onChildAdded,
  onDisconnect,
} from 'firebase/database';
import { rtdb, sanitizeFirebaseKey } from './firebaseClient';
import { ChatMessage } from '../types/game';

export type CallMode = 'audio' | 'video';

export interface RtcParticipant {
  peerId: string;
  name: string;
  avatar: string;
  callMode: CallMode;
  micOn: boolean;
  camOn: boolean;
  inCall: boolean;
  lastSeen?: number;
}

export interface IncomingCallAlert {
  roomId: string;
  fromId: string;
  fromName: string;
  fromAvatar: string;
  callMode: CallMode;
  timestamp: number;
}

export interface RemotePeerStream {
  peerId: string;
  name: string;
  avatar: string;
  stream: MediaStream;
  micOn: boolean;
  camOn: boolean;
  callMode: CallMode;
}

export interface BlockedCaller {
  peerId: string;
  name: string;
  avatar: string;
  blockedAt: number;
}

export interface RtcSnapshot {
  peerId: string;
  peerReady: boolean;
  peerError: string | null;
  micOn: boolean;
  micReady: boolean;
  micLevel: number;
  micPermissionError: string | null;
  camOn: boolean;
  facingMode: 'user' | 'environment';
  speakerMuted: boolean;
  inCall: boolean;
  matchMicActive: boolean;
  matchMicRoomId: string;
  callMode: CallMode;
  activeRoomId: string;
  watchedRoomId: string;
  callDurationSec: number;
  localStream: MediaStream | null;
  remoteStreams: RemotePeerStream[];
  matchRemoteStreams: RemotePeerStream[];
  participants: RtcParticipant[];
  blockedPeers: BlockedCaller[];
  incomingCall: IncomingCallAlert | null;
  callStatusText: string | null;
}

export function generatePrivateRoomCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function normalizePrivateRoomCode(input: string): string {
  return String(input || '')
    .trim()
    .replace(/^PRIV-/i, '')
    .replace(/\D/g, '')
    .slice(0, 4);
}

// Metered STUN + TURN Relay configuration for reliable cross-network / mobile / Android WebView WebRTC
const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env || {};
const METERED_TURN_USERNAME = env.VITE_TURN_USERNAME || 'c89281151b67d76b612ff2';
const METERED_TURN_CREDENTIAL = env.VITE_TURN_CREDENTIAL || '2KTt047g0zNjzh5pG';

export const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.relay.metered.ca:80' },
  {
    urls: 'turn:global.relay.metered.ca:80',
    username: METERED_TURN_USERNAME,
    credential: METERED_TURN_CREDENTIAL,
  },
  {
    urls: 'turn:global.relay.metered.ca:80?transport=tcp',
    username: METERED_TURN_USERNAME,
    credential: METERED_TURN_CREDENTIAL,
  },
  {
    urls: 'turn:global.relay.metered.ca:443',
    username: METERED_TURN_USERNAME,
    credential: METERED_TURN_CREDENTIAL,
  },
  {
    urls: 'turns:global.relay.metered.ca:443?transport=tcp',
    username: METERED_TURN_USERNAME,
    credential: METERED_TURN_CREDENTIAL,
  },
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

const RTC_CONFIG: RTCConfiguration = {
  iceServers: ICE_SERVERS,
  iceCandidatePoolSize: 10,
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
};

type LegacyNavigator = Navigator & {
  getUserMedia?: (
    c: MediaStreamConstraints,
    ok: (s: MediaStream) => void,
    err: (e: unknown) => void
  ) => void;
  webkitGetUserMedia?: (
    c: MediaStreamConstraints,
    ok: (s: MediaStream) => void,
    err: (e: unknown) => void
  ) => void;
  mozGetUserMedia?: (
    c: MediaStreamConstraints,
    ok: (s: MediaStream) => void,
    err: (e: unknown) => void
  ) => void;
};

/**
 * Android WebView & Cross-Browser safe getUserMedia wrapper.
 * Supports modern navigator.mediaDevices.getUserMedia and legacy WebView webkitGetUserMedia.
 */
async function getUserMediaSafe(constraints: MediaStreamConstraints): Promise<MediaStream> {
  if (typeof navigator === 'undefined') {
    throw new Error('Navigator unavailable');
  }
  if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
    return navigator.mediaDevices.getUserMedia(constraints);
  }
  const legacyNav = navigator as LegacyNavigator;
  const legacyFn =
    legacyNav.webkitGetUserMedia || legacyNav.mozGetUserMedia || legacyNav.getUserMedia;
  if (typeof legacyFn === 'function') {
    return new Promise<MediaStream>((resolve, reject) => {
      legacyFn.call(legacyNav, constraints, resolve, reject);
    });
  }
  throw new Error('getUserMedia not supported');
}

function isMediaCaptureSupported(): boolean {
  if (typeof navigator === 'undefined') return false;
  if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
    return true;
  }
  const legacyNav = navigator as LegacyNavigator;
  return Boolean(
    legacyNav.webkitGetUserMedia || legacyNav.mozGetUserMedia || legacyNav.getUserMedia
  );
}

function formatWebViewPermissionError(err: unknown, needsCamera: boolean): string {
  if (typeof window !== 'undefined' && window.isSecureContext === false) {
    return 'يلزم فتح التطبيق عبر رابط HTTPS آمن لتشغيل الميكروفون والكاميرا.';
  }
  const name = err instanceof DOMException ? err.name : (err as { name?: string })?.name || '';
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return needsCamera
      ? 'تم رفض إذن الكاميرا أو الميكروفون. يرجى تفعيل صلاحيات الكاميرا والميكروفون للتطبيق من إعدادات الهاتف/المتصفح.'
      : 'تم رفض إذن الميكروفون. يرجى السماح بصلاحية الميكروفون للتطبيق من إعدادات الهاتف/المتصفح.';
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return needsCamera
      ? 'لم يتم العثور على كاميرا أو ميكروفون متاح على هذا الجهاز.'
      : 'لم يتم العثور على ميكروفون متاح على هذا الجهاز.';
  }
  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return 'الميكروفون أو الكاميرا قيد الاستخدام في تطبيق آخر حالياً. أغلقه وحاول مجدداً.';
  }
  return needsCamera
    ? 'تعذر فتح الكاميرا والميكروفون. تأكد من السماح بالأذونات داخل التطبيق.'
    : 'تعذر تشغيل الميكروفون. تأكد من السماح بإذن الميكروفون داخل التطبيق.';
}

interface RtcSignalPayload {
  id: string;
  fromId: string;
  fromName: string;
  fromAvatar: string;
  toId?: string;
  type: 'offer' | 'answer' | 'ice' | 'ring' | 'accept' | 'reject' | 'hangup' | 'media_state';
  callMode?: CallMode;
  matchMic?: boolean;
  payload?: unknown;
  ts: number;
}

class RtcCallManager {
  private peerId: string;
  private profileName = 'متسابق';
  private profileAvatar = '👑';

  // Firebase RTDB connection & room signaling state
  private peerReady = false;
  private peerError: string | null = null;
  private signalingRoomId = '';
  private unsubParticipants: (() => void) | null = null;
  private unsubSignals: (() => void) | null = null;
  private unsubConnected: (() => void) | null = null;
  private presenceTimer: ReturnType<typeof setInterval> | null = null;
  private reconcileTimer: ReturnType<typeof setInterval> | null = null;

  // Native WebRTC Mesh connections (used for BOTH 1v1/4P Match Voice AND Private Video/Voice Calls)
  private pcs = new Map<string, RTCPeerConnection>();
  private pcModeMap = new Map<string, 'match' | 'call'>();
  private pendingIce = new Map<string, RTCIceCandidateInit[]>();
  private makingOffer = new Map<string, boolean>();
  private lastDialAttemptMap = new Map<string, number>();
  private processedSignalIds = new Set<string>();
  private remoteTrackStreams = new Map<string, MediaStream>();

  private micStream: MediaStream | null = null;
  private camStream: MediaStream | null = null;
  private combinedStream: MediaStream | null = null;

  private micOn = true;
  private userDisabledMic = false;
  private micReady = false;
  private micLevel = 0;
  private micPermissionError: string | null = null;

  private camOn = false;
  private facingMode: 'user' | 'environment' = 'user';
  private speakerMuted = false;

  private inCall = false;
  private matchMicRoomId = '';
  private callMode: CallMode = 'audio';
  private activeRoomId = '';
  private watchedRoomId = '';
  private callDurationSec = 0;
  private callTimer: ReturnType<typeof setInterval> | null = null;
  private silentAudioCtx: AudioContext | null = null;
  private silentAudioStream: MediaStream | null = null;

  private remoteStreamsMap = new Map<string, RemotePeerStream>();
  private matchRemoteStreamsMap = new Map<string, RemotePeerStream>();
  private participants: RtcParticipant[] = [];
  private roomPeersMap = new Map<string, RtcParticipant>();
  private blockedPeersMap = new Map<string, BlockedCaller>();
  private incomingCall: IncomingCallAlert | null = null;
  private callStatusText: string | null = null;

  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private levelTimer: ReturnType<typeof setInterval> | null = null;
  private ringOscInterval: ReturnType<typeof setInterval> | null = null;

  private listeners = new Set<(snap: RtcSnapshot) => void>();
  private chatListeners = new Set<(roomId: string, msg: ChatMessage, deletedId?: string) => void>();

  constructor() {
    this.peerId = this.resolvePeerId();
    this.loadBlockedPeers();
  }

  private loadBlockedPeers() {
    try {
      const raw = localStorage.getItem('millionaire_blocked_callers');
      if (raw) {
        const list = JSON.parse(raw) as BlockedCaller[];
        if (Array.isArray(list)) {
          list.forEach((b) => {
            if (b && b.peerId) this.blockedPeersMap.set(b.peerId, b);
          });
        }
      }
    } catch {}
  }

  private saveBlockedPeers() {
    try {
      localStorage.setItem(
        'millionaire_blocked_callers',
        JSON.stringify(Array.from(this.blockedPeersMap.values()))
      );
    } catch {}
  }

  public isBlocked(peerId: string): boolean {
    return this.blockedPeersMap.has(peerId);
  }

  public blockCaller(peerId: string, name = 'متصل', avatar = '👤') {
    if (!peerId || peerId === this.peerId) return;
    this.blockedPeersMap.set(peerId, {
      peerId,
      name: name || 'متصل',
      avatar: avatar || '👤',
      blockedAt: Date.now(),
    });
    this.saveBlockedPeers();
    this.removeRemotePeer(peerId);

    if (this.incomingCall?.fromId === peerId) {
      const room = this.incomingCall.roomId;
      this.incomingCall = null;
      this.stopRingTone();
      this.sendFirebaseSignal(room, peerId, 'reject', {}).catch(() => {});
    }

    this.roomPeersMap.delete(peerId);
    this.participants = this.participants.filter((p) => p.peerId !== peerId);
    this.emit();
  }

  public unblockCaller(peerId: string) {
    if (!peerId) return;
    this.blockedPeersMap.delete(peerId);
    this.saveBlockedPeers();
    this.emit();
  }

  private resolvePeerId(): string {
    try {
      let did = localStorage.getItem('millionaire_device_uuid');
      if (!did) {
        did = `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
        localStorage.setItem('millionaire_device_uuid', did);
      }
      let tabId = sessionStorage.getItem('millionaire_tab_uuid');
      if (!tabId) {
        tabId = Math.random().toString(36).slice(2, 6);
        sessionStorage.setItem('millionaire_tab_uuid', tabId);
      }
      return `rtc_${did}_${tabId}`;
    } catch {
      return `rtc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    }
  }

  public getPeerId(): string {
    return this.peerId;
  }

  public setProfile(name: string, avatar: string) {
    this.profileName = name || 'متسابق';
    this.profileAvatar = avatar || '👑';
  }

  public subscribe(fn: (snap: RtcSnapshot) => void): () => void {
    this.listeners.add(fn);
    fn(this.getSnapshot());
    return () => {
      this.listeners.delete(fn);
    };
  }

  public subscribeChat(
    fn: (roomId: string, msg: ChatMessage, deletedId?: string) => void
  ): () => void {
    this.chatListeners.add(fn);
    return () => {
      this.chatListeners.delete(fn);
    };
  }

  public getSnapshot(): RtcSnapshot {
    const mergedMap = new Map<string, RtcParticipant>();
    this.roomPeersMap.forEach((p, id) => {
      if (!this.blockedPeersMap.has(id)) mergedMap.set(id, p);
    });
    this.participants.forEach((p) => {
      if (!this.blockedPeersMap.has(p.peerId)) mergedMap.set(p.peerId, p);
    });

    return {
      peerId: this.peerId,
      peerReady: this.peerReady,
      peerError: this.peerError,
      micOn: this.micOn,
      micReady: this.micReady,
      micLevel: this.micLevel,
      micPermissionError: this.micPermissionError,
      camOn: this.camOn,
      facingMode: this.facingMode,
      speakerMuted: this.speakerMuted,
      inCall: this.inCall,
      matchMicActive: Boolean(this.matchMicRoomId),
      matchMicRoomId: this.matchMicRoomId,
      callMode: this.callMode,
      activeRoomId: this.activeRoomId,
      watchedRoomId: this.watchedRoomId,
      callDurationSec: this.callDurationSec,
      localStream: this.combinedStream,
      remoteStreams: Array.from(this.remoteStreamsMap.values()).filter(
        (r) => !this.blockedPeersMap.has(r.peerId)
      ),
      matchRemoteStreams: Array.from(this.matchRemoteStreamsMap.values()).filter(
        (r) => !this.blockedPeersMap.has(r.peerId)
      ),
      participants: Array.from(mergedMap.values()),
      blockedPeers: Array.from(this.blockedPeersMap.values()),
      incomingCall: this.incomingCall,
      callStatusText: this.callStatusText,
    };
  }

  private emit() {
    const snap = this.getSnapshot();
    this.listeners.forEach((fn) => {
      try {
        fn(snap);
      } catch {}
    });
  }

  // Kept for compatibility with RoomsCallModal (chat now persists directly in Firebase RTDB)
  public sendRoomChatMessage(_roomId: string, _msg: ChatMessage) {}
  public broadcastDeleteChatMessage(_roomId: string, _messageId: string) {}

  // =========================================================================
  // Audio & Video Media Acquisition (Android WebView Friendly)
  // =========================================================================
  public async ensureAutoMicActive(): Promise<boolean> {
    if (this.userDisabledMic) {
      this.micOn = false;
      this.emit();
      return false;
    }
    return this.acquireMicrophone(true);
  }

  private getVoiceAudioConstraints(): MediaTrackConstraints {
    return {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    };
  }

  private tuneAudioSender(pc: RTCPeerConnection | undefined) {
    if (!pc) return;
    try {
      for (const sender of pc.getSenders()) {
        if (sender.track && sender.track.kind === 'audio') {
          try {
            if ('contentHint' in sender.track) {
              sender.track.contentHint = 'speech';
            }
          } catch {}
          if (
            typeof sender.getParameters === 'function' &&
            typeof sender.setParameters === 'function'
          ) {
            const params = sender.getParameters();
            if (params && Array.isArray(params.encodings) && params.encodings.length > 0) {
              const enc = params.encodings[0] as RTCRtpEncodingParameters & {
                networkPriority?: string;
              };
              enc.maxBitrate = 48000;
              enc.priority = 'high';
              enc.networkPriority = 'high';
              sender.setParameters(params).catch(() => {});
            }
          }
        }
      }
    } catch {}
  }

  private unlockAudioContextInGesture() {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        if (!this.audioCtx || this.audioCtx.state === 'closed') {
          this.audioCtx = new AudioCtx();
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume().catch(() => {});
        }
      }
    } catch {}
  }

  private async acquireMicrophone(enableTrack: boolean): Promise<boolean> {
    if (!isMediaCaptureSupported()) {
      this.micPermissionError = 'المتصفح الحالي لا يدعم الوصول إلى الميكروفون';
      this.emit();
      return false;
    }

    if (this.micStream && this.micStream.getAudioTracks().some((t) => t.readyState === 'live')) {
      this.micStream.getAudioTracks().forEach((t) => {
        t.enabled = enableTrack;
        try {
          if ('contentHint' in t) t.contentHint = 'speech';
        } catch {}
      });
      this.micOn = enableTrack;
      this.micReady = true;
      this.micPermissionError = null;
      this.rebuildCombinedStream();
      this.syncTracksToAllPcs();
      this.emit();
      return true;
    }

    let stream: MediaStream | null = null;
    let lastErr: unknown = null;
    try {
      stream = await getUserMediaSafe({
        audio: this.getVoiceAudioConstraints(),
        video: false,
      });
    } catch (e1) {
      lastErr = e1;
      try {
        // Android WebView minimal fallback
        stream = await getUserMediaSafe({ audio: true, video: false });
      } catch (e2) {
        lastErr = e2;
        this.micPermissionError = formatWebViewPermissionError(lastErr, false);
        this.micReady = false;
        this.emit();
        return false;
      }
    }

    this.micStream = stream;
    stream.getAudioTracks().forEach((t) => {
      t.enabled = enableTrack;
      try {
        if ('contentHint' in t) t.contentHint = 'speech';
      } catch {}
    });
    this.micOn = enableTrack;
    this.micReady = true;
    this.micPermissionError = null;
    this.startMicLevelMonitor(stream);
    this.rebuildCombinedStream();
    this.syncTracksToAllPcs();
    this.emit();
    return true;
  }

  /**
   * Called directly inside the "متابعة" (Continue) click handler on the Permissions Screen
   * BEFORE entering 1v1 or 4-player rooms. Safe for Android WebView & iOS Safari.
   */
  public async requestMicPermissionOnContinue(): Promise<{ granted: boolean; error?: string }> {
    if (!isMediaCaptureSupported()) {
      const err = 'المتصفح الحالي لا يدعم الوصول إلى الميكروفون';
      this.micPermissionError = err;
      this.emit();
      return { granted: false, error: err };
    }

    this.userDisabledMic = false;
    this.unlockAudioContextInGesture();

    if (this.micStream && this.micStream.getAudioTracks().some((t) => t.readyState === 'live')) {
      this.micStream.getAudioTracks().forEach((t) => {
        t.enabled = true;
        try {
          if ('contentHint' in t) t.contentHint = 'speech';
        } catch {}
      });
      this.micOn = true;
      this.micReady = true;
      this.micPermissionError = null;
      this.rebuildCombinedStream();
      this.syncTracksToAllPcs();
      this.emit();
      return { granted: true };
    }

    let stream: MediaStream | null = null;
    try {
      stream = await getUserMediaSafe({
        audio: this.getVoiceAudioConstraints(),
        video: false,
      });
    } catch {
      try {
        stream = await getUserMediaSafe({ audio: true });
      } catch (err) {
        const msg = formatWebViewPermissionError(err, false);
        this.micPermissionError = msg;
        this.micReady = false;
        this.emit();
        return { granted: false, error: msg };
      }
    }

    this.micStream = stream;
    stream.getAudioTracks().forEach((t) => {
      t.enabled = true;
      try {
        if ('contentHint' in t) t.contentHint = 'speech';
      } catch {}
    });
    this.micOn = true;
    this.micReady = true;
    this.micPermissionError = null;
    this.startMicLevelMonitor(stream);
    this.rebuildCombinedStream();
    this.syncTracksToAllPcs();
    this.emit();
    return { granted: true };
  }

  /**
   * Single-call Audio + Video acquisition for Video Calls (critical for Android WebView
   * so WebChromeClient.onPermissionRequest prompts once for both camera & microphone!).
   */
  private async acquireCombinedAudioVideo(facing: 'user' | 'environment'): Promise<boolean> {
    if (!isMediaCaptureSupported()) return false;
    this.stopCamera();

    const attempts: MediaStreamConstraints[] = [
      {
        audio: this.getVoiceAudioConstraints(),
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      },
      {
        audio: true,
        video: { facingMode: facing },
      },
      {
        audio: true,
        video: true,
      },
    ];

    for (const constraints of attempts) {
      try {
        const stream = await getUserMediaSafe(constraints);
        const audioTracks = stream.getAudioTracks();
        const videoTracks = stream.getVideoTracks();

        if (audioTracks.length > 0) {
          if (this.micStream) {
            this.micStream.getAudioTracks().forEach((t) => t.stop());
          }
          const newMic = new MediaStream(audioTracks);
          audioTracks.forEach((t) => {
            t.enabled = !this.userDisabledMic;
            try {
              if ('contentHint' in t) t.contentHint = 'speech';
            } catch {}
          });
          this.micStream = newMic;
          this.micOn = !this.userDisabledMic;
          this.micReady = true;
          this.micPermissionError = null;
          this.startMicLevelMonitor(newMic);
        }

        if (videoTracks.length > 0) {
          this.camStream = new MediaStream(videoTracks);
          this.camOn = true;
          this.facingMode = facing;
        }

        this.rebuildCombinedStream();
        this.syncTracksToAllPcs();
        this.emit();
        return videoTracks.length > 0;
      } catch {
        // Try next simpler constraint set for Android WebView compatibility
      }
    }

    // Fallback: acquire audio only so voice call still works even if camera is unavailable
    await this.acquireMicrophone(!this.userDisabledMic);
    this.camOn = false;
    this.callStatusText = 'تعذر تشغيل الكاميرا — مستمر بالصوت المباشر';
    this.emit();
    return false;
  }

  private async acquireCamera(facing: 'user' | 'environment'): Promise<boolean> {
    if (!isMediaCaptureSupported()) return false;
    this.stopCamera();

    const attempts: MediaStreamConstraints[] = [
      {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      },
      { video: { facingMode: facing }, audio: false },
      { video: true, audio: false },
    ];

    for (const constraints of attempts) {
      try {
        const stream = await getUserMediaSafe(constraints);
        if (stream.getVideoTracks().length > 0) {
          this.camStream = stream;
          this.camOn = true;
          this.facingMode = facing;
          this.rebuildCombinedStream();
          this.syncTracksToAllPcs();
          this.emit();
          return true;
        }
      } catch {}
    }

    this.camOn = false;
    this.callStatusText = 'تعذر تشغيل الكاميرا — مستمر بالصوت';
    this.emit();
    return false;
  }

  private stopCamera() {
    if (this.camStream) {
      this.camStream.getTracks().forEach((t) => t.stop());
      this.camStream = null;
    }
    this.camOn = false;
    this.rebuildCombinedStream();
  }

  private startMicLevelMonitor(stream: MediaStream) {
    try {
      if (this.levelTimer !== null) {
        clearInterval(this.levelTimer);
        this.levelTimer = null;
      }
      if (this.audioCtx) {
        this.audioCtx.close().catch(() => {});
      }
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      this.audioCtx = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.65;
      source.connect(analyser);
      this.analyser = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      this.levelTimer = setInterval(() => {
        if (!this.analyser) return;
        if (!this.micOn) {
          if (this.micLevel !== 0) {
            this.micLevel = 0;
            this.emit();
          }
          return;
        }
        this.analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const avg = sum / data.length;
        const normalized = Math.min(100, Math.round((avg / 64) * 100));
        if (Math.abs(normalized - this.micLevel) >= 5) {
          this.micLevel = normalized;
          this.emit();
        }
      }, 180);
    } catch {}
  }

  public async toggleMic(): Promise<boolean> {
    const next = !this.micOn;
    this.userDisabledMic = !next;
    if (next) {
      this.unlockAudioContextInGesture();
      const ok = await this.acquireMicrophone(true);
      if (ok && (this.inCall || this.matchMicRoomId)) {
        this.syncTracksToAllPcs();
        await this.publishMediaState();
        this.reconcileConnections();
      }
      return ok;
    } else {
      this.micOn = false;
      this.micLevel = 0;
      if (this.micStream) {
        this.micStream.getAudioTracks().forEach((t) => {
          t.enabled = false;
        });
      }
      if (this.combinedStream) {
        this.combinedStream.getAudioTracks().forEach((t) => {
          t.enabled = false;
        });
      }
      if (this.inCall || this.matchMicRoomId) {
        await this.publishMediaState();
      }
      this.emit();
      return false;
    }
  }

  private rebuildCombinedStream() {
    const tracks: MediaStreamTrack[] = [];
    if (this.micStream) {
      this.micStream.getAudioTracks().forEach((t) => {
        if (t.readyState === 'live') tracks.push(t);
      });
    }
    if (this.camStream && this.camOn) {
      this.camStream.getVideoTracks().forEach((t) => {
        if (t.readyState === 'live') tracks.push(t);
      });
    }
    this.combinedStream = tracks.length > 0 ? new MediaStream(tracks) : null;
  }

  private getOrCreateSilentAudioStream(): MediaStream | null {
    try {
      if (!this.silentAudioStream) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const dest = ctx.createMediaStreamDestination();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          gain.gain.value = 0;
          osc.connect(gain);
          gain.connect(dest);
          osc.start();
          this.silentAudioCtx = ctx;
          this.silentAudioStream = dest.stream;
        }
      }
      return this.silentAudioStream;
    } catch {
      return null;
    }
  }

  private getLocalStreamForMode(mode: 'match' | 'call'): MediaStream | null {
    if (mode === 'match') {
      if (this.micStream && this.micStream.getAudioTracks().some((t) => t.readyState === 'live')) {
        return this.micStream;
      }
      return this.getOrCreateSilentAudioStream();
    }
    if (this.combinedStream && this.combinedStream.getTracks().some((t) => t.readyState === 'live')) {
      return this.combinedStream;
    }
    return this.getOrCreateSilentAudioStream();
  }

  private syncTracksToAllPcs(): boolean {
    let addedNewTrack = false;
    this.pcs.forEach((pc, remotePeerId) => {
      try {
        if (pc.connectionState === 'closed' || pc.signalingState === 'closed') return;
        const pcMode = this.pcModeMap.get(remotePeerId) || 'match';
        const stream = this.getLocalStreamForMode(pcMode);
        if (!stream) return;

        const senders = pc.getSenders();
        const audioTrack = stream.getAudioTracks().find((t) => t.readyState === 'live');
        if (audioTrack) {
          const audioSender = senders.find((s) => s.track && s.track.kind === 'audio');
          if (audioSender) {
            if (audioSender.track !== audioTrack) {
              audioSender.replaceTrack(audioTrack).catch(() => {});
            }
          } else {
            pc.addTrack(audioTrack, stream);
            addedNewTrack = true;
          }
          this.tuneAudioSender(pc);
        }

        if (pcMode === 'call') {
          const videoTrack =
            this.camOn && this.camStream
              ? this.camStream.getVideoTracks().find((t) => t.readyState === 'live')
              : null;
          const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
          if (videoTrack) {
            if (videoSender) {
              if (videoSender.track !== videoTrack) {
                videoSender.replaceTrack(videoTrack).catch(() => {});
              }
            } else {
              pc.addTrack(videoTrack, stream);
              addedNewTrack = true;
            }
          } else if (videoSender) {
            videoSender.replaceTrack(null).catch(() => {});
          }
        }
      } catch {}
    });
    return addedNewTrack;
  }

  // =========================================================================
  // Firebase Realtime Database Signaling & Presence (ZERO Local Server)
  // =========================================================================
  private connectFirebaseSignaling(roomId: string) {
    const cleanRoom = sanitizeFirebaseKey(roomId);
    if (!cleanRoom) return;
    if (this.signalingRoomId === cleanRoom && this.unsubParticipants && this.unsubSignals) {
      return;
    }

    this.disconnectFirebaseSignaling();
    this.signalingRoomId = cleanRoom;
    this.processedSignalIds.clear();

    // Track live Firebase RTDB connection state
    const connectedRef = ref(rtdb, '.info/connected');
    this.unsubConnected = onValue(
      connectedRef,
      (snap) => {
        const connected = snap.val() === true;
        this.peerReady = connected;
        this.peerError = connected ? null : 'connecting';
        if (connected && this.signalingRoomId) {
          this.publishMediaState().catch(() => {});
        }
        this.emit();
      },
      () => {}
    );

    // Watch all participants in this RTC room
    const participantsRef = ref(rtdb, `rtc_rooms/${cleanRoom}/participants`);
    this.unsubParticipants = onValue(
      participantsRef,
      (snap) => {
        const now = Date.now();
        const raw = (snap.val() || {}) as Record<string, RtcParticipant>;
        const activeList: RtcParticipant[] = [];
        const activeIds = new Set<string>();

        Object.values(raw).forEach((p) => {
          if (!p || !p.peerId) return;
          // Ignore stale ghost entries older than 75s
          if (p.peerId !== this.peerId && p.lastSeen && now - p.lastSeen > 75000) return;
          if (this.blockedPeersMap.has(p.peerId)) return;
          activeList.push(p);
          activeIds.add(p.peerId);
        });

        // Clean up peers who left
        Array.from(this.roomPeersMap.keys()).forEach((pid) => {
          if (!activeIds.has(pid)) {
            this.roomPeersMap.delete(pid);
            this.removeRemotePeer(pid);
          }
        });

        this.participants = activeList;
        activeList.forEach((p) => {
          this.roomPeersMap.set(p.peerId, p);
          const remoteCall = this.remoteStreamsMap.get(p.peerId);
          if (remoteCall) {
            remoteCall.micOn = p.micOn;
            remoteCall.camOn = p.camOn;
            remoteCall.callMode = p.callMode;
          }
          const remoteMatch = this.matchRemoteStreamsMap.get(p.peerId);
          if (remoteMatch) {
            remoteMatch.micOn = p.micOn;
          }
        });

        this.reconcileConnections();
        this.emit();
      },
      () => {}
    );

    // Listen to incoming WebRTC signals (offer / answer / ice / ring / hangup / reject)
    const signalsRef = ref(rtdb, `rtc_rooms/${cleanRoom}/signals`);
    const listenStartedAt = Date.now() - 8000;
    this.unsubSignals = onChildAdded(
      signalsRef,
      (snap) => {
        const sig = snap.val() as RtcSignalPayload | null;
        if (!sig || !sig.fromId || sig.fromId === this.peerId) return;
        if (sig.ts && sig.ts < listenStartedAt) return;
        const sigKey = snap.key || sig.id;
        if (sig.toId && sig.toId !== this.peerId) return;

        void this.handleIncomingSignal({ ...sig, id: sig.id || sigKey || '' });

        // Delete targeted consumed signals so RTDB stays lean and fast
        if (sig.toId === this.peerId && snap.key) {
          remove(ref(rtdb, `rtc_rooms/${cleanRoom}/signals/${snap.key}`)).catch(() => {});
        }
      },
      () => {}
    );

    // Heartbeat presence every 15s + periodic WebRTC reconciler
    this.presenceTimer = setInterval(() => {
      if (this.signalingRoomId) {
        this.publishMediaState().catch(() => {});
      }
    }, 15000);

    this.reconcileTimer = setInterval(() => {
      this.runPeriodicReconciler();
    }, 2400);
  }

  private disconnectFirebaseSignaling() {
    const prevRoom = this.signalingRoomId;
    this.signalingRoomId = '';

    if (this.unsubParticipants) {
      try {
        this.unsubParticipants();
      } catch {}
      this.unsubParticipants = null;
    }
    if (this.unsubSignals) {
      try {
        this.unsubSignals();
      } catch {}
      this.unsubSignals = null;
    }
    if (this.unsubConnected) {
      try {
        this.unsubConnected();
      } catch {}
      this.unsubConnected = null;
    }
    if (this.presenceTimer) {
      clearInterval(this.presenceTimer);
      this.presenceTimer = null;
    }
    if (this.reconcileTimer) {
      clearInterval(this.reconcileTimer);
      this.reconcileTimer = null;
    }
    if (prevRoom) {
      const cleanPeer = sanitizeFirebaseKey(this.peerId);
      remove(ref(rtdb, `rtc_rooms/${prevRoom}/participants/${cleanPeer}`)).catch(() => {});
    }
  }

  private async registerRoomPresence(roomId: string, inCall: boolean) {
    const cleanRoom = sanitizeFirebaseKey(roomId);
    const cleanPeer = sanitizeFirebaseKey(this.peerId);
    if (!cleanRoom || !cleanPeer) return;

    const participantRef = ref(rtdb, `rtc_rooms/${cleanRoom}/participants/${cleanPeer}`);
    const payload: RtcParticipant = {
      peerId: this.peerId,
      name: this.profileName,
      avatar: this.profileAvatar,
      callMode: this.callMode,
      micOn: this.micOn,
      camOn: this.camOn,
      inCall,
      lastSeen: Date.now(),
    };

    try {
      await set(participantRef, payload);
      onDisconnect(participantRef).remove().catch(() => {});
    } catch {}
  }

  private async sendFirebaseSignal(
    roomId: string,
    toId: string | undefined,
    type: RtcSignalPayload['type'],
    payload: unknown,
    callMode?: CallMode,
    matchMic?: boolean
  ) {
    const cleanRoom = sanitizeFirebaseKey(roomId || this.activeRoomId || this.watchedRoomId);
    if (!cleanRoom) return;

    const sigRef = push(ref(rtdb, `rtc_rooms/${cleanRoom}/signals`));
    const data: Record<string, unknown> = {
      id: sigRef.key || `sig_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      fromId: this.peerId,
      fromName: this.profileName,
      fromAvatar: this.profileAvatar,
      type,
      callMode: callMode || this.callMode,
      matchMic: Boolean(matchMic),
      payload: payload ?? null,
      ts: Date.now(),
    };
    if (toId) data.toId = toId;

    await set(sigRef, data).catch(() => {});
  }

  // =========================================================================
  // Room Watch & Match Voice Session (1v1 & 4-Player)
  // =========================================================================
  public watchRoom(roomId: string) {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      this.callStatusText = 'مطلوب اتصال بالإنترنت لتشغيل الغرف والمكالمات';
      this.emit();
      return;
    }
    const cleanRoom = (roomId || '').trim();
    if (!cleanRoom) return;
    if (this.watchedRoomId === cleanRoom && this.signalingRoomId === sanitizeFirebaseKey(cleanRoom)) {
      return;
    }

    this.watchedRoomId = cleanRoom;
    if (!this.inCall) {
      this.activeRoomId = cleanRoom;
    }
    this.roomPeersMap.clear();
    this.connectFirebaseSignaling(cleanRoom);
    void this.registerRoomPresence(cleanRoom, this.inCall);
    this.emit();
  }

  public stopWatching() {
    if (this.inCall) {
      void this.hangup();
    }
    this.incomingCall = null;
    this.stopRingTone();
    this.watchedRoomId = '';
    this.activeRoomId = '';
    this.participants = [];
    this.roomPeersMap.clear();
    this.closeAllPcs();
    this.disconnectFirebaseSignaling();
    this.emit();
  }

  public async startMatchMicSession(roomId: string): Promise<void> {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      this.callStatusText = 'مطلوب اتصال بالإنترنت لتشغيل الميكروفون أونلاين';
      this.emit();
      return;
    }
    const raw = (roomId || '').trim();
    if (!raw) return;
    const matchChannel = `voice_${raw}`;
    if (this.inCall) return;

    if (
      this.matchMicRoomId === matchChannel &&
      this.signalingRoomId === sanitizeFirebaseKey(matchChannel)
    ) {
      await this.ensureAutoMicActive().catch(() => {});
      this.syncTracksToAllPcs();
      this.reconcileConnections();
      return;
    }

    this.closeAllPcs();
    this.matchMicRoomId = matchChannel;
    this.watchedRoomId = matchChannel;
    this.activeRoomId = matchChannel;
    this.callMode = 'audio';
    this.camOn = false;
    this.roomPeersMap.clear();
    this.matchRemoteStreamsMap.clear();
    this.lastDialAttemptMap.clear();

    // Acquire microphone track FIRST before exchanging any WebRTC signaling!
    await this.ensureAutoMicActive().catch(() => {});
    if (this.matchMicRoomId !== matchChannel || this.inCall) return;

    this.connectFirebaseSignaling(matchChannel);
    await this.registerRoomPresence(matchChannel, false);
    if (this.matchMicRoomId !== matchChannel || this.inCall) return;

    this.reconcileConnections();
    this.emit();
  }

  public stopMatchMicSession() {
    this.lastDialAttemptMap.clear();
    this.closeAllPcs();
    if (!this.matchMicRoomId) return;
    this.matchMicRoomId = '';
    this.watchedRoomId = '';
    if (!this.inCall) {
      this.activeRoomId = '';
    }
    this.participants = [];
    this.roomPeersMap.clear();
    this.matchRemoteStreamsMap.clear();
    this.disconnectFirebaseSignaling();
    this.emit();
  }

  // =========================================================================
  // Native WebRTC Mesh PeerConnection Engine (with Metered TURN)
  // =========================================================================
  private closePc(remotePeerId: string) {
    const pc = this.pcs.get(remotePeerId);
    if (pc) {
      try {
        pc.onicecandidate = null;
        pc.ontrack = null;
        pc.oniceconnectionstatechange = null;
        pc.onconnectionstatechange = null;
        pc.close();
      } catch {}
      this.pcs.delete(remotePeerId);
    }
    this.pcModeMap.delete(remotePeerId);
    this.pendingIce.delete(remotePeerId);
    this.makingOffer.delete(remotePeerId);
    this.remoteTrackStreams.delete(remotePeerId);
  }

  private closeAllPcs() {
    Array.from(this.pcs.keys()).forEach((pid) => this.closePc(pid));
    this.pcs.clear();
    this.pcModeMap.clear();
    this.pendingIce.clear();
    this.makingOffer.clear();
    this.remoteTrackStreams.clear();
  }

  private createOrGetPc(
    remotePeer: RtcParticipant,
    mode: 'match' | 'call'
  ): RTCPeerConnection {
    const existing = this.pcs.get(remotePeer.peerId);
    if (
      existing &&
      this.pcModeMap.get(remotePeer.peerId) === mode &&
      existing.signalingState !== 'closed' &&
      existing.connectionState !== 'closed' &&
      existing.iceConnectionState !== 'failed' &&
      existing.iceConnectionState !== 'closed'
    ) {
      this.attachLocalTracksToPc(existing, mode);
      return existing;
    }

    if (existing) {
      this.closePc(remotePeer.peerId);
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);
    this.pcs.set(remotePeer.peerId, pc);
    this.pcModeMap.set(remotePeer.peerId, mode);

    // Attach local audio (and video in video calls) BEFORE exchanging SDP
    this.attachLocalTracksToPc(pc, mode);

    pc.onicecandidate = (ev) => {
      const targetRoom = mode === 'match' ? this.matchMicRoomId : this.activeRoomId;
      if (ev.candidate && targetRoom) {
        this.sendFirebaseSignal(
          targetRoom,
          remotePeer.peerId,
          'ice',
          { candidate: ev.candidate.toJSON() },
          mode === 'match' ? 'audio' : this.callMode,
          mode === 'match'
        ).catch(() => {});
      }
    };

    pc.ontrack = (ev) => {
      if (this.blockedPeersMap.has(remotePeer.peerId)) return;

      let combinedRemote = this.remoteTrackStreams.get(remotePeer.peerId);
      if (!combinedRemote) {
        combinedRemote =
          ev.streams && ev.streams[0] ? new MediaStream(ev.streams[0].getTracks()) : new MediaStream();
      }
      if (!combinedRemote.getTracks().some((t) => t.id === ev.track.id)) {
        combinedRemote.addTrack(ev.track);
      }
      // Fresh MediaStream wrapper triggers React <video>/<audio> ref updates cleanly when video track arrives after audio
      const freshStream = new MediaStream(combinedRemote.getTracks());
      this.remoteTrackStreams.set(remotePeer.peerId, freshStream);

      const known = this.roomPeersMap.get(remotePeer.peerId) || remotePeer;
      const hasLiveVideo = freshStream.getVideoTracks().some((t) => t.readyState === 'live');
      const entry: RemotePeerStream = {
        peerId: remotePeer.peerId,
        name: known.name || 'متسابق',
        avatar: known.avatar || '👤',
        stream: freshStream,
        micOn: known.micOn ?? true,
        camOn: mode === 'call' ? (known.camOn || hasLiveVideo) : false,
        callMode: mode === 'call' ? (hasLiveVideo || known.callMode === 'video' ? 'video' : 'audio') : 'audio',
      };

      if (mode === 'match') {
        this.matchRemoteStreamsMap.set(remotePeer.peerId, entry);
      } else {
        this.remoteStreamsMap.set(remotePeer.peerId, entry);
      }
      this.emit();
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      if (state === 'connected' || state === 'completed') {
        this.tuneAudioSender(pc);
      }
      if (state === 'failed' || state === 'closed') {
        if (this.pcs.get(remotePeer.peerId) === pc) {
          this.closePc(remotePeer.peerId);
          this.remoteStreamsMap.delete(remotePeer.peerId);
          this.matchRemoteStreamsMap.delete(remotePeer.peerId);
          this.emit();
        }
      }
    };

    return pc;
  }

  private attachLocalTracksToPc(pc: RTCPeerConnection, mode: 'match' | 'call') {
    const localStream = this.getLocalStreamForMode(mode);
    const senders = pc.getSenders();

    if (localStream) {
      const audioTrack = localStream.getAudioTracks().find((t) => t.readyState === 'live');
      if (audioTrack) {
        const audioSender = senders.find((s) => s.track && s.track.kind === 'audio');
        if (!audioSender) {
          pc.addTrack(audioTrack, localStream);
        } else if (audioSender.track !== audioTrack) {
          audioSender.replaceTrack(audioTrack).catch(() => {});
        }
        this.tuneAudioSender(pc);
      } else if (!senders.some((s) => s.track?.kind === 'audio')) {
        try {
          pc.addTransceiver('audio', { direction: 'sendrecv' });
        } catch {}
      }

      if (mode === 'call') {
        const videoTrack =
          this.camOn && this.camStream
            ? this.camStream.getVideoTracks().find((t) => t.readyState === 'live')
            : null;
        const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
        if (videoTrack) {
          if (!videoSender) {
            pc.addTrack(videoTrack, localStream);
          } else if (videoSender.track !== videoTrack) {
            videoSender.replaceTrack(videoTrack).catch(() => {});
          }
        } else if (!videoSender && pc.getTransceivers().every((t) => t.receiver.track?.kind !== 'video')) {
          try {
            pc.addTransceiver('video', { direction: 'recvonly' });
          } catch {}
        }
      }
    } else {
      try {
        pc.addTransceiver('audio', { direction: 'sendrecv' });
        if (mode === 'call') {
          pc.addTransceiver('video', { direction: 'recvonly' });
        }
      } catch {}
    }
  }

  private async drainPendingIce(remotePeerId: string, pc: RTCPeerConnection) {
    const queue = this.pendingIce.get(remotePeerId);
    if (!queue || queue.length === 0) return;
    this.pendingIce.delete(remotePeerId);
    for (const cand of queue) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(cand));
      } catch {}
    }
  }

  private async initiateOffer(remotePeer: RtcParticipant, mode: 'match' | 'call', forceRenegotiate = false) {
    const targetRoom = mode === 'match' ? this.matchMicRoomId : this.activeRoomId;
    if (!targetRoom) return;
    if (mode === 'match' && this.inCall) return;
    if (mode === 'call' && !this.inCall) return;
    if (this.blockedPeersMap.has(remotePeer.peerId)) return;
    if (this.makingOffer.get(remotePeer.peerId)) return;

    this.makingOffer.set(remotePeer.peerId, true);
    try {
      if (
        !this.userDisabledMic &&
        (!this.micStream || !this.micStream.getAudioTracks().some((t) => t.readyState === 'live'))
      ) {
        await this.acquireMicrophone(true).catch(() => false);
      }
      const pc = this.createOrGetPc(remotePeer, mode);
      if (pc.signalingState !== 'stable') return;
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: mode === 'call',
        iceRestart: forceRenegotiate,
      });
      if ((mode === 'match' && (!this.matchMicRoomId || this.inCall)) || (mode === 'call' && !this.inCall)) {
        return;
      }
      await pc.setLocalDescription(offer);
      await this.sendFirebaseSignal(
        targetRoom,
        remotePeer.peerId,
        'offer',
        { sdp: pc.localDescription?.toJSON ? pc.localDescription.toJSON() : { type: offer.type, sdp: offer.sdp } },
        mode === 'match' ? 'audio' : this.callMode,
        mode === 'match'
      );
    } catch {
      // Periodic reconciler will retry cleanly
    } finally {
      this.makingOffer.set(remotePeer.peerId, false);
    }
  }

  private reconcileConnections(forceRetry = false) {
    const nowMs = Date.now();
    const mode: 'match' | 'call' | null = this.inCall
      ? 'call'
      : this.matchMicRoomId
      ? 'match'
      : null;
    if (!mode) return;

    const seen = new Map<string, RtcParticipant>();
    this.roomPeersMap.forEach((p, id) => {
      if (id !== this.peerId && !this.blockedPeersMap.has(id)) {
        if (mode === 'match' || p.inCall) {
          seen.set(id, p);
        }
      }
    });

    seen.forEach((remotePeer) => {
      const existing = this.pcs.get(remotePeer.peerId);
      const streamMap = mode === 'match' ? this.matchRemoteStreamsMap : this.remoteStreamsMap;
      if (existing && this.pcModeMap.get(remotePeer.peerId) === mode) {
        const iceState = existing.iceConnectionState;
        const hasStream = streamMap.has(remotePeer.peerId);
        if (
          (hasStream || iceState === 'connected' || iceState === 'completed' || iceState === 'checking') &&
          iceState !== 'failed' &&
          iceState !== 'closed'
        ) {
          return;
        }
        if (!forceRetry) return;
        const lastDial = this.lastDialAttemptMap.get(remotePeer.peerId) || 0;
        if (nowMs - lastDial < 5500) return;
        this.closePc(remotePeer.peerId);
      }

      const lastDial = this.lastDialAttemptMap.get(remotePeer.peerId) || 0;
      if (nowMs - lastDial < 2500) return;

      if (this.peerId < remotePeer.peerId) {
        this.lastDialAttemptMap.set(remotePeer.peerId, nowMs);
        void this.initiateOffer(remotePeer, mode);
      } else if (forceRetry) {
        const seenKey = `seen_${remotePeer.peerId}`;
        const firstSeen = this.lastDialAttemptMap.get(seenKey) || nowMs;
        if (!this.lastDialAttemptMap.has(seenKey)) {
          this.lastDialAttemptMap.set(seenKey, nowMs);
          return;
        }
        if (nowMs - firstSeen >= 4000) {
          this.lastDialAttemptMap.set(remotePeer.peerId, nowMs);
          void this.initiateOffer(remotePeer, mode);
        }
      }
    });
  }

  private runPeriodicReconciler() {
    if (!this.matchMicRoomId && !this.inCall) return;

    try {
      if (this.silentAudioCtx && this.silentAudioCtx.state === 'suspended') {
        this.silentAudioCtx.resume().catch(() => {});
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
    } catch {}

    if (!this.userDisabledMic) {
      const hasLiveMic =
        Boolean(this.micStream) &&
        this.micStream!.getAudioTracks().some((t) => t.readyState === 'live');
      if (!hasLiveMic) {
        this.acquireMicrophone(true)
          .then((ok) => {
            if (ok) this.syncTracksToAllPcs();
          })
          .catch(() => {});
      } else {
        this.micStream!.getAudioTracks().forEach((t) => {
          if (!t.enabled) t.enabled = true;
        });
      }
    }

    this.pcs.forEach((pc, pid) => {
      const iceState = pc.iceConnectionState;
      if (iceState === 'failed' || iceState === 'closed' || pc.connectionState === 'failed') {
        this.closePc(pid);
        this.remoteStreamsMap.delete(pid);
        this.matchRemoteStreamsMap.delete(pid);
        this.emit();
      }
    });

    this.reconcileConnections(true);
  }

  // =========================================================================
  // Private Voice & Video Calls (Firebase RTDB + Metered TURN WebRTC)
  // =========================================================================
  public async startCall(roomId: string, mode: CallMode): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      this.callStatusText = 'مطلوب اتصال بالإنترنت لبدء مكالمة صوت أو فيديو';
      this.emit();
      return false;
    }
    const cleanRoom = (roomId || '').trim();
    if (!cleanRoom) return false;

    this.unlockAudioContextInGesture();
    this.closeAllPcs();
    this.matchMicRoomId = '';
    this.activeRoomId = cleanRoom;
    this.watchedRoomId = cleanRoom;
    this.callMode = mode;
    this.inCall = true;
    this.incomingCall = null;
    this.stopRingTone();
    this.callStatusText =
      mode === 'video'
        ? 'جاري تشغيل مكالمة الفيديو المباشرة...'
        : 'جاري بدء الاتصال الصوتي المباشر...';
    this.emit();

    // Android WebView optimization: acquire audio+video in ONE getUserMedia call inside user tap!
    if (mode === 'video') {
      await this.acquireCombinedAudioVideo(this.facingMode);
    } else {
      this.stopCamera();
      await this.acquireMicrophone(!this.userDisabledMic);
    }

    this.connectFirebaseSignaling(cleanRoom);
    this.startCallTimer();
    await this.registerRoomPresence(cleanRoom, true);

    // Connect to all non-blocked participants already inside the call
    this.reconcileConnections();

    // Ring everyone in the room who hasn't joined the call yet
    await this.sendFirebaseSignal(
      cleanRoom,
      undefined,
      'ring',
      { name: this.profileName, avatar: this.profileAvatar },
      mode,
      false
    );

    this.callStatusText =
      mode === 'video' ? 'مكالمة فيديو نشطة (TURN)' : 'اتصال صوتي نشط (TURN)';
    this.emit();
    return true;
  }

  public async acceptIncomingCall(): Promise<void> {
    if (!this.incomingCall) return;
    const { roomId, callMode } = this.incomingCall;
    this.incomingCall = null;
    this.stopRingTone();
    await this.startCall(roomId, callMode);
  }

  public rejectIncomingCall() {
    if (!this.incomingCall) return;
    const { roomId, fromId } = this.incomingCall;
    this.incomingCall = null;
    this.stopRingTone();
    this.sendFirebaseSignal(roomId, fromId, 'reject', {}).catch(() => {});
    this.emit();
  }

  public async toggleCamera(): Promise<void> {
    if (!this.inCall) return;
    if (this.camOn) {
      this.stopCamera();
      this.callMode = 'audio';
      this.syncTracksToAllPcs();
    } else {
      const ok = await this.acquireCamera(this.facingMode);
      if (ok) {
        this.callMode = 'video';
        const addedNew = this.syncTracksToAllPcs();
        if (addedNew) {
          // Renegotiate SDP so remote devices immediately receive the newly added video track
          this.pcs.forEach((_pc, remotePeerId) => {
            const p = this.roomPeersMap.get(remotePeerId) || {
              peerId: remotePeerId,
              name: 'متصل',
              avatar: '👤',
              callMode: 'video' as CallMode,
              micOn: true,
              camOn: false,
              inCall: true,
            };
            void this.initiateOffer(p, 'call', false);
          });
        }
      }
    }
    await this.publishMediaState();
    this.emit();
  }

  public async switchCamera(): Promise<void> {
    const nextFacing = this.facingMode === 'user' ? 'environment' : 'user';
    await this.acquireCamera(nextFacing);
    await this.publishMediaState();
  }

  public toggleSpeaker() {
    this.speakerMuted = !this.speakerMuted;
    this.emit();
  }

  private async publishMediaState() {
    const targetRoom = this.activeRoomId || this.watchedRoomId;
    if (!targetRoom) return;
    await this.registerRoomPresence(targetRoom, this.inCall);
  }

  public async hangup() {
    const roomToLeave = this.activeRoomId;
    this.inCall = false;
    this.callStatusText = null;
    this.stopCallTimer();
    this.stopCamera();
    this.closeAllPcs();
    this.remoteStreamsMap.clear();

    if (roomToLeave) {
      this.sendFirebaseSignal(roomToLeave, undefined, 'hangup', {}, this.callMode, false).catch(
        () => {}
      );
      await this.registerRoomPresence(roomToLeave, false);
    }

    this.emit();
  }

  private startCallTimer() {
    this.stopCallTimer();
    this.callDurationSec = 0;
    this.callTimer = setInterval(() => {
      this.callDurationSec++;
      this.emit();
    }, 1000);
  }

  private stopCallTimer() {
    if (this.callTimer) {
      clearInterval(this.callTimer);
      this.callTimer = null;
    }
    this.callDurationSec = 0;
  }

  private removeRemotePeer(remotePeerId: string) {
    this.closePc(remotePeerId);
    this.remoteStreamsMap.delete(remotePeerId);
    this.matchRemoteStreamsMap.delete(remotePeerId);
    this.emit();
  }

  private async handleIncomingSignal(sig: RtcSignalPayload) {
    if (!sig || !sig.fromId || sig.fromId === this.peerId) return;
    if (this.blockedPeersMap.has(sig.fromId)) return;
    if (sig.toId && sig.toId !== this.peerId) return;
    if (sig.id && this.processedSignalIds.has(sig.id)) return;
    if (sig.id) this.processedSignalIds.add(sig.id);
    if (this.processedSignalIds.size > 400) {
      const first = this.processedSignalIds.values().next().value;
      if (first) this.processedSignalIds.delete(first);
    }

    const mode: 'match' | 'call' = sig.matchMic ? 'match' : this.inCall ? 'call' : 'match';

    if (sig.type === 'offer') {
      if (mode === 'match' && (!this.matchMicRoomId || this.inCall)) return;
      if (mode === 'call' && !this.inCall) return;

      const p = (sig.payload || {}) as { sdp?: RTCSessionDescriptionInit };
      if (!p.sdp) return;

      const remoteInfo: RtcParticipant = this.roomPeersMap.get(sig.fromId) || {
        peerId: sig.fromId,
        name: sig.fromName || 'متسابق',
        avatar: sig.fromAvatar || '👤',
        callMode: sig.callMode || 'audio',
        micOn: true,
        camOn: sig.callMode === 'video',
        inCall: mode === 'call',
      };
      this.roomPeersMap.set(sig.fromId, remoteInfo);

      const existing = this.pcs.get(sig.fromId);
      const isPolite = this.peerId > sig.fromId;
      const offerCollision =
        Boolean(this.makingOffer.get(sig.fromId)) ||
        (existing !== undefined && existing.signalingState !== 'stable');
      if (offerCollision && !isPolite) {
        return;
      }
      if (offerCollision && isPolite && existing) {
        this.closePc(sig.fromId);
      }

      try {
        if (
          !this.userDisabledMic &&
          (!this.micStream || !this.micStream.getAudioTracks().some((t) => t.readyState === 'live'))
        ) {
          await this.acquireMicrophone(true).catch(() => false);
        }
        const pc = this.createOrGetPc(remoteInfo, mode);
        await pc.setRemoteDescription(new RTCSessionDescription(p.sdp));
        await this.drainPendingIce(sig.fromId, pc);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        const targetRoom = mode === 'match' ? this.matchMicRoomId : this.activeRoomId;
        await this.sendFirebaseSignal(
          targetRoom,
          sig.fromId,
          'answer',
          {
            sdp: pc.localDescription?.toJSON
              ? pc.localDescription.toJSON()
              : { type: answer.type, sdp: answer.sdp },
          },
          mode === 'match' ? 'audio' : this.callMode,
          mode === 'match'
        );
      } catch {
        this.closePc(sig.fromId);
      }
      return;
    }

    if (sig.type === 'answer') {
      const p = (sig.payload || {}) as { sdp?: RTCSessionDescriptionInit };
      if (!p.sdp) return;
      const pc = this.pcs.get(sig.fromId);
      if (!pc || pc.signalingState !== 'have-local-offer') return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(p.sdp));
        await this.drainPendingIce(sig.fromId, pc);
      } catch {
        this.closePc(sig.fromId);
      }
      return;
    }

    if (sig.type === 'ice') {
      const p = (sig.payload || {}) as { candidate?: RTCIceCandidateInit };
      if (!p.candidate) return;
      const pc = this.pcs.get(sig.fromId);
      if (pc && pc.remoteDescription) {
        pc.addIceCandidate(new RTCIceCandidate(p.candidate)).catch(() => {});
      } else {
        const q = this.pendingIce.get(sig.fromId) || [];
        if (q.length < 50) {
          q.push(p.candidate);
          this.pendingIce.set(sig.fromId, q);
        }
      }
      return;
    }

    if (sig.type === 'ring') {
      if (!this.inCall && (this.watchedRoomId || this.activeRoomId)) {
        this.incomingCall = {
          roomId: this.watchedRoomId || this.activeRoomId,
          fromId: sig.fromId,
          fromName: sig.fromName || 'صديق',
          fromAvatar: sig.fromAvatar || '👤',
          callMode: sig.callMode === 'video' ? 'video' : 'audio',
          timestamp: Date.now(),
        };
        this.startRingTone();
        this.emit();
      }
      return;
    }

    if (sig.type === 'hangup') {
      this.removeRemotePeer(sig.fromId);
      if (this.incomingCall?.fromId === sig.fromId) {
        this.incomingCall = null;
        this.stopRingTone();
      }
      this.emit();
      return;
    }

    if (sig.type === 'reject') {
      this.callStatusText = `${sig.fromName || 'الطرف الآخر'} رفض المكالمة`;
      this.emit();
    }
  }

  private startRingTone() {
    this.stopRingTone();
    const playChime = () => {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.52);
        setTimeout(() => ctx.close().catch(() => {}), 700);
      } catch {}
    };
    playChime();
    this.ringOscInterval = setInterval(playChime, 2400);
  }

  private stopRingTone() {
    if (this.ringOscInterval) {
      clearInterval(this.ringOscInterval);
      this.ringOscInterval = null;
    }
  }
}

export const rtcCallManager = new RtcCallManager();
