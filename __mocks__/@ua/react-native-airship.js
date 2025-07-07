"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iOS = exports.EventType = void 0;
// eslint-disable-next-line no-restricted-syntax
var EventType;
(function (EventType) {
    EventType["NotificationResponse"] = "com.airship.notification_response";
    EventType["PushReceived"] = "com.airship.push_received";
})(EventType || (exports.EventType = EventType = {}));
// eslint-disable-next-line @typescript-eslint/no-namespace
var iOS;
(function (iOS) {
    /**
     * Enum of foreground notification options.
     */
    // eslint-disable-next-line no-restricted-syntax, rulesdir/no-inline-named-export
    var ForegroundPresentationOption;
    (function (ForegroundPresentationOption) {
        /**
         * Play the sound associated with the notification.
         */
        ForegroundPresentationOption["Sound"] = "sound";
        /**
         * Apply the notification's badge value to the app’s icon.
         */
        ForegroundPresentationOption["Badge"] = "badge";
        /**
         * Show the notification in Notification Center. On iOS 13 an older,
         * this will also show the notification as a banner.
         */
        ForegroundPresentationOption["List"] = "list";
        /**
         * Present the notification as a banner. On iOS 13 an older,
         * this will also show the notification in the Notification Center.
         */
        ForegroundPresentationOption["Banner"] = "banner";
    })(ForegroundPresentationOption = iOS.ForegroundPresentationOption || (iOS.ForegroundPresentationOption = {}));
})(iOS || (exports.iOS = iOS = {}));
var pushIOS = jest.fn().mockImplementation(function () { return ({
    setBadgeNumber: jest.fn(),
    setForegroundPresentationOptions: jest.fn(),
    setForegroundPresentationOptionsCallback: jest.fn(),
}); })();
var pushAndroid = jest.fn().mockImplementation(function () { return ({
    setForegroundDisplayPredicate: jest.fn(),
}); })();
var push = jest.fn().mockImplementation(function () { return ({
    iOS: pushIOS,
    android: pushAndroid,
    enableUserNotifications: function () { return Promise.resolve(false); },
    clearNotifications: jest.fn(),
    getNotificationStatus: function () { return Promise.resolve({ airshipOptIn: false, systemEnabled: false, airshipEnabled: false }); },
    getActiveNotifications: function () { return Promise.resolve([]); },
}); })();
var contact = jest.fn().mockImplementation(function () { return ({
    identify: jest.fn(),
    getNamedUserId: function () { return Promise.resolve(undefined); },
    reset: jest.fn(),
    module: jest.fn(),
}); })();
var Airship = {
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
    push: push,
    contact: contact,
};
exports.default = Airship;
