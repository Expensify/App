import {useMemo} from 'react';
import ONYXKEYS from '@src/ONYXKEYS';
import type ProactiveAppReview from '@src/types/onyx/AppReview';
import useOnyx from './useOnyx';

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
    const [proactiveAppReview] = useOnyx(ONYXKEYS.NVP_APP_REVIEW, {canBeMissing: true});

    const shouldShowModal = useMemo(() => {
        if (!proactiveAppReview) {
            return false;
        }

        // Don't show if trigger is not set
        if (!proactiveAppReview.trigger) {
            return false;
        }

        // Don't show if user gave a definitive answer (positive/negative)
        // Only allow re-prompting if they skipped
        if (proactiveAppReview.response && proactiveAppReview.response !== 'skip') {
            return false;
        }

        // Check if lastPrompt is missing or older than 30 days
        if (proactiveAppReview.lastPrompt) {
            const lastPromptTime = new Date(proactiveAppReview.lastPrompt).getTime();
            const now = Date.now();
            const daysSinceLastPrompt = (now - lastPromptTime) / THIRTY_DAYS_IN_MS;

            if (daysSinceLastPrompt < 1) {
                return false;
            }
        }

        return true;
    }, [proactiveAppReview]);

    return {
        shouldShowModal,
        proactiveAppReview,
    };
}

export default useProactiveAppReview;
