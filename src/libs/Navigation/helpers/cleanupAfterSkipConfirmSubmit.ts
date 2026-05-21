import cleanupAfterExpenseCreate from './cleanupAfterExpenseCreate';
import cleanupAndNavigateAfterExpenseCreate from './cleanupAndNavigateAfterExpenseCreate';
import type {CleanupAndNavigateAfterExpenseCreateParams} from './cleanupAndNavigateAfterExpenseCreate';

/**
 * Skip-confirmation cleanup dispatcher for the `submitWithDismissFirst` `executeWrite` callback.
 *
 * `submitWithDismissFirst` passes `shouldHandleNavigation`:
 *   - `false` — the orchestrator already revealed/dismissed to the destination, so only run cleanup.
 *   - `true`  — the fallback path ran no fast-path nav, so cleanup AND navigate.
 *
 * Mirrors `useExpenseSubmission`'s `performPostBatchCleanup` branching so every skip-confirm call
 * site shares one source of truth instead of repeating the if/else inline.
 */
function cleanupAfterSkipConfirmSubmit(shouldHandleNavigation: boolean, params: CleanupAndNavigateAfterExpenseCreateParams) {
    if (shouldHandleNavigation) {
        cleanupAndNavigateAfterExpenseCreate(params);
        return;
    }
    cleanupAfterExpenseCreate({draftTransactionIDs: params.draftTransactionIDs, linkedTrackedExpenseReportAction: params.linkedTrackedExpenseReportAction});
}

export default cleanupAfterSkipConfirmSubmit;
