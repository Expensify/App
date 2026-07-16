import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Session} from '@src/types/onyx';
import type ProactiveAppReview from '@src/types/onyx/AppReview';

import type {OnyxEntry} from 'react-native-onyx';

import {isActingAsDelegateSelector} from '@selectors/Account';
import {useState} from 'react';

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
    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isActingAsDelegateSelector});

    // Capture once so render stays pure (Date.now is impure). Fine for a 30-day cooldown gate.
    const [timeAtMount] = useState(Date.now);

    let shouldShowModal = true;
    if (authTokenType === CONST.AUTH_TOKEN_TYPES.SUPPORT || isActingAsDelegate) {
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
