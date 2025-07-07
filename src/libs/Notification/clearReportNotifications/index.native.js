"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_airship_1 = require("@ua/react-native-airship");
var Log_1 = require("@libs/Log");
var parsePushNotificationPayload_1 = require("@libs/Notification/PushNotification/parsePushNotificationPayload");
var CONST_1 = require("@src/CONST");
var parseNotificationAndReportIDs = function (pushPayload) {
    var data = (0, parsePushNotificationPayload_1.default)(pushPayload.extras.payload);
    return {
        notificationID: pushPayload.notificationId,
        reportID: (data === null || data === void 0 ? void 0 : data.reportID) !== undefined ? String(data.reportID) : undefined,
    };
};
var clearReportNotifications = function (reportID) {
    Log_1.default.info('[PushNotification] clearing report notifications', false, { reportID: reportID });
    if (!reportID) {
        return;
    }
    react_native_airship_1.default.push
        .getActiveNotifications()
        .then(function (pushPayloads) {
        var reportNotificationIDs = pushPayloads.reduce(function (notificationIDs, pushPayload) {
            var notification = parseNotificationAndReportIDs(pushPayload);
            if (notification.notificationID && notification.reportID === reportID) {
                notificationIDs.push(notification.notificationID);
            }
            return notificationIDs;
        }, []);
        Log_1.default.info("[PushNotification] found ".concat(reportNotificationIDs.length, " notifications to clear"), false, { reportID: reportID });
        reportNotificationIDs.forEach(function (notificationID) { return react_native_airship_1.default.push.clearNotification(notificationID); });
    })
        .catch(function (error) {
        Log_1.default.alert("".concat(CONST_1.default.ERROR.ENSURE_BUG_BOT, " [PushNotification] BrowserNotifications.clearReportNotifications threw an error. This should never happen."), { reportID: reportID, error: error });
    });
};
exports.default = clearReportNotifications;
