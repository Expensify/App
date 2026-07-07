package com.expensify.chat

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

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
}
