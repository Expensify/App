import {openSearchTagFiltersPage} from '@libs/actions/Search';

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
};

/**
 * Hook for managing paginated tag filter search.
 * Handles API calls, pagination state, and Onyx data subscription.
 */
function useSearchTagFilters(): UseSearchTagFiltersResult {
    const [searchResults] = useOnyx(ONYXKEYS.COLLECTION.SEARCH_POLICY_TAGS);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [nextCursor, setNextCursor] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Keep ref updated with latest searchResults for use in stable callbacks
    const searchResultsRef = useRef(searchResults);
    useEffect(() => {
        searchResultsRef.current = searchResults;
    }, [searchResults]);

    const loadMore = useCallback(() => {
        if (isLoading || !hasMore) {
            return;
        }
        setIsLoading(true);
        openSearchTagFiltersPage({searchQuery, cursor: nextCursor, limit: CONST.SEARCH.TAG_FILTER_PAGE_SIZE})
            .then(({hasMore: newHasMore, nextCursor: newCursor}) => {
                setHasMore(newHasMore);
                setNextCursor(newCursor);
            })
            .finally(() => setIsLoading(false));
    }, [isLoading, hasMore, searchQuery, nextCursor]);

    const search = useCallback((query: string) => {
        setSearchQuery(query);
        setNextCursor('');
        setHasMore(false);
        // Only show loading if no cached data - otherwise fetch silently in background
        const hasCachedData = searchResultsRef.current && Object.keys(searchResultsRef.current).length > 0;
        if (!hasCachedData) {
            setIsLoading(true);
        }
        openSearchTagFiltersPage({searchQuery: query, cursor: '', limit: CONST.SEARCH.TAG_FILTER_PAGE_SIZE})
            .then(({hasMore: newHasMore, nextCursor: newCursor}) => {
                setHasMore(newHasMore);
                setNextCursor(newCursor);
            })
            .finally(() => setIsLoading(false));
    }, []);

    return {searchResults, isLoading, hasMore, loadMore, search};
}

export default useSearchTagFilters;
