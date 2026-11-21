import Peer, { DataConnection, MediaConnection } from 'peerjs';
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
  const digits = String(input || '')
    .trim()
    .replace(/^PRIV-/i, '')
    .replace(/\D/g, '')
    .slice(0, 4);
  return digits;
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478' },
];

class RtcCallManager {
  private peerId: string;
  private profileName = 'متسابق';
  private profileAvatar = '👑';

  // PeerJS primary & room-discovery instances
  private peer: Peer | null = null;
  private peerReady = false;
  private peerError: string | null = null;
  private roomHostPeer: Peer | null = null;
  private dataConns = new Map<string, DataConnection>();
  private mediaConns = new Map<string, MediaConnection>();
  private hostGuestConns = new Map<string, DataConnection>();
  private roomPeersMap = new Map<string, RtcParticipant>();
  private pendingMediaCalls = new Map<string, MediaConnection>();

  // Native WebRTC Mesh peer connections for reliable 1v1 & 4-Player room voice
  private meshPcs = new Map<string, RTCPeerConnection>();
  private meshPendingIce = new Map<string, RTCIceCandidateInit[]>();
  private meshMakingOffer = new Map<string, boolean>();

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
  private blockedPeersMap = new Map<string, BlockedCaller>();
  private incomingCall: IncomingCallAlert | null = null;
  private callStatusText: string | null = null;

  private ws: WebSocket | null = null;
  private sse: EventSource | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private presenceTimer: ReturnType<typeof setInterval> | null = null;
  private matchMicReconcileTimer: ReturnType<typeof setInterval> | null = null;
  private lastDialAttemptMap = new Map<string, number>();
  private lastSignalSeq = 0;
  private processedSignalIds = new Set<string>();

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

    const dc = this.dataConns.get(peerId);
    if (dc) {
      try {
        dc.close();
      } catch {}
      this.dataConns.delete(peerId);
    }

