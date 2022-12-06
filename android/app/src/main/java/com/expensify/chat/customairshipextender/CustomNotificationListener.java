package com.expensify.chat.customairshipextender;

import androidx.annotation.NonNull;
import com.urbanairship.push.NotificationActionButtonInfo;
import com.urbanairship.push.NotificationInfo;
import com.urbanairship.push.NotificationListener;
import com.urbanairship.push.PushMessage;
import org.jetbrains.annotations.NotNull;

/**
 * Allows us to clear the notification cache when the user dismisses a notification.
 */
public class CustomNotificationListener implements NotificationListener {
    private final NotificationListener parent;
    private final CustomNotificationProvider provider;

    CustomNotificationListener(NotificationListener parent, CustomNotificationProvider provider) {
        this.parent = parent;
        this.provider = provider;
    }

    @Override
    public void onNotificationPosted(@NonNull @NotNull NotificationInfo notificationInfo) {
        parent.onNotificationPosted(notificationInfo);
    }

    @Override
    public boolean onNotificationOpened(@NonNull @NotNull NotificationInfo notificationInfo) {
        return parent.onNotificationOpened(notificationInfo);
    }

    @Override
    public boolean onNotificationForegroundAction(@NonNull @NotNull NotificationInfo notificationInfo, @NonNull @NotNull NotificationActionButtonInfo actionButtonInfo) {
        return parent.onNotificationForegroundAction(notificationInfo, actionButtonInfo);
    }

    @Override
    public void onNotificationBackgroundAction(@NonNull @NotNull NotificationInfo notificationInfo, @NonNull @NotNull NotificationActionButtonInfo actionButtonInfo) {
        parent.onNotificationBackgroundAction(notificationInfo, actionButtonInfo);
    }

    @Override
    public void onNotificationDismissed(@NonNull @NotNull NotificationInfo notificationInfo) {
        parent.onNotificationDismissed(notificationInfo);

        PushMessage message = notificationInfo.getMessage();
        provider.onDismissNotification(message);
    }
}
