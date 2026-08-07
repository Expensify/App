package com.margelo.nitro.utils

import android.content.Context
import com.margelo.nitro.NitroModules
import androidx.core.content.edit
import org.json.JSONObject

class HybridAppStartTimeModule : HybridAppStartTimeModuleSpec() {
    override val memorySize: Long = 16L

    fun recordAppStartTime() {
        val context = NitroModules.applicationContext ?: return
        val sharedPreferences = context.getSharedPreferences("AppStartTime", Context.MODE_PRIVATE)
        sharedPreferences.edit { putLong("AppStartTime", System.currentTimeMillis()) }
    }

    override val appStartTime: Double
        get() {
            val context = NitroModules.applicationContext ?: return 0.0
            val sharedPreferences = context.getSharedPreferences("AppStartTime", Context.MODE_PRIVATE)
            return sharedPreferences.getLong("AppStartTime", 0L).toDouble()
        }

    override val appStartupMarkers: String
        get() {
            val context = NitroModules.applicationContext ?: return "{}"
            val sharedPreferences = context.getSharedPreferences("AppStartupMarkers", Context.MODE_PRIVATE)
            val markers = JSONObject()
            for ((name, timestamp) in sharedPreferences.all) {
                if (timestamp is Long) {
                    markers.put(name, timestamp)
                }
            }
            return markers.toString()
        }
}
