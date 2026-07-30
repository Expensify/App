import {getReportOrDraftReport, isMoneyRequestReport} from '@libs/ReportUtils';
import {isTracking} from '@libs/telemetry/submitFollowUpAction';

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
    /** When false, runs cleanup only — use when dismiss/reveal already handled navigation.
     * IMPORTANT: Caller must own telemetry span (see useExpenseSubmission:882-883).
     * Skips shouldWaitForUpcomingTransition, so transition never arrives (no 1s timeout).
     */
    shouldNavigate?: boolean;
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
    shouldNavigate = true,
}: CleanupAndNavigateAfterExpenseCreateParams) {
    if (__DEV__ && isTracking() && !shouldNavigate) {
        console.warn('[cleanupAndNavigateAfterExpenseCreate] shouldNavigate=false but span is active. ' + 'Caller must own span lifecycle — miss this and span hangs 60s until dropped.');
    }

    cleanupAfterExpenseCreate({
        draftTransactionIDs,
        linkedTrackedExpenseReportAction,
        shouldWaitForUpcomingTransition: shouldNavigate,
    });

    const finalActiveReportID = backToReport ?? report?.reportID ?? optimisticChatReportID;
    const hasMultipleTransactions = isInvoice ? false : isMoneyRequestReport(finalActiveReportID === report?.reportID ? report : getReportOrDraftReport(finalActiveReportID));
    const shouldAddPendingNewTransactionIDs =
        action === CONST.IOU.ACTION.CATEGORIZE || action === CONST.IOU.ACTION.SHARE ? true : !isInvoice && !!finalActiveReportID && !hasMultipleTransactions;

    navigateAfterExpenseCreate({
        activeReportID: finalActiveReportID,
        transactionID,
        isFromGlobalCreate,
        isInvoice,
        hasMultipleTransactions,
        shouldAddPendingNewTransactionIDs,
        shouldNavigate,
    });
}

export default cleanupAndNavigateAfterExpenseCreate;
export type {CleanupAndNavigateAfterExpenseCreateParams};
