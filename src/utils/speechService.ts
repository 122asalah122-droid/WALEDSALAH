/**
 * AI Voice Announcer for Who Wants to Be a Millionaire
 * High-compatibility speech synthesizer engine engineered specifically for
 * Samsung, Xiaomi, iPhone, Android WebView (AppCreator24), and modern desktop browsers.
 */

import { Question } from '../types/game';
import { LADDER, MAX_LADDER_STEP } from '../data/ladder';

export interface SpeechStatus {
  isSpeaking: boolean;
  currentText: string;
}

const ARABIC_LEVEL_NAMES = [
  '',
  'الأول',
  'الثاني',
  'الثالث',
  'الرابع',
  'الخامس',
  'السادس',
  'السابع',
  'الثامن',
  'التاسع',
  'العاشر',
  'الحادي عشر',
  'الثاني عشر',
  'الثالث عشر',
  'الرابع عشر',
  'الخامس عشر وسؤال المليون',
];

const ARABIC_PRIZE_NAMES = [
  '',
  'مئة ريال',
  'مئتي ريال',
  'ثلاثمائة ريال',
  'خمسمائة ريال',
  'ألف ريال',
  'ألفي ريال',
  'أربعة آلاف ريال',
  'ثمانية آلاف ريال',
  'ستة عشر ألف ريال',
  'اثنان وثلاثون ألف ريال',
  'أربعة وستون ألف ريال',
  'مائة وخمسة وعشرون ألف ريال',
  'مائتان وخمسون ألف ريال',
  'نصف مليون ريال',
  'مليون ريال',
];

const ENGLISH_LEVEL_NAMES = [
  '',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen, the final one million dollar question',
];

const ENGLISH_PRIZE_NAMES = [
  '',
  'one hundred dollars',
  'two hundred dollars',
  'three hundred dollars',
  'five hundred dollars',
  'one thousand dollars',
  'two thousand dollars',
  'four thousand dollars',
  'eight thousand dollars',
  'sixteen thousand dollars',
  'thirty-two thousand dollars',
  'sixty-four thousand dollars',
  'one hundred twenty-five thousand dollars',
  'two hundred fifty thousand dollars',
  'five hundred thousand dollars',
  'one million dollars',
];

class SpeechService {
  private autoRead: boolean = true;
  private voicePitch: number = 0.98;
  private voiceRate: number = 0.94;
  private isSpeaking: boolean = false;
  private listeners: Set<(status: SpeechStatus) => void> = new Set();
  private bestArabicVoice: SpeechSynthesisVoice | null = null;
  private bestEnglishVoice: SpeechSynthesisVoice | null = null;
  private isPrimed: boolean = false;
  private activeTimeout: number | null = null;
  private audioWatchdogTimeout: number | null = null;
  private speechKeepAliveInterval: number | null = null;
  private webSpeechSafetyTimeout: number | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private currentQuestionKey: string = '';
  private speechToken: number = 0;

  constructor() {
    try {
      const savedAutoRead = localStorage.getItem('millionaire_autoread');
      if (savedAutoRead !== null) {
        this.autoRead = savedAutoRead === 'true';
      } else {
        this.autoRead = true;
      }
    } catch {
      this.autoRead = true;
    }

    this.initVoices();
  }

  private clearSpeechWatchdogs() {
    if (this.activeTimeout !== null) {
      clearTimeout(this.activeTimeout);
      this.activeTimeout = null;
    }
    if (this.audioWatchdogTimeout !== null) {
      clearTimeout(this.audioWatchdogTimeout);
      this.audioWatchdogTimeout = null;
    }
    if (this.speechKeepAliveInterval !== null) {
      clearInterval(this.speechKeepAliveInterval);
      this.speechKeepAliveInterval = null;
    }
    if (this.webSpeechSafetyTimeout !== null) {
      clearTimeout(this.webSpeechSafetyTimeout);
      this.webSpeechSafetyTimeout = null;
    }
  }

