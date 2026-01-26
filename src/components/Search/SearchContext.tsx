import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
// We need direct access to useOnyx from react-native-onyx to avoid circular dependencies in SearchContext
// eslint-disable-next-line no-restricted-imports
import {useOnyx} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useTodos from '@hooks/useTodos';
import {isMoneyRequestReport} from '@libs/ReportUtils';
import {getSuggestedSearches, isTodoSearch, isTransactionListItemType, isTransactionReportGroupListItemType} from '@libs/SearchUIUtils';
import type {SearchKey} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';
import type {SearchResultsInfo} from '@src/types/onyx/SearchResults';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {SearchContextData, SearchContextProps, SearchQueryJSON, SelectedTransactions} from './types';

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
    selectedTransactions: {},
    selectedTransactionIDs: [],
    selectedReports: [],
    isOnSearch: false,
    shouldTurnOffSelectionMode: false,
    shouldResetSearchQuery: false,
};

const defaultSearchContext: SearchContextProps = {
    ...defaultSearchContextData,
    lastSearchType: undefined,
    areAllMatchingItemsSelected: false,
    showSelectAllMatchingItems: false,
    shouldShowFiltersBarLoading: false,
    currentSearchResults: undefined,
    shouldUseLiveData: false,
    setLastSearchType: () => {},
    setCurrentSearchHashAndKey: () => {},
    setCurrentSearchQueryJSON: () => {},
    setSelectedTransactions: () => {},
    removeTransaction: () => {},
    clearSelectedTransactions: () => {},
    setShouldShowFiltersBarLoading: () => {},
    shouldShowSelectAllMatchingItems: () => {},
    selectAllMatchingItems: () => {},
    setShouldResetSearchQuery: () => {},
};

const SearchContext = React.createContext<SearchContextProps>(defaultSearchContext);

