import {useSearchQueryContext, useSearchResultsContext, useSearchSelectionActions} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';

import {saveLastSearchParams} from '@libs/actions/ReportNavigation';
import {openSearch, search} from '@libs/actions/Search';
import {hasDeferredWrite} from '@libs/deferredLayoutWrite';
import {isSearchDataLoaded} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

import {useFocusEffect} from '@react-navigation/native';
import {useEffect} from 'react';

import useNetwork from './useNetwork';
import usePrevious from './usePrevious';
import useSearchShouldCalculateTotals from './useSearchShouldCalculateTotals';

// Gates the save below to real hash changes so snapshot-loading re-fires don't wipe fields
// (hasMoreResults, previousLengthOfResults) maintained by report-browsing callers.
let lastSavedSearchHash: number | undefined;

/**
 * Handles page-level setup for Search that must happen before the Search component mounts:
 * - Clears selected transactions when the query changes
 * - Fires the search() API call so data starts loading alongside the skeleton
 * - Fires openSearch() to load bank account data
 * - Re-fires openSearch() when coming back online
 */
function useSearchPageSetup(queryJSON: Readonly<SearchQueryJSON> | undefined) {
    const {isOffline} = useNetwork();
    const prevIsOffline = usePrevious(isOffline);
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {shouldUseLiveData, currentSearchResults} = useSearchResultsContext();
    const {currentSearchKey} = useSearchQueryContext();

    const hash = queryJSON?.hash;
    const shouldCalculateTotals = useSearchShouldCalculateTotals(currentSearchKey, true);

    // Depend on the values that can trigger a search instead of the whole snapshot, which gets a new reference after every Onyx merge.
    const isSnapshotDataLoaded = queryJSON ? isSearchDataLoaded(currentSearchResults, queryJSON) : false;
    // Keep `isLoading` as a dependency so an unresolved search retries when temporary search prevention changes it to false.
    const isSnapshotSearchLoading = !!currentSearchResults?.search?.isLoading;

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

    // Fire search() when the query changes (hash). This runs at the page level so the
    // API request starts in parallel with the skeleton, before Search mounts its 14+ useOnyx hooks.
    useEffect(() => {
        if (!queryJSON || hash === undefined || shouldUseLiveData || isOffline) {
            return;
        }

        // Must run even on cached snapshots, else SearchTabButton's Onyx fallback restores
        // a stale query after a tab switch (e.g. filter reappears after Reset).
        if (lastSavedSearchHash !== hash) {
            saveLastSearchParams({queryJSON, offset: 0, searchKey: currentSearchKey, hasMoreResults: false, allowPostSearchRecount: false});
            lastSavedSearchHash = hash;
        }

        // A persisted `isLoading` value may be stale after a reload. Only skip resolved snapshots and let `search()` ignore requests that are already running.
        if (isSnapshotDataLoaded) {
            return;
        }
        const shouldSkipWaitForWrites = hasDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
        search({queryJSON, searchKey: currentSearchKey, offset: 0, shouldCalculateTotals, isLoading: false, skipWaitForWrites: shouldSkipWaitForWrites});
    }, [hash, isOffline, shouldUseLiveData, queryJSON, isSnapshotDataLoaded, isSnapshotSearchLoading, currentSearchKey, shouldCalculateTotals]);

    useFocusEffect(() => {
        openSearch();
    });

    useEffect(() => {
        if (!prevIsOffline || isOffline) {
            return;
        }
        openSearch();
    }, [isOffline, prevIsOffline]);
}

export default useSearchPageSetup;
