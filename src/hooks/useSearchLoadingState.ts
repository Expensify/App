import {useSearchStateContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';
import {getValidGroupBy, isSearchDataLoaded} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

/**
 * Computes whether the search page should show a loading skeleton
 */
function useSearchLoadingState(queryJSON: SearchQueryJSON | undefined): boolean {
    const {isOffline} = useNetwork();
    const {shouldUseLiveData, currentSearchResults} = useSearchStateContext();
    const [, cardFeedsResult] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);

    if (shouldUseLiveData || isOffline || !queryJSON) {
        return false;
    }

    const isDataLoaded = isSearchDataLoaded(currentSearchResults, queryJSON);
    const isLoadingWithNoData = !!currentSearchResults?.search?.isLoading && Array.isArray(currentSearchResults?.data) && currentSearchResults.data.length === 0;

    const validGroupBy = getValidGroupBy(queryJSON.groupBy);
    const isCardFeedsLoading = validGroupBy === CONST.SEARCH.GROUP_BY.CARD && cardFeedsResult?.status === 'loading';

    const hasNoData = currentSearchResults?.data === undefined;

    return (!isDataLoaded && hasNoData) || isLoadingWithNoData || isCardFeedsLoading;
}

export default useSearchLoadingState;
