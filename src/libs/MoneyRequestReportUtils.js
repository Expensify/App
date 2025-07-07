"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalAmountForIOUReportPreviewButton = void 0;
exports.isActionVisibleOnMoneyRequestReport = isActionVisibleOnMoneyRequestReport;
exports.getThreadReportIDsForTransactions = getThreadReportIDsForTransactions;
exports.getReportIDForTransaction = getReportIDForTransaction;
exports.selectAllTransactionsForReport = selectAllTransactionsForReport;
exports.isSingleTransactionReport = isSingleTransactionReport;
exports.shouldDisplayReportTableView = shouldDisplayReportTableView;
exports.shouldWaitForTransactions = shouldWaitForTransactions;
var CONST_1 = require("@src/CONST");
var CurrencyUtils_1 = require("./CurrencyUtils");
var ReportActionsUtils_1 = require("./ReportActionsUtils");
var ReportUtils_1 = require("./ReportUtils");
var TransactionUtils_1 = require("./TransactionUtils");
/**
 * In MoneyRequestReport we filter out some IOU action types, because expense/transaction data is displayed in a separate list
 * at the top
 */
var IOU_ACTIONS_TO_FILTER_OUT = [CONST_1.default.IOU.REPORT_ACTION_TYPE.CREATE, CONST_1.default.IOU.REPORT_ACTION_TYPE.TRACK];
/**
 * Returns whether a specific action should be displayed in the feed/message list on MoneyRequestReportView.
 *
 * In MoneyRequestReport we filter out some action types, because expense/transaction data is displayed in a separate list
 * at the top the report, instead of in-between the rest of messages like in normal chat.
 * Because of that several action types are not relevant to this ReportView and should not be shown.
 */
function isActionVisibleOnMoneyRequestReport(action) {
    if ((0, ReportActionsUtils_1.isMoneyRequestAction)(action)) {
        var originalMessage = (0, ReportActionsUtils_1.getOriginalMessage)(action);
        return originalMessage ? !IOU_ACTIONS_TO_FILTER_OUT.includes(originalMessage.type) : false;
    }
    return action.actionName !== CONST_1.default.REPORT.ACTIONS.TYPE.CREATED;
}
/**
 * Give a list of report actions and a list of transactions,
 * function will return a list of reportIDs for the threads for the IOU parent action of every transaction.
 * It is used in UI to allow for navigation to "sibling" transactions when opening a single transaction (report) view.
 */
function getThreadReportIDsForTransactions(reportActions, transactions) {
    return transactions
        .map(function (transaction) {
        if ((0, TransactionUtils_1.isTransactionPendingDelete)(transaction)) {
            return;
        }
        var action = (0, ReportActionsUtils_1.getIOUActionForTransactionID)(reportActions, transaction.transactionID);
        return action === null || action === void 0 ? void 0 : action.childReportID;
    })
        .filter(function (reportID) { return !!reportID; });
}
/**
 * Returns a correct reportID for a given TransactionListItemType for navigation/displaying purposes.
 */
function getReportIDForTransaction(transactionItem) {
    var isFromSelfDM = transactionItem.reportID === CONST_1.default.REPORT.UNREPORTED_REPORT_ID;
    return (!transactionItem.isFromOneTransactionReport || isFromSelfDM) && transactionItem.transactionThreadReportID !== CONST_1.default.REPORT.UNREPORTED_REPORT_ID
        ? transactionItem.transactionThreadReportID
        : transactionItem.reportID;
}
/**
 * Filters all available transactions and returns the ones that belong to a specific report (by `reportID`).
 * It is used as an onyx selector, to make sure that report related views do not process all transactions in onyx.
 */
function selectAllTransactionsForReport(transactions, reportID, reportActions) {
    if (!reportID) {
        return [];
    }
    return Object.values(transactions !== null && transactions !== void 0 ? transactions : {}).filter(function (transaction) {
        if (!transaction) {
            return false;
        }
        var action = (0, ReportActionsUtils_1.getIOUActionForTransactionID)(reportActions, transaction.transactionID);
        return transaction.reportID === reportID && !(0, ReportActionsUtils_1.isDeletedParentAction)(action);
    });
}
/**
 * Given a list of transaction, this function checks if a given report has exactly one transaction
 *
 * Note: this function may seem a bit trivial, but it's used as a guarantee that the same logic of checking for report
 * is used in context of Search and Inbox
 */
