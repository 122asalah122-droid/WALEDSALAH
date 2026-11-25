import { ref, set, get, onValue, off } from 'firebase/database';
import { rtdb, sanitizeFirebaseKey } from './firebaseClient';

export const VIP_MONTHLY_SKU = 'vip_monthly' as const;

export type BillingProvider = 'android_play_billing' | 'twa_digital_goods' | 'web_preview';

export interface VipProductDetails {
  productId: string;
  title: string;
  description: string;
  formattedPrice: string;
  currencyCode: string;
  billingPeriod: string;
}

export interface VipSubscriptionRecord {
  isVip: boolean;
  productId: string;
  status: 'active' | 'inactive' | 'pending';
  micCameraUnlocked: boolean;
  adsDisabled: boolean;
  provider: BillingProvider | 'firebase_sync';
  orderId?: string | null;
  purchaseTokenHash?: string | null;
  purchasedAt?: number | null;
  expiresAt?: number | null;
  autoRenewing?: boolean;
  updatedAt: number;
}

export interface VipServiceSnapshot {
  playerId: string;
  isVip: boolean;
  micCameraUnlocked: boolean;
  adsDisabled: boolean;
  status: 'active' | 'inactive' | 'pending';
  productId: string;
  provider: BillingProvider;
  productDetails: VipProductDetails;
  orderId: string | null;
  purchasedAt: number | null;
  expiresAt: number | null;
  autoRenewing: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AndroidPlayBillingBridgeApi {
  isBillingAvailable?: () => boolean;
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
  type: 'productDetails' | 'purchaseSuccess' | 'purchaseCanceled' | 'purchasePending' | 'purchaseError' | 'restoreResult';
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

const STORAGE_VIP_KEY = 'millionaire_vip_status_v1';
const STORAGE_UID_KEY = 'millionaire_player_uid_v1';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const DEFAULT_PRODUCT_DETAILS: VipProductDetails = {
  productId: VIP_MONTHLY_SKU,
  title: 'عضوية VIP الشهرية',
  description: 'فتح الميكروفون والكاميرا بالكامل + إزالة الإعلانات نهائياً',
  formattedPrice: '$4.99',
  currencyCode: 'USD',
  billingPeriod: 'P1M',
};

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

/**
 * Computes a short non-reversible fingerprint of a Google Play purchase token so raw tokens
 * are not needlessly exposed in client-readable database listings.
 */
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
  private pendingPurchaseResolve: ((res: { success: boolean; canceled?: boolean; pending?: boolean; error?: string }) => void) | null = null;
  private pendingRestoreResolve: ((res: { restored: boolean; error?: string }) => void) | null = null;
  private digitalGoodsService: DigitalGoodsService | null = null;

  constructor() {
    this.playerId = getOrCreateStablePlayerId();
    const cached = this.loadCachedVip();
    const provider = this.detectProviderSync();

    this.state = {
      playerId: this.playerId,
      isVip: cached?.isVip === true,
      micCameraUnlocked: cached?.isVip === true,
      adsDisabled: cached?.isVip === true,
      status: cached?.isVip ? 'active' : 'inactive',
      productId: cached?.productId || VIP_MONTHLY_SKU,
      provider,
      productDetails: { ...DEFAULT_PRODUCT_DETAILS },
      orderId: cached?.orderId || null,
      purchasedAt: cached?.purchasedAt || null,
      expiresAt: cached?.expiresAt || null,
      autoRenewing: cached?.autoRenewing ?? false,
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

  private async initAsync(): Promise<void> {
    if (typeof window === 'undefined') return;

    // 1. Native Android Play Billing bridge
    if (window.AndroidPlayBilling?.purchaseSubscription) {
      this.state = { ...this.state, provider: 'android_play_billing' };
      try {
        window.AndroidPlayBilling.getProductDetails?.(VIP_MONTHLY_SKU);
      } catch {}
      this.emit();
    } else if (typeof window.getDigitalGoodsService === 'function') {
      // 2. Official Google Play Digital Goods API (Android TWA installed from Google Play)
      try {
        const svc = await window.getDigitalGoodsService('https://play.google.com/billing');
        if (svc) {
          this.digitalGoodsService = svc;
          this.state = { ...this.state, provider: 'twa_digital_goods' };
          const items = await svc.getDetails([VIP_MONTHLY_SKU]);
          const item = items.find((i) => i.itemId === VIP_MONTHLY_SKU);
          if (item) {
            const formattedPrice = item.price
              ? `${item.price.value} ${item.price.currency}`
              : DEFAULT_PRODUCT_DETAILS.formattedPrice;
            this.state = {
              ...this.state,
              productDetails: {
                productId: item.itemId,
                title: item.title || DEFAULT_PRODUCT_DETAILS.title,
                description: item.description || DEFAULT_PRODUCT_DETAILS.description,
                formattedPrice,
                currencyCode: item.price?.currency || 'USD',
                billingPeriod: item.subscriptionPeriod || 'P1M',
              },
            };
          }
          // Check active Play purchases automatically
          const existingPurchases = await svc.listPurchases();
          const activeVip = existingPurchases.find((p) => p.itemId === VIP_MONTHLY_SKU);
          if (activeVip) {
            await this.grantVipAndPersist({
              productId: VIP_MONTHLY_SKU,
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

    // 3. Subscribe to Firebase Realtime Database VIP record when online
    this.subscribeFirebaseVipRecord();
  }

  private registerAndroidBridgeCallback(): void {
    if (typeof window === 'undefined') return;
    window.__onGooglePlayBillingEvent = (event: GooglePlayEventEnvelope) => {
      if (!event || typeof event !== 'object') return;
      const payload = event.payload || {};

      switch (event.type) {
        case 'productDetails': {
          const productId = String(payload.productId || VIP_MONTHLY_SKU);
          if (productId !== VIP_MONTHLY_SKU) return;
          this.state = {
            ...this.state,
            provider: 'android_play_billing',
            productDetails: {
              productId,
              title: String(payload.title || DEFAULT_PRODUCT_DETAILS.title),
              description: String(payload.description || DEFAULT_PRODUCT_DETAILS.description),
              formattedPrice: String(payload.formattedPrice || DEFAULT_PRODUCT_DETAILS.formattedPrice),
              currencyCode: String(payload.currencyCode || DEFAULT_PRODUCT_DETAILS.currencyCode),
              billingPeriod: String(payload.billingPeriod || 'P1M'),
            },
          };
          this.emit();
          break;
        }

        case 'purchaseSuccess': {
          const productId = String(payload.productId || '');
          if (productId !== VIP_MONTHLY_SKU) return;
          void this.grantVipAndPersist({
            productId: VIP_MONTHLY_SKU,
            provider: 'android_play_billing',
            orderId: payload.orderId ? String(payload.orderId) : null,
            purchaseToken: payload.purchaseToken ? String(payload.purchaseToken) : '',
            purchasedAt: typeof payload.purchaseTime === 'number' ? payload.purchaseTime : Date.now(),
            autoRenewing: payload.autoRenewing !== false,
          }).then(() => {
            this.state = { ...this.state, isLoading: false, error: null };
            this.emit();
            this.pendingPurchaseResolve?.({ success: true });
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
          if (active && String(payload.productId || VIP_MONTHLY_SKU) === VIP_MONTHLY_SKU) {
            void this.grantVipAndPersist({
              productId: VIP_MONTHLY_SKU,
              provider: 'android_play_billing',
              orderId: payload.orderId ? String(payload.orderId) : null,
              purchaseToken: payload.purchaseToken ? String(payload.purchaseToken) : '',
              purchasedAt: typeof payload.purchaseTime === 'number' ? payload.purchaseTime : Date.now(),
              autoRenewing: payload.autoRenewing !== false,
            }).then(() => {
              this.state = { ...this.state, isLoading: false, error: null };
              this.emit();
              this.pendingRestoreResolve?.({ restored: true });
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
        const isActive =
          val.isVip === true &&
          val.productId === VIP_MONTHLY_SKU &&
          (typeof val.expiresAt !== 'number' || val.expiresAt > Date.now() || val.autoRenewing === true);

        if (isActive) {
          this.applyVipLocally({
            isVip: true,
            productId: VIP_MONTHLY_SKU,
            status: 'active',
            micCameraUnlocked: true,
            adsDisabled: true,
            provider: (val.provider as BillingProvider) || this.state.provider,
            orderId: val.orderId || null,
            purchaseTokenHash: val.purchaseTokenHash || null,
            purchasedAt: val.purchasedAt || Date.now(),
            expiresAt: val.expiresAt || Date.now() + THIRTY_DAYS_MS,
            autoRenewing: val.autoRenewing ?? true,
            updatedAt: val.updatedAt || Date.now(),
          });
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
      const raw = localStorage.getItem(STORAGE_VIP_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<VipSubscriptionRecord>;
      if (parsed && parsed.isVip === true && parsed.productId === VIP_MONTHLY_SKU) {
        if (typeof parsed.expiresAt === 'number' && parsed.expiresAt < Date.now() && !parsed.autoRenewing) {
          return null;
        }
        return {
          isVip: true,
          productId: VIP_MONTHLY_SKU,
          status: 'active',
          micCameraUnlocked: true,
          adsDisabled: true,
          provider: parsed.provider || 'firebase_sync',
          orderId: parsed.orderId || null,
          purchaseTokenHash: parsed.purchaseTokenHash || null,
          purchasedAt: parsed.purchasedAt || null,
          expiresAt: parsed.expiresAt || null,
          autoRenewing: parsed.autoRenewing ?? true,
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
    this.saveCachedVip(record);
    this.state = {
      ...this.state,
      isVip: record.isVip,
      micCameraUnlocked: record.isVip,
      adsDisabled: record.isVip,
      status: record.status,
      productId: record.productId,
      orderId: record.orderId || null,
      purchasedAt: record.purchasedAt || null,
      expiresAt: record.expiresAt || null,
      autoRenewing: record.autoRenewing ?? true,
      error: null,
    };
    this.syncNativeAdsBridge(record.isVip);
    this.emit();
  }

  private async grantVipAndPersist(params: {
    productId: string;
    provider: BillingProvider;
    orderId?: string | null;
    purchaseToken?: string;
    purchasedAt?: number;
    autoRenewing?: boolean;
  }): Promise<void> {
    const now = params.purchasedAt || Date.now();
    const tokenHash = params.purchaseToken ? await hashPurchaseToken(params.purchaseToken) : null;

    const record: VipSubscriptionRecord = {
      isVip: true,
      productId: VIP_MONTHLY_SKU,
      status: 'active',
      micCameraUnlocked: true,
      adsDisabled: true,
      provider: params.provider,
      orderId: params.orderId || null,
      purchaseTokenHash: tokenHash,
      purchasedAt: now,
      expiresAt: now + THIRTY_DAYS_MS,
      autoRenewing: params.autoRenewing ?? true,
      updatedAt: Date.now(),
    };

    // Update UI & localStorage immediately so Mic, Camera & Ad Removal unlock without delay
    this.applyVipLocally(record);

    // Persist VIP membership to Firebase Realtime Database: users/{playerId}/vip
    try {
      const vipRef = ref(rtdb, `users/${this.playerId}/vip`);
      await set(vipRef, {
        isVip: true,
        productId: VIP_MONTHLY_SKU,
        status: 'active',
        micCameraUnlocked: true,
        adsDisabled: true,
        provider: params.provider,
        orderId: record.orderId,
        purchaseTokenHash: record.purchaseTokenHash,
        purchasedAt: record.purchasedAt,
        expiresAt: record.expiresAt,
        autoRenewing: record.autoRenewing,
        updatedAt: record.updatedAt,
      });
    } catch {
      // Offline / restricted rules fallback: cached locally and will sync when connectivity returns
    }
  }

  public getSnapshot(): VipServiceSnapshot {
    return { ...this.state };
  }

  public isVipActive(): boolean {
    return this.state.isVip === true;
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
   * Starts the official Google Play Billing purchase flow for `vip_monthly`.
   * - Inside Android WebView with GooglePlayBillingBridge: launches BillingClient.launchBillingFlow.
   * - Inside Google Play TWA: launches W3C PaymentRequest with https://play.google.com/billing.
   * - In regular web browsers: returns a clear non-Play status so the UI can guide the user.
   */
  public async purchaseVipMonthly(): Promise<{
    success: boolean;
    canceled?: boolean;
    pending?: boolean;
    requiresPlayApp?: boolean;
    error?: string;
  }> {
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
          window.AndroidPlayBilling?.purchaseSubscription?.(VIP_MONTHLY_SKU);
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
        const paymentMethods: PaymentMethodData[] = [
          {
            supportedMethods: 'https://play.google.com/billing',
            data: { sku: VIP_MONTHLY_SKU },
          },
        ];
        const paymentDetails: PaymentDetailsInit = {
          total: {
            label: this.state.productDetails.title,
            amount: {
              currency: this.state.productDetails.currencyCode || 'USD',
              value: '4.99',
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
          productId: VIP_MONTHLY_SKU,
          provider: 'twa_digital_goods',
          orderId: details.orderId || null,
          purchaseToken,
          autoRenewing: true,
        });
        await response.complete('success');
        this.state = { ...this.state, isLoading: false, error: null };
        this.emit();
        return { success: true };
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
    this.state = {
      ...this.state,
      isLoading: false,
      error: null,
    };
    this.emit();
    return {
      success: false,
      requiresPlayApp: true,
    };
  }

  /**
   * Restores active vip_monthly subscription from Google Play Billing or Firebase RTDB.
   */
  public async restoreVipPurchases(): Promise<{ restored: boolean; error?: string }> {
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
        const vip = purchases.find((p) => p.itemId === VIP_MONTHLY_SKU);
        if (vip) {
          await this.grantVipAndPersist({
            productId: VIP_MONTHLY_SKU,
            provider: 'twa_digital_goods',
            purchaseToken: vip.purchaseToken,
            autoRenewing: true,
          });
          this.state = { ...this.state, isLoading: false, error: null };
          this.emit();
          return { restored: true };
        }
      } catch {}
    }

    // Fallback: Check Firebase Realtime Database for this player's existing VIP status
    try {
      const vipSnap = await get(ref(rtdb, `users/${this.playerId}/vip`));
      const val = vipSnap.val() as Partial<VipSubscriptionRecord> | null;
      if (val && val.isVip === true && val.productId === VIP_MONTHLY_SKU) {
        this.applyVipLocally({
          isVip: true,
          productId: VIP_MONTHLY_SKU,
          status: 'active',
          micCameraUnlocked: true,
          adsDisabled: true,
          provider: 'firebase_sync',
          orderId: val.orderId || null,
          purchaseTokenHash: val.purchaseTokenHash || null,
          purchasedAt: val.purchasedAt || Date.now(),
          expiresAt: val.expiresAt || Date.now() + THIRTY_DAYS_MS,
          autoRenewing: val.autoRenewing ?? true,
          updatedAt: val.updatedAt || Date.now(),
        });
        this.state = { ...this.state, isLoading: false, error: null };
        this.emit();
        return { restored: true };
      }
    } catch {}

    this.state = { ...this.state, isLoading: false };
    this.emit();
    return { restored: false };
  }

  /**
   * Sandbox test activation strictly for browser preview outside Google Play so developers can
   * test the full VIP database save, Mic/Camera unlock, and Ad removal flow before publishing.
   */
  public async activateSandboxPreviewVip(): Promise<boolean> {
    if (this.state.provider !== 'web_preview') return false;
    this.state = { ...this.state, isLoading: true, error: null };
    this.emit();

    await this.grantVipAndPersist({
      productId: VIP_MONTHLY_SKU,
      provider: 'web_preview',
      orderId: `PLAY.TEST.${Date.now().toString(36).toUpperCase()}`,
      purchaseToken: `sandbox_vip_monthly_${this.playerId}_${Date.now()}`,
      autoRenewing: true,
    });

    this.state = { ...this.state, isLoading: false, error: null };
    this.emit();
    return true;
  }
}

export const vipBillingService = new VipBillingService();
