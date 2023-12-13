package com.rtnwallet

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.turbomodule.core.interfaces.TurboModule
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.tapandpay.TapAndPay
import com.google.android.gms.tapandpay.TapAndPayClient
import com.google.android.gms.tapandpay.TapAndPayStatusCodes
import com.google.android.gms.tapandpay.issuer.PushTokenizeRequest
import com.google.android.gms.tapandpay.issuer.UserAddress
import kotlinx.coroutines.*


@ReactModule(name = WalletModule.NAME)
class WalletModule(reactContext: ReactApplicationContext) : NativeWalletSpec(reactContext), TurboModule {
    private class WalletCreationItem(val model: Map<String, Any>) {
        object Keys {
            const val tokenServiceProvider = "tokenServiceProvider"
            const val network = "network"
            const val opaquePaymentCard = "opaquePaymentCard"
            const val displayName = "displayName"
            const val lastDigits = "lastDigits"
            const val name = "name"
            const val phone = "phone"
            const val userAddress = "userAddress"
            const val address1 = "address1"
            const val address2 = "address2"
            const val city = "city"
            const val state = "state"
            const val country = "country"
            const val postal_code = "postal_code"
        }

        private val addressData: Map<String, Any>
            get() = model[Keys.userAddress] as? Map<String, Any> ?: HashMap()

        val tokenServiceProvider: Int
            get() = when ((model[Keys.tokenServiceProvider] as? String ?: "").toUpperCase()) {
                "TOKEN_PROVIDER_AMEX" -> TapAndPay.TOKEN_PROVIDER_AMEX
                "TOKEN_PROVIDER_MASTERCARD" -> TapAndPay.TOKEN_PROVIDER_MASTERCARD
                "TOKEN_PROVIDER_VISA" -> TapAndPay.TOKEN_PROVIDER_VISA
                "TOKEN_PROVIDER_DISCOVER" -> TapAndPay.TOKEN_PROVIDER_DISCOVER
                else -> 1000
            }

        val network: Int
            get() = when ((model[Keys.network] as? String ?: "").toUpperCase()) {
                "AMEX" -> TapAndPay.CARD_NETWORK_AMEX
                "DISCOVER" -> TapAndPay.CARD_NETWORK_DISCOVER
                "MASTERCARD" -> TapAndPay.CARD_NETWORK_MASTERCARD
                "VISA" -> TapAndPay.CARD_NETWORK_VISA
                else -> 1000
            }

        val opcBytes: ByteArray
            get() = (model[Keys.opaquePaymentCard] as? String ?: "").toByteArray()

        val displayName: String
            get() = model[Keys.displayName] as? String ?: ""

        val lastDigits: String
            get() = model[Keys.lastDigits] as? String ?: ""

        val userAddress: UserAddress
            get() = UserAddress.newBuilder()
                .setName(addressData[Keys.name] as? String ?: "")
                .setAddress1(addressData[Keys.address1] as? String ?: "")
                .setAddress2(addressData[Keys.address2] as? String ?: "")
                .setLocality(addressData[Keys.city] as? String ?: "")
                .setAdministrativeArea(addressData[Keys.state] as? String ?: "")
                .setCountryCode(addressData[Keys.country] as? String ?: "")
                .setPostalCode(addressData[Keys.postal_code] as? String ?: "")
                .setPhoneNumber(addressData[Keys.phone] as? String ?: "")
                .build()
    }

    private val tapAndPayClient: TapAndPayClient by lazy {
        TapAndPay.getClient(reactContext.currentActivity ?: throw Exception("Current Activity not found"))
    }

    private val coroutineScope = CoroutineScope(Dispatchers.Main + Job())

    override fun getDeviceDetails(promise: Promise) {
        coroutineScope.launch {
            try {
                val walletID = async(Dispatchers.IO) { getWalletID() }
                val hardwareID = async(Dispatchers.IO) { getHardwareID() }
                val result = WritableNativeMap().apply {
                    putString("walletID", walletID.await())
                    putString("hardwareID", hardwareID.await())
                }
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("DEVICE_DETAILS_ERROR", "Failed to retrieve device details", e)
            }
        }
    }


    override fun handleWalletCreationResponse(data: ReadableMap, promise: Promise) {
        try {
            val context = reactContext.currentActivity ?: throw Exception("Current Activity not found")
            val walletCreationItem = WalletCreationItem(data)
            val pushTokenizeRequest = PushTokenizeRequest.Builder()
                    .setOpaquePaymentCard(walletCreationItem.opcBytes)
                    .setNetwork(walletCreationItem.network)
                    .setTokenServiceProvider(walletCreationItem.tokenServiceProvider)
                    .setDisplayName(walletCreationItem.displayName)
                    .setLastDigits(walletCreationItem.lastDigits)
                    .setUserAddress(walletCreationItem.userAddress)
                    .build()
            tapAndPayClient.pushTokenize(context, pushTokenizeRequest, requestPushTokenize)
            
            // Assuming success handling here. Adjust according to actual process
            promise.resolve(null) 
        } catch (e: Exception) {
            promise.reject("WALLET_CREATION_ERROR", "Failed to add card to Google Pay", e)
        }
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
