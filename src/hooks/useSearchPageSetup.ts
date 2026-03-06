import {useCallback, useEffect} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';
import {openSearch, search} from '@libs/actions/Search';
import {getSuggestedSearches, isSearchDataLoaded} from '@libs/SearchUIUtils';
import useCardFeedsForDisplay from './useCardFeedsForDisplay';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useNetwork from './useNetwork';
import usePrevious from './usePrevious';

/**
 * Handles page-level setup for Search that must happen before the Search component mounts:
 * - Sets the context hash/key so the Onyx subscription points to the correct snapshot
 * - Fires the search() API call so data starts loading alongside the skeleton
 * - Fires openSearch() to load bank account data
 * - Re-fires openSearch() when coming back online
 */
function useSearchPageSetup(queryJSON: SearchQueryJSON | undefined) {
    const {isOffline} = useNetwork();
    const prevIsOffline = usePrevious(isOffline);
    const {setCurrentSearchHashAndKey, setCurrentSearchQueryJSON, clearSelectedTransactions} = useSearchActionsContext();
    const {shouldUseLiveData, currentSearchResults} = useSearchStateContext();
    const {accountID} = useCurrentUserPersonalDetails();
    const {defaultCardFeed} = useCardFeedsForDisplay();

    const suggestedSearches = getSuggestedSearches(accountID, defaultCardFeed?.id);
    const hash = queryJSON?.hash;
    const recentSearchHash = queryJSON?.recentSearchHash;
    const searchKey = recentSearchHash !== undefined ? Object.values(suggestedSearches).find((s) => s.recentSearchHash === recentSearchHash)?.key : undefined;

    // useCallback is required here because useFocusEffect (React Navigation external API) compares callback references.
    // React Compiler cannot optimize this — it doesn't know useFocusEffect's internal semantics.
    const syncContextWithRoute = useCallback(() => {
        if (hash === undefined || recentSearchHash === undefined || !queryJSON) {
            return;
        }
        clearSelectedTransactions(hash);
        setCurrentSearchHashAndKey(hash, recentSearchHash, searchKey);
        setCurrentSearchQueryJSON(queryJSON);
    }, [hash, recentSearchHash, searchKey, queryJSON, clearSelectedTransactions, setCurrentSearchHashAndKey, setCurrentSearchQueryJSON]);

    useFocusEffect(syncContextWithRoute);

    useEffect(syncContextWithRoute, [syncContextWithRoute]);

    useEffect(() => {
        if (!queryJSON || hash === undefined || shouldUseLiveData || isOffline) {
            return;
        }
        if (isSearchDataLoaded(currentSearchResults, queryJSON) || currentSearchResults?.search?.isLoading) {
            return;
        }
        search({queryJSON, searchKey, offset: 0, shouldCalculateTotals: false, isLoading: false});
    }, [hash, searchKey, isOffline, shouldUseLiveData, currentSearchResults, queryJSON]);

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
