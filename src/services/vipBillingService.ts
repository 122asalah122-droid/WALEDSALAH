import { ref, set, update, get, onValue, off } from 'firebase/database';
import { rtdb, sanitizeFirebaseKey } from './firebaseClient';

export const VIP_MONTHLY_SKU = 'vip_monthly' as const;
export const VIP_3MONTHS_SKU = 'vip_3months' as const;
export const VIP_YEARLY_SKU = 'vip_yearly' as const;

export type VipPlanSku = typeof VIP_MONTHLY_SKU | typeof VIP_3MONTHS_SKU | typeof VIP_YEARLY_SKU;

export const SUPPORTED_VIP_SKUS: readonly VipPlanSku[] = [
  VIP_MONTHLY_SKU,
  VIP_3MONTHS_SKU,
  VIP_YEARLY_SKU,
] as const;

export function isSupportedVipSku(sku: string): sku is VipPlanSku {
  return (SUPPORTED_VIP_SKUS as readonly string[]).includes(sku);
}

// Monthly Video/Camera Quota: 120 minutes (2 hours) per 30-day cycle to protect TURN/video bandwidth.
// Voice Microphone & Chat remain 100% unlimited for VIP subscribers.
export const VIDEO_QUOTA_LIMIT_MINUTES = 120;
export const VIDEO_QUOTA_LIMIT_SECONDS = VIDEO_QUOTA_LIMIT_MINUTES * 60; // 7,200 seconds
export const VIDEO_QUOTA_CYCLE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export type BillingProvider = 'android_play_billing' | 'twa_digital_goods' | 'web_preview';

export interface VipPlanOption {
  sku: VipPlanSku;
  titleAr: string;
  titleEn: string;
  periodLabelAr: string;
  periodLabelEn: string;
  fallbackPriceAr: string;
  fallbackPriceEn: string;
  fallbackNumericPrice: string;
  fallbackCurrency: string;
  durationDays: number;
  bestValue?: boolean;
  livePrice?: string | null;
  liveCurrency?: string | null;
}

export interface VideoQuotaRecord {
  limitSeconds: number;
  usedSeconds: number;
  cycleStartAt: number;
  cycleResetAt: number;
  updatedAt: number;
}

export interface VipSubscriptionRecord {
  isVIP: boolean;
  isVip: boolean;
  productId: VipPlanSku;
  status: 'active' | 'inactive' | 'pending';
  micCameraUnlocked: boolean;
  adsDisabled: boolean;
  provider: BillingProvider | 'firebase_sync';
  orderId?: string | null;
  purchaseTokenHash?: string | null;
  purchasedAt?: number | null;
  expiresAt?: number | null;
  autoRenewing?: boolean;
  videoQuota: VideoQuotaRecord;
  updatedAt: number;
}

