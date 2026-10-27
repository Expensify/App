import {useSearchQueryContext, useSearchResultsContext, useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';

import {saveLastSearchParams} from '@libs/actions/ReportNavigation';
import {clearPageRequestedSearch, markPageRequestedSearch, openSearch, search} from '@libs/actions/Search';
import {hasPendingSearchWrite} from '@libs/pendingSearchWrite';
import {isSearchDataLoaded, isSearchPending} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useEffect, useRef} from 'react';

import useIsInPreloadedTab from './useIsInPreloadedTab';
import useNetwork from './useNetwork';
import usePrevious from './usePrevious';
import useSearchShouldCalculateTotals from './useSearchShouldCalculateTotals';

// Gates the save below to real hash changes so snapshot-loading re-fires don't wipe fields
// (hasMoreResults, previousLengthOfResults) maintained by report-browsing callers.
let lastSavedSearchHash: number | undefined;

// A response that lands while the user is away can be old by the time they return, so the mount must refresh then.
function dropPageRequestOnBlur() {
    return clearPageRequestedSearch;
}

/**
 * Handles page-level setup for Search that must happen before the Search component mounts:
 * - Clears selected transactions when the query changes
 * - Fires the search() API call so data starts loading alongside the skeleton
 * - Fires openSearch() to load bank account data, clearing a stale failure left on the snapshot
 * - Re-fires openSearch() when coming back online
 */
