import {useSearchResultsContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';

import type {SearchResults} from '@src/types/onyx';

import useNetwork from './useNetwork';

/**
 * Computes whether the search page should show a loading skeleton.
 * Accepts searchResults from the caller (which may include a sorting fallback)
 * rather than reading raw context data, so that sorting doesn't trigger a skeleton flash.
 */
function useSearchLoadingState(queryJSON: SearchQueryJSON | undefined, searchResults: SearchResults | undefined): boolean {
    const {isOffline} = useNetwork();
    const {shouldUseLiveData} = useSearchResultsContext();

    if (shouldUseLiveData || isOffline || !queryJSON) {
        return false;
    }

    const hasNoData = searchResults?.data === undefined;

    // Until search() stores the response code, handing off to Search would swap in its skeleton at a different offset.
    const hasClassifiedErrors = Object.keys(searchResults?.errors ?? {}).length > 0 && searchResults?.search?.responseJsonCode != null;

    // Keep the page skeleton visible until the first response arrives.
    // SearchPage turns a completed response with no data into an empty result, so Search can render its empty state.
    // Errors bypass the missing-data skeleton so Search can render FullPageErrorView.
    return hasNoData && !hasClassifiedErrors;
}

export default useSearchLoadingState;
