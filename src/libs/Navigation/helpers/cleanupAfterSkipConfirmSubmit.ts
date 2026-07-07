import type {CleanupAfterExpenseCreateParams} from './cleanupAfterExpenseCreate';

import cleanupAfterExpenseCreate from './cleanupAfterExpenseCreate';

/**
 * Cleanup-only after a skip-confirmation submit. The skip-confirm analog of `useExpenseSubmission`'s
 * `performPostBatchCleanup`: the write action now owns post-creation navigation (via its own
 * `shouldHandleNavigation`), so cleanup must never navigate too or the fallback path would run
 * navigation/growl twice. Navigation on dismiss-first paths is done by `submitWithDismissFirst`.
 */
function cleanupAfterSkipConfirmSubmit({draftTransactionIDs, linkedTrackedExpenseReportAction}: CleanupAfterExpenseCreateParams) {
    cleanupAfterExpenseCreate({draftTransactionIDs, linkedTrackedExpenseReportAction});
}

export default cleanupAfterSkipConfirmSubmit;
