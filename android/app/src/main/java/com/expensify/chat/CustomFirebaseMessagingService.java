package com.expensify.chat;

import android.app.ActivityManager;
import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;

import com.google.firebase.messaging.RemoteMessage;
import com.urbanairship.push.fcm.AirshipFirebaseMessagingService;

import java.util.List;

public class CustomFirebaseMessagingService extends AirshipFirebaseMessagingService {
    @Override
    public void onMessageReceived(@NonNull RemoteMessage message) {
        Log.d("FBMS", "onMessageReceived: " + message);

        if (!isApplicationInForeground()) {
            Log.d("FBMS", "App is in background. Showing notification");
            super.onMessageReceived(message);
        } else {
            Log.d("FBMS", "App is in foreground. Dropping notification");
        }
    }

    private boolean isApplicationInForeground() {
        ActivityManager activityManager = (ActivityManager) this.getSystemService(Context.ACTIVITY_SERVICE);
        List<ActivityManager.RunningAppProcessInfo> processInfos = activityManager.getRunningAppProcesses();
        if (processInfos != null) {
            for (ActivityManager.RunningAppProcessInfo processInfo : processInfos) {
                if (processInfo.processName.equals(this.getPackageName())
                        && processInfo.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND
                        && processInfo.pkgList.length > 0) {
                    return true;
                }
            }
        }
        return false;
    }
}
