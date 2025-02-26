package com.expensify.reactnativehybridapp

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = ReactNativeHybridAppModule.NAME)
class ReactNativeHybridAppModule(reactContext: ReactApplicationContext) :
  NativeReactNativeHybridAppSpec(reactContext) {

  override fun getName(): String {
    return NAME
  }

  override fun isHybridApp(): Boolean {
    return false
  }

  override fun closeReactNativeApp(shouldSignOut: Boolean, shouldSetNVP: Boolean) {}

  override fun completeOnboarding(status: Boolean) {}

  override fun switchAccount(
    newDotCurrentAccountEmail: String?,
    authToken: String?,
    policyID: String?,
    accountID: String?
  ) {}

  companion object {
    const val NAME = "ReactNativeHybridAppModule"
  }
}
