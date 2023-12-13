package com.rtnwallet

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.turbomodule.core.interfaces.TurboModule
import com.rtnwallet.managers.WalletManager // Adjust with your actual manager

@ReactModule(name = WalletModule.NAME)
class WalletModule(reactContext: ReactApplicationContext) : NativeWalletSpec(reactContext), TurboModule {

    override fun getDeviceDetails(promise: Promise) {
        var walletIDError: Exception? = null
        var hardwareIDError: Exception? = null
        lateinit var walletID: String
        lateinit var hardwareID: String

        // Get Wallet ID
        getWalletID { id, error ->
            if (error != null) walletIDError = error
            else walletID = id ?: ""
        }

        // Get Hardware ID
        getHardwareID { id, error ->
            if (error != null) hardwareIDError = error
            else hardwareID = id ?: ""
        }

        // Check results and resolve/reject promise
        when {
            walletIDError != null -> promise.reject("WALLET_ID_ERROR", "Failed to retrieve Wallet ID", walletIDError)
            hardwareIDError != null -> promise.reject("HARDWARE_ID_ERROR", "Failed to retrieve Hardware ID", hardwareIDError)
            else -> {
                val result = WritableNativeMap().apply {
                    putString("walletID", walletID)
                    putString("hardwareID", hardwareID)
                }
                promise.resolve(result)
            }
        }
    }


    override fun handleWalletCreationResponse(data: ReadableMap, promise: Promise) {
        // Convert ReadableMap to Kotlin Map and handle the wallet creation response
        // ...

        promise.resolve(true) // Or handle with appropriate success/error response
    }

    private fun getWalletID(completion: (String?, Exception?) -> Unit) {
        tapAndPayClient.activewalletID.addOnCompleteListener { task ->
            if (task.isSuccessful && task.result != null) {
                completion(task.result, null)
            } else {
                completion(null, task.exception)
            }
        }
    }

    private fun getHardwareID(completion: (String?, Exception?) -> Unit) {
        tapAndPayClient.stablehardwareID.addOnCompleteListener { task ->
            if (task.isSuccessful && task.result != null) {
                completion(task.result, null)
            } else {
                completion(null, task.exception)
            }
        }
    }


    companion object {
        const val NAME = "RTNWallet"
    }
}
