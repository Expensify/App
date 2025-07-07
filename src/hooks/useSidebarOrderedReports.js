"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SidebarOrderedReportsContext = void 0;
exports.SidebarOrderedReportsContextProvider = SidebarOrderedReportsContextProvider;
exports.useSidebarOrderedReports = useSidebarOrderedReports;
var react_1 = require("react");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var SidebarUtils_1 = require("@libs/SidebarUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var mapOnyxCollectionItems_1 = require("@src/utils/mapOnyxCollectionItems");
var useCurrentReportID_1 = require("./useCurrentReportID");
var useCurrentUserPersonalDetails_1 = require("./useCurrentUserPersonalDetails");
var useOnyx_1 = require("./useOnyx");
var usePrevious_1 = require("./usePrevious");
var useResponsiveLayout_1 = require("./useResponsiveLayout");
var SidebarOrderedReportsContext = (0, react_1.createContext)({
    orderedReports: [],
    currentReportID: '',
    policyMemberAccountIDs: [],
});
exports.SidebarOrderedReportsContext = SidebarOrderedReportsContext;
var policySelector = function (policy) {
    return (policy && {
        type: policy.type,
        name: policy.name,
        avatarURL: policy.avatarURL,
        employeeList: policy.employeeList,
    });
};
function SidebarOrderedReportsContextProvider(_a) {
    var _b;
    var children = _a.children, 
    /**
     * Only required to make unit tests work, since we
     * explicitly pass the currentReportID in LHNTestUtils
     * to SidebarLinksData, so this context doesn't have
     * access to currentReportID in that case.
     *
     * This is a workaround to have currentReportID available in testing environment.
     */
    currentReportIDForTests = _a.currentReportIDForTests;
    var priorityMode = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PRIORITY_MODE, { initialValue: CONST_1.default.PRIORITY_MODE.DEFAULT, canBeMissing: true })[0];
    var _c = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT, { canBeMissing: true }), chatReports = _c[0], reportUpdates = _c[1].sourceValue;
    var _d = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { selector: function (c) { return (0, mapOnyxCollectionItems_1.default)(c, policySelector); }, canBeMissing: true }), policies = _d[0], policiesUpdates = _d[1].sourceValue;
    var _e = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.TRANSACTION, { canBeMissing: true }), transactions = _e[0], transactionsUpdates = _e[1].sourceValue;
    var _f = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS, { canBeMissing: true }), transactionViolations = _f[0], transactionViolationsUpdates = _f[1].sourceValue;
    var _g = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS, { canBeMissing: true }), reportNameValuePairs = _g[0], reportNameValuePairsUpdates = _g[1].sourceValue;
    var _h = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT, { initialValue: {}, canBeMissing: true }), reportsDraftsUpdates = _h[1].sourceValue;
    var betas = (0, useOnyx_1.default)(ONYXKEYS_1.default.BETAS, { canBeMissing: true })[0];
    var reportAttributes = (0, useOnyx_1.default)(ONYXKEYS_1.default.DERIVED.REPORT_ATTRIBUTES, { selector: function (value) { return value === null || value === void 0 ? void 0 : value.reports; }, canBeMissing: true })[0];
    var _j = (0, react_1.useState)({}), currentReportsToDisplay = _j[0], setCurrentReportsToDisplay = _j[1];
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var accountID = (0, useCurrentUserPersonalDetails_1.default)().accountID;
    var currentReportIDValue = (0, useCurrentReportID_1.default)();
    var derivedCurrentReportID = (_b = currentReportIDForTests !== null && currentReportIDForTests !== void 0 ? currentReportIDForTests : currentReportIDValue === null || currentReportIDValue === void 0 ? void 0 : currentReportIDValue.currentReportIDFromPath) !== null && _b !== void 0 ? _b : currentReportIDValue === null || currentReportIDValue === void 0 ? void 0 : currentReportIDValue.currentReportID;
    var prevDerivedCurrentReportID = (0, usePrevious_1.default)(derivedCurrentReportID);
    var policyMemberAccountIDs = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.getPolicyEmployeeListByIdWithoutCurrentUser)(policies, undefined, accountID); }, [policies, accountID]);
    var prevBetas = (0, usePrevious_1.default)(betas);
    var prevPriorityMode = (0, usePrevious_1.default)(priorityMode);
    /**
     * Find the reports that need to be updated in the LHN
     */
    var getUpdatedReports = (0, react_1.useCallback)(function () {
        var reportsToUpdate = [];
        if (betas !== prevBetas || priorityMode !== prevPriorityMode) {
            reportsToUpdate = Object.keys(chatReports !== null && chatReports !== void 0 ? chatReports : {});
        }
        else if (reportUpdates) {
            reportsToUpdate = Object.keys(reportUpdates !== null && reportUpdates !== void 0 ? reportUpdates : {});
        }
        else if (reportNameValuePairsUpdates) {
            reportsToUpdate = Object.keys(reportNameValuePairsUpdates !== null && reportNameValuePairsUpdates !== void 0 ? reportNameValuePairsUpdates : {}).map(function (key) { return key.replace(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS, ONYXKEYS_1.default.COLLECTION.REPORT); });
        }
        else if (transactionsUpdates) {
            reportsToUpdate = Object.values(transactionsUpdates !== null && transactionsUpdates !== void 0 ? transactionsUpdates : {}).map(function (transaction) { return "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transaction === null || transaction === void 0 ? void 0 : transaction.reportID); });
        }
        else if (transactionViolationsUpdates) {
            reportsToUpdate = Object.keys(transactionViolationsUpdates !== null && transactionViolationsUpdates !== void 0 ? transactionViolationsUpdates : {})
                .map(function (key) { return key.replace(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS, ONYXKEYS_1.default.COLLECTION.TRANSACTION); })
                .map(function (key) { var _a; return "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat((_a = transactions === null || transactions === void 0 ? void 0 : transactions[key]) === null || _a === void 0 ? void 0 : _a.reportID); });
        }
        else if (reportsDraftsUpdates) {
            reportsToUpdate = Object.keys(reportsDraftsUpdates).map(function (key) { return key.replace(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT, ONYXKEYS_1.default.COLLECTION.REPORT); });
        }
        else if (policiesUpdates) {
            var updatedPolicies_1 = Object.keys(policiesUpdates).map(function (key) { return key.replace(ONYXKEYS_1.default.COLLECTION.POLICY, ''); });
            reportsToUpdate = Object.entries(chatReports !== null && chatReports !== void 0 ? chatReports : {})
                .filter(function (_a) {
                var value = _a[1];
                if (!(value === null || value === void 0 ? void 0 : value.policyID)) {
                    return;
                }
                return updatedPolicies_1.includes(value.policyID);
            })
                .map(function (_a) {
                var key = _a[0];
                return key;
            });
        }
        // Make sure the previous and current reports are always included in the updates when we switch reports.
        if (prevDerivedCurrentReportID !== derivedCurrentReportID) {
            reportsToUpdate.push("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(prevDerivedCurrentReportID), "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(derivedCurrentReportID));
        }
        return reportsToUpdate;
    }, [
        reportUpdates,
        reportNameValuePairsUpdates,
        transactionsUpdates,
        transactionViolationsUpdates,
        reportsDraftsUpdates,
        policiesUpdates,
        chatReports,
        transactions,
        betas,
        priorityMode,
        prevBetas,
        prevPriorityMode,
        prevDerivedCurrentReportID,
        derivedCurrentReportID,
    ]);
    var reportsToDisplayInLHN = (0, react_1.useMemo)(function () {
        var updatedReports = getUpdatedReports();
        var shouldDoIncrementalUpdate = updatedReports.length > 0 && Object.keys(currentReportsToDisplay).length > 0;
        var reportsToDisplay = {};
        if (shouldDoIncrementalUpdate) {
            reportsToDisplay = SidebarUtils_1.default.updateReportsToDisplayInLHN(currentReportsToDisplay, chatReports, updatedReports, derivedCurrentReportID, priorityMode === CONST_1.default.PRIORITY_MODE.GSD, betas, policies, transactionViolations, reportNameValuePairs, reportAttributes);
        }
        else {
            reportsToDisplay = SidebarUtils_1.default.getReportsToDisplayInLHN(derivedCurrentReportID, chatReports, betas, policies, priorityMode, transactionViolations, reportNameValuePairs, reportAttributes);
        }
        return reportsToDisplay;
        // Rule disabled intentionally — triggering a re-render on currentReportsToDisplay would cause an infinite loop
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [getUpdatedReports, chatReports, derivedCurrentReportID, priorityMode, betas, policies, transactionViolations, reportNameValuePairs, reportAttributes]);
    (0, react_1.useEffect)(function () {
        setCurrentReportsToDisplay(reportsToDisplayInLHN);
    }, [reportsToDisplayInLHN]);
    var getOrderedReportIDs = (0, react_1.useCallback)(function () { return SidebarUtils_1.default.sortReportsToDisplayInLHN(reportsToDisplayInLHN, priorityMode, reportNameValuePairs, reportAttributes); }, 
    // Rule disabled intentionally - reports should be sorted only when the reportsToDisplayInLHN changes
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    [reportsToDisplayInLHN]);
    var orderedReportIDs = (0, react_1.useMemo)(function () { return getOrderedReportIDs(); }, [getOrderedReportIDs]);
    // Get the actual reports based on the ordered IDs
    var getOrderedReports = (0, react_1.useCallback)(function (reportIDs) {
        if (!chatReports) {
            return [];
        }
        return reportIDs.map(function (reportID) { return chatReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)]; }).filter(Boolean);
    }, [chatReports]);
    var orderedReports = (0, react_1.useMemo)(function () { return getOrderedReports(orderedReportIDs); }, [getOrderedReports, orderedReportIDs]);
    var contextValue = (0, react_1.useMemo)(function () {
        // We need to make sure the current report is in the list of reports, but we do not want
        // to have to re-generate the list every time the currentReportID changes. To do that
        // we first generate the list as if there was no current report, then we check if
        // the current report is missing from the list, which should very rarely happen. In this
        // case we re-generate the list a 2nd time with the current report included.
        // We also execute the following logic if `shouldUseNarrowLayout` is false because this is
        // requirement for web and desktop. Consider a case, where we have report with expenses and we click on
        // any expense, a new LHN item is added in the list and is visible on web and desktop. But on mobile, we
        // just navigate to the screen with expense details, so there seems no point to execute this logic on mobile.
        if ((!shouldUseNarrowLayout || orderedReportIDs.length === 0) &&
            derivedCurrentReportID &&
            derivedCurrentReportID !== '-1' &&
            orderedReportIDs.indexOf(derivedCurrentReportID) === -1) {
            var updatedReportIDs = getOrderedReportIDs();
            var updatedReports = getOrderedReports(updatedReportIDs);
            return {
                orderedReports: updatedReports,
                currentReportID: derivedCurrentReportID,
                policyMemberAccountIDs: policyMemberAccountIDs,
            };
        }
        return {
            orderedReports: orderedReports,
            currentReportID: derivedCurrentReportID,
            policyMemberAccountIDs: policyMemberAccountIDs,
        };
    }, [getOrderedReportIDs, orderedReportIDs, derivedCurrentReportID, policyMemberAccountIDs, shouldUseNarrowLayout, getOrderedReports, orderedReports]);
    return <SidebarOrderedReportsContext.Provider value={contextValue}>{children}</SidebarOrderedReportsContext.Provider>;
}
function useSidebarOrderedReports() {
    return (0, react_1.useContext)(SidebarOrderedReportsContext);
}
