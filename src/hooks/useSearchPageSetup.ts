import {useFocusEffect} from '@react-navigation/native';
import {useEffect} from 'react';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';
import {openSearch, search} from '@libs/actions/Search';
import {hasDeferredWrite} from '@libs/deferredLayoutWrite';
import {isSearchDataLoaded} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import useNetwork from './useNetwork';
import usePrevious from './usePrevious';
import useSearchShouldCalculateTotals from './useSearchShouldCalculateTotals';

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
    const {clearSelectedTransactions} = useSearchActionsContext();
    const {shouldUseLiveData, currentSearchResults, currentSearchKey} = useSearchStateContext();

    const hash = queryJSON?.hash;
    const shouldCalculateTotals = useSearchShouldCalculateTotals(currentSearchKey, hash, true);

    // Derived primitives so effects do not depend on the whole snapshot object (new reference every
    // Onyx merge) while exhaustive-deps still sees every transition that matters for firing search().
    const isSnapshotDataLoaded = queryJSON ? isSearchDataLoaded(currentSearchResults, queryJSON) : false;
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
        if (isSnapshotDataLoaded || isSnapshotSearchLoading) {
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