export interface VipServiceSnapshot {
  playerId: string;
  isVip: boolean;
  isVIP: boolean;
  micCameraUnlocked: boolean;
  adsDisabled: boolean;
  status: 'active' | 'inactive' | 'pending';
  productId: VipPlanSku;
  provider: BillingProvider;
  plans: VipPlanOption[];
  orderId: string | null;
  purchasedAt: number | null;
  expiresAt: number | null;
  autoRenewing: boolean;
  // Monthly Camera Quota (120 min / 30 days)
  videoLimitSeconds: number;
  videoUsedSeconds: number;
  videoRemainingSeconds: number;
  videoRemainingMinutes: number;
  videoQuotaExhausted: boolean;
  videoQuotaCycleStartAt: number;
  videoQuotaResetAt: number;
  quotaAlertMessage: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AndroidPlayBillingBridgeApi {
  isBillingAvailable?: () => boolean;
  getAllProductDetails?: () => void;
  getProductDetails?: (productId: string) => void;
  purchaseSubscription?: (productId: string) => void;
  restorePurchases?: () => void;
}

interface AndroidAdsBridgeApi {
  setAdsDisabled?: (disabled: boolean) => void;
  hideBanner?: () => void;
  showBanner?: () => void;
}

interface DigitalGoodsItemDetails {
  itemId: string;
  title?: string;
  description?: string;
  price?: { currency: string; value: string };
  subscriptionPeriod?: string;
}

interface DigitalGoodsPurchaseDetails {
  itemId: string;
  purchaseToken: string;
}

interface DigitalGoodsService {
  getDetails: (itemIds: string[]) => Promise<DigitalGoodsItemDetails[]>;
  listPurchases: () => Promise<DigitalGoodsPurchaseDetails[]>;
}

interface GooglePlayEventEnvelope {
  type:
    | 'productDetails'
    | 'productsDetails'
    | 'purchaseSuccess'
    | 'purchaseCanceled'
    | 'purchasePending'
    | 'purchaseError'
    | 'restoreResult';
  payload?: Record<string, unknown>;
}

declare global {
  interface Window {
    AndroidPlayBilling?: AndroidPlayBillingBridgeApi;
    AndroidAds?: AndroidAdsBridgeApi;
    getDigitalGoodsService?: (serviceProvider: string) => Promise<DigitalGoodsService>;
    __onGooglePlayBillingEvent?: (event: GooglePlayEventEnvelope) => void;
  }
}

const STORAGE_VIP_KEY = 'millionaire_vip_status_v2';
const STORAGE_UID_KEY = 'millionaire_player_uid_v1';
const DAY_MS = 24 * 60 * 60 * 1000;

export const DEFAULT_VIP_PLANS: VipPlanOption[] = [
  {
    sku: VIP_MONTHLY_SKU,
    titleAr: 'الباقة الشهرية',
    titleEn: 'Monthly Plan',
    periodLabelAr: 'شهرياً',
    periodLabelEn: 'per month',
    fallbackPriceAr: '120 جنيه',
    fallbackPriceEn: '120 EGP',
    fallbackNumericPrice: '120',
    fallbackCurrency: 'EGP',
    durationDays: 30,
  },
  {
    sku: VIP_3MONTHS_SKU,
    titleAr: 'باقة 3 شهور',
    titleEn: '3-Month Plan',
    periodLabelAr: '3 شهور',
    periodLabelEn: '3 months',
    fallbackPriceAr: '290 جنيه',
    fallbackPriceEn: '290 EGP',
    fallbackNumericPrice: '290',
    fallbackCurrency: 'EGP',
    durationDays: 90,
    bestValue: true,
  },
  {
    sku: VIP_YEARLY_SKU,
    titleAr: 'الباقة السنوية',
    titleEn: 'Yearly Plan',
    periodLabelAr: 'سنوياً',
    periodLabelEn: 'per year',
    fallbackPriceAr: '750 جنيه',
    fallbackPriceEn: '750 EGP',
    fallbackNumericPrice: '750',
    fallbackCurrency: 'EGP',
    durationDays: 365,
  },
];

function createFreshVideoQuota(now = Date.now()): VideoQuotaRecord {
  return {
    limitSeconds: VIDEO_QUOTA_LIMIT_SECONDS,
    usedSeconds: 0,
    cycleStartAt: now,
    cycleResetAt: now + VIDEO_QUOTA_CYCLE_MS,
    updatedAt: now,
  };
}

function normalizeVideoQuota(raw?: Partial<VideoQuotaRecord> | null, now = Date.now()): VideoQuotaRecord {
  if (!raw || typeof raw !== 'object') {
    return createFreshVideoQuota(now);
  }
  const cycleStartAt =
    typeof raw.cycleStartAt === 'number' && Number.isFinite(raw.cycleStartAt) && raw.cycleStartAt > 0
      ? raw.cycleStartAt
      : now;
  const cycleResetAt =
    typeof raw.cycleResetAt === 'number' && Number.isFinite(raw.cycleResetAt) && raw.cycleResetAt > cycleStartAt
      ? raw.cycleResetAt
      : cycleStartAt + VIDEO_QUOTA_CYCLE_MS;

  // Automatic 30-day cycle renewal
  if (now >= cycleResetAt) {
    return createFreshVideoQuota(now);
  }

  const limitSeconds = VIDEO_QUOTA_LIMIT_SECONDS;
  const rawUsed = typeof raw.usedSeconds === 'number' && Number.isFinite(raw.usedSeconds) ? raw.usedSeconds : 0;
  const usedSeconds = Math.max(0, Math.min(limitSeconds, Math.floor(rawUsed)));

  return {
    limitSeconds,
    usedSeconds,
    cycleStartAt,
    cycleResetAt,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : now,
  };
}

function computeRemainingMinutes(remainingSeconds: number): number {
  if (remainingSeconds <= 0) return 0;
  return Math.ceil(remainingSeconds / 60);
}

function getPlanDurationMs(sku: VipPlanSku): number {
  const plan = DEFAULT_VIP_PLANS.find((p) => p.sku === sku);
  return (plan?.durationDays || 30) * DAY_MS;
}

function getOrCreateStablePlayerId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_UID_KEY);
    if (existing && existing.trim().length >= 6) {
      return sanitizeFirebaseKey(existing);
    }
    const generated = `plr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(STORAGE_UID_KEY, generated);
    return sanitizeFirebaseKey(generated);
  } catch {
    return sanitizeFirebaseKey(`plr_${Date.now().toString(36)}`);
  }
}

async function hashPurchaseToken(token: string): Promise<string> {
  const clean = String(token || '').trim();
  if (!clean) return '';
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
      const data = new TextEncoder().encode(clean);
      const digest = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(digest))
        .slice(0, 16)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch {
    // Fallback lightweight deterministic hash
  }
  let h = 2166136261;
  for (let i = 0; i < clean.length; i++) {
    h ^= clean.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `tok_${(h >>> 0).toString(16)}`;
}

class VipBillingService {
  private listeners = new Set<(snap: VipServiceSnapshot) => void>();
  private playerId: string;
  private state: VipServiceSnapshot;
  private firebaseUnsub: (() => void) | null = null;
  private pendingPurchaseResolve:
    | ((res: { success: boolean; sku?: VipPlanSku; canceled?: boolean; pending?: boolean; error?: string }) => void)
    | null = null;
  private pendingRestoreResolve: ((res: { restored: boolean; sku?: VipPlanSku; error?: string }) => void) | null = null;
  private digitalGoodsService: DigitalGoodsService | null = null;
  private lastQuotaFirebaseSyncAt = 0;

  constructor() {
    this.playerId = getOrCreateStablePlayerId();
    const cached = this.loadCachedVip();
    const provider = this.detectProviderSync();
    const quota = normalizeVideoQuota(cached?.videoQuota);
    const remainingSec = Math.max(0, quota.limitSeconds - quota.usedSeconds);

    this.state = {
      playerId: this.playerId,
      isVip: cached?.isVIP === true || cached?.isVip === true,
      isVIP: cached?.isVIP === true || cached?.isVip === true,
      micCameraUnlocked: cached?.isVIP === true || cached?.isVip === true,
      adsDisabled: cached?.isVIP === true || cached?.isVip === true,
      status: cached?.isVIP || cached?.isVip ? 'active' : 'inactive',
      productId: cached?.productId && isSupportedVipSku(cached.productId) ? cached.productId : VIP_MONTHLY_SKU,
      provider,
      plans: DEFAULT_VIP_PLANS.map((p) => ({ ...p })),
      orderId: cached?.orderId || null,
      purchasedAt: cached?.purchasedAt || null,
      expiresAt: cached?.expiresAt || null,
      autoRenewing: cached?.autoRenewing ?? false,
      videoLimitSeconds: quota.limitSeconds,
      videoUsedSeconds: quota.usedSeconds,
      videoRemainingSeconds: remainingSec,
      videoRemainingMinutes: computeRemainingMinutes(remainingSec),
      videoQuotaExhausted: remainingSec <= 0,
      videoQuotaCycleStartAt: quota.cycleStartAt,
      videoQuotaResetAt: quota.cycleResetAt,
      quotaAlertMessage: null,
      isLoading: false,
      error: null,
    };

    this.syncNativeAdsBridge(this.state.adsDisabled);
    this.registerAndroidBridgeCallback();
    void this.initAsync();
  }

  private detectProviderSync(): BillingProvider {
    if (typeof window !== 'undefined' && window.AndroidPlayBilling?.purchaseSubscription) {
      return 'android_play_billing';
    }
    return 'web_preview';
  }

  private applyLiveProductPrice(productId: string, formattedPrice?: string, currencyCode?: string): void {
    if (!isSupportedVipSku(productId) || !formattedPrice || !formattedPrice.trim()) return;
    const updatedPlans = this.state.plans.map((p) =>
      p.sku === productId
        ? {
            ...p,
            livePrice: formattedPrice.trim(),
            liveCurrency: currencyCode || p.liveCurrency || p.fallbackCurrency,
          }
        : p
    );
    this.state = { ...this.state, plans: updatedPlans };
  }

  private async initAsync(): Promise<void> {
    if (typeof window === 'undefined') return;

    // 1. Native Android Google Play Billing Library Bridge
    if (window.AndroidPlayBilling?.purchaseSubscription) {
      this.state = { ...this.state, provider: 'android_play_billing' };
      try {
        if (window.AndroidPlayBilling.getAllProductDetails) {
          window.AndroidPlayBilling.getAllProductDetails();
        } else {
          SUPPORTED_VIP_SKUS.forEach((sku) => window.AndroidPlayBilling?.getProductDetails?.(sku));
        }
      } catch {}
      this.emit();
    } else if (typeof window.getDigitalGoodsService === 'function') {
      // 2. Official Google Play Digital Goods API (Android TWA installed from Google Play)
      try {
        const svc = await window.getDigitalGoodsService('https://play.google.com/billing');
        if (svc) {
          this.digitalGoodsService = svc;
          this.state = { ...this.state, provider: 'twa_digital_goods' };
          const items = await svc.getDetails([...SUPPORTED_VIP_SKUS]);
          items.forEach((item) => {
            if (isSupportedVipSku(item.itemId) && item.price?.value) {
              const formatted = this.formatLocalizedCurrency(item.price.value, item.price.currency);
              this.applyLiveProductPrice(item.itemId, formatted, item.price.currency);
            }
          });
          // Automatically restore active Play subscription if found
          const existingPurchases = await svc.listPurchases();
          const activeVip = existingPurchases.find((p) => isSupportedVipSku(p.itemId));
          if (activeVip && isSupportedVipSku(activeVip.itemId)) {
            await this.grantVipAndPersist({
              productId: activeVip.itemId,
              provider: 'twa_digital_goods',
              purchaseToken: activeVip.purchaseToken,
              autoRenewing: true,
            });
          }
          this.emit();
        }
      } catch {
        // Digital Goods API not available in regular browser; keep web_preview
      }
    }

    // 3. Subscribe to Firebase Realtime Database VIP & Video Quota record when online
    this.subscribeFirebaseVipRecord();
  }

  private formatLocalizedCurrency(value: string, currency: string): string {
    const num = Number(value);
    if (Number.isFinite(num)) {
      try {
        return new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency,
          maximumFractionDigits: num % 1 === 0 ? 0 : 2,
        }).format(num);
      } catch {
        return `${value} ${currency}`;
      }
    }
    return `${value} ${currency}`;
  }

  private registerAndroidBridgeCallback(): void {
    if (typeof window === 'undefined') return;
    window.__onGooglePlayBillingEvent = (event: GooglePlayEventEnvelope) => {
      if (!event || typeof event !== 'object') return;
      const payload = event.payload || {};

      switch (event.type) {
        case 'productDetails': {
          const productId = String(payload.productId || '');
          const formattedPrice = String(payload.formattedPrice || '');
          const currencyCode = String(payload.currencyCode || '');
          if (isSupportedVipSku(productId) && formattedPrice) {
            this.state = { ...this.state, provider: 'android_play_billing' };
            this.applyLiveProductPrice(productId, formattedPrice, currencyCode);
            this.emit();
          }
          break;
        }

        case 'productsDetails': {
          const items = Array.isArray(payload.items) ? payload.items : [];
          this.state = { ...this.state, provider: 'android_play_billing' };
          items.forEach((rawItem) => {
            if (!rawItem || typeof rawItem !== 'object') return;
            const item = rawItem as Record<string, unknown>;
            const productId = String(item.productId || '');
            const formattedPrice = String(item.formattedPrice || '');
            const currencyCode = String(item.currencyCode || '');
            if (isSupportedVipSku(productId) && formattedPrice) {
              this.applyLiveProductPrice(productId, formattedPrice, currencyCode);
            }
          });
          this.emit();
          break;
        }

        case 'purchaseSuccess': {
          const productId = String(payload.productId || '');
          if (!isSupportedVipSku(productId)) return;
          void this.grantVipAndPersist({
            productId,
            provider: 'android_play_billing',
            orderId: payload.orderId ? String(payload.orderId) : null,
            purchaseToken: payload.purchaseToken ? String(payload.purchaseToken) : '',
            purchasedAt: typeof payload.purchaseTime === 'number' ? payload.purchaseTime : Date.now(),
            autoRenewing: payload.autoRenewing !== false,
          }).then(() => {
            this.state = { ...this.state, isLoading: false, error: null };
            this.emit();
            this.pendingPurchaseResolve?.({ success: true, sku: productId });
            this.pendingPurchaseResolve = null;
          });
          break;
        }

        case 'purchasePending': {
          this.state = {
            ...this.state,
            status: 'pending',
            isLoading: false,
            error: String(payload.message || 'الدفع قيد المراجعة من Google Play'),
          };
          this.emit();
          this.pendingPurchaseResolve?.({ success: false, pending: true });
          this.pendingPurchaseResolve = null;
          break;
        }

        case 'purchaseCanceled': {
          this.state = { ...this.state, isLoading: false, error: null };
          this.emit();
          this.pendingPurchaseResolve?.({ success: false, canceled: true });
          this.pendingPurchaseResolve = null;
          break;
        }

        case 'purchaseError': {
          const msg = String(payload.message || 'فشل إتمام عملية الدفع عبر Google Play');
          this.state = { ...this.state, isLoading: false, error: msg };
          this.emit();
          this.pendingPurchaseResolve?.({ success: false, error: msg });
          this.pendingPurchaseResolve = null;
          break;
        }

        case 'restoreResult': {
          const active = payload.active === true;
          const rawSku = String(payload.productId || VIP_MONTHLY_SKU);
          const matchedSku: VipPlanSku = isSupportedVipSku(rawSku) ? rawSku : VIP_MONTHLY_SKU;
          if (active) {
            void this.grantVipAndPersist({
              productId: matchedSku,
              provider: 'android_play_billing',
              orderId: payload.orderId ? String(payload.orderId) : null,
              purchaseToken: payload.purchaseToken ? String(payload.purchaseToken) : '',
              purchasedAt: typeof payload.purchaseTime === 'number' ? payload.purchaseTime : Date.now(),
              autoRenewing: payload.autoRenewing !== false,
            }).then(() => {
              this.state = { ...this.state, isLoading: false, error: null };
              this.emit();
              this.pendingRestoreResolve?.({ restored: true, sku: matchedSku });
              this.pendingRestoreResolve = null;
            });
          } else {
            this.state = { ...this.state, isLoading: false };
            this.emit();
            this.pendingRestoreResolve?.({ restored: false });
            this.pendingRestoreResolve = null;
          }
          break;
        }
      }
    };
  }

  private subscribeFirebaseVipRecord(): void {
    if (this.firebaseUnsub) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

    try {
      const vipRef = ref(rtdb, `users/${this.playerId}/vip`);
      const handler = (snap: { val: () => unknown }) => {
        const val = snap.val() as Partial<VipSubscriptionRecord> | null;
        if (!val || typeof val !== 'object') return;
        const vipFlag = val.isVIP === true || val.isVip === true;
        const sku: VipPlanSku =
          val.productId && isSupportedVipSku(val.productId) ? val.productId : VIP_MONTHLY_SKU;

        const isActive =
          vipFlag &&
          (typeof val.expiresAt !== 'number' || val.expiresAt > Date.now() || val.autoRenewing === true);

        if (isActive) {
          const remoteQuota = normalizeVideoQuota(val.videoQuota);
          // Preserve whichever usedSeconds is higher within the same active cycle to prevent local rollback
          const sameCycle = Math.abs(remoteQuota.cycleStartAt - this.state.videoQuotaCycleStartAt) < DAY_MS;
          const mergedUsed = sameCycle
            ? Math.max(remoteQuota.usedSeconds, this.state.videoUsedSeconds)
            : remoteQuota.usedSeconds;

          const mergedQuota: VideoQuotaRecord = {
            ...remoteQuota,
            usedSeconds: Math.min(VIDEO_QUOTA_LIMIT_SECONDS, mergedUsed),
          };

          this.applyVipLocally({
            isVIP: true,
            isVip: true,
            productId: sku,
            status: 'active',
            micCameraUnlocked: true,
            adsDisabled: true,
            provider: (val.provider as BillingProvider) || this.state.provider,
            orderId: val.orderId || null,
            purchaseTokenHash: val.purchaseTokenHash || null,
            purchasedAt: val.purchasedAt || Date.now(),
            expiresAt: val.expiresAt || Date.now() + getPlanDurationMs(sku),
            autoRenewing: val.autoRenewing ?? true,
            videoQuota: mergedQuota,
            updatedAt: val.updatedAt || Date.now(),
          });

          // If the remote cycle expired and got auto-renewed, persist the fresh 120-min cycle back to Firebase
          if (val.videoQuota?.cycleResetAt && Date.now() >= val.videoQuota.cycleResetAt) {
            void this.persistVideoQuotaToFirebase(mergedQuota);
          }
        }
      };

      onValue(vipRef, handler, () => {
        // Ignore offline/rules errors silently; local cache stays intact
      });

      this.firebaseUnsub = () => {
        try {
          off(vipRef, 'value', handler);
        } catch {}
      };
    } catch {
      // Safe no-op if offline
    }
  }

  private loadCachedVip(): VipSubscriptionRecord | null {
    try {
      const raw = localStorage.getItem(STORAGE_VIP_KEY) || localStorage.getItem('millionaire_vip_status_v1');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<VipSubscriptionRecord>;
      const vipFlag = parsed && (parsed.isVIP === true || parsed.isVip === true);
      if (vipFlag) {
        if (typeof parsed.expiresAt === 'number' && parsed.expiresAt < Date.now() && !parsed.autoRenewing) {
          return null;
        }
        const sku: VipPlanSku =
          parsed.productId && isSupportedVipSku(parsed.productId) ? parsed.productId : VIP_MONTHLY_SKU;
        return {
          isVIP: true,
          isVip: true,
          productId: sku,
          status: 'active',
          micCameraUnlocked: true,
          adsDisabled: true,
          provider: parsed.provider || 'firebase_sync',
          orderId: parsed.orderId || null,
          purchaseTokenHash: parsed.purchaseTokenHash || null,
          purchasedAt: parsed.purchasedAt || null,
          expiresAt: parsed.expiresAt || null,
          autoRenewing: parsed.autoRenewing ?? true,
          videoQuota: normalizeVideoQuota(parsed.videoQuota),
          updatedAt: parsed.updatedAt || Date.now(),
        };
      }
    } catch {}
    return null;
  }

  private saveCachedVip(record: VipSubscriptionRecord): void {
    try {
      localStorage.setItem(STORAGE_VIP_KEY, JSON.stringify(record));
    } catch {}
  }

  private syncNativeAdsBridge(adsDisabled: boolean): void {
    if (typeof window === 'undefined') return;
    try {
      window.AndroidAds?.setAdsDisabled?.(adsDisabled);
      if (adsDisabled) {
        window.AndroidAds?.hideBanner?.();
      } else {
        window.AndroidAds?.showBanner?.();
      }
    } catch {}
  }

  private applyVipLocally(record: VipSubscriptionRecord): void {
    const quota = normalizeVideoQuota(record.videoQuota);
    const remainingSec = Math.max(0, quota.limitSeconds - quota.usedSeconds);
    const normalizedRecord: VipSubscriptionRecord = {
      ...record,
      isVIP: record.isVIP === true || record.isVip === true,
      isVip: record.isVIP === true || record.isVip === true,
      videoQuota: quota,
    };

    this.saveCachedVip(normalizedRecord);
    this.state = {
      ...this.state,
      isVip: normalizedRecord.isVip,
      isVIP: normalizedRecord.isVIP,
      micCameraUnlocked: normalizedRecord.isVip,
      adsDisabled: normalizedRecord.isVip,
      status: normalizedRecord.status,
      productId: normalizedRecord.productId,
      orderId: normalizedRecord.orderId || null,
      purchasedAt: normalizedRecord.purchasedAt || null,
      expiresAt: normalizedRecord.expiresAt || null,
      autoRenewing: normalizedRecord.autoRenewing ?? true,
      videoLimitSeconds: quota.limitSeconds,
      videoUsedSeconds: quota.usedSeconds,
      videoRemainingSeconds: remainingSec,
      videoRemainingMinutes: computeRemainingMinutes(remainingSec),
      videoQuotaExhausted: remainingSec <= 0,
      videoQuotaCycleStartAt: quota.cycleStartAt,
      videoQuotaResetAt: quota.cycleResetAt,
      error: null,
    };
    this.syncNativeAdsBridge(normalizedRecord.isVip);
    this.emit();
  }

  private async persistVideoQuotaToFirebase(quota: VideoQuotaRecord): Promise<void> {
    if (!this.state.isVip) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
    try {
      const vipRef = ref(rtdb, `users/${this.playerId}/vip`);
      await update(vipRef, {
        videoQuota: {
          limitSeconds: quota.limitSeconds,
          usedSeconds: quota.usedSeconds,
          remainingSeconds: Math.max(0, quota.limitSeconds - quota.usedSeconds),
          cycleStartAt: quota.cycleStartAt,
          cycleResetAt: quota.cycleResetAt,
          updatedAt: quota.updatedAt,
        },
        updatedAt: Date.now(),
      });
      this.lastQuotaFirebaseSyncAt = Date.now();
    } catch {
      // Safe offline fallback
    }
  }

  private async grantVipAndPersist(params: {
    productId: VipPlanSku;
    provider: BillingProvider;
    orderId?: string | null;
    purchaseToken?: string;
    purchasedAt?: number;
    autoRenewing?: boolean;
  }): Promise<void> {
    const now = params.purchasedAt || Date.now();
    const tokenHash = params.purchaseToken ? await hashPurchaseToken(params.purchaseToken) : null;

    // Preserve active 30-day video quota if player was already VIP in the current cycle; otherwise start fresh 120 mins
    const currentQuota: VideoQuotaRecord = this.state.isVip
      ? normalizeVideoQuota({
          limitSeconds: this.state.videoLimitSeconds,
          usedSeconds: this.state.videoUsedSeconds,
          cycleStartAt: this.state.videoQuotaCycleStartAt,
          cycleResetAt: this.state.videoQuotaResetAt,
          updatedAt: Date.now(),
        })
      : createFreshVideoQuota(now);

    const record: VipSubscriptionRecord = {
      isVIP: true,
      isVip: true,
      productId: params.productId,
      status: 'active',
      micCameraUnlocked: true,
      adsDisabled: true,
      provider: params.provider,
      orderId: params.orderId || null,
      purchaseTokenHash: tokenHash,
      purchasedAt: now,
      expiresAt: now + getPlanDurationMs(params.productId),
      autoRenewing: params.autoRenewing ?? true,
      videoQuota: currentQuota,
      updatedAt: Date.now(),
    };

    // Update UI & localStorage immediately so Mic, Camera & Ad Removal unlock without delay
    this.applyVipLocally(record);

    // Persist VIP membership (with isVIP: true + monthly 120-min videoQuota) to Firebase Realtime Database
    try {
      const vipRef = ref(rtdb, `users/${this.playerId}/vip`);
      await set(vipRef, {
        isVIP: true,
        isVip: true,
        productId: params.productId,
        status: 'active',
        micCameraUnlocked: true,
        adsDisabled: true,
        provider: params.provider,
        orderId: record.orderId,
        purchaseTokenHash: record.purchaseTokenHash,
        purchasedAt: record.purchasedAt,
        expiresAt: record.expiresAt,
        autoRenewing: record.autoRenewing,
        videoQuota: {
          limitSeconds: currentQuota.limitSeconds,
          usedSeconds: currentQuota.usedSeconds,
          remainingSeconds: Math.max(0, currentQuota.limitSeconds - currentQuota.usedSeconds),
          cycleStartAt: currentQuota.cycleStartAt,
          cycleResetAt: currentQuota.cycleResetAt,
          updatedAt: currentQuota.updatedAt,
        },
        updatedAt: record.updatedAt,
      });
      this.lastQuotaFirebaseSyncAt = Date.now();
    } catch {
      // Offline / restricted rules fallback: cached locally and will sync when connectivity returns
    }
  }

  public getSnapshot(): VipServiceSnapshot {
    return {
      ...this.state,
      plans: this.state.plans.map((p) => ({ ...p })),
    };
  }

  public isVipActive(): boolean {
    return this.state.isVip === true;
  }

  /**
   * Ensures the 30-day camera quota cycle automatically resets once 30 days have passed.
   */
  public ensureQuotaCycleFresh(): VideoQuotaRecord {
    const now = Date.now();
    const fresh = normalizeVideoQuota(
      {
        limitSeconds: this.state.videoLimitSeconds,
        usedSeconds: this.state.videoUsedSeconds,
        cycleStartAt: this.state.videoQuotaCycleStartAt,
        cycleResetAt: this.state.videoQuotaResetAt,
        updatedAt: now,
      },
      now
    );

    if (fresh.cycleStartAt !== this.state.videoQuotaCycleStartAt || fresh.usedSeconds !== this.state.videoUsedSeconds) {
      const remainingSec = Math.max(0, fresh.limitSeconds - fresh.usedSeconds);
      this.state = {
        ...this.state,
        videoLimitSeconds: fresh.limitSeconds,
        videoUsedSeconds: fresh.usedSeconds,
        videoRemainingSeconds: remainingSec,
        videoRemainingMinutes: computeRemainingMinutes(remainingSec),
        videoQuotaExhausted: remainingSec <= 0,
        videoQuotaCycleStartAt: fresh.cycleStartAt,
        videoQuotaResetAt: fresh.cycleResetAt,
      };
      if (this.state.isVip) {
        const cached = this.loadCachedVip();
        if (cached) {
          this.saveCachedVip({ ...cached, videoQuota: fresh, updatedAt: now });
        }
        void this.persistVideoQuotaToFirebase(fresh);
      }
      this.emit();
    }
    return fresh;
  }

  /**
   * Checks whether a VIP player still has monthly camera minutes left (voice mic & chat are always unlimited).
   */
  public canUseCamera(): boolean {
    if (!this.state.isVip) return false;
    const quota = this.ensureQuotaCycleFresh();
    return quota.limitSeconds - quota.usedSeconds > 0;
  }

  /**
   * Consumes active camera seconds (called while local video stream is active in a call).
   * Persists to localStorage immediately and syncs to Firebase every 10s (or immediately on flush/depletion).
   * Returns `{ exhausted, remainingSeconds }`.
   */
  public consumeVideoSeconds(
    deltaSeconds: number,
    options?: { flushToFirebase?: boolean; lang?: 'ar' | 'en' }
  ): { exhausted: boolean; remainingSeconds: number } {
    if (!this.state.isVip) {
      return { exhausted: true, remainingSeconds: 0 };
    }

    const baseQuota = this.ensureQuotaCycleFresh();
    const safeDelta = Math.max(0, Math.floor(deltaSeconds));
    const nextUsed = Math.min(VIDEO_QUOTA_LIMIT_SECONDS, baseQuota.usedSeconds + safeDelta);
    const remainingSec = Math.max(0, VIDEO_QUOTA_LIMIT_SECONDS - nextUsed);
    const now = Date.now();
    const exhausted = remainingSec <= 0;

    const updatedQuota: VideoQuotaRecord = {
      ...baseQuota,
      usedSeconds: nextUsed,
      updatedAt: now,
    };

    const lang = options?.lang || 'ar';
    const resetDateStr = new Date(updatedQuota.cycleResetAt).toLocaleDateString(
      lang === 'ar' ? 'ar-EG' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );

    const quotaAlertMessage = exhausted
      ? lang === 'ar'
        ? `انتهى رصيد الكاميرا الشهري (120 دقيقة). تم إغلاق الكاميرا تلقائياً مع استمرار المايك الصوتي والدردشة بلا حدود. سيتجدد رصيدك تلقائياً في ${resetDateStr}.`
        : `Your 120-minute monthly camera allowance has ended. Camera was turned off automatically while Voice Mic & Chat stay unlimited. Renews automatically on ${resetDateStr}.`
      : this.state.quotaAlertMessage;

    this.state = {
      ...this.state,
      videoLimitSeconds: updatedQuota.limitSeconds,
      videoUsedSeconds: updatedQuota.usedSeconds,
      videoRemainingSeconds: remainingSec,
      videoRemainingMinutes: computeRemainingMinutes(remainingSec),
      videoQuotaExhausted: exhausted,
      videoQuotaCycleStartAt: updatedQuota.cycleStartAt,
      videoQuotaResetAt: updatedQuota.cycleResetAt,
      quotaAlertMessage,
    };

    const cached = this.loadCachedVip();
    if (cached) {
      this.saveCachedVip({ ...cached, videoQuota: updatedQuota, updatedAt: now });
    }

    if (options?.flushToFirebase || exhausted || now - this.lastQuotaFirebaseSyncAt >= 10000) {
      void this.persistVideoQuotaToFirebase(updatedQuota);
    }

    this.emit();
    return { exhausted, remainingSeconds: remainingSec };
  }

  public setQuotaAlert(lang: 'ar' | 'en' = 'ar'): void {
    const quota = this.ensureQuotaCycleFresh();
    const resetDateStr = new Date(quota.cycleResetAt).toLocaleDateString(
      lang === 'ar' ? 'ar-EG' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );
    this.state = {
      ...this.state,
      quotaAlertMessage:
        lang === 'ar'
          ? `لقد استهلكت رصيد الكاميرا الشهري (120 دقيقة). المايك الصوتي والدردشة متاحان بدون حدود، وسيتجدد رصيد الكاميرا تلقائياً الشهر القادم (${resetDateStr}).`
          : `You have used your 120-minute monthly camera limit. Voice Mic & Chat remain unlimited, and camera minutes auto-renew next month (${resetDateStr}).`,
    };
    this.emit();
  }

  public clearQuotaAlert(): void {
    if (!this.state.quotaAlertMessage) return;
    this.state = { ...this.state, quotaAlertMessage: null };
    this.emit();
  }

  public subscribe(listener: (snap: VipServiceSnapshot) => void): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(): void {
    const snap = this.getSnapshot();
    this.listeners.forEach((fn) => {
      try {
        fn(snap);
      } catch {}
    });
  }

  /**
   * Starts the official Google Play Billing purchase flow for the selected VIP SKU
   * (`vip_monthly`, `vip_3months`, or `vip_yearly`).
   */
  public async purchaseVipPlan(sku: VipPlanSku = VIP_MONTHLY_SKU): Promise<{
    success: boolean;
    sku?: VipPlanSku;
    canceled?: boolean;
    pending?: boolean;
    requiresPlayApp?: boolean;
    error?: string;
  }> {
    if (!isSupportedVipSku(sku)) {
      return { success: false, error: 'Unsupported subscription plan.' };
    }

    this.state = { ...this.state, isLoading: true, error: null };
    this.emit();

    // Path 1: Official Android Google Play Billing Library Bridge (BillingClient v7)
    if (typeof window !== 'undefined' && window.AndroidPlayBilling?.purchaseSubscription) {
      return new Promise((resolve) => {
        const timeout = window.setTimeout(() => {
          if (this.pendingPurchaseResolve) {
            this.pendingPurchaseResolve = null;
            this.state = {
              ...this.state,
              isLoading: false,
              error: 'انتهت مهلة الاتصال بمتجر Google Play. يرجى المحاولة مرة أخرى.',
            };
            this.emit();
            resolve({ success: false, error: this.state.error || undefined });
          }
        }, 45000);

        this.pendingPurchaseResolve = (res) => {
          window.clearTimeout(timeout);
          resolve(res);
        };

        try {
          window.AndroidPlayBilling?.purchaseSubscription?.(sku);
        } catch (err) {
          window.clearTimeout(timeout);
          this.pendingPurchaseResolve = null;
          const msg = err instanceof Error ? err.message : 'Google Play Billing error';
          this.state = { ...this.state, isLoading: false, error: msg };
          this.emit();
          resolve({ success: false, error: msg });
        }
      });
    }

    // Path 2: Official Google Play TWA Digital Goods API + PaymentRequest
    if (this.digitalGoodsService && typeof window !== 'undefined' && typeof PaymentRequest !== 'undefined') {
      try {
        const selectedPlan = this.state.plans.find((p) => p.sku === sku) || DEFAULT_VIP_PLANS[0];
        const paymentMethods: PaymentMethodData[] = [
          {
            supportedMethods: 'https://play.google.com/billing',
            data: { sku },
          },
        ];
        const paymentDetails: PaymentDetailsInit = {
          total: {
            label: selectedPlan.titleAr,
            amount: {
              currency: selectedPlan.liveCurrency || selectedPlan.fallbackCurrency,
              value: selectedPlan.fallbackNumericPrice,
            },
          },
        };
        const request = new PaymentRequest(paymentMethods, paymentDetails);
        const response = await request.show();
        const details = (response.details || {}) as { purchaseToken?: string; orderId?: string };
        const purchaseToken = String(details.purchaseToken || '');
        if (!purchaseToken) {
          await response.complete('fail');
          throw new Error('لم يتم استلام رمز الشراء من Google Play.');
        }

        await this.grantVipAndPersist({
          productId: sku,
          provider: 'twa_digital_goods',
          orderId: details.orderId || null,
          purchaseToken,
          autoRenewing: true,
        });
        await response.complete('success');
        this.state = { ...this.state, isLoading: false, error: null };
        this.emit();
        return { success: true, sku };
      } catch (err) {
        const name = err instanceof Error ? err.name : '';
        if (name === 'AbortError') {
          this.state = { ...this.state, isLoading: false, error: null };
          this.emit();
          return { success: false, canceled: true };
        }
        const msg = err instanceof Error ? err.message : 'تعذر إتمام الدفع عبر Google Play';
        this.state = { ...this.state, isLoading: false, error: msg };
        this.emit();
        return { success: false, error: msg };
      }
    }

    // Path 3: Regular Web Browser outside Google Play
    this.state = { ...this.state, isLoading: false, error: null };
    this.emit();
    return { success: false, requiresPlayApp: true };
  }

  /**
   * Restores any active VIP subscription (vip_monthly / vip_3months / vip_yearly) from Google Play or Firebase.
   */
  public async restoreVipPurchases(): Promise<{ restored: boolean; sku?: VipPlanSku; error?: string }> {
    this.state = { ...this.state, isLoading: true, error: null };
    this.emit();

    if (typeof window !== 'undefined' && window.AndroidPlayBilling?.restorePurchases) {
      return new Promise((resolve) => {
        const timeout = window.setTimeout(() => {
          if (this.pendingRestoreResolve) {
            this.pendingRestoreResolve = null;
            this.state = { ...this.state, isLoading: false };
            this.emit();
            resolve({ restored: false });
          }
        }, 12000);

        this.pendingRestoreResolve = (res) => {
          window.clearTimeout(timeout);
          resolve(res);
        };

        try {
          window.AndroidPlayBilling?.restorePurchases?.();
        } catch {
          window.clearTimeout(timeout);
          this.pendingRestoreResolve = null;
          this.state = { ...this.state, isLoading: false };
          this.emit();
          resolve({ restored: false });
        }
      });
    }

    if (this.digitalGoodsService) {
      try {
        const purchases = await this.digitalGoodsService.listPurchases();
        const vip = purchases.find((p) => isSupportedVipSku(p.itemId));
        if (vip && isSupportedVipSku(vip.itemId)) {
          await this.grantVipAndPersist({
            productId: vip.itemId,
            provider: 'twa_digital_goods',
            purchaseToken: vip.purchaseToken,
            autoRenewing: true,
          });
          this.state = { ...this.state, isLoading: false, error: null };
          this.emit();
          return { restored: true, sku: vip.itemId };
        }
      } catch {}
    }

    // Fallback: Check Firebase Realtime Database for this player's existing VIP status
    try {
      const vipSnap = await get(ref(rtdb, `users/${this.playerId}/vip`));
      const val = vipSnap.val() as Partial<VipSubscriptionRecord> | null;
      const vipFlag = val && (val.isVIP === true || val.isVip === true);
      if (vipFlag) {
        const sku: VipPlanSku =
          val.productId && isSupportedVipSku(val.productId) ? val.productId : VIP_MONTHLY_SKU;
        this.applyVipLocally({
          isVIP: true,
          isVip: true,
          productId: sku,
          status: 'active',
          micCameraUnlocked: true,
          adsDisabled: true,
          provider: 'firebase_sync',
          orderId: val.orderId || null,
          purchaseTokenHash: val.purchaseTokenHash || null,
          purchasedAt: val.purchasedAt || Date.now(),
          expiresAt: val.expiresAt || Date.now() + getPlanDurationMs(sku),
          autoRenewing: val.autoRenewing ?? true,
          videoQuota: normalizeVideoQuota(val.videoQuota),
          updatedAt: val.updatedAt || Date.now(),
        });
        this.state = { ...this.state, isLoading: false, error: null };
        this.emit();
        return { restored: true, sku };
      }
    } catch {}

    this.state = { ...this.state, isLoading: false };
    this.emit();
    return { restored: false };
  }

  /**
   * Sandbox test activation strictly for browser preview outside Google Play.
   */
  public async activateSandboxPreviewVip(sku: VipPlanSku = VIP_3MONTHS_SKU): Promise<boolean> {
    if (this.state.provider !== 'web_preview' || !isSupportedVipSku(sku)) return false;
    this.state = { ...this.state, isLoading: true, error: null };
    this.emit();

    await this.grantVipAndPersist({
      productId: sku,
      provider: 'web_preview',
      orderId: `PLAY.TEST.${Date.now().toString(36).toUpperCase()}`,
      purchaseToken: `sandbox_${sku}_${this.playerId}_${Date.now()}`,
      autoRenewing: true,
    });

    this.state = { ...this.state, isLoading: false, error: null };
    this.emit();
    return true;
  }
}

export const vipBillingService = new VipBillingService();
