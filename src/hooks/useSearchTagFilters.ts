import {clearSearchTagFiltersState, openSearchTagFiltersPage, setSearchTagFiltersPagination} from '@libs/actions/Search';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {useEffect, useRef, useState} from 'react';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

type UseSearchTagFiltersResult = {
    /** The paginated tag search results from Onyx, keyed by full Onyx key (searchPolicyTags_<policyID>) */
    searchResults: OnyxCollection<OnyxTypes.SearchPolicyTags>;

    /** Whether a new search request is in flight */
    isSearching: boolean;

    /** Whether the next page of results is loading */
    isLoadingMore: boolean;

    /** Whether there are more pages to load */
    hasMore: boolean;

    /** Load the next page of results */
    loadMore: () => void;

    /** Start a new tag search with the given query */
    searchTags: (query: string) => void;

    /** Whether the first fetch is still in flight with no results to show yet */
    isInitialLoading: boolean;

    /** The search query of the currently displayed results */
    searchQuery: string;
};

/** Logs tag filter request failures; aborted requests are expected when a newer search supersedes them */
function logRequestFailure(message: string, error: Error) {
    if (error.name === CONST.ERROR.REQUEST_CANCELLED) {
        return;
    }
    Log.warn(message, {error});
}

/**
 * Hook for managing paginated tag filter search.
 * Handles API calls, pagination state, and Onyx data subscription.
 * Pagination state is persisted in Onyx (RAM-only) to survive component remounts.
 * Accepts a comma-separated list of policy IDs to scope results to specific workspaces.
 */
function useSearchTagFilters(policyIDs: string): UseSearchTagFiltersResult {
    const {isOffline} = useNetwork();
    const [searchResults] = useOnyx(ONYXKEYS.COLLECTION.SEARCH_POLICY_TAGS);
    const [paginationState] = useOnyx(ONYXKEYS.RAM_ONLY_SEARCH_TAG_FILTERS_PAGINATION);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Derive pagination state from Onyx
    const hasMore = paginationState?.hasMore ?? false;
    const nextCursor = paginationState?.nextCursor ?? '';
    const searchQuery = paginationState?.searchQuery ?? '';

    // Track if we have cached data to avoid showing loading state on remount
    const hasCachedData = !!searchResults && Object.keys(searchResults).length > 0;
    // Only treat the cache as complete when the empty-query dataset is fully loaded.
    // A finished server search for a non-empty term can still be a partial result set.
    const hasCompleteEmptyQueryCache = hasCachedData && !hasMore && searchQuery === '';

    // Keep ref updated with latest values for use in stable callbacks
    const stateRef = useRef({hasMore, nextCursor, searchQuery, hasCachedData, hasCompleteEmptyQueryCache, isSearching, isLoadingMore});
    useEffect(() => {
        stateRef.current = {hasMore, nextCursor, searchQuery, hasCachedData, hasCompleteEmptyQueryCache, isSearching, isLoadingMore};
    }, [hasMore, nextCursor, searchQuery, hasCachedData, hasCompleteEmptyQueryCache, isSearching, isLoadingMore]);

    // Incremented on every new search so a cancelled request doesn't clear the loading state of its successor
    const requestSeqRef = useRef(0);

    // Gates the full-list spinner to the initial load. Once any search settles, the list stays mounted
    // so the search input keeps focus while the user types, even when the latest results are empty.
    const [hasCompletedSearch, setHasCompletedSearch] = useState(hasCachedData);

    const prevWasOfflineRef = useRef(isOffline);

    const loadMore = () => {
        const {hasMore: currentHasMore, nextCursor: currentCursor, searchQuery: currentQuery, isSearching: currentIsSearching, isLoadingMore: currentIsLoadingMore} = stateRef.current;
        if (currentIsSearching || currentIsLoadingMore || !currentHasMore || isOffline) {
            return;
        }
        const requestSeq = requestSeqRef.current;
        setIsLoadingMore(true);
        openSearchTagFiltersPage({searchQuery: currentQuery, cursor: currentCursor, limit: CONST.SEARCH.TAG_FILTER_PAGE_SIZE, policyIDs})
            .then(({hasMore: newHasMore, nextCursor: newCursor}) => {
                setSearchTagFiltersPagination(newHasMore, newCursor, currentQuery);
            })
            .catch((error: Error) => logRequestFailure('Failed to load the next tag filters page', error))
            .finally(() => {
                if (requestSeq !== requestSeqRef.current) {
                    return;
                }
                setIsLoadingMore(false);
            });
    };

    const searchTags = (query: string) => {
        if (isOffline) {
            // When offline, update the search query so TagSelector can filter cached results locally
            setSearchTagFiltersPagination(false, '', query);
            return;
        }

        const {hasCompleteEmptyQueryCache: currentHasCompleteEmptyQueryCache, hasMore: currentHasMore, nextCursor: currentCursor} = stateRef.current;

        // When the full empty-query dataset is already cached, filter locally instead of hitting the server on every keystroke.
        if (currentHasCompleteEmptyQueryCache) {
            setSearchTagFiltersPagination(currentHasMore, currentCursor, query);
            setHasCompletedSearch(true);
            return;
        }

        const requestSeq = ++requestSeqRef.current;

        // Reset pagination state immediately so loadMore doesn't fire with stale query/cursor
        setSearchTagFiltersPagination(false, '', query);

        // A new search cancels any in-flight request, so it owns the loading state from here on.
        // The collection is cleared by openSearchTagFiltersPage, so there is no cached data to show silently.
        setIsSearching(true);

        openSearchTagFiltersPage({searchQuery: query, cursor: '', limit: CONST.SEARCH.TAG_FILTER_PAGE_SIZE, policyIDs}, true)
            .then(({hasMore: newHasMore, nextCursor: newCursor}) => {
                setSearchTagFiltersPagination(newHasMore, newCursor, query);
            })
            .catch((error: Error) => logRequestFailure('Failed to fetch tag filters', error))
            .finally(() => {
                if (requestSeq !== requestSeqRef.current) {
                    return;
                }
                setHasCompletedSearch(true);
                setIsSearching(false);
            });
    };

    // Clear persisted pagination and cached pages when the filter closes so a fresh open refetches with valid hasMore.
    useEffect(() => {
        return () => {
            clearSearchTagFiltersState();
        };
    }, []);

    // Fetch the first page on mount, when the workspace scope changes, and on reconnect.
    // Skips the fetch while offline and re-fetches on reconnect, matching useLoadSearchCategoryData.
    // Reconnect uses the active search query so results stay in sync with the search input.
    // searchTags is not memoized, so it cannot be in the dependency array — it would fire on every render.
    // searchTags reads latest state via refs, so the closure captured here is safe to call.
    useEffect(() => {
        if (isOffline) {
            prevWasOfflineRef.current = true;
            return;
        }

        const wasOffline = prevWasOfflineRef.current;
        prevWasOfflineRef.current = false;

        Promise.resolve().then(() => {
            if (wasOffline) {
                searchTags(stateRef.current.searchQuery);
                return;
            }

            searchTags('');
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [policyIDs, isOffline]);

    const isInitialLoading = isSearching && !hasCompletedSearch;

    return {searchResults, isSearching, isLoadingMore, hasMore, loadMore, searchTags, isInitialLoading, searchQuery};
}

export default useSearchTagFilters;
