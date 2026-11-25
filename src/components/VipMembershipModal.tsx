import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Crown,
  X,
  Mic,
  Video,
  ShieldOff,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Database,
  LockOpen,
} from 'lucide-react';
import { Language } from '../types/game';
import {
  vipBillingService,
  VipServiceSnapshot,
  VIP_MONTHLY_SKU,
} from '../services/vipBillingService';
import { sounds } from '../utils/soundEffects';

interface VipMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  reason?: 'mic_camera' | 'remove_ads' | 'general';
  onVipActivated?: () => void;
}

export const VipMembershipModal: React.FC<VipMembershipModalProps> = ({
  isOpen,
  onClose,
  lang,
  reason = 'general',
  onVipActivated,
}) => {
  const [snap, setSnap] = useState<VipServiceSnapshot>(() => vipBillingService.getSnapshot());
  const [feedback, setFeedback] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const [showPlayNotice, setShowPlayNotice] = useState(false);

  useEffect(() => {
    return vipBillingService.subscribe(setSnap);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setFeedback(null);
      setShowPlayNotice(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const celebrateVipSuccess = () => {
    try {
      sounds.playMilestoneWin();
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#10b981', '#fef3c7'],
      });
    } catch {}
  };

  const handleSubscribe = async () => {
    if (snap.isLoading) return;
    setFeedback(null);
    setShowPlayNotice(false);
    sounds.playSelectAnswer();

    const result = await vipBillingService.purchaseVipMonthly();

    if (result.success) {
      celebrateVipSuccess();
      setFeedback({
        type: 'success',
        text:
          lang === 'ar'
            ? 'تم تفعيل عضوية VIP بنجاح وحفظها في قاعدة البيانات! تم فتح الميكروفون والكاميرا وإلغاء الإعلانات.'
            : 'VIP Membership activated and saved to the database! Mic, Camera, and Ad-Free mode are now unlocked.',
      });
      onVipActivated?.();
      return;
    }

    if (result.canceled) {
      setFeedback({
        type: 'info',
        text:
          lang === 'ar'
            ? 'تم إلغاء عملية الشراء من قِبلك.'
            : 'Purchase was canceled.',
      });
      return;
    }

    if (result.pending) {
      setFeedback({
        type: 'info',
        text:
          lang === 'ar'
            ? 'عملية الدفع قيد التأكيد من Google Play. سيتم تفعيل VIP تلقائياً فور اكتمالها.'
            : 'Payment is pending Google Play confirmation. VIP will unlock automatically once approved.',
      });
      return;
    }

    if (result.requiresPlayApp) {
      setShowPlayNotice(true);
      setFeedback({
        type: 'info',
        text:
          lang === 'ar'
            ? 'الدفع الحقيقي عبر مكتبة Google Play Billing يعمل داخل تطبيق الأندرويد المثبّت من متجر Google Play.'
            : 'Live Google Play Billing purchases run inside the Android app installed from Google Play.',
      });
      return;
    }

    setFeedback({
      type: 'error',
      text:
        result.error ||
        (lang === 'ar'
          ? 'تعذر إتمام عملية الدفع عبر Google Play. يرجى المحاولة مجدداً.'
          : 'Could not complete Google Play purchase. Please try again.'),
    });
  };

  const handleRestore = async () => {
    if (snap.isLoading) return;
    setFeedback(null);
    sounds.playSelectAnswer();

    const res = await vipBillingService.restoreVipPurchases();
    if (res.restored) {
      celebrateVipSuccess();
      setFeedback({
        type: 'success',
        text:
          lang === 'ar'
            ? 'تم استعادة اشتراكك الشهري (vip_monthly) وتفعيل جميع مزايا VIP!'
            : 'Your vip_monthly subscription has been restored with all VIP perks unlocked!',
      });
      onVipActivated?.();
    } else {
      setFeedback({
        type: 'info',
        text:
          lang === 'ar'
            ? 'لم يتم العثور على اشتراك VIP نشط مرتبط بهذا الحساب حالياً.'
            : 'No active VIP subscription was found for this account.',
      });
    }
  };

  const handleSandboxTestUnlock = async () => {
    if (snap.isLoading) return;
    setFeedback(null);
    const ok = await vipBillingService.activateSandboxPreviewVip();
    if (ok) {
      celebrateVipSuccess();
      setShowPlayNotice(false);
      setFeedback({
        type: 'success',
        text:
          lang === 'ar'
            ? 'تم التفعيل التجريبي وحفظ حالة VIP في Firebase! تم فتح المايك والكاميرا وإخفاء الإعلانات.'
            : 'Sandbox VIP saved to Firebase! Mic, Camera, and Ad-Free mode are now active.',
      });
      onVipActivated?.();
    }
  };

  const formattedExpiry = snap.expiresAt
    ? new Date(snap.expiresAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div
      className="fixed inset-0 z-[95] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      role="dialog"
      aria-modal="true"
      aria-labelledby="vip-modal-title"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
        {/* Top Accent Header */}
        <div className="px-5 sm:px-6 pt-5 pb-4 bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-900 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
              <Crown className="w-6 h-6" />
            </div>
            <div className="min-w-0 text-start">
              <div className="text-xs text-amber-300 font-semibold">
                {lang === 'ar' ? 'العضوية المميزة · Google Play Billing' : 'Premium Membership · Google Play Billing'}
              </div>
              <h2
                id="vip-modal-title"
                className="text-xl sm:text-2xl font-black text-slate-50 tracking-tight text-balance"
              >
                {lang === 'ar' ? 'عضوية VIP الشهرية' : 'VIP Monthly Membership'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0"
            aria-label={lang === 'ar' ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="px-5 sm:px-6 py-5 space-y-5 overflow-y-auto text-start">
          {/* Context prompt when opened from Mic/Camera lock or Remove Ads */}
          {!snap.isVip && reason === 'mic_camera' && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/35 text-xs sm:text-sm text-amber-200 leading-relaxed">
              {lang === 'ar'
                ? 'تشغيل الميكروفون والكاميرا المباشرة في التحديات والغرف الخاصة متاح لأعضاء VIP. اشترك الآن لفتحهما فوراً.'
                : 'Live Microphone and Camera in battles and private rooms require VIP Membership. Subscribe now to unlock immediately.'}
            </div>
          )}

          {!snap.isVip && reason === 'remove_ads' && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/35 text-xs sm:text-sm text-amber-200 leading-relaxed">
              {lang === 'ar'
                ? 'تخلّص من جميع الإعلانات واستمتع بتجربة لعب متواصلة مع فتح المايك والكاميرا عبر عضوية VIP.'
                : 'Remove all ads permanently and unlock Mic & Camera with VIP Membership.'}
            </div>
          )}

          {/* Active VIP Member State */}
          {snap.isVip ? (
            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
              <div className="flex items-center gap-2.5 text-emerald-300 font-black text-base">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>
                  {lang === 'ar' ? 'عضويتك VIP مفعّلة بنجاح' : 'Your VIP Membership is Active'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {lang === 'ar'
                  ? 'تم حفظ حالة VIP في قاعدة البيانات، وجميع مزايا الميكروفون والكاميرا وإلغاء الإعلانات مفتوحة لك الآن.'
                  : 'Your VIP status is saved to the database. Microphone, Camera, and Ad-Free play are all unlocked.'}
              </p>
              <div className="pt-2 border-t border-emerald-500/20 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-mono tabular-nums">
                <span>SKU: {snap.productId}</span>
                {formattedExpiry && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>
                      {lang === 'ar' ? `صالح حتى: ${formattedExpiry}` : `Valid until: ${formattedExpiry}`}
                    </span>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Plan Pricing Summary */
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs text-slate-400">
                  {lang === 'ar' ? 'الباقة الشهرية الرسمية' : 'Official Monthly Plan'}
                </div>
                <div className="text-lg font-black text-amber-300">
                  {lang === 'ar' ? 'اشتراك VIP شهري' : 'VIP Monthly Pass'}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {VIP_MONTHLY_SKU}
                </div>
              </div>
              <div className="text-end shrink-0">
                <div className="text-2xl sm:text-3xl font-black text-slate-50 font-mono tabular-nums">
                  {snap.productDetails.formattedPrice}
                </div>
                <div className="text-xs text-slate-400">
                  {lang === 'ar' ? 'شهرياً · يتجدد تلقائياً' : 'per month · auto-renews'}
                </div>
              </div>
            </div>
          )}

          {/* Core VIP Benefits List (clean hairline separation, no nested card clutter) */}
          <div className="divide-y divide-slate-800/90 border-y border-slate-800/90">
            <div className="py-3.5 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Mic className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>{lang === 'ar' ? 'فتح الميكروفون والصوت المباشر' : 'Unlock Live Microphone & Voice'}</span>
                  {snap.micCameraUnlocked && (
                    <span className="text-xs font-semibold text-emerald-400">
                      {lang === 'ar' ? '· مفتوح' : '· Unlocked'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'ar'
                    ? 'تحدث مع منافسيك وأصدقائك مباشرة داخل التحدي الثنائي وتحدي 4 لاعبين بجودة عالية.'
                    : 'Talk live with opponents and friends inside 1v1 duels and 4-player arenas.'}
                </p>
              </div>
            </div>

            <div className="py-3.5 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Video className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>{lang === 'ar' ? 'فتح الكاميرا ومكالمات الفيديو' : 'Unlock Camera & Video Calls'}</span>
                  {snap.micCameraUnlocked && (
                    <span className="text-xs font-semibold text-emerald-400">
                      {lang === 'ar' ? '· مفتوح' : '· Unlocked'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'ar'
                    ? 'إجراء مكالمات فيديو وصوت مباشرة داخل الغرف الخاصة مع دعم التبديل بين الكاميرات.'
                    : 'Start live video and voice calls in Private Rooms with front/back camera switching.'}
                </p>
              </div>
            </div>

            <div className="py-3.5 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <ShieldOff className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>{lang === 'ar' ? 'إلغاء الإعلانات نهائياً' : '100% Ad-Free Experience'}</span>
                  {snap.adsDisabled && (
                    <span className="text-xs font-semibold text-emerald-400">
                      {lang === 'ar' ? '· مفعّل' : '· Active'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'ar'
                    ? 'إزالة كافة البنرات والإعلانات داخل التطبيق لتجربة تركيز كاملة بدون مقاطعة.'
                    : 'Removes all banner and in-app ads across every game mode for uninterrupted play.'}
                </p>
              </div>
            </div>

            <div className="py-3.5 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-slate-100">
                  {lang === 'ar' ? 'حفظ تلقائي في قاعدة البيانات' : 'Saved Automatically to Database'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'ar'
                    ? 'يُحفظ اشتراكك فوراً في Firebase مع مزامنة واستعادة تلقائية عبر Google Play.'
                    : 'Your VIP membership is immediately persisted to Firebase with Google Play restore.'}
                </p>
              </div>
            </div>
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl border text-xs sm:text-sm flex items-start gap-2.5 leading-relaxed ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                  : feedback.type === 'error'
                  ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                  : 'bg-slate-950 border-slate-700 text-slate-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    feedback.type === 'error' ? 'text-rose-400' : 'text-amber-400'
                  }`}
                />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            {!snap.isVip ? (
              <>
                <button
                  type="button"
                  onClick={handleSubscribe}
                  disabled={snap.isLoading}
                  className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 disabled:opacity-60 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform duration-150 active:scale-[0.99]"
                >
                  {snap.isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>
                        {lang === 'ar' ? 'جاري الاتصال بـ Google Play...' : 'Connecting to Google Play...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Crown className="w-5 h-5" />
                      <span>{lang === 'ar' ? 'اشترك الآن' : 'Subscribe Now'}</span>
                    </>
                  )}
                </button>

                {/* Browser Preview Sandbox Test Action (only visible outside Google Play Android runtime) */}
                {showPlayNotice && snap.provider === 'web_preview' && (
                  <button
                    type="button"
                    onClick={handleSandboxTestUnlock}
                    disabled={snap.isLoading}
                    className="w-full min-h-[44px] py-2.5 px-5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <LockOpen className="w-4 h-4" />
                    <span>
                      {lang === 'ar'
                        ? 'تفعيل تجريبي للاختبار في المتصفح (حفظ في Firebase وفتح المايك والكاميرا)'
                        : 'Test Sandbox Activation (Save to Firebase & Unlock Mic/Cam)'}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleRestore}
                  disabled={snap.isLoading}
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm transition-colors"
                >
                  {lang === 'ar' ? 'استعادة اشتراك سابق' : 'Restore Previous Subscription'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="w-full min-h-[48px] py-3 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm sm:text-base transition-colors"
              >
                {lang === 'ar' ? 'متابعة اللعب بمزايا VIP' : 'Continue Playing with VIP'}
              </button>
            )}
          </div>

          {/* Google Play Billing Compliance Footer */}
          <p className="text-[11px] text-slate-500 leading-relaxed text-center">
            {lang === 'ar'
              ? 'يتم الدفع وإدارة الاشتراك الشهري (vip_monthly) بأمان عبر حساب Google Play الخاص بك، ويمكنك الإلغاء في أي وقت من إعدادات متجر Google Play.'
              : 'Monthly subscription (vip_monthly) is securely billed via your Google Play account and can be canceled anytime in Google Play Store settings.'}
          </p>
        </div>
      </div>
    </div>
  );
};
