import useBiometrics from '@components/MultifactorAuthentication/biometrics/useBiometrics';
import AuthorizeTransaction from '@components/MultifactorAuthentication/config/scenarios/AuthorizeTransaction';

import useOnyx from '@hooks/useOnyx';
import useRootNavigationState from '@hooks/useRootNavigationState';

import {
    cleanUpLocallyProcessedFraudTransactionReviews,
    getLocallyProcessedFraudReviewIDsToCleanUp,
    isTransactionStillPending3DSReview,
    isTransactionStillPendingFraudReview,
} from '@libs/actions/MultifactorAuthentication';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {
    LocallyProcessed3DSChallengeReviews,
    LocallyProcessedFraudTransactionReviews,
    TransactionPending3DSReview,
    TransactionPendingFraudReview,
    TransactionsPending3DSReview,
    TransactionsPendingFraudReview,
} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {SeverityLevel} from '@sentry/react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {findFocusedRoute} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import {useEffect, useState} from 'react';

import Navigation, {isMFAFlowScreen} from './Navigation';

const FORCED_REVIEW_KIND = {
    THREE_DS: '3DS',
    FRAUD: 'FRAUD',
} as const;

// Fraud reviews don't expire, so one whose answer never reached the server is shown again after this long
const FRAUD_REVIEW_RESURFACE_AFTER_MS = 3 * 24 * 60 * 60 * 1000;

type ForcedReviewKind = ValueOf<typeof FORCED_REVIEW_KIND>;

type ForcedReviewConfig = {
    logPrefix: string;
    breadcrumbPrefix: string;
    breadcrumbCategory: string;

    /** Checked against the server, since the local queue can be stale */
    isStillPendingReview: (transactionID: string) => Promise<boolean>;

    getReviewScreenRoute: (transactionID: string) => Route;

    /** Devices without any of these can't complete the review */
    shownOnlyOnDevicesWithOneOf?: Array<ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION.TYPE>>;
};

const FORCED_REVIEW_CONFIG: Record<ForcedReviewKind, ForcedReviewConfig> = {
    [FORCED_REVIEW_KIND.THREE_DS]: {
        logPrefix: '[useNavigateToForcedTransactionReview][3DS]',
        breadcrumbPrefix: '[3DS Navigation]',
        breadcrumbCategory: CONST.TELEMETRY.BREADCRUMB_CATEGORY_3DS_NAVIGATION,
        isStillPendingReview: isTransactionStillPending3DSReview,
        getReviewScreenRoute: ROUTES.MULTIFACTOR_AUTHENTICATION_AUTHORIZE_TRANSACTION.getRoute,
        shownOnlyOnDevicesWithOneOf: AuthorizeTransaction.allowedAuthenticationMethods,
    },
    [FORCED_REVIEW_KIND.FRAUD]: {
        logPrefix: '[useNavigateToForcedTransactionReview][Fraud]',
        breadcrumbPrefix: '[Fraud Review Navigation]',
        breadcrumbCategory: CONST.TELEMETRY.BREADCRUMB_CATEGORY_FRAUD_REVIEW_NAVIGATION,
        isStillPendingReview: isTransactionStillPendingFraudReview,
        getReviewScreenRoute: ROUTES.MULTIFACTOR_AUTHENTICATION_REVIEW_TRANSACTION.getRoute,
    },
};

function addBreadcrumb(config: ForcedReviewConfig, message: string, data?: Record<string, string | number | boolean | undefined>, level: SeverityLevel = 'info'): void {
    Sentry.addBreadcrumb({
        message: `${config.breadcrumbPrefix} ${message}`,
        category: config.breadcrumbCategory,
        level,
        data,
    });
}

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

