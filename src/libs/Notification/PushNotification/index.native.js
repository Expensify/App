"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_airship_1 = require("@ua/react-native-airship");
var Log_1 = require("@libs/Log");
var ShortcutManager_1 = require("@libs/ShortcutManager");
var ForegroundNotifications_1 = require("./ForegroundNotifications");
var NotificationType_1 = require("./NotificationType");
var parsePushNotificationPayload_1 = require("./parsePushNotificationPayload");
var notificationEventActionMap = {};
/**
 * Handle a push notification event, and trigger and bound actions.
 */
function pushNotificationEventCallback(eventType, notification) {
    var _a;
    var actionMap = (_a = notificationEventActionMap[eventType]) !== null && _a !== void 0 ? _a : {};
    var data = (0, parsePushNotificationPayload_1.default)(notification.extras.payload);
    Log_1.default.info("[PushNotification] Callback triggered for ".concat(eventType));
    if (!data) {
        Log_1.default.warn('[PushNotification] Notification has null or undefined payload, not executing any callback.');
        return;
    }
    if (!data.type) {
        Log_1.default.warn('[PushNotification] No type value provided in payload, not executing any callback.');
        return;
    }
    var action = actionMap[data.type];
    if (!action) {
        Log_1.default.warn('[PushNotification] No callback set up: ', {
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
 * Configure push notifications and register callbacks. This is separate from namedUser registration because it needs to be executed
 * from a headless JS process, outside of any react lifecycle.
 *
 * WARNING: Moving or changing this code could break Push Notification processing in non-obvious ways.
 *          DO NOT ALTER UNLESS YOU KNOW WHAT YOU'RE DOING. See this PR for details: https://github.com/Expensify/App/pull/3877
 */
var init = function () {
    // Setup event listeners
    react_native_airship_1.default.addListener(react_native_airship_1.EventType.PushReceived, function (notification) { return pushNotificationEventCallback(react_native_airship_1.EventType.PushReceived, notification.pushPayload); });
    // Note: the NotificationResponse event has a nested PushReceived event,
    // so event.notification refers to the same thing as notification above ^
    react_native_airship_1.default.addListener(react_native_airship_1.EventType.NotificationResponse, function (event) { return pushNotificationEventCallback(react_native_airship_1.EventType.NotificationResponse, event.pushPayload); });
    ForegroundNotifications_1.default.configureForegroundNotifications();
};
/**
 * Register this device for push notifications for the given notificationID.
 */
var register = function (notificationID) {
    react_native_airship_1.default.contact
        .getNamedUserId()
        .then(function (userID) {
        if (userID === notificationID.toString()) {
            // No need to register again for this notificationID.
            return;
        }
        // Get permissions to display push notifications (prompts user on iOS, but not Android)
        react_native_airship_1.default.push.enableUserNotifications().then(function (isEnabled) {
            if (isEnabled) {
                return;
            }
            Log_1.default.info('[PushNotification] User has disabled visible push notifications for this app.');
        });
        // Register this device as a named user in AirshipAPI.
        // Regardless of the user's opt-in status, we still want to receive silent push notifications.
        Log_1.default.info("[PushNotification] Subscribing to notifications");
        react_native_airship_1.default.contact.identify(notificationID.toString());
    })
        .catch(function (error) {
        Log_1.default.warn('[PushNotification] Failed to register for push notifications! Reason: ', error);
    });
};
/**
 * Deregister this device from push notifications.
 */
var deregister = function () {
    Log_1.default.info('[PushNotification] Unsubscribing from push notifications.');
    react_native_airship_1.default.contact.reset();
    react_native_airship_1.default.removeAllListeners(react_native_airship_1.EventType.PushReceived);
    react_native_airship_1.default.removeAllListeners(react_native_airship_1.EventType.NotificationResponse);
    ForegroundNotifications_1.default.disableForegroundNotifications();
    ShortcutManager_1.default.removeAllDynamicShortcuts();
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
function bind(triggerEvent, notificationType, callback) {
    var actionMap = notificationEventActionMap[triggerEvent];
    if (!actionMap) {
        actionMap = {};
    }
    actionMap[notificationType] = callback;
    notificationEventActionMap[triggerEvent] = actionMap;
}
/**
 * Bind a callback to be executed when a push notification of a given type is received.
 */
var onReceived = function (notificationType, callback) {
    bind(react_native_airship_1.EventType.PushReceived, notificationType, callback);
};
/**
 * Bind a callback to be executed when a push notification of a given type is tapped by the user.
 */
var onSelected = function (notificationType, callback) {
    bind(react_native_airship_1.EventType.NotificationResponse, notificationType, callback);
};
/**
 * Clear all push notifications
 */
var clearNotifications = function () {
    react_native_airship_1.default.push.clearNotifications();
};
var PushNotification = {
    init: init,
    register: register,
    deregister: deregister,
    onReceived: onReceived,
    onSelected: onSelected,
    TYPE: NotificationType_1.default,
    clearNotifications: clearNotifications,
};
exports.default = PushNotification;
