package com.rtnwallet

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.rtnwallet.NativeWalletSpec

class WalletModule(reactContext: ReactApplicationContext) : NativeWalletSpec(reactContext) {
  override fun getName() = NAME

  override fun add(a: Double, b: Double, promise: Promise) {
    promise.resolve(a + b)
  }

  companion object {
    const val NAME = "RTNWallet"
  }
}
