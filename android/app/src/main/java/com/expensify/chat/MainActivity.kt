package com.expensify.chat

import android.content.Intent
import android.content.pm.ActivityInfo
import android.os.Bundle
import android.util.Log
import android.view.KeyEvent
import android.view.View
import android.view.WindowInsets
import com.expensify.chat.bootsplash.BootSplash
import com.expensify.chat.intenthandler.IntentHandlerFactory
import com.expensify.reactnativekeycommand.KeyCommandModule
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import expo.modules.ReactActivityDelegateWrapper

import com.oblador.performance.RNPerformance

class MainActivity : ReactActivity() {
    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    override fun getMainComponentName() = "NewExpensify"

    /**
     * Returns the instance of the [ReactActivityDelegate]. Here we use a util class [ ] which allows you to easily enable Fabric and Concurrent React
     * (aka React 18) with two boolean flags.
     */
    override fun createReactActivityDelegate() = ReactActivityDelegateWrapper(this, BuildConfig.IS_NEW_ARCHITECTURE_ENABLED, DefaultReactActivityDelegate(
        this,
        mainComponentName,  // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        fabricEnabled
    ))

    override fun onCreate(savedInstanceState: Bundle?) {
        BootSplash.init(this)
        super.onCreate(null)
        if (resources.getBoolean(R.bool.portrait_only)) {
            requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
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
        RNPerformance.getInstance().mark("appCreationEnd", false);
    }
}
