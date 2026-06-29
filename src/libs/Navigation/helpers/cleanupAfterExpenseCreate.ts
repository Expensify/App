import type {OnyxEntry} from 'react-native-onyx';
import {removeDraftTransactionsByIDs} from '@libs/actions/TransactionEdit';
import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {ReportAction} from '@src/types/onyx';

type CleanupAfterExpenseCreateParams = {
    draftTransactionIDs: string[] | undefined;
    linkedTrackedExpenseReportAction?: OnyxEntry<ReportAction>;
    /** Pass true when navigation will be dispatched right after this call (defers cleanup past all transitions).
     *  Pass false when there is no upcoming navigation (cleanup runs after current transitions or immediately). */
    waitForUpcomingTransition?: boolean;
};

/** Cleanup-only after a submit. Use `cleanupAndNavigateAfterExpenseCreate` when the flow also needs navigation. */
function cleanupAfterExpenseCreate({draftTransactionIDs, linkedTrackedExpenseReportAction, waitForUpcomingTransition = false}: CleanupAfterExpenseCreateParams) {
    // Some post-submit flows involve two sequential transitions (e.g. fullscreen replace + modal dismiss).
    // A single waitForUpcomingTransition would flush between them, so we chain two: the outer waits for
    // the first transition, the inner waits for a possible second one (falls back to immediate if none starts).
    TransitionTracker.runAfterTransitions({
        waitForUpcomingTransition,
        callback: () => {
            TransitionTracker.runAfterTransitions({
                waitForUpcomingTransition,
                callback: () => {
                    removeDraftTransactionsByIDs(draftTransactionIDs);
                },
            });
        },
    });

    if (linkedTrackedExpenseReportAction?.childReportID) {
        const trackReport = Navigation.getReportRouteByID(linkedTrackedExpenseReportAction.childReportID);
        if (trackReport?.key) {
            Navigation.removeScreenByKey(trackReport.key);
        }
    }
}

export default cleanupAfterExpenseCreate;
