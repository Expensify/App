package com.expensify.chat

import com.facebook.react.common.assets.ReactFontManager

import android.app.Activity
import android.app.ActivityManager
import android.app.Application
import android.content.pm.ActivityInfo
import android.content.res.Configuration
import android.database.CursorWindow
import android.os.Bundle
import android.os.Process
import android.view.View
import android.view.WindowManager
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.multidex.MultiDexApplication
import com.expensify.chat.bootsplash.BootSplashPackage
import com.expensify.chat.navbar.NavBarManagerPackage
import com.expensify.chat.shortcutManagerModule.ShortcutManagerPackage
import com.margelo.nitro.nitrofetch.AutoPrefetcher
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.modules.i18nmanager.I18nUtil
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader
import expo.modules.ApplicationLifecycleDispatcher
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative

class MainApplication : MultiDexApplication(), ReactApplication {
    override val reactHost: ReactHost by lazy {
        getDefaultReactHost(
            context = applicationContext,
            packageList =
                PackageList(this).packages.apply {
                    // Packages that cannot be autolinked yet can be added manually here, for example:
                    // add(MyReactNativePackage())
                    add(ShortcutManagerPackage())
                    add(BootSplashPackage())
                    add(ExpensifyAppPackage())
                    add(RNTextInputResetPackage())
                    add(NavBarManagerPackage())
                },
        )
    }

    override fun onCreate() {
        super.onCreate()

        // Plaid's LinkActivity calls setRequestedOrientation(PORTRAIT) in its own onCreate(),
        // which forces the UI to portrait even when the device is in landscape. We override it
        // here so Plaid can render in whichever orientation the device is actually in.
        registerActivityLifecycleCallbacks(object : Application.ActivityLifecycleCallbacks {
            override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {
                if (activity.javaClass.name == "com.plaid.internal.link.LinkActivity") {
                    activity.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
                    keepPlaidContentAboveKeyboard(activity)
                }
            }
            override fun onActivityStarted(activity: Activity) {}
            override fun onActivityResumed(activity: Activity) {}
            override fun onActivityPaused(activity: Activity) {}
            override fun onActivityStopped(activity: Activity) {}
            override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {}
            override fun onActivityDestroyed(activity: Activity) {}
        })

        ReactFontManager.getInstance().addCustomFont(this, "Custom Emoji Font", R.font.custom_emoji_font)
        ReactFontManager.getInstance().addCustomFont(this, "Expensify New Kansas", R.font.expensify_new_kansas)
        ReactFontManager.getInstance().addCustomFont(this, "Expensify Neue", R.font.expensify_neue)
        ReactFontManager.getInstance().addCustomFont(this, "Expensify Mono", R.font.expensify_mono)

        if (isOnfidoProcess()) {
            return
        }

        // Initialize Sentry before any native telemetry (e.g. certificate pinning monitor reports).
        SentryNativeSDKManager.initialize(this)

        // Install certificate pinning for React Native's shared OkHttp client (covers fetch(),
        // react-native-blob-util, etc.). Must run before any networking starts.
        CertificatePinning.install()
        // This is the entrypoint for prefetching with `react-native-nitro-fetch`.
        try {
            AutoPrefetcher.prefetchOnStart(this)
        } catch (_: Throwable) {
            System.err.println("Error initializing Nitro `AutoPrefetcher`")
        }

        loadReactNative(this)

        // Force the app to LTR mode.
        val sharedI18nUtilInstance = I18nUtil.instance
        sharedI18nUtilInstance.allowRTL(applicationContext, false)

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

    // In landscape the keyboard covers most of the screen and Plaid's window doesn't shrink for it,
    // so the focused input in Plaid's WebView stays hidden behind the keyboard. We handle the insets
    // ourselves so Plaid's content always fits in the space above the keyboard.
    private fun keepPlaidContentAboveKeyboard(activity: Activity) {
        val window = activity.window
        WindowCompat.setDecorFitsSystemWindows(window, false)
        window.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE)

        val content = activity.findViewById<View>(android.R.id.content) ?: return
        ViewCompat.setOnApplyWindowInsetsListener(content) { view, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout())
            val ime = insets.getInsets(WindowInsetsCompat.Type.ime())
            view.setPadding(bars.left, bars.top, bars.right, maxOf(bars.bottom, ime.bottom))
            WindowInsetsCompat.CONSUMED
        }
    }

    private fun isOnfidoProcess(): Boolean {
        val pid = Process.myPid()
        val manager = this.getSystemService(ACTIVITY_SERVICE) as ActivityManager

        return manager.runningAppProcesses.any {
            it.pid == pid && it.processName.endsWith(":onfido_process")
        }
    }
}
