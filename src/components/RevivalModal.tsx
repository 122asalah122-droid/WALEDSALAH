import React from 'react';
import { Zap, Coins, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Language } from '../types/game';

interface RevivalModalProps {
  isOpen: boolean;
  lang: Language;
  currentPoints: number;
  revivalCost: number;
  currentLevel: number;
  onRevive: () => void;
  onReturnToMainMenu: () => void;
}

export const RevivalModal: React.FC<RevivalModalProps> = ({
  isOpen,
  lang,
  currentPoints,
  revivalCost,
  currentLevel,
  onRevive,
  onReturnToMainMenu,
}) => {
  if (!isOpen) return null;

  const canAfford = currentPoints >= revivalCost;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-rose-500/60 rounded-3xl max-w-md w-full p-5 sm:p-7 shadow-2xl space-y-5 text-center relative overflow-hidden text-slate-100">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <button
            onClick={onReturnToMainMenu}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/90 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-700/80 font-bold text-xs shadow-md transition-all active:scale-95"
          >
            {lang === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{lang === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}</span>
          </button>

          <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
            {lang === 'ar' ? 'إجابة خاطئة' : 'Wrong Answer'}
          </span>
        </div>

        {/* Icon */}
        <div className="relative w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border-2 border-rose-500 flex items-center justify-center text-rose-400 shadow-lg">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* Title & Explanation */}
        <div className="space-y-1.5">
          <h3 className="text-xl sm:text-2xl font-black text-rose-400">
            {lang === 'ar' ? 'إجابة غير صحيحة!' : 'Incorrect Answer!'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {canAfford
              ? lang === 'ar'
                ? `توقف السؤال رقم ${currentLevel}. يمكنك استخدام ${revivalCost} نقطة من رصيدك لإجابة السؤال ومواصلة التحدي!`
                : `Paused at Question #${currentLevel}. Spend ${revivalCost} points to solve/continue and keep playing!`
              : lang === 'ar'
              ? `خسرت المحاولة عند السؤال رقم ${currentLevel}! المواصلة متاحة بالنقاط فقط (${revivalCost} نقطة).`
              : `You lost at Question #${currentLevel}! Continuation requires ${revivalCost} points.`}
          </p>
        </div>

        {/* Points Balance */}
        <div className="flex items-center justify-between p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{lang === 'ar' ? 'رصيد نقاطك الحالي:' : 'Your Points:'}</span>
          </div>
          <span className="font-mono text-base font-black text-amber-400">
            {currentPoints.toLocaleString()} {lang === 'ar' ? 'نقطة' : 'pts'}
          </span>
        </div>

        {/* Action Options */}
        <div className="space-y-2.5 pt-1">
          {canAfford && (
            <button
              onClick={onRevive}
              className="w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-between transition-all duration-200 shadow-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 text-slate-950 hover:from-emerald-400 hover:to-emerald-300 active:scale-98 shadow-emerald-500/20"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 fill-current" />
                <span>
                  {lang === 'ar'
                    ? `إجابة السؤال والمواصلة (${revivalCost} نقطة)`
                    : `Answer Question & Continue (${revivalCost} pts)`}
                </span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-black/20 font-mono">
                -{revivalCost}
              </span>
            </button>
          )}

          <button
            onClick={onReturnToMainMenu}
            className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-800 active:scale-98 text-slate-300 font-bold text-xs sm:text-sm rounded-2xl border border-slate-700/80 transition flex items-center justify-center gap-2 shadow"
          >
            {lang === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{lang === 'ar' ? 'الرجوع للقائمة الرئيسية' : 'Return to Main Menu'}</span>
          </button>
        </div>

        <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2">
          {lang === 'ar'
            ? '💡 عند الإجابة الخاطئة لا يتم حذف أي خيار، والمواصلة متاحة بالنقاط فقط.'
            : '💡 Answers are never eliminated on wrong guesses; continuation uses points only.'}
        </div>
      </div>
    </div>
  );
};
