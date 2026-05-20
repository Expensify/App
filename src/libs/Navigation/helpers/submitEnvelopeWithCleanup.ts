import type {OnyxEntry} from 'react-native-onyx';
import type {IOUAction} from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';
import cleanupAfterExpenseCreate from './cleanupAfterExpenseCreate';
import cleanupAndNavigateAfterExpenseCreate from './cleanupAndNavigateAfterExpenseCreate';
import type {SubmitEnvelope} from './submitWithDismissFirst';
import {submitWithDismissFirst} from './submitWithDismissFirst';

type SubmitEnvelopeWithCleanupParams = {
    envelope: SubmitEnvelope;
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

/** Dispatches an action envelope via dismiss-first nav and wires draft/RHP cleanup into every branch. */
function submitEnvelopeWithCleanup({
    envelope,
    report,
    action,
    draftTransactionIDs,
    transactionID,
    isFromGlobalCreate,
    backToReport,
    optimisticChatReportID,
    linkedTrackedExpenseReportAction,
    isInvoice,
}: SubmitEnvelopeWithCleanupParams): void {
    submitWithDismissFirst({
        executeWrite: (overrides) => {
            envelope.executeWrite(overrides);
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
        destinationReportID: envelope.destinationReportID,
        telemetryContext: envelope.telemetryContext,
    });
}

export default submitEnvelopeWithCleanup;
