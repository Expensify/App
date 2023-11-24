package com.expensify.chat

import android.database.CursorWindow
import androidx.appcompat.app.AppCompatDelegate
import androidx.multidex.MultiDexApplication
import com.expensify.chat.bootsplash.BootSplashPackage
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.modules.i18nmanager.I18nUtil
import com.facebook.soloader.SoLoader
import com.google.firebase.crashlytics.FirebaseCrashlytics

class MainApplication : MultiDexApplication(), ReactApplication {
    override val reactNativeHost: ReactNativeHost = object : DefaultReactNativeHost(this) {
        override fun getUseDeveloperSupport() = BuildConfig.DEBUG

        override fun getPackages(): List<ReactPackage> {
            val packages: MutableList<ReactPackage> = PackageList(this).packages
            // Packages that cannot be autolinked yet can be added manually here, for example:
            // packages.add(new MyReactNativePackage());
            packages.add(BootSplashPackage())
            packages.add(ExpensifyAppPackage())
            packages.add(RNTextInputResetPackage())
            return packages
        }

        override fun getJSMainModuleName() = "index"

        override val isNewArchEnabled: Boolean
            get() = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean
            get() = BuildConfig.IS_HERMES_ENABLED
    }

    override fun onCreate() {
        super.onCreate()

        // Use night (dark) mode so native UI defaults to dark theme.
        AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
        SoLoader.init(this,  /* native exopackage */false)
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            // If you opted-in for the New Architecture, we load the native entry point for this app.
            load()
        }
        if (BuildConfig.DEBUG) {
            FirebaseCrashlytics.getInstance().setCrashlyticsCollectionEnabled(false)
        }

        // Force the app to LTR mode.
        val sharedI18nUtilInstance = I18nUtil.getInstance()
        sharedI18nUtilInstance.allowRTL(applicationContext, false)

        // Start the "js_load" custom performance tracing metric. This timer is stopped by a native
        // module in the JS so we can measure total time starting in the native layer and ending in
        // the JS layer.
        StartupTimer.start()

        // Increase SQLite DB write size
        try {
            val field = CursorWindow::class.java.getDeclaredField("sCursorWindowSize")
            field.isAccessible = true
            field[null] = 100 * 1024 * 1024 //the 100MB is the new size
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}