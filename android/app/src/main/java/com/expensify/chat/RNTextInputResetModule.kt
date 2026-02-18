package com.expensify.chat;

import android.content.Context;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.uimanager.util.ReactFindViewUtil;

class RNTextInputResetModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(
    reactContext
) {
    override fun getName(): String = "RNTextInputReset"

    // Props to https://github.com/MattFoley for this temporary hack
    // https://github.com/facebook/react-native/pull/12462#issuecomment-298812731
    @ReactMethod
    fun resetKeyboardInput(nativeId: String) {
        reactContext.runOnUiQueueThread {
            val imm = reactApplicationContext.baseContext.getSystemService(
                Context.INPUT_METHOD_SERVICE
            ) as? InputMethodManager

            val reactNativeView = reactApplicationContext.getCurrentActivity()?.findViewById<View>(android.R.id.content)
            val viewToReset = reactNativeView?.let { ReactFindViewUtil.findView(it, nativeId) }
            imm?.restartInput(viewToReset)
        }
    }
}
