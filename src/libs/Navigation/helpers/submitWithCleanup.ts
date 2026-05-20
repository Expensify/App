import type {OnyxEntry} from 'react-native-onyx';
import type {SubmitExpenseContext} from '@libs/telemetry/submitFollowUpAction';
import type {IOUAction} from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';
import cleanupAfterExpenseCreate from './cleanupAfterExpenseCreate';
import cleanupAndNavigateAfterExpenseCreate from './cleanupAndNavigateAfterExpenseCreate';
import type {WriteOverrides} from './submitWithDismissFirst';
import {submitWithDismissFirst} from './submitWithDismissFirst';

type SubmitWithCleanupParams = {
    /** The pure write (e.g., createTransaction / trackExpense / createDistanceRequest) wrapped so the orchestrator's overrides reach it. */
    executeWrite: (overrides: WriteOverrides) => void;
    /** Report the orchestrator will reveal/dismiss to before the write fires. */
    destinationReportID: string | undefined;
    /** Telemetry metadata for the submit-expense performance span. */
    telemetryContext: SubmitExpenseContext;

    // Cleanup args — passed verbatim to cleanupAndNavigateAfterExpenseCreate (full-nav branch) or cleanupAfterExpenseCreate (fast-path branch).
    report: OnyxEntry<Report>;
    action: IOUAction;
    draftTransactionIDs: string[] | undefined;
    transactionID: string | undefined;
    isFromGlobalCreate: boolean | undefined;
    backToReport?: string;
    optimisticChatReportID: string | undefined;
    linkedTrackedExpenseReportAction?: OnyxEntry<ReportAction>;
    isInvoice?: boolean;
};

/** Wraps `submitWithDismissFirst` and threads draft/RHP cleanup into every nav branch so write + cleanup land at the same async moment. */
function submitWithCleanup({
    executeWrite,
    destinationReportID,
    telemetryContext,
    report,
    action,
    draftTransactionIDs,
    transactionID,
    isFromGlobalCreate,
    backToReport,
    optimisticChatReportID,
    linkedTrackedExpenseReportAction,
    isInvoice,
}: SubmitWithCleanupParams): void {
    submitWithDismissFirst({
        executeWrite: (overrides) => {
            executeWrite(overrides);
            if (overrides.shouldHandleNavigation) {
                cleanupAndNavigateAfterExpenseCreate({
                    report,
                    action,
                    draftTransactionIDs,
                    transactionID,
                    isFromGlobalCreate,
                    backToReport,
                    optimisticChatReportID,
                    linkedTrackedExpenseReportAction,
                    isInvoice,
                });
                return;
            }
            cleanupAfterExpenseCreate({draftTransactionIDs, linkedTrackedExpenseReportAction});
        },
        destinationReportID,
        telemetryContext,
    });
}

export default submitWithCleanup;
