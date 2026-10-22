import useBeforeRemove from '@hooks/useBeforeRemove';
import useNetworkWithOfflineStatus from '@hooks/useNetworkWithOfflineStatus';

import Navigation from '@libs/Navigation/Navigation';

import type {SeverityLevel} from '@sentry/react-native';

import {useEffect, useRef, useState} from 'react';

type UseForcedReviewScreenParams = {
    transactionID: string;
    isTransactionPendingReview: boolean;

    /** Whether a review request started on this screen is still in flight */
    isSubmitting: boolean;

    isShowingOutcome: boolean;

    /** Called when the user confirms they want to leave the review without answering */
    onConfirmBackOut: () => void;

    /** Adds a Sentry breadcrumb tagged for the screen using this hook */
    addBreadcrumb: (message: string, data?: Record<string, string | number | boolean | undefined>, level?: SeverityLevel) => void;
};

/** Back-out confirmation and auto-dismiss lifecycle shared by the forced transaction review screens */
function useForcedReviewScreen({transactionID, isTransactionPendingReview, isSubmitting, isShowingOutcome, onConfirmBackOut, addBreadcrumb}: UseForcedReviewScreenParams) {
    const {isOffline} = useNetworkWithOfflineStatus();

    const [isConfirmModalVisible, setConfirmModalVisibility] = useState(false);
    const allowNavigatingAwayRef = useRef(false);

    const allowNavigatingAway = () => {
        allowNavigatingAwayRef.current = true;
    };

    const showConfirmModal = () => {
        // FullPageOfflineBlockingView doesn't wrap HeaderWithBackButton, so we handle navigation manually when offline.
        // Offline mode isn't supported in MFA; navigate users away immediately without showing the confirmation modal.
        if (isOffline) {
            addBreadcrumb('Offline back-navigation (no deny sent)', {transactionID}, 'warning');
            allowNavigatingAway();
            Navigation.closeRHPFlow();
            return;
        }
        setConfirmModalVisibility(true);
    };

    const hideConfirmModal = () => {
        setConfirmModalVisibility(false);
    };

    const confirmBackOut = () => {
        setConfirmModalVisibility(false);
        allowNavigatingAway();
        onConfirmBackOut();
    };

    useBeforeRemove((e) => {
        if (allowNavigatingAwayRef.current || !isTransactionPendingReview || isShowingOutcome) {
            return;
        }
        e.preventDefault();
        showConfirmModal();
    });

    // Automatically navigate away if the transaction becomes nullish and we didn't review it here.
    // User must have actioned it on a different device.
    useEffect(() => {
        if (isTransactionPendingReview || isSubmitting || isShowingOutcome) {
            return;
        }
        addBreadcrumb('Transaction disappeared (actioned on another device)', {transactionID}, 'info');
        Navigation.closeRHPFlow();
    }, [isTransactionPendingReview, isSubmitting, isShowingOutcome, transactionID, addBreadcrumb]);

    return {isConfirmModalVisible, showConfirmModal, hideConfirmModal, confirmBackOut, allowNavigatingAway};
}

export default useForcedReviewScreen;
