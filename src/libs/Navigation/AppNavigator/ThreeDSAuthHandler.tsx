import useNavigateTo3DSAuthorizationChallenge from '@libs/Navigation/useNavigateTo3DSAuthorizationChallenge';

/**
 * Component that does not render anything and owns the 3DS authorization challenge navigation logic.
 *
 * Extracted from AuthScreens to isolate the LOCALLY_PROCESSED_3DS_TRANSACTION_REVIEWS,
 * TRANSACTIONS_PENDING_3DS_REVIEW subscriptions, and the useRootNavigationState listener
 * which fires on every navigation state change.
 */
function ThreeDSAuthHandler() {
    useNavigateTo3DSAuthorizationChallenge();

    return null;
}

export default ThreeDSAuthHandler;
