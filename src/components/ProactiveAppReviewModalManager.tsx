import React, {useCallback} from 'react';
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
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {canBeMissing: true});

    const handleResponse = useCallback(
        (response: AppReviewResponse, message?: string) => {
            // Call the action which will create an optimistic comment (if the message is provided) and call the API
            respondToProactiveAppReview(response, proactiveAppReview, message, conciergeReportID);
        },
        [conciergeReportID, proactiveAppReview],
    );

    const handlePositive = useCallback(() => {
        handleResponse('positive', CONCIERGE_POSITIVE_MESSAGE);

        // Trigger native app store review prompt
        requestStoreReview();
    }, [handleResponse]);

    const handleNegative = useCallback(() => {
        handleResponse('negative', CONCIERGE_NEGATIVE_MESSAGE);
    }, [handleResponse]);

    const handleSkip = useCallback(() => {
        handleResponse('skip');
    }, [handleResponse]);

    return (
        <ProactiveAppReviewModal
            isVisible={shouldShowModal}
            onPositive={handlePositive}
            onNegative={handleNegative}
            onSkip={handleSkip}
        />
    );
}

export default ProactiveAppReviewModalManager;
