import {removeDraftTransactionsByIDs} from '@libs/actions/TransactionEdit';
import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import type {ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type CleanupAfterExpenseCreateParams = {
    draftTransactionIDs: string[] | undefined;
    linkedTrackedExpenseReportAction?: OnyxEntry<ReportAction>;
    /** Pass true when navigation will be dispatched right after this call (defers cleanup past all transitions).
     *  Pass false when there is no upcoming navigation (cleanup runs after current transitions or immediately). */
    waitForUpcomingTransition?: boolean;
};

/** Cleanup-only after a submit. Use `cleanupAndNavigateAfterExpenseCreate` when the flow also needs navigation. */
function cleanupAfterExpenseCreate({draftTransactionIDs, linkedTrackedExpenseReportAction, waitForUpcomingTransition = false}: CleanupAfterExpenseCreateParams) {
    // This function is called from many different flows, so `waitForUpcomingTransition` covers 3 cases:
    // 1. No transition follows this call (waitForUpcomingTransition: false) - cleanup runs synchronously.
    // 2. Exactly one transition follows this call (waitForUpcomingTransition: true) - the outer tracker waits for it.
    // 3. Two transitions fire back-to-back (e.g. fullscreen replace + modal dismiss) - the outer tracker waits for
    //    the first, then the inner tracker waits for the second.
    // Nesting two trackers is a pragmatic compromise to cover case 3 without a caller-specified transition count.
    // In case 2, this means the inner tracker waits for a second transition that never comes, so cleanup runs
    // slightly later than the single transition's end - harmless, since leftover drafts are auto-cleared the next
    // time an expense/scan-receipt draft is created.
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
