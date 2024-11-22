import type {PushPayload} from '@ua/react-native-airship';
import Airship, {EventType} from '@ua/react-native-airship';
import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import ShortcutManager from '@libs/ShortcutManager';
import * as PushNotificationActions from '@userActions/PushNotification';
import ONYXKEYS from '@src/ONYXKEYS';
import ForegroundNotifications from './ForegroundNotifications';
import type {PushNotificationData} from './NotificationType';
import NotificationType from './NotificationType';
import parsePushNotificationPayload from './parsePushNotificationPayload';
import type {ClearNotifications, Deregister, Init, OnReceived, OnSelected, Register} from './types';
import type PushNotificationType from './types';

type NotificationEventActionCallback = (data: PushNotificationData) => Promise<void>;

type NotificationEventActionMap = Partial<Record<EventType, Record<string, NotificationEventActionCallback>>>;

let isUserOptedInToPushNotifications = false;
Onyx.connect({
    key: ONYXKEYS.PUSH_NOTIFICATIONS_ENABLED,
    callback: (value) => (isUserOptedInToPushNotifications = value ?? false),
});

const notificationEventActionMap: NotificationEventActionMap = {};

/**
 * Handle a push notification event, and trigger and bound actions.
 */
function pushNotificationEventCallback(eventType: EventType, notification: PushPayload) {
    const actionMap = notificationEventActionMap[eventType] ?? {};

    const data = parsePushNotificationPayload(notification.extras.payload);

    Log.info(`[PushNotification] Callback triggered for ${eventType}`);

    if (!data) {
        Log.warn('[PushNotification] Notification has null or undefined payload, not executing any callback.');
        return;
    }

    if (!data.type) {
        Log.warn('[PushNotification] No type value provided in payload, not executing any callback.');
        return;
    }

    const action = actionMap[data.type];
    if (!action) {
        Log.warn('[PushNotification] No callback set up: ', {
            event: eventType,
            notificationType: data.type,
        });
        return;
    }

    /**
     * The action callback should return a promise. It's very important we return that promise so that
     * when these callbacks are run in Android's background process (via Headless JS), the process waits
     * for the promise to resolve before quitting
     */
    return action(data);
}

/**
 * Check if a user is opted-in to push notifications on this device and update the `pushNotificationsEnabled` NVP accordingly.
 */
function refreshNotificationOptInStatus() {
    Airship.push.getNotificationStatus().then((notificationStatus) => {
        const isOptedIn = notificationStatus.isOptedIn && notificationStatus.areNotificationsAllowed;
        if (isOptedIn === isUserOptedInToPushNotifications) {
            return;
        }

        Log.info('[PushNotification] Push notification opt-in status changed.', false, {isOptedIn});
        PushNotificationActions.setPushNotificationOptInStatus(isOptedIn);
    });
}

/**
 * Configure push notifications and register callbacks. This is separate from namedUser registration because it needs to be executed
 * from a headless JS process, outside of any react lifecycle.
 *
 * WARNING: Moving or changing this code could break Push Notification processing in non-obvious ways.
 *          DO NOT ALTER UNLESS YOU KNOW WHAT YOU'RE DOING. See this PR for details: https://github.com/Expensify/App/pull/3877
 */
const init: Init = () => {
    // Setup event listeners
    Airship.addListener(EventType.PushReceived, (notification) => pushNotificationEventCallback(EventType.PushReceived, notification.pushPayload));

    // Note: the NotificationResponse event has a nested PushReceived event,
    // so event.notification refers to the same thing as notification above ^
    Airship.addListener(EventType.NotificationResponse, (event) => pushNotificationEventCallback(EventType.NotificationResponse, event.pushPayload));

    // Keep track of which users have enabled push notifications via an NVP.
    Airship.addListener(EventType.PushNotificationStatusChangedStatus, refreshNotificationOptInStatus);

    ForegroundNotifications.configureForegroundNotifications();
};

/**
 * Register this device for push notifications for the given notificationID.
 */
const register: Register = (notificationID) => {
    Airship.contact
        .getNamedUserId()
        .then((userID) => {
            if (userID === notificationID.toString()) {
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
        })
        .catch((error: Record<string, unknown>) => {
            Log.warn('[PushNotification] Failed to register for push notifications! Reason: ', error);
        });
};

/**
 * Deregister this device from push notifications.
 */
const deregister: Deregister = () => {
    Log.info('[PushNotification] Unsubscribing from push notifications.');
    Airship.contact.reset();
    Airship.removeAllListeners(EventType.PushReceived);
    Airship.removeAllListeners(EventType.NotificationResponse);
    ForegroundNotifications.disableForegroundNotifications();
    ShortcutManager.removeAllDynamicShortcuts();
};

/**
 * Bind a callback to a push notification of a given type.
 * See https://github.com/Expensify/Web-Expensify/blob/main/lib/MobilePushNotifications.php for the various
 * types of push notifications sent, along with the data that they provide.
 *
 * Note: This implementation allows for only one callback to be bound to an Event/Type pair. For example,
 *       if we attempt to bind two callbacks to the PushReceived event for reportComment notifications,
 *       the second will overwrite the first.
 *
 * @param triggerEvent - The event that should trigger this callback. Should be one of UrbanAirship.EventType
 */
function bind(notificationType: string, callback: NotificationEventActionCallback, triggerEvent: EventType) {
    let actionMap = notificationEventActionMap[triggerEvent];

    if (!actionMap) {
        actionMap = {};
    }

    actionMap[notificationType] = callback;
    notificationEventActionMap[triggerEvent] = actionMap;
}

/**
 * Bind a callback to be executed when a push notification of a given type is received.
 */
const onReceived: OnReceived = (notificationType, callback) => {
    bind(notificationType, callback, EventType.PushReceived);
};

/**
 * Bind a callback to be executed when a push notification of a given type is tapped by the user.
 */
const onSelected: OnSelected = (notificationType, callback) => {
    bind(notificationType, callback, EventType.NotificationResponse);
};

/**
 * Clear all push notifications
 */
const clearNotifications: ClearNotifications = () => {
    Airship.push.clearNotifications();
};

const PushNotification: PushNotificationType = {
    init,
    register,
    deregister,
    onReceived,
    onSelected,
    TYPE: NotificationType,
    clearNotifications,
};

export default PushNotification;
