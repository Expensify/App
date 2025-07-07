"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var getNonEmptyStringOnyxID_1 = require("@libs/getNonEmptyStringOnyxID");
var PaginationUtils_1 = require("@libs/PaginationUtils");
var ReportActionsUtils = require("@libs/ReportActionsUtils");
var ReportUtils = require("@libs/ReportUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useOnyx_1 = require("./useOnyx");
/**
 * Get the longest continuous chunk of reportActions including the linked reportAction. If not linking to a specific action, returns the continuous chunk of newest reportActions.
 */
function usePaginatedReportActions(reportID, reportActionID) {
    var nonEmptyStringReportID = (0, getNonEmptyStringOnyxID_1.default)(reportID);
    var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(nonEmptyStringReportID))[0];
    var canUserPerformWriteAction = ReportUtils.canUserPerformWriteAction(report);
    var sortedAllReportActions = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(nonEmptyStringReportID), {
        canEvict: false,
        selector: function (allReportActions) { return ReportActionsUtils.getSortedReportActionsForDisplay(allReportActions, canUserPerformWriteAction, true); },
    })[0];
    var reportActionPages = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_PAGES).concat(nonEmptyStringReportID))[0];
    var _a = (0, react_1.useMemo)(function () {
        if (!(sortedAllReportActions === null || sortedAllReportActions === void 0 ? void 0 : sortedAllReportActions.length)) {
            return { data: [], hasNextPage: false, hasPreviousPage: false };
        }
        return PaginationUtils_1.default.getContinuousChain(sortedAllReportActions, reportActionPages !== null && reportActionPages !== void 0 ? reportActionPages : [], function (reportAction) { return reportAction.reportActionID; }, reportActionID);
    }, [reportActionID, reportActionPages, sortedAllReportActions]), reportActions = _a.data, hasNextPage = _a.hasNextPage, hasPreviousPage = _a.hasPreviousPage;
    var linkedAction = (0, react_1.useMemo)(function () { return (reportActionID ? sortedAllReportActions === null || sortedAllReportActions === void 0 ? void 0 : sortedAllReportActions.find(function (reportAction) { return String(reportAction.reportActionID) === String(reportActionID); }) : undefined); }, [reportActionID, sortedAllReportActions]);
    return {
        reportActions: reportActions,
        linkedAction: linkedAction,
        sortedAllReportActions: sortedAllReportActions,
        hasOlderActions: hasNextPage,
        hasNewerActions: hasPreviousPage,
    };
}
exports.default = usePaginatedReportActions;
