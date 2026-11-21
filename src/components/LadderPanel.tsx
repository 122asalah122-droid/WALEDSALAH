import React, { useEffect, useMemo, useRef } from 'react';
import { ShieldCheck, Trophy, Sparkles, X } from 'lucide-react';
import { LADDER, MAX_LADDER_STEP, formatCurrency, getGuaranteedSafetyAmount } from '../data/ladder';
import { Language } from '../types/game';

interface LadderPanelProps {
  currentLevel: number; // 1 to 100
  lang: Language;
  onClose?: () => void;
  isMobileModal?: boolean;
}

export const LadderPanel: React.FC<LadderPanelProps> = ({
  currentLevel,
  lang,
  onClose,
  isMobileModal = false,
}) => {
  const listRef = useRef<HTMLDivElement | null>(null);
  const activeRowRef = useRef<HTMLDivElement | null>(null);

  // Ladder is traditionally rendered top-down (Stage 100 at top, Stage 1 at bottom)
  const reversedLadder = useMemo(() => [...LADDER].reverse(), []);

  // Guaranteed milestone safety net (steps 10, 20, ..., 90)
  const guaranteedAmount = getGuaranteedSafetyAmount(currentLevel);

  const currentTier = LADDER.find((t) => t.step === currentLevel);

  useEffect(() => {
    if (listRef.current && activeRowRef.current) {
      try {
        const container = listRef.current;
        const row = activeRowRef.current;
        container.scrollTop = Math.max(0, row.offsetTop - container.clientHeight / 2 + row.clientHeight / 2);
      } catch {}
    }
  }, [currentLevel]);

  return (
    <div
      className={`flex flex-col bg-slate-900 border border-slate-800/90 rounded-2xl shadow-xl overflow-hidden ${
        isMobileModal ? 'w-full max-w-sm max-h-[85vh] p-4' : 'w-72 p-4 h-full max-h-[82vh]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-sm text-slate-100">
            {lang === 'ar' ? `سلّم الجوائز (${MAX_LADDER_STEP} مرحلة)` : `Prize Ladder (${MAX_LADDER_STEP} Stages)`}
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Safety Net Info Box */}
      <div className="mb-3 px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{lang === 'ar' ? 'الرصيد المضمون:' : 'Guaranteed:'}</span>
        </div>
        <span className="font-mono font-bold text-emerald-300">
          {formatCurrency(guaranteedAmount, lang)}
        </span>
      </div>

      {/* Rungs List */}
      <div ref={listRef} className="relative flex-1 space-y-1 overflow-y-auto pr-0.5 custom-scrollbar">
        {reversedLadder.map((tier) => {
          const isCurrent = tier.step === currentLevel;
          const isPassed = tier.step < currentLevel;
          const isGrandJackpot = tier.step === MAX_LADDER_STEP;

          return (
            <div
              key={tier.step}
              ref={isCurrent ? activeRowRef : null}
              className={`flex items-center justify-between px-3 py-1 rounded-xl text-xs font-semibold transition-all duration-300 ${
                isCurrent
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 font-extrabold shadow-lg shadow-amber-500/25 scale-[1.02] border border-amber-300'
                  : isPassed
                  ? 'bg-slate-800/40 text-emerald-400/80 border border-emerald-900/30'
                  : tier.isMilestone
                  ? 'bg-blue-950/40 text-blue-200 border border-blue-800/40'
                  : 'text-slate-400 hover:bg-slate-800/30'
              }`}
            >
              {/* Step Number */}
              <div className="flex items-center gap-1.5 font-mono">
                <span
                  className={`w-7 text-right ${
                    isCurrent ? 'text-slate-950 font-black' : tier.isMilestone ? 'text-amber-400' : 'text-slate-500'
                  }`}
                >
                  {tier.step}
                </span>
                {isGrandJackpot ? (
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                ) : tier.isMilestone ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                ) : null}
              </div>

              {/* Amount */}
              <div
                className={`font-mono tracking-tight text-right ${
                  isCurrent
                    ? 'text-slate-950 font-black text-sm'
                    : tier.isMilestone
                    ? 'text-amber-300 font-bold'
                    : 'text-slate-300'
                }`}
              >
                {formatCurrency(tier.amount, lang)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Target Footer */}
      {currentTier && (
        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {lang === 'ar' ? `السؤال ${currentLevel} يعادل:` : `Stage ${currentLevel} Value:`}
          </span>
          <span className="font-mono font-bold text-amber-400">
            {formatCurrency(currentTier.amount, lang)}
          </span>
        </div>
      )}
    </div>
  );
};
