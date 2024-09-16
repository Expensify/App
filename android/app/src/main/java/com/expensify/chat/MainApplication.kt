package com.expensify.chat

import com.facebook.react.common.assets.ReactFontManager

import android.app.ActivityManager
import android.content.res.Configuration
import android.database.CursorWindow
import android.os.Process
import androidx.multidex.MultiDexApplication
import com.expensify.chat.bootsplash.BootSplashPackage
import com.expensify.chat.shortcutManagerModule.ShortcutManagerPackage
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.modules.i18nmanager.I18nUtil
import com.facebook.soloader.SoLoader
import com.google.firebase.crashlytics.FirebaseCrashlytics
import com.oblador.performance.RNPerformance
import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ReactNativeHostWrapper

class MainApplication : MultiDexApplication(), ReactApplication {
    override val reactNativeHost: ReactNativeHost = ReactNativeHostWrapper(this, object : DefaultReactNativeHost(this) {
        override fun getUseDeveloperSupport() = BuildConfig.DEBUG

        override fun getPackages(): List<ReactPackage>  = 
            PackageList(this).packages.apply {
            // Packages that cannot be autolinked yet can be added manually here, for example:
            // add(MyReactNativePackage());
            add(ShortcutManagerPackage())
            add(BootSplashPackage())
            add(ExpensifyAppPackage())
            add(RNTextInputResetPackage())
        }

        override fun getJSMainModuleName() = ".expo/.virtual-metro-entry"

        override val isNewArchEnabled: Boolean
            get() = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean
            get() = BuildConfig.IS_HERMES_ENABLED
    })

    override fun onCreate() {
        super.onCreate()
        ReactFontManager.getInstance().addCustomFont(this, "Expensify New Kansas", R.font.expensify_new_kansas)
        ReactFontManager.getInstance().addCustomFont(this, "Expensify Neue", R.font.expensify_neue)
        ReactFontManager.getInstance().addCustomFont(this, "Expensify Mono", R.font.expensify_mono)

        RNPerformance.getInstance().mark("appCreationStart", false);

        if (isOnfidoProcess()) {
            return
        }

        SoLoader.init(this,  /* native exopackage */false)
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            // If you opted-in for the New Architecture, we load the native entry point for this app.
            load(bridgelessEnabled = false)
        }
        if (BuildConfig.DEBUG) {
            FirebaseCrashlytics.getInstance().setCrashlyticsCollectionEnabled(false)
        }

        // Force the app to LTR mode.
        val sharedI18nUtilInstance = I18nUtil.instance
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
        ApplicationLifecycleDispatcher.onApplicationCreate(this);
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
    }

    private fun isOnfidoProcess(): Boolean {
        val pid = Process.myPid()
        val manager = this.getSystemService(ACTIVITY_SERVICE) as ActivityManager

        return manager.runningAppProcesses.any {
            it.pid == pid && it.processName.endsWith(":onfido_process")
        }
    }
}
