import {useSearchStateContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';
import type {SearchResults} from '@src/types/onyx';
import useNetwork from './useNetwork';

/**
 * Computes whether the search page should show a loading skeleton.
 * Accepts searchResults from the caller (which may include a sorting fallback)
 * rather than reading raw context data, so that sorting doesn't trigger a skeleton flash.
 *
 * Note: This hook intentionally does NOT check isCardFeedsLoading. Card feed loading is handled
 * internally by the Search component's shouldShowLoadingState — blocking Search from mounting
 * would prevent the API call from firing and create a deadlock.
 */
function useSearchLoadingState(queryJSON: SearchQueryJSON | undefined, searchResults: SearchResults | undefined): boolean {
    const {isOffline} = useNetwork();
    const {shouldUseLiveData} = useSearchStateContext();

    if (shouldUseLiveData || isOffline || !queryJSON) {
        return false;
    }

    const hasNoData = searchResults?.data === undefined;

    // Show page-level skeleton ONLY when no data has ever arrived for this query.
    // Once data arrives (even empty []), Search mounts and handles its own
    // loading/empty states internally via shouldShowLoadingState.
    return hasNoData;
}

export default useSearchLoadingState;
