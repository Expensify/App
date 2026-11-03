package com.margelo.nitro.utils

import android.content.Context
import com.margelo.nitro.NitroModules
import androidx.core.content.edit

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

    override val appStartupMarkers: Map<String, Double>
        get() {
            val context = NitroModules.applicationContext ?: return emptyMap()
            val sharedPreferences = context.getSharedPreferences("AppStartupMarkers", Context.MODE_PRIVATE)
            return sharedPreferences.all.entries
                .mapNotNull { (name, timestamp) -> (timestamp as? Long)?.let { name to it.toDouble() } }
                .toMap()
        }
}
