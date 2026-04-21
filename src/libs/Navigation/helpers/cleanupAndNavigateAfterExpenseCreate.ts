import type {OnyxEntry} from 'react-native-onyx';
import {getReportOrDraftReport, isMoneyRequestReport} from '@libs/ReportUtils';
import type {Report, ReportAction} from '@src/types/onyx';
import cleanupAfterExpenseCreate from './cleanupAfterExpenseCreate';
import navigateAfterExpenseCreate from './navigateAfterExpenseCreate';

type CleanupAndNavigateAfterExpenseCreateParams = {
    report: OnyxEntry<Report>;
    draftTransactionIDs: string[] | undefined;
    transactionID: string | undefined;
    isFromGlobalCreate: boolean | undefined;
    backToReport?: string;
    optimisticChatReportID?: string;
    isInvoice?: boolean;
    /** Set for the move-from-track flow so the linked child report screen is popped before navigating. */
    linkedTrackedExpenseReportAction?: OnyxEntry<ReportAction>;
};

function cleanupAndNavigateAfterExpenseCreate({
    report,
    draftTransactionIDs,
    transactionID,
    isFromGlobalCreate,
    backToReport,
    optimisticChatReportID,
    isInvoice,
    linkedTrackedExpenseReportAction,
}: CleanupAndNavigateAfterExpenseCreateParams) {
    cleanupAfterExpenseCreate({draftTransactionIDs, linkedTrackedExpenseReportAction});

    const finalActiveReportID = backToReport ?? report?.reportID ?? optimisticChatReportID;

    navigateAfterExpenseCreate({
        activeReportID: finalActiveReportID,
        transactionID,
        isFromGlobalCreate,
        isInvoice,
        hasMultipleTransactions: isMoneyRequestReport(getReportOrDraftReport(finalActiveReportID)),
    });
}

export default cleanupAndNavigateAfterExpenseCreate;
