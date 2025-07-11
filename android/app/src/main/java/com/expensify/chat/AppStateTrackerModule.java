package com.expensify.chat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import androidx.annotation.NonNull;

public class AppStateTrackerModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public AppStateTrackerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    @NonNull
    public String getName() {
        return "AppStateTracker";
    }

    @ReactMethod
    public void getApplicationState(Promise promise) {
        MainApplication applicationContext = (MainApplication) this.reactContext.getApplicationContext();
        WritableMap params = Arguments.createMap();
        params.putString("currentState", applicationContext.getCurrentState());
        params.putString("prevState", applicationContext.getPrevState());
        promise.resolve(params);
    }
}
