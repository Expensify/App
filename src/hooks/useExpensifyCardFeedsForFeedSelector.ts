import {getAdminExpensifyCardFeedEntries, partitionExpensifyCardFeedsForSelector} from '@libs/ExpensifyCardFeedSelectorUtils';
import type {ExpensifyCardFeedEntry} from '@libs/ExpensifyCardFeedSelectorUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useExpensifyCardFeedsForFeedSelector(policyID: string | undefined): {
    primaryFeeds: ExpensifyCardFeedEntry[];
    otherFeeds: ExpensifyCardFeedEntry[];
    allFeeds: ExpensifyCardFeedEntry[];
} {
    const [cardSettingsCollection] = useOnyx(ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    if (!policyID) {
        return {primaryFeeds: [], otherFeeds: [], allFeeds: []};
    }
    const allFeeds = getAdminExpensifyCardFeedEntries(cardSettingsCollection, policies);
    const {primary, other} = partitionExpensifyCardFeedsForSelector(allFeeds, policyID);
    return {primaryFeeds: primary, otherFeeds: other, allFeeds};
}

export default useExpensifyCardFeedsForFeedSelector;
