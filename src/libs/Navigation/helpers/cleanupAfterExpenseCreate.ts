import {removeDraftTransactionsByIDs} from '@libs/actions/TransactionEdit';
import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import type {ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type CleanupAfterExpenseCreateParams = {
    draftTransactionIDs: string[] | undefined;
    linkedTrackedExpenseReportAction?: OnyxEntry<ReportAction>;
    /** Pass true when navigation will be dispatched right after this call (defers cleanup past the upcoming transition).
     *  Pass false when there is no upcoming navigation (cleanup runs after current transitions or immediately). */
    waitForUpcomingTransition?: boolean;
};

/** Cleanup-only after a submit. Use `cleanupAndNavigateAfterExpenseCreate` when the flow also needs navigation. */
function cleanupAfterExpenseCreate({draftTransactionIDs, linkedTrackedExpenseReportAction, waitForUpcomingTransition = false}: CleanupAfterExpenseCreateParams) {
    // This function is called from many different flows, so `waitForUpcomingTransition` covers 2 cases:
    // 1. No transition follows this call (waitForUpcomingTransition: false) - cleanup runs synchronously.
    // 2. A transition follows this call (waitForUpcomingTransition: true) - cleanup runs after it ends.
    // Do not nest a second waitForUpcomingTransition here: on single-dismiss submits the inner wait would
    // block up to CONST.MAX_TRANSITION_START_WAIT_MS for a transition that never comes, and a new expense
    // draft opened in that window can be wiped when removeDraftTransactionsByIDs finally runs.
    // Reveal flows (replace + dismiss) may need cleanup wired via navigation afterTransition instead — follow-up PR.
    TransitionTracker.runAfterTransitions({
        waitForUpcomingTransition,
        callback: () => removeDraftTransactionsByIDs(draftTransactionIDs),
    });

    if (linkedTrackedExpenseReportAction?.childReportID) {
        const trackReport = Navigation.getReportRouteByID(linkedTrackedExpenseReportAction.childReportID);
        if (trackReport?.key) {
            Navigation.removeScreenByKey(trackReport.key);
        }
    }
}

export default cleanupAfterExpenseCreate;
