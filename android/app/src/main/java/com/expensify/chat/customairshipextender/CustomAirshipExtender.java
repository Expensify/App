package com.expensify.chat.customairshipextender;

import android.content.Context;
import androidx.annotation.NonNull;
import com.urbanairship.Airship;
import com.urbanairship.android.framework.proxy.AirshipPluginExtender;
import com.urbanairship.push.PushManager;

public class CustomAirshipExtender implements AirshipPluginExtender {
    @Override
    public void onAirshipReady(@NonNull Context context) {
        PushManager pushManager = Airship.getPush();

        CustomNotificationProvider notificationProvider = new CustomNotificationProvider(context, Airship.getAirshipConfigOptions());
        pushManager.setNotificationProvider(notificationProvider);
    }
}
