package com.rtnwallet

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class WalletPackage : TurboReactPackage() {
    override fun getModule(name: String?, reactContext: ReactApplicationContext): NativeModule? =
        if (name == WalletModule.NAME) {
            WalletModule(reactContext)
        } else {
            null
        }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider = ReactModuleInfoProvider {
        mapOf(
            WalletModule.NAME to ReactModuleInfo(
                WalletModule.NAME,
                WalletModule.NAME,
                false, // canOverrideExistingModule
                false, // needsEagerInit
                true,  // hasConstants
                false, // isCxxModule
                true   // isTurboModule
            )
        )
    }
}
