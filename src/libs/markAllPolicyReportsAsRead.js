"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = markAllPolicyReportsAsRead;
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var Report_1 = require("./actions/Report");
var ReportActionsUtils_1 = require("./ReportActionsUtils");
var ReportUtils_1 = require("./ReportUtils");
var allReports = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: function (value) {
        allReports = value;
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
function markAllPolicyReportsAsRead(policyID) {
    var delay = 0;
    Object.keys(allReports !== null && allReports !== void 0 ? allReports : {}).forEach(function (key) {
        var report = allReports === null || allReports === void 0 ? void 0 : allReports[key];
        var chatReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report === null || report === void 0 ? void 0 : report.chatReportID)];
        var oneTransactionThreadReportID = (0, ReportActionsUtils_1.getOneTransactionThreadReportID)(report, chatReport, allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report === null || report === void 0 ? void 0 : report.reportID)]);
        var oneTransactionThreadReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(oneTransactionThreadReportID)];
        if ((report === null || report === void 0 ? void 0 : report.policyID) !== policyID || !(0, ReportUtils_1.isUnread)(report, oneTransactionThreadReport)) {
            return;
        }
        setTimeout(function () {
            (0, Report_1.readNewestAction)(report === null || report === void 0 ? void 0 : report.reportID);
        }, delay);
        delay += 1000;
    });
}
