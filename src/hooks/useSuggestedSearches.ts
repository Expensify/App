import {defaultExpensifyCardSelector} from '@selectors/Card';
import type {OnyxEntry} from 'react-native-onyx';
import {getSuggestedSearches, getSuggestedSearchesVisibility} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Session} from '@src/types/onyx';
import useCardFeedsForDisplay from './useCardFeedsForDisplay';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

const currentUserEmailSelector = (session: OnyxEntry<Session>) => session?.email;

/**
 * Builds the suggested searches with the same visibility-derived parameters the LHN menu uses (notably
 * `shouldShowExpensifyCard`, which decides Reconciliation's withdrawalType). Both the menu and the search
 * page must build them identically, otherwise the page can't match a query back to its suggested search.
 */
function useSuggestedSearches() {
    const {accountID} = useCurrentUserPersonalDetails();
    const {defaultCardFeed, cardFeedsByPolicy} = useCardFeedsForDisplay();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [currentUserEmail] = useOnyx(ONYXKEYS.SESSION, {selector: currentUserEmailSelector});
    const [defaultExpensifyCard] = useOnyx(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST, {selector: defaultExpensifyCardSelector});

    const {shouldShowExpensifyCard} = getSuggestedSearchesVisibility(currentUserEmail, cardFeedsByPolicy, allPolicies, defaultExpensifyCard);
    return getSuggestedSearches(accountID, defaultCardFeed?.id, shouldShowExpensifyCard);
}

export default useSuggestedSearches;
