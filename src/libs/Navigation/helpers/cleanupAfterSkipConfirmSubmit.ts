import type {CleanupAndNavigateAfterExpenseCreateParams} from './cleanupAndNavigateAfterExpenseCreate';

import cleanupAfterExpenseCreate from './cleanupAfterExpenseCreate';
import cleanupAndNavigateAfterExpenseCreate from './cleanupAndNavigateAfterExpenseCreate';

/**
 * Skip-confirmation cleanup dispatcher: `shouldHandleNavigation` (from `submitWithDismissFirst`) picks
 * cleanup-only vs cleanup-and-navigate. The skip-confirm analog of the confirmation submission hooks' `performPostBatchCleanup`.
 */
function cleanupAfterSkipConfirmSubmit(shouldHandleNavigation: boolean, params: CleanupAndNavigateAfterExpenseCreateParams) {
    if (shouldHandleNavigation) {
        cleanupAndNavigateAfterExpenseCreate(params);
        return;
    }
    cleanupAfterExpenseCreate({draftTransactionIDs: params.draftTransactionIDs, linkedTrackedExpenseReportAction: params.linkedTrackedExpenseReportAction});
}

export default cleanupAfterSkipConfirmSubmit;
