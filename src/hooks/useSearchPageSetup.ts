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
    const shouldCalculateTotals = useSearchShouldCalculateTotals(currentSearchKey, hash, true);

    // Derived primitives so the effect does not depend on the whole snapshot object (new reference every
    // Onyx merge) while exhaustive-deps still sees every transition that matters for firing search().
    const isSnapshotDataLoaded = queryJSON ? isSearchDataLoaded(currentSearchResults, queryJSON) : false;
    // Keep the legacy flag only as a retry signal: handlePreventSearchAPI toggles it when temporary
    // prevention ends, while a stranded true value must not block the initial search attempt.
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

        // Only skip when the snapshot already holds resolved data for this query. Do not gate on a stored
        // loading flag: a reload/crash mid-request strands it and would block the re-fire forever. search()
        // dedupes a genuinely in-flight request through its own module-memory registry, which resets on
        // reload, so a stranded loading state re-fires and self-heals instead of pinning the skeleton.
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
