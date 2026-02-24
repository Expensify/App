import React, {useCallback, useContext, useMemo, useState} from 'react';
// We need direct access to useOnyx from react-native-onyx to avoid circular dependencies in SearchContext
// eslint-disable-next-line no-restricted-imports
import {useOnyx} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useTodos from '@hooks/useTodos';
import {getSuggestedSearches, isTodoSearch} from '@libs/SearchUIUtils';
import type {SearchKey} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';
import type {SearchResultsInfo} from '@src/types/onyx/SearchResults';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {SearchContextData, SearchContextProps, SearchQueryJSON} from './types';

// Default search info when building from live data
// Used for to-do searches where we build SearchResults from live Onyx data instead of API snapshots
const defaultSearchInfo: SearchResultsInfo = {
    offset: 0,
    type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
    status: CONST.SEARCH.STATUS.EXPENSE.ALL,
    hasMoreResults: false,
    hasResults: true,
    isLoading: false,
    count: 0,
    total: 0,
    currency: '',
};

const defaultSearchContextData: SearchContextData = {
    currentSearchHash: -1,
    currentSearchKey: undefined,
    currentSearchQueryJSON: undefined,
    currentSearchResults: undefined,
    isOnSearch: false,
    shouldResetSearchQuery: false,
};

const defaultSearchContext: SearchContextProps = {
    ...defaultSearchContextData,
    lastSearchType: undefined,
    shouldShowFiltersBarLoading: false,
    currentSearchResults: undefined,
    shouldUseLiveData: false,
    setLastSearchType: () => {},
    setCurrentSearchHashAndKey: () => {},
    setCurrentSearchQueryJSON: () => {},
    setShouldShowFiltersBarLoading: () => {},
    setShouldResetSearchQuery: () => {},
};

const SearchContext = React.createContext<SearchContextProps>(defaultSearchContext);

function SearchContextProvider({children}: ChildrenProps) {
    const [shouldShowFiltersBarLoading, setShouldShowFiltersBarLoading] = useState(false);
    const [lastSearchType, setLastSearchType] = useState<string | undefined>(undefined);
    const [searchContextData, setSearchContextData] = useState(defaultSearchContextData);

    const [snapshotSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${searchContextData.currentSearchHash}`);
    const todoSearchResultsData = useTodos();

    const currentSearchKey = searchContextData.currentSearchKey;
    const currentSearchHash = searchContextData.currentSearchHash;
    const {accountID} = useCurrentUserPersonalDetails();
    const suggestedSearches = useMemo(() => getSuggestedSearches(accountID), [accountID]);
    const shouldUseLiveData = !!currentSearchKey && isTodoSearch(currentSearchHash, suggestedSearches);

    // If viewing a to-do search, use live data from useTodos, otherwise return the snapshot data
    // We do this so that we can show the counters for the to-do search results without visiting the specific to-do page, e.g. show `Approve [3]` while viewing the `Submit` to-do search.
    const currentSearchResults = useMemo((): SearchResults | undefined => {
        if (shouldUseLiveData) {
            const liveData = todoSearchResultsData[currentSearchKey as keyof typeof todoSearchResultsData];
            const searchInfo: SearchResultsInfo = {
                ...(snapshotSearchResults?.search ?? defaultSearchInfo),
                count: liveData.metadata.count,
                total: liveData.metadata.total,
                currency: liveData.metadata.currency,
            };
            const hasResults = Object.keys(liveData.data).length > 0;
            // For to-do searches, always return a valid SearchResults object (even with empty data)
            // This ensures we show the empty state instead of loading/blocking views
            return {
                search: {...searchInfo, isLoading: false, hasResults},
                data: liveData.data,
            };
        }

        return snapshotSearchResults ?? undefined;
    }, [shouldUseLiveData, currentSearchKey, todoSearchResultsData, snapshotSearchResults]);

    const setCurrentSearchHashAndKey = useCallback((searchHash: number, searchKey: SearchKey | undefined) => {
        setSearchContextData((prevState) => {
            if (searchHash === prevState.currentSearchHash && searchKey === prevState.currentSearchKey) {
                return prevState;
            }

            return {
                ...prevState,
                currentSearchHash: searchHash,
                currentSearchKey: searchKey,
            };
        });
    }, []);

    const setCurrentSearchQueryJSON = useCallback((searchQueryJSON: SearchQueryJSON | undefined) => {
        setSearchContextData((prevState) => {
            if (searchQueryJSON === prevState.currentSearchQueryJSON) {
                return prevState;
            }

            return {
                ...prevState,
                currentSearchQueryJSON: searchQueryJSON,
            };
        });
    }, []);

    const setShouldResetSearchQuery = useCallback((shouldReset: boolean) => {
        setSearchContextData((prevState) => ({
            ...prevState,
            shouldResetSearchQuery: shouldReset,
        }));
    }, []);

    const searchContext = useMemo<SearchContextProps>(
        () => ({
            ...searchContextData,
            currentSearchResults,
            shouldUseLiveData,
            setCurrentSearchHashAndKey,
            setCurrentSearchQueryJSON,
            shouldShowFiltersBarLoading,
            setShouldShowFiltersBarLoading,
            lastSearchType,
            setLastSearchType,
            setShouldResetSearchQuery,
        }),
        [
            searchContextData,
            currentSearchResults,
            shouldUseLiveData,
            setCurrentSearchHashAndKey,
            setCurrentSearchQueryJSON,
            shouldShowFiltersBarLoading,
            lastSearchType,
            setShouldResetSearchQuery,
        ],
    );

    return <SearchContext.Provider value={searchContext}>{children}</SearchContext.Provider>;
}

function useSearchContext() {
    return useContext(SearchContext);
}

export {SearchContextProvider, useSearchContext, SearchContext};
