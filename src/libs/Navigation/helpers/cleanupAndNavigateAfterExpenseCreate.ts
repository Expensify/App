import type {OnyxEntry} from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import {getReportOrDraftReport, isMoneyRequestReport} from '@libs/ReportUtils';
import type {Report, ReportAction} from '@src/types/onyx';
import cleanupAfterExpenseCreate from './cleanupAfterExpenseCreate';
import navigateAfterExpenseCreate from './navigateAfterExpenseCreate';

type CleanupAndNavigateAfterExpenseCreateParams = {
    report: OnyxEntry<Report>;
    draftTransactionIDs: string[] | undefined;
    transactionID: string | undefined;
    isFromGlobalCreate: boolean | undefined;
    hasMultipleTransactions: boolean;
    backToReport?: string;
    optimisticChatReportID?: string;
    isInvoice?: boolean;
    /** Set for the move-from-track flow so the linked child report screen is popped before navigating. */
    linkedTrackedExpenseReportAction?: OnyxEntry<ReportAction>;
};

/**
 * Post-expense-creation cleanup and navigation. Call from UI after `requestMoney`/`trackExpense`/`createDistanceRequest`/`submitPerDiemExpense` returns.
 */
function cleanupAndNavigateAfterExpenseCreate({
    report,
    draftTransactionIDs,
    transactionID,
    isFromGlobalCreate,
    hasMultipleTransactions,
    backToReport,
    optimisticChatReportID,
    isInvoice,
    linkedTrackedExpenseReportAction,
}: CleanupAndNavigateAfterExpenseCreateParams) {
    cleanupAfterExpenseCreate({draftTransactionIDs, linkedTrackedExpenseReportAction});

    const isExpenseReport = isMoneyRequestReport(report);
    const linkedChatReport = isExpenseReport ? getReportOrDraftReport(report?.chatReportID) : undefined;
    const activeReportID =
        isExpenseReport && Navigation.getTopmostReportId() === report?.reportID ? report?.reportID : (linkedChatReport?.reportID ?? report?.reportID ?? optimisticChatReportID);

    navigateAfterExpenseCreate({
        activeReportID: backToReport ?? activeReportID,
        transactionID,
        isFromGlobalCreate,
        isInvoice,
        hasMultipleTransactions,
    });
}

export default cleanupAndNavigateAfterExpenseCreate;
