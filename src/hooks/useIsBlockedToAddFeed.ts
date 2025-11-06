import {useEffect, useState} from 'react';
import {checkIfNewFeedConnected, getCompanyFeeds, getSelectedFeed} from '@libs/CardUtils';
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
    const [cardFeeds, allFeedsResult, defaultFeed, isFeedsLoading] = useCardFeeds(policyID);
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD, {canBeMissing: true});
    const [lastSelectedFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`, {canBeMissing: true});
    const companyFeeds = getCompanyFeeds(cardFeeds, true);
    const isCollect = isCollectPolicy(policy);
    const isAllFeedsResultLoading = isLoadingOnyxValue(allFeedsResult);
    const selectedFeed = getSelectedFeed(lastSelectedFeed, cardFeeds);
    const [cardsList] = useCardsList(selectedFeed);
    const [prevCardFeeds, setPrevCardFeeds] = useState(cardFeeds);
    const [isNewFeedConnected, setIsNewFeedConnected] = useState(false);

    const isLoading = !cardFeeds || (isFeedsLoading && isEmptyObject(cardsList)) || !!defaultFeed?.isLoading;

    useEffect(() => {
        const plaidConnectedFeed = addNewCard?.data?.plaidConnectedFeed;

        const {isNewFeedConnected: newFeedConnected} = checkIfNewFeedConnected(prevCardFeeds ?? {}, cardFeeds ?? {}, plaidConnectedFeed);
        setIsNewFeedConnected(!!newFeedConnected);
        setPrevCardFeeds(cardFeeds);
    }, [addNewCard?.data?.plaidConnectedFeed, prevCardFeeds, cardFeeds]);

    return {
        isBlockedToAddNewFeeds: isCollect && Object.entries(companyFeeds)?.length >= 1 && !isNewFeedConnected,
        isAllFeedsResultLoading: isCollect && (isLoading || isAllFeedsResultLoading),
    };
}

export default useIsBlockedToAddFeed;
