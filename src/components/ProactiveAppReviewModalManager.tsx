import {isModalActiveSelector} from '@selectors/Modal';
import React, {useState} from 'react';
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
    const [isAnyOtherModalActive] = useOnyx(ONYXKEYS.MODAL, {
        selector: isModalActiveSelector,
    });
    const delegateAccountID = useDelegateAccountID();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserEmail = currentUserPersonalDetails?.email;
    const currentUserAccountID = currentUserPersonalDetails?.accountID;
    const [isAppReviewModalOpen, setIsAppReviewModalOpen] = useState(false);

    // Latch open: show the App Review modal only when the user is eligible AND
    // no other modal (e.g. attachment picker, settings) is on screen. Once latched,
    // it stays open even though the App Review modal's own BaseModal writes
    // isVisible:true to ONYXKEYS.MODAL (which would otherwise self-dismiss it).
    // Using setState-during-render (React-recommended derived state pattern)
    // instead of useEffect to satisfy react-hooks/set-state-in-effect.
    if (shouldShowModal && !isAnyOtherModalActive && !isAppReviewModalOpen) {
        setIsAppReviewModalOpen(true);
    }
    // Latch reset: close the App Review modal when the user is no longer eligible
    // (e.g. after they respond and Onyx updates shouldShowModal to false).
    if (!shouldShowModal && isAppReviewModalOpen) {
        setIsAppReviewModalOpen(false);
    }

    const handleResponse = (response: AppReviewResponse, message?: string) => {
        respondToProactiveAppReview(response, proactiveAppReview, currentUserEmail, currentUserAccountID, delegateAccountID, message, conciergeReportID);
    };

    const handlePositive = () => {
        setIsAppReviewModalOpen(false);
        handleResponse('positive', CONCIERGE_POSITIVE_MESSAGE);
        requestStoreReview();
    };

    const handleNegative = () => {
        setIsAppReviewModalOpen(false);
        handleResponse('negative', CONCIERGE_NEGATIVE_MESSAGE);
    };

    const handleSkip = () => {
        setIsAppReviewModalOpen(false);
        handleResponse('skip');
    };

    return (
        <ProactiveAppReviewModal
            isVisible={isAppReviewModalOpen}
            onPositive={handlePositive}
            onNegative={handleNegative}
            onSkip={handleSkip}
        />
    );
}

export default ProactiveAppReviewModalManager;
