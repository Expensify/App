package main.java.com.group_ib.react.session;

import androidx.annotation.Nullable;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public final class SessionEvents {
    public static final String EVENT_SESSION_OPENED = "onSessionOpened";
    public static final String EVENT_RECEIVE_SESSION = "onReceiveSession";

    private final ReactApplicationContext reactContext;
    private int jsListenerCount = 0;

    public SessionEvents(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
    }

    public void addListener(final String eventName) {
        jsListenerCount++;
    }

    public void removeListeners(final int count) {
        jsListenerCount -= count;
        if (jsListenerCount < 0) jsListenerCount = 0;
    }

    public void emit(String eventName, @Nullable String payload) {
        if (jsListenerCount == 0) return;
        if (reactContext == null || !reactContext.hasActiveReactInstance()) return;
        try {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, payload);
        } catch (Throwable ignored) {}
    }

    public void reset() {
        jsListenerCount = 0;
    }
}
