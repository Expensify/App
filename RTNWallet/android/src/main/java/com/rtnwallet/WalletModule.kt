package com.rtnwallet

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.turbomodule.core.interfaces.TurboModule

@ReactModule(name = WalletModule.NAME)
class WalletModule(reactContext: ReactApplicationContext) : NativeWalletSpec(reactContext), TurboModule {

    override fun createDigitalWallet(params: ReadableMap, promise: Promise) {
        try {
            val paramMap = params.toHashMap() as Map<String, Any>

            // Extract common parameters
            val appVersion = paramMap["appVersion"] as? String ?: throw Exception("appVersion is required")

            // Extract Android specific parameters
            val walletAccountID = paramMap["walletAccountID"] as? String
            val deviceID = paramMap["deviceID"] as? String

            // Call Android specific method in WalletManager with these parameters
            val result = WalletManager.createDigitalWalletForAndroid(appVersion, walletAccountID, deviceID)
            // Convert the result to a WritableMap and resolve the promise
            promise.resolve(convertMapToWritableMap(result))
        } catch (e: Exception) {
            promise.reject("CREATE_WALLET_ERROR", e.message)
        }
    }

    companion object {
        const val NAME = "RTNWallet"
    }

    // Helper function to convert Map to WritableMap
    private fun convertMapToWritableMap(map: Map<String, Any>): WritableMap {
        // Implementation...
    }
}
