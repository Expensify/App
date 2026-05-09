import React, {useCallback, useState} from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useOnyx from '@hooks/useOnyx';
import useProactiveAppReview from '@hooks/useProactiveAppReview';
import requestStoreReview from '@libs/actions/StoreReview';
import {respondToProactiveAppReview} from '@libs/actions/User';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AppReviewResponse} from '@src/types/onyx/AppReview';
import ProactiveAppReviewModal from './ProactiveAppReviewModal';

const CONCIERGE_POSITIVE_MESSAGE = "Hi there! I'm glad to hear you're enjoying Expensify. What's your favorite thing about the app? Thanks!";
const CONCIERGE_NEGATIVE_MESSAGE = "Hi there! I'm sorry to hear you aren't fully satisfied with Expensify. What's your #1 frustration? Thanks!";

function ProactiveAppReviewModalManager() {
    const {shouldShowModal, proactiveAppReview} = useProactiveAppReview();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [modal] = useOnyx(ONYXKEYS.MODAL);
    const delegateAccountID = useDelegateAccountID();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserEmail = currentUserPersonalDetails?.email;
    const currentUserAccountID = currentUserPersonalDetails?.accountID;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isOtherModalActive = !!modal?.isVisible || !!modal?.willAlertModalBecomeVisible;

    // Latch: open the modal when eligible and no other modal is visible.
    // Once open, it stays open even when BaseModal writes to ONYXKEYS.MODAL
    // for the AppReview modal itself (which would otherwise self-dismiss).
    // Using setState-during-render (React-recommended derived state pattern)
    // instead of useEffect to satisfy react-hooks/set-state-in-effect.
    if (shouldShowModal && !isOtherModalActive && !isModalOpen) {
        setIsModalOpen(true);
    }
    if (!shouldShowModal && isModalOpen) {
        setIsModalOpen(false);
    }

    const handleResponse = useCallback(
        (response: AppReviewResponse, message?: string) => {
            // Call the action which will create an optimistic comment (if the message is provided) and call the API
            respondToProactiveAppReview(response, proactiveAppReview, currentUserEmail, currentUserAccountID, delegateAccountID, message, conciergeReportID);
        },
        [conciergeReportID, proactiveAppReview, currentUserEmail, currentUserAccountID, delegateAccountID],
    );

    const handlePositive = useCallback(() => {
        setIsModalOpen(false);
        handleResponse('positive', CONCIERGE_POSITIVE_MESSAGE);

        // Trigger native app store review prompt
        requestStoreReview();
    }, [handleResponse]);

    const handleNegative = useCallback(() => {
        setIsModalOpen(false);
        handleResponse('negative', CONCIERGE_NEGATIVE_MESSAGE);
    }, [handleResponse]);

    const handleSkip = useCallback(() => {
        setIsModalOpen(false);
        handleResponse('skip');
    }, [handleResponse]);

    return (
        <ProactiveAppReviewModal
            isVisible={isModalOpen}
            onPositive={handlePositive}
            onNegative={handleNegative}
            onSkip={handleSkip}
        />
    );
}

export default ProactiveAppReviewModalManager;
