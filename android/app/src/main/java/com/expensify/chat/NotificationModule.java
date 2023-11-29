package com.expensify.chat;

import android.app.NotificationManager;
import android.util.Log;

import com.expensify.chat.customairshipextender.NotificationCache;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class NotificationModule extends ReactContextBaseJavaModule {

    ReactApplicationContext context;

    NotificationModule(ReactApplicationContext context) {
        super(context);
        this.context = context;
    }

    @Override
    public String getName() {
        return "NotificationModule";
    }

    @ReactMethod
    public void clearReportNotifications(String reportIDString) {
        Log.d("NotificationModule", "clearReportNotifications called. reportID: " + reportIDString);

        Long reportID;
        try {
            reportID = Long.parseLong(reportIDString);
        } catch (NumberFormatException e) {
            Log.e("NotificationModule", "clearReportNotifications() - Failed to parse reportID '" + reportIDString + "'");
            e.printStackTrace();
            return;
        }

        NotificationCache.NotificationData data = NotificationCache.getNotificationData(reportID);

        if (data.notificationID == 0) {
            Log.i("NotificationModule", "clearReportNotifications() - No notification for reportID " + reportID);
            return;
        }

        NotificationManager notificationManager = context.getSystemService(NotificationManager.class);
        notificationManager.cancel(data.notificationID);
        NotificationCache.setNotificationData(reportID, null);
    }

}
