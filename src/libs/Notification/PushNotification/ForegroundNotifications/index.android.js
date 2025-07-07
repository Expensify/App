"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_airship_1 = require("@ua/react-native-airship");
var shouldShowPushNotification_1 = require("@libs/Notification/PushNotification/shouldShowPushNotification");
function configureForegroundNotifications() {
    react_native_airship_1.default.push.android.setForegroundDisplayPredicate(function (pushPayload) { return Promise.resolve((0, shouldShowPushNotification_1.default)(pushPayload)); });
}
function disableForegroundNotifications() {
    react_native_airship_1.default.push.android.setForegroundDisplayPredicate(function () { return Promise.resolve(false); });
}
var ForegroundNotifications = {
    configureForegroundNotifications: configureForegroundNotifications,
    disableForegroundNotifications: disableForegroundNotifications,
};
exports.default = ForegroundNotifications;
