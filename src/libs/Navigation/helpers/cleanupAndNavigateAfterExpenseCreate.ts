import {getReportOrDraftReport, isMoneyRequestReport} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import type {OnyxEntry} from 'react-native-onyx';

import cleanupAfterExpenseCreate from './cleanupAfterExpenseCreate';
import navigateAfterExpenseCreate from './navigateAfterExpenseCreate';

type CleanupAndNavigateAfterExpenseCreateParams = {
    report: OnyxEntry<Report>;
    draftTransactionIDs: string[] | undefined;
    transactionID: string | undefined;

    /** IOU report the expense landed in; lets the "Expense added" growl resolve its "View" deep link. */
    iouReportID?: string;
    transactionThreadReportID?: string;
    isFromGlobalCreate: boolean | undefined;
    backToReport?: string;
    optimisticChatReportID?: string;
    isInvoice?: boolean;
    linkedTrackedExpenseReportAction?: OnyxEntry<ReportAction>;
    action: DeepValueOf<typeof CONST.IOU.ACTION>;
};

function cleanupAndNavigateAfterExpenseCreate({
    report,
    draftTransactionIDs,
    transactionID,
    iouReportID,
    transactionThreadReportID,
    isFromGlobalCreate,
    backToReport,
    optimisticChatReportID,
    isInvoice,
    linkedTrackedExpenseReportAction,
    action,
}: CleanupAndNavigateAfterExpenseCreateParams) {
    cleanupAfterExpenseCreate({
        draftTransactionIDs,
        linkedTrackedExpenseReportAction,
        shouldWaitForUpcomingTransition: true,
    });

    const finalActiveReportID = backToReport ?? report?.reportID ?? optimisticChatReportID;
    const finalActiveReport = finalActiveReportID === report?.reportID ? report : getReportOrDraftReport(finalActiveReportID);
    const hasMultipleTransactions = isMoneyRequestReport(finalActiveReport);
    // Only the chat preview card consumes this flag, so gate on "destination is a chat" — not on backToReport, which can be the receiving chat itself ("Add expense" from a preview).
    const shouldAddPendingNewTransactionIDs = action === CONST.IOU.ACTION.CATEGORIZE || action === CONST.IOU.ACTION.SHARE ? true : !!finalActiveReportID && !hasMultipleTransactions;

    navigateAfterExpenseCreate({
        activeReportID: finalActiveReportID,
        iouReportID,
        transactionID,
        transactionThreadReportID,
        isFromGlobalCreate,
        isInvoice,
        hasMultipleTransactions,
        shouldAddPendingNewTransactionIDs,
    });
}

export default cleanupAndNavigateAfterExpenseCreate;