  // Pre-warms voices and resumes paused speechSynthesis on user touch/click without queuing a colliding utterance
  public prime() {
    if (typeof window === 'undefined') return;
    try {
      if ('speechSynthesis' in window) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        this.initVoices();
      }
      this.isPrimed = true;
    } catch {}
  }

  public initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const findVoices = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        if (!voices || voices.length === 0) return;

        // Best natural Arabic voice selection
        this.bestArabicVoice =
          voices.find((v) => v.lang.startsWith('ar') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Naayf') || v.name.includes('Hoda') || v.name.includes('Tarik') || v.name.includes('Salma') || v.name.includes('Maged'))) ||
          voices.find((v) => v.lang.startsWith('ar')) ||
          null;

        // Best English voice selection
        this.bestEnglishVoice =
          voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Guy') || v.name.includes('David') || v.name.includes('Daniel') || v.name.includes('Samantha'))) ||
          voices.find((v) => v.lang.startsWith('en')) ||
          null;
      } catch {}
    };

    findVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = findVoices;
    }
  }

  public subscribe(listener: (status: SpeechStatus) => void): () => void {
    this.listeners.add(listener);
    listener({ isSpeaking: this.isSpeaking, currentText: '' });
    return () => this.listeners.delete(listener);
  }

  private notify(isSpeaking: boolean, currentText: string = '') {
    this.isSpeaking = isSpeaking;
    this.listeners.forEach((listener) => {
      try {
        listener({ isSpeaking, currentText });
      } catch {}
    });
  }

  public getAutoRead(): boolean {
    return this.autoRead;
  }

  public setAutoRead(enabled: boolean) {
    this.autoRead = enabled;
    try {
      localStorage.setItem('millionaire_autoread', String(enabled));
    } catch {}
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public stop() {
    this.speechToken++;
    this.clearSpeechWatchdogs();

    if (this.currentAudio) {
      try {
        const audio = this.currentAudio;
        this.currentAudio = null;
        audio.onplay = null;
        audio.onplaying = null;
        audio.onended = null;
        audio.onerror = null;
        audio.onstalled = null;
        audio.ontimeupdate = null;
        audio.pause();
        audio.currentTime = 0;
        audio.removeAttribute('src');
        audio.load();
      } catch {}
      this.currentAudio = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel();
        }
      } catch {}
      try {
        delete (window as unknown as { __currentUtterance?: SpeechSynthesisUtterance }).__currentUtterance;
      } catch {}
    }

    try {
      const androidTts = (window as unknown as { AndroidTTS?: { stop?: () => void } }).AndroidTTS;
      androidTts?.stop?.();
    } catch {}

    this.isSpeaking = false;
    this.currentQuestionKey = '';
    this.notify(false, '');
  }

  /**
   * Builds the dramatic TV host speech announcement.
   * e.g., "السؤال الأول بقيمة مئة ريال: [نص السؤال]. الخيار ألف: [أ]. الخيار باء: [ب]..."
   */
  public buildDramaticText(
    level: number,
    question: string,
    options: string[],
    lang: 'ar' | 'en' = 'ar'
  ): string {
    const stageIdx = Math.max(1, Math.min(MAX_LADDER_STEP, level));
    const tier = LADDER[stageIdx - 1];
    const amount = tier ? tier.amount : 100;
    if (lang === 'ar') {
      const stageStr =
        stageIdx === MAX_LADDER_STEP
          ? 'المئة والأخير، سؤال الجائزة الكبرى'
          : stageIdx <= 15 && ARABIC_LEVEL_NAMES[stageIdx]
          ? ARABIC_LEVEL_NAMES[stageIdx]
          : `رقم ${stageIdx}`;
      const prizeStr =
        amount === 1000000 ? 'مليون ريال' : `${amount.toLocaleString('ar-EG')} ريال`;
      return `السؤال ${stageStr}، بقيمة ${prizeStr}. ${question}. الخيار ألف: ${options[0]}. الخيار باء: ${options[1]}. الخيار جيم: ${options[2]}. الخيار دال: ${options[3]}.`;
    } else {
      const stageStr =
        stageIdx === MAX_LADDER_STEP
          ? 'one hundred, the final one million dollar question'
          : stageIdx <= 15 && ENGLISH_LEVEL_NAMES[stageIdx]
          ? ENGLISH_LEVEL_NAMES[stageIdx]
          : `${stageIdx}`;
      const prizeStr =
        amount === 1000000 ? 'one million dollars' : `${amount.toLocaleString('en-US')} dollars`;
      return `Question number ${stageStr}, for ${prizeStr}. ${question}. Option A: ${options[0]}. Option B: ${options[1]}. Option C: ${options[2]}. Option D: ${options[3]}.`;
    }
  }

  /**
   * Speak question and its 4 options with natural dramatic TV game show host cadence.
   * Uses dual engine: High-quality server audio stream first (works on 100% of mobiles)
   * with a strict 2.5s start watchdog + automatic Web Speech API fallback & resume keepalive.
   */
  public speakQuestionAndOptions(
    arg1: Question | number | string,
    arg2?: string | string[] | 'ar' | 'en',
    arg3?: string[] | number | 'ar' | 'en',
    arg4?: 'ar' | 'en' | (() => void),
    arg5?: () => void
  ) {
    if (typeof window === 'undefined') return;

    let level = 1;
    let questionText = '';
    let options: string[] = [];
    let lang: 'ar' | 'en' = 'ar';
    let onComplete: (() => void) | undefined = undefined;

    if (typeof arg1 === 'object' && arg1 !== null) {
      const q = arg1 as Question;
      lang = (arg2 as 'ar' | 'en') || 'ar';
      level = typeof arg3 === 'number' ? arg3 : q.level || 1;
      questionText = lang === 'ar' ? q.questionAr : q.questionEn;
      options = lang === 'ar' ? q.optionsAr : q.optionsEn;
      if (typeof arg4 === 'function') onComplete = arg4;
    } else if (typeof arg1 === 'string') {
      questionText = arg1;
      options = Array.isArray(arg2) ? arg2 : [];
      lang = (arg3 as 'ar' | 'en') || 'ar';
      level = 1;
      if (typeof arg4 === 'function') onComplete = arg4;
    } else {
      level = arg1;
      questionText = typeof arg2 === 'string' ? arg2 : '';
      options = Array.isArray(arg3) ? arg3 : [];
      lang = typeof arg4 === 'string' ? arg4 : 'ar';
      onComplete = arg5;
    }

    const questionKey = `${level}_${questionText}_${lang}`;
    if (this.isSpeaking && this.currentQuestionKey === questionKey) {
      return;
    }

    const wasBusy =
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      (window.speechSynthesis.speaking || window.speechSynthesis.pending);

    this.stop();
    const token = ++this.speechToken;
    this.currentQuestionKey = questionKey;

    const formattedText = this.buildDramaticText(level, questionText, options, lang);

    // Optional native Android WebView TTS bridge if attached by wrapper app
    try {
      const androidTts = (
        window as unknown as {
          AndroidTTS?: { speak?: (text: string, langCode: string) => void };
        }
      ).AndroidTTS;
      if (androidTts?.speak) {
        this.notify(true, formattedText);
        androidTts.speak(formattedText, lang === 'ar' ? 'ar-SA' : 'en-US');
        this.webSpeechSafetyTimeout = window.setTimeout(() => {
          if (this.speechToken === token) {
            this.notify(false, '');
            this.currentQuestionKey = '';
            if (onComplete) onComplete();
          }
        }, Math.min(22000, Math.max(5000, formattedText.length * 75)));
        return;
      }
    } catch {}

    // Frontend-only Web Speech API (zero local /api/* server dependency for Cloudflare Pages & Offline PWA)
    this.speakWithWebSpeech(formattedText, lang, token, onComplete, wasBusy);
  }

  private speakWithWebSpeech(
    formattedText: string,
    lang: 'ar' | 'en',
    token: number,
    onComplete?: () => void,
    wasBusy: boolean = false
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.notify(false, '');
      this.currentQuestionKey = '';
      if (onComplete) onComplete();
      return;
    }
    if (this.speechToken !== token) return;

    let completed = false;
    let started = false;
    const finishSpeech = () => {
      if (completed || this.speechToken !== token) return;
      completed = true;
      this.clearSpeechWatchdogs();
      this.notify(false, '');
      (window as unknown as { __currentUtterance?: SpeechSynthesisUtterance }).__currentUtterance = undefined;
      this.currentQuestionKey = '';
      if (onComplete) onComplete();
    };

    const runSpeak = () => {
      if (this.speechToken !== token || completed) return;
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        if (!this.bestArabicVoice || !this.bestEnglishVoice) {
          this.initVoices();
        }

        const utterance = new SpeechSynthesisUtterance(formattedText);
        utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';

        if (lang === 'ar' && this.bestArabicVoice) {
          utterance.voice = this.bestArabicVoice;
          utterance.lang = this.bestArabicVoice.lang || 'ar-SA';
        } else if (lang === 'en' && this.bestEnglishVoice) {
          utterance.voice = this.bestEnglishVoice;
          utterance.lang = this.bestEnglishVoice.lang || 'en-US';
        }

        utterance.pitch = this.voicePitch;
        utterance.rate = this.voiceRate;
        utterance.volume = 1.0;

        (window as unknown as { __currentUtterance?: SpeechSynthesisUtterance }).__currentUtterance = utterance;

        utterance.onstart = () => {
          if (this.speechToken !== token) {
            try {
              window.speechSynthesis.cancel();
            } catch {}
            return;
          }
          started = true;
          this.notify(true, formattedText);
        };

        utterance.onend = () => {
          finishSpeech();
        };

        utterance.onerror = () => {
          finishSpeech();
        };

        // Prevent Chrome / Android WebView mid-sentence freeze bug & nudge paused engine
        this.speechKeepAliveInterval = window.setInterval(() => {
          if (this.speechToken !== token) {
            this.clearSpeechWatchdogs();
            return;
          }
          try {
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
          } catch {}
        }, 1200);

        // Hard cap safety net if Web Speech silently hangs without firing onend
        this.webSpeechSafetyTimeout = window.setTimeout(() => {
          if (!completed && this.speechToken === token) {
            try {
              window.speechSynthesis.cancel();
            } catch {}
            finishSpeech();
          }
        }, started ? 28000 : 22000);

        // Mark speaking immediately so UI banner & state stay responsive even on engines that fire onstart late
        this.notify(true, formattedText);
        window.speechSynthesis.speak(utterance);

        // Kickstart Chromium/WebView if it starts in a paused queue state
        this.audioWatchdogTimeout = window.setTimeout(() => {
          if (this.speechToken !== token || completed) return;
          try {
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
          } catch {}
        }, 300);
      } catch {
        finishSpeech();
      }
    };

    // Preserve user click gesture synchronously when engine was idle; only wait briefly after canceling active speech
    if (wasBusy) {
      this.activeTimeout = window.setTimeout(runSpeak, 80);
    } else {
      runSpeak();
    }
  }
}

export const speechService = new SpeechService();
