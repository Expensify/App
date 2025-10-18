import useCardsList from '@hooks/useCardsList';
import useOnyx from '@hooks/useOnyx';
import {getCompanyFeeds, getSelectedFeed} from '@libs/CardUtils';
import {isCollectPolicy} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import useCardFeeds from './useCardFeeds';
import usePolicy from './usePolicy';

function useIsBlockToAddFeed(policyID?: string) {
    const policy = usePolicy(policyID);

    const [cardFeeds, allFeedsResult] = useCardFeeds(policyID);
    const [lastSelectedFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`, {canBeMissing: true});
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const isCollect = isCollectPolicy(policy);
    const isAllFeedsResultLoading = isLoadingOnyxValue(allFeedsResult);
    const selectedFeed = getSelectedFeed(lastSelectedFeed, cardFeeds);
    const [cardsList] = useCardsList(policyID, selectedFeed);

    const isLoading = !cardFeeds || (!!cardFeeds.isLoading && isEmptyObject(cardsList));

    return {isBlockToAddNewFeeds: isCollect && Object.entries(companyFeeds)?.length >= 1, isAllFeedsResultLoading: !isCollect ? false : isLoading || isAllFeedsResultLoading};
}

export default useIsBlockToAddFeed;
