package com.expensify.reactnativehybridapp

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import android.util.Log

@ReactModule(name = ReactNativeHybridAppModule.NAME)
class ReactNativeHybridAppModule(reactContext: ReactApplicationContext) :
  NativeReactNativeHybridAppSpec(reactContext) {

  override fun getName(): String {
    return NAME
  }

  override fun isHybridApp(): Boolean {
    return false
  }

  override fun closeReactNativeApp(shouldSignOut: Boolean, shouldSetNVP: Boolean) {
    Log.d("ReactNativeHybridAppModule", "`closeReactNativeApp` should never be called in standalone `New Expensify` app")
  }

  override fun completeOnboarding(status: Boolean) {
    Log.d("ReactNativeHybridAppModule", "`completeOnboarding` should never be called in standalone `New Expensify` app")
  }

  override fun switchAccount(
    newDotCurrentAccountEmail: String?,
    authToken: String?,
    policyID: String?,
    accountID: String?
  ) {
    Log.d("ReactNativeHybridAppModule", "`switchAccount` should never be called in standalone `New Expensify` app")
  }

  companion object {
    const val NAME = "ReactNativeHybridAppModule"
  }
}
