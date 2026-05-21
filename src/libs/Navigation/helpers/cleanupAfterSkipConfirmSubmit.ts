import cleanupAfterExpenseCreate from './cleanupAfterExpenseCreate';
import cleanupAndNavigateAfterExpenseCreate from './cleanupAndNavigateAfterExpenseCreate';
import type {CleanupAndNavigateAfterExpenseCreateParams} from './cleanupAndNavigateAfterExpenseCreate';

/**
 * Skip-confirmation cleanup dispatcher: `shouldHandleNavigation` (from `submitWithDismissFirst`) picks
 * cleanup-only vs cleanup-and-navigate. The skip-confirm analog of `useExpenseSubmission`'s `performPostBatchCleanup`.
 */
function cleanupAfterSkipConfirmSubmit(shouldHandleNavigation: boolean, params: CleanupAndNavigateAfterExpenseCreateParams) {
    if (shouldHandleNavigation) {
        cleanupAndNavigateAfterExpenseCreate(params);
        return;
    }
    cleanupAfterExpenseCreate({draftTransactionIDs: params.draftTransactionIDs, linkedTrackedExpenseReportAction: params.linkedTrackedExpenseReportAction});
}

export default cleanupAfterSkipConfirmSubmit;
