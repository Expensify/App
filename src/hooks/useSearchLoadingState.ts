import {useSearchStateContext} from '@components/Search/SearchContext';
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
    const {shouldUseLiveData} = useSearchStateContext();
    const [, cardFeedsResult] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);

    if (shouldUseLiveData || isOffline || !queryJSON) {
        return false;
    }

    const hasNoData = searchResults?.data === undefined;
    const validGroupBy = getValidGroupBy(queryJSON.groupBy);
    const isCardFeedsLoading = validGroupBy === CONST.SEARCH.GROUP_BY.CARD && cardFeedsResult?.status === 'loading';

    const hasErrors = Object.keys(searchResults?.errors ?? {}).length > 0;

    // Show page-level skeleton when no data has ever arrived for this query,
    // or when card feeds are still loading for card-grouped searches.
    // Once data arrives (even empty []), Search mounts and handles its own
    // loading/empty states internally via shouldShowLoadingState.
    // When errors are present, let Search mount so it can render FullPageErrorView.
    return (hasNoData && !hasErrors) || isCardFeedsLoading;
}

export default useSearchLoadingState;
