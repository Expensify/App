import sharedDismissModalAndOpenReportInInboxTab from '@libs/Navigation/helpers/dismissModalAndOpenReportInInboxTab';
import navigateAfterExpenseCreate from '@libs/Navigation/helpers/navigateAfterExpenseCreate';

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
 * Helper to navigate after an expense is created in order to standardize the post‑creation experience
 * when creating an expense from the global create button.
 * If the expense is created from the global create button then:
 * - If it is created on the inbox tab, it will open the chat report containing that expense.
 * - If it is created elsewhere, it will navigate to Reports > Expense and highlight the newly created expense.
 */
function handleNavigateAfterExpenseCreate({
    activeReportID,
    iouReportID,
    transactionID,
    transactionThreadReportID,
    isFromGlobalCreate,
    isInvoice,
    shouldAddPendingNewTransactionIDs = false,
}: {
    activeReportID?: string;
    iouReportID?: string;
    transactionID?: string;
    transactionThreadReportID?: string;
    isFromGlobalCreate?: boolean;
    isInvoice?: boolean;
    shouldAddPendingNewTransactionIDs?: boolean;
}) {
    const hasMultipleTransactions = Object.values(getAllTransactions()).filter((transaction) => transaction?.reportID === activeReportID).length > 0;
    navigateAfterExpenseCreate({
        activeReportID,
        iouReportID,
        transactionID,
        transactionThreadReportID,
        isFromGlobalCreate,
        isInvoice,
        hasMultipleTransactions,
        shouldAddPendingNewTransactionIDs,
    });
}

export {dismissModalAndOpenReportInInboxTab, handleNavigateAfterExpenseCreate};
