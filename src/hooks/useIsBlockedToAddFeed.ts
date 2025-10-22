import {getCompanyFeeds, getSelectedFeed} from '@libs/CardUtils';
import {isCollectPolicy} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import useCardFeeds from './useCardFeeds';
import useCardsList from './useCardsList';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';

function useIsBlockedToAddFeed(policyID?: string) {
    const policy = usePolicy(policyID);

    const [cardFeeds, allFeedsResult, defaultFeed] = useCardFeeds(policyID);
    const [lastSelectedFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`, {canBeMissing: true});
    const companyFeeds = getCompanyFeeds(cardFeeds, true);
    const isCollect = isCollectPolicy(policy);
    const isAllFeedsResultLoading = isLoadingOnyxValue(allFeedsResult);
    const selectedFeed = getSelectedFeed(lastSelectedFeed, cardFeeds);
    const [cardsList] = useCardsList(policyID, selectedFeed);

    const isLoading = !cardFeeds || (!!cardFeeds.isLoading && isEmptyObject(cardsList)) || !!defaultFeed?.isLoading;

    return {isBlockToAddNewFeeds: isCollect && Object.entries(companyFeeds)?.length >= 1, isAllFeedsResultLoading: isCollect && (isLoading || isAllFeedsResultLoading)};
}

export default useIsBlockedToAddFeed;