    if (this.incomingCall?.fromId === peerId) {
      const room = this.incomingCall.roomId;
      this.incomingCall = null;
      this.stopRingTone();
      this.sendServerSignal(room, peerId, 'reject', {});
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

  public subscribeChat(fn: (roomId: string, msg: ChatMessage, deletedId?: string) => void): () => void {
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

  // =========================================================================
  // PeerJS Initialization & Room Mesh Discovery (Mobile <-> Laptop Internet)
  // =========================================================================
  private ensurePeerJsInitialized(roomId: string) {
    if (this.peer && !this.peer.destroyed) {
      if (this.peer.disconnected) {
        try {
          this.peer.reconnect();
        } catch {}
      }
      if (this.peerReady) {
        this.joinPeerJsRoomCoordinator(roomId);
      }
      return;
    }

    try {
      const peer = new Peer(this.peerId, {
        debug: 1,
        secure: true,
        config: { iceServers: ICE_SERVERS },
      });
      this.peer = peer;
      this.peerError = null;

      peer.on('open', (id) => {
        this.peerId = id;
        this.peerReady = true;
        this.peerError = null;
        this.emit();
        const targetRoom = this.matchMicRoomId || this.activeRoomId || this.watchedRoomId || roomId;
        if (targetRoom) {
          this.joinPeerJsRoomCoordinator(targetRoom);
        }
        if (this.matchMicRoomId && !this.inCall) {
          this.connectMatchMicPeers();
        }
      });

      peer.on('connection', (conn) => {
        this.setupDataConnection(conn);
      });

      peer.on('call', (mediaConn) => {
        this.handleIncomingPeerMediaCall(mediaConn);
      });

      peer.on('disconnected', () => {
        this.peerReady = false;
        this.emit();
        setTimeout(() => {
          if (this.peer && !this.peer.destroyed && this.peer.disconnected) {
            try {
              this.peer.reconnect();
            } catch {}
          }
        }, 1800);
      });

      peer.on('error', (err) => {
        const errType = (err as { type?: string })?.type || '';
        if (errType === 'peer-unavailable') return;
        this.peerError = errType || 'peer_error';
        this.emit();
      });
    } catch {
      this.peerError = 'peer_init_failed';
      this.emit();
    }
  }

  // Claim or connect to deterministic 4-digit room coordinator ID on PeerJS Cloud
  private joinPeerJsRoomCoordinator(roomId: string) {
    if (!roomId || !this.peer || this.peer.destroyed) return;
    const hostPeerId = `champions_room_${roomId}`;

    // Clean old coordinator if switching rooms
    if (this.roomHostPeer && !this.roomHostPeer.destroyed) {
      if (this.roomHostPeer.id === hostPeerId) {
        return;
      }
      try {
        this.roomHostPeer.destroy();
      } catch {}
      this.roomHostPeer = null;
      this.hostGuestConns.clear();
    }

    try {
      const hostPeer = new Peer(hostPeerId, {
        debug: 0,
        secure: true,
        config: { iceServers: ICE_SERVERS },
      });
      this.roomHostPeer = hostPeer;

      hostPeer.on('open', () => {
        // Claimed room host slot for roomId! Add ourselves to roomPeersMap
        this.upsertRoomPeer({
          peerId: this.peerId,
          name: this.profileName,
          avatar: this.profileAvatar,
          callMode: this.callMode,
          micOn: this.micOn,
          camOn: this.camOn,
          inCall: this.inCall,
          lastSeen: Date.now(),
        });
      });

      hostPeer.on('connection', (guestConn) => {
        guestConn.on('open', () => {
          this.hostGuestConns.set(guestConn.peer, guestConn);
          // Send existing peers roster + self to newly joined guest
          const roster = Array.from(this.roomPeersMap.values());
          try {
            guestConn.send({ type: 'roster', roomId, peers: roster });
          } catch {}
        });
        guestConn.on('data', (raw: unknown) => {
          const msg = raw as Record<string, unknown>;
          if (!msg || typeof msg !== 'object') return;
          if (msg.type === 'hello' && msg.participant) {
            const p = msg.participant as RtcParticipant;
            if (!this.blockedPeersMap.has(p.peerId)) {
              this.upsertRoomPeer(p);
              this.connectDataPeer(p.peerId);
              // Broadcast updated roster to all guests on coordinator channel
              const roster = Array.from(this.roomPeersMap.values());
              this.hostGuestConns.forEach((c) => {
                if (c.open) {
                  try {
                    c.send({ type: 'roster', roomId, peers: roster });
                  } catch {}
                }
              });
            }
          } else if (msg.type === 'chat' || msg.type === 'chat_delete') {
            this.hostGuestConns.forEach((c) => {
              if (c.peer !== guestConn.peer && c.open) {
                try {
                  c.send(msg);
                } catch {}
              }
            });
            this.handleDataPayload(guestConn.peer, msg);
          }
        });
        guestConn.on('close', () => {
          this.hostGuestConns.delete(guestConn.peer);
        });
      });

      hostPeer.on('error', (err) => {
        const errType = (err as { type?: string })?.type || '';
        // If room host ID already exists, another device (e.g. Mobile or Laptop) already hosts this room!
        if (errType === 'unavailable-id') {
          try {
            hostPeer.destroy();
          } catch {}
          this.roomHostPeer = null;
          this.connectToPeerJsHostSlot(hostPeerId, roomId);
        }
      });
    } catch {}
  }

  private connectToPeerJsHostSlot(hostPeerId: string, roomId: string) {
    if (!this.peer || this.peer.destroyed || !this.peerReady) return;
    try {
      const conn = this.peer.connect(hostPeerId, { reliable: true });
      conn.on('open', () => {
        this.dataConns.set(hostPeerId, conn);
        try {
          conn.send({
            type: 'hello',
            roomId,
            participant: {
              peerId: this.peerId,
              name: this.profileName,
              avatar: this.profileAvatar,
              callMode: this.callMode,
              micOn: this.micOn,
              camOn: this.camOn,
              inCall: this.inCall,
              lastSeen: Date.now(),
            },
          });
        } catch {}
      });
      conn.on('data', (raw) => {
        this.handleDataPayload(conn.peer, raw);
      });
      conn.on('close', () => {
        this.dataConns.delete(hostPeerId);
      });
    } catch {}
  }

  private connectDataPeer(remotePeerId: string) {
    if (!remotePeerId || remotePeerId === this.peerId || this.blockedPeersMap.has(remotePeerId)) return;
    if (!this.peer || this.peer.destroyed || !this.peerReady) return;
    const existing = this.dataConns.get(remotePeerId);
    if (existing && existing.open) return;

    try {
      const conn = this.peer.connect(remotePeerId, {
        reliable: true,
        metadata: {
          roomId: this.activeRoomId || this.watchedRoomId,
          name: this.profileName,
          avatar: this.profileAvatar,
        },
      });
      this.setupDataConnection(conn);
    } catch {}
  }

  private setupDataConnection(conn: DataConnection) {
    const remoteId = conn.peer;
    if (this.blockedPeersMap.has(remoteId)) {
      try {
        conn.close();
      } catch {}
      return;
    }

    conn.on('open', () => {
      this.dataConns.set(remoteId, conn);
      try {
        conn.send({
          type: 'hello',
          roomId: this.activeRoomId || this.watchedRoomId,
          participant: {
            peerId: this.peerId,
            name: this.profileName,
            avatar: this.profileAvatar,
            callMode: this.callMode,
            micOn: this.micOn,
            camOn: this.camOn,
            inCall: this.inCall,
            lastSeen: Date.now(),
          },
        });
      } catch {}
    });

    conn.on('data', (raw) => {
      this.handleDataPayload(remoteId, raw);
    });

    conn.on('close', () => {
      this.dataConns.delete(remoteId);
    });

    conn.on('error', () => {
      this.dataConns.delete(remoteId);
    });
  }

  private upsertRoomPeer(p: RtcParticipant) {
    if (!p || !p.peerId || this.blockedPeersMap.has(p.peerId)) return;
    this.roomPeersMap.set(p.peerId, { ...p, lastSeen: Date.now() });
    if (p.peerId !== this.peerId && this.peerReady) {
      this.connectDataPeer(p.peerId);
      if (this.matchMicRoomId && !this.inCall && !this.mediaConns.has(p.peerId)) {
        this.connectMatchMicPeer(p);
      }
    }
    this.emit();
  }

  private handleDataPayload(fromPeerId: string, raw: unknown) {
    if (!raw || typeof raw !== 'object') return;
    const msg = raw as Record<string, unknown>;
    if (this.blockedPeersMap.has(fromPeerId)) return;

    const currentRoom = this.activeRoomId || this.watchedRoomId;
    if (typeof msg.roomId === 'string' && currentRoom && msg.roomId !== currentRoom) return;

    if (msg.type === 'hello' && msg.participant) {
      const p = msg.participant as RtcParticipant;
      this.upsertRoomPeer(p);
      return;
    }

    if (msg.type === 'roster' && Array.isArray(msg.peers)) {
      (msg.peers as RtcParticipant[]).forEach((p) => {
        if (p && p.peerId && !this.blockedPeersMap.has(p.peerId)) {
          this.roomPeersMap.set(p.peerId, p);
          if (p.peerId !== this.peerId) {
            this.connectDataPeer(p.peerId);
          }
        }
      });
      this.emit();
      return;
    }

    if (msg.type === 'chat' && msg.message) {
      const chatMsg = msg.message as ChatMessage;
      if (this.blockedPeersMap.has(chatMsg.senderId)) return;
      this.chatListeners.forEach((fn) => {
        try {
          fn(currentRoom, chatMsg);
        } catch {}
      });
      return;
    }

    if (msg.type === 'chat_delete' && typeof msg.messageId === 'string') {
      this.chatListeners.forEach((fn) => {
        try {
          fn(currentRoom, {} as ChatMessage, String(msg.messageId));
        } catch {}
      });
      return;
    }

    if (msg.type === 'media_state' && msg.participant) {
      const p = msg.participant as RtcParticipant;
      this.upsertRoomPeer(p);
      const remote = this.remoteStreamsMap.get(p.peerId);
      if (remote) {
        remote.micOn = p.micOn;
        remote.camOn = p.camOn;
        remote.callMode = p.callMode;
      }
      this.emit();
      return;
    }

    if (msg.type === 'ring') {
      if (!this.inCall && currentRoom) {
        this.incomingCall = {
          roomId: currentRoom,
          fromId: String(msg.fromId || fromPeerId),
          fromName: String(msg.fromName || 'صديق'),
          fromAvatar: String(msg.fromAvatar || '👤'),
          callMode: msg.callMode === 'video' ? 'video' : 'audio',
          timestamp: Date.now(),
        };
        this.startRingTone();
        this.emit();
      }
      return;
    }

    if (msg.type === 'hangup') {
      const pid = String(msg.fromId || fromPeerId);
      this.removeRemotePeer(pid);
      if (this.incomingCall?.fromId === pid) {
        this.incomingCall = null;
        this.stopRingTone();
      }
      this.emit();
      return;
    }

    if (msg.type === 'reject') {
      this.callStatusText = `${String(msg.fromName || 'الطرف الآخر')} رفض المكالمة`;
      this.emit();
    }
  }

  private broadcastDataToPeers(payload: Record<string, unknown>) {
    this.dataConns.forEach((conn) => {
      if (conn.open) {
        try {
          conn.send(payload);
        } catch {}
      }
    });
    this.hostGuestConns.forEach((conn) => {
      if (conn.open) {
        try {
          conn.send(payload);
        } catch {}
      }
    });
  }

  public sendRoomChatMessage(roomId: string, msg: ChatMessage) {
    this.broadcastDataToPeers({
      type: 'chat',
      roomId,
      message: msg,
    });
  }

  public broadcastDeleteChatMessage(roomId: string, messageId: string) {
    this.broadcastDataToPeers({
      type: 'chat_delete',
      roomId,
      messageId,
    });
  }

  // =========================================================================
  // Audio & Video Media Acquisition + Live Mic Controls
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
      echoCancellation: { ideal: true },
      noiseSuppression: { ideal: true },
      autoGainControl: { ideal: true },
      channelCount: { ideal: 1 },
      sampleRate: { ideal: 48000 },
      sampleSize: { ideal: 16 },
      // Chromium / Android WebView hardware DSP speech flags
      ...({
        googEchoCancellation: true,
        googEchoCancellation2: true,
        googAutoGainControl: true,
        googAutoGainControl2: true,
        googNoiseSuppression: true,
        googNoiseSuppression2: true,
        googHighpassFilter: true,
        googTypingNoiseDetection: true,
      } as Record<string, boolean>),
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
          if (typeof sender.getParameters === 'function' && typeof sender.setParameters === 'function') {
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

  private async acquireMicrophone(enableTrack: boolean): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.micPermissionError = 'المتصفح لا يدعم الوصول للميكروفون';
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
      this.emit();
      return true;
    }

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: this.getVoiceAudioConstraints(),
        video: false,
      });
    } catch {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
      } catch {
        this.micPermissionError = 'يرجى السماح بصلاحية الميكروفون';
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
    this.syncTracksToAllPeerJsConns();
    this.emit();
    return true;
  }

  /**
   * Called directly inside the "متابعة" (Continue) click handler on the Permissions Screen
   * BEFORE entering the 1v1 or 4-player room. Triggers real getUserMedia({ audio: true })
   * and unlocks browser AudioContext so remote <audio> playback & local mic tracks are ready.
   */
  public async requestMicPermissionOnContinue(): Promise<{ granted: boolean; error?: string }> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      const err = 'المتصفح الحالي لا يدعم الوصول إلى الميكروفون';
      this.micPermissionError = err;
      this.emit();
      return { granted: false, error: err };
    }

    this.userDisabledMic = false;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        if (!this.audioCtx) {
          this.audioCtx = new AudioCtx();
        }
        if (this.audioCtx.state === 'suspended') {
          await this.audioCtx.resume().catch(() => {});
        }
      }
    } catch {}

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
      this.syncTracksToAllPeerJsConns();
      this.emit();
      return { granted: true };
    }

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: this.getVoiceAudioConstraints(),
        video: false,
      });
    } catch {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        const msg =
          err instanceof DOMException && err.name === 'NotAllowedError'
            ? 'تم رفض إذن الميكروفون. يرجى السماح بالوصول للميكروفون من إعدادات المتصفح.'
            : 'تعذر تشغيل الميكروفون. تأكد من توصيل الميكروفون والسماح بالإذن.';
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
    this.syncTracksToAllPeerJsConns();
    this.emit();
    return { granted: true };
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
      const ok = await this.acquireMicrophone(true);
      if (ok && (this.inCall || this.matchMicRoomId)) {
        this.syncTracksToAllPeerJsConns();
        await this.publishMediaState();
        if (this.matchMicRoomId) {
          this.connectMatchMicPeers();
        }
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

  private syncTracksToAllPeerJsConns() {
    const stream = this.combinedStream;
    if (!stream) return;
    this.mediaConns.forEach((mc) => {
      const pc = mc.peerConnection;
      if (!pc) return;
      const senders = pc.getSenders();
      stream.getTracks().forEach((track) => {
        const existing = senders.find((s) => s.track && s.track.kind === track.kind);
        if (existing) {
          existing.replaceTrack(track).catch(() => {});
        } else {
          pc.addTrack(track, stream);
        }
      });
      this.tuneAudioSender(pc);
    });

    // Also update audio tracks on all active Native WebRTC Mesh peer connections
    const audioTrack = stream.getAudioTracks().find((t) => t.readyState === 'live');
    if (audioTrack) {
      this.meshPcs.forEach((pc) => {
        try {
          if (pc.connectionState === 'closed' || pc.signalingState === 'closed') return;
          const audioSender = pc.getSenders().find((s) => s.track && s.track.kind === 'audio');
          if (audioSender) {
            audioSender.replaceTrack(audioTrack).catch(() => {});
          } else {
            pc.addTrack(audioTrack, stream);
          }
          this.tuneAudioSender(pc);
        } catch {}
      });
    }
  }

  // =========================================================================
  // Private Room Presence & Dual Signaling (PeerJS + Server WebSocket/HTTP)
  // =========================================================================
  public watchRoom(roomId: string) {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      this.callStatusText = 'مطلوب اتصال بالإنترنت لتشغيل الغرف والمكالمات';
      this.emit();
      return;
    }
    const cleanRoom = (roomId || '').trim();
    if (!cleanRoom) return;
    if (this.watchedRoomId === cleanRoom && (this.ws || this.sse) && this.peer) return;

    this.watchedRoomId = cleanRoom;
    if (!this.inCall) {
      this.activeRoomId = cleanRoom;
    }
    this.roomPeersMap.clear();
    this.ensurePeerJsInitialized(cleanRoom);
    this.connectSignaling(cleanRoom);
    this.registerRoomPresence(cleanRoom, this.inCall);
    this.emit();
  }

  public stopWatching() {
    if (this.inCall) {
      this.hangup();
    }
    const prevRoom = this.watchedRoomId;
    this.incomingCall = null;
    this.stopRingTone();
    this.watchedRoomId = '';
    this.activeRoomId = '';
    this.participants = [];
    this.roomPeersMap.clear();
    this.disconnectSignaling();

    if (prevRoom) {
      fetch(`/api/rooms/${encodeURIComponent(prevRoom)}/rtc/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peerId: this.peerId }),
      }).catch(() => {});
    }

    this.dataConns.forEach((c) => {
      try {
        c.close();
      } catch {}
    });
    this.dataConns.clear();
    if (this.roomHostPeer) {
      try {
        this.roomHostPeer.destroy();
      } catch {}
      this.roomHostPeer = null;
    }
    this.hostGuestConns.clear();
    this.emit();
  }

  private async registerRoomPresence(roomId: string, inCall: boolean) {
    try {
      const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/rtc/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peerId: this.peerId,
          name: this.profileName,
          avatar: this.profileAvatar,
          callMode: this.callMode,
          micOn: this.micOn,
          camOn: this.camOn,
          inCall,
        }),
      });
      const data = await res.json();
      if (data && data.success && Array.isArray(data.participants)) {
        this.syncDiscoveredParticipants(data.participants as RtcParticipant[]);
      }
    } catch {}
  }

  // Create a silent audio stream fallback so PeerJS can always exchange audio
  // even if one side currently has mic muted or blocked (so they still hear their friend!)
  private getOrCreateCallStream(): MediaStream | null {
    if (this.combinedStream && this.combinedStream.getTracks().some((t) => t.readyState === 'live')) {
      return this.combinedStream;
    }
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

    if (this.matchMicRoomId === matchChannel && (this.ws || this.sse)) {
      await this.ensureAutoMicActive().catch(() => {});
      this.syncTracksToAllPeerJsConns();
      this.connectMatchMicPeers();
      this.startMatchMicReconciler();
      return;
    }

    this.closeAllMeshPcs();
    this.matchMicRoomId = matchChannel;
    this.watchedRoomId = matchChannel;
    this.activeRoomId = matchChannel;
    this.callMode = 'audio';
    this.camOn = false;
    this.roomPeersMap.clear();
    this.matchRemoteStreamsMap.clear();
    this.lastDialAttemptMap.clear();

    // Acquire microphone track FIRST before joining/exchanging any WebRTC signaling!
    await this.ensureAutoMicActive().catch(() => {});
    if (this.matchMicRoomId !== matchChannel || this.inCall) return;

    this.connectSignaling(matchChannel);
    await this.registerRoomPresence(matchChannel, false);
    if (this.matchMicRoomId !== matchChannel || this.inCall) return;

    this.connectMatchMicPeers();
    this.startMatchMicReconciler();
    this.emit();
  }

  private closeMeshPc(remotePeerId: string) {
    const pc = this.meshPcs.get(remotePeerId);
    if (pc) {
      try {
        pc.onicecandidate = null;
        pc.ontrack = null;
        pc.oniceconnectionstatechange = null;
        pc.onconnectionstatechange = null;
        pc.close();
      } catch {}
      this.meshPcs.delete(remotePeerId);
    }
    this.meshPendingIce.delete(remotePeerId);
    this.meshMakingOffer.delete(remotePeerId);
  }

  private closeAllMeshPcs() {
    Array.from(this.meshPcs.keys()).forEach((pid) => this.closeMeshPc(pid));
    this.meshPcs.clear();
    this.meshPendingIce.clear();
    this.meshMakingOffer.clear();
  }

  private getLocalMatchAudioStream(): MediaStream | null {
    if (this.micStream && this.micStream.getAudioTracks().some((t) => t.readyState === 'live')) {
      return this.micStream;
    }
    return this.getOrCreateCallStream();
  }

  private createOrGetMeshPc(remotePeer: RtcParticipant): RTCPeerConnection {
    const existing = this.meshPcs.get(remotePeer.peerId);
    if (
      existing &&
      existing.signalingState !== 'closed' &&
      existing.connectionState !== 'closed' &&
      existing.iceConnectionState !== 'failed' &&
      existing.iceConnectionState !== 'closed'
    ) {
      // Ensure local audio track is attached before any signaling
      const localStream = this.getLocalMatchAudioStream();
      if (localStream) {
        const audioTrack = localStream.getAudioTracks().find((t) => t.readyState === 'live');
        if (audioTrack) {
          const sender = existing.getSenders().find((s) => s.track && s.track.kind === 'audio');
          if (!sender) {
            existing.addTrack(audioTrack, localStream);
            this.tuneAudioSender(existing);
          } else if (sender.track !== audioTrack) {
            sender.replaceTrack(audioTrack).catch(() => {});
            this.tuneAudioSender(existing);
          }
        }
      }
      return existing;
    }

    if (existing) {
      this.closeMeshPc(remotePeer.peerId);
    }

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    this.meshPcs.set(remotePeer.peerId, pc);

    // CRITICAL: Attach local audio track(s) to peer connection BEFORE exchanging SDP signaling
    const localStream = this.getLocalMatchAudioStream();
    if (localStream) {
      const audioTracks = localStream.getAudioTracks().filter((t) => t.readyState === 'live');
      if (audioTracks.length > 0) {
        audioTracks.forEach((track) => {
          pc.addTrack(track, localStream);
        });
        this.tuneAudioSender(pc);
      } else {
        try {
          pc.addTransceiver('audio', { direction: 'sendrecv' });
        } catch {}
      }
    } else {
      try {
        pc.addTransceiver('audio', { direction: 'sendrecv' });
      } catch {}
    }

    pc.onicecandidate = (ev) => {
      if (ev.candidate && this.matchMicRoomId) {
        this.sendServerSignal(
          this.matchMicRoomId,
          remotePeer.peerId,
          'ice',
          { candidate: ev.candidate.toJSON(), matchMic: true },
          'audio'
        ).catch(() => {});
      }
    };

    pc.ontrack = (ev) => {
      if (this.blockedPeersMap.has(remotePeer.peerId)) return;
      const incomingStream =
        ev.streams && ev.streams[0] ? ev.streams[0] : new MediaStream([ev.track]);
      const known = this.roomPeersMap.get(remotePeer.peerId) || remotePeer;
      this.matchRemoteStreamsMap.set(remotePeer.peerId, {
        peerId: remotePeer.peerId,
        name: known.name || 'متسابق',
        avatar: known.avatar || '👤',
        stream: incomingStream,
        micOn: known.micOn ?? true,
        camOn: false,
        callMode: 'audio',
      });
      this.emit();
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      if (state === 'failed' || state === 'closed') {
        if (this.meshPcs.get(remotePeer.peerId) === pc) {
          this.closeMeshPc(remotePeer.peerId);
          this.matchRemoteStreamsMap.delete(remotePeer.peerId);
          this.emit();
        }
      }
    };

    return pc;
  }

  private async drainPendingMeshIce(remotePeerId: string, pc: RTCPeerConnection) {
    const queue = this.meshPendingIce.get(remotePeerId);
    if (!queue || queue.length === 0) return;
    this.meshPendingIce.delete(remotePeerId);
    for (const cand of queue) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(cand));
      } catch {}
    }
  }

  private async initiateMeshOffer(remotePeer: RtcParticipant) {
    if (!this.matchMicRoomId || this.inCall) return;
    if (this.blockedPeersMap.has(remotePeer.peerId)) return;
    if (this.meshMakingOffer.get(remotePeer.peerId)) return;

    this.meshMakingOffer.set(remotePeer.peerId, true);
    try {
      // Ensure local mic stream is ready before creating offer
      if (!this.userDisabledMic && (!this.micStream || !this.micStream.getAudioTracks().some((t) => t.readyState === 'live'))) {
        await this.acquireMicrophone(true).catch(() => false);
      }
      const pc = this.createOrGetMeshPc(remotePeer);
      if (pc.signalingState !== 'stable') return;
      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: false });
      if (!this.matchMicRoomId || this.inCall) return;
      await pc.setLocalDescription(offer);
      await this.sendServerSignal(
        this.matchMicRoomId,
        remotePeer.peerId,
        'offer',
        { sdp: pc.localDescription, matchMic: true },
        'audio'
      );
    } catch {
      // Reconciler will retry cleanly
    } finally {
      this.meshMakingOffer.set(remotePeer.peerId, false);
    }
  }

  private startMatchMicReconciler() {
    if (this.matchMicReconcileTimer) {
      clearInterval(this.matchMicReconcileTimer);
    }
    this.matchMicReconcileTimer = setInterval(() => {
      if (!this.matchMicRoomId || this.inCall) return;

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
              if (ok) this.syncTracksToAllPeerJsConns();
            })
            .catch(() => {});
        } else {
          this.micStream!.getAudioTracks().forEach((t) => {
            if (!t.enabled) t.enabled = true;
          });
          this.syncTracksToAllPeerJsConns();
        }
      }

      // Clean up dead/stalled native WebRTC Mesh connections and reconnect automatically
      const now = Date.now();
      this.meshPcs.forEach((pc, pid) => {
        const iceState = pc.iceConnectionState;
        if (iceState === 'failed' || iceState === 'closed' || pc.connectionState === 'failed') {
          this.closeMeshPc(pid);
          this.matchRemoteStreamsMap.delete(pid);
          this.emit();
        }
      });

      this.connectMatchMicPeers(true, now);
    }, 2200);
  }

  public stopMatchMicSession() {
    if (this.matchMicReconcileTimer) {
      clearInterval(this.matchMicReconcileTimer);
      this.matchMicReconcileTimer = null;
    }
    this.lastDialAttemptMap.clear();
    this.closeAllMeshPcs();
    if (!this.matchMicRoomId) return;
    const prevRoom = this.matchMicRoomId;
    this.matchMicRoomId = '';
    this.watchedRoomId = '';
    if (!this.inCall) {
      this.activeRoomId = '';
    }
    this.participants = [];
    this.roomPeersMap.clear();
    this.matchRemoteStreamsMap.clear();

    this.mediaConns.forEach((mc) => {
      try {
        mc.close();
      } catch {}
    });
    this.mediaConns.clear();
    this.pendingMediaCalls.clear();
    this.disconnectSignaling();

    if (prevRoom) {
      fetch(`/api/rooms/${encodeURIComponent(prevRoom)}/rtc/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peerId: this.peerId }),
      }).catch(() => {});
    }

    this.dataConns.forEach((c) => {
      try {
        c.close();
      } catch {}
    });
    this.dataConns.clear();
    if (this.roomHostPeer) {
      try {
        this.roomHostPeer.destroy();
      } catch {}
      this.roomHostPeer = null;
    }
    this.hostGuestConns.clear();
    this.emit();
  }

  private connectMatchMicPeers(forceRetry = false, nowMs = Date.now()) {
    if (!this.matchMicRoomId || this.inCall) return;
    const seen = new Map<string, RtcParticipant>();
    this.roomPeersMap.forEach((p, id) => {
      if (id !== this.peerId && !this.blockedPeersMap.has(id)) seen.set(id, p);
    });
    this.participants.forEach((p) => {
      if (p.peerId !== this.peerId && !this.blockedPeersMap.has(p.peerId)) seen.set(p.peerId, p);
    });
    seen.forEach((p) => {
      this.connectMatchMicPeer(p, forceRetry, nowMs);
    });
  }

  private connectMatchMicPeer(remotePeer: RtcParticipant, forceRetry = false, nowMs = Date.now()) {
    if (!this.matchMicRoomId || this.inCall) return;
    if (!remotePeer.peerId || remotePeer.peerId === this.peerId || this.blockedPeersMap.has(remotePeer.peerId)) return;

    const existing = this.meshPcs.get(remotePeer.peerId);
    if (existing) {
      const iceState = existing.iceConnectionState;
      const hasStream = this.matchRemoteStreamsMap.has(remotePeer.peerId);
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
      // Stale unconnected PC -> reset and retry
      this.closeMeshPc(remotePeer.peerId);
    }

    const lastDial = this.lastDialAttemptMap.get(remotePeer.peerId) || 0;
    if (nowMs - lastDial < 2500) return;

    if (this.peerId < remotePeer.peerId) {
      this.lastDialAttemptMap.set(remotePeer.peerId, nowMs);
      void this.initiateMeshOffer(remotePeer);
    } else if (forceRetry) {
      // Fallback if initiator hasn't reached us after 4s
      const firstSeen = this.lastDialAttemptMap.get(`seen_${remotePeer.peerId}`) || nowMs;
      if (!this.lastDialAttemptMap.has(`seen_${remotePeer.peerId}`)) {
        this.lastDialAttemptMap.set(`seen_${remotePeer.peerId}`, nowMs);
        return;
      }
      if (nowMs - firstSeen >= 4000) {
        this.lastDialAttemptMap.set(remotePeer.peerId, nowMs);
        void this.initiateMeshOffer(remotePeer);
      }
    }
  }

  private syncDiscoveredParticipants(list: RtcParticipant[]) {
    this.participants = list.filter((p) => !this.blockedPeersMap.has(p.peerId));
    this.participants.forEach((p) => {
      if (p.peerId !== this.peerId) {
        this.roomPeersMap.set(p.peerId, p);
        if (this.matchMicRoomId && !this.inCall) {
          this.connectMatchMicPeer(p);
        } else if (this.peerReady) {
          this.connectDataPeer(p.peerId);
        }
      }
    });
  }

  private connectSignaling(roomId: string) {
    this.disconnectSignaling();
    this.lastSignalSeq = 0;

    try {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${proto}//${window.location.host}/ws?roomId=${encodeURIComponent(roomId)}&peerId=${encodeURIComponent(this.peerId)}`;
      const ws = new WebSocket(wsUrl);
      this.ws = ws;
      ws.onmessage = (evt) => {
        try {
          const parsed = JSON.parse(evt.data);
          this.handleServerEvent(parsed.event, parsed.data);
        } catch {}
      };
      ws.onerror = () => {};
    } catch {}

    try {
      const es = new EventSource(`/api/rooms/${encodeURIComponent(roomId)}/events`);
      this.sse = es;
      es.onmessage = (evt) => {
        try {
          const parsed = JSON.parse(evt.data);
          this.handleServerEvent(parsed.event, parsed.data);
        } catch {}
      };
    } catch {}

    // Keep room presence alive even before a voice/video call starts
    this.presenceTimer = setInterval(() => {
      const target = this.inCall ? this.activeRoomId : this.watchedRoomId;
      if (!target) return;
      fetch(`/api/rooms/${encodeURIComponent(target)}/rtc/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peerId: this.peerId,
          name: this.profileName,
          avatar: this.profileAvatar,
          micOn: this.micOn,
          camOn: this.camOn,
          callMode: this.callMode,
          inCall: this.inCall,
        }),
      }).catch(() => {});
    }, 5000);

    this.pollTimer = setInterval(() => {
      const targetRoom = this.inCall ? this.activeRoomId : this.watchedRoomId;
      if (!targetRoom) return;
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ event: 'rtc:ping', roomId: targetRoom }));
        } catch {}
      }
      fetch(
        `/api/rooms/${encodeURIComponent(targetRoom)}/rtc/state?peerId=${encodeURIComponent(this.peerId)}&since=${this.lastSignalSeq}&ping=1`
      )
        .then((r) => r.json())
        .then((d) => {
          if (!d || !d.success) return;
          if (Array.isArray(d.participants)) {
            this.syncDiscoveredParticipants(d.participants as RtcParticipant[]);
          }
          if (Array.isArray(d.signals)) {
            d.signals.forEach((sig: { id: string; seq: number }) => {
              if (sig.seq > this.lastSignalSeq) this.lastSignalSeq = sig.seq;
              this.handleIncomingSignal(sig as never);
            });
          }
          this.emit();
        })
        .catch(() => {});
    }, 1500);
  }

  private disconnectSignaling() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
    if (this.sse) {
      try {
        this.sse.close();
      } catch {}
      this.sse = null;
    }
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.presenceTimer) {
      clearInterval(this.presenceTimer);
      this.presenceTimer = null;
    }
  }

  private handleServerEvent(eventName: string, data: unknown) {
    if (!data || typeof data !== 'object') return;
    const d = data as Record<string, unknown>;
    if (
      eventName === 'rtc:welcome' ||
      eventName === 'rtc:peer_joined' ||
      eventName === 'rtc:peer_left' ||
      eventName === 'rtc:media_state'
    ) {
      if (Array.isArray(d.participants)) {
        this.syncDiscoveredParticipants(d.participants as RtcParticipant[]);
      }
      if (eventName === 'rtc:peer_left' && typeof d.peerId === 'string') {
        this.roomPeersMap.delete(d.peerId);
        this.removeRemotePeer(d.peerId);
      }
      if (eventName === 'rtc:media_state' && d.participant && typeof d.participant === 'object') {
        const p = d.participant as RtcParticipant;
        const remote = this.remoteStreamsMap.get(p.peerId);
        if (remote) {
          remote.micOn = p.micOn;
          remote.camOn = p.camOn;
          remote.callMode = p.callMode;
        }
      }
      this.emit();
    } else if (eventName === 'rtc:signal') {
      this.handleIncomingSignal(d as never);
    }
  }

  // =========================================================================
  // PeerJS Voice & Video Call Management (Audio / Video Calls)
  // =========================================================================
  public async startCall(roomId: string, mode: CallMode): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      this.callStatusText = 'مطلوب اتصال بالإنترنت لبدء مكالمة صوت أو فيديو';
      this.emit();
      return false;
    }
    const cleanRoom = (roomId || '').trim();
    if (!cleanRoom) return false;
    this.activeRoomId = cleanRoom;
    this.watchedRoomId = cleanRoom;
    this.callMode = mode;
    this.inCall = true;
    this.incomingCall = null;
    this.stopRingTone();
    this.callStatusText =
      mode === 'video'
        ? 'جاري تشغيل مكالمة الفيديو عبر PeerJS...'
        : 'جاري بدء الاتصال الصوتي عبر PeerJS...';
    this.emit();

    this.ensurePeerJsInitialized(cleanRoom);
    await this.acquireMicrophone(!this.userDisabledMic);

    if (mode === 'video') {
      await this.acquireCamera(this.facingMode);
    } else {
      this.stopCamera();
    }

    this.connectSignaling(cleanRoom);
    this.startCallTimer();
    await this.registerRoomPresence(cleanRoom, true);

    // Answer any pending incoming PeerJS MediaConnection first
    this.pendingMediaCalls.forEach((mc, pid) => {
      if (!this.blockedPeersMap.has(pid)) {
        this.answerMediaConnection(mc);
      } else {
        try {
          mc.close();
        } catch {}
      }
    });
    this.pendingMediaCalls.clear();

    // Call all non-blocked participants already inside the call via PeerJS
    const snap = this.getSnapshot();
    const activeOthers = snap.participants.filter(
      (p) => p.peerId !== this.peerId && p.inCall && !this.blockedPeersMap.has(p.peerId)
    );
    activeOthers.forEach((other) => {
      if (!this.mediaConns.has(other.peerId)) {
        this.callPeerViaPeerJS(other);
      }
    });

    // Notify room via PeerJS DataConnections & server ring signal
    this.broadcastDataToPeers({
      type: 'ring',
      roomId: cleanRoom,
      fromId: this.peerId,
      fromName: this.profileName,
      fromAvatar: this.profileAvatar,
      callMode: mode,
    });
    await this.sendServerSignal(
      cleanRoom,
      undefined,
      'ring',
      { name: this.profileName, avatar: this.profileAvatar },
      mode
    );

    this.callStatusText = mode === 'video' ? 'مكالمة فيديو نشطة (PeerJS)' : 'اتصال صوتي نشط (PeerJS)';
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

    const pendingMc = this.pendingMediaCalls.get(fromId);
    if (pendingMc) {
      try {
        pendingMc.close();
      } catch {}
      this.pendingMediaCalls.delete(fromId);
    }

    const dc = this.dataConns.get(fromId);
    if (dc && dc.open) {
      try {
        dc.send({ type: 'reject', roomId, fromId: this.peerId, fromName: this.profileName });
      } catch {}
    }
    this.sendServerSignal(roomId, fromId, 'reject', {});
    this.emit();
  }

  private callPeerViaPeerJS(remotePeer: RtcParticipant, isMatchMic = false) {
    if (!this.peer || this.peer.destroyed || !this.peerReady) return;
    const stream = isMatchMic ? this.getOrCreateCallStream() : (this.combinedStream || this.getOrCreateCallStream());
    if (!stream || this.blockedPeersMap.has(remotePeer.peerId)) return;

    const existing = this.mediaConns.get(remotePeer.peerId);
    if (existing) {
      try {
        existing.close();
      } catch {}
      this.mediaConns.delete(remotePeer.peerId);
    }

    try {
      const mediaConn = this.peer.call(remotePeer.peerId, stream, {
        metadata: {
          roomId: this.matchMicRoomId || this.activeRoomId || this.watchedRoomId,
          matchMic: isMatchMic || Boolean(this.matchMicRoomId && !this.inCall),
          name: this.profileName,
          avatar: this.profileAvatar,
          callMode: isMatchMic ? 'audio' : this.callMode,
          micOn: this.micOn,
          camOn: isMatchMic ? false : this.camOn,
        },
      });
      if (!mediaConn) return;
      this.bindMediaConnection(mediaConn, remotePeer, isMatchMic || Boolean(this.matchMicRoomId && !this.inCall));
    } catch {}
  }

  private handleIncomingPeerMediaCall(mediaConn: MediaConnection) {
    const remoteId = mediaConn.peer;
    if (this.blockedPeersMap.has(remoteId)) {
      try {
        mediaConn.close();
      } catch {}
      return;
    }

    const meta = (mediaConn.metadata || {}) as Record<string, unknown>;
    const callerInfo: RtcParticipant = {
      peerId: remoteId,
      name: String(meta.name || 'متصل'),
      avatar: String(meta.avatar || '👤'),
      callMode: meta.callMode === 'video' ? 'video' : 'audio',
      micOn: typeof meta.micOn === 'boolean' ? meta.micOn : true,
      camOn: typeof meta.camOn === 'boolean' ? meta.camOn : false,
      inCall: !meta.matchMic,
    };

    // Match Voice Chat (Audio-Only inside active 1v1 Duel without triggering call modal or pausing questions)
    if (meta.matchMic === true && this.matchMicRoomId && String(meta.roomId || '') === this.matchMicRoomId && !this.inCall) {
      this.answerMediaConnection(mediaConn, callerInfo, true);
      return;
    }

    if (this.inCall) {
      this.answerMediaConnection(mediaConn, callerInfo, false);
    } else {
      this.pendingMediaCalls.set(remoteId, mediaConn);
      if (!this.incomingCall && (this.watchedRoomId || meta.roomId)) {
        this.incomingCall = {
          roomId: String(meta.roomId || this.watchedRoomId),
          fromId: remoteId,
          fromName: callerInfo.name,
          fromAvatar: callerInfo.avatar,
          callMode: callerInfo.callMode,
          timestamp: Date.now(),
        };
        this.startRingTone();
        this.emit();
      }
    }
  }

  private answerMediaConnection(mediaConn: MediaConnection, callerInfo?: RtcParticipant, isMatchMic = false) {
    try {
      const stream = isMatchMic ? this.getOrCreateCallStream() : (this.combinedStream || this.getOrCreateCallStream());
      mediaConn.answer(stream || undefined);
      this.bindMediaConnection(mediaConn, callerInfo, isMatchMic);
    } catch {}
  }

  private bindMediaConnection(mediaConn: MediaConnection, info?: RtcParticipant, isMatchMic = false) {
    const remotePeerId = mediaConn.peer;
    const prev = this.mediaConns.get(remotePeerId);
    if (prev && prev !== mediaConn) {
      try {
        prev.close();
      } catch {}
    }
    this.mediaConns.set(remotePeerId, mediaConn);

    mediaConn.on('stream', (stream) => {
      if (this.blockedPeersMap.has(remotePeerId)) {
        try {
          mediaConn.close();
        } catch {}
        return;
      }
      const pInfo =
        this.participants.find((p) => p.peerId === remotePeerId) ||
        this.roomPeersMap.get(remotePeerId) ||
        info;
      const entry: RemotePeerStream = {
        peerId: remotePeerId,
        name: pInfo?.name || 'متصل',
        avatar: pInfo?.avatar || '👤',
        stream,
        micOn: pInfo?.micOn ?? true,
        camOn: isMatchMic ? false : (pInfo?.camOn ?? stream.getVideoTracks().length > 0),
        callMode: isMatchMic ? 'audio' : (pInfo?.callMode ?? (stream.getVideoTracks().length > 0 ? 'video' : 'audio')),
      };

      if (isMatchMic || (this.matchMicRoomId && !this.inCall)) {
        this.matchRemoteStreamsMap.set(remotePeerId, entry);
      } else {
        this.remoteStreamsMap.set(remotePeerId, entry);
      }
      this.emit();
    });

    mediaConn.on('close', () => {
      if (this.mediaConns.get(remotePeerId) === mediaConn) {
        this.mediaConns.delete(remotePeerId);
        this.remoteStreamsMap.delete(remotePeerId);
        this.matchRemoteStreamsMap.delete(remotePeerId);
        this.emit();
      }
    });

    mediaConn.on('error', () => {
      if (this.mediaConns.get(remotePeerId) === mediaConn) {
        this.mediaConns.delete(remotePeerId);
      }
    });

    try {
      const pc = mediaConn.peerConnection;
      if (pc) {
        this.tuneAudioSender(pc);
        pc.addEventListener('iceconnectionstatechange', () => {
          const st = pc.iceConnectionState;
          if (st === 'connected' || st === 'completed') {
            this.tuneAudioSender(pc);
          }
          if ((st === 'failed' || st === 'closed') && this.mediaConns.get(remotePeerId) === mediaConn) {
            this.mediaConns.delete(remotePeerId);
            this.matchRemoteStreamsMap.delete(remotePeerId);
            this.remoteStreamsMap.delete(remotePeerId);
            this.emit();
          }
        });
      }
    } catch {}
  }

  private async acquireCamera(facing: 'user' | 'environment'): Promise<boolean> {
    try {
      this.stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      this.camStream = stream;
      this.camOn = true;
      this.facingMode = facing;
      this.rebuildCombinedStream();
      this.syncTracksToAllPeerJsConns();
      this.emit();
      return true;
    } catch {
      this.camOn = false;
      this.callStatusText = 'تعذر تشغيل الكاميرا — مستمر بالصوت';
      this.emit();
      return false;
    }
  }

  private stopCamera() {
    if (this.camStream) {
      this.camStream.getTracks().forEach((t) => t.stop());
      this.camStream = null;
    }
    this.camOn = false;
    this.rebuildCombinedStream();
  }

  public async toggleCamera(): Promise<void> {
    if (!this.inCall) return;
    if (this.camOn) {
      this.stopCamera();
      this.callMode = 'audio';
    } else {
      const ok = await this.acquireCamera(this.facingMode);
      if (ok) {
        this.callMode = 'video';
        // Renegotiate via fresh PeerJS call so remote side renders video track immediately
        const snap = this.getSnapshot();
        for (const [remotePeerId] of this.mediaConns.entries()) {
          const p = snap.participants.find((x) => x.peerId === remotePeerId);
          this.callPeerViaPeerJS(
            p || {
              peerId: remotePeerId,
              name: 'متصل',
              avatar: '👤',
              callMode: 'video',
              micOn: true,
              camOn: false,
              inCall: true,
            }
          );
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
    if (!this.activeRoomId) return;
    const participantPayload: RtcParticipant = {
      peerId: this.peerId,
      name: this.profileName,
      avatar: this.profileAvatar,
      micOn: this.micOn,
      camOn: this.camOn,
      callMode: this.callMode,
      inCall: this.inCall,
    };

    this.broadcastDataToPeers({
      type: 'media_state',
      roomId: this.activeRoomId,
      participant: participantPayload,
    });

    try {
      await fetch(`/api/rooms/${encodeURIComponent(this.activeRoomId)}/rtc/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(participantPayload),
      });
    } catch {}
  }

  public async hangup() {
    const roomToLeave = this.activeRoomId;
    this.inCall = false;
    this.callStatusText = null;
    this.stopCallTimer();
    this.stopCamera();

    this.mediaConns.forEach((mc) => {
      try {
        mc.close();
      } catch {}
    });
    this.mediaConns.clear();
    this.pendingMediaCalls.forEach((mc) => {
      try {
        mc.close();
      } catch {}
    });
    this.pendingMediaCalls.clear();
    this.remoteStreamsMap.clear();

    if (roomToLeave) {
      this.broadcastDataToPeers({ type: 'hangup', roomId: roomToLeave, fromId: this.peerId });
      this.sendServerSignal(roomToLeave, undefined, 'hangup', {}, this.callMode).catch(() => {});
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
    this.closeMeshPc(remotePeerId);
    const mc = this.mediaConns.get(remotePeerId);
    if (mc) {
      try {
        mc.close();
      } catch {}
      this.mediaConns.delete(remotePeerId);
    }
    this.remoteStreamsMap.delete(remotePeerId);
    this.matchRemoteStreamsMap.delete(remotePeerId);
    this.emit();
  }

  private async handleIncomingSignal(sig: {
    id: string;
    seq?: number;
    fromId: string;
    fromName: string;
    fromAvatar: string;
    toId?: string;
    type: string;
    callMode?: CallMode;
    payload?: unknown;
  }) {
    if (!sig || !sig.fromId || sig.fromId === this.peerId) return;
    if (this.blockedPeersMap.has(sig.fromId)) return;
    if (sig.toId && sig.toId !== this.peerId) return;
    if (sig.id && this.processedSignalIds.has(sig.id)) return;
    if (sig.id) this.processedSignalIds.add(sig.id);
    if (this.processedSignalIds.size > 300) {
      const first = this.processedSignalIds.values().next().value;
      if (first) this.processedSignalIds.delete(first);
    }

    // Native WebRTC Mesh SDP Offer / Answer / ICE for 1v1 & 4-Player Match Voice
    if (sig.type === 'offer') {
      if (!this.matchMicRoomId || this.inCall) return;
      const p = (sig.payload || {}) as { sdp?: RTCSessionDescriptionInit };
      if (!p.sdp) return;

      const remoteInfo: RtcParticipant = this.roomPeersMap.get(sig.fromId) || {
        peerId: sig.fromId,
        name: sig.fromName || 'متسابق',
        avatar: sig.fromAvatar || '👤',
        callMode: 'audio',
        micOn: true,
        camOn: false,
        inCall: false,
      };
      this.roomPeersMap.set(sig.fromId, remoteInfo);

      const existing = this.meshPcs.get(sig.fromId);
      const isPolite = this.peerId > sig.fromId;
      const offerCollision =
        Boolean(this.meshMakingOffer.get(sig.fromId)) ||
        (existing !== undefined && existing.signalingState !== 'stable');
      if (offerCollision && !isPolite) {
        return;
      }
      if (offerCollision && isPolite && existing) {
        this.closeMeshPc(sig.fromId);
      }

      try {
        // Ensure local audio track is acquired and attached BEFORE answering!
        if (!this.userDisabledMic && (!this.micStream || !this.micStream.getAudioTracks().some((t) => t.readyState === 'live'))) {
          await this.acquireMicrophone(true).catch(() => false);
        }
        const pc = this.createOrGetMeshPc(remoteInfo);
        await pc.setRemoteDescription(new RTCSessionDescription(p.sdp));
        await this.drainPendingMeshIce(sig.fromId, pc);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await this.sendServerSignal(
          this.matchMicRoomId,
          sig.fromId,
          'answer',
          { sdp: pc.localDescription, matchMic: true },
          'audio'
        );
      } catch {
        this.closeMeshPc(sig.fromId);
      }
      return;
    }

    if (sig.type === 'answer') {
      if (!this.matchMicRoomId || this.inCall) return;
      const p = (sig.payload || {}) as { sdp?: RTCSessionDescriptionInit };
      if (!p.sdp) return;
      const pc = this.meshPcs.get(sig.fromId);
      if (!pc || pc.signalingState !== 'have-local-offer') return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(p.sdp));
        await this.drainPendingMeshIce(sig.fromId, pc);
      } catch {
        this.closeMeshPc(sig.fromId);
      }
      return;
    }

    if (sig.type === 'ice') {
      if (!this.matchMicRoomId || this.inCall) return;
      const p = (sig.payload || {}) as { candidate?: RTCIceCandidateInit };
      if (!p.candidate) return;
      const pc = this.meshPcs.get(sig.fromId);
      if (pc && pc.remoteDescription) {
        pc.addIceCandidate(new RTCIceCandidate(p.candidate)).catch(() => {});
      } else {
        const q = this.meshPendingIce.get(sig.fromId) || [];
        if (q.length < 40) {
          q.push(p.candidate);
          this.meshPendingIce.set(sig.fromId, q);
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

  private async sendServerSignal(
    roomId: string,
    toId: string | undefined,
    type: 'offer' | 'answer' | 'ice' | 'ring' | 'accept' | 'reject' | 'hangup' | 'media_state',
    payload: unknown,
    callMode?: CallMode
  ) {
    const room = roomId || this.activeRoomId || this.watchedRoomId;
    if (!room) return;
    const data = {
      fromId: this.peerId,
      fromName: this.profileName,
      fromAvatar: this.profileAvatar,
      toId,
      type,
      callMode: callMode || this.callMode,
      payload,
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ event: 'rtc:signal', roomId: room, data }));
        return;
      } catch {}
    }

    await fetch(`/api/rooms/${encodeURIComponent(room)}/rtc/signal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {});
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
