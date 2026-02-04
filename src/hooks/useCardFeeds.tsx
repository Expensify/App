import type {OnyxCollection, ResultMetadata} from 'react-native-onyx';
import {getCombinedCardFeedsFromAllFeeds, getWorkspaceCardFeedsStatus} from '@libs/CardFeedUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeeds, CardFeedsStatusByDomainID, CombinedCardFeed, CombinedCardFeeds, CompanyCardFeedWithDomainID} from '@src/types/onyx';
import useOnyx from './useOnyx';
import useWorkspaceAccountID from './useWorkspaceAccountID';

/**
 * This is a custom hook that combines workspace and domain card feeds for a given policy.
 *
 * This hook:
 * - Gets all available feeds (ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER) from Onyx.
 * - Extracts and compiles card feeds data including only feeds where the `preferredPolicy` matches the `policyID`.
 *
 * @param policyID - The workspace policyID to filter and construct card feeds for.
 * @returns -
 *   A tuple containing:
 *     1. Combined workspace and domain card feeds specific to the given policyID (or `undefined` if unavailable).
 *     2. The result metadata from the Onyx collection fetch.
 *     3. Card feeds specific to the given policyID (or `undefined` if unavailable).
 */
const useCardFeeds = (policyID: string | undefined): [CombinedCardFeeds | undefined, ResultMetadata<OnyxCollection<CardFeeds>>, CardFeeds | undefined, CardFeedsStatusByDomainID] => {
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [allFeeds, allFeedsResult] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER, {canBeMissing: true});
    const defaultFeed = allFeeds?.[`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`];

    let workspaceFeeds: CombinedCardFeeds | undefined;
    if (policyID && allFeeds) {
        const shouldIncludeFeedPredicate = (combinedCardFeed: CombinedCardFeed) =>
            combinedCardFeed.preferredPolicy ? combinedCardFeed.preferredPolicy === policyID : combinedCardFeed.domainID === workspaceAccountID;
        workspaceFeeds = getCombinedCardFeedsFromAllFeeds(allFeeds, shouldIncludeFeedPredicate);
    }

    const workspaceCardFeedsStatus = getWorkspaceCardFeedsStatus(allFeeds);

    return [workspaceFeeds, allFeedsResult, defaultFeed, workspaceCardFeedsStatus];
};

export default useCardFeeds;
export type {CombinedCardFeeds, CompanyCardFeedWithDomainID, CombinedCardFeed};
