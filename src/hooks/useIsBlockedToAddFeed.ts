import {useEffect, useState} from 'react';
import {getCompanyFeeds} from '@libs/CardUtils';
import {isCollectPolicy} from '@libs/PolicyUtils';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import useCardFeeds from './useCardFeeds';
import usePolicy from './usePolicy';

/**
 * Hook to determine if a workspace on the Collect plan should be blocked from adding additional company card feeds.
 *
 * Collect plan workspaces are limited to one company card feed. This hook checks if the workspace already has
 * a feed and returns whether users should be blocked from adding more feeds.
 *
 * @param policyID - The ID of the workspace/policy to check
 * @returns An object containing:
 *   - isBlockedToAddNewFeeds: true if the workspace should be blocked from adding new feeds (Collect plan with 1+ existing feeds)
 *   - isAllFeedsResultLoading: true if feed data is still being loaded
 */
function useIsBlockedToAddFeed(policyID?: string) {
    const policy = usePolicy(policyID);
    const [cardFeeds, allFeedsResult, defaultFeed] = useCardFeeds(policyID);
    const companyFeeds = getCompanyFeeds(cardFeeds, true);
    const isCollect = isCollectPolicy(policy);
    const isAllFeedsResultLoading = isLoadingOnyxValue(allFeedsResult);
    const [prevCompanyFeedsLength, setPrevCompanyFeedsLength] = useState(0);

    const isLoading = !cardFeeds || !!defaultFeed?.isLoading;

    useEffect(() => {
        if (isLoading) {
            return;
        }
        const connectedFeeds = Object.entries(companyFeeds)?.length;
        setPrevCompanyFeedsLength(connectedFeeds);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want this effect to run again
    }, [isLoading]);

    return {
        isBlockedToAddNewFeeds: isCollect && !isLoading && prevCompanyFeedsLength >= 1,
        isAllFeedsResultLoading: isCollect && (isLoading || isAllFeedsResultLoading),
    };
}

export default useIsBlockedToAddFeed;
