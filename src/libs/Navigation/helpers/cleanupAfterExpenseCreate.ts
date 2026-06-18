import {removeDraftTransactionsByIDs} from '@libs/actions/TransactionEdit';
import Navigation from '@libs/Navigation/Navigation';

import type {ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

// eslint-disable-next-line no-restricted-imports -- InteractionManager is the only cross-platform API to defer work past the dismiss animation
import {InteractionManager} from 'react-native';

type CleanupAfterExpenseCreateParams = {
    draftTransactionIDs: string[] | undefined;
    linkedTrackedExpenseReportAction?: OnyxEntry<ReportAction>;
};

/** Cleanup-only after a submit. Use `cleanupAndNavigateAfterExpenseCreate` when the flow also needs navigation. */
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
