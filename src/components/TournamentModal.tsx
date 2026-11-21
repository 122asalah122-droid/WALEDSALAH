import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Clock, Sparkles, Award, ShieldCheck, Flame, ArrowRight, ArrowLeft, Play, Lock, Bell, BellRing, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Language } from '../types/game';
import { sounds } from '../utils/soundEffects';

interface TournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReturnToMainMenu?: () => void;
  lang: Language;
  onStartTournament: () => void;
  userPoints: number;
}

export const TournamentModal: React.FC<TournamentModalProps> = ({
  isOpen,
  onClose,
  onReturnToMainMenu,
  lang,
  onStartTournament,
  userPoints,
}) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; totalMs: number; isOpenWindow: boolean }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalMs: 0,
    isOpenWindow: false,
  });

  // Strictly locked outside scheduled 72h open window (no manual unlock toggle)
  const [lockWarningToast, setLockWarningToast] = useState<string | null>(null);
  const [isReminderSet, setIsReminderSet] = useState<boolean>(() => {
    try {
      return localStorage.getItem('millionaire_tournament_reminder_active') === 'true';
    } catch {
      return false;
    }
  });

  const reminderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      const CYCLE_MS = 72 * 60 * 60 * 1000; // 72 hours recurring cycle
      const OPEN_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours open competition window when timer hits 00:00:00
      const now = Date.now();
      const cyclePos = now % CYCLE_MS;
      const isOpenWindow = cyclePos < OPEN_WINDOW_MS;
      const remainingMs = isOpenWindow ? (OPEN_WINDOW_MS - cyclePos) : (CYCLE_MS - cyclePos);

      const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
      const hours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((remainingMs % (60 * 1000)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, totalMs: remainingMs, isOpenWindow });

      // Check 15-minute mark before start for automatic reminder
      const FIFTEEN_MIN_MS = 15 * 60 * 1000;
      if (!isOpenWindow && remainingMs <= FIFTEEN_MIN_MS && remainingMs > (FIFTEEN_MIN_MS - 2000)) {
        trigger15MinNotification();
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => {
      clearInterval(interval);
      if (reminderTimeoutRef.current) clearTimeout(reminderTimeoutRef.current);
    };
  }, []);

  const trigger15MinNotification = () => {
    if (typeof window === 'undefined') return;
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(
          lang === 'ar' ? '🏆 استعد! بطولة الـ 72 ساعة لتحدي الأبطال' : '🏆 Get Ready! 72-Hour Champions Challenge',
          {
            body: lang === 'ar'
              ? 'متبقي 15 دقيقة فقط على انطلاق منافسات بطولة العالم! جهز معلوماتك وادخل لحصد النقاط والجوائز المضاعفة!'
              : 'Only 15 minutes left until the World Championship begins! Get ready to compete for 2x points!',
            icon: '/favicon.ico',
          }
        );
      }
    } catch {}
  };

  const handleToggleReminder = async () => {
    sounds.playSelectAnswer();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted') {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') {
          setLockWarningToast(
            lang === 'ar'
              ? 'يرجى السماح بالإشعارات في المتصفح لتفعيل التذكير قبل 15 دقيقة'
              : 'Please allow notifications to enable the 15-minute reminder'
          );
          setTimeout(() => setLockWarningToast(null), 3500);
          return;
        }
      }
    }

    const nextState = !isReminderSet;
    setIsReminderSet(nextState);
    try {
      localStorage.setItem('millionaire_tournament_reminder_active', String(nextState));
    } catch {}

    if (nextState) {
      setLockWarningToast(
        lang === 'ar'
          ? '🔔 تم تفعيل التذكير بنجاح! سنرسل لك إشعاراً قبل بدء البطولة بـ 15 دقيقة بالضبط.'
          : '🔔 Reminder activated! You will receive a notification 15 minutes before start.'
      );
      setTimeout(() => setLockWarningToast(null), 4000);
    }
  };

  if (!isOpen) return null;

  // Strictly locked unless scheduled 72-hour tournament window is currently active
  const isLocked = !timeLeft.isOpenWindow;

  const handleStartAttempt = () => {
    if (isLocked) {
      sounds.playWrong();
      setLockWarningToast(
        lang === 'ar'
          ? 'عذراً، لم تبدأ البطولة بعد! يرجى الانتظار حتى انتهاء وقت العد التنازلي.'
          : 'Sorry, tournament has not started yet! Please wait until the countdown reaches 00:00:00.'
      );
      setTimeout(() => setLockWarningToast(null), 4000);
      return;
    }

    sounds.playCorrect();
    onClose();
    onStartTournament();
  };

  const handleBack = () => {
    if (onReturnToMainMenu) {
      onReturnToMainMenu();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden text-slate-100">

        {/* Global Back to Main Menu Button & Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-700/80 font-bold text-xs shadow-md transition-all active:scale-95"
              title={lang === 'ar' ? 'الرجوع للقائمة الرئيسية' : 'Back to Main Menu'}
            >
              {lang === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>{lang === 'ar' ? 'الرجوع للقائمة الرئيسية' : 'Main Menu'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Tournament Title & Emblem */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-amber-400 flex items-center gap-2">
              <span>{lang === 'ar' ? 'بطولة الـ 72 ساعة الدورية' : '72-Hour World Championship'}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${
                isLocked ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                {isLocked ? (lang === 'ar' ? '🔒 مغلقة حالياً' : '🔒 Locked') : (lang === 'ar' ? '🔓 مفتوحة الآن' : '🔓 Active')}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'ar' ? 'تتجدد تلقائياً كل 3 أيام مع جوائز ونقاط مضاعفة' : 'Recurring every 3 days with double points bonus'}
            </p>
          </div>
        </div>

        {/* Countdown Timer Display (Requirement 2) */}
        <div className="p-4 bg-slate-950/90 rounded-2xl border border-amber-500/30 text-center space-y-2">
          <div className="text-xs text-slate-300 flex items-center justify-center gap-1.5 font-bold">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>
              {isLocked
                ? (lang === 'ar' ? 'الوقت المتبقي حتى انطلاق موعد بدء البطولة:' : 'Time remaining until tournament launch:')
                : (lang === 'ar' ? 'انطلقت البطولة! متبقي على انتهاء الجولة:' : 'Tournament is LIVE! Time remaining:')}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1 font-mono">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xl sm:text-2xl font-black text-amber-400">{timeLeft.days}</div>
              <div className="text-[10px] text-slate-400">{lang === 'ar' ? 'يوم' : 'Days'}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xl sm:text-2xl font-black text-amber-400">{timeLeft.hours}</div>
              <div className="text-[10px] text-slate-400">{lang === 'ar' ? 'ساعة' : 'Hours'}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xl sm:text-2xl font-black text-amber-400">{timeLeft.minutes}</div>
              <div className="text-[10px] text-slate-400">{lang === 'ar' ? 'دقيقة' : 'Mins'}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xl sm:text-2xl font-black text-amber-300">{timeLeft.seconds}</div>
              <div className="text-[10px] text-slate-400">{lang === 'ar' ? 'ثانية' : 'Secs'}</div>
            </div>
          </div>
        </div>

        {/* 15-Minute Reminder Notification System Button (Requirement 2) */}
        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isReminderSet ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
              {isReminderSet ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            </div>
            <div className="text-start">
              <div className="text-xs font-bold text-slate-200">
                {lang === 'ar' ? 'تذكير قبل البدء بـ 15 دقيقة' : '15-Minute Start Reminder'}
              </div>
              <div className="text-[10px] text-slate-400">
                {lang === 'ar' ? 'إشعار تلقائي للهاتف عند بقاء 15 دقيقة للبدء' : 'Automatic phone alert 15 minutes before tournament kicks off'}
              </div>
            </div>
          </div>

          <button
            onClick={handleToggleReminder}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow shrink-0 ${
              isReminderSet
                ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            {isReminderSet ? (lang === 'ar' ? 'مفعل ✓' : 'Active ✓') : (lang === 'ar' ? 'تفعيل 🔔' : 'Enable 🔔')}
          </button>
        </div>

        {/* Warning Toast when clicking locked button */}
        {lockWarningToast && (
          <div className="p-3 bg-rose-500/20 border border-rose-500 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{lockWarningToast}</span>
          </div>
        )}

        {/* Tournament Perks */}
        <div className="space-y-1.5 text-xs text-slate-300">
          <div className="flex items-center gap-2 p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <Flame className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{lang === 'ar' ? 'مضاعفة النقاط x2 لكل إجابة صحيحة' : 'Double points (x2) on every correct answer'}</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{lang === 'ar' ? 'وسام البطل الدوري الذهبي للمراكز الأولى' : 'Golden Champion Badge for high scores'}</span>
          </div>
        </div>

        {/* Action Button: Disabled if countdown > 0 with warning alert on click */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleStartAttempt}
            className={`w-full py-3.5 px-5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
              isLocked
                ? 'bg-slate-800 border-2 border-slate-700 text-slate-500 cursor-not-allowed opacity-80 hover:border-rose-500/60'
                : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 hover:from-amber-400 hover:to-amber-300 shadow-amber-500/25 active:scale-98'
            }`}
          >
            {isLocked ? (
              <>
                <Lock className="w-4 h-4 text-rose-400" />
                <span>{lang === 'ar' ? 'البطولة مغلقة حتى انتهاء العداد (00:00:00)' : 'Tournament Locked until 00:00:00'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{lang === 'ar' ? 'دخول بطولة الـ 72 ساعة الآن (نقاط مضاعفة)' : 'Enter 72h Tournament Now'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
