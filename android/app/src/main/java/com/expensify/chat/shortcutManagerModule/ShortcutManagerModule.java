package com.expensify.chat.shortcutManagerModule;

import static androidx.core.app.NotificationCompat.CATEGORY_MESSAGE;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.Person;
import androidx.core.content.pm.ShortcutInfoCompat;
import androidx.core.content.pm.ShortcutManagerCompat;
import androidx.core.graphics.drawable.IconCompat;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.Collections;

import com.expensify.chat.customairshipextender.CustomNotificationProvider;

public class ShortcutManagerModule extends ReactContextBaseJavaModule {
    private ReactApplicationContext context;

    public ShortcutManagerModule(ReactApplicationContext context) {
        super(context);
        this.context = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "ShortcutManager";
    }

    @ReactMethod
    public void removeAllDynamicShortcuts() {
        ShortcutManagerUtils.removeAllDynamicShortcuts(context);
    }
}
