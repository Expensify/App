/**
 * Hook for looking up personal details on the server in search user filters,
 * tracking pagination and workspace-scoped logins returned for historical reports.
 */
import {openSearchUserFiltersPage} from '@libs/actions/Search';

import CONST from '@src/CONST';

import {useEffect, useRef, useState} from 'react';

import useNetwork from './useNetwork';

type UseSearchUserFiltersParams = {
    /** Comma-separated list of policy IDs to scope the lookup to specific workspaces */
    policyIDs: string;

    /** Debounced search term from the user filter input */
    searchTerm: string;

    /** Whether the selector is ready to issue requests */
    ready?: boolean;

    /** Callback invoked with the updated workspace-scoped logins when the server returns new ones */
    onScopedLoginsChange?: (policyIDs: string, logins: string[]) => void;
};

type UseSearchUserFiltersResult = {
    /** Whether a first-page lookup is in flight for the active search */
    isSearching: boolean;

    /** Whether the next page of users is loading */
    isLoadingMore: boolean;

    /** Whether more pages are available for the active search */
    hasMore: boolean;

    /** Load the next page of users for the active search */
    loadMoreUsers: () => void;
};

type PaginationState = {
    searchKey: string | undefined;
    hasMore: boolean;
    nextCursor: string;
    isLoadingMore: boolean;
};

// The pagination state is always replaced wholesale, never mutated, so every reset can share this object.
const EMPTY_PAGINATION: PaginationState = {searchKey: undefined, hasMore: false, nextCursor: '', isLoadingMore: false};

function useSearchUserFilters({policyIDs, searchTerm, ready = true, onScopedLoginsChange}: UseSearchUserFiltersParams): UseSearchUserFiltersResult {
    const {isOffline} = useNetwork();
    const [pagination, setPagination] = useState(EMPTY_PAGINATION);
    const requestSeqRef = useRef(0);

    const trimmedSearchTerm = searchTerm.trim();
    const searchKey = `${policyIDs}\0${trimmedSearchTerm}`;

    // Keying pagination on the active search resets the cursor and shows the spinner synchronously when
    // the search term, workspace scope, or readiness changes.
    const hasLoadedCurrentSearch = pagination.searchKey === searchKey;
    const isSearching = ready && !isOffline && !hasLoadedCurrentSearch;
    const hasMore = hasLoadedCurrentSearch && pagination.hasMore;
    const isLoadingMore = hasLoadedCurrentSearch && pagination.isLoadingMore;

    const applyUserFiltersResponse = (requestSeq: number, {hasMore: nextHasMore, nextCursor, logins}: {hasMore: boolean; nextCursor: string; logins: string[]}) => {
        if (requestSeq !== requestSeqRef.current) {
            return;
        }
        if (policyIDs && logins.length > 0) {
            onScopedLoginsChange?.(policyIDs, logins);
        }
        setPagination({searchKey, hasMore: nextHasMore, nextCursor, isLoadingMore: false});
    };

    // Shared by the effect that fetches the first page and by loadMoreUsers. An empty cursor means a new
    // search, so the request cancels in-flight ones and a failure resets the whole pagination.
    const fetchUserFiltersPage = (cursor: string, requestSeq: number) => {
        const isFirstPage = cursor === '';
        openSearchUserFiltersPage({searchQuery: trimmedSearchTerm, cursor, limit: CONST.SEARCH.USER_FILTER_PAGE_SIZE, policyIDs: policyIDs || undefined}, isFirstPage)
            .then((result) => applyUserFiltersResponse(requestSeq, result))
            .catch(() => {
                if (requestSeq !== requestSeqRef.current) {
                    return;
                }
                if (isFirstPage) {
                    setPagination({searchKey, hasMore: false, nextCursor: '', isLoadingMore: false});
                } else {
                    setPagination((prev) => ({...prev, isLoadingMore: false}));
                }
            });
    };

    const invalidateInFlightRequests = () => {
        requestSeqRef.current++;
    };

    useEffect(() => {
        if (!ready || isOffline || hasLoadedCurrentSearch) {
            return;
        }

        const requestSeq = ++requestSeqRef.current;

        fetchUserFiltersPage('', requestSeq);

        return invalidateInFlightRequests;
    }, [ready, isOffline, hasLoadedCurrentSearch, trimmedSearchTerm, policyIDs, fetchUserFiltersPage]);

    const loadMoreUsers = () => {
        if (isOffline || !hasMore || isLoadingMore || isSearching) {
            return;
        }

        const requestSeq = requestSeqRef.current;
        setPagination((prev) => ({...prev, isLoadingMore: true}));

        fetchUserFiltersPage(pagination.nextCursor, requestSeq);
    };

    return {
        isSearching,
        isLoadingMore,
        hasMore,
        loadMoreUsers,
    };
}

export default useSearchUserFilters;
