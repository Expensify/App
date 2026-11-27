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

function resolveScopedLogins(prev: string[] | undefined, incoming: string[], shouldReplace: boolean): string[] | undefined {
    if (shouldReplace) {
        const deduped = Array.from(new Set(incoming));
        if (deduped.length === 0) {
            return prev?.length ? undefined : prev;
        }
        return areLoginListsEqual(prev, deduped) ? prev : deduped;
    }

    if (incoming.length === 0) {
        return prev;
    }

    const merged = Array.from(new Set([...(prev ?? []), ...incoming]));
    if (prev && merged.length === prev.length) {
        return prev;
    }
    return merged;
}

function useSearchUserFilters({policyIDs, searchTerm, ready = true}: UseSearchUserFiltersParams): UseSearchUserFiltersResult {
    const {isOffline} = useNetwork();
    const policyIDsKey = policyIDs || ALL_POLICY_IDS_KEY;
    const [cachedBase] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_SEARCH_USER_FILTERS_STATE}${policyIDsKey}`);
    const [queryPagination, setQueryPagination] = useState(EMPTY_QUERY_PAGINATION);
    const [loadingMoreSearchKey, setLoadingMoreSearchKey] = useState<string | undefined>(undefined);
    const [failedSearchKey, setFailedSearchKey] = useState<string | undefined>(undefined);

    const baseRequestSeqRef = useRef(0);
    const queryRequestSeqRef = useRef(0);
    const refreshedPolicyIDsRef = useRef<string | undefined>(undefined);
    const cachedBaseRef = useRef(cachedBase);

    const trimmedSearchTerm = searchTerm.trim();
    const isEmptyQuery = trimmedSearchTerm === '';
    const baseSearchKey = `${policyIDs}\0`;
    const searchKey = `${policyIDs}\0${trimmedSearchTerm}`;

    const hasLoadedBase = !!cachedBase?.hasLoadedBase;
    const hasCompleteBaseCache = hasLoadedBase && !cachedBase?.hasMore;
    const hasFailedCurrentSearch = failedSearchKey === searchKey;

    const hasLoadedCurrentSearch = isEmptyQuery ? hasLoadedBase || hasFailedCurrentSearch : hasCompleteBaseCache || queryPagination.searchKey === searchKey || hasFailedCurrentSearch;

    const isSearching = ready && !isOffline && !hasLoadedCurrentSearch;
    const hasMore = isEmptyQuery ? hasLoadedBase && !!cachedBase?.hasMore : !hasCompleteBaseCache && queryPagination.searchKey === searchKey && queryPagination.hasMore;
    const nextCursor = isEmptyQuery ? (cachedBase?.nextCursor ?? '') : queryPagination.nextCursor;
    const isLoadingMore = loadingMoreSearchKey === searchKey;

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

    const applyBaseResponse = (
        requestSeq: number,
        isFirstPage: boolean,
        {hasMore: nextHasMore, nextCursor: responseCursor, logins}: {hasMore: boolean; nextCursor: string; logins: string[]},
    ) => {
        if (requestSeq !== baseRequestSeqRef.current) {
            return;
        }

        const prev = cachedBaseRef.current;
        // Replace scoped logins only when page 1 holds the complete workspace result set so removed logins are pruned.
        const nextScopedLogins = policyIDs ? resolveScopedLogins(prev?.scopedLogins, logins, isFirstPage && !nextHasMore) : prev?.scopedLogins;

        refreshedPolicyIDsRef.current = policyIDs;
        setLoadingMoreSearchKey((current) => (current === baseSearchKey ? undefined : current));
        setFailedSearchKey((current) => (current === baseSearchKey ? undefined : current));
        updateCachedBase({
            hasLoadedBase: true,
            hasMore: nextHasMore,
            nextCursor: responseCursor,
            scopedLogins: nextScopedLogins,
        });
    };

    const applyQueryResponse = (
        requestSeq: number,
        activeSearchKey: string,
        {hasMore: nextHasMore, nextCursor: responseCursor, logins}: {hasMore: boolean; nextCursor: string; logins: string[]},
    ) => {
        if (requestSeq !== queryRequestSeqRef.current) {
            return;
        }

        if (policyIDs && logins.length > 0) {
            const prev = cachedBaseRef.current;
            const nextScopedLogins = resolveScopedLogins(prev?.scopedLogins, logins, false);
            if (nextScopedLogins !== prev?.scopedLogins) {
                updateCachedBase({
                    ...prev,
                    scopedLogins: nextScopedLogins,
                });
            }
        }

        setLoadingMoreSearchKey((current) => (current === activeSearchKey ? undefined : current));
        setFailedSearchKey((current) => (current === activeSearchKey ? undefined : current));
        setQueryPagination({searchKey: activeSearchKey, hasMore: nextHasMore, nextCursor: responseCursor});
    };

    // An empty cursor starts a new search, so it cancels superseded in-flight requests.
    const fetchUserFiltersPage = (query: string, cursor: string, requestSeq: number, isBaseQuery: boolean) => {
        const isFirstPage = cursor === '';
        const activeSearchKey = `${policyIDs}\0${query}`;
        openSearchUserFiltersPage({searchQuery: query, cursor, limit: CONST.SEARCH.USER_FILTER_PAGE_SIZE, policyIDs: policyIDs || undefined}, isFirstPage)
            .then((result) => {
                if (isBaseQuery) {
                    applyBaseResponse(requestSeq, isFirstPage, result);
                } else {
                    applyQueryResponse(requestSeq, activeSearchKey, result);
                }
            })
            .catch(() => {
                const currentSeq = isBaseQuery ? baseRequestSeqRef.current : queryRequestSeqRef.current;
                if (requestSeq !== currentSeq) {
                    return;
                }
                if (isFirstPage) {
                    // Leave Onyx untouched on failure so reopening retries, and keep cached data if a silent refresh fails.
                    if (!isBaseQuery || !cachedBaseRef.current?.hasLoadedBase) {
                        setFailedSearchKey(activeSearchKey);
                    }
                } else {
                    setLoadingMoreSearchKey((current) => (current === activeSearchKey ? undefined : current));
                }
            });
    };

    const invalidateBaseRequests = () => {
        baseRequestSeqRef.current++;
    };

    const invalidateQueryRequests = () => {
        queryRequestSeqRef.current++;
    };

    const invalidateAllRequests = () => {
        baseRequestSeqRef.current++;
        queryRequestSeqRef.current++;
    };

    useEffect(() => {
        cachedBaseRef.current = cachedBase;
    }, [cachedBase]);

    useEffect(() => invalidateAllRequests, [invalidateAllRequests]);

    // Keep silent base refresh running while local-only search filters a complete cache so new server users still land.
    const shouldRunBaseLookup = ready && !isOffline && (isEmptyQuery || hasCompleteBaseCache);

    useEffect(() => {
        if (isOffline) {
            refreshedPolicyIDsRef.current = undefined;
        }

        if (!shouldRunBaseLookup) {
            return;
        }

        if (refreshedPolicyIDsRef.current === policyIDs && cachedBaseRef.current?.hasLoadedBase) {
            return;
        }

        const requestSeq = ++baseRequestSeqRef.current;
        fetchUserFiltersPage('', '', requestSeq, true);

        return invalidateBaseRequests;
    }, [shouldRunBaseLookup, isOffline, policyIDs, fetchUserFiltersPage, invalidateBaseRequests]);

    const shouldRunQueryLookup = ready && !isOffline && !isEmptyQuery && !hasCompleteBaseCache && !hasLoadedCurrentSearch;

    useEffect(() => {
        if (!shouldRunQueryLookup) {
            return;
        }

        baseRequestSeqRef.current++;
        const requestSeq = ++queryRequestSeqRef.current;
        fetchUserFiltersPage(trimmedSearchTerm, '', requestSeq, false);

        return invalidateQueryRequests;
    }, [shouldRunQueryLookup, trimmedSearchTerm, fetchUserFiltersPage, invalidateQueryRequests]);

    const loadMoreUsers = () => {
        if (isOffline || !hasMore || isLoadingMore || isSearching) {
            return;
        }

        // Bumping the base sequence prevents an in-flight silent refresh from overwriting the next page cursor.
        const requestSeq = isEmptyQuery ? ++baseRequestSeqRef.current : ++queryRequestSeqRef.current;
        setLoadingMoreSearchKey(searchKey);

        fetchUserFiltersPage(trimmedSearchTerm, nextCursor, requestSeq, isEmptyQuery);
    };

    return {
        isSearching,
        isLoadingMore,
        hasMore,
        loadMoreUsers,
    };
}

export default useSearchUserFilters;
