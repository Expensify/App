"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = shouldShowPushNotification;
var Log_1 = require("@libs/Log");
var ReportActionUtils = require("@libs/ReportActionsUtils");
var Report = require("@userActions/Report");
var parsePushNotificationPayload_1 = require("./parsePushNotificationPayload");
/**
 * Returns whether the given Airship notification should be shown depending on the current state of the app
 */
function shouldShowPushNotification(pushPayload) {
    var _a;
    Log_1.default.info('[PushNotification] push notification received', false, { pushPayload: pushPayload });
    var data = (0, parsePushNotificationPayload_1.default)(pushPayload.extras.payload);
    if (!data) {
        return true;
    }
    var shouldShow = false;
    if (data.type === 'transaction') {
        shouldShow = true;
    }
    else {
        var reportAction = ReportActionUtils.getLatestReportActionFromOnyxData((_a = data.onyxData) !== null && _a !== void 0 ? _a : null);
        shouldShow = Report.shouldShowReportActionNotification(String(data.reportID), reportAction, true);
    }
    Log_1.default.info("[PushNotification] ".concat(shouldShow ? 'Showing' : 'Not showing', " notification"));
    return shouldShow;
}
