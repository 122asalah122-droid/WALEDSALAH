import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Language } from '../types/game';

interface OfflineIndicatorProps {
  lang: Language;
  totalOfflineQuestions: number;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  lang,
  totalOfflineQuestions,
}) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 left-3 z-50 flex items-center gap-2 rounded-xl bg-slate-900/95 border border-emerald-500/60 px-3 py-2 text-xs font-bold text-emerald-300 shadow-2xl">
      <WifiOff className="w-4 h-4 text-emerald-400 shrink-0" />
      <span>
        {lang === 'ar'
          ? `وضع بدون نت نشط • ${totalOfflineQuestions} سؤال مخزن للعب مع الكمبيوتر`
          : `Offline Mode Active • ${totalOfflineQuestions} Questions Ready vs Computer`}
      </span>
    </div>
  );
};
