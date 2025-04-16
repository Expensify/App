import type {OnyxCollection} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {OriginalMessageIOU, ReportAction, Transaction} from '@src/types/onyx';
import {getIOUActionForTransactionID, getOriginalMessage, isDeletedParentAction, isMoneyRequestAction} from './ReportActionsUtils';

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
            const action = getIOUActionForTransactionID(reportActions, transaction.transactionID);
            return action?.childReportID;
        })
        .filter((reportID): reportID is string => !!reportID);
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
 * Even though this function does not accept `Report` or ID as an argument, it nevertheless decides about a report property.
 * In the app there are special behaviors for a report that has exactly 1 transaction attached to it, and we need a function to check for it.
 * As transactions come from onyx I don't want to enclose fetching transactions for report in this function,
 * so it ends up accepting only transactions as an argument, but it makes decision about a report.
 */
function isSingleTransactionReport(transactions: Transaction[]) {
    return transactions.length === 1;
}

export {isActionVisibleOnMoneyRequestReport, getThreadReportIDsForTransactions, selectAllTransactionsForReport, isSingleTransactionReport};
