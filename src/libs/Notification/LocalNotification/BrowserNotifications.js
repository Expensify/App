"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Web and desktop implementation only. Do not import for direct use. Use LocalNotification.
var expensify_common_1 = require("expensify-common");
var expensify_logo_round_clearspace_png_1 = require("@assets/images/expensify-logo-round-clearspace.png");
var AppUpdate = require("@libs/actions/AppUpdate");
var ModifiedExpenseMessage_1 = require("@libs/ModifiedExpenseMessage");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils = require("@libs/ReportUtils");
var Sound_1 = require("@libs/Sound");
var focusApp_1 = require("./focusApp");
var notificationCache = {};
/**
 * Checks if the user has granted permission to show browser notifications
 */
function canUseBrowserNotifications() {
    return new Promise(function (resolve) {
        // They have no browser notifications so we can't use this feature
        if (!window.Notification) {
            resolve(false);
            return;
        }
        // Check if they previously granted or denied us access to send a notification
        var permissionGranted = Notification.permission === 'granted';
        if (permissionGranted || Notification.permission === 'denied') {
            resolve(permissionGranted);
            return;
        }
        // Check their global preferences for browser notifications and ask permission if they have none
        Notification.requestPermission().then(function (status) {
            resolve(status === 'granted');
        });
    });
}
/**
 * Light abstraction around browser push notifications.
 * Checks for permission before determining whether to send.
 *
 * @param icon Path to icon
 * @param data extra data to attach to the notification
 */
function push(title, body, icon, data, onClick, silent, tag) {
    if (body === void 0) { body = ''; }
    if (icon === void 0) { icon = ''; }
    if (data === void 0) { data = {}; }
    if (onClick === void 0) { onClick = function () { }; }
    if (silent === void 0) { silent = false; }
    if (tag === void 0) { tag = ''; }
    canUseBrowserNotifications().then(function (canUseNotifications) {
        if (!canUseNotifications) {
            return;
        }
        // We cache these notifications so that we can clear them later
        var notificationID = expensify_common_1.Str.guid();
        notificationCache[notificationID] = new Notification(title, {
            body: body,
            icon: String(icon),
            data: data,
            silent: true,
            tag: tag,
        });
        if (!silent) {
            (0, Sound_1.default)(Sound_1.SOUNDS.RECEIVE);
        }
        notificationCache[notificationID].onclick = function () {
            onClick();
            window.parent.focus();
            window.focus();
            (0, focusApp_1.default)();
            notificationCache[notificationID].close();
        };
        notificationCache[notificationID].onclose = function () {
            delete notificationCache[notificationID];
        };
    });
}
/**
 * BrowserNotification
 * @namespace
 */
exports.default = {
    /**
     * Create a report comment notification
     *
     * @param usesIcon true if notification uses right circular icon
     */
    pushReportCommentNotification: function (report, reportAction, onClick, usesIcon) {
        var _a, _b;
        if (usesIcon === void 0) { usesIcon = false; }
        var title;
        var body;
        var icon = usesIcon ? expensify_logo_round_clearspace_png_1.default : '';
        var isChatRoom = ReportUtils.isChatRoom(report) || ReportUtils.isPolicyExpenseChat(report);
        var person = reportAction.person, message = reportAction.message;
        var plainTextPerson = (_a = person === null || person === void 0 ? void 0 : person.map(function (f) { var _a; return expensify_common_1.Str.removeSMSDomain((_a = f.text) !== null && _a !== void 0 ? _a : ''); }).join()) !== null && _a !== void 0 ? _a : '';
        // Specifically target the comment part of the message
        var plainTextMessage = '';
        if (Array.isArray(message)) {
            plainTextMessage = (0, ReportActionsUtils_1.getTextFromHtml)((_b = message === null || message === void 0 ? void 0 : message.find(function (f) { return (f === null || f === void 0 ? void 0 : f.type) === 'COMMENT'; })) === null || _b === void 0 ? void 0 : _b.html);
        }
        else {
            plainTextMessage = (message === null || message === void 0 ? void 0 : message.type) === 'COMMENT' ? (0, ReportActionsUtils_1.getTextFromHtml)(message === null || message === void 0 ? void 0 : message.html) : '';
        }
        if (isChatRoom) {
            var roomName = ReportUtils.getReportName(report);
            title = roomName;
            body = "".concat(plainTextPerson, ": ").concat(plainTextMessage);
        }
        else {
            title = plainTextPerson;
            body = plainTextMessage;
        }
        var data = {
            reportID: report.reportID,
        };
        push(title, body, icon, data, onClick);
    },
    pushModifiedExpenseNotification: function (report, reportAction, onClick, usesIcon) {
        var _a, _b;
        if (usesIcon === void 0) { usesIcon = false; }
        var title = (_b = (_a = reportAction.person) === null || _a === void 0 ? void 0 : _a.map(function (f) { return f.text; }).join(', ')) !== null && _b !== void 0 ? _b : '';
        var body = ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: report.reportID, reportAction: reportAction });
        var icon = usesIcon ? expensify_logo_round_clearspace_png_1.default : '';
        var data = {
            reportID: report.reportID,
        };
        push(title, body, icon, data, onClick);
    },
    /**
     * Create a notification to indicate that an update is available.
     */
    pushUpdateAvailableNotification: function () {
        push('Update available', 'A new version of this app is available!', '', {}, function () {
            AppUpdate.triggerUpdateAvailable();
        }, false, 'UpdateAvailable');
    },
    /**
     * Clears all open notifications where shouldClearNotification returns true
     *
     * @param shouldClearNotification a function that receives notification.data and returns true/false if the notification should be cleared
     */
    clearNotifications: function (shouldClearNotification) {
        Object.values(notificationCache)
            .filter(function (notification) { return shouldClearNotification(notification.data); })
            .forEach(function (notification) { return notification.close(); });
    },
};
