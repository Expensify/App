import {getAdminExpensifyCardFeedEntries, partitionExpensifyCardFeedsForSelector} from '@libs/ExpensifyCardFeedSelectorUtils';
import type {ExpensifyCardFeedEntry, ExpensifyCardFeedProgram} from '@libs/ExpensifyCardFeedSelectorUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

/** Pass a program set (e.g. TRAVEL_US) to list travel feeds; defaults to the US/GB card feeds. */
function useExpensifyCardFeedsForFeedSelector(
    policyID: string | undefined,
    programs?: ExpensifyCardFeedProgram[],
): {
    primaryFeeds: ExpensifyCardFeedEntry[];
    otherFeeds: ExpensifyCardFeedEntry[];
    allFeeds: ExpensifyCardFeedEntry[];
} {
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [cardSettingsCollection] = useOnyx(ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [domains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);

    if (!policyID) {
        return {primaryFeeds: [], otherFeeds: [], allFeeds: []};
    }
    const allFeeds = getAdminExpensifyCardFeedEntries(cardSettingsCollection, policies, domains, currentUserAccountID, programs);
    const {primary, other} = partitionExpensifyCardFeedsForSelector(allFeeds, policyID);
    return {primaryFeeds: primary, otherFeeds: other, allFeeds};
}

export default useExpensifyCardFeedsForFeedSelector;
