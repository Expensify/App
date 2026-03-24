import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useEffect} from 'react';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';
import {openSearch, search} from '@libs/actions/Search';
import {isSearchDataLoaded} from '@libs/SearchUIUtils';
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
function useSearchPageSetup(queryJSON: SearchQueryJSON | undefined) {
    const {isOffline} = useNetwork();
    const prevIsOffline = usePrevious(isOffline);
    const {clearSelectedTransactions} = useSearchActionsContext();
    const {shouldUseLiveData, currentSearchResults, currentSearchKey} = useSearchStateContext();

    const hash = queryJSON?.hash;
    const shouldCalculateTotals = useSearchShouldCalculateTotals(currentSearchKey, hash, true);

    // Clear selected transactions when navigating to a different search query
    const clearOnHashChange = useCallback(() => {
        if (hash === undefined) {
            return;
        }
        clearSelectedTransactions(hash);
    }, [hash, clearSelectedTransactions]);

    useFocusEffect(clearOnHashChange);

    // useEffect supplements useFocusEffect: it handles both the initial mount
    // and cases where route params change without a navigation event (e.g. sorting).
    useEffect(clearOnHashChange, [clearOnHashChange]);

    // Fire search() when the query changes (hash). This runs at the page level so the
    // API request starts in parallel with the skeleton, before Search mounts its 14+ useOnyx hooks.
    // currentSearchResults is intentionally read but not in deps — search should fire once per
    // query change, not re-trigger on every data update from Onyx.
    useEffect(() => {
        if (!queryJSON || hash === undefined || shouldUseLiveData || isOffline) {
            return;
        }
        if (isSearchDataLoaded(currentSearchResults, queryJSON) || currentSearchResults?.search?.isLoading) {
            return;
        }
        search({queryJSON, searchKey: currentSearchKey, offset: 0, shouldCalculateTotals, isLoading: false});
    }, [hash, isOffline, shouldUseLiveData, queryJSON]);

    useEffect(() => {
        openSearch({includePartiallySetupBankAccounts: true});
    }, []);

    useEffect(() => {
        if (!prevIsOffline || isOffline) {
            return;
        }
        openSearch({includePartiallySetupBankAccounts: true});
    }, [isOffline, prevIsOffline]);
}

export default useSearchPageSetup;
