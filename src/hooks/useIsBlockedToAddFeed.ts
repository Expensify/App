import {useEffect, useState} from 'react';
import {checkIfNewFeedConnected, getCompanyFeeds} from '@libs/CardUtils';
import {isCollectPolicy} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import useCardFeeds from './useCardFeeds';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';

function useIsBlockedToAddFeed(policyID?: string) {
    const policy = usePolicy(policyID);
    const [cardFeeds, allFeedsResult, defaultFeed] = useCardFeeds(policyID);
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD, {canBeMissing: true});
    const companyFeeds = getCompanyFeeds(cardFeeds, true);
    const isCollect = isCollectPolicy(policy);
    const isAllFeedsResultLoading = isLoadingOnyxValue(allFeedsResult);
    const [prevCardFeeds, setPrevCardFeeds] = useState(cardFeeds);
    const [isNewFeedConnected, setIsNewFeedConnected] = useState(false);

    const isLoading = !cardFeeds || !!defaultFeed?.isLoading;

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
