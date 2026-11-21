import React, { useEffect, useState } from 'react';
import { Award, Gift, Sparkles, X, CheckCircle2, Lock } from 'lucide-react';
import { Language } from '../types/game';
import {
  BADGE_DEFINITIONS,
  BadgeDefinition,
  RewardsState,
  rewardsService,
} from '../services/rewardsService';
import { sounds } from '../utils/soundEffects';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onClaimGiftPoints: (points: number, badge: BadgeDefinition) => void;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
  isOpen,
  onClose,
  lang,
  onClaimGiftPoints,
}) => {
  const [state, setState] = useState<RewardsState>(() => rewardsService.getState());
  const [dailyAvailable, setDailyAvailable] = useState<boolean>(() =>
    rewardsService.canClaimDailyGift()
  );

  useEffect(() => {
    if (!isOpen) return;
    setState(rewardsService.getState());
    setDailyAvailable(rewardsService.canClaimDailyGift());
    return rewardsService.subscribe((next) => {
      setState(next);
      setDailyAvailable(rewardsService.canClaimDailyGift());
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const unlockedCount = Object.keys(state.unlocked).length;
  const totalCount = BADGE_DEFINITIONS.length;

  const handleClaimDaily = () => {
    const reward = rewardsService.claimDailyGift();
    if (reward) {
      sounds.playMilestoneWin();
      onClaimGiftPoints(reward.giftPoints, reward.badge);
      setDailyAvailable(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/60 via-slate-900 to-purple-950/50 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-300">
                {lang === 'ar' ? 'الأوسمة والهدايا التشجيعية' : 'Badges & Encouragement Gifts'}
              </h2>
              <p className="text-[11px] text-slate-300">
                {lang === 'ar'
                  ? `الوسامات المفتوحة: ${unlockedCount} من ${totalCount} في جميع الأقسام`
                  : `Unlocked Badges: ${unlockedCount} of ${totalCount} across all modes`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Daily Encouragement Gift Chest */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-amber-950/60 border-2 border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3 text-start">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-2xl shrink-0">
                🎁
              </div>
              <div>
                <div className="font-black text-sm text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>
                    {lang === 'ar'
                      ? 'هدية التشجيع اليومية (+30 نقطة)'
                      : 'Daily Encouragement Gift (+30 Points)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {lang === 'ar'
                    ? 'افتح صندوق الهدايا يومياً لتحصل على نقاط مجانية تساعدك في المواصلة!'
                    : 'Claim free bonus points every day to stay in the competition!'}
                </p>
              </div>
            </div>

            <button
              onClick={handleClaimDaily}
              disabled={!dailyAvailable}
              className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 shrink-0 transition ${
                dailyAvailable
                  ? 'bg-gradient-to-r from-emerald-500 to-amber-400 hover:from-emerald-400 hover:to-amber-300 text-slate-950 shadow-lg active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>
                {dailyAvailable
                  ? lang === 'ar'
                    ? 'استلام الهدية الآن'
                    : 'Claim Gift Now'
                  : lang === 'ar'
                  ? 'تم استلام هدية اليوم ✓'
                  : 'Claimed Today ✓'}
              </span>
            </button>
          </div>

          {/* Mini Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400">
                {lang === 'ar' ? 'إجابات الكمبيوتر' : 'Classic Correct'}
              </div>
              <div className="font-mono font-black text-amber-300 text-sm">
                {state.stats.classicCorrectTotal}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400">
                {lang === 'ar' ? 'انتصارات الثنائي' : '1v1 Wins'}
              </div>
              <div className="font-mono font-black text-blue-300 text-sm">
                {state.stats.duelWins}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400">
                {lang === 'ar' ? 'انتصارات الجماعي' : '4P Wins'}
              </div>
              <div className="font-mono font-black text-purple-300 text-sm">
                {state.stats.groupWins}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400">
                {lang === 'ar' ? 'مشاركات البطولة' : 'Tournaments'}
              </div>
              <div className="font-mono font-black text-emerald-300 text-sm">
                {state.stats.tournamentPlayed}
              </div>
            </div>
          </div>

          {/* All Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BADGE_DEFINITIONS.map((badge) => {
              const isUnlocked = Boolean(state.unlocked[badge.id]);
              return (
                <div
                  key={badge.id}
                  className={`p-3.5 rounded-2xl border transition flex items-start gap-3 ${
                    isUnlocked
                      ? 'bg-amber-500/10 border-amber-400/60 shadow-md'
                      : 'bg-slate-950/70 border-slate-800 opacity-80'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border ${
                      isUnlocked
                        ? 'bg-amber-500/20 border-amber-400'
                        : 'bg-slate-900 border-slate-800 grayscale'
                    }`}
                  >
                    {badge.icon}
                  </div>
                  <div className="flex-1 min-w-0 text-start space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-xs text-slate-100 truncate">
                        {lang === 'ar' ? badge.titleAr : badge.titleEn}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-amber-300 font-bold shrink-0">
                        +{badge.giftPoints} 🪙
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {lang === 'ar' ? badge.descAr : badge.descEn}
                    </p>
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-[10px] text-slate-500 font-bold">
                        {lang === 'ar' ? badge.sectionLabelAr : badge.sectionLabelEn}
                      </span>
                      {isUnlocked ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{lang === 'ar' ? 'مفتوح' : 'Unlocked'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <Lock className="w-3 h-3" />
                          <span>{lang === 'ar' ? 'قيد الفتح' : 'Locked'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
