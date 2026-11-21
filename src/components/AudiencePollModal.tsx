import React, { useEffect, useState } from 'react';
import { Users, X, BarChart3 } from 'lucide-react';
import { AudienceVoteResult, Language } from '../types/game';
import { sounds } from '../utils/soundEffects';

interface AudiencePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  voteResult: AudienceVoteResult | null;
  lang: Language;
  options: [string, string, string, string];
}

export const AudiencePollModal: React.FC<AudiencePollModalProps> = ({
  isOpen,
  onClose,
  voteResult,
  lang,
  options,
}) => {
  const [animatedPercentages, setAnimatedPercentages] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    if (isOpen && voteResult) {
      sounds.playAudienceVote();
      const timer = setTimeout(() => {
        setAnimatedPercentages(voteResult.percentages);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setAnimatedPercentages([0, 0, 0, 0]);
    }
  }, [isOpen, voteResult]);

  if (!isOpen || !voteResult) return null;

  const letterLabels = lang === 'ar' ? ['أ', 'ب', 'ج', 'د'] : ['A', 'B', 'C', 'D'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md p-6 bg-slate-900 border border-blue-500/30 rounded-2xl shadow-2xl text-slate-100">
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
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-blue-300">
                  {lang === 'ar' ? 'استفتاء رأي الجمهور' : 'Ask the Audience'}
                </h3>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audience Graphic Bars */}
        <div className="py-8">
          <div className="grid grid-cols-4 gap-3 items-end h-48 px-2 pb-2 border-b border-slate-800">
            {animatedPercentages.map((pct, idx) => {
              const isHighest = pct === Math.max(...animatedPercentages);
              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end group">
                  <span className="text-xs font-bold font-mono text-slate-300 mb-1.5 transition-all">
                    {pct}%
                  </span>
                  <div className="w-full bg-slate-800 rounded-t-lg overflow-hidden flex flex-col justify-end h-36">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-1000 ease-out flex items-center justify-center ${
                        isHighest
                          ? 'bg-gradient-to-t from-blue-600 via-blue-500 to-amber-400 shadow-lg shadow-blue-500/30'
                          : 'bg-gradient-to-t from-slate-700 to-blue-800/80'
                      }`}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className="mt-2 text-sm font-bold text-amber-400">
                    {letterLabels[idx]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Option details */}
          <div className="mt-4 space-y-2">
            {options.map((opt, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs px-3 py-1.5 bg-slate-800/60 rounded-lg border border-slate-700/50"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-bold text-amber-400">{letterLabels[i]}:</span>
                  <span className="truncate text-slate-300">{opt}</span>
                </div>
                <span className="font-mono font-bold text-blue-300 shrink-0">
                  {animatedPercentages[i]}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
          >
            <BarChart3 className="w-4 h-4" />
            <span>{lang === 'ar' ? 'فهمت الرأي، متابعة اللعب' : 'Got it, Back to Game'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
