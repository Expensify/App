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

/** Cleanup-only — used by `handleFileRetry` where we must NOT re-navigate. Paired with `cleanupAndNavigateAfterExpenseCreate` for the normal post-submit flow. */
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
