import React from 'react';
import { Crown } from 'lucide-react';
import { Language } from '../types/game';

interface AdBannerProps {
  isVip: boolean;
  lang: Language;
  onUpgradeVip: () => void;
}

/**
 * Standard non-VIP ad slot. Unmounts completely the moment the player activates VIP.
 */
export const AdBanner: React.FC<AdBannerProps> = ({ isVip, lang, onUpgradeVip }) => {
  if (isVip) return null;

  return (
    <aside
      aria-label={lang === 'ar' ? 'إعلان' : 'Advertisement'}
      className="w-full max-w-2xl mx-auto px-3.5 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 text-start"
    >
      <div className="min-w-0 space-y-0.5">
        <div className="text-[11px] text-slate-500 font-medium">
          {lang === 'ar' ? 'مساحة إعلانية · النسخة المجانية' : 'Sponsored Ad · Free Version'}
        </div>
        <div className="text-xs sm:text-sm text-slate-200 font-semibold truncate">
          {lang === 'ar'
            ? 'العب بدون إعلانات وافتح المايك والكاميرا مع عضوية VIP'
            : 'Remove ads & unlock live Mic and Camera with VIP'}
        </div>
      </div>

      <button
        type="button"
        onClick={onUpgradeVip}
        className="shrink-0 min-h-[40px] px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 whitespace-nowrap transition-colors"
      >
        <Crown className="w-3.5 h-3.5 shrink-0" />
        <span>{lang === 'ar' ? 'إزالة الإعلانات' : 'Remove Ads'}</span>
      </button>
    </aside>
  );
};
