"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var portal_1 = require("@gorhom/portal");
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderGap_1 = require("@components/HeaderGap");
var MoneyReportHeader_1 = require("@components/MoneyReportHeader");
var MoneyRequestHeader_1 = require("@components/MoneyRequestHeader");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ReportActionsSkeletonView_1 = require("@components/ReportActionsSkeletonView");
var ReportHeaderSkeletonView_1 = require("@components/ReportHeaderSkeletonView");
var useNetwork_1 = require("@hooks/useNetwork");
var useNewTransactions_1 = require("@hooks/useNewTransactions");
var useOnyx_1 = require("@hooks/useOnyx");
var usePaginatedReportActions_1 = require("@hooks/usePaginatedReportActions");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Report_1 = require("@libs/actions/Report");
var getNonEmptyStringOnyxID_1 = require("@libs/getNonEmptyStringOnyxID");
var Log_1 = require("@libs/Log");
var MoneyRequestReportUtils_1 = require("@libs/MoneyRequestReportUtils");
var navigationRef_1 = require("@libs/Navigation/navigationRef");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var SearchQueryUtils_1 = require("@libs/SearchQueryUtils");
var Navigation_1 = require("@navigation/Navigation");
var ReportActionsView_1 = require("@pages/home/report/ReportActionsView");
var ReportFooter_1 = require("@pages/home/report/ReportFooter");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var MoneyRequestReportActionsList_1 = require("./MoneyRequestReportActionsList");
function goBackFromSearchMoneyRequest() {
    var rootState = navigationRef_1.default.getRootState();
    var lastRoute = rootState.routes.at(-1);
    if ((lastRoute === null || lastRoute === void 0 ? void 0 : lastRoute.name) !== NAVIGATORS_1.default.SEARCH_FULLSCREEN_NAVIGATOR) {
        Log_1.default.hmmm('[goBackFromSearchMoneyRequest()] goBackFromSearchMoneyRequest was called from a different navigator than SearchFullscreenNavigator.');
        return;
    }
    if (rootState.routes.length > 1) {
        Navigation_1.default.goBack();
        return;
    }
    Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ROOT.getRoute({ query: (0, SearchQueryUtils_1.buildCannedSearchQuery)() }));
}
function InitialLoadingSkeleton(_a) {
    var styles = _a.styles;
    return (<react_native_1.View style={[styles.flex1]}>
            <react_native_1.View style={[styles.appContentHeader, styles.borderBottom]}>
                <ReportHeaderSkeletonView_1.default onBackButtonPress={function () { }}/>
            </react_native_1.View>
            <ReportActionsSkeletonView_1.default />
        </react_native_1.View>);
}
function getParentReportAction(parentReportActions, parentReportActionID) {
    if (!parentReportActions || !parentReportActionID) {
        return;
    }
    return parentReportActions[parentReportActionID];
}
function MoneyRequestReportView(_a) {
    var report = _a.report, policy = _a.policy, reportMetadata = _a.reportMetadata, shouldDisplayReportFooter = _a.shouldDisplayReportFooter, backToRoute = _a.backToRoute;
    var styles = (0, useThemeStyles_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var reportID = report === null || report === void 0 ? void 0 : report.reportID;
    var isLoadingApp = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_APP, { canBeMissing: true })[0];
    var isComposerFullSize = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE).concat(reportID), { initialValue: false, canBeMissing: true })[0];
    var _b = (0, ReportUtils_1.getReportOfflinePendingActionAndErrors)(report), reportPendingAction = _b.reportPendingAction, reportErrors = _b.reportErrors;
    var chatReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat((0, getNonEmptyStringOnyxID_1.default)(report === null || report === void 0 ? void 0 : report.chatReportID)), { canBeMissing: true })[0];
    var _c = (0, usePaginatedReportActions_1.default)(reportID), unfilteredReportActions = _c.reportActions, hasNewerActions = _c.hasNewerActions, hasOlderActions = _c.hasOlderActions;
    var reportActions = (0, ReportActionsUtils_1.getFilteredReportActionsForReportView)(unfilteredReportActions);
    var transactions = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.TRANSACTION, {
        selector: function (allTransactions) { return (0, MoneyRequestReportUtils_1.selectAllTransactionsForReport)(allTransactions, reportID, reportActions); },
        canBeMissing: true,
    })[0];
    var reportTransactionIDs = transactions === null || transactions === void 0 ? void 0 : transactions.map(function (transaction) { return transaction.transactionID; });
    var transactionThreadReportID = (0, ReportActionsUtils_1.getOneTransactionThreadReportID)(report, chatReport, reportActions !== null && reportActions !== void 0 ? reportActions : [], isOffline, reportTransactionIDs);
    var newTransactions = (0, useNewTransactions_1.default)(reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.hasOnceLoadedReportActions, transactions);
    var parentReportAction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat((0, getNonEmptyStringOnyxID_1.default)(report === null || report === void 0 ? void 0 : report.parentReportID)), {
        canEvict: false,
        canBeMissing: true,
        selector: function (parentReportActions) { return getParentReportAction(parentReportActions, report === null || report === void 0 ? void 0 : report.parentReportActionID); },
    })[0];
    var lastReportAction = __spreadArray(__spreadArray([], reportActions, true), [parentReportAction], false).find(function (action) { return (0, ReportUtils_1.canEditReportAction)(action) && !(0, ReportActionsUtils_1.isMoneyRequestAction)(action); });
    var isLoadingInitialReportActions = reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.isLoadingInitialReportActions;
    var dismissReportCreationError = (0, react_1.useCallback)(function () {
        goBackFromSearchMoneyRequest();
        react_native_1.InteractionManager.runAfterInteractions(function () { return (0, Report_1.removeFailedReport)(reportID); });
    }, [reportID]);
    // Special case handling a report that is a transaction thread
    // If true we will use standard `ReportActionsView` to display report data and a special header, anything else is handled via `MoneyRequestReportActionsList`
    var isTransactionThreadView = (0, ReportUtils_1.isReportTransactionThread)(report);
    // Prevent the empty state flash by ensuring transaction data is fully loaded before deciding which view to render
    // We need to wait for both the selector to finish AND ensure we're not in a loading state where transactions could still populate
    var shouldWaitForTransactions = (0, MoneyRequestReportUtils_1.shouldWaitForTransactions)(report, transactions, reportMetadata);
    var isEmptyTransactionReport = transactions && transactions.length === 0 && transactionThreadReportID === undefined;
    var shouldDisplayMoneyRequestActionsList = !!isEmptyTransactionReport || (0, MoneyRequestReportUtils_1.shouldDisplayReportTableView)(report, transactions !== null && transactions !== void 0 ? transactions : []);
    var reportHeaderView = (0, react_1.useMemo)(function () {
        return isTransactionThreadView ? (<MoneyRequestHeader_1.default report={report} policy={policy} parentReportAction={parentReportAction} onBackButtonPress={function () {
                if (!backToRoute) {
                    goBackFromSearchMoneyRequest();
                    return;
                }
                Navigation_1.default.goBack(backToRoute);
            }}/>) : (<MoneyReportHeader_1.default report={report} policy={policy} reportActions={reportActions} transactionThreadReportID={transactionThreadReportID} isLoadingInitialReportActions={isLoadingInitialReportActions} shouldDisplayBackButton onBackButtonPress={function () {
                if (!backToRoute) {
                    goBackFromSearchMoneyRequest();
                    return;
                }
                Navigation_1.default.goBack(backToRoute);
            }}/>);
    }, [backToRoute, isLoadingInitialReportActions, isTransactionThreadView, parentReportAction, policy, report, reportActions, transactionThreadReportID]);
    if (!!(isLoadingInitialReportActions && reportActions.length === 0 && !isOffline) || shouldWaitForTransactions) {
        return <InitialLoadingSkeleton styles={styles}/>;
    }
    if (reportActions.length === 0) {
        return <ReportActionsSkeletonView_1.default shouldAnimate={false}/>;
    }
    if (!report) {
        return;
    }
    if (isLoadingApp) {
        return (<react_native_1.View style={styles.flex1}>
                <HeaderGap_1.default />
                <ReportHeaderSkeletonView_1.default />
                <ReportActionsSkeletonView_1.default />
                {shouldDisplayReportFooter ? (<ReportFooter_1.default report={report} reportMetadata={reportMetadata} policy={policy} pendingAction={reportPendingAction} isComposerFullSize={!!isComposerFullSize} lastReportAction={lastReportAction}/>) : null}
            </react_native_1.View>);
    }
    return (<react_native_1.View style={styles.flex1}>
            <OfflineWithFeedback_1.default pendingAction={reportPendingAction} errors={reportErrors} onClose={dismissReportCreationError} needsOffscreenAlphaCompositing style={styles.flex1} contentContainerStyle={styles.flex1} errorRowStyles={[styles.ph5, styles.mv2]}>
                <HeaderGap_1.default />
                {reportHeaderView}
                <react_native_1.View style={[styles.overflowHidden, styles.justifyContentEnd, styles.flex1]}>
                    {shouldDisplayMoneyRequestActionsList ? (<MoneyRequestReportActionsList_1.default report={report} policy={policy} transactions={transactions} newTransactions={newTransactions} reportActions={reportActions} hasOlderActions={hasOlderActions} hasNewerActions={hasNewerActions} showReportActionsLoadingState={isLoadingInitialReportActions && !(reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.hasOnceLoadedReportActions)}/>) : (<ReportActionsView_1.default report={report} reportActions={reportActions} isLoadingInitialReportActions={reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.isLoadingInitialReportActions} hasNewerActions={hasNewerActions} hasOlderActions={hasOlderActions} parentReportAction={parentReportAction} transactionThreadReportID={transactionThreadReportID}/>)}
                    {shouldDisplayReportFooter ? (<>
                            <ReportFooter_1.default report={report} reportMetadata={reportMetadata} policy={policy} pendingAction={reportPendingAction} isComposerFullSize={!!isComposerFullSize} lastReportAction={lastReportAction}/>
                            <portal_1.PortalHost name="suggestions"/>
                        </>) : null}
                </react_native_1.View>
            </OfflineWithFeedback_1.default>
        </react_native_1.View>);
}
MoneyRequestReportView.displayName = 'MoneyRequestReportView';
exports.default = MoneyRequestReportView;
