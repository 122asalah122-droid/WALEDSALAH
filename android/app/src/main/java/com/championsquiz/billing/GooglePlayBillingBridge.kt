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
import org.json.JSONArray
import org.json.JSONObject

/**
 * Official Google Play Billing Library v7 bridge for Champions Challenge WebView.
 * Supports all 3 VIP subscription SKUs: vip_monthly, vip_3months, vip_yearly.
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
        const val VIP_3MONTHS_PRODUCT_ID = "vip_3months"
        const val VIP_YEARLY_PRODUCT_ID = "vip_yearly"

        val SUPPORTED_VIP_SKUS = listOf(
            VIP_MONTHLY_PRODUCT_ID,
            VIP_3MONTHS_PRODUCT_ID,
            VIP_YEARLY_PRODUCT_ID
        )
    }

    private val cachedProductDetailsMap = mutableMapOf<String, ProductDetails>()

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
                    queryAllVipProductDetails()
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
    fun getAllProductDetails() {
        connect {
            queryAllVipProductDetails()
        }
    }

    @JavascriptInterface
    fun getProductDetails(productId: String) {
        if (productId !in SUPPORTED_VIP_SKUS) return
        connect {
            queryAllVipProductDetails()
        }
    }

    @JavascriptInterface
    fun purchaseSubscription(productId: String) {
        if (productId !in SUPPORTED_VIP_SKUS) {
            dispatchToWeb("purchaseError", JSONObject().apply {
                put("productId", productId)
                put("code", "INVALID_PRODUCT_ID")
                put("message", "Unsupported subscription product ID")
            })
            return
        }

        connect {
            val details = cachedProductDetailsMap[productId]
            if (details != null) {
                launchSubscriptionFlow(details)
            } else {
                queryAllVipProductDetails {
                    val loaded = cachedProductDetailsMap[productId]
                    if (loaded != null) {
                        launchSubscriptionFlow(loaded)
                    } else {
                        dispatchToWeb("purchaseError", JSONObject().apply {
                            put("productId", productId)
                            put("code", "PRODUCT_NOT_FOUND")
                            put("message", "Subscription $productId was not found in Google Play Console")
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
                    purchase.purchaseState == Purchase.PurchaseState.PURCHASED &&
                        purchase.products.any { it in SUPPORTED_VIP_SKUS }
                }

                if (vipPurchase != null) {
                    val matchedSku = vipPurchase.products.firstOrNull { it in SUPPORTED_VIP_SKUS }
                        ?: VIP_MONTHLY_PRODUCT_ID
                    acknowledgeAndNotify(vipPurchase, matchedSku, isRestore = true)
                } else {
                    dispatchToWeb("restoreResult", JSONObject().apply {
                        put("active", false)
                    })
                }
            }
        }
    }

    private fun queryAllVipProductDetails(onComplete: (() -> Unit)? = null) {
        val productList = SUPPORTED_VIP_SKUS.map { sku ->
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId(sku)
                .setProductType(BillingClient.ProductType.SUBS)
                .build()
        }

        val params = QueryProductDetailsParams.newBuilder()
            .setProductList(productList)
            .build()

        billingClient.queryProductDetailsAsync(params) { billingResult, productDetailsList ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                val itemsArray = JSONArray()
                productDetailsList.forEach { details ->
                    if (details.productId in SUPPORTED_VIP_SKUS) {
                        cachedProductDetailsMap[details.productId] = details
                        val offer = details.subscriptionOfferDetails?.firstOrNull()
                        val pricingPhase = offer?.pricingPhases?.pricingPhaseList?.firstOrNull()
                        val itemJson = JSONObject().apply {
                            put("productId", details.productId)
                            put("title", details.name)
                            put("description", details.description)
                            put("formattedPrice", pricingPhase?.formattedPrice ?: "")
                            put("currencyCode", pricingPhase?.priceCurrencyCode ?: "")
                            put("billingPeriod", pricingPhase?.billingPeriod ?: "P1M")
                        }
                        itemsArray.put(itemJson)
                        dispatchToWeb("productDetails", itemJson)
                    }
                }
                if (itemsArray.length() > 0) {
                    dispatchToWeb("productsDetails", JSONObject().apply {
                        put("items", itemsArray)
                    })
                }
            }
            onComplete?.invoke()
        }
    }

    private fun launchSubscriptionFlow(productDetails: ProductDetails) {
        val offerToken = productDetails.subscriptionOfferDetails?.firstOrNull()?.offerToken
        if (offerToken.isNullOrBlank()) {
            dispatchToWeb("purchaseError", JSONObject().apply {
                put("productId", productDetails.productId)
                put("code", "NO_OFFER_TOKEN")
                put("message", "No active base plan offer found for ${productDetails.productId}")
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
                val vipPurchase = purchases?.firstOrNull { purchase ->
                    purchase.products.any { it in SUPPORTED_VIP_SKUS }
                }
                if (vipPurchase != null) {
                    val matchedSku = vipPurchase.products.firstOrNull { it in SUPPORTED_VIP_SKUS }
                        ?: VIP_MONTHLY_PRODUCT_ID
                    if (vipPurchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
                        acknowledgeAndNotify(vipPurchase, matchedSku, isRestore = false)
                    } else if (vipPurchase.purchaseState == Purchase.PurchaseState.PENDING) {
                        dispatchToWeb("purchasePending", JSONObject().apply {
                            put("productId", matchedSku)
                            put("message", "Payment is pending confirmation from Google Play")
                        })
                    }
                }
            }

            BillingClient.BillingResponseCode.USER_CANCELED -> {
                dispatchToWeb("purchaseCanceled", JSONObject())
            }

            BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED -> {
                restorePurchases()
            }

            else -> {
                dispatchToWeb("purchaseError", JSONObject().apply {
                    put("code", billingResult.responseCode.toString())
                    put("message", billingResult.debugMessage)
                })
            }
        }
    }

    private fun acknowledgeAndNotify(purchase: Purchase, matchedSku: String, isRestore: Boolean) {
        val sendSuccess = {
            dispatchToWeb(if (isRestore) "restoreResult" else "purchaseSuccess", JSONObject().apply {
                put("active", true)
                put("productId", matchedSku)
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
                    put("productId", matchedSku)
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
