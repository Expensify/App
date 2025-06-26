import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {TransactionListItemType} from '@components/SelectionList/types';
import CONST from '@src/CONST';
import type {OriginalMessageIOU, Policy, Report, ReportAction, ReportMetadata, Transaction} from '@src/types/onyx';
import {convertToDisplayString} from './CurrencyUtils';
import {getIOUActionForTransactionID, getOriginalMessage, isDeletedParentAction, isMoneyRequestAction} from './ReportActionsUtils';
import {
    getMoneyRequestSpendBreakdown,
    getNonHeldAndFullAmount,
    hasHeldExpenses as hasHeldExpensesReportUtils,
    hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils,
    hasUpdatedTotal,
    isInvoiceReport,
    isMoneyRequestReport,
    isReportTransactionThread,
} from './ReportUtils';
import {isTransactionPendingDelete} from './TransactionUtils';

/**
 * In MoneyRequestReport we filter out some IOU action types, because expense/transaction data is displayed in a separate list
 * at the top
 */
const IOU_ACTIONS_TO_FILTER_OUT: Array<OriginalMessageIOU['type']> = [CONST.IOU.REPORT_ACTION_TYPE.CREATE, CONST.IOU.REPORT_ACTION_TYPE.TRACK];

/**
 * Returns whether a specific action should be displayed in the feed/message list on MoneyRequestReportView.
 *
 * In MoneyRequestReport we filter out some action types, because expense/transaction data is displayed in a separate list
 * at the top the report, instead of in-between the rest of messages like in normal chat.
 * Because of that several action types are not relevant to this ReportView and should not be shown.
 */
function isActionVisibleOnMoneyRequestReport(action: ReportAction) {
    if (isMoneyRequestAction(action)) {
        const originalMessage = getOriginalMessage(action);
        return originalMessage ? !IOU_ACTIONS_TO_FILTER_OUT.includes(originalMessage.type) : false;
    }

    return action.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED;
}

/**
 * Give a list of report actions and a list of transactions,
 * function will return a list of reportIDs for the threads for the IOU parent action of every transaction.
 * It is used in UI to allow for navigation to "sibling" transactions when opening a single transaction (report) view.
 */
function getThreadReportIDsForTransactions(reportActions: ReportAction[], transactions: Transaction[]) {
    return transactions
        .map((transaction) => {
            if (isTransactionPendingDelete(transaction)) {
                return;
            }

            const action = getIOUActionForTransactionID(reportActions, transaction.transactionID);
            return action?.childReportID;
        })
        .filter((reportID): reportID is string => !!reportID);
}

/**
 * Returns a correct reportID for a given TransactionListItemType for navigation/displaying purposes.
 */
function getReportIDForTransaction(transactionItem: TransactionListItemType) {
    const isFromSelfDM = transactionItem.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;

    return (!transactionItem.isFromOneTransactionReport || isFromSelfDM) && transactionItem.transactionThreadReportID !== CONST.REPORT.UNREPORTED_REPORT_ID
        ? transactionItem.transactionThreadReportID
        : transactionItem.reportID;
}

/**
 * Filters all available transactions and returns the ones that belong to a specific report (by `reportID`).
 * It is used as an onyx selector, to make sure that report related views do not process all transactions in onyx.
 */
function selectAllTransactionsForReport(transactions: OnyxCollection<Transaction>, reportID: string | undefined, reportActions: ReportAction[]) {
    if (!reportID) {
        return [];
    }

    return Object.values(transactions ?? {}).filter((transaction): transaction is Transaction => {
        if (!transaction) {
            return false;
        }
        const action = getIOUActionForTransactionID(reportActions, transaction.transactionID);
        return transaction.reportID === reportID && !isDeletedParentAction(action);
    });
}

/**
 * Given a list of transaction, this function checks if a given report has exactly one transaction
 *
 * Note: this function may seem a bit trivial, but it's used as a guarantee that the same logic of checking for report
 * is used in context of Search and Inbox
 */
function isSingleTransactionReport(report: OnyxEntry<Report>, transactions: Transaction[]) {
    if (transactions.length !== 1) {
        return false;
    }

    return transactions.at(0)?.reportID === report?.reportID;
}

/**
 * Returns whether a "table" ReportView/MoneyRequestReportView should be used for the report.
 *
 * If report is a special "transaction thread" we want to use other Report views.
 * Likewise, if report has only 1 connected transaction, then we also use other views.
 */
function shouldDisplayReportTableView(report: OnyxEntry<Report>, transactions: Transaction[]) {
    return !isReportTransactionThread(report) && !isSingleTransactionReport(report, transactions);
}

function shouldWaitForTransactions(report: OnyxEntry<Report>, transactions: Transaction[] | undefined, reportMetadata: OnyxEntry<ReportMetadata>) {
    const isTransactionDataReady = transactions !== undefined;
    const isTransactionThreadView = isReportTransactionThread(report);
    const isStillLoadingData = !!reportMetadata?.isLoadingInitialReportActions || !!reportMetadata?.isLoadingOlderReportActions || !!reportMetadata?.isLoadingNewerReportActions;
    return (
        (isMoneyRequestReport(report) || isInvoiceReport(report)) &&
        (!isTransactionDataReady || (isStillLoadingData && transactions?.length === 0)) &&
        !isTransactionThreadView &&
        report?.pendingFields?.createReport !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD &&
        !reportMetadata?.hasOnceLoadedReportActions
    );
}

/**
 * Determines the total amount to be displayed based on the selected button type in the IOU Report Preview.
 *
 * @param report - Onyx report object
 * @param policy - Onyx policy object
 * @param reportPreviewAction - The action that will take place when button is clicked which determines how amounts are calculated and displayed.
 * @returns - The total amount to be formatted as a string. Returns an empty string if no amount is applicable.
 */
const getTotalAmountForIOUReportPreviewButton = (report: OnyxEntry<Report>, policy: OnyxEntry<Policy>, reportPreviewAction: ValueOf<typeof CONST.REPORT.REPORT_PREVIEW_ACTIONS>) => {
    // Determine whether the non-held amount is appropriate to display for the PAY button.
    const {nonHeldAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(report, reportPreviewAction === CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY);
    const hasOnlyHeldExpenses = hasOnlyHeldExpensesReportUtils(report?.reportID);
    const canAllowSettlement = hasUpdatedTotal(report, policy);

    // Split the total spend into different categories as needed.
    const {totalDisplaySpend, reimbursableSpend} = getMoneyRequestSpendBreakdown(report);

    if (reportPreviewAction === CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY) {
        // Return empty string if there are only held expenses which cannot be paid.
        if (hasOnlyHeldExpenses) {
            return '';
        }

        // We shouldn't display the nonHeldAmount as the default option if it's not valid since we cannot pay partially in this case
        if (hasHeldExpensesReportUtils(report?.reportID) && canAllowSettlement && hasValidNonHeldAmount && !hasOnlyHeldExpenses) {
            return nonHeldAmount;
        }

        // Default to reimbursable spend for PAY button if above conditions are not met.
        return convertToDisplayString(reimbursableSpend, report?.currency);
    }

    // For all other cases, return the total display spend.
    return convertToDisplayString(totalDisplaySpend, report?.currency);
};

export {
    isActionVisibleOnMoneyRequestReport,
    getThreadReportIDsForTransactions,
    getReportIDForTransaction,
    getTotalAmountForIOUReportPreviewButton,
    selectAllTransactionsForReport,
    isSingleTransactionReport,
    shouldDisplayReportTableView,
    shouldWaitForTransactions,
};
