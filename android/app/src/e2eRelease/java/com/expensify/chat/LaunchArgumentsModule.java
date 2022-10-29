package com.expensify.chat;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.Serializable;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

public class LaunchArgumentsModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    public LaunchArgumentsModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "LaunchArguments";
    }

    @Override
    public Map<String, Object> getConstants() {
        Map<String, Object> map = new HashMap();

        Activity activity = getCurrentActivity();
        if (activity != null) {
            Intent intent = activity.getIntent();
            if (intent != null) {
                Bundle bundle = intent.getBundleExtra("launchArgs");
                if (bundle != null) {
                    Set<String> ks = bundle.keySet();
                    Iterator<String> iterator = ks.iterator();
                    while (iterator.hasNext()) {
                        String key = iterator.next();
                        map.put(key, bundle.getString(key));
                    }
                }
                //for CLI ADB params
                Bundle bundleExtras = intent.getExtras();
                if (bundleExtras != null) {
                    for (String key : bundleExtras.keySet()) {
                        if (!"launchArgs".equals(key)) {
                            if(!Serializable.class.isInstance(bundleExtras.get(key))) {
                                map.put(key, bundleExtras.getString(key));
                            } else {
                                map.put(key, bundleExtras.get(key));
                            }
                        }
                    }
                }
            }
        }

        /**
         * In iOS hashmap returns inside another one, because constants not
         * visible. So, for consistency here do the same
         */
        Map<String, Object> consistentToIOSResult = new HashMap();
        consistentToIOSResult.put("value", map);

        return consistentToIOSResult;
    }

    /**
     * Looks like a bug in RN, without it this module is invisible
     * in NativeModules.
     */
    @ReactMethod
    public void foo() {}
}
