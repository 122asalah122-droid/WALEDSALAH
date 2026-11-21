import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../types/game';

interface PWAInstallButtonProps {
  lang: Language;
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ lang, compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black shadow-md transition-colors shrink-0 ${
          compact ? 'px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs' : 'px-4 py-2.5 text-xs sm:text-sm'
        }`}
        title={lang === 'ar' ? 'تثبيت التطبيق للعب بدون نت' : 'Install App for Offline Play'}
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span>
          {compact
            ? (lang === 'ar' ? 'تثبيت' : 'Install')
            : (lang === 'ar' ? 'تثبيت التطبيق للعب بدون نت' : 'Install App (Play Offline)')}
        </span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 font-bold transition-colors shrink-0 ${
            compact ? 'px-2 py-1 text-xs' : 'px-3.5 py-2 text-xs'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 shrink-0" />
          <span>{lang === 'ar' ? 'حفظ على الآيفون (بدون نت)' : 'Add to iPhone (Offline)'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border-2 border-amber-500/50 p-5 shadow-2xl space-y-4 text-start">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-amber-300">
                  {lang === 'ar' ? 'تثبيت التطبيق للعب بدون نت (iPhone/iPad)' : 'Install on iPhone / iPad'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === 'ar' ? (
                  <>
                    1. اضغط على زر <strong>مشاركة (Share)</strong> في شريط Safari.<br />
                    2. اختر <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.<br />
                    3. افتح التطبيق من الشاشة الرئيسية في أي وقت بدون إنترنت مع جميع الأسئلة الـ 300!
                  </>
                ) : (
                  <>
                    1. Tap the <strong>Share</strong> button in Safari.<br />
                    2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
                    3. Launch anytime offline with all 300 questions stored locally!
                  </>
                )}
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 py-2.5 text-xs font-black text-slate-950"
              >
                {lang === 'ar' ? 'حسناً، فهمت' : 'Got it'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
