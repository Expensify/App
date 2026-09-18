import Log from '@libs/Log';
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

    /**
     * Whether the current user selected the "Looking around / Something else" (LOOKING_AROUND) onboarding choice.
     * Read from Onyx in render context by the calling component/hook and forwarded to `navigateAfterExpenseCreate`.
     */
    isLookingAroundUser?: boolean;

    /**
     * Whether the sole destination for this expense is the current user's self-DM (Personal Space). Forwarded to
     * `navigateAfterExpenseCreate` so the LOOKING_AROUND "route to Spend > Expenses" behaviour only fires for the self-DM case.
     */
    isSelfDMDestination?: boolean;
    /** When false, runs cleanup only — use when dismiss/reveal already handled navigation.
     * IMPORTANT: Caller must own telemetry span lifecycle. SubmitExpenseOrchestrator starts
     * SPAN_SUBMIT_EXPENSE before calling createTransaction; when shouldNavigate=false, caller
     * is responsible for ending the span (see useExpenseSubmission createTransaction).
     * Skips shouldWaitForUpcomingTransition, so transition never arrives (no 1s timeout).
     */
    shouldNavigate?: boolean;
    /** Pre-computed navigation report ID. When provided, used instead of recomputing
     * from report/backToReport/optimisticChatReportID to ensure UI and state register
     * against the same destination.
     */
    navigationReportID?: string;
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
    isLookingAroundUser,
    isSelfDMDestination,
    shouldNavigate = true,
    navigationReportID,
}: CleanupAndNavigateAfterExpenseCreateParams) {
    if (__DEV__ && isTracking() && !shouldNavigate) {
        Log.warn('[cleanupAndNavigateAfterExpenseCreate] shouldNavigate=false but span is active. Caller must own span lifecycle — miss this and span hangs 60s until dropped.');
    }

    cleanupAfterExpenseCreate({
        draftTransactionIDs,
        linkedTrackedExpenseReportAction,
        shouldWaitForUpcomingTransition: shouldNavigate,
    });

    const finalActiveReportID = navigationReportID ?? backToReport ?? report?.reportID ?? optimisticChatReportID;
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
        isLookingAroundUser,
        isSelfDMDestination,
        shouldNavigate,
    });
}

export default cleanupAndNavigateAfterExpenseCreate;
export type {CleanupAndNavigateAfterExpenseCreateParams};
