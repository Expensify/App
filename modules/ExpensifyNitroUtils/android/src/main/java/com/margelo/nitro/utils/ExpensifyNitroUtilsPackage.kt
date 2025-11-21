package com.margelo.nitro.utils

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager
import com.margelo.nitro.utils.ExpensifyNitroUtilsOnLoad.Companion.initializeNative
import com.margelo.nitro.utils.views.HybridTtiMeasurementViewManager

class ExpensifyNitroUtilsPackage : BaseReactPackage() {
    override fun getModule(
        name: String,
        reactContext: ReactApplicationContext
    ): NativeModule? {
        return null
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider { HashMap() }
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        val viewManagers = ArrayList<ViewManager<*, *>>()
        viewManagers.add(HybridTtiMeasurementViewManager())
        return viewManagers
    }

    companion object {
        init {
            initializeNative()
        }
    }
}
