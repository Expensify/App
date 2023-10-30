import Onyx from 'react-native-onyx';
import PushNotification from '..';
import subscribeToReportCommentPushNotifications from '../subscribeToReportCommentPushNotifications';
import ONYXKEYS from '../../../../ONYXKEYS';

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
            PushNotification.register(notificationID);

            // Prevent issue where report linking fails after users switch accounts without closing the app
            PushNotification.init();
            subscribeToReportCommentPushNotifications();
        } else {
            PushNotification.deregister();
            PushNotification.clearNotifications();
        }
    },
});
