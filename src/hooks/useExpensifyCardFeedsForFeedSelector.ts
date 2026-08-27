import {getAdminExpensifyCardFeedEntries, partitionExpensifyCardFeedsForSelector} from '@libs/ExpensifyCardFeedSelectorUtils';
import type {ExpensifyCardFeedEntry, ExpensifyCardFeedProgram} from '@libs/ExpensifyCardFeedSelectorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

/** Regular card feeds live under the US/GB programs. Pass a different program set (e.g. TRAVEL_US) to list travel feeds. */
const DEFAULT_FEED_PROGRAMS: ExpensifyCardFeedProgram[] = [CONST.COUNTRY.US, CONST.COUNTRY.GB];

function useExpensifyCardFeedsForFeedSelector(
    policyID: string | undefined,
    programs: ExpensifyCardFeedProgram[] = DEFAULT_FEED_PROGRAMS,
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
