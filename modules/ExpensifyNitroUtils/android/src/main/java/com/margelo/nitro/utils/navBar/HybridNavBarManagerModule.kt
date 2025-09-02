package com.margelo.nitro.utils

import androidx.core.view.WindowInsetsControllerCompat
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.bridge.ReactApplicationContext
import com.margelo.nitro.NitroModules

class HybridNavBarManagerModule : HybridNavBarManagerModuleSpec() {
    private val context = NitroModules.applicationContext!!

    override fun setButtonStyle(style: NavBarButtonStyle) {
        UiThreadUtil.runOnUiThread {
            context.currentActivity?.window?.let {
                WindowInsetsControllerCompat(it, it.decorView).let { controller ->
                    when (style) {
                        NavBarButtonStyle.LIGHT -> controller.isAppearanceLightNavigationBars = false
                        NavBarButtonStyle.DARK -> controller.isAppearanceLightNavigationBars = true
                    }
                }
            }
        }
    }

    override fun getType(): String {
        val currentActivity = context.currentActivity
        if (currentActivity == null) {
            return "soft-keys"
        }

        val resources = currentActivity.resources
        val resourceId = resources.getIdentifier("config_navBarInteractionMode", "integer", "android")
        if (resourceId > 0) {
            val navBarInteractionMode = resources.getInteger(resourceId)
            when (navBarInteractionMode) {
                0, 1 -> return "soft-keys"
                2 -> return "gesture-bar"
            }
        }
        return "soft-keys"
    }
}
