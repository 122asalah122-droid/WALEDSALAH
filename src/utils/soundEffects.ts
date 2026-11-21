/**
 * Full Web Audio API Sound Synthesizer for Who Wants to Be a Millionaire
 * Zero external audio files required — 100% reliable, offline-ready, AppCreator24 & mobile compatible!
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;
  private voiceEnabled: boolean = true;
  private tensionOsc1: OscillatorNode | null = null;
  private tensionOsc2: OscillatorNode | null = null;
  private tensionGain: GainNode | null = null;
  private tensionFilter: BiquadFilterNode | null = null;
  private isTensionPlaying: boolean = false;
  private tensionRhythmTimer: number | null = null;
  private tensionStep: number = 0;

  constructor() {
    // Load persisted settings
    try {
      const savedMute = localStorage.getItem('millionaire_muted');
      if (savedMute !== null) this.isMuted = savedMute === 'true';
      const savedVol = localStorage.getItem('millionaire_volume');
      if (savedVol !== null) this.volume = parseFloat(savedVol);
      const savedVoice = localStorage.getItem('millionaire_voice');
      if (savedVoice !== null) this.voiceEnabled = savedVoice === 'true';
    } catch {
      // Ignore storage access errors in sandboxed iframes
    }
  }

  private initCtx() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // AudioContext unavailable or restricted in sandboxed webview
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('millionaire_muted', String(muted));
    } catch {}
    if (muted && this.isTensionPlaying) {
      this.stopTensionAmbience();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('millionaire_volume', String(this.volume));
    } catch {}
    if (this.tensionGain && this.ctx) {
      this.tensionGain.gain.setValueAtTime(this.volume * 0.16, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
    try {
      localStorage.setItem('millionaire_voice', String(enabled));
    } catch {}
    if (!enabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public getVoiceEnabled(): boolean {
    return this.voiceEnabled;
  }

  // Mobile haptic vibration helper
  public vibrate(pattern: number | number[] = 50) {
    if ('navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  }

  // 1. Heartbeat tension pulse (Classic Millionaire "ba-bum")
  public playHeartbeat(intensity: number = 1) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.7, t);
    masterGain.connect(this.ctx.destination);

    // Pulse 1 ("ba-")
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    const baseFreq = 50 + intensity * 8;
    osc1.frequency.setValueAtTime(baseFreq, t);
    osc1.frequency.exponentialRampToValueAtTime(32, t + 0.14);
    gain1.gain.setValueAtTime(0.8, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start(t);
    osc1.stop(t + 0.15);

    // Pulse 2 ("-bum") slightly higher and louder
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq + 12, t + 0.13);
    osc2.frequency.exponentialRampToValueAtTime(30, t + 0.32);
    gain2.gain.setValueAtTime(1.0, t + 0.13);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(t + 0.13);
    osc2.stop(t + 0.36);

    this.vibrate([30, 40, 45]);
  }

  // 2. Continuous Suspense Drone & Energetic Rhythmic Question Soundtrack (موسيقى حماسية أثناء الأسئلة)
  public startTensionAmbience(rawLevel: number = 1) {
    if (this.isMuted) return;
    this.stopTensionAmbience();
    this.initCtx();
    if (!this.ctx) return;
    const tier = Math.max(1, Math.min(15, Math.ceil((Math.min(100, Math.max(1, rawLevel)) / 100) * 15)));

    try {
      const t = this.ctx.currentTime;
      this.tensionGain = this.ctx.createGain();
      this.tensionGain.gain.setValueAtTime(0.001, t);
      this.tensionGain.gain.linearRampToValueAtTime(this.volume * 0.18, t + 0.8);

      this.tensionFilter = this.ctx.createBiquadFilter();
      this.tensionFilter.type = 'lowpass';
      // As tier goes higher (1-15), cut-off frequency rises to build anxiety
      const cutoff = 240 + tier * 35;
      this.tensionFilter.frequency.setValueAtTime(cutoff, t);

      // Low foundation drone (D2 = 73.42Hz)
      this.tensionOsc1 = this.ctx.createOscillator();
      this.tensionOsc1.type = 'sawtooth';
      this.tensionOsc1.frequency.setValueAtTime(73.42, t);

      // Fifth (A2 = 110.2Hz with subtle sinister detune)
      this.tensionOsc2 = this.ctx.createOscillator();
      this.tensionOsc2.type = 'triangle';
      this.tensionOsc2.frequency.setValueAtTime(110.2, t);

      this.tensionOsc1.connect(this.tensionFilter);
      this.tensionOsc2.connect(this.tensionFilter);
      this.tensionFilter.connect(this.tensionGain);
      this.tensionGain.connect(this.ctx.destination);

      this.tensionOsc1.start(t);
      this.tensionOsc2.start(t);
      this.isTensionPlaying = true;
      this.tensionStep = 0;

      // Energetic rhythmic beat engine (heartbeat + bass ostinato pulse every 800ms / 650ms)
      const tempoMs = tier > 10 ? 650 : tier > 5 ? 750 : 850;
      
      const bassNotes = [
        73.42, // D2
        87.31, // F2
        98.00, // G2
        110.0, // A2
        116.5, // Bb2
        110.0, // A2
        98.00, // G2
        87.31, // F2
      ];

      this.tensionRhythmTimer = window.setInterval(() => {
        if (!this.isTensionPlaying || this.isMuted || !this.ctx) return;

        const now = this.ctx.currentTime;
        const currentNote = bassNotes[this.tensionStep % bassNotes.length];
        this.tensionStep++;

        // 1. Bass Ostinato Pulse
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(currentNote, now);

        const bassFilt = this.ctx.createBiquadFilter();
        bassFilt.type = 'lowpass';
        bassFilt.frequency.setValueAtTime(180 + tier * 20, now);
        bassFilt.frequency.exponentialRampToValueAtTime(70, now + 0.35);

        bassGain.gain.setValueAtTime(0.001, now);
        bassGain.gain.linearRampToValueAtTime(this.volume * (0.16 + (tier / 15) * 0.12), now + 0.04);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        bassOsc.connect(bassFilt);
        bassFilt.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + 0.42);

        // 2. Sub Heartbeat Kick on every even beat
        if (this.tensionStep % 2 === 0) {
          const kickOsc = this.ctx.createOscillator();
          const kickGain = this.ctx.createGain();
          kickOsc.type = 'sine';
          kickOsc.frequency.setValueAtTime(62, now);
          kickOsc.frequency.exponentialRampToValueAtTime(28, now + 0.16);

          kickGain.gain.setValueAtTime(this.volume * (0.28 + (tier / 15) * 0.15), now);
          kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

          kickOsc.connect(kickGain);
          kickGain.connect(this.ctx.destination);
          kickOsc.start(now);
          kickOsc.stop(now + 0.22);
        }

        // 3. Higher Tier Urgency Shimmer (Tiers 6+)
        if (tier >= 6 && this.tensionStep % 4 === 1) {
          const shimOsc = this.ctx.createOscillator();
          const shimGain = this.ctx.createGain();
          shimOsc.type = 'triangle';
          shimOsc.frequency.setValueAtTime(currentNote * 2, now + 0.1);
          shimGain.gain.setValueAtTime(0.001, now + 0.1);
          shimGain.gain.linearRampToValueAtTime(this.volume * 0.1, now + 0.14);
          shimGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

          shimOsc.connect(shimGain);
          shimGain.connect(this.ctx.destination);
          shimOsc.start(now + 0.1);
          shimOsc.stop(now + 0.32);
        }
      }, tempoMs);

    } catch {
      // Audio autoplay safeguard
    }
  }

  public stopTensionAmbience() {
    if (this.tensionRhythmTimer !== null) {
      clearInterval(this.tensionRhythmTimer);
      this.tensionRhythmTimer = null;
    }

    if (!this.isTensionPlaying || !this.ctx || !this.tensionGain) {
      this.isTensionPlaying = false;
      return;
    }

    try {
      const t = this.ctx.currentTime;
      this.tensionGain.gain.linearRampToValueAtTime(0.0001, t + 0.3);
      setTimeout(() => {
        if (this.tensionOsc1) {
          try { this.tensionOsc1.stop(); this.tensionOsc1.disconnect(); } catch {}
          this.tensionOsc1 = null;
        }
        if (this.tensionOsc2) {
          try { this.tensionOsc2.stop(); this.tensionOsc2.disconnect(); } catch {}
          this.tensionOsc2 = null;
        }
        this.isTensionPlaying = false;
      }, 350);
    } catch {
      this.isTensionPlaying = false;
    }
  }

  // 3. Crisp countdown clock tick
  public playClockTick(urgent: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const freq = urgent ? 1350 : 880;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.04);

    gain.gain.setValueAtTime(this.volume * (urgent ? 0.4 : 0.25), t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);

    if (urgent) this.vibrate(20);
  }

  // 4. Question Intro / Stinger
  public playQuestionIntro() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const chords = [146.83, 220.00, 293.66, 369.99]; // D minor to F# mystery

    chords.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, t);
      filter.frequency.exponentialRampToValueAtTime(1400, t + 0.4);

      gain.gain.setValueAtTime(0.001, t + idx * 0.06);
      gain.gain.linearRampToValueAtTime(this.volume * 0.25, t + idx * 0.06 + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.06);
      osc.stop(t + 1.0);
    });

    this.vibrate(40);
  }

  // 5. Select / Lock-In Option Sound
  public playSelectAnswer() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // High snap click
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(540, t);
    osc1.frequency.exponentialRampToValueAtTime(180, t + 0.08);
    gain1.gain.setValueAtTime(this.volume * 0.6, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.09);

    // Deep sub lock tone
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(110, t);
    gain2.gain.setValueAtTime(this.volume * 0.5, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(t);
    osc2.stop(t + 0.26);

    this.vibrate(60);
  }

  // 6. Correct Answer Chime
  public playCorrect() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Ascending bright major chord (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);

      gain.gain.setValueAtTime(0.001, t + idx * 0.07);
      gain.gain.linearRampToValueAtTime(this.volume * 0.4, t + idx * 0.07 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 0.65);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.07);
      osc.stop(t + idx * 0.07 + 0.7);
    });

    this.vibrate([40, 30, 70]);
  }

  // 7. Milestone Pass Fanfare (Safe Rungs: $1,000 & $32,000)
  public playMilestoneWin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Celebratory brass arpeggio
    const sequence = [
      { note: 392.00, start: 0.0, dur: 0.15 }, // G4
      { note: 523.25, start: 0.15, dur: 0.15 }, // C5
      { note: 659.25, start: 0.30, dur: 0.15 }, // E5
      { note: 783.99, start: 0.45, dur: 0.45 }, // G5 (sustained)
      { note: 1046.50, start: 0.70, dur: 0.75 }, // C6 (climax)
    ];

    sequence.forEach(({ note, start, dur }) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note, t + start);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, t + start);

      gain.gain.setValueAtTime(0.001, t + start);
      gain.gain.linearRampToValueAtTime(this.volume * 0.35, t + start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + start + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + start);
      osc.stop(t + start + dur + 0.05);
    });

    this.vibrate([70, 40, 100, 50, 180]);
  }

  // 8. Epic 1,000,000 Jackpot Fanfare!
  public playJackpotWin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Sub bass boom
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(90, t);
    subOsc.frequency.exponentialRampToValueAtTime(30, t + 1.2);
    subGain.gain.setValueAtTime(this.volume * 0.8, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 1.3);

    // Triumphant orchestral fanfare
    const fanfareNotes = [
      { f: 523.25, s: 0.0, d: 0.2 },
      { f: 659.25, s: 0.2, d: 0.2 },
      { f: 783.99, s: 0.4, d: 0.2 },
      { f: 1046.50, s: 0.6, d: 0.5 },
      { f: 880.00, s: 1.0, d: 0.25 },
      { f: 987.77, s: 1.25, d: 0.25 },
      { f: 1046.50, s: 1.5, d: 1.2 },
      { f: 1318.51, s: 1.6, d: 1.1 },
      { f: 1567.98, s: 1.7, d: 1.0 },
    ];

    fanfareNotes.forEach(({ f, s, d }) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t + s);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, t + s);

      gain.gain.setValueAtTime(0.001, t + s);
      gain.gain.linearRampToValueAtTime(this.volume * 0.35, t + s + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + s + d);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + s);
      osc.stop(t + s + d + 0.05);
    });

    this.vibrate([100, 50, 150, 50, 200, 50, 400]);
  }

  // 9. Wrong Answer Buzzer / Dramatic Fall
  public playWrong() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Dissonant low chord (sawtooth 125Hz + 118Hz)
    [125, 118, 88].forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.8);

      gain.gain.setValueAtTime(this.volume * 0.45, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.85);
    });

    this.vibrate([150, 80, 250]);
  }

  // 10. 50:50 Lifeline Laser Swoosh
  public playFiftyFifty() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.35);

    gain.gain.setValueAtTime(this.volume * 0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.36);

    this.vibrate([40, 30, 40]);
  }

  // 11. Audience Poll Murmur & Resolution
  public playAudienceVote() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Rising cluster tones simulating chatter turning into consensus
    [320, 390, 440, 520, 660].forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + Math.random() * 20, t + i * 0.1);

      gain.gain.setValueAtTime(0.001, t + i * 0.1);
      gain.gain.linearRampToValueAtTime(this.volume * 0.25, t + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.55);
    });

    this.vibrate(50);
  }

  // 12. Phone a Friend Ring & Beep
  public playPhoneFriend() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Classic dual tone phone ring (440Hz + 480Hz)
    const playRingBurst = (offset: number) => {
      if (!this.ctx) return;
      [440, 480].forEach((f) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t + offset);
        gain.gain.setValueAtTime(this.volume * 0.2, t + offset);
        gain.gain.setValueAtTime(this.volume * 0.2, t + offset + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + offset);
        osc.stop(t + offset + 0.29);
      });
    };

    playRingBurst(0.0);
    playRingBurst(0.4);

    this.vibrate([60, 100, 60]);
  }

  // 13. Switch Question Shuffle Swoosh
  public playSwitchQuestion() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.3);

    gain.gain.setValueAtTime(this.volume * 0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.33);

    this.vibrate(40);
  }

  // 14. Chat Message Notification Pop
  public playChatMessage() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, t); // E5
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.08); // A5

    gain.gain.setValueAtTime(this.volume * 0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);

    this.vibrate(25);
  }

  // 15. Multiplayer Buzzer Click
  public playBuzzer() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, t);
    gain.gain.setValueAtTime(this.volume * 0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.13);

    this.vibrate(40);
  }

  // 16. Host Voice Announcer (Web Speech API)
  public speakHost(text: string, lang: 'ar' | 'en') {
    if (!this.voiceEnabled || this.isMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 0.95; // slightly deeper TV host pitch
      utterance.volume = this.volume;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis unsupported or blocked
    }
  }

  public stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  // Active intro theme tracking
  private introOscillators: OscillatorNode[] = [];
  private introTimeouts: number[] = [];
  private isIntroPlaying: boolean = false;

  // 17. Powerful Grand Opening Theme Music (زي شارة من سيربح المليون الأصلية)
  public playGrandIntroTheme() {
    if (this.isMuted) return;
    this.stopIntroTheme();
    this.initCtx();
    if (!this.ctx) return;

    this.isIntroPlaying = true;
    const t = this.ctx.currentTime;

    // Sub Bass Boom / Gong Drop at t=0
    const boomOsc = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(65, t);
    boomOsc.frequency.exponentialRampToValueAtTime(24, t + 2.5);
    boomGain.gain.setValueAtTime(this.volume * 0.9, t);
    boomGain.gain.exponentialRampToValueAtTime(0.001, t + 2.8);
    boomOsc.connect(boomGain);
    boomGain.connect(this.ctx.destination);
    boomOsc.start(t);
    boomOsc.stop(t + 3.0);
    this.introOscillators.push(boomOsc);

    // Heartbeats in the background at regular intervals
    [0.1, 1.2, 2.3, 3.4, 4.5, 5.6, 6.7].forEach((delay) => {
      const tm = window.setTimeout(() => {
        if (this.isIntroPlaying) {
          this.playHeartbeat(1.3);
        }
      }, delay * 1000);
      this.introTimeouts.push(tm);
    });

    // Dramatic Theme Chord Progressions (D minor -> Bb -> G minor -> A7 Sus -> A Maj Climax)
    const chordProgressions = [
      // Chord 1: D Minor (Mystery stinger)
      { start: 0.1, duration: 1.4, freqs: [146.83, 220.00, 293.66, 349.23], type: 'sawtooth' as OscillatorType, vol: 0.35 },
      // Chord 2: Bb Major (Tension build)
      { start: 1.6, duration: 1.3, freqs: [116.54, 233.08, 293.66, 349.23, 466.16], type: 'sawtooth' as OscillatorType, vol: 0.38 },
      // Chord 3: G Minor (Dramatic questioning)
      { start: 3.0, duration: 1.3, freqs: [98.00, 196.00, 293.66, 392.00, 466.16], type: 'sawtooth' as OscillatorType, vol: 0.40 },
      // Chord 4: A Sus4 -> A Major (Climax tension)
      { start: 4.4, duration: 1.2, freqs: [110.00, 220.00, 293.66, 329.63, 440.00], type: 'sawtooth' as OscillatorType, vol: 0.42 },
      // Chord 5: Epic Grand Climax (A major + shimmer)
      { start: 5.7, duration: 2.8, freqs: [110.00, 220.00, 277.18, 329.63, 440.00, 554.37], type: 'sawtooth' as OscillatorType, vol: 0.48 },
    ];

    chordProgressions.forEach((chord) => {
      const chordStart = t + chord.start;
      chord.freqs.forEach((freq) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = chord.type;
        osc.frequency.setValueAtTime(freq, chordStart);

        // Lowpass filter sweep to give that lush cinematic TV synth sound
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, chordStart);
        filter.frequency.exponentialRampToValueAtTime(2200, chordStart + 0.4);
        filter.frequency.exponentialRampToValueAtTime(700, chordStart + chord.duration);

        gain.gain.setValueAtTime(0.001, chordStart);
        gain.gain.linearRampToValueAtTime(this.volume * chord.vol, chordStart + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, chordStart + chord.duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(chordStart);
        osc.stop(chordStart + chord.duration + 0.1);
        this.introOscillators.push(osc);
      });
    });

    // Rising arpeggios that mimic the Who Wants to Be a Millionaire question tier ladder
    const arpeggioNotes = [
      { f: 293.66, d: 0.8 },
      { f: 349.23, d: 1.1 },
      { f: 440.00, d: 1.4 },
      { f: 523.25, d: 2.0 },
      { f: 587.33, d: 2.4 },
      { f: 698.46, d: 2.8 },
      { f: 880.00, d: 3.8 },
      { f: 1046.50, d: 4.8 },
      { f: 1174.66, d: 5.4 },
    ];

    arpeggioNotes.forEach(({ f, d }) => {
      if (!this.ctx) return;
      const arpOsc = this.ctx.createOscillator();
      const arpGain = this.ctx.createGain();
      arpOsc.type = 'triangle';
      arpOsc.frequency.setValueAtTime(f, t + d);
      arpGain.gain.setValueAtTime(0.001, t + d);
      arpGain.gain.linearRampToValueAtTime(this.volume * 0.22, t + d + 0.03);
      arpGain.gain.exponentialRampToValueAtTime(0.001, t + d + 0.35);
      arpOsc.connect(arpGain);
      arpGain.connect(this.ctx.destination);
      arpOsc.start(t + d);
      arpOsc.stop(t + d + 0.4);
      this.introOscillators.push(arpOsc);
    });

    // Cleanup after finish
    const endTimeout = window.setTimeout(() => {
      this.isIntroPlaying = false;
    }, 9000);
    this.introTimeouts.push(endTimeout);

    this.vibrate([100, 80, 150, 100, 250]);
  }

  public stopIntroTheme() {
    this.isIntroPlaying = false;
    this.introTimeouts.forEach(clearTimeout);
    this.introTimeouts = [];
    this.introOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.introOscillators = [];
  }

  public getIsIntroPlaying(): boolean {
    return this.isIntroPlaying;
  }
}

export const sounds = new SoundEngine();

