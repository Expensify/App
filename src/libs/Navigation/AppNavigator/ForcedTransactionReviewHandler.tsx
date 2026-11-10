import useNavigateToForcedTransactionReview from '@libs/Navigation/useNavigateToForcedTransactionReview';

/**
 * Component that does not render anything and owns the forced transaction review navigation logic.
 *
 * Extracted from AuthScreens to isolate the pending review queue subscriptions and the useRootNavigationState
 * listener which fires on every navigation state change.
 */
function ForcedTransactionReviewHandler() {
    useNavigateToForcedTransactionReview();

    return null;
}

export default ForcedTransactionReviewHandler;
