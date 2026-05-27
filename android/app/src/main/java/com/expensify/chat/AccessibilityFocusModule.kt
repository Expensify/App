package com.expensify.chat

import android.view.View
import android.view.accessibility.AccessibilityNodeInfo
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.uimanager.UIManagerHelper

class AccessibilityFocusModule(
    private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = NAME

    /*
     * `ACTION_ACCESSIBILITY_FOCUS` is the only API that moves TalkBack focus; `sendAccessibilityEvent`
     * dispatches a notification that TalkBack ignores when it has a competing claim. The +300ms re-fire
     * beats `TYPE_WINDOW_STATE_CHANGED` from clobbering the first action (facebook/react-native#30097).
     */
    @ReactMethod
    fun setAccessibilityFocus(reactTag: Double) {
        val tag = reactTag.toInt()
        UiThreadUtil.runOnUiThread {
            // Paper/Fabric-aware resolver; decorView fallback for older RN versions.
            val view: View =
                UIManagerHelper.getUIManagerForReactTag(reactContext, tag)?.resolveView(tag) as? View
                    ?: reactContext.currentActivity?.window?.decorView?.findViewById(tag)
                    ?: return@runOnUiThread
            view.performAccessibilityAction(AccessibilityNodeInfo.ACTION_ACCESSIBILITY_FOCUS, null)
            view.postDelayed({
                view.performAccessibilityAction(AccessibilityNodeInfo.ACTION_ACCESSIBILITY_FOCUS, null)
            }, REFOCUS_DELAY_MS)
        }
    }

    companion object {
        const val NAME = "RNAccessibilityFocus"
        private const val REFOCUS_DELAY_MS = 300L
    }
}