function useSearchPageSetup(queryJSON: Readonly<SearchQueryJSON> | undefined) {
    const {isOffline} = useNetwork();
    const prevIsOffline = usePrevious(isOffline);
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {shouldUseLiveData, currentSearchResults} = useSearchResultsContext();
    const {currentSearchKey} = useSearchQueryContext();
    const {areAllMatchingItemsSelected} = useSearchSelectionContext();
    const isInPreloadedTab = useIsInPreloadedTab();
    // Set while the tab is preloaded and kept until its first-open request goes out, which can take more than one render.
    const isFirstOpenOfPreloadedTabRef = useRef(false);

    const hash = queryJSON?.hash;
    // Without this, a plain page-level fetch during active select-all clears totals on arrival
    // (shouldClearTotals in getOnyxLoadingData), wiping a total the Search-internal effect already fetched.
    const shouldCalculateTotals = useSearchShouldCalculateTotals(currentSearchKey, true, areAllMatchingItemsSelected);

    // Derived primitives so effects do not depend on the whole snapshot object (new reference every
    // Onyx merge) while exhaustive-deps still sees every transition that matters for firing search().
    const isSnapshotDataLoaded = queryJSON ? isSearchDataLoaded(currentSearchResults, queryJSON) : false;
    // Keep `isLoading` as a dependency so an unresolved search retries when temporary search prevention changes it to false.
    const isSnapshotSearchLoading = !!currentSearchResults?.search?.isLoading;
    const isInitialSearchPending = isSearchPending(currentSearchResults) && (currentSearchResults?.search?.offset ?? 0) === 0;

    // During a query change the snapshot can still be the previous query's, like isSearchDataLoaded guards against.
    const isSnapshotForCurrentQuery = currentSearchResults?.search?.hash === hash;

    // The server already judged the query itself malformed, so re-sending it cannot succeed.
    const isInvalidQuery = currentSearchResults?.search?.responseJsonCode === CONST.JSON_CODE.INVALID_SEARCH_QUERY;

    // Offline is out because the request that would reload the data cannot run there.
    const hasErrorToClear = isSnapshotForCurrentQuery && !isEmptyObject(currentSearchResults?.errors) && !isInvalidQuery && !isOffline;

    // Hashes this page requested, so an error can be traced to the attempt that produced it.
    const requestedHashesRef = useRef<Set<number>>(new Set());

    // Clear selected transactions when navigating to a different search query
    function clearOnHashChange() {
        if (hash === undefined) {
            return;
        }
        clearSelectedTransactions(hash);
    }

    useFocusEffect(clearOnHashChange);

    // useEffect supplements useFocusEffect: it handles both the initial mount
    // and cases where route params change without a navigation event (e.g. sorting).
    useEffect(clearOnHashChange, [hash, clearSelectedTransactions]);

    useEffect(() => {
        if (!isInPreloadedTab) {
            return;
        }
        isFirstOpenOfPreloadedTabRef.current = true;
    }, [isInPreloadedTab]);

    // Fire search() when the query changes (hash). This runs at the page level so the
    // API request starts in parallel with the skeleton, before Search mounts its 14+ useOnyx hooks.
    useEffect(() => {
        // A preloaded tab builds from cached results only. The request, saved params and recent search wait until it is opened.
        if (!queryJSON || hash === undefined || isOffline || isInPreloadedTab) {
            return;
        }

        const isFirstOpenOfPreloadedTab = isFirstOpenOfPreloadedTabRef.current;

        if (shouldUseLiveData) {
            // Search requests live (to-do) results on mount, which a hidden preloaded tab skips, so its first open requests them here.
            if (isFirstOpenOfPreloadedTab) {
                isFirstOpenOfPreloadedTabRef.current = false;
                search({queryJSON, searchKey: currentSearchKey, offset: 0, shouldCalculateTotals, isLoading: false});
            }
            return;
        }

        // Must run even on cached snapshots, else SearchTabButton's Onyx fallback restores
        // a stale query after a tab switch (e.g. filter reappears after Reset).
        if (lastSavedSearchHash !== hash) {
            saveLastSearchParams({queryJSON, offset: 0, searchKey: currentSearchKey, hasMoreResults: false, allowPostSearchRecount: false});
            lastSavedSearchHash = hash;
        }

        // A pending initial request may be stale after reload and can be restarted through request deduplication.
        // Pagination must not restart page one.
        // First open of a preloaded tab refreshes its cached results and saves the recent search, with no loading state over them.
        if (isSnapshotDataLoaded && !isInitialSearchPending && !isFirstOpenOfPreloadedTab) {
            return;
        }

        isFirstOpenOfPreloadedTabRef.current = false;

        const shouldSkipWaitForWrites = hasPendingSearchWrite();
        requestedHashesRef.current.add(hash);
        // Claim this query's first page so Search does not request it again when it mounts behind the skeleton.
        // With data loaded Search is already mounted, so a token set here would never be read and would skip the next revisit.
        if (!isSnapshotDataLoaded) {
            markPageRequestedSearch(hash, shouldCalculateTotals);
        }
        search({
            queryJSON,
            searchKey: currentSearchKey,
            offset: 0,
            shouldCalculateTotals,
            isLoading: false,
            skipWaitForWrites: shouldSkipWaitForWrites,
            shouldSaveRecentSearch: true,
            shouldShowLoading: !(isFirstOpenOfPreloadedTab && isSnapshotDataLoaded),
        });
    }, [hash, isOffline, shouldUseLiveData, queryJSON, isSnapshotDataLoaded, isSnapshotSearchLoading, isInitialSearchPending, currentSearchKey, shouldCalculateTotals, isInPreloadedTab]);

    useFocusEffect(dropPageRequestOnBlur);

    // Stable callback: useFocusEffect re-subscribes on a new identity and would fire an extra request.
    useFocusEffect(
        useCallback(() => {
            openSearch();
        }, []),
    );

    // Drop an error this page inherited rather than produced, so the effect above can request the query again.
    useEffect(() => {
        if (!hasErrorToClear || hash === undefined || requestedHashesRef.current.has(hash)) {
            return;
        }
        requestedHashesRef.current.add(hash);
        openSearch(undefined, hash);
    }, [hasErrorToClear, hash]);

    useEffect(() => {
        if (!prevIsOffline || isOffline) {
            return;
        }
        openSearch();
    }, [isOffline, prevIsOffline]);
}

export default useSearchPageSetup;
