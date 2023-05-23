import _ from 'underscore';
import Onyx from 'react-native-onyx';
import Airship, {EventType} from '@ua/react-native-airship';
import lodashGet from 'lodash/get';
import Log from '../../Log';
import NotificationType from './NotificationType';
import * as PushNotification from '../../actions/PushNotification';
import ONYXKEYS from '../../../ONYXKEYS';
import configureForegroundNotifications from './configureForegroundNotifications';

let isUserOptedInToPushNotifications = false;
Onyx.connect({
    key: ONYXKEYS.PUSH_NOTIFICATIONS_ENABLED,
    callback: (val) => (isUserOptedInToPushNotifications = val),
});

const notificationEventActionMap = {};

/**
 * Handle a push notification event, and trigger and bound actions.
 *
 * @param {String} eventType
 * @param {Object} notification
 */
function pushNotificationEventCallback(eventType, notification) {
    const actionMap = notificationEventActionMap[eventType] || {};
    let payload = lodashGet(notification, 'extras.payload');

    // On Android, some notification payloads are sent as a JSON string rather than an object
    if (_.isString(payload)) {
        payload = JSON.parse(payload);
    }

    Log.info(`[PushNotification] Callback triggered for ${eventType}`);

    if (!payload) {
        Log.warn('[PushNotification] Notification has null or undefined payload, not executing any callback.');
        return;
    }

    if (!payload.type) {
        Log.warn('[PushNotification] No type value provided in payload, not executing any callback.');
        return;
    }

    const action = actionMap[payload.type];
    if (!action) {
        Log.warn('[PushNotification] No callback set up: ', {
            event: eventType,
            notificationType: payload.type,
        });
        return;
    }
    action(payload);
}

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

        pushNotificationEventCallback(EventType.PushReceived, notification.pushPayload);
    });

    // Note: the NotificationResponse event has a nested PushReceived event,
    // so event.notification refers to the same thing as notification above ^
    Airship.addListener(EventType.NotificationResponse, (event) => {
        pushNotificationEventCallback(EventType.NotificationResponse, event.pushPayload);
    });

    // Keep track of which users have enabled push notifications via an NVP.
    Airship.addListener(EventType.NotificationOptInStatus, refreshNotificationOptInStatus);

    configureForegroundNotifications();
}

/**
 * Register this device for push notifications for the given accountID.
 *
 * @param {String|Number} accountID
 */
function register(accountID) {
    if (Airship.contact.getNamedUserId() === accountID.toString()) {
        // No need to register again for this accountID.
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
    Log.info(`[PushNotification] Subscribing to notifications for account ID ${accountID}`);
    Airship.contact.identify(accountID.toString());

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
 * Bind a callback to a push notification of a given type.
 * See https://github.com/Expensify/Web-Expensify/blob/main/lib/MobilePushNotifications.php for the various
 * types of push notifications sent, along with the data that they provide.
 *
 * Note: This implementation allows for only one callback to be bound to an Event/Type pair. For example,
 *       if we attempt to bind two callbacks to the PushReceived event for reportComment notifications,
 *       the second will overwrite the first.
 *
 * @param {String} notificationType
 * @param {Function} callback
 * @param {String} [triggerEvent] - The event that should trigger this callback. Should be one of UrbanAirship.EventType
 */
function bind(notificationType, callback, triggerEvent) {
    if (!notificationEventActionMap[triggerEvent]) {
        notificationEventActionMap[triggerEvent] = {};
    }
    notificationEventActionMap[triggerEvent][notificationType] = callback;
}

/**
 * Bind a callback to be executed when a push notification of a given type is received.
 *
 * @param {String} notificationType
 * @param {Function} callback
 */
function onReceived(notificationType, callback) {
    bind(notificationType, callback, EventType.PushReceived);
}

/**
 * Bind a callback to be executed when a push notification of a given type is tapped by the user.
 *
 * @param {String} notificationType
 * @param {Function} callback
 */
function onSelected(notificationType, callback) {
    bind(notificationType, callback, EventType.NotificationResponse);
}

/**
 * Clear all push notifications
 */
function clearNotifications() {
    Airship.push.clearNotifications();
}

export default {
    init,
    register,
    deregister,
    onReceived,
    onSelected,
    TYPE: NotificationType,
    clearNotifications,
};
