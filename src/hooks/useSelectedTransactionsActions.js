"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Expensicons = require("@components/Icon/Expensicons");
var SearchContext_1 = require("@components/Search/SearchContext");
var IOU_1 = require("@libs/actions/IOU");
var MobileSelectionMode_1 = require("@libs/actions/MobileSelectionMode");
var Report_1 = require("@libs/actions/Report");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var useLocalize_1 = require("./useLocalize");
var useOnyx_1 = require("./useOnyx");
var useReportIsArchived_1 = require("./useReportIsArchived");
// We do not use PRIMARY_REPORT_ACTIONS or SECONDARY_REPORT_ACTIONS because they weren't meant to be used in this situation. `value` property of returned options is later ignored.
var HOLD = 'HOLD';
var UNHOLD = 'UNHOLD';
var MOVE = 'MOVE';
function useSelectedTransactionsActions(_a) {
    var report = _a.report, reportActions = _a.reportActions, allTransactionsLength = _a.allTransactionsLength, session = _a.session, onExportFailed = _a.onExportFailed;
    var _b = (0, SearchContext_1.useSearchContext)(), selectedTransactionIDs = _b.selectedTransactionIDs, clearSelectedTransactions = _b.clearSelectedTransactions;
    var allTransactions = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.TRANSACTION, { canBeMissing: false })[0];
    var isReportArchived = (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.reportID);
    var selectedTransactions = (0, react_1.useMemo)(function () {
        return selectedTransactionIDs.reduce(function (acc, transactionID) {
            var transaction = allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)];
            if (transaction) {
                acc.push(transaction);
            }
            return acc;
        }, []);
    }, [allTransactions, selectedTransactionIDs]);
    var translate = (0, useLocalize_1.default)().translate;
    var _c = (0, react_1.useState)(false), isDeleteModalVisible = _c[0], setIsDeleteModalVisible = _c[1];
    var isTrackExpenseThread = (0, ReportUtils_1.isTrackExpenseReport)(report);
    var isInvoice = (0, ReportUtils_1.isInvoiceReport)(report);
    var iouType = CONST_1.default.IOU.TYPE.SUBMIT;
    if (isTrackExpenseThread) {
        iouType = CONST_1.default.IOU.TYPE.TRACK;
    }
    if (isInvoice) {
        iouType = CONST_1.default.IOU.TYPE.INVOICE;
    }
    var handleDeleteTransactions = (0, react_1.useCallback)(function () {
        var iouActions = reportActions.filter(function (action) { return (0, ReportActionsUtils_1.isMoneyRequestAction)(action); });
        var transactionsWithActions = selectedTransactionIDs.map(function (transactionID) { return ({
            transactionID: transactionID,
            action: iouActions.find(function (action) {
                var _a;
                var IOUTransactionID = (_a = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _a === void 0 ? void 0 : _a.IOUTransactionID;
                return transactionID === IOUTransactionID;
            }),
        }); });
        transactionsWithActions.forEach(function (_a) {
            var transactionID = _a.transactionID, action = _a.action;
            return action && (0, IOU_1.deleteMoneyRequest)(transactionID, action);
        });
        clearSelectedTransactions(true);
        if (allTransactionsLength - transactionsWithActions.length <= 1) {
            (0, MobileSelectionMode_1.turnOffMobileSelectionMode)();
        }
        setIsDeleteModalVisible(false);
    }, [allTransactionsLength, reportActions, selectedTransactionIDs, clearSelectedTransactions]);
    var showDeleteModal = (0, react_1.useCallback)(function () {
        setIsDeleteModalVisible(true);
    }, []);
    var hideDeleteModal = (0, react_1.useCallback)(function () {
        setIsDeleteModalVisible(false);
    }, []);
    var computedOptions = (0, react_1.useMemo)(function () {
        if (!selectedTransactionIDs.length) {
            return [];
        }
        var options = [];
        var isMoneyRequestReport = (0, ReportUtils_1.isMoneyRequestReport)(report);
        var isReportReimbursed = (report === null || report === void 0 ? void 0 : report.stateNum) === CONST_1.default.REPORT.STATE_NUM.APPROVED && (report === null || report === void 0 ? void 0 : report.statusNum) === CONST_1.default.REPORT.STATUS_NUM.REIMBURSED;
        var canHoldTransactions = selectedTransactions.length > 0 && isMoneyRequestReport && !isReportReimbursed;
        var canUnholdTransactions = selectedTransactions.length > 0 && isMoneyRequestReport;
        selectedTransactions.forEach(function (selectedTransaction) {
            if (!canHoldTransactions && !canUnholdTransactions) {
                return;
            }
            if (!(selectedTransaction === null || selectedTransaction === void 0 ? void 0 : selectedTransaction.transactionID)) {
                canHoldTransactions = false;
                canUnholdTransactions = false;
                return;
            }
            var iouReportAction = (0, ReportActionsUtils_1.getIOUActionForTransactionID)(reportActions, selectedTransaction.transactionID);
            var _a = (0, ReportUtils_1.canHoldUnholdReportAction)(iouReportAction), canHoldRequest = _a.canHoldRequest, canUnholdRequest = _a.canUnholdRequest;
            canHoldTransactions = canHoldTransactions && canHoldRequest;
            canUnholdTransactions = canUnholdTransactions && canUnholdRequest;
        });
        if (canHoldTransactions) {
            options.push({
                text: translate('iou.hold'),
                icon: Expensicons.Stopwatch,
                value: HOLD,
                onSelected: function () {
                    if (!(report === null || report === void 0 ? void 0 : report.reportID)) {
                        return;
                    }
                    Navigation_1.default.navigate(ROUTES_1.default.SEARCH_MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS.getRoute({ reportID: report.reportID }));
                },
            });
        }
        if (canUnholdTransactions) {
            options.push({
                text: translate('iou.unhold'),
                icon: Expensicons.Stopwatch,
                value: UNHOLD,
                onSelected: function () {
                    selectedTransactionIDs.forEach(function (transactionID) {
                        var action = (0, ReportActionsUtils_1.getIOUActionForTransactionID)(reportActions, transactionID);
                        if (!(action === null || action === void 0 ? void 0 : action.childReportID)) {
                            return;
                        }
                        (0, IOU_1.unholdRequest)(transactionID, action === null || action === void 0 ? void 0 : action.childReportID);
                    });
                    clearSelectedTransactions(true);
                },
            });
        }
        options.push({
            value: CONST_1.default.REPORT.SECONDARY_ACTIONS.DOWNLOAD_CSV,
            text: translate('common.downloadAsCSV'),
            icon: Expensicons.Download,
            onSelected: function () {
                if (!report) {
                    return;
                }
                (0, Report_1.exportReportToCSV)({ reportID: report.reportID, transactionIDList: selectedTransactionIDs }, function () {
                    onExportFailed === null || onExportFailed === void 0 ? void 0 : onExportFailed();
                });
                clearSelectedTransactions(true);
            },
        });
        var canSelectedExpensesBeMoved = selectedTransactions.every(function (transaction) {
            if (!transaction) {
                return false;
            }
            var iouReportAction = (0, ReportActionsUtils_1.getIOUActionForTransactionID)(reportActions, transaction.transactionID);
            var canMoveExpense = (0, ReportUtils_1.canEditFieldOfMoneyRequest)(iouReportAction, CONST_1.default.EDIT_REQUEST_FIELD.REPORT);
            return canMoveExpense;
        });
        var canUserPerformWriteAction = (0, ReportUtils_1.canUserPerformWriteAction)(report);
        if (canSelectedExpensesBeMoved && canUserPerformWriteAction) {
            options.push({
                text: translate('iou.moveExpenses', { count: selectedTransactionIDs.length }),
                icon: Expensicons.DocumentMerge,
                value: MOVE,
                onSelected: function () {
                    var route = ROUTES_1.default.MONEY_REQUEST_EDIT_REPORT.getRoute(CONST_1.default.IOU.ACTION.EDIT, iouType, report === null || report === void 0 ? void 0 : report.reportID);
                    Navigation_1.default.navigate(route);
                },
            });
        }
        var canAllSelectedTransactionsBeRemoved = Object.values(selectedTransactions).every(function (transaction) {
            var canRemoveTransaction = (0, ReportUtils_1.canDeleteCardTransactionByLiabilityType)(transaction);
            var action = (0, ReportActionsUtils_1.getIOUActionForTransactionID)(reportActions, transaction.transactionID);
            var isActionDeleted = (0, ReportActionsUtils_1.isDeletedAction)(action);
            var isIOUActionOwner = typeof (action === null || action === void 0 ? void 0 : action.actorAccountID) === 'number' && typeof (session === null || session === void 0 ? void 0 : session.accountID) === 'number' && action.actorAccountID === (session === null || session === void 0 ? void 0 : session.accountID);
            return canRemoveTransaction && isIOUActionOwner && !isActionDeleted;
        });
        var canRemoveReportTransaction = (0, ReportUtils_1.canDeleteTransaction)(report, isReportArchived);
        if (canRemoveReportTransaction && canAllSelectedTransactionsBeRemoved) {
            options.push({
                text: translate('common.delete'),
                icon: Expensicons.Trashcan,
                value: CONST_1.default.REPORT.SECONDARY_ACTIONS.DELETE,
                onSelected: showDeleteModal,
            });
        }
        return options;
    }, [
        selectedTransactionIDs,
        report,
        selectedTransactions,
        translate,
        reportActions,
        clearSelectedTransactions,
        onExportFailed,
        iouType,
        session === null || session === void 0 ? void 0 : session.accountID,
        showDeleteModal,
        isReportArchived,
    ]);
    return {
        options: computedOptions,
        handleDeleteTransactions: handleDeleteTransactions,
        isDeleteModalVisible: isDeleteModalVisible,
        showDeleteModal: showDeleteModal,
        hideDeleteModal: hideDeleteModal,
    };
}
exports.default = useSelectedTransactionsActions;
