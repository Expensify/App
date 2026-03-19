package com.margelo.nitro.utils

import android.content.Context
import com.margelo.nitro.NitroModules

class HybridAppStartTimeModule : HybridAppStartTimeModuleSpec() {
    override val memorySize: Long = 16L

    override fun recordAppStartTime() {
        val context = NitroModules.applicationContext ?: return
        val sharedPreferences = context.getSharedPreferences("AppStartTime", Context.MODE_PRIVATE)
        sharedPreferences.edit().putLong("AppStartTime", System.currentTimeMillis()).apply()
    }

    override val appStartTime: Double
        get() {
            val context = NitroModules.applicationContext ?: return 0.0
            val sharedPreferences = context.getSharedPreferences("AppStartTime", Context.MODE_PRIVATE)
            return sharedPreferences.getLong("AppStartTime", 0L).toDouble()
        }
}
