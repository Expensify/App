package com.expensify.chat;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.google.firebase.perf.FirebasePerformance;
import com.google.firebase.perf.metrics.Trace;

public class StartupTimer extends ReactContextBaseJavaModule {
    StartupTimer(ReactApplicationContext context) {
        super(context);
    }

    private static Trace trace = null;

    @Override
    public String getName() {
        return "StartupTimer";
    }

    @ReactMethod
    public void stop() {
        if (trace == null) {
            return;
        }

        trace.stop();
    }

    public static void start() {
        if (BuildConfig.DEBUG) {
            Log.d("StartupTimer", "Metric tracing disabled in DEBUG");
        } else {
            trace = FirebasePerformance.getInstance().newTrace("js_loaded");
            trace.start();
        }
    }
}
