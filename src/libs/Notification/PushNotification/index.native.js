import Onyx from 'react-native-onyx';
import Airship, {EventType} from '@ua/react-native-airship';
import Log from '../../Log';
import * as PushNotification from '../../actions/PushNotification';
import ONYXKEYS from '../../../ONYXKEYS';
import configureForegroundNotifications from './configureForegroundNotifications';
import subscribeToReportCommentPushNotifications from './subscribeToReportCommentPushNotifications';
import * as PushNotificationListener from './PushNotificationListener';

let isUserOptedInToPushNotifications = false;
Onyx.connect({
    key: ONYXKEYS.PUSH_NOTIFICATIONS_ENABLED,
    callback: (val) => (isUserOptedInToPushNotifications = val),
});

/**
 * Check if a user is opted-in to push notifications on this device and update the `pushNotificationsEnabled` NVP accordingly.
 */
function refreshNotificationOptInStatus() {
    Airship.push.getNotificationStatus().then((notificationStatus) => {
        const isOptedIn = notificationStatus.airshipOptIn && notificationStatus.systemEnabled;
        if (isOptedIn === isUserOptedInToPushNotifications) {
            return;
        }

        Log.info('[PushNotification] Push notification opt-in status changed.', false, {isOptedIn});
        PushNotification.setPushNotificationOptInStatus(isOptedIn);
    });
}

/**
 * Configure push notifications and register callbacks. This is separate from namedUser registration because it needs to be executed
 * from a headless JS process, outside of any react lifecycle.
 *
 * WARNING: Moving or changing this code could break Push Notification processing in non-obvious ways.
 *          DO NOT ALTER UNLESS YOU KNOW WHAT YOU'RE DOING. See this PR for details: https://github.com/Expensify/App/pull/3877
 */
function init() {
    // Setup event listeners
    Airship.addListener(EventType.PushReceived, (notification) => {
        // By default, refresh notification opt-in status to true if we receive a notification
        if (!isUserOptedInToPushNotifications) {
            PushNotification.setPushNotificationOptInStatus(true);
        }

        PushNotificationListener.pushNotificationEventCallback(EventType.PushReceived, notification.pushPayload);
    });

    // Note: the NotificationResponse event has a nested PushReceived event,
    // so event.notification refers to the same thing as notification above ^
    Airship.addListener(EventType.NotificationResponse, (event) => {
        PushNotificationListener.pushNotificationEventCallback(EventType.NotificationResponse, event.pushPayload);
    });

    // Keep track of which users have enabled push notifications via an NVP.
    Airship.addListener(EventType.NotificationOptInStatus, refreshNotificationOptInStatus);

    configureForegroundNotifications();
}

/**
 * Register this device for push notifications for the given notificationID.
 *
 * @param {String|Number} notificationID
 */
function register(notificationID) {
    if (Airship.contact.getNamedUserId() === notificationID.toString()) {
        // No need to register again for this notificationID.
        return;
    }

    // Get permissions to display push notifications (prompts user on iOS, but not Android)
    Airship.push.enableUserNotifications().then((isEnabled) => {
        if (isEnabled) {
            return;
        }

        Log.info('[PushNotification] User has disabled visible push notifications for this app.');
    });

    // Register this device as a named user in AirshipAPI.
    // Regardless of the user's opt-in status, we still want to receive silent push notifications.
    Log.info(`[PushNotification] Subscribing to notifications`);
    Airship.contact.identify(notificationID.toString());

    // Refresh notification opt-in status NVP for the new user.
    refreshNotificationOptInStatus();
}

/**
 * Deregister this device from push notifications.
 */
function deregister() {
    Log.info('[PushNotification] Unsubscribing from push notifications.');
    Airship.contact.reset();
    Airship.removeAllListeners(EventType.PushReceived);
    Airship.removeAllListeners(EventType.NotificationResponse);
}

/**
 * Clear all push notifications
 */
function clearNotifications() {
    Airship.push.clearNotifications();
}

/**
 * Manage push notification subscriptions on sign-in/sign-out.
 *
 * On Android, AuthScreens unmounts when the app is closed with the back button so we manage the
 * push subscription when the session changes here.
 */
Onyx.connect({
    key: ONYXKEYS.NVP_PRIVATE_PUSH_NOTIFICATION_ID,
    callback: (notificationID) => {
        if (notificationID) {
            register(notificationID);

            // Prevent issue where report linking fails after users switch accounts without closing the app
            init();
            subscribeToReportCommentPushNotifications();
        } else {
            deregister();
            clearNotifications();
        }
    },
});

export default {
    init,
    register,
    deregister,
    clearNotifications,
};
