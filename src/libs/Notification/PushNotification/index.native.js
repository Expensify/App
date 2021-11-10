import _ from 'underscore';
import {AppState} from 'react-native';
import {UrbanAirship, EventType} from 'urbanairship-react-native';
import lodashGet from 'lodash/get';
import Log from '../../Log';
import NotificationType from './NotificationType';

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

    Log.info(`[PUSH_NOTIFICATION] Callback triggered for ${eventType}`);

    if (!payload) {
        Log.warn('[PUSH_NOTIFICATION] Notification has null or undefined payload, not executing any callback.');
        return;
    }

    if (!payload.type) {
        Log.warn('[PUSH_NOTIFICATION] No type value provided in payload, not executing any callback.');
        return;
    }

    const action = actionMap[payload.type];
    if (!action) {
        Log.warn('[PUSH_NOTIFICATION] No callback set up: ', {
            event: eventType,
            notificationType: payload.type,
        });
        return;
    }
    action(payload);
}

/**
 * Register push notification callbacks. This is separate from namedUser registration because it needs to be executed
 * from a headless JS process, outside of any react lifecycle.
 *
 * WARNING: Moving or changing this code could break Push Notification processing in non-obvious ways.
 *          DO NOT ALTER UNLESS YOU KNOW WHAT YOU'RE DOING. See this PR for details: https://github.com/Expensify/App/pull/3877
 */
function init() {
    // Setup event listeners
    UrbanAirship.addListener(EventType.PushReceived, (notification) => {
        // If a push notification is received while the app is in foreground,
        // we'll assume pusher is connected so we'll ignore it and not fetch the same data twice.
        if (AppState.currentState === 'active') {
            Log.info('[PUSH_NOTIFICATION] Push received while app is in foreground, not executing any callback.');
            return;
        }

        pushNotificationEventCallback(EventType.PushReceived, notification);
    });

    // Note: the NotificationResponse event has a nested PushReceived event,
    // so event.notification refers to the same thing as notification above ^
    UrbanAirship.addListener(EventType.NotificationResponse, (event) => {
        pushNotificationEventCallback(EventType.NotificationResponse, event.notification);
    });
}

/**
 * Register this device for push notifications for the given accountID.
 *
 * @param {String|Number} accountID
 */
function register(accountID) {
    if (UrbanAirship.getNamedUser() === accountID.toString()) {
        // No need to register again for this accountID.
        return;
    }

    // Get permissions to display push notifications (prompts user on iOS, but not Android)
    UrbanAirship.enableUserPushNotifications()
        .then((isEnabled) => {
            if (isEnabled) {
                return;
            }

            Log.info('[PUSH_NOTIFICATIONS] User has disabled visible push notifications for this app.');
        });

    // Register this device as a named user in AirshipAPI.
    // Regardless of the user's opt-in status, we still want to receive silent push notifications.
    Log.info(`[PUSH_NOTIFICATIONS] Subscribing to notifications for account ID ${accountID}`);
    UrbanAirship.setNamedUser(accountID.toString());
}

/**
 * Deregister this device from push notifications.
 */
function deregister() {
    Log.info('[PUSH_NOTIFICATIONS] Unsubscribing from push notifications.');
    UrbanAirship.setNamedUser(null);
    UrbanAirship.removeAllListeners(EventType.PushReceived);
    UrbanAirship.removeAllListeners(EventType.NotificationResponse);
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
    UrbanAirship.clearNotifications();
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
