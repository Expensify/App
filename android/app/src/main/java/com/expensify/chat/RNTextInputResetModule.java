package com.expensify.chat;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.uimanager.util.ReactFindViewUtil;

import android.content.Context;
import android.view.View;
import android.view.inputmethod.InputMethodManager;

public class RNTextInputResetModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public RNTextInputResetModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "RNTextInputReset";
    }

    // Props to https://github.com/MattFoley for this temporary hack
    // https://github.com/facebook/react-native/pull/12462#issuecomment-298812731
    @ReactMethod
    public void resetKeyboardInput(final String nativeId) {
        reactContext.runOnUiQueueThread(() -> {
            InputMethodManager imm = (InputMethodManager) getReactApplicationContext().getBaseContext().getSystemService(Context.INPUT_METHOD_SERVICE);

            View reactNativeView = getCurrentActivity().findViewById(android.R.id.content);
            View viewToReset = ReactFindViewUtil.findView(reactNativeView, nativeId);

            if (imm != null && viewToReset != null) {
                imm.restartInput(viewToReset);
            }
        });
    }
}
