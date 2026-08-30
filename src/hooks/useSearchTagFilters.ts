import {openSearchTagFiltersPage, setSearchTagFiltersPagination} from '@libs/actions/Search';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {useCallback, useEffect, useRef, useState} from 'react';

import useOnyx from './useOnyx';

type UseSearchTagFiltersResult = {
    /** The paginated tag search results from Onyx, keyed by full Onyx key (searchPolicyTags_<policyID>) */
    searchResults: OnyxCollection<OnyxTypes.SearchPolicyTags>;

    /** Whether a request is currently in flight */
    isLoading: boolean;

    /** Whether there are more pages to load */
    hasMore: boolean;

    /** Load the next page of results */
    loadMore: () => void;

    /** Start a new search with the given query */
    search: (query: string) => void;

    /** Whether there are cached results from a previous fetch */
    hasCachedData: boolean;
};

/**
 * Hook for managing paginated tag filter search.
 * Handles API calls, pagination state, and Onyx data subscription.
 * Pagination state is persisted in Onyx (RAM-only) to survive component remounts.
 */
function useSearchTagFilters(): UseSearchTagFiltersResult {
    const [searchResults] = useOnyx(ONYXKEYS.COLLECTION.SEARCH_POLICY_TAGS);
    const [paginationState] = useOnyx(ONYXKEYS.RAM_ONLY_SEARCH_TAG_FILTERS_PAGINATION);
    const [isLoading, setIsLoading] = useState(false);

    // Derive pagination state from Onyx
    const hasMore = paginationState?.hasMore ?? false;
    const nextCursor = paginationState?.nextCursor ?? '';
    const searchQuery = paginationState?.searchQuery ?? '';

    // Track if we have cached data to avoid showing loading state on remount
    const hasCachedData = !!searchResults && Object.keys(searchResults).length > 0;

    // Keep ref updated with latest values for use in stable callbacks
    const stateRef = useRef({hasMore, nextCursor, searchQuery, hasCachedData, isLoading});
    useEffect(() => {
        stateRef.current = {hasMore, nextCursor, searchQuery, hasCachedData, isLoading};
    }, [hasMore, nextCursor, searchQuery, hasCachedData, isLoading]);

    const loadMore = useCallback(() => {
        const {hasMore: currentHasMore, nextCursor: currentCursor, searchQuery: currentQuery, isLoading: currentIsLoading} = stateRef.current;
        if (currentIsLoading || !currentHasMore) {
            return;
        }
        setIsLoading(true);
        openSearchTagFiltersPage({searchQuery: currentQuery, cursor: currentCursor, limit: CONST.SEARCH.TAG_FILTER_PAGE_SIZE})
            .then(({hasMore: newHasMore, nextCursor: newCursor}) => {
                setSearchTagFiltersPagination(newHasMore, newCursor, currentQuery);
            })
            .catch((error: Error) => Log.warn('Failed to load the next tag filters page', {error}))
            .finally(() => setIsLoading(false));
    }, []);

    const search = useCallback((query: string) => {
        const {hasCachedData: currentHasCachedData} = stateRef.current;

        // Reset pagination state immediately so loadMore doesn't fire with stale query/cursor
        setSearchTagFiltersPagination(false, '', query);

        // Only show loading if no cached data - otherwise fetch silently in background
        if (!currentHasCachedData) {
            setIsLoading(true);
        }

        openSearchTagFiltersPage({searchQuery: query, cursor: '', limit: CONST.SEARCH.TAG_FILTER_PAGE_SIZE})
            .then(({hasMore: newHasMore, nextCursor: newCursor}) => {
                setSearchTagFiltersPagination(newHasMore, newCursor, query);
            })
            .catch((error: Error) => Log.warn('Failed to fetch tag filters', {error}))
            .finally(() => setIsLoading(false));
    }, []);

    // Fetch the first page on mount; cached results are shown immediately and refreshed in the background
    useEffect(() => {
        search('');
    }, [search]);

    return {searchResults, isLoading, hasMore, loadMore, search, hasCachedData};
}

export default useSearchTagFilters;
