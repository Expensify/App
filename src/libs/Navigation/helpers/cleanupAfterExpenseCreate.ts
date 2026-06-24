import type {OnyxEntry} from 'react-native-onyx';
import {removeDraftTransactionsByIDs} from '@libs/actions/TransactionEdit';
import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {ReportAction} from '@src/types/onyx';

type CleanupAfterExpenseCreateParams = {
    draftTransactionIDs: string[] | undefined;
    linkedTrackedExpenseReportAction?: OnyxEntry<ReportAction>;

    /**
     * Pass `true` when cleanup is called before navigation has been dispatched (e.g. cleanupAndNavigateAfterExpenseCreate).
     * TransitionTracker will then wait for the upcoming transition to start before queuing the callback.
     * Leave `false` (default) when navigation has already been dispatched and a transition may already be in progress.
     */
    waitForUpcomingTransition?: boolean;
};

/** Cleanup-only after a submit. Use `cleanupAndNavigateAfterExpenseCreate` when the flow also needs navigation. */
function cleanupAfterExpenseCreate({draftTransactionIDs, linkedTrackedExpenseReportAction, waitForUpcomingTransition = false}: CleanupAfterExpenseCreateParams) {
    // Defer past the modal-dismiss animation so cleanup doesn't block the JS thread / cause jank during post-submit navigation.
    TransitionTracker.runAfterTransitions({callback: () => removeDraftTransactionsByIDs(draftTransactionIDs), waitForUpcomingTransition});

    if (linkedTrackedExpenseReportAction?.childReportID) {
        const trackReport = Navigation.getReportRouteByID(linkedTrackedExpenseReportAction.childReportID);
        if (trackReport?.key) {
            Navigation.removeScreenByKey(trackReport.key);
        }
    }
}

export default cleanupAfterExpenseCreate;
