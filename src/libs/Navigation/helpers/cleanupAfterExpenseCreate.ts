import {InteractionManager} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {removeDraftTransactionsByIDs} from '@libs/actions/TransactionEdit';
import Navigation from '@libs/Navigation/Navigation';
import type {ReportAction} from '@src/types/onyx';

type CleanupAfterExpenseCreateParams = {
    draftTransactionIDs: string[] | undefined;
    /** Set for the move-from-track flow so the linked child report screen is popped. */
    linkedTrackedExpenseReportAction?: OnyxEntry<ReportAction>;
};

/**
 * Post-expense-creation cleanup (no navigation). Removes draft transactions and, for the move-from-track flow, pops the linked child report screen.
 * Invoked by `cleanupAndNavigateAfterExpenseCreate` for the normal post-submit flow, and by `handleFileRetry` for the retry-after-receipt-upload-failure flow (which must not re-navigate).
 */
function cleanupAfterExpenseCreate({draftTransactionIDs, linkedTrackedExpenseReportAction}: CleanupAfterExpenseCreateParams) {
    // Defer cleanup until after modal-dismiss animation so it doesn't block the JS thread.
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- InteractionManager is widely used across the codebase and kept alive via a dedicated RN patch
    InteractionManager.runAfterInteractions(() => removeDraftTransactionsByIDs(draftTransactionIDs));

    if (linkedTrackedExpenseReportAction?.childReportID) {
        const trackReport = Navigation.getReportRouteByID(linkedTrackedExpenseReportAction.childReportID);
        if (trackReport?.key) {
            Navigation.removeScreenByKey(trackReport.key);
        }
    }
}

export default cleanupAfterExpenseCreate;
