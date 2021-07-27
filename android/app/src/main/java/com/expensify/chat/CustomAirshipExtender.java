package com.expensify.chat;

import android.content.Context;

import androidx.annotation.NonNull;

import com.urbanairship.UAirship;
import com.urbanairship.reactnative.AirshipExtender;

public class CustomAirshipExtender implements AirshipExtender {
    @Override
    public void onAirshipReady(@NonNull Context context, @NonNull UAirship airship) {
        airship.getPushManager().setNotificationProvider(new CustomNotificationProvider(context, airship.getAirshipConfigOptions()));
    }
}