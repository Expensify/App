/**
 * Hook for looking up personal details on the server in search user filters,
 * caching base pagination and workspace-scoped logins in RAM-only Onyx across remounts.
 */
import {ALL_POLICY_IDS_KEY, openSearchUserFiltersPage, setSearchUserFiltersState} from '@libs/actions/Search';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchUserFiltersState} from '@src/types/onyx';

import {useEffect, useRef, useState} from 'react';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

type UseSearchUserFiltersParams = {
    /** Comma-separated list of policy IDs to scope the lookup to specific workspaces */
    policyIDs: string;

    /** Debounced search term from the user filter input */
    searchTerm: string;

    /** Whether the selector is ready to issue requests */
    ready?: boolean;
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

type QueryPaginationState = {
    searchKey: string | undefined;
    hasMore: boolean;
    nextCursor: string;
};

// The query pagination state is always replaced wholesale, so every reset can share this object.
const EMPTY_QUERY_PAGINATION: QueryPaginationState = {searchKey: undefined, hasMore: false, nextCursor: ''};

// Use NUL so policy IDs and user queries cannot collide across the separator.
const SEARCH_KEY_SEPARATOR = '\0';

function getSearchKey(policyIDs: string, query = ''): string {
    return `${policyIDs}${SEARCH_KEY_SEPARATOR}${query}`;
}

function areLoginListsEqual(prev: string[] | undefined, next: string[] | undefined): boolean {
    if (prev === next) {
        return true;
    }
    if (!prev || !next || prev.length !== next.length) {
        return false;
    }
    const prevSet = new Set(prev);
    return next.every((login) => prevSet.has(login));
}

function mergeScopedLogins(prev: string[] | undefined, incoming: string[], shouldReplace: boolean): string[] | undefined {
    const next = shouldReplace ? Array.from(new Set(incoming)) : Array.from(new Set([...(prev ?? []), ...incoming]));
    if (next.length === 0) {
        return prev?.length ? undefined : prev;
    }
    return areLoginListsEqual(prev, next) ? prev : next;
}

function useSearchUserFilters({policyIDs, searchTerm, ready = true}: UseSearchUserFiltersParams): UseSearchUserFiltersResult {
    const {isOffline} = useNetwork();
    const policyIDsKey = policyIDs || ALL_POLICY_IDS_KEY;
    const [cachedBase] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_SEARCH_USER_FILTERS_STATE}${policyIDsKey}`);
    const trimmedSearchTerm = searchTerm.trim();
    const isEmptyQuery = trimmedSearchTerm === '';
    const searchKey = getSearchKey(policyIDs, trimmedSearchTerm);

    const [queryPagination, setQueryPagination] = useState(EMPTY_QUERY_PAGINATION);
    const [activeSearchState, setActiveSearchState] = useState({
        searchKey,
        isOffline,
        isLoadingMore: false,
        hasFailed: false,
    });

    const requestSeqRef = useRef(0);
    const refreshedPolicyIDsRef = useRef<string | undefined>(undefined);
    const cachedBaseRef = useRef(cachedBase);

    // Reset per-search flags synchronously when the active scope, query, or network status changes so
    // returning to an earlier search or going offline does not keep a stale spinner or failure.
    if (activeSearchState.searchKey !== searchKey || activeSearchState.isOffline !== isOffline) {
        setActiveSearchState({searchKey, isOffline, isLoadingMore: false, hasFailed: false});
    }

    const isSameSearchState = activeSearchState.searchKey === searchKey && activeSearchState.isOffline === isOffline;
    const hasLoadedBase = !!cachedBase?.hasLoadedBase;
    const hasFailedCurrentSearch = isSameSearchState && activeSearchState.hasFailed;
    const hasLoadedCurrentSearch = (isEmptyQuery ? hasLoadedBase : queryPagination.searchKey === searchKey) || hasFailedCurrentSearch;

    const isSearching = ready && !isOffline && !hasLoadedCurrentSearch;
    const hasMore = isEmptyQuery ? hasLoadedBase && !!cachedBase?.hasMore : queryPagination.searchKey === searchKey && queryPagination.hasMore;
    const nextCursor = isEmptyQuery ? (cachedBase?.nextCursor ?? '') : queryPagination.nextCursor;
    const isLoadingMore = isSameSearchState && activeSearchState.isLoadingMore;

    const updateCachedBase = (nextState: SearchUserFiltersState) => {
        const prev = cachedBaseRef.current;
        if (
            prev?.hasLoadedBase === nextState.hasLoadedBase &&
            prev?.hasMore === nextState.hasMore &&
            prev?.nextCursor === nextState.nextCursor &&
            areLoginListsEqual(prev?.scopedLogins, nextState.scopedLogins)
        ) {
            return;
        }
        cachedBaseRef.current = nextState;
        setSearchUserFiltersState(policyIDs, nextState);
    };

    const applyUserFiltersResponse = (
        requestSeq: number,
        isFirstPage: boolean,
        {hasMore: nextHasMore, nextCursor: responseCursor, logins}: {hasMore: boolean; nextCursor: string; logins: string[]},
    ) => {
        if (requestSeq !== requestSeqRef.current) {
            return;
        }

        const prev = cachedBaseRef.current;
        setActiveSearchState((current) => (current.isLoadingMore || current.hasFailed ? {searchKey, isOffline, isLoadingMore: false, hasFailed: false} : current));

        if (isEmptyQuery) {
            // Replace scoped logins only when page 1 holds the complete workspace result set so removed logins are pruned.
            const nextScopedLogins = policyIDs ? mergeScopedLogins(prev?.scopedLogins, logins, isFirstPage && !nextHasMore) : prev?.scopedLogins;
            refreshedPolicyIDsRef.current = policyIDs;
            updateCachedBase({hasLoadedBase: true, hasMore: nextHasMore, nextCursor: responseCursor, scopedLogins: nextScopedLogins});
            return;
        }

        if (policyIDs && logins.length > 0) {
            const nextScopedLogins = mergeScopedLogins(prev?.scopedLogins, logins, false);
            if (nextScopedLogins !== prev?.scopedLogins) {
                updateCachedBase({...prev, scopedLogins: nextScopedLogins});
            }
        }
        setQueryPagination({searchKey, hasMore: nextHasMore, nextCursor: responseCursor});
    };

    // An empty cursor starts a new search, so it cancels superseded in-flight requests.
    const fetchUserFiltersPage = (cursor: string, requestSeq: number) => {
        const isFirstPage = cursor === '';
        openSearchUserFiltersPage({searchQuery: trimmedSearchTerm, cursor, limit: CONST.SEARCH.USER_FILTER_PAGE_SIZE, policyIDs: policyIDs || undefined}, isFirstPage)
            .then((result) => applyUserFiltersResponse(requestSeq, isFirstPage, result))
            .catch(() => {
                if (requestSeq !== requestSeqRef.current) {
                    return;
                }
                if (isFirstPage) {
                    // Leave Onyx untouched on failure so reopening retries, and keep cached data if a silent refresh fails.
                    if (!isEmptyQuery || !cachedBaseRef.current?.hasLoadedBase) {
                        setActiveSearchState({searchKey, isOffline, isLoadingMore: false, hasFailed: true});
                    }
                } else {
                    setActiveSearchState((current) => (current.isLoadingMore ? {...current, isLoadingMore: false} : current));
                }
            });
    };

    const invalidateInFlightRequests = () => {
        requestSeqRef.current++;
    };

    useEffect(() => {
        cachedBaseRef.current = cachedBase;
    }, [cachedBase]);

    useEffect(() => invalidateInFlightRequests, [invalidateInFlightRequests]);

    useEffect(() => {
        if (isOffline) {
            refreshedPolicyIDsRef.current = undefined;
            invalidateInFlightRequests();
            return;
        }

        const shouldRefreshBase = isEmptyQuery && hasLoadedBase && refreshedPolicyIDsRef.current !== policyIDs;
        if (!ready || (hasLoadedCurrentSearch && !shouldRefreshBase)) {
            return;
        }

        const requestSeq = ++requestSeqRef.current;
        fetchUserFiltersPage('', requestSeq);

        return invalidateInFlightRequests;
    }, [ready, isOffline, hasLoadedCurrentSearch, hasLoadedBase, isEmptyQuery, trimmedSearchTerm, policyIDs, fetchUserFiltersPage, invalidateInFlightRequests]);

    const loadMoreUsers = () => {
        if (isOffline || !hasMore || isLoadingMore || isSearching) {
            return;
        }

        // Bumping the sequence prevents an in-flight silent refresh from overwriting the next page cursor.
        const requestSeq = ++requestSeqRef.current;
        setActiveSearchState({searchKey, isOffline, isLoadingMore: true, hasFailed: false});

        fetchUserFiltersPage(nextCursor, requestSeq);
    };

    return {
        isSearching,
        isLoadingMore,
        hasMore,
        loadMoreUsers,
    };
}

export default useSearchUserFilters;
