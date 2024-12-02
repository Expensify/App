package com.expensify.chat.navbar

import androidx.core.view.WindowInsetsControllerCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil;

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
}
