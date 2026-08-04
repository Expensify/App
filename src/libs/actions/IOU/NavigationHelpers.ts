import sharedDismissModalAndOpenReportInInboxTab from '@libs/Navigation/helpers/dismissModalAndOpenReportInInboxTab';

import {mergeExpenseAddedGrowlTransactionIDs} from '@userActions/Transaction';

import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

import {getAllTransactions} from './index';

/**
 * @private
 * After finishing the action in RHP from the Inbox tab, besides dismissing the modal, we should open the report.
 * If the action is done from the report RHP, then we just want to dismiss the money request flow screens.
 * It is a helper function used only in this file.
 */
function dismissModalAndOpenReportInInboxTab(reportID?: string, isInvoice?: boolean) {
    const hasMultipleTransactions = Object.values(getAllTransactions()).filter((transaction) => transaction?.reportID === reportID).length > 0;
    sharedDismissModalAndOpenReportInInboxTab(reportID, isInvoice, hasMultipleTransactions);
}

/**
 * Signals the "Expense added" growl for a newly-created transaction.
 */
function signalExpenseAddedGrowl(transactionID: string | undefined, dataType: SearchDataTypes) {
    if (!transactionID) {
        return;
    }
    mergeExpenseAddedGrowlTransactionIDs({[transactionID]: dataType});
}

export {dismissModalAndOpenReportInInboxTab, signalExpenseAddedGrowl};
