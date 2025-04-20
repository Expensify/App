import CONST from '@src/CONST';
import type {OriginalMessageIOU, ReportAction, Transaction} from '@src/types/onyx';
import {getIOUActionForTransactionID, getOriginalMessage, isMoneyRequestAction} from './ReportActionsUtils';

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

export {isActionVisibleOnMoneyRequestReport, getThreadReportIDsForTransactions};
