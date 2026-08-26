import {getAdminTravelBillingFeedEntries, partitionTravelBillingFeedsForSelector} from '@libs/TravelBillingFeedSelectorUtils';
import type {TravelBillingFeedEntry} from '@libs/TravelBillingFeedSelectorUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

function useTravelBillingFeedsForFeedSelector(policyID: string | undefined): {
    primaryFeeds: TravelBillingFeedEntry[];
    otherFeeds: TravelBillingFeedEntry[];
    allFeeds: TravelBillingFeedEntry[];
} {
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [cardSettingsCollection] = useOnyx(ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [domains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);

    if (!policyID) {
        return {primaryFeeds: [], otherFeeds: [], allFeeds: []};
    }
    const allFeeds = getAdminTravelBillingFeedEntries(cardSettingsCollection, policies, domains, currentUserAccountID);
    const {primary, other} = partitionTravelBillingFeedsForSelector(allFeeds, policyID);
    return {primaryFeeds: primary, otherFeeds: other, allFeeds};
}

export default useTravelBillingFeedsForFeedSelector;
