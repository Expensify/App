"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAllRelatedReportActionErrors = clearAllRelatedReportActionErrors;
var react_native_onyx_1 = require("react-native-onyx");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var Report_1 = require("./Report");
var allReportActions;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: function (value) { return (allReportActions = value); },
});
var allReports;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: function (value) {
        allReports = value;
    },
});
function clearReportActionErrors(reportID, reportAction, keys) {
    var _a, _b, _c;
    var _d;
    var originalReportID = (0, ReportUtils_1.getOriginalReportID)(reportID, reportAction);
    if (!(reportAction === null || reportAction === void 0 ? void 0 : reportAction.reportActionID)) {
        return;
    }
    if (reportAction.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD || reportAction.isOptimisticAction) {
        // Delete the optimistic action
        react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(originalReportID), (_a = {},
            _a[reportAction.reportActionID] = null,
            _a));
        // If there's a linked transaction, delete that too
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        var linkedTransactionID = (0, ReportActionsUtils_1.getLinkedTransactionID)(reportAction.reportActionID, originalReportID);
        if (linkedTransactionID) {
            react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(linkedTransactionID), null);
            react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportAction.childReportID), null);
        }
        // Delete the failed task report too
        var taskReportID = (_d = (0, ReportActionsUtils_1.getReportActionMessage)(reportAction)) === null || _d === void 0 ? void 0 : _d.taskReportID;
        if (taskReportID && (0, ReportActionsUtils_1.isCreatedTaskReportAction)(reportAction)) {
            (0, Report_1.deleteReport)(taskReportID);
        }
        return;
    }
    if (keys) {
        var errors_1 = {};
        keys.forEach(function (key) {
            errors_1[key] = null;
        });
        react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(originalReportID), (_b = {},
            _b[reportAction.reportActionID] = {
                errors: errors_1,
            },
            _b));
        return;
    }
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(originalReportID), (_c = {},
        _c[reportAction.reportActionID] = {
            errors: null,
        },
        _c));
}
/**
 *
ignore: `undefined` means we want to check both parent and children report actions
ignore: `parent` or `child` means we want to ignore checking parent or child report actions because they've been previously checked
 */
function clearAllRelatedReportActionErrors(reportID, reportAction, ignore, keys) {
    var _a, _b, _c;
    var errorKeys = keys !== null && keys !== void 0 ? keys : Object.keys((_a = reportAction === null || reportAction === void 0 ? void 0 : reportAction.errors) !== null && _a !== void 0 ? _a : {});
    if (!reportAction || errorKeys.length === 0 || !reportID) {
        return;
    }
    clearReportActionErrors(reportID, reportAction, keys);
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    if ((report === null || report === void 0 ? void 0 : report.parentReportID) && (report === null || report === void 0 ? void 0 : report.parentReportActionID) && ignore !== 'parent') {
        var parentReportAction = (0, ReportActionsUtils_1.getReportAction)(report.parentReportID, report.parentReportActionID);
        var parentErrorKeys = Object.keys((_b = parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.errors) !== null && _b !== void 0 ? _b : {}).filter(function (err) { return errorKeys.includes(err); });
        clearAllRelatedReportActionErrors(report.parentReportID, parentReportAction, 'child', parentErrorKeys);
    }
    if (reportAction.childReportID && ignore !== 'child') {
        var childActions = (_c = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportAction.childReportID)]) !== null && _c !== void 0 ? _c : {};
        Object.values(childActions).forEach(function (action) {
            var _a;
            var childErrorKeys = Object.keys((_a = action.errors) !== null && _a !== void 0 ? _a : {}).filter(function (err) { return errorKeys.includes(err); });
            clearAllRelatedReportActionErrors(reportAction.childReportID, action, 'parent', childErrorKeys);
        });
    }
}
