import ONYXKEYS from '@src/ONYXKEYS';
import type ProactiveAppReview from '@src/types/onyx/AppReview';

import {useState} from 'react';

import useOnyx from './useOnyx';
import useShouldSuppressPromotionalUI from './useShouldSuppressPromotionalUI';

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

type UseProactiveAppReviewReturn = {
    /** Whether the modal should be shown */
    shouldShowModal: boolean;

    /** The current proactive app review data */
    proactiveAppReview: ProactiveAppReview | null | undefined;
};

/**
 * Hook to check if the proactive app review modal should be shown
 */
function useProactiveAppReview(): UseProactiveAppReviewReturn {
    const [proactiveAppReview] = useOnyx(ONYXKEYS.NVP_APP_REVIEW);
    const shouldSuppressPromotionalUI = useShouldSuppressPromotionalUI();

    // Capture once so render stays pure (Date.now is impure). Fine for a 30-day cool-down gate.
    const [timeAtMount] = useState(Date.now);

    let shouldShowModal = true;
    if (shouldSuppressPromotionalUI) {
        // Supportal agents and copilots should not leave reviews on behalf of another account.
        shouldShowModal = false;
    } else if (!proactiveAppReview?.trigger) {
        // Don't show if the trigger is not set
        shouldShowModal = false;
    } else if (proactiveAppReview?.response === 'positive') {
        // Don't show again after user gave a positive response
        shouldShowModal = false;
    } else if (proactiveAppReview?.lastPrompt) {
        // Don't show again within 30 days of the last prompt
        const lastPromptTime = new Date(proactiveAppReview.lastPrompt).getTime();
        const msSinceLastPrompt = timeAtMount - lastPromptTime;
        if (msSinceLastPrompt < THIRTY_DAYS_IN_MS) {
            shouldShowModal = false;
        }
    }

    return {
        shouldShowModal,
        proactiveAppReview,
    };
}

export default useProactiveAppReview;