/** Oldest pending 3DS review not yet answered on this device */
function getPending3DSReviewToShow(
    transactionsPending3DSReview: OnyxEntry<TransactionsPending3DSReview>,
    locallyProcessed3DSTransactionReviews: OnyxEntry<LocallyProcessed3DSChallengeReviews>,
): TransactionPending3DSReview | undefined {
    if (!transactionsPending3DSReview) {
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
}

/** Oldest pending fraud review not answered on this device, or answered long enough ago to show again */
function getPendingFraudReviewToShow(
    transactionsPendingFraudReview: OnyxEntry<TransactionsPendingFraudReview>,
    locallyProcessedFraudTransactionReviews: OnyxEntry<LocallyProcessedFraudTransactionReviews>,
    now: number,
): TransactionPendingFraudReview | undefined {
    return Object.values(transactionsPendingFraudReview ?? {})
        .filter((review) => {
            if (!review?.transactionID) {
                return false;
            }
            const answeredAt = locallyProcessedFraudTransactionReviews?.[review.transactionID];
            return !answeredAt || now - new Date(answeredAt).getTime() >= FRAUD_REVIEW_RESURFACE_AFTER_MS;
        })
        .sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime() || Number(a.transactionID) - Number(b.transactionID))
        .at(0);
}

/** Listens to the pending transaction review queues (as well as the currently focused route)
 * and navigates the user to the review screen of the next pending transaction if necessary */
