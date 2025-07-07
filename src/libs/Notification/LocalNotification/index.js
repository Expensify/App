"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BrowserNotifications_1 = require("./BrowserNotifications");
function showCommentNotification(report, reportAction, onClick) {
    BrowserNotifications_1.default.pushReportCommentNotification(report, reportAction, onClick, true);
}
function showUpdateAvailableNotification() {
    BrowserNotifications_1.default.pushUpdateAvailableNotification();
}
function showModifiedExpenseNotification(report, reportAction, onClick) {
    BrowserNotifications_1.default.pushModifiedExpenseNotification(report, reportAction, onClick, true);
}
function clearReportNotifications(reportID) {
    if (!reportID) {
        return;
    }
    BrowserNotifications_1.default.clearNotifications(function (notificationData) { return notificationData.reportID === reportID; });
}
var LocalNotification = {
    showCommentNotification: showCommentNotification,
    showUpdateAvailableNotification: showUpdateAvailableNotification,
    showModifiedExpenseNotification: showModifiedExpenseNotification,
    clearReportNotifications: clearReportNotifications,
};
exports.default = LocalNotification;
