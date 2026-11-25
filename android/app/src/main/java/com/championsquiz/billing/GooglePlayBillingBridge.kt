package com.championsquiz.billing

import android.app.Activity
import android.webkit.JavascriptInterface
import android.webkit.WebView
import com.android.billingclient.api.AcknowledgePurchaseParams
import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingFlowParams
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.PendingPurchasesParams
import com.android.billingclient.api.ProductDetails
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.PurchasesUpdatedListener
import com.android.billingclient.api.QueryProductDetailsParams
import com.android.billingclient.api.QueryPurchasesParams
import org.json.JSONObject

/**
 * Official Google Play Billing Library v7 bridge for the Champions Challenge WebView.
 *
 * Attach in MainActivity.kt:
 *   val billingBridge = GooglePlayBillingBridge(this, webView)
 *   webView.addJavascriptInterface(billingBridge, "AndroidPlayBilling")
 *   billingBridge.connect()
 */
class GooglePlayBillingBridge(
    private val activity: Activity,
    private val webView: WebView
) : PurchasesUpdatedListener {

    companion object {
        const val VIP_MONTHLY_PRODUCT_ID = "vip_monthly"
    }

    private var cachedProductDetails: ProductDetails? = null

    private val billingClient: BillingClient = BillingClient.newBuilder(activity)
        .setListener(this)
        .enablePendingPurchases(
            PendingPurchasesParams.newBuilder()
                .enableOneTimeProducts()
                .enablePrepaidPlans()
                .build()
        )
        .build()

    fun connect(onConnected: (() -> Unit)? = null) {
        if (billingClient.isReady) {
            onConnected?.invoke()
            return
        }
        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {
                if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                    queryVipProductDetails()
                    restorePurchases()
                    onConnected?.invoke()
                }
            }

            override fun onBillingServiceDisconnected() {
                // Google Play Billing service disconnected; next call will reconnect cleanly
            }
        })
    }

    fun destroy() {
        if (billingClient.isReady) {
            billingClient.endConnection()
        }
    }

    @JavascriptInterface
    fun isBillingAvailable(): Boolean = true

    @JavascriptInterface
    fun getProductDetails(productId: String) {
        val targetId = if (productId == VIP_MONTHLY_PRODUCT_ID) productId else VIP_MONTHLY_PRODUCT_ID
        connect {
            queryVipProductDetails(targetId)
        }
    }

    @JavascriptInterface
    fun purchaseSubscription(productId: String) {
        if (productId != VIP_MONTHLY_PRODUCT_ID) {
            dispatchToWeb("purchaseError", JSONObject().apply {
                put("productId", productId)
                put("code", "INVALID_PRODUCT_ID")
                put("message", "Unsupported subscription product ID")
            })
            return
        }

        connect {
            val details = cachedProductDetails
            if (details != null) {
                launchSubscriptionFlow(details)
            } else {
                queryVipProductDetails(VIP_MONTHLY_PRODUCT_ID) { loaded ->
                    if (loaded != null) {
                        launchSubscriptionFlow(loaded)
                    } else {
                        dispatchToWeb("purchaseError", JSONObject().apply {
                            put("productId", VIP_MONTHLY_PRODUCT_ID)
                            put("code", "PRODUCT_NOT_FOUND")
                            put("message", "Subscription vip_monthly was not found in Google Play Console")
                        })
                    }
                }
            }
        }
    }

    @JavascriptInterface
    fun restorePurchases() {
        connect {
            val params = QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.SUBS)
                .build()

            billingClient.queryPurchasesAsync(params) { billingResult, purchases ->
                if (billingResult.responseCode != BillingClient.BillingResponseCode.OK) {
                    dispatchToWeb("restoreResult", JSONObject().apply {
                        put("active", false)
                        put("message", billingResult.debugMessage)
                    })
                    return@queryPurchasesAsync
                }

                val vipPurchase = purchases.firstOrNull { purchase ->
                    purchase.products.contains(VIP_MONTHLY_PRODUCT_ID) &&
                        purchase.purchaseState == Purchase.PurchaseState.PURCHASED
                }

                if (vipPurchase != null) {
                    acknowledgeAndNotify(vipPurchase, isRestore = true)
                } else {
                    dispatchToWeb("restoreResult", JSONObject().apply {
                        put("active", false)
                    })
                }
            }
        }
    }

    private fun queryVipProductDetails(
        productId: String = VIP_MONTHLY_PRODUCT_ID,
        callback: ((ProductDetails?) -> Unit)? = null
    ) {
        val productList = listOf(
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId(productId)
                .setProductType(BillingClient.ProductType.SUBS)
                .build()
        )

        val params = QueryProductDetailsParams.newBuilder()
            .setProductList(productList)
            .build()

        billingClient.queryProductDetailsAsync(params) { billingResult, productDetailsList ->
            val details = if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                productDetailsList.firstOrNull { it.productId == productId }
            } else {
                null
            }
            cachedProductDetails = details

            if (details != null) {
                val offer = details.subscriptionOfferDetails?.firstOrNull()
                val pricingPhase = offer?.pricingPhases?.pricingPhaseList?.firstOrNull()
                dispatchToWeb("productDetails", JSONObject().apply {
                    put("productId", details.productId)
                    put("title", details.name)
                    put("description", details.description)
                    put("formattedPrice", pricingPhase?.formattedPrice ?: "")
                    put("currencyCode", pricingPhase?.priceCurrencyCode ?: "")
                    put("billingPeriod", pricingPhase?.billingPeriod ?: "P1M")
                })
            }

            callback?.invoke(details)
        }
    }

    private fun launchSubscriptionFlow(productDetails: ProductDetails) {
        val offerToken = productDetails.subscriptionOfferDetails?.firstOrNull()?.offerToken
        if (offerToken.isNullOrBlank()) {
            dispatchToWeb("purchaseError", JSONObject().apply {
                put("productId", productDetails.productId)
                put("code", "NO_OFFER_TOKEN")
                put("message", "No active base plan offer found for vip_monthly")
            })
            return
        }

        val productDetailsParams = BillingFlowParams.ProductDetailsParams.newBuilder()
            .setProductDetails(productDetails)
            .setOfferToken(offerToken)
            .build()

        val billingFlowParams = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(listOf(productDetailsParams))
            .build()

        activity.runOnUiThread {
            val result = billingClient.launchBillingFlow(activity, billingFlowParams)
            if (result.responseCode != BillingClient.BillingResponseCode.OK) {
                dispatchToWeb("purchaseError", JSONObject().apply {
                    put("productId", productDetails.productId)
                    put("code", result.responseCode.toString())
                    put("message", result.debugMessage)
                })
            }
        }
    }

    override fun onPurchasesUpdated(
        billingResult: BillingResult,
        purchases: MutableList<Purchase>?
    ) {
        when (billingResult.responseCode) {
            BillingClient.BillingResponseCode.OK -> {
                val vipPurchase = purchases?.firstOrNull { it.products.contains(VIP_MONTHLY_PRODUCT_ID) }
                if (vipPurchase != null) {
                    if (vipPurchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
                        acknowledgeAndNotify(vipPurchase, isRestore = false)
                    } else if (vipPurchase.purchaseState == Purchase.PurchaseState.PENDING) {
                        dispatchToWeb("purchasePending", JSONObject().apply {
                            put("productId", VIP_MONTHLY_PRODUCT_ID)
                            put("message", "Payment is pending confirmation from Google Play")
                        })
                    }
                }
            }

            BillingClient.BillingResponseCode.USER_CANCELED -> {
                dispatchToWeb("purchaseCanceled", JSONObject().apply {
                    put("productId", VIP_MONTHLY_PRODUCT_ID)
                })
            }

            BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED -> {
                restorePurchases()
            }

            else -> {
                dispatchToWeb("purchaseError", JSONObject().apply {
                    put("productId", VIP_MONTHLY_PRODUCT_ID)
                    put("code", billingResult.responseCode.toString())
                    put("message", billingResult.debugMessage)
                })
            }
        }
    }

    private fun acknowledgeAndNotify(purchase: Purchase, isRestore: Boolean) {
        val sendSuccess = {
            dispatchToWeb(if (isRestore) "restoreResult" else "purchaseSuccess", JSONObject().apply {
                put("active", true)
                put("productId", VIP_MONTHLY_PRODUCT_ID)
                put("orderId", purchase.orderId ?: "")
                put("purchaseToken", purchase.purchaseToken)
                put("purchaseTime", purchase.purchaseTime)
                put("autoRenewing", purchase.isAutoRenewing)
                put("acknowledged", true)
            })
        }

        if (purchase.isAcknowledged) {
            sendSuccess()
            return
        }

        val ackParams = AcknowledgePurchaseParams.newBuilder()
            .setPurchaseToken(purchase.purchaseToken)
            .build()

        billingClient.acknowledgePurchase(ackParams) { ackResult ->
            if (ackResult.responseCode == BillingClient.BillingResponseCode.OK) {
                sendSuccess()
            } else {
                dispatchToWeb("purchaseError", JSONObject().apply {
                    put("productId", VIP_MONTHLY_PRODUCT_ID)
                    put("code", "ACKNOWLEDGE_FAILED")
                    put("message", ackResult.debugMessage)
                })
            }
        }
    }

    private fun dispatchToWeb(eventType: String, payload: JSONObject) {
        val envelope = JSONObject().apply {
            put("type", eventType)
            put("payload", payload)
        }
        val escapedJson = JSONObject.quote(envelope.toString())
        activity.runOnUiThread {
            webView.evaluateJavascript(
                "window.__onGooglePlayBillingEvent && window.__onGooglePlayBillingEvent(JSON.parse($escapedJson));",
                null
            )
        }
    }
}
