import {EventType} from '@ua/react-native-airship';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import Log from '../../Log';

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

export {pushNotificationEventCallback, onReceived, onSelected};
