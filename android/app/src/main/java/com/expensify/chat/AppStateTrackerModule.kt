package com.expensify.chat

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

import com.expensify.chat.MainActivity


class AppStateTrackerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(
    reactContext
) {
    override fun getName(): String = "AppStateTracker"

    @ReactMethod
    fun getWasAppRelaunchedFromIcon(promise: Promise) {
        val activity = currentActivity;
        if (activity is MainActivity) {
            promise.resolve(activity.wasAppRelaunchedFromIcon);
            activity.wasAppRelaunchedFromIcon = false;
        } else {
            promise.resolve(false);
        }
    }
}
