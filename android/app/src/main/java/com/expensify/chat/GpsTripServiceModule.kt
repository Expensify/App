package com.expensify.chat

import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class GpsTripServiceModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "GpsTripServiceModule"

    @ReactMethod
    fun startService(title: String, body: String, deepLink: String) {
        val context = reactApplicationContext
        val intent = Intent(context, GpsTripService::class.java).apply {
            putExtra(GpsTripService.EXTRA_TITLE, title)
            putExtra(GpsTripService.EXTRA_BODY, body)
            putExtra(GpsTripService.EXTRA_DEEP_LINK, deepLink)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent)
        } else {
            context.startService(intent)
        }
    }

    @ReactMethod
    fun stopService() {
        val context = reactApplicationContext
        context.stopService(Intent(context, GpsTripService::class.java))
    }
}
