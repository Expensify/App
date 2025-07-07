"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerUnreadUpdate = void 0;
exports.getUnreadReportsForUnreadIndicator = getUnreadReportsForUnreadIndicator;
var debounce_1 = require("lodash/debounce");
var react_native_onyx_1 = require("react-native-onyx");
var memoize_1 = require("@libs/memoize");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils = require("@libs/ReportUtils");
var Navigation_1 = require("@navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var updateUnread_1 = require("./updateUnread");
var allReports = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: function (value) {
        allReports = value;
    },
});
var allReportNameValuePairs = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS,
    waitForCollectionCallback: true,
    callback: function (value) {
        allReportNameValuePairs = value;
    },
});
var allReportActions = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: function (value) {
        allReportActions = value;
    },
});
function getUnreadReportsForUnreadIndicator(reports, currentReportID) {
    return Object.values(reports !== null && reports !== void 0 ? reports : {}).filter(function (report) {
        var notificationPreference = ReportUtils.getReportNotificationPreference(report);
        var chatReport = reports === null || reports === void 0 ? void 0 : reports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report === null || report === void 0 ? void 0 : report.chatReportID)];
        var oneTransactionThreadReportID = (0, ReportActionsUtils_1.getOneTransactionThreadReportID)(report, chatReport, allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report === null || report === void 0 ? void 0 : report.reportID)]);
        var oneTransactionThreadReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(oneTransactionThreadReportID)];
        var nameValuePairs = allReportNameValuePairs === null || allReportNameValuePairs === void 0 ? void 0 : allReportNameValuePairs["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report === null || report === void 0 ? void 0 : report.reportID)];
        var isReportArchived = ReportUtils.isArchivedReport(nameValuePairs);
        return (ReportUtils.isUnread(report, oneTransactionThreadReport) &&
            ReportUtils.shouldReportBeInOptionList({
                report: report,
                chatReport: chatReport,
                currentReportId: currentReportID,
                betas: [],
                doesReportHaveViolations: false,
                isInFocusMode: false,
                excludeEmptyChats: false,
                isReportArchived: isReportArchived,
            }) &&
            /**
             * Chats with hidden preference remain invisible in the LHN and are not considered "unread."
             * They are excluded from the LHN rendering, but not filtered from the "option list."
             * This ensures they appear in Search, but not in the LHN or unread count.
             *
             * Furthermore, muted reports may or may not appear in the LHN depending on priority mode,
             * but they should not be considered in the unread indicator count.
             */
            !ReportUtils.isHiddenForCurrentUser(notificationPreference) &&
            notificationPreference !== CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.MUTE);
    });
}
var memoizedGetUnreadReportsForUnreadIndicator = (0, memoize_1.default)(getUnreadReportsForUnreadIndicator, { maxArgs: 1 });
var triggerUnreadUpdate = (0, debounce_1.default)(function () {
    var _a;
    var currentReportID = ((_a = Navigation_1.navigationRef === null || Navigation_1.navigationRef === void 0 ? void 0 : Navigation_1.navigationRef.isReady) === null || _a === void 0 ? void 0 : _a.call(Navigation_1.navigationRef)) ? Navigation_1.default.getTopmostReportId() : undefined;
    // We want to keep notification count consistent with what can be accessed from the LHN list
    var unreadReports = memoizedGetUnreadReportsForUnreadIndicator(allReports, currentReportID);
    (0, updateUnread_1.default)(unreadReports.length);
}, CONST_1.default.TIMING.UNREAD_UPDATE_DEBOUNCE_TIME);
exports.triggerUnreadUpdate = triggerUnreadUpdate;
(_a = Navigation_1.navigationRef === null || Navigation_1.navigationRef === void 0 ? void 0 : Navigation_1.navigationRef.addListener) === null || _a === void 0 ? void 0 : _a.call(Navigation_1.navigationRef, 'state', function () {
    triggerUnreadUpdate();
});
