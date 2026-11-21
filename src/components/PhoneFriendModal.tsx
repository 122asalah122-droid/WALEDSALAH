import React, { useEffect, useState } from 'react';
import { PhoneCall, X, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { PhoneFriendResult, Language } from '../types/game';
import { sounds } from '../utils/soundEffects';

interface PhoneFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: PhoneFriendResult | null;
  lang: Language;
  options: [string, string, string, string];
}

export const PhoneFriendModal: React.FC<PhoneFriendModalProps> = ({
  isOpen,
  onClose,
  result,
  lang,
  options,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [isCalling, setIsCalling] = useState(true);

  useEffect(() => {
    if (isOpen && result) {
      setIsCalling(true);
      setSecondsLeft(30);
      sounds.playPhoneFriend();

      // Simulated pickup after 2.2 seconds
      const pickupTimer = setTimeout(() => {
        setIsCalling(false);
      }, 2200);

      const interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          if (prev <= 5) {
            sounds.playClockTick(true);
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearTimeout(pickupTimer);
        clearInterval(interval);
      };
    }
  }, [isOpen, result]);

  if (!isOpen || !result) return null;

  const letterLabels = lang === 'ar' ? ['أ', 'ب', 'ج', 'د'] : ['A', 'B', 'C', 'D'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-fadeIn">
      <div className="relative w-full max-w-md p-6 bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-700 font-bold text-xs shadow transition active:scale-95"
              title={lang === 'ar' ? 'إغلاق والرجوع' : 'Back'}
            >
              {lang === 'ar' ? '⬅️ رجوع' : 'Back ➡️'}
            </button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-300">
                  {lang === 'ar' ? 'الاتصال بصديق' : 'Phone a Friend'}
                </h3>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm px-2.5 py-1 bg-slate-800 rounded-lg text-amber-300 font-bold border border-amber-500/30">
              {secondsLeft}s
            </span>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="py-6">
          {isCalling ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-400 flex items-center justify-center">
                <PhoneCall className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-200">
                  {lang === 'ar' ? `جاري الاتصال بـ ${result.friendName}...` : `Calling ${result.friendName}...`}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'ar' ? 'انتظار الرد على الخط المباشر...' : 'Connecting live line to studio...'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              {/* Friend Info Card */}
              <div className="flex items-center gap-3 p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
                  {result.avatar || <User className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">{result.friendName}</span>
                    <span className="text-xs font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/30">
                      {lang === 'ar' ? `ثقة ${result.confidence}%` : `${result.confidence}% Sure`}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {lang === 'ar' ? 'على الخط المباشر الآن' : 'Live on speakerphone'}
                  </div>
                </div>
              </div>

              {/* Dialogue Bubble */}
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl relative">
                <p className="text-sm text-emerald-100 leading-relaxed font-medium">
                  "{lang === 'ar' ? result.messageAr : result.messageEn}"
                </p>
              </div>

              {/* Suggested Option */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-amber-400" />
                  <span className="text-xs text-slate-300">
                    {lang === 'ar' ? 'الإجابة المقترحة:' : 'Recommended Answer:'}
                  </span>
                </div>
                <div className="font-bold text-amber-300 text-sm">
                  {letterLabels[result.suggestedIndex]}: {options[result.suggestedIndex]}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
          >
            <span>{lang === 'ar' ? 'شكراً، إغلاق المكالمة' : 'Thank you, End Call'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
