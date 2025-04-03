package com.expensify.reactnativehybridapp

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import android.util.Log

@ReactModule(name = NativeReactNativeHybridAppSpec.NAME)
class ReactNativeHybridApp(reactContext: ReactApplicationContext) :
  NativeReactNativeHybridAppSpec(reactContext) {

  override fun isHybridApp(): Boolean {
    return false
  }

  override fun closeReactNativeApp(shouldSignOut: Boolean, shouldSetNVP: Boolean) {
    Log.d(NAME, "`closeReactNativeApp` should never be called in standalone `New Expensify` app")
  }

  override fun completeOnboarding(status: Boolean) {
    Log.d(NAME, "`completeOnboarding` should never be called in standalone `New Expensify` app")
  }

  override fun switchAccount(
    newDotCurrentAccountEmail: String?,
    authToken: String?,
    policyID: String?,
    accountID: String?
  ) {
    Log.d(NAME, "`switchAccount` should never be called in standalone `New Expensify` app")
  }

  override fun sendAuthToken(authToken: String?) {
    Log.d(NAME, "`sendAuthToken` should never be called in standalone `New Expensify` app")
  }
}
