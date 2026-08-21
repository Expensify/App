package com.expensify.chat

import android.content.Context
import io.sentry.react.RNSentrySDK

/**
 * Initializes the Sentry native SDK before JS loads so native code (e.g. certificate pinning monitor
 * reports) can capture events reliably. Uses the same initialization path as @sentry/react-native
 * (RNSentrySDK) so JS Sentry.init() can attach with autoInitializeNativeSdk: false.
 */
object SentryNativeSDKManager {
    private var initialized = false

    private fun getConfigValue(key: String, fallback: String): String {
        return try {
            val value = BuildConfig::class.java.getField(key).get(null) as? String
            if (value.isNullOrEmpty()) fallback else value
        } catch (_: Exception) {
            fallback
        }
    }

    @JvmStatic
    fun initialize(context: Context) {
        if (initialized) {
            return
        }
        initialized = true

        val env = getConfigValue("ENVIRONMENT", "development")
        val enableOnDev = getConfigValue("ENABLE_SENTRY_ON_DEV", "false") == "true"
        if (env == "development" && !enableOnDev) {
            return
        }

        val dsn = getConfigValue(
            "SENTRY_DSN",
            "https://7b463fb4d4402d342d1166d929a62f4e@o4510228013121536.ingest.us.sentry.io/4510228107427840",
        )

        // RNSentrySDK.init() applies RNSentryStart.updateWithReactDefaults(), which ignores
        // JavascriptException on the native side so JS errors are not reported twice. Unlike iOS New
        // Architecture (C++ JSErrorE / ExceptionsManager.reportException), Android does not need a
        // beforeSend filter here - see getsentry/sentry-react-native#5529.
        try {
            RNSentrySDK.init(context) { options ->
                options.dsn = dsn
                options.environment = env
                options.release = "new.expensify@${BuildConfig.VERSION_NAME}"
                options.isDebug = env == "development"
            }
        } catch (e: Exception) {
            android.util.Log.w("SentryNativeSDKManager", "Failed to initialize Sentry: ${e.message}")
        }
    }
}
