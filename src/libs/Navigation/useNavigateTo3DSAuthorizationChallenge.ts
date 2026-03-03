import {findFocusedRoute} from '@react-navigation/native';
import {useEffect, useMemo} from 'react';
import useNativeBiometrics from '@components/MultifactorAuthentication/Context/useNativeBiometrics';
import useOnyx from '@hooks/useOnyx';
import useRootNavigationState from '@hooks/useRootNavigationState';
import {isTransactionStillPending3DSReview} from '@libs/actions/MultifactorAuthentication';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {TransactionPending3DSReview} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import Navigation, {isMFAFlowScreen} from './Navigation';

// We want predictable, stable ordering for transaction challenges to ensure we don't
// accidentally navigate the user while they're in the middle of acting on a challenge.
// Prioritize created date, but if they're the same sort by expired date, and if those
// are the same, sort by ID.
function getFirstSortedTransactionPending3DSReview(transactions: TransactionPending3DSReview[]): TransactionPending3DSReview | undefined {
    return transactions
        .sort((a, b) => {
            const createdDiff = new Date(a.created).getTime() - new Date(b.created).getTime();
            if (createdDiff !== 0) {
                return createdDiff;
            }

            const expiresDiff = new Date(a.expires).getTime() - new Date(b.expires).getTime();
            if (expiresDiff !== 0) {
                return expiresDiff;
            }

            return Number(a.transactionID) - Number(b.transactionID);
        })
        .at(0);
}

/** Listens to changes to ONYXKEYS.LOCALLY_PROCESSED_3DS_TRANSACTION_REVIEWS (as well as the currently focused route)
 * and navigates to ROUTES.MULTIFACTOR_AUTHENTICATION_AUTHORIZE_TRANSACTION if necessary */
function useNavigateTo3DSAuthorizationChallenge() {
    const [locallyProcessed3DSTransactionReviews, locallyProcessedReviewsResult] = useOnyx(ONYXKEYS.LOCALLY_PROCESSED_3DS_TRANSACTION_REVIEWS);
    const [transactionsPending3DSReview] = useOnyx(ONYXKEYS.TRANSACTIONS_PENDING_3DS_REVIEW);

    // It's important not to whisk the user away from a challenge they're still working on. We add the challenge
    // to locallyProcessed3DSTransactionReviews and clear it from the queue as soon as the Authorize call completes,
    // which is also when we navigate to the outcome page. Thus, we need to make sure not to act on the next
    // queue item until the user has completely exited the flow
    const isCurrentlyActingOn3DSChallenge = useRootNavigationState((state) => {
        if (!state) {
            return false;
        }
        const focusedScreen = findFocusedRoute(state)?.name;
        if (!focusedScreen) {
            return false;
        }
        return isMFAFlowScreen(focusedScreen);
    });

    const {doesDeviceSupportBiometrics} = useNativeBiometrics();

    const transactionPending3DSReview = useMemo(() => {
        if (!transactionsPending3DSReview || isLoadingOnyxValue(locallyProcessedReviewsResult)) {
            return undefined;
        }

        const pendingTransactionsAwaitingLocalProcessing = Object.values(transactionsPending3DSReview).filter((challenge) => {
            // We can't process a transaction without an ID, so don't bother showing it.
            if (!challenge?.transactionID) {
                return false;
            }

            // No transactions processed locally, so all pending transactions are eligible
            if (!locallyProcessed3DSTransactionReviews) {
                return true;
            }

            // This transaction was already processed locally, don't process it again
            if (challenge.transactionID in locallyProcessed3DSTransactionReviews) {
                return false;
            }

            // Transaction is valid and has never been processed locally
            return true;
        });

        // Return only the next eligible transaction
        return getFirstSortedTransactionPending3DSReview(pendingTransactionsAwaitingLocalProcessing);
    }, [transactionsPending3DSReview, locallyProcessed3DSTransactionReviews, locallyProcessedReviewsResult]);

    useEffect(() => {
        // transactionPending3DSReview is undefined when there are no pending transactions
        if (!transactionPending3DSReview?.transactionID) {
            return;
        }

        Log.info('[useNavigateTo3DSAuthorizationChallenge] Effect triggered for transaction', undefined, {transactionID: transactionPending3DSReview.transactionID});

        if (isCurrentlyActingOn3DSChallenge) {
            Log.info('[useNavigateTo3DSAuthorizationChallenge] Ignoring navigation - user is still acting on a challenge');
            return;
        }

        // Note: Importing AuthorizeTransaction in this file causes the browser to get stuck in an infinite reload loop
        // Issue to fix this: https://github.com/Expensify/App/issues/83021
        // TODO: when adding Passkey support, update this list and the switch below.
        // Passkey issue: https://github.com/expensify/app/issues/79470
        const allowedAuthenticationMethods = [CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS];
        const doesDeviceSupportAnAllowedAuthenticationMethod = allowedAuthenticationMethods.some((method) => {
            switch (method) {
                case CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS:
                    return doesDeviceSupportBiometrics();
                default:
                    return false;
            }
        });

        // Do not navigate the user to the 3DS challenge if we can tell that they won't be able to complete it on this device
        if (!doesDeviceSupportAnAllowedAuthenticationMethod) {
            Log.info('[useNavigateTo3DSAuthorizationChallenge] Ignoring navigation - device does not support an allowed authentication method');
            return;
        }

        let cancel = false;

        async function maybeNavigateTo3DSChallenge() {
            // It's actually not possible to reach this return. We're using an arrow function for the body of the effect, which captures the value
            // of transactionPending3DSReview. If the transactionID was undefined when we started the effect, we would've returned above, and if
            // it became undefined between then and now, Onyx will return a whole new object reference, so this effect will still be holding onto
            // the old value and react will run a second effect with the new value. Typescript doesn't know that Onyx treats the object as
            // immutable, so we must guard against transactionID becoming undefined again, even though we know it won't be.
            if (!transactionPending3DSReview?.transactionID) {
                Log.info('[useNavigateTo3DSAuthorizationChallenge] Ignoring navigation - typeguard bail-out (should be impossible to reach)');
                return;
            }

            // Make an API call to double check that the challenge is still eligible for review (i.e. has not been reviewed on another device)
            const challengeStillPendingReview = await isTransactionStillPending3DSReview(transactionPending3DSReview.transactionID);

            // If we know that a challenge is no longer pending review, bail rather than showing the user the "already reviewed" outcome screen
            if (!challengeStillPendingReview) {
                Log.info('[useNavigateTo3DSAuthorizationChallenge] Ignoring navigation - challenge is no longer pending review');
                return;
            }

            if (cancel) {
                Log.info('[useNavigateTo3DSAuthorizationChallenge] Ignoring navigation - effect was cleaned up while GetTransactionsPending3DSReview was in-flight');
                return;
            }

            Log.info('[useNavigateTo3DSAuthorizationChallenge] Navigating!', undefined, {transactionID: transactionPending3DSReview.transactionID});

            // If the challenge is still valid, navigate the user to the AuthorizePage
            Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_AUTHORIZE_TRANSACTION.getRoute(transactionPending3DSReview.transactionID));
        }

        Navigation.isNavigationReady().then(() => maybeNavigateTo3DSChallenge());

        return () => {
            cancel = true;
        };
    }, [transactionPending3DSReview?.transactionID, doesDeviceSupportBiometrics, isCurrentlyActingOn3DSChallenge]);
}

export default useNavigateTo3DSAuthorizationChallenge;
export {getFirstSortedTransactionPending3DSReview as sortTransactionsPending3DSReview};
