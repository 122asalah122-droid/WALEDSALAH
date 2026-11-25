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
  Clock,
} from 'lucide-react';
import { Language } from '../types/game';
import {
  vipBillingService,
  VipServiceSnapshot,
  VipPlanSku,
  VIP_3MONTHS_SKU,
  VIDEO_QUOTA_LIMIT_MINUTES,
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
  const [selectedSku, setSelectedSku] = useState<VipPlanSku>(VIP_3MONTHS_SKU);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  useEffect(() => {
    return vipBillingService.subscribe(setSnap);
  }, []);

  useEffect(() => {
    if (isOpen) {
      vipBillingService.ensureQuotaCycleFresh();
    } else {
      setFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedPlan = snap.plans.find((p) => p.sku === selectedSku) || snap.plans[0];
  const activePlan = snap.plans.find((p) => p.sku === snap.productId) || snap.plans[0];

  const getDisplayPrice = (plan: typeof selectedPlan) => {
    if (plan.livePrice) return plan.livePrice;
    return lang === 'ar' ? plan.fallbackPriceAr : plan.fallbackPriceEn;
  };

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
    sounds.playSelectAnswer();

    const result = await vipBillingService.purchaseVipPlan(selectedSku);

    if (result.success) {
      celebrateVipSuccess();
      setFeedback({
        type: 'success',
        text:
          lang === 'ar'
            ? `تم تفعيل عضوية VIP (${selectedPlan.titleAr}) وحفظ isVIP: true في Firebase! تم فتح المايك بدون حدود، الكاميرا (120 دقيقة شهرياً)، وإلغاء الإعلانات.`
            : `VIP Membership (${selectedPlan.titleEn}) activated and saved to Firebase! Unlimited voice mic, 120 min/mo camera, and Ad-Free mode are now unlocked.`,
      });
      onVipActivated?.();
      return;
    }

    if (result.canceled) {
      setFeedback({
        type: 'info',
        text: lang === 'ar' ? 'تم إلغاء عملية الشراء من قِبلك.' : 'Purchase was canceled.',
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
      setFeedback({
        type: 'info',
        text:
          lang === 'ar'
            ? 'الدفع يتم حصرياً عبر متجر Google Play (Google Play Billing) داخل تطبيق الأندرويد المثبّت من المتجر.'
            : 'Payments are processed exclusively via Google Play Billing inside the Android app installed from Google Play.',
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
            ? `تم استعادة اشتراكك (${res.sku || snap.productId}) وتفعيل جميع مزايا VIP!`
            : `Your subscription (${res.sku || snap.productId}) has been restored with all VIP perks unlocked!`,
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

  const formattedExpiry = snap.expiresAt
    ? new Date(snap.expiresAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  const formattedQuotaReset = new Date(snap.videoQuotaResetAt).toLocaleDateString(
    lang === 'ar' ? 'ar-EG' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  const quotaPct = Math.max(
    0,
    Math.min(100, Math.round((snap.videoRemainingSeconds / snap.videoLimitSeconds) * 100))
  );

  return (
    <div
      className="fixed inset-0 z-[95] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      role="dialog"
      aria-modal="true"
      aria-labelledby="vip-modal-title"
    >
      <div className="relative w-full max-w-xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
        {/* Top Header */}
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
                {lang === 'ar' ? 'اختر باقة عضوية VIP المناسبة لك' : 'Choose Your VIP Membership Plan'}
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

        {/* Scrollable Content */}
        <div className="px-5 sm:px-6 py-5 space-y-5 overflow-y-auto text-start">
          {/* Context notice */}
          {!snap.isVip && reason === 'mic_camera' && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/35 text-xs sm:text-sm text-amber-200 leading-relaxed">
              {lang === 'ar'
                ? 'تشغيل الميكروفون والكاميرا المباشرة متاح لأعضاء VIP. اختر باقتك واشترك الآن لفتحهما فوراً.'
                : 'Live Microphone & Camera require VIP Membership. Pick a plan below to unlock immediately.'}
            </div>
          )}

          {!snap.isVip && reason === 'remove_ads' && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/35 text-xs sm:text-sm text-amber-200 leading-relaxed">
              {lang === 'ar'
                ? 'ألغِ الإعلانات نهائياً وافتح المايك بدون حدود والكاميرا (120 دقيقة شهرياً) باشتراك VIP.'
                : 'Remove all ads permanently and unlock Unlimited Mic + 120 min/mo Camera with VIP.'}
            </div>
          )}

          {/* Active VIP Summary + Monthly 120-Minute Camera Quota Tracker */}
          {snap.isVip ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/35 border border-emerald-500/40 space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-emerald-300 font-black text-base">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{lang === 'ar' ? 'عضويتك VIP مفعّلة بنجاح' : 'VIP Membership Active'}</span>
                </div>
                <span className="text-xs font-mono text-amber-300 font-bold">
                  {activePlan.sku}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
                <span>{lang === 'ar' ? activePlan.titleAr : activePlan.titleEn}</span>
                {formattedExpiry && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {lang === 'ar' ? `صالح حتى: ${formattedExpiry}` : `Valid until: ${formattedExpiry}`}
                    </span>
                  </>
                )}
              </div>

              {/* Monthly 120-Minute Camera Quota Meter */}
              <div className="pt-3 border-t border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {lang === 'ar' ? 'رصيد الكاميرا الشهري (مكالمات الفيديو):' : 'Monthly Camera Allowance:'}
                    </span>
                  </span>
                  <span
                    className={`font-mono font-black tabular-nums ${
                      snap.videoQuotaExhausted ? 'text-rose-400' : 'text-amber-300'
                    }`}
                  >
                    {lang === 'ar'
                      ? `${snap.videoRemainingMinutes} / ${VIDEO_QUOTA_LIMIT_MINUTES} دقيقة`
                      : `${snap.videoRemainingMinutes} / ${VIDEO_QUOTA_LIMIT_MINUTES} min`}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      snap.videoQuotaExhausted
                        ? 'bg-rose-500'
                        : quotaPct <= 20
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${quotaPct}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-1">
                  <span>
                    {lang === 'ar'
                      ? 'المايك الصوتي والدردشة مفتوحان بدون حدود'
                      : 'Voice Mic & Chat are unlimited'}
                  </span>
                  <span className="tabular-nums">
                    {lang === 'ar'
                      ? `يتجدد تلقائياً: ${formattedQuotaReset}`
                      : `Auto-renews: ${formattedQuotaReset}`}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* 3 Subscription Plans Selector (Full One-Time Payment per Plan) */
            <div className="space-y-2.5" role="radiogroup" aria-label={lang === 'ar' ? 'باقات الاشتراك' : 'Subscription Plans'}>
              {snap.plans.map((plan) => {
                const isSelected = selectedSku === plan.sku;
                const priceLabel = getDisplayPrice(plan);
                const periodLabel = lang === 'ar' ? plan.periodLabelAr : plan.periodLabelEn;
                return (
                  <button
                    key={plan.sku}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => {
                      sounds.playSelectAnswer();
                      setSelectedSku(plan.sku);
                    }}
                    className={`w-full min-h-[68px] p-4 rounded-2xl border text-start transition-colors flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400 ring-1 ring-amber-400/60'
                        : 'bg-slate-950/85 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-amber-400 bg-amber-400' : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <span className="w-2 h-2 rounded-full bg-slate-950" />}
                      </span>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="text-sm sm:text-base font-black text-slate-100">
                            {lang === 'ar' ? plan.titleAr : plan.titleEn}
                          </span>
                          {plan.bestValue && (
                            <span className="text-xs font-bold text-emerald-400">
                              · {lang === 'ar' ? 'الأكثر توفيراً' : 'Best Value'}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          SKU: {plan.sku}
                          {plan.livePrice
                            ? lang === 'ar'
                              ? ' · سعر Google Play المباشر'
                              : ' · Live Google Play Price'
                            : ''}
                        </div>
                      </div>
                    </div>

                    <div className="text-end shrink-0">
                      <div className="text-lg sm:text-xl font-black text-amber-300 font-mono tabular-nums whitespace-nowrap">
                        {priceLabel}
                      </div>
                      <div className="text-[11px] text-slate-400 whitespace-nowrap">
                        {periodLabel}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Core VIP Benefits List */}
          <div className="divide-y divide-slate-800/90 border-y border-slate-800/90">
            <div className="py-3 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Mic className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-slate-100">
                  {lang === 'ar' ? 'المايك الصوتي والدردشة بدون حدود' : 'Unlimited Voice Mic & Chat'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'ar'
                    ? 'تحدث ودردش بحرية تامة بلا حد أقصى في التحدي الثنائي وتحدي 4 لاعبين والغرف الخاصة.'
                    : 'Talk and chat without any time cap across 1v1 duels, 4-player arenas, and private rooms.'}
                </p>
              </div>
            </div>

            <div className="py-3 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Video className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-slate-100">
                  {lang === 'ar'
                    ? 'الكاميرا ومكالمات الفيديو (120 دقيقة شهرياً)'
                    : 'Camera & Video Calls (120 min / month)'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'ar'
                    ? 'رصيد شهري 120 دقيقة (ساعتين) لمكالمات الفيديو يُحفظ في Firebase ويتجدد تلقائياً كل 30 يوماً.'
                    : 'Monthly 120-minute (2-hour) video call allowance tracked in Firebase and auto-renewed every 30 days.'}
                </p>
              </div>
            </div>

            <div className="py-3 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <ShieldOff className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-slate-100">
                  {lang === 'ar' ? 'إلغاء الإعلانات نهائياً' : '100% Ad-Free Experience'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'ar'
                    ? 'إزالة كافة البنرات والإعلانات داخل التطبيق لتجربة لعب متواصلة بدون أي مقاطعة.'
                    : 'Removes all banner and in-app ads across every game mode.'}
                </p>
              </div>
            </div>

            <div className="py-3 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-slate-100">
                  {lang === 'ar' ? 'تفعيل فوري ومزامنة مع Firebase' : 'Instant Activation & Firebase Sync'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'ar'
                    ? 'يتم حفظ حالة isVIP ورصيد دقائق الفيديو مباشرة في قاعدة البيانات مع استعادة تلقائية.'
                    : 'Saves isVIP status and remaining video minutes directly to Firebase with instant restore.'}
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
                      <span>
                        {lang === 'ar'
                          ? `اشترك الآن — ${getDisplayPrice(selectedPlan)} ${selectedPlan.periodLabelAr}`
                          : `Subscribe Now — ${getDisplayPrice(selectedPlan)} ${selectedPlan.periodLabelEn}`}
                      </span>
                    </>
                  )}
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

            {/* Always preserve Restore Previous Subscription button */}
            <button
              type="button"
              onClick={handleRestore}
              disabled={snap.isLoading}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm transition-colors"
            >
              {lang === 'ar' ? 'استعادة اشتراك سابق' : 'Restore Previous Subscription'}
            </button>
          </div>

          {/* Google Play Billing Payment Terms Footer */}
          <p className="text-[11px] text-slate-500 leading-relaxed text-center">
            {lang === 'ar'
              ? 'يتم الدفع وإدارة اشتراكات VIP (vip_monthly / vip_3months / vip_yearly) بأمان عبر حساب Google Play الخاص بك مع تجديد تلقائي يمكنك إلغاؤه في أي وقت من إعدادات متجر Google Play. رصيد الكاميرا (120 دقيقة شهرياً) يتجدد تلقائياً كل 30 يوماً، بينما يظل المايك الصوتي والدردشة بلا حدود.'
              : 'VIP subscriptions (vip_monthly / vip_3months / vip_yearly) are billed securely via your Google Play account and auto-renew unless canceled anytime in Google Play Store settings. Monthly camera allowance (120 min) auto-renews every 30 days while voice mic and chat stay unlimited.'}
          </p>
        </div>
      </div>
    </div>
  );
};