function useNavigateToForcedTransactionReview() {
    const [locallyProcessed3DSTransactionReviews, locallyProcessedReviewsResult] = useOnyx(ONYXKEYS.LOCALLY_PROCESSED_3DS_TRANSACTION_REVIEWS);
    const [transactionsPending3DSReview] = useOnyx(ONYXKEYS.TRANSACTIONS_PENDING_3DS_REVIEW);
    const [locallyProcessedFraudTransactionReviews, locallyProcessedFraudReviewsResult] = useOnyx(ONYXKEYS.LOCALLY_PROCESSED_FRAUD_TRANSACTION_REVIEWS);
    const [transactionsPendingFraudReview, transactionsPendingFraudReviewResult] = useOnyx(ONYXKEYS.TRANSACTIONS_PENDING_FRAUD_REVIEW);

    // Until these are read from storage, an empty value does not mean the server has no reviews for us
    const isLoadingReviewData = isLoadingOnyxValue(locallyProcessedReviewsResult, locallyProcessedFraudReviewsResult, transactionsPendingFraudReviewResult);

    // Drop local answers once the server stops listing their review. The server sends null for an empty queue
    useEffect(() => {
        if (isLoadingReviewData) {
            return;
        }
        const transactionIDsToCleanUp = getLocallyProcessedFraudReviewIDsToCleanUp(transactionsPendingFraudReview, locallyProcessedFraudTransactionReviews);
        if (transactionIDsToCleanUp.length === 0) {
            return;
        }
        cleanUpLocallyProcessedFraudTransactionReviews(transactionIDsToCleanUp);
    }, [isLoadingReviewData, transactionsPendingFraudReview, locallyProcessedFraudTransactionReviews]);

    // Fixed at mount so the selection below stays stable between renders
    const [mountedAt] = useState(() => Date.now());

    // It's important not to whisk the user away from a review they're still working on. We add the transaction
    // to the locally processed reviews and clear it from the queue as soon as the review call completes,
    // which is also when we navigate to the outcome page. Thus, we need to make sure not to act on the next
    // queue item until the user has completely exited the flow
    const isCurrentlyActingOnReview = useRootNavigationState((state) => {
        if (!state) {
            return false;
        }
        const focusedScreen = findFocusedRoute(state)?.name;
        if (!focusedScreen) {
            return false;
        }
        return isMFAFlowScreen(focusedScreen);
    });

    const {deviceVerificationType, doesDeviceSupportAuthenticationMethod} = useBiometrics();

    const threeDSTransactionIDToShow = isLoadingReviewData ? undefined : getPending3DSReviewToShow(transactionsPending3DSReview, locallyProcessed3DSTransactionReviews)?.transactionID;

    const fraudTransactionIDToShow = isLoadingReviewData
        ? undefined
        : getPendingFraudReviewToShow(transactionsPendingFraudReview, locallyProcessedFraudTransactionReviews, mountedAt)?.transactionID;

    useEffect(() => {
        // Review kinds are listed in priority order. The first one this device can actually complete is shown
        const reviewsToShow = [
            {kind: FORCED_REVIEW_KIND.THREE_DS, transactionID: threeDSTransactionIDToShow},
            {kind: FORCED_REVIEW_KIND.FRAUD, transactionID: fraudTransactionIDToShow},
        ].filter((review): review is {kind: ForcedReviewKind; transactionID: string} => !!review.transactionID);

        // There is nothing to review when no queue has a pending transaction
        if (reviewsToShow.length === 0) {
            return;
        }

        for (const {kind, transactionID} of reviewsToShow) {
            const config = FORCED_REVIEW_CONFIG[kind];
            Log.info(`${config.logPrefix} Effect triggered for transaction`, undefined, {transactionID});
            addBreadcrumb(config, 'Transaction detected in queue', {transactionID});
        }

        if (isCurrentlyActingOnReview) {
            for (const {kind, transactionID} of reviewsToShow) {
                const config = FORCED_REVIEW_CONFIG[kind];
                Log.info(`${config.logPrefix} Ignoring navigation - user is still acting on a challenge`, undefined, {transactionID});
                addBreadcrumb(config, 'Skipped - user in MFA flow', {transactionID});
            }
            return;
        }

        let cancel = false;

        async function canNavigateToReview(config: ForcedReviewConfig, transactionID: string) {
            if (config.shownOnlyOnDevicesWithOneOf) {
                const doesDeviceSupportAnAllowedAuthenticationMethod = (await doesDeviceSupportAuthenticationMethod()) && config.shownOnlyOnDevicesWithOneOf.includes(deviceVerificationType);

                // Do not navigate the user to the review if we can tell that they won't be able to complete it on this device
                if (!doesDeviceSupportAnAllowedAuthenticationMethod) {
                    Log.info(`${config.logPrefix} Ignoring navigation - device does not support an allowed authentication method`, undefined, {transactionID});
                    addBreadcrumb(config, 'Skipped - device unsupported', {transactionID}, 'warning');
                    return false;
                }
            }

            // Make an API call to double check that the challenge is still eligible for review (i.e. has not been reviewed on another device)
            const isStillPendingReview = await config.isStillPendingReview(transactionID);

            // If we know that a challenge is no longer pending review, bail rather than showing the user the "already reviewed" outcome screen
            if (!isStillPendingReview) {
                Log.info(`${config.logPrefix} Ignoring navigation - challenge is no longer pending review`, undefined, {transactionID});
                addBreadcrumb(config, 'Skipped - already reviewed on another device', {transactionID}, 'warning');
                return false;
            }
            return true;
        }

        async function maybeNavigateToReview() {
            for (const {kind, transactionID} of reviewsToShow) {
                const config = FORCED_REVIEW_CONFIG[kind];

                // eslint-disable-next-line no-await-in-loop -- kinds are tried one at a time in priority order
                const canNavigate = await canNavigateToReview(config, transactionID);

                if (cancel) {
                    Log.info(`${config.logPrefix} Ignoring navigation - effect was cleaned up while the pending review check was in-flight`, undefined, {transactionID});
                    addBreadcrumb(config, 'Skipped - effect cancelled', {transactionID});
                    return;
                }

                if (!canNavigate) {
                    continue;
                }

                Log.info(`${config.logPrefix} Navigating!`, undefined, {transactionID});
                addBreadcrumb(config, 'Navigating to review screen', {transactionID});

                // If the transaction still awaits review, navigate the user to its review screen
                Navigation.navigate(config.getReviewScreenRoute(transactionID));
                return;
            }
        }

        Navigation.isNavigationReady().then(() => maybeNavigateToReview());

        return () => {
            cancel = true;
        };
    }, [threeDSTransactionIDToShow, fraudTransactionIDToShow, deviceVerificationType, isCurrentlyActingOnReview, doesDeviceSupportAuthenticationMethod]);
}

export default useNavigateToForcedTransactionReview;
export {getFirstSortedTransactionPending3DSReview as sortTransactionsPending3DSReview, getPending3DSReviewToShow, getPendingFraudReviewToShow};