function isSingleTransactionReport(report, transactions) {
    var _a;
    if (transactions.length !== 1) {
        return false;
    }
    return ((_a = transactions.at(0)) === null || _a === void 0 ? void 0 : _a.reportID) === (report === null || report === void 0 ? void 0 : report.reportID);
}
/**
 * Returns whether a "table" ReportView/MoneyRequestReportView should be used for the report.
 *
 * If report is a special "transaction thread" we want to use other Report views.
 * Likewise, if report has only 1 connected transaction, then we also use other views.
 */
function shouldDisplayReportTableView(report, transactions) {
    return !(0, ReportUtils_1.isReportTransactionThread)(report) && !isSingleTransactionReport(report, transactions);
}
function shouldWaitForTransactions(report, transactions, reportMetadata) {
    var _a;
    var isTransactionDataReady = transactions !== undefined;
    var isTransactionThreadView = (0, ReportUtils_1.isReportTransactionThread)(report);
    var isStillLoadingData = !!(reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.isLoadingInitialReportActions) || !!(reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.isLoadingOlderReportActions) || !!(reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.isLoadingNewerReportActions);
    return (((0, ReportUtils_1.isMoneyRequestReport)(report) || (0, ReportUtils_1.isInvoiceReport)(report)) &&
        (!isTransactionDataReady || (isStillLoadingData && (transactions === null || transactions === void 0 ? void 0 : transactions.length) === 0)) &&
        !isTransactionThreadView &&
        ((_a = report === null || report === void 0 ? void 0 : report.pendingFields) === null || _a === void 0 ? void 0 : _a.createReport) !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD &&
        !(reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.hasOnceLoadedReportActions));
}
/**
 * Determines the total amount to be displayed based on the selected button type in the IOU Report Preview.
 *
 * @param report - Onyx report object
 * @param policy - Onyx policy object
 * @param reportPreviewAction - The action that will take place when button is clicked which determines how amounts are calculated and displayed.
 * @returns - The total amount to be formatted as a string. Returns an empty string if no amount is applicable.
 */
var getTotalAmountForIOUReportPreviewButton = function (report, policy, reportPreviewAction) {
    // Determine whether the non-held amount is appropriate to display for the PAY button.
    var _a = (0, ReportUtils_1.getNonHeldAndFullAmount)(report, reportPreviewAction === CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.PAY), nonHeldAmount = _a.nonHeldAmount, hasValidNonHeldAmount = _a.hasValidNonHeldAmount;
    var hasOnlyHeldExpenses = (0, ReportUtils_1.hasOnlyHeldExpenses)(report === null || report === void 0 ? void 0 : report.reportID);
    var canAllowSettlement = (0, ReportUtils_1.hasUpdatedTotal)(report, policy);
    // Split the total spend into different categories as needed.
    var _b = (0, ReportUtils_1.getMoneyRequestSpendBreakdown)(report), totalDisplaySpend = _b.totalDisplaySpend, reimbursableSpend = _b.reimbursableSpend;
    if (reportPreviewAction === CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.PAY) {
        // Return empty string if there are only held expenses which cannot be paid.
        if (hasOnlyHeldExpenses) {
            return '';
        }
        // We shouldn't display the nonHeldAmount as the default option if it's not valid since we cannot pay partially in this case
        if ((0, ReportUtils_1.hasHeldExpenses)(report === null || report === void 0 ? void 0 : report.reportID) && canAllowSettlement && hasValidNonHeldAmount) {
            return nonHeldAmount;
        }
        // Default to reimbursable spend for PAY button if above conditions are not met.
        return (0, CurrencyUtils_1.convertToDisplayString)(reimbursableSpend, report === null || report === void 0 ? void 0 : report.currency);
    }
    // For all other cases, return the total display spend.
    return (0, CurrencyUtils_1.convertToDisplayString)(totalDisplaySpend, report === null || report === void 0 ? void 0 : report.currency);
};
exports.getTotalAmountForIOUReportPreviewButton = getTotalAmountForIOUReportPreviewButton;
