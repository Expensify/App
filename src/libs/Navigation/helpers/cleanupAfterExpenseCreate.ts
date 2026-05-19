// eslint-disable-next-line no-restricted-imports
import {InteractionManager} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {removeDraftTransactionsByIDs} from '@libs/actions/TransactionEdit';
import Navigation from '@libs/Navigation/Navigation';
import type {ReportAction} from '@src/types/onyx';

type CleanupAfterExpenseCreateParams = {
    draftTransactionIDs: string[] | undefined;
    linkedTrackedExpenseReportAction?: OnyxEntry<ReportAction>;
};

/** Cleanup-only (no navigation). Use `cleanupAndNavigateAfterExpenseCreate` for normal post-submit flows. */
function cleanupAfterExpenseCreate({draftTransactionIDs, linkedTrackedExpenseReportAction}: CleanupAfterExpenseCreateParams) {
    // Defer past the modal-dismiss animation so it doesn't block the JS thread.
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
