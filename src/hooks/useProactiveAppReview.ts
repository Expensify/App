import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Session} from '@src/types/onyx';
import type ProactiveAppReview from '@src/types/onyx/AppReview';

import type {OnyxEntry} from 'react-native-onyx';

import {useMemo} from 'react';

import useOnyx from './useOnyx';

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

const authTokenTypeSelector = (session: OnyxEntry<Session>) => session?.authTokenType;

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
    const [authTokenType] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});

    const shouldShowModal = useMemo(() => {
        // Support tokens cannot call RespondToProactiveAppReview (not whitelisted), so dismissing
        // would 411, open the Supportal permission modal, and leave this review modal stuck open.
        if (authTokenType === CONST.AUTH_TOKEN_TYPES.SUPPORT) {
            return false;
        }

        if (!proactiveAppReview) {
            return false;
        }

        // Don't show if trigger is not set
        if (!proactiveAppReview.trigger) {
            return false;
        }

        // Don't show again after user gave a positive response
        if (proactiveAppReview.response && proactiveAppReview.response === 'positive') {
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
    }, [authTokenType, proactiveAppReview]);

    return {
        shouldShowModal,
        proactiveAppReview,
    };
}

export default useProactiveAppReview;
