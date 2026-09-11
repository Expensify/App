import useCardFeedsForDisplay from '@hooks/useCardFeedsForDisplay';
import useOnyx from '@hooks/useOnyx';

import type {SearchTypeMenuItem} from '@libs/SearchUIUtils';
import {getSuggestedSearches, getSuggestedSearchesVisibility} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {defaultExpensifyCardSelector} from '@selectors/Card';
import {isTrackIntentUserSelector} from '@selectors/Onboarding';

const HOME_INSIGHT_KEYS = [
    CONST.SEARCH.SEARCH_KEYS.SPEND_OVER_TIME,
    CONST.SEARCH.SEARCH_KEYS.TOP_SPENDERS,
    CONST.SEARCH.SEARCH_KEYS.TOP_CATEGORIES,
    CONST.SEARCH.SEARCH_KEYS.TOP_MERCHANTS,
] as const;

/**
 * Builds the suggested-search configs for the Home insights the current user should see, in display order.
 * Uses the same visibility rules as the Spend menu.
 */
function useHomeInsightConfigs(): SearchTypeMenuItem[] {
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [defaultExpensifyCard] = useOnyx(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST, {selector: defaultExpensifyCardSelector});
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const {defaultCardFeed, cardFeedsByPolicy} = useCardFeedsForDisplay();

    const {visibility, shouldShowExpensifyCard} = getSuggestedSearchesVisibility(session?.email, cardFeedsByPolicy, policies, defaultExpensifyCard, false, !!isTrackIntentUser);
    const suggestedSearches = getSuggestedSearches(session?.accountID, (defaultCardFeed ?? defaultExpensifyCard)?.id, shouldShowExpensifyCard);

    return HOME_INSIGHT_KEYS.filter((key) => visibility[key]).map((key) => suggestedSearches[key]);
}

export default useHomeInsightConfigs;
