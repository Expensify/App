import {useSearchQueryContext, useSearchResultsContext, useSearchSelectionActions} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';

import {saveLastSearchParams} from '@libs/actions/ReportNavigation';
import {openSearch, search} from '@libs/actions/Search';
import {hasDeferredWrite} from '@libs/deferredLayoutWrite';
import {isSearchDataLoaded, isSearchPending} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {useFocusEffect} from '@react-navigation/native';
import {useEffect, useRef} from 'react';

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

    // Derived primitives so effects do not depend on the whole snapshot object (new reference every
    // Onyx merge) while exhaustive-deps still sees every transition that matters for firing search().
    const isSnapshotDataLoaded = queryJSON ? isSearchDataLoaded(currentSearchResults, queryJSON) : false;
    // Keep `isLoading` as a dependency so an unresolved search retries when temporary search prevention changes it to false.
    const isSnapshotSearchLoading = !!currentSearchResults?.search?.isLoading;
    const isInitialSearchPending = isSearchPending(currentSearchResults) && (currentSearchResults?.search?.offset ?? 0) === 0;

    // `errors` counts as a resolution in isSearchDataLoaded, so a snapshot left errored by a failed
    // request looks loaded and the early return below skips the request that would clear those errors.
    // The Search page then renders its error view with nothing in flight, and only the Try again
    // button can break out of it. Allow one recovery attempt per hash instead, so a transient failure
    // heals by itself while a persistent one still settles on the error view rather than looping
    // from request to failure and back to request.
    // The Set is scoped to this hook instance, which lives as long as the Search page stays mounted.
    // Changing the query only swaps route params, and an inactive tab is hidden rather than unmounted,
    // so a hash that already spent its attempt gets another one only after a real remount.
    const hashesWithAttemptedRecoveryRef = useRef<Set<number>>(new Set());
    // The server already judged the query itself malformed, so re-sending it cannot succeed.
    const isInvalidQuery = currentSearchResults?.search?.responseJsonCode === CONST.JSON_CODE.INVALID_SEARCH_QUERY;
    // Same emptiness rule as the error view this recovery exists to unblock (Search/index.tsx), so the
    // two cannot drift into a state where one shows the error and the other refuses to clear it.
    const hasRecoverableErrors = !isEmptyObject(currentSearchResults?.errors) && !isInvalidQuery;

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

        const shouldRecoverFromErrors = hasRecoverableErrors && !hashesWithAttemptedRecoveryRef.current.has(hash);

        // A pending initial request may be stale after reload and can be restarted through request deduplication.
        // Pagination must not restart page one.
        if (isSnapshotDataLoaded && !isInitialSearchPending && !shouldRecoverFromErrors) {
            return;
        }

        const shouldSkipWaitForWrites = hasDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
        const searchRequest = search({queryJSON, searchKey: currentSearchKey, offset: 0, shouldCalculateTotals, isLoading: false, skipWaitForWrites: shouldSkipWaitForWrites});

        // search() returns undefined when it declines to send (API prevention, or an identical request
        // already in flight) and writes nothing, so `errors` survives. Spending the attempt on those would
        // leave the query stuck for the rest of the mount, which is the state this recovery exists to avoid.
        if (shouldRecoverFromErrors && searchRequest) {
            hashesWithAttemptedRecoveryRef.current.add(hash);
        }
    }, [hash, isOffline, shouldUseLiveData, queryJSON, isSnapshotDataLoaded, isSnapshotSearchLoading, isInitialSearchPending, hasRecoverableErrors, currentSearchKey, shouldCalculateTotals]);

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
