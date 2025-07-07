"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Local Notifications are not currently supported on mobile so we'll just no-op here.
var LocalNotification = {
    showCommentNotification: function () { },
    showUpdateAvailableNotification: function () { },
    showModifiedExpenseNotification: function () { },
    clearReportNotifications: function () { },
};
exports.default = LocalNotification;
