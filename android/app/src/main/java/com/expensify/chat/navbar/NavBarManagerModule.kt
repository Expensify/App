package com.expensify.chat.navbar

import android.content.res.Resources
import androidx.core.view.WindowInsetsControllerCompat
import com.expensify.chat.R
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil

class NavBarManagerModule(
    private val mReactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(mReactContext) {
    override fun getName(): String = "RNNavBarManager"

    @ReactMethod
    fun setButtonStyle(style: String) {
        UiThreadUtil.runOnUiThread {
            mReactContext.currentActivity?.window?.let {
                WindowInsetsControllerCompat(it, it.decorView).let { controller ->
                    when (style) {
                        "light" -> controller.isAppearanceLightNavigationBars = false
                        "dark" -> controller.isAppearanceLightNavigationBars = true
                    }
                }
            }
        }
    }

    @ReactMethod
    fun getType(): String {
        val resources = mReactContext.resources
        val resourceId = resources.getIdentifier("config_navBarInteractionMode", "integer", "android");
        if (resourceId > 0) {
            val navBarInteractionMode = resources.getInteger(resourceId)
            when (navBarInteractionMode) {
                0, 1 -> return "soft-keys"
                2 -> return "gesture-bar"
            }
        }
        return "soft-keys";
    }
}
