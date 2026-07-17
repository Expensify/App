import {useSearchResultsContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';

import {getValidGroupBy} from '@libs/SearchUIUtils';

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

    const hasNoData = searchResults?.data === undefined;
    const validGroupBy = getValidGroupBy(queryJSON.groupBy);
    const isCardFeedsLoading = validGroupBy === CONST.SEARCH.GROUP_BY.CARD && cardFeedsResult?.status === 'loading';

    const hasErrors = Object.keys(searchResults?.errors ?? {}).length > 0;
    // A resolved request stamps `state: loaded` even when it wrote no data. That terminal state hands off to
    // Search's own empty view, so a dataless 200 no longer pins the page skeleton on the `data === undefined` check.
    const isLoaded = searchResults?.search?.state === CONST.SEARCH.SNAPSHOT_STATE.LOADED;

    // Show page-level skeleton when no data has ever arrived for this query and the request has not resolved,
    // or when card feeds are still loading for card-grouped searches.
    // Once data arrives (even empty []) or the request resolves, Search mounts and handles its own
    // loading/empty states internally via shouldShowLoadingState.
    // When errors are present, let Search mount so it can render FullPageErrorView.
    return (hasNoData && !hasErrors && !isLoaded) || isCardFeedsLoading;
}

export default useSearchLoadingState;
