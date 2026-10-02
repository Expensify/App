import ONYXKEYS from '@src/ONYXKEYS';
import type ProactiveAppReview from '@src/types/onyx/AppReview';

import {accountIDSelector} from '@selectors/Session';
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
 * Returns the newest valid prompt timestamp out of the values we know about, or undefined if none are usable.
 */
function getMostRecentPromptTime(...timestamps: Array<string | undefined>): number | undefined {
    const times = timestamps.filter((timestamp): timestamp is string => !!timestamp).map((timestamp) => new Date(timestamp).getTime());
    const validTimes = times.filter((time) => !Number.isNaN(time));
    return validTimes.length > 0 ? Math.max(...validTimes) : undefined;
}

/**
 * Hook to check if the proactive app review modal should be shown
 */
function useProactiveAppReview(): UseProactiveAppReviewReturn {
    const [proactiveAppReview] = useOnyx(ONYXKEYS.NVP_APP_REVIEW);
    // Device-local prompt record. The server owns nvp_appReview and does not refresh its lastPrompt on
    // every response, so we keep our own copy of when we prompted in a key nothing but this client writes.
    const [localPromptRecord] = useOnyx(ONYXKEYS.APP_REVIEW_LAST_PROMPT);
    const [sessionAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    // The record survives sign-out, so it only counts for the account that wrote it.
    const localLastPrompt = localPromptRecord && localPromptRecord.accountID === sessionAccountID ? localPromptRecord.lastPrompt : undefined;
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
    } else {
        const lastPromptTime = getMostRecentPromptTime(proactiveAppReview?.lastPrompt, localLastPrompt);
        if (proactiveAppReview?.response && lastPromptTime === undefined) {
            // The prompt was answered but we have no timestamp to schedule the next one from.
            // Never fall through to "show" here, or the answer re-shows the modal forever.
            shouldShowModal = false;
        } else if (lastPromptTime !== undefined && timeAtMount - lastPromptTime < THIRTY_DAYS_IN_MS) {
            // Don't show again within 30 days of the last prompt
            shouldShowModal = false;
        }
    }

    return {
        shouldShowModal,
        proactiveAppReview,
    };
}

export default useProactiveAppReview;
