"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NotificationType = {
    REPORT_ACTION: 'reportAction',
    REPORT_COMMENT: 'reportComment',
    TRANSACTION: 'transaction',
};
/**
 * See https://github.com/Expensify/Web-Expensify/blob/main/lib/MobilePushNotifications.php for the various
 * types of push notifications sent by our API.
 */
exports.default = NotificationType;
