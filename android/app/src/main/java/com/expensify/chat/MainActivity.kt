package com.expensify.chat

import android.app.ActivityManager
import android.content.Intent
import android.content.pm.ActivityInfo
import android.content.res.Resources
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.Choreographer
import android.view.KeyEvent
import android.view.View
import android.view.ViewTreeObserver
import android.view.WindowInsets
import android.view.WindowManager
import com.expensify.chat.bootsplash.BootSplash
import com.expensify.chat.bootsplash.BootSplashDialog
import com.expensify.chat.intenthandler.IntentHandlerFactory
import com.expensify.reactnativekeycommand.KeyCommandModule
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {
    companion object {
        private const val APP_START_TIME_PREFERENCES = "AppStartTime"
    }

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    override fun getMainComponentName() = "NewExpensify"

    var wasAppRelaunchedFromIcon: Boolean = false

    /**
     * Returns the instance of the [ReactActivityDelegate]. Here we use a util class [ ] which allows you to easily enable Fabric and Concurrent React
     * (aka React 18) with two boolean flags.
     */
    override fun createReactActivityDelegate() = ReactActivityDelegateWrapper(
        this, BuildConfig.IS_NEW_ARCHITECTURE_ENABLED, DefaultReactActivityDelegate(
            this,
            mainComponentName,  // If you opted-in for the New Architecture, we enable the Fabric Renderer.
            fabricEnabled
        )
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        getSharedPreferences(APP_START_TIME_PREFERENCES, MODE_PRIVATE)
            .edit()
            .putLong(APP_START_TIME_PREFERENCES, System.currentTimeMillis())
            .apply()
        BootSplash.init(this)
        super.onCreate(null)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            setRecentsScreenshotEnabled(false)
        }

        // Sets translucent status bar. This code is based on what the react-native StatusBar
        // module does, but we need to do it here to avoid the splash screen jumping on app start.
        val decorView = window.decorView
        decorView.setOnApplyWindowInsetsListener { v: View, insets: WindowInsets? ->
            val defaultInsets = v.onApplyWindowInsets(insets)
            defaultInsets.replaceSystemWindowInsets(
                defaultInsets.systemWindowInsetLeft,
                0,
                defaultInsets.systemWindowInsetRight,
                defaultInsets.systemWindowInsetBottom
            )
        }

        if (intent != null) {
            handleIntent(intent)
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)

        if (intent.hasCategory(Intent.CATEGORY_LAUNCHER)
            && intent.getAction() != null
            && intent.getAction().equals(Intent.ACTION_MAIN)
        ) {
            wasAppRelaunchedFromIcon = true
        }

        setIntent(intent) // Must store the new intent unless getIntent() will return the old one
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent) {
        try {
            val intenthandler = IntentHandlerFactory.getIntentHandler(this, intent.type, intent.toString())
            intenthandler?.handle(intent)
        } catch (exception: Exception) {
            Log.e("handleIntentException", exception.toString())
        }
    }

    /**
     * This method is called when a key down event has occurred.
     * Forwards the event to the KeyCommandModule
     */
    override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
        // Disabling hardware ESCAPE support which is handled by Android
        if (event.keyCode == KeyEvent.KEYCODE_ESCAPE) {
            return false
        }
        KeyCommandModule.getInstance().onKeyDownEvent(keyCode, event)
        return super.onKeyDown(keyCode, event)
    }

    override fun onKeyLongPress(keyCode: Int, event: KeyEvent): Boolean {
        // Disabling hardware ESCAPE support which is handled by Android
        if (event.keyCode == KeyEvent.KEYCODE_ESCAPE) {
            return false
        }
        KeyCommandModule.getInstance().onKeyDownEvent(keyCode, event)
        return super.onKeyLongPress(keyCode, event)
    }

    override fun onKeyUp(keyCode: Int, event: KeyEvent): Boolean {
        // Disabling hardware ESCAPE support which is handled by Android
        if (event.keyCode == KeyEvent.KEYCODE_ESCAPE) {
            return false
        }
        KeyCommandModule.getInstance().onKeyDownEvent(keyCode, event)
        return super.onKeyUp(keyCode, event)
    }

    override fun onStart() {
        super.onStart()
    }

    // it lets us tell "leaving the app" from "internal window"
    private var isTopResumed = true

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            hidePrivacyDialog()
        } else if (!isTopResumed) {
            showPrivacyDialog()
        }
    }

    override fun onTopResumedActivityChanged(isTopResumedActivity: Boolean) {
        super.onTopResumedActivityChanged(isTopResumedActivity)
        isTopResumed = isTopResumedActivity
        if (isTopResumedActivity) {
            hidePrivacyDialog()
        }
    }

    override fun onResume() {
        super.onResume()
        window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            isTopResumed = true
        }
    }

    override fun onPause() {
        window.setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE)
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            isTopResumed = false
        }
        super.onPause()
    }

    override fun onApplyThemeResource(theme: Resources.Theme, resid: Int, first: Boolean) {
        super.onApplyThemeResource(theme, resid, first)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            setTaskDescription(
                ActivityManager.TaskDescription.Builder()
                    .setBackgroundColor(getColor(R.color.bootsplash_background))
                    .build()
            )
        }
    }

    override fun onDestroy() {
        hidePrivacyDialog()
        super.onDestroy()
    }

    private var privacyDialog: BootSplashDialog? = null

    private fun showPrivacyDialog() {
        if (privacyDialog != null || isFinishing || isDestroyed) {
            return
        }
        val dialog = BootSplashDialog(this, R.style.BootTheme)
        // When the user comes back the activity underneath regains focus
        dialog.window?.setFlags(
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
        )
        // The default dialog fade-in would let the snapshot see the content underneath
        dialog.window?.setWindowAnimations(0)
        dialog.show()
        privacyDialog = dialog

        val decorView = dialog.window?.decorView ?: return
        decorView.viewTreeObserver.addOnPreDrawListener(object : ViewTreeObserver.OnPreDrawListener {
            override fun onPreDraw(): Boolean {
                decorView.viewTreeObserver.removeOnPreDrawListener(this)
                Choreographer.getInstance().postFrameCallback {
                    if (privacyDialog === dialog) {
                        window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
                    }
                }
                return true
            }
        })
    }

    private fun hidePrivacyDialog() {
        privacyDialog?.dismiss()
        privacyDialog = null
    }
}
