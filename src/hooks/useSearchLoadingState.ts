import {useSearchResultsContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';

import {getValidGroupBy, isSearchDataLoaded} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

/**
 * Computes whether the search page should show a loading skeleton.
 * Accepts searchResults from the caller (which may include a sorting fallback)
 * rather than reading raw context data, so that sorting doesn't trigger a skeleton flash.
 */
function useSearchLoadingState(queryJSON: SearchQueryJSON | undefined, searchResults: SearchResults | undefined): boolean {
    const {isOffline} = useNetwork();
    const {shouldUseLiveData} = useSearchResultsContext();
    const [, cardFeedsResult] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);

    if (shouldUseLiveData || isOffline || !queryJSON) {
        return false;
    }

    // Data left over from another query doesn't count, or Search mounts with it and shows its empty state while the new query loads.
    const hasNoData = searchResults?.data === undefined || !isSearchDataLoaded(searchResults, queryJSON);
    const validGroupBy = getValidGroupBy(queryJSON.groupBy);
    const isCardFeedsLoading = validGroupBy === CONST.SEARCH.GROUP_BY.CARD && cardFeedsResult?.status === 'loading';

    // Until search() stores the response code, handing off to Search would swap in its skeleton at a different offset.
    const hasClassifiedErrors = Object.keys(searchResults?.errors ?? {}).length > 0 && searchResults?.search?.responseJsonCode != null;

    // Keep the page skeleton visible until the first response arrives and while card feeds load.
    // SearchPage turns a completed response with no data into an empty result, so Search can render its empty state.
    // Errors bypass the missing-data skeleton so Search can render FullPageErrorView.
    return (hasNoData && !hasClassifiedErrors) || isCardFeedsLoading;
}

export default useSearchLoadingState;
