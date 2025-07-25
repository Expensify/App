package com.expensify.reactnativehybridapp

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import android.util.Log
import com.facebook.react.bridge.Promise

@ReactModule(name = NativeReactNativeHybridAppSpec.NAME)
class ReactNativeHybridApp(reactContext: ReactApplicationContext) :
  NativeReactNativeHybridAppSpec(reactContext) {

  override fun isHybridApp(): Boolean {
    return false
  }

  override fun shouldUseStaging(isStaging: Boolean) {
    Log.d(NAME, "`shouldUseStaging` should never be called in standalone `New Expensify` app")
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

  override fun getHybridAppSettings(promise: Promise) {
    Log.d(NAME, "`getHybridAppSettings` should never be called in standalone `New Expensify` app")
    promise.reject("NOT_IMPLEMENTED", "getHybridAppSettings is not implemented in standalone New Expensify app")
  }

  override fun getInitialURL(promise: Promise) {
    Log.d(NAME, "`getInitialURL` should never be called in standalone `New Expensify` app")
    promise.reject("NOT_IMPLEMENTED", "getInitialURL is not implemented in standalone New Expensify app")
  }

  override fun onURLListenerAdded() {
    Log.d(NAME, "`onURLListenerAdded` should never be called in standalone `New Expensify` app")
  }
}
