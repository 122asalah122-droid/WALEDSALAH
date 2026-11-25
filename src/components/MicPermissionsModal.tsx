import React, { useState } from 'react';
import { Mic, Volume2, ShieldCheck, ArrowRight, AlertTriangle, RefreshCw, Crown, Lock } from 'lucide-react';
import { Language } from '../types/game';
import { rtcCallManager } from '../services/rtcCallManager';
import { sounds } from '../utils/soundEffects';
import { speechService } from '../utils/speechService';

interface MicPermissionsModalProps {
  isOpen: boolean;
  lang: Language;
  modeLabel: string;
  isVip?: boolean;
  onOpenVip?: () => void;
  onCancel: () => void;
  onContinue: (micGranted: boolean) => void;
}

export const MicPermissionsModal: React.FC<MicPermissionsModalProps> = ({
  isOpen,
  lang,
  modeLabel,
  isVip = false,
  onOpenVip,
  onCancel,
  onContinue,
}) => {
  const [requesting, setRequesting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestAndContinue = async () => {
    if (requesting) return;
    setRequesting(true);
    setErrorMsg(null);

    // Stop background lobby/tension music immediately & prime audio inside user gesture
    sounds.stopIntroTheme();
    sounds.stopTensionAmbience();
    speechService.prime();

    const result = await rtcCallManager.requestMicPermissionOnContinue();
    setRequesting(false);

    if (result.granted) {
      onContinue(true);
    } else {
      setErrorMsg(
        result.error ||
          (lang === 'ar'
            ? 'تعذر فتح الميكروفون. يرجى السماح بصلاحية الميكروفون من إعدادات المتصفح لتتحدث مع اللاعبين.'
            : 'Could not access microphone. Please allow microphone permission in browser settings.')
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-md bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-5 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/15 border-2 border-emerald-400/60 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/15">
          <Mic className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-black">
            <span>🎙️ {modeLabel}</span>
          </div>
          <h2 className="text-xl font-black text-slate-100">
            {lang === 'ar' ? 'شاشة الأذونات والصوت المباشر' : 'Voice & Microphone Permissions'}
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            {lang === 'ar'
              ? 'للتحدث وسماع اللاعبين الآخرين مباشرة داخل الغرفة بوضوح، يرجى الضغط على "متابعة" لمنح إذن الميكروفون قبل الدخول.'
              : 'To talk and hear other players live inside the room, tap "Continue" to grant microphone permission before joining.'}
          </p>
        </div>

        <div className="space-y-2 text-start bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <Mic className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {lang === 'ar'
                ? 'تشغيل الميكروفون الفعلي لربط الصوت بين جميع اللاعبين في الغرفة'
                : 'Activates real microphone audio across all players in the room'}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              {lang === 'ar'
                ? 'إيقاف موسيقى الخلفية تلقائياً داخل الغرفة لصفاء الصوت المباشر'
                : 'Automatically stops background music inside the room for clear voice'}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {lang === 'ar'
                ? 'يمكنك كتم المايك أو حظر/الإبلاغ عن أي لاعب بضغطة واحدة داخل الغرفة'
                : 'You can mute mic or block/report any player anytime inside the room'}
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-xs text-rose-200 text-start flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-2.5 pt-1">
          {!isVip ? (
            <>
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-xs text-amber-200 text-start flex items-start gap-2 leading-relaxed">
                <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {lang === 'ar'
                    ? 'فتح الميكروفون والكاميرا المباشرة ميزة خاصة بأعضاء VIP. يمكنك الاشتراك الآن أو الدخول للعب بدون مايك.'
                    : 'Live Microphone & Camera are VIP perks. Subscribe to VIP to unlock them or enter in text/quiz mode.'}
                </span>
              </div>

              {onOpenVip && (
                <button
                  type="button"
                  onClick={onOpenVip}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-98"
                >
                  <Crown className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'فتح المايك والكاميرا (اشترك VIP)' : 'Unlock Mic & Camera (Go VIP)'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  sounds.stopIntroTheme();
                  sounds.stopTensionAmbience();
                  speechService.prime();
                  onContinue(false);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-2 transition"
              >
                <span>{lang === 'ar' ? 'متابعة اللعب بدون ميكروفون' : 'Continue Playing Without Mic'}</span>
                <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRequestAndContinue}
                disabled={requesting}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-60 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-98"
              >
                {requesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{lang === 'ar' ? 'جاري طلب إذن الميكروفون...' : 'Requesting Microphone...'}</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>{errorMsg ? (lang === 'ar' ? 'إعادة المحاولة والمتابعة' : 'Retry & Continue') : (lang === 'ar' ? 'متابعة وتفعيل الميكروفون (VIP)' : 'Continue & Enable Mic (VIP)')}</span>
                    <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>

              {errorMsg && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.stopIntroTheme();
                    sounds.stopTensionAmbience();
                    onContinue(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/30 transition"
                >
                  {lang === 'ar'
                    ? 'الدخول للاستماع فقط (بدون ميكروفون)'
                    : 'Continue in Listen-Only Mode (No Mic)'}
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => {
              setErrorMsg(null);
              onCancel();
            }}
            className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 font-bold transition"
          >
            {lang === 'ar' ? 'رجوع للقائمة الرئيسية' : 'Back to Main Menu'}
          </button>
        </div>
      </div>
    </div>
  );
};
