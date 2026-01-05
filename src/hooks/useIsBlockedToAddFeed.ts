import {useMemo} from 'react';
import {getCompanyFeeds, isCSVFeed} from '@libs/CardUtils';
import {isCollectPolicy} from '@libs/PolicyUtils';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import useCardFeeds from './useCardFeeds';
import usePolicy from './usePolicy';

/**
 * Hook to determine if a workspace on the Collect plan should be blocked from adding additional company card feeds.
 *
 * Collect plan workspaces are limited to one company card feed. This hook checks if the workspace already has
 * a feed and returns whether users should be blocked from adding more feeds.
 * CSV uploads from Classic should not count toward this limit.
 *
 * @param policyID - The ID of the workspace/policy to check
 * @returns An object containing:
 *   - isBlockedToAddNewFeeds: true if the workspace should be blocked from adding new feeds (Collect plan with 1+ existing feeds)
 *   - isAllFeedsResultLoading: true if feed data is still being loaded
 */
function useIsBlockedToAddFeed(policyID?: string) {
    const policy = usePolicy(policyID);
    const [cardFeeds, allFeedsResult, defaultFeed] = useCardFeeds(policyID);
    // Include pending feeds in the count to prevent users from adding multiple feeds
    // Pending feeds count toward the limit because the backend checks before adding
    const companyFeeds = getCompanyFeeds(cardFeeds, true, false);
    const isCollect = isCollectPolicy(policy);
    const isAllFeedsResultLoading = isLoadingOnyxValue(allFeedsResult);

    const isLoading = !cardFeeds || !!defaultFeed?.isLoading;

    // Count feeds excluding CSV uploads from Classic and Expensify Cards
    // Include pending feeds in the count to enforce the limit
    const connectedFeedsCount = useMemo(() => {
        if (isLoading) {
            return 0;
        }
        const feeds = companyFeeds ?? {};
        const nonCSVFeeds = Object.keys(feeds).filter((feedKey) => !isCSVFeed(feedKey));
        return nonCSVFeeds.length;
    }, [isLoading, companyFeeds]);

    return {
        isBlockedToAddNewFeeds: isCollect && !isLoading && connectedFeedsCount >= 1,
        isAllFeedsResultLoading: isCollect && (isLoading || isAllFeedsResultLoading),
    };
}

export default useIsBlockedToAddFeed;
