package com.expensify.chat

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil

import com.expensify.chat.MainActivity

/**
 * Checks whether the app was relaunched from the app icon in app drawer, not from recent apps.
 */
class AppStateTrackerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(
    reactContext
) {
    override fun getName(): String = "AppStateTracker"

    @ReactMethod
    fun getWasAppRelaunchedFromIcon(promise: Promise) {
        val activity = reactApplicationContext.getCurrentActivity()
        if (activity is MainActivity) {
            promise.resolve(activity.wasAppRelaunchedFromIcon)
            activity.wasAppRelaunchedFromIcon = false
        } else {
            promise.resolve(false)
        }
    }

    /**
     * Tells Android that NewDot finished its first screen, which records time to full display for this launch.
     */
    @ReactMethod
    fun reportFullyDrawn() {
        UiThreadUtil.runOnUiThread {
            reactApplicationContext.getCurrentActivity()?.reportFullyDrawn()
        }
    }
}
