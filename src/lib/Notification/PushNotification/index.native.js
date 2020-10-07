import {AppState} from 'react-native';
import {UrbanAirship, EventType} from 'urbanairship-react-native';
import NotificationType from './NotificationType';

const notificationEventActionMap = {};

/**
 * Register this device for push notifications for the given accountID.
 *
 * @param {string|int} accountID
 */
function register(accountID) {
    // Get permissions to display push notifications
    UrbanAirship.enableUserPushNotifications()
        .then((isEnabled) => {
            if (!isEnabled) {
                console.debug('[PUSH_NOTIFICATIONS] User has disabled visible push notifications for this app.');
            }
        });

    // Register this device as a named user in AirshipAPI
    console.debug(`[PUSH_NOTIFICATIONS] Subscribing to notifications for account ID ${accountID}`);
    UrbanAirship.setNamedUser(accountID.toString());
}

/**
 * Deregister this device from push notifications.
 */
function deregister() {
    console.debug('[PUSH_NOTIFICATIONS] Unsubscribing from push notifications.');
    UrbanAirship.setNamedUser(null);
}

/**
 * Handle a push notification event, and trigger and bound actions.
 *
 * @param {string} eventType
 * @param {object} notification
 */
function pushNotificationEventCallback(eventType, notification) {
    const actionMap = notificationEventActionMap[eventType];
    const payload = notification.extras?.payload;

    console.debug(`[PUSH_NOTIFICATION] ${eventType} - {
                title: ${notification.title},
                message: ${notification.alert},
                payload: ${payload}
            }`);

    // If a push notification is received while the app is in foreground,
    // we'll assume pusher is connected so we'll ignore this push notification
    if (AppState.currentState === 'active') {
        console.debug('[PUSH_NOTIFICATION] App is in foreground, ignoring push notification.');
        return;
    }

    if (!payload?.type) {
        console.debug('[PUSH_NOTIFICATION] Notification of unknown type received.');
        return;
    }

    if (!actionMap[payload.type]) {
        console.debug(`[PUSH_NOTIFICATION] No callback set up: {
                    event: ${eventType},
                    notification type: ${payload.type},
                }`);
        return;
    }

    const action = actionMap[payload.type];
    action(payload);
}

/**
 * Setup listener for push notification events.
 */
function setupEventListeners() {
    UrbanAirship.addListener(EventType.PushReceived, (notification) => {
        pushNotificationEventCallback(EventType.PushReceived, notification);
    });

    UrbanAirship.addListener(EventType.NotificationResponse, (event) => {
        pushNotificationEventCallback(EventType.NotificationResponse, event.notification);
    });
}

/**
 * Bind a callback to a push notification of a given type.
 * See https://github.com/Expensify/Web-Expensify/blob/master/lib/MobilePushNotifications.php for the various
 * types of push notifications sent, along with the data that they provide.
 *
 * @param {string} notificationType
 * @param {Function} callback
 * @param {string?} triggerEvent - The event that should trigger this callback. Should be one of UrbanAirship.EventType
 */
function bind(notificationType, callback, triggerEvent) {
    notificationEventActionMap[triggerEvent] = {
        ...notificationEventActionMap[triggerEvent],
        [notificationType]: callback,
    };
}


function onReceived(notificationType, callback) {
    bind(notificationType, callback, EventType.PushReceived);
}

function onSelected(notificationType, callback) {
    bind(notificationType, callback, EventType.NotificationResponse);
}

// Setup the listeners when this module first loads
setupEventListeners();

export default {
    register,
    deregister,
    onReceived,
    onSelected,
    NotificationType,
};
