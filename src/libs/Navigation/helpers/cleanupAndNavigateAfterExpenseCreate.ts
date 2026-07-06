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
    // Gate on the destination ID, not the cached report — a brand-new optimistic chat isn't in the report cache yet this tick.
    const shouldAddPendingNewTransactionIDs =
        action === CONST.IOU.ACTION.CATEGORIZE || action === CONST.IOU.ACTION.SHARE ? true : !backToReport && !!finalActiveReportID && !hasMultipleTransactions;

    navigateAfterExpenseCreate({
        activeReportID: finalActiveReportID,
        transactionID,
        isFromGlobalCreate,
        isInvoice,
        hasMultipleTransactions,
        shouldAddPendingNewTransactionIDs,
    });
}

export default cleanupAndNavigateAfterExpenseCreate;
export type {CleanupAndNavigateAfterExpenseCreateParams};
