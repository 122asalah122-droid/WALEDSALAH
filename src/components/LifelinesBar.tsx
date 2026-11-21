import React from 'react';
import { Users, PhoneCall, RefreshCw, Scissors, LogOut } from 'lucide-react';
import { LifelinesState, Language } from '../types/game';
import { sounds } from '../utils/soundEffects';

interface LifelinesBarProps {
  lifelines: LifelinesState;
  onUseLifeline: (type: keyof LifelinesState) => void;
  onWalkAway: () => void;
  disabled: boolean;
  lang: Language;
  canWalkAway: boolean;
}

export const LifelinesBar: React.FC<LifelinesBarProps> = ({
  lifelines,
  onUseLifeline,
  onWalkAway,
  disabled,
  lang,
  canWalkAway,
}) => {
  const handleFiftyFifty = () => {
    if (!lifelines.fiftyFifty || disabled) return;
    sounds.playFiftyFifty();
    onUseLifeline('fiftyFifty');
  };

  const handleAudience = () => {
    if (!lifelines.askAudience || disabled) return;
    onUseLifeline('askAudience');
  };

  const handlePhone = () => {
    if (!lifelines.phoneFriend || disabled) return;
    onUseLifeline('phoneFriend');
  };

  const handleSwitch = () => {
    if (!lifelines.switchQuestion || disabled) return;
    sounds.playSwitchQuestion();
    onUseLifeline('switchQuestion');
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 w-full max-w-4xl mx-auto py-2">
      {/* 4 Lifelines Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 50:50 */}
        <button
          onClick={handleFiftyFifty}
          disabled={!lifelines.fiftyFifty || disabled}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
            lifelines.fiftyFifty && !disabled
              ? 'bg-slate-900 border-amber-500/40 text-amber-300 hover:border-amber-400 hover:scale-105 shadow-md shadow-amber-500/10'
              : 'bg-slate-900/40 border-slate-800 text-slate-600 line-through cursor-not-allowed opacity-50'
          }`}
          title={lang === 'ar' ? 'حذف إجابتين (50:50)' : 'Fifty Fifty (50:50)'}
        >
          <Scissors className="w-4 h-4" />
          <span>50:50</span>
        </button>

        {/* Ask Audience */}
        <button
          onClick={handleAudience}
          disabled={!lifelines.askAudience || disabled}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
            lifelines.askAudience && !disabled
              ? 'bg-slate-900 border-blue-500/40 text-blue-300 hover:border-blue-400 hover:scale-105 shadow-md shadow-blue-500/10'
              : 'bg-slate-900/40 border-slate-800 text-slate-600 line-through cursor-not-allowed opacity-50'
          }`}
          title={lang === 'ar' ? 'تصويت واستفتاء الجمهور' : 'Ask the Audience'}
        >
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">
            {lang === 'ar' ? 'الجمهور' : 'Audience'}
          </span>
        </button>

        {/* Phone a Friend */}
        <button
          onClick={handlePhone}
          disabled={!lifelines.phoneFriend || disabled}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
            lifelines.phoneFriend && !disabled
              ? 'bg-slate-900 border-emerald-500/40 text-emerald-300 hover:border-emerald-400 hover:scale-105 shadow-md shadow-emerald-500/10'
              : 'bg-slate-900/40 border-slate-800 text-slate-600 line-through cursor-not-allowed opacity-50'
          }`}
          title={lang === 'ar' ? 'اتصال بصديق خبير' : 'Phone a Friend'}
        >
          <PhoneCall className="w-4 h-4" />
          <span className="hidden sm:inline">
            {lang === 'ar' ? 'اتصال بصديق' : 'Friend'}
          </span>
        </button>

        {/* Switch Question */}
        <button
          onClick={handleSwitch}
          disabled={!lifelines.switchQuestion || disabled}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
            lifelines.switchQuestion && !disabled
              ? 'bg-slate-900 border-purple-500/40 text-purple-300 hover:border-purple-400 hover:scale-105 shadow-md shadow-purple-500/10'
              : 'bg-slate-900/40 border-slate-800 text-slate-600 line-through cursor-not-allowed opacity-50'
          }`}
          title={lang === 'ar' ? 'تبديل السؤال الحالي' : 'Switch Question'}
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">
            {lang === 'ar' ? 'تبديل' : 'Switch'}
          </span>
        </button>
      </div>

      {/* Walk Away with Cash */}
      {canWalkAway && (
        <button
          onClick={onWalkAway}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/60 active:scale-95 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-bold transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>{lang === 'ar' ? 'الانسحاب بالرصيد' : 'Walk Away with Bank'}</span>
        </button>
      )}
    </div>
  );
};