function SearchContextProvider({children}: ChildrenProps) {
    const [showSelectAllMatchingItems, shouldShowSelectAllMatchingItems] = useState(false);
    const [areAllMatchingItemsSelected, selectAllMatchingItems] = useState(false);
    const [shouldShowFiltersBarLoading, setShouldShowFiltersBarLoading] = useState(false);
    const [lastSearchType, setLastSearchType] = useState<string | undefined>(undefined);
    const [searchContextData, setSearchContextData] = useState(defaultSearchContextData);
    const areTransactionsEmpty = useRef(true);

    // Use a ref to access searchContextData in callbacks without causing callback reference changes
    const searchContextDataRef = useRef(searchContextData);
    searchContextDataRef.current = searchContextData;

    const [snapshotSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${searchContextData.currentSearchHash}`, {canBeMissing: true});
    const {todoSearchResultsData} = useTodos();

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

    const setSelectedTransactions: SearchContextProps['setSelectedTransactions'] = useCallback((selectedTransactions, data = []) => {
        if (selectedTransactions instanceof Array) {
            if (!selectedTransactions.length && areTransactionsEmpty.current) {
                areTransactionsEmpty.current = true;
                return;
            }
            areTransactionsEmpty.current = false;
            return setSearchContextData((prevState) => ({
                ...prevState,
                selectedTransactionIDs: selectedTransactions,
            }));
        }

        // When selecting transactions, we also need to manage the reports to which these transactions belong. This is done to ensure proper exporting to CSV.
        let selectedReports: SearchContextProps['selectedReports'] = [];

        if (data.length && data.every(isTransactionReportGroupListItemType)) {
            selectedReports = data
                .filter((item) => {
                    if (!isMoneyRequestReport(item)) {
                        return false;
                    }
                    if (item.transactions.length === 0) {
                        return !!item.keyForList && selectedTransactions[item.keyForList]?.isSelected;
                    }
                    return item.transactions.every(({keyForList}) => selectedTransactions[keyForList]?.isSelected);
                })
                .map(({reportID, action = CONST.SEARCH.ACTION_TYPES.VIEW, total = CONST.DEFAULT_NUMBER_ID, policyID, allActions = [action], currency, chatReportID}) => ({
                    reportID,
                    action,
                    total,
                    policyID,
                    allActions,
                    currency,
                    chatReportID,
                }));
        } else if (data.length && data.every(isTransactionListItemType)) {
            selectedReports = data
                .filter(({keyForList}) => !!keyForList && selectedTransactions[keyForList]?.isSelected)
                .map(({reportID, action = CONST.SEARCH.ACTION_TYPES.VIEW, amount: total = CONST.DEFAULT_NUMBER_ID, policyID, allActions = [action], currency, report}) => ({
                    reportID,
                    action,
                    total,
                    policyID,
                    allActions,
                    currency,
                    chatReportID: report?.chatReportID,
                }));
        }

        setSearchContextData((prevState) => ({
            ...prevState,
            selectedTransactions,
            shouldTurnOffSelectionMode: false,
            selectedReports,
        }));
    }, []);

    const clearSelectedTransactions: SearchContextProps['clearSelectedTransactions'] = useCallback(
        (searchHashOrClearIDsFlag, shouldTurnOffSelectionMode = false) => {
            if (typeof searchHashOrClearIDsFlag === 'boolean') {
                setSelectedTransactions([]);
                return;
            }

            const data = searchContextDataRef.current;

            if (searchHashOrClearIDsFlag === data.currentSearchHash) {
                return;
            }

            if (data.selectedReports.length === 0 && isEmptyObject(data.selectedTransactions) && !data.shouldTurnOffSelectionMode) {
                return;
            }
            setSearchContextData((prevState) => ({
                ...prevState,
                shouldTurnOffSelectionMode,
                selectedTransactions: {},
                selectedReports: [],
            }));

            // Unselect all transactions and hide the "select all matching items" option
            shouldShowSelectAllMatchingItems(false);
            selectAllMatchingItems(false);
        },
        [setSelectedTransactions],
    );

    const removeTransaction: SearchContextProps['removeTransaction'] = useCallback(
        (transactionID) => {
            if (!transactionID) {
                return;
            }
            const selectedTransactionIDs = searchContextData.selectedTransactionIDs;

            if (!isEmptyObject(searchContextData.selectedTransactions)) {
                const newSelectedTransactions = Object.entries(searchContextData.selectedTransactions).reduce((acc, [key, value]) => {
                    if (key === transactionID) {
                        return acc;
                    }
                    acc[key] = value;
                    return acc;
                }, {} as SelectedTransactions);

                setSearchContextData((prevState) => ({
                    ...prevState,
                    selectedTransactions: newSelectedTransactions,
                }));
            }

            if (selectedTransactionIDs.length > 0) {
                setSearchContextData((prevState) => ({
                    ...prevState,
                    selectedTransactionIDs: selectedTransactionIDs.filter((ID) => transactionID !== ID),
                }));
            }
        },
        [searchContextData.selectedTransactionIDs, searchContextData.selectedTransactions],
    );

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
            removeTransaction,
            setCurrentSearchHashAndKey,
            setCurrentSearchQueryJSON,
            setSelectedTransactions,
            clearSelectedTransactions,
            shouldShowFiltersBarLoading,
            setShouldShowFiltersBarLoading,
            lastSearchType,
            setLastSearchType,
            showSelectAllMatchingItems,
            shouldShowSelectAllMatchingItems,
            areAllMatchingItemsSelected,
            selectAllMatchingItems,
            setShouldResetSearchQuery,
        }),
        [
            searchContextData,
            currentSearchResults,
            shouldUseLiveData,
            removeTransaction,
            setCurrentSearchHashAndKey,
            setCurrentSearchQueryJSON,
            setSelectedTransactions,
            clearSelectedTransactions,
            shouldShowFiltersBarLoading,
            lastSearchType,
            shouldShowSelectAllMatchingItems,
            showSelectAllMatchingItems,
            areAllMatchingItemsSelected,
            setShouldResetSearchQuery,
        ],
    );

    return <SearchContext.Provider value={searchContext}>{children}</SearchContext.Provider>;
}

/**
 * Note: `selectedTransactionIDs` and `selectedTransactions` are two separate properties.
 * Setting or clearing one of them does not influence the other.
 * IDs should be used if transaction details are not required.
 */
function useSearchContext() {
    return useContext(SearchContext);
}

export {SearchContextProvider, useSearchContext, SearchContext};
