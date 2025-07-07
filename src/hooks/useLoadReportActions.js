"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var useNetwork_1 = require("./useNetwork");
/**
 * Provides reusable logic to get the functions for loading older/newer reportActions.
 * Used in the report displaying components
 */
function useLoadReportActions(_a) {
    var reportID = _a.reportID, reportActionID = _a.reportActionID, reportActions = _a.reportActions, allReportActionIDs = _a.allReportActionIDs, transactionThreadReport = _a.transactionThreadReport, hasOlderActions = _a.hasOlderActions, hasNewerActions = _a.hasNewerActions;
    var didLoadOlderChats = (0, react_1.useRef)(false);
    var didLoadNewerChats = (0, react_1.useRef)(false);
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var isFocused = (0, native_1.useIsFocused)();
    var newestReportAction = (0, react_1.useMemo)(function () { return reportActions === null || reportActions === void 0 ? void 0 : reportActions.at(0); }, [reportActions]);
    var oldestReportAction = (0, react_1.useMemo)(function () { return reportActions === null || reportActions === void 0 ? void 0 : reportActions.at(-1); }, [reportActions]);
    // Track oldest/newest actions per report in a single pass
    var _b = (0, react_1.useMemo)(function () {
        var currentReportNewestAction = null;
        var currentReportOldestAction = null;
        var transactionThreadNewestAction = null;
        var transactionThreadOldestAction = null;
        var allReportActionIDsSet = new Set(allReportActionIDs);
        for (var _i = 0, reportActions_1 = reportActions; _i < reportActions_1.length; _i++) {
            var action = reportActions_1[_i];
            // Determine which report this action belongs to
            var isCurrentReport = allReportActionIDsSet.has(action.reportActionID);
            var targetReportID = isCurrentReport ? reportID : transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.reportID;
            // Track newest/oldest per report
            if (targetReportID === reportID) {
                // Newest = first matching action we encounter
                if (!currentReportNewestAction) {
                    currentReportNewestAction = action;
                }
                // Oldest = last matching action we encounter
                currentReportOldestAction = action;
            }
            else if (!(0, EmptyObject_1.isEmptyObject)(transactionThreadReport) && (transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.reportID) === targetReportID) {
                // Same logic for transaction thread
                if (!transactionThreadNewestAction) {
                    transactionThreadNewestAction = action;
                }
                transactionThreadOldestAction = action;
            }
        }
        return {
            currentReportOldest: currentReportOldestAction,
            currentReportNewest: currentReportNewestAction,
            transactionThreadOldest: transactionThreadOldestAction,
            transactionThreadNewest: transactionThreadNewestAction,
        };
    }, [reportActions, allReportActionIDs, reportID, transactionThreadReport]), currentReportOldest = _b.currentReportOldest, currentReportNewest = _b.currentReportNewest, transactionThreadOldest = _b.transactionThreadOldest, transactionThreadNewest = _b.transactionThreadNewest;
    /**
     * Retrieves the next set of reportActions for the chat once we are nearing the end of what we are currently
     * displaying.
     */
    var loadOlderChats = (0, react_1.useCallback)(function (force) {
        if (force === void 0) { force = false; }
        // Only fetch more if we are neither already fetching (so that we don't initiate duplicate requests) nor offline.
        if (!force && isOffline) {
            return;
        }
        // Don't load more reportActions if we're already at the beginning of the chat history
        if (!oldestReportAction || !hasOlderActions) {
            return;
        }
        didLoadOlderChats.current = true;
        if (!(0, EmptyObject_1.isEmptyObject)(transactionThreadReport)) {
            (0, Report_1.getOlderActions)(reportID, currentReportOldest === null || currentReportOldest === void 0 ? void 0 : currentReportOldest.reportActionID);
            (0, Report_1.getOlderActions)(transactionThreadReport.reportID, transactionThreadOldest === null || transactionThreadOldest === void 0 ? void 0 : transactionThreadOldest.reportActionID);
        }
        else {
            (0, Report_1.getOlderActions)(reportID, currentReportOldest === null || currentReportOldest === void 0 ? void 0 : currentReportOldest.reportActionID);
        }
    }, [isOffline, oldestReportAction, hasOlderActions, transactionThreadReport, reportID, currentReportOldest === null || currentReportOldest === void 0 ? void 0 : currentReportOldest.reportActionID, transactionThreadOldest === null || transactionThreadOldest === void 0 ? void 0 : transactionThreadOldest.reportActionID]);
    var loadNewerChats = (0, react_1.useCallback)(function (force) {
        if (force === void 0) { force = false; }
        if (!force &&
            (!reportActionID ||
                !isFocused ||
                !newestReportAction ||
                !hasNewerActions ||
                isOffline ||
                // If there was an error only try again once on initial mount. We should also still load
                // more in case we have cached messages.
                didLoadNewerChats.current ||
                newestReportAction.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE)) {
            return;
        }
        didLoadNewerChats.current = true;
        if (!(0, EmptyObject_1.isEmptyObject)(transactionThreadReport)) {
            (0, Report_1.getNewerActions)(reportID, currentReportNewest === null || currentReportNewest === void 0 ? void 0 : currentReportNewest.reportActionID);
            (0, Report_1.getNewerActions)(transactionThreadReport.reportID, transactionThreadNewest === null || transactionThreadNewest === void 0 ? void 0 : transactionThreadNewest.reportActionID);
        }
        else if (newestReportAction) {
            (0, Report_1.getNewerActions)(reportID, newestReportAction.reportActionID);
        }
    }, [
        reportActionID,
        isFocused,
        newestReportAction,
        hasNewerActions,
        isOffline,
        transactionThreadReport,
        reportID,
        currentReportNewest === null || currentReportNewest === void 0 ? void 0 : currentReportNewest.reportActionID,
        transactionThreadNewest === null || transactionThreadNewest === void 0 ? void 0 : transactionThreadNewest.reportActionID,
    ]);
    return {
        loadOlderChats: loadOlderChats,
        loadNewerChats: loadNewerChats,
    };
}
exports.default = useLoadReportActions;
