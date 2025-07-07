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
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var ReportActionsSkeletonView_1 = require("@components/ReportActionsSkeletonView");
var useCopySelectionHelper_1 = require("@hooks/useCopySelectionHelper");
var useLoadReportActions_1 = require("@hooks/useLoadReportActions");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var Report_1 = require("@libs/actions/Report");
var DateUtils_1 = require("@libs/DateUtils");
var getIsReportFullyVisible_1 = require("@libs/getIsReportFullyVisible");
var MoneyRequestReportUtils_1 = require("@libs/MoneyRequestReportUtils");
var NumberUtils_1 = require("@libs/NumberUtils");
var Performance_1 = require("@libs/Performance");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var markOpenReportEnd_1 = require("@libs/Telemetry/markOpenReportEnd");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var ReportActionsList_1 = require("./ReportActionsList");
var UserTypingEventListener_1 = require("./UserTypingEventListener");
var listOldID = Math.round(Math.random() * 100);
function ReportActionsView(_a) {
    var _b, _c, _d;
    var report = _a.report, parentReportAction = _a.parentReportAction, allReportActions = _a.reportActions, isLoadingInitialReportActions = _a.isLoadingInitialReportActions, transactionThreadReportID = _a.transactionThreadReportID, hasNewerActions = _a.hasNewerActions, hasOlderActions = _a.hasOlderActions;
    (0, useCopySelectionHelper_1.default)();
    var route = (0, native_1.useRoute)();
    var transactionThreadReportActions = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThreadReportID), {
        selector: function (reportActions) { return (0, ReportActionsUtils_1.getSortedReportActionsForDisplay)(reportActions, (0, ReportUtils_1.canUserPerformWriteAction)(report), true); },
        canBeMissing: true,
    })[0];
    var transactionThreadReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReportID), { canBeMissing: true })[0];
    var isLoadingApp = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_APP, { canBeMissing: true })[0];
    var prevTransactionThreadReport = (0, usePrevious_1.default)(transactionThreadReport);
    var reportActionID = (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.reportActionID;
    var prevReportActionID = (0, usePrevious_1.default)(reportActionID);
    var reportPreviewAction = (0, react_1.useMemo)(function () { return (0, ReportActionsUtils_1.getReportPreviewAction)(report.chatReportID, report.reportID); }, [report.chatReportID, report.reportID]);
    var didLayout = (0, react_1.useRef)(false);
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var isFocused = (0, native_1.useIsFocused)();
    var _e = (0, react_1.useState)(!!reportActionID), isNavigatingToLinkedMessage = _e[0], setNavigatingToLinkedMessage = _e[1];
    var prevShouldUseNarrowLayoutRef = (0, react_1.useRef)(shouldUseNarrowLayout);
    var reportID = report.reportID;
    var isReportFullyVisible = (0, react_1.useMemo)(function () { return (0, getIsReportFullyVisible_1.default)(isFocused); }, [isFocused]);
    var reportTransactionIDs = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.TRANSACTION, {
        selector: function (allTransactions) {
            return (0, MoneyRequestReportUtils_1.selectAllTransactionsForReport)(allTransactions, reportID, allReportActions !== null && allReportActions !== void 0 ? allReportActions : []).map(function (transaction) { return transaction.transactionID; });
        },
        canBeMissing: true,
    })[0];
    (0, react_1.useEffect)(function () {
        // When we linked to message - we do not need to wait for initial actions - they already exists
        if (!reportActionID || !isOffline) {
            return;
        }
        (0, Report_1.updateLoadingInitialReportAction)(report.reportID);
    }, [isOffline, report.reportID, reportActionID]);
    // Change the list ID only for comment linking to get the positioning right
    var listID = (0, react_1.useMemo)(function () {
        if (!reportActionID && !prevReportActionID) {
            // Keep the old list ID since we're not in the Comment Linking flow
            return listOldID;
        }
        var newID = (0, NumberUtils_1.generateNewRandomInt)(listOldID, 1, Number.MAX_SAFE_INTEGER);
        // eslint-disable-next-line react-compiler/react-compiler
        listOldID = newID;
        return newID;
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [route, reportActionID]);
    // When we are offline before opening an IOU/Expense report,
    // the total of the report and sometimes the expense aren't displayed because these actions aren't returned until `OpenReport` API is complete.
    // We generate a fake created action here if it doesn't exist to display the total whenever possible because the total just depends on report data
    // and we also generate an expense action if the number of expenses in allReportActions is less than the total number of expenses
    // to display at least one expense action to match the total data.
    var reportActionsToDisplay = (0, react_1.useMemo)(function () {
        var _a, _b, _c;
        if (!(0, ReportUtils_1.isMoneyRequestReport)(report) || !(allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions.length)) {
            return allReportActions;
        }
        var actions = __spreadArray([], allReportActions, true);
        var lastAction = allReportActions.at(-1);
        if (lastAction && !(0, ReportActionsUtils_1.isCreatedAction)(lastAction)) {
            var optimisticCreatedAction = (0, ReportUtils_1.buildOptimisticCreatedReportAction)(String(report === null || report === void 0 ? void 0 : report.ownerAccountID), DateUtils_1.default.subtractMillisecondsFromDateTime(lastAction.created, 1));
            optimisticCreatedAction.pendingAction = null;
            actions.push(optimisticCreatedAction);
        }
        var moneyRequestActions = allReportActions.filter(function (action) {
            var originalMessage = (0, ReportActionsUtils_1.isMoneyRequestAction)(action) ? (0, ReportActionsUtils_1.getOriginalMessage)(action) : undefined;
            return ((0, ReportActionsUtils_1.isMoneyRequestAction)(action) &&
                originalMessage &&
                ((originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.type) === CONST_1.default.IOU.REPORT_ACTION_TYPE.CREATE ||
                    !!((originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.type) === CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY && (originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.IOUDetails)) ||
                    (originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.type) === CONST_1.default.IOU.REPORT_ACTION_TYPE.TRACK));
        });
        if (report.total && moneyRequestActions.length < ((_a = reportPreviewAction === null || reportPreviewAction === void 0 ? void 0 : reportPreviewAction.childMoneyRequestCount) !== null && _a !== void 0 ? _a : 0) && (0, EmptyObject_1.isEmptyObject)(transactionThreadReport)) {
            var optimisticIOUAction = (0, ReportUtils_1.buildOptimisticIOUReportAction)({
                type: CONST_1.default.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: 0,
                currency: CONST_1.default.CURRENCY.USD,
                comment: '',
                participants: [],
                transactionID: (0, NumberUtils_1.rand64)(),
                iouReportID: report.reportID,
                created: DateUtils_1.default.subtractMillisecondsFromDateTime((_c = (_b = actions.at(-1)) === null || _b === void 0 ? void 0 : _b.created) !== null && _c !== void 0 ? _c : '', 1),
            });
            moneyRequestActions.push(optimisticIOUAction);
            actions.splice(actions.length - 1, 0, optimisticIOUAction);
        }
        // Update pending action of created action if we have some requests that are pending
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        var createdAction = actions.pop();
        if (moneyRequestActions.filter(function (action) { return !!action.pendingAction; }).length > 0) {
            createdAction.pendingAction = CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;
        }
        return __spreadArray(__spreadArray([], actions, true), [createdAction], false);
    }, [allReportActions, report, transactionThreadReport, reportPreviewAction]);
    // Get a sorted array of reportActions for both the current report and the transaction thread report associated with this report (if there is one)
    // so that we display transaction-level and report-level report actions in order in the one-transaction view
    var reportActions = (0, react_1.useMemo)(function () { return (reportActionsToDisplay ? (0, ReportActionsUtils_1.getCombinedReportActions)(reportActionsToDisplay, transactionThreadReportID !== null && transactionThreadReportID !== void 0 ? transactionThreadReportID : null, transactionThreadReportActions !== null && transactionThreadReportActions !== void 0 ? transactionThreadReportActions : []) : []); }, [reportActionsToDisplay, transactionThreadReportActions, transactionThreadReportID]);
    var parentReportActionForTransactionThread = (0, react_1.useMemo)(function () {
        return (0, EmptyObject_1.isEmptyObject)(transactionThreadReportActions)
            ? undefined
            : allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions.find(function (action) { return action.reportActionID === (transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.parentReportActionID); });
    }, [allReportActions, transactionThreadReportActions, transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.parentReportActionID]);
    var canPerformWriteAction = (0, ReportUtils_1.canUserPerformWriteAction)(report);
    var visibleReportActions = (0, react_1.useMemo)(function () {
        return reportActions.filter(function (reportAction) {
            return (isOffline || (0, ReportActionsUtils_1.isDeletedParentAction)(reportAction) || reportAction.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE || reportAction.errors) &&
                (0, ReportActionsUtils_1.shouldReportActionBeVisible)(reportAction, reportAction.reportActionID, canPerformWriteAction) &&
                (0, ReportActionsUtils_1.isIOUActionMatchingTransactionList)(reportAction, reportTransactionIDs);
        });
    }, [reportActions, isOffline, canPerformWriteAction, reportTransactionIDs]);
    var newestReportAction = (0, react_1.useMemo)(function () { return reportActions === null || reportActions === void 0 ? void 0 : reportActions.at(0); }, [reportActions]);
    var mostRecentIOUReportActionID = (0, react_1.useMemo)(function () { return (0, ReportActionsUtils_1.getMostRecentIOURequestActionID)(reportActions); }, [reportActions]);
    var lastActionCreated = (_c = visibleReportActions.at(0)) === null || _c === void 0 ? void 0 : _c.created;
    var isNewestAction = function (actionCreated, lastVisibleActionCreated) {
        return actionCreated && lastVisibleActionCreated ? actionCreated >= lastVisibleActionCreated : actionCreated === lastVisibleActionCreated;
    };
    var hasNewestReportAction = isNewestAction(lastActionCreated, report.lastVisibleActionCreated) || isNewestAction(lastActionCreated, transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.lastVisibleActionCreated);
    var isSingleExpenseReport = (reportPreviewAction === null || reportPreviewAction === void 0 ? void 0 : reportPreviewAction.childMoneyRequestCount) === 1;
    var isMissingTransactionThreadReportID = !(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.reportID);
    var isReportDataIncomplete = isSingleExpenseReport && isMissingTransactionThreadReportID;
    var isMissingReportActions = visibleReportActions.length === 0;
    (0, react_1.useEffect)(function () {
        // update ref with current state
        prevShouldUseNarrowLayoutRef.current = shouldUseNarrowLayout;
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [shouldUseNarrowLayout, reportActions, isReportFullyVisible]);
    var allReportActionIDs = (0, react_1.useMemo)(function () {
        var _a;
        return (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions.map(function (action) { return action.reportActionID; })) !== null && _a !== void 0 ? _a : [];
    }, [allReportActions]);
    var _f = (0, useLoadReportActions_1.default)({
        reportID: reportID,
        reportActionID: reportActionID,
        reportActions: reportActions,
        allReportActionIDs: allReportActionIDs,
        transactionThreadReport: transactionThreadReport,
        hasOlderActions: hasOlderActions,
        hasNewerActions: hasNewerActions,
    }), loadOlderChats = _f.loadOlderChats, loadNewerChats = _f.loadNewerChats;
    /**
     * Runs when the FlatList finishes laying out
     */
    var recordTimeToMeasureItemLayout = (0, react_1.useCallback)(function () {
        if (didLayout.current) {
            return;
        }
        didLayout.current = true;
        (0, markOpenReportEnd_1.default)();
    }, []);
    // Check if the first report action in the list is the one we're currently linked to
    var isTheFirstReportActionIsLinked = (newestReportAction === null || newestReportAction === void 0 ? void 0 : newestReportAction.reportActionID) === reportActionID;
    (0, react_1.useEffect)(function () {
        var timerID;
        if (isTheFirstReportActionIsLinked) {
            setNavigatingToLinkedMessage(true);
        }
        else {
            // After navigating to the linked reportAction, apply this to correctly set
            // `autoscrollToTopThreshold` prop when linking to a specific reportAction.
            react_native_1.InteractionManager.runAfterInteractions(function () {
                // Using a short delay to ensure the view is updated after interactions
                timerID = setTimeout(function () { return setNavigatingToLinkedMessage(false); }, 10);
            });
        }
        return function () {
            if (!timerID) {
                return;
            }
            clearTimeout(timerID);
        };
    }, [isTheFirstReportActionIsLinked]);
    if ((_d = (isLoadingInitialReportActions && (isReportDataIncomplete || isMissingReportActions) && !isOffline)) !== null && _d !== void 0 ? _d : isLoadingApp) {
        return <ReportActionsSkeletonView_1.default />;
    }
    if (isMissingReportActions) {
        return <ReportActionsSkeletonView_1.default shouldAnimate={false}/>;
    }
    // AutoScroll is disabled when we do linking to a specific reportAction
    var shouldEnableAutoScroll = (hasNewestReportAction && (!reportActionID || !isNavigatingToLinkedMessage)) || (transactionThreadReport && !prevTransactionThreadReport);
    return (<>
            <ReportActionsList_1.default report={report} transactionThreadReport={transactionThreadReport} parentReportAction={parentReportAction} parentReportActionForTransactionThread={parentReportActionForTransactionThread} onLayout={recordTimeToMeasureItemLayout} sortedReportActions={reportActions} sortedVisibleReportActions={visibleReportActions} mostRecentIOUReportActionID={mostRecentIOUReportActionID} loadOlderChats={loadOlderChats} loadNewerChats={loadNewerChats} listID={listID} shouldEnableAutoScrollToTopThreshold={shouldEnableAutoScroll}/>
            <UserTypingEventListener_1.default report={report}/>
        </>);
}
ReportActionsView.displayName = 'ReportActionsView';
exports.default = Performance_1.default.withRenderTrace({ id: '<ReportActionsView> rendering' })(ReportActionsView);
