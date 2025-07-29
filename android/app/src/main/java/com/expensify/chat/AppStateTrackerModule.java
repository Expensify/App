package com.expensify.chat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import androidx.annotation.NonNull;

public class AppStateTrackerModule extends ReactContextBaseJavaModule {
    public AppStateTrackerModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    @NonNull
    public String getName() {
        return "AppStateTracker";
    }

    @ReactMethod
    public void getWasAppRelaunchedFromIcon(Promise promise) {
        Activity activity = getCurrentActivity();
        if (activity instanceof MainActivity) {
            promise.resolve(activity.wasAppRelaunchedFromIcon);
            activity.wasAppRelaunchedFromIcon = false;
        } else {
            promise.resolve(false);
        }
    }
}
