package com.expensify.chat;

import android.content.Context;

import androidx.annotation.NonNull;

import com.urbanairship.UAirship;
import com.urbanairship.push.NotificationListener;
import com.urbanairship.push.PushManager;
import com.urbanairship.reactnative.AirshipExtender;

public class CustomAirshipExtender implements AirshipExtender {
    @Override
    public void onAirshipReady(@NonNull Context context, @NonNull UAirship airship) {
        PushManager pushManager = airship.getPushManager();

        CustomNotificationProvider notificationProvider = new CustomNotificationProvider(context, airship.getAirshipConfigOptions());
        pushManager.setNotificationProvider(notificationProvider);

        NotificationListener notificationListener = airship.getPushManager().getNotificationListener();
        pushManager.setNotificationListener(new CustomNotificationListener(notificationListener, notificationProvider));
    }
}