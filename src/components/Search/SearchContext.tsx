import React, {useContext, useLayoutEffect, useRef, useState} from 'react';
// We need direct access to useOnyx from react-native-onyx to avoid circular dependencies in SearchContext
// eslint-disable-next-line no-restricted-imports
import {useOnyx} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useTodos from '@hooks/useTodos';
import {isMoneyRequestReport} from '@libs/ReportUtils';
import {getSuggestedSearches, isTodoSearch, isTransactionListItemType, isTransactionReportGroupListItemType} from '@libs/SearchUIUtils';
import type {SearchKey} from '@libs/SearchUIUtils';
import {hasValidModifiedAmount} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';
import type {SearchResultsInfo} from '@src/types/onyx/SearchResults';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {SearchActionsContextValue, SearchContextData, SearchQueryJSON, SearchStateContextValue, SelectedTransactions} from './types';

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
    currentRecentSearchHash: -1,
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

const defaultSearchStateContext: SearchStateContextValue = {
    ...defaultSearchContextData,
    lastSearchType: undefined,
    areAllMatchingItemsSelected: false,
    shouldShowSelectAllMatchingItems: false,
    shouldShowFiltersBarLoading: false,
    currentSearchResults: undefined,
    shouldUseLiveData: false,
};

const defaultSearchActionsContext: SearchActionsContextValue = {
    setLastSearchType: () => {},
    setCurrentSearchHashAndKey: () => {},
    setCurrentSearchQueryJSON: () => {},
    setSelectedTransactions: () => {},
    removeTransaction: () => {},
    clearSelectedTransactions: () => {},
    setShouldShowFiltersBarLoading: () => {},
    setShouldShowSelectAllMatchingItems: () => {},
    selectAllMatchingItems: () => {},
    setShouldResetSearchQuery: () => {},
};

const SearchStateContext = React.createContext<SearchStateContextValue>(defaultSearchStateContext);
const SearchActionsContext = React.createContext<SearchActionsContextValue>(defaultSearchActionsContext);

function SearchContextProvider({children}: ChildrenProps) {
    const [shouldShowSelectAllMatchingItems, setShouldShowSelectAllMatchingItems] = useState(false);
    const [areAllMatchingItemsSelected, selectAllMatchingItems] = useState(false);
    const [shouldShowFiltersBarLoading, setShouldShowFiltersBarLoading] = useState(false);
    const [lastSearchType, setLastSearchType] = useState<string | undefined>(undefined);
    const [searchContextData, setSearchContextData] = useState(defaultSearchContextData);
    const areTransactionsEmpty = useRef(true);

    // Use a ref to access searchContextData in callbacks without causing callback reference changes
    const searchContextDataRef = useRef(searchContextData);

    useLayoutEffect(() => {
        searchContextDataRef.current = searchContextData;
    }, [searchContextData]);

    const [snapshotSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${searchContextData.currentSearchHash}`);
    const todoSearchResultsData = useTodos();
    const currentSearchKey = searchContextData.currentSearchKey;
    const currentRecentSearchHash = searchContextData.currentRecentSearchHash;
    const {accountID} = useCurrentUserPersonalDetails();
    const suggestedSearches = getSuggestedSearches(accountID);
    const shouldUseLiveData = !!currentSearchKey && isTodoSearch(currentRecentSearchHash, suggestedSearches);

    // If viewing a to-do search, use live data from useTodos, otherwise return the snapshot data
    // We do this so that we can show the counters for the to-do search results without visiting the specific to-do page, e.g. show `Approve [3]` while viewing the `Submit` to-do search.
    function getCurrentSearchResults(): SearchResults | undefined {
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
    }

    const currentSearchResults = getCurrentSearchResults();

    const setCurrentSearchHashAndKey = (searchHash: number, recentHash: number, searchKey: SearchKey | undefined) => {
        setSearchContextData((prevState) => {
            if (searchHash === prevState.currentSearchHash && recentHash === prevState.currentRecentSearchHash && searchKey === prevState.currentSearchKey) {
                return prevState;
            }

            return {
                ...prevState,
                currentSearchHash: searchHash,
                currentRecentSearchHash: recentHash,
                currentSearchKey: searchKey,
            };
        });
    };

    const setCurrentSearchQueryJSON = (searchQueryJSON: SearchQueryJSON | undefined) => {
        setSearchContextData((prevState) => {
            if (searchQueryJSON === prevState.currentSearchQueryJSON) {
                return prevState;
            }

            return {
                ...prevState,
                currentSearchQueryJSON: searchQueryJSON,
            };
        });
    };

    const setSelectedTransactions: SearchActionsContextValue['setSelectedTransactions'] = (selectedTransactions, data = []) => {
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
        let selectedReports: SearchStateContextValue['selectedReports'] = [];

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
                .map((item) => {
                    const total = hasValidModifiedAmount(item) ? Number(item.modifiedAmount) : (item.amount ?? CONST.DEFAULT_NUMBER_ID);
                    const action = item.action ?? CONST.SEARCH.ACTION_TYPES.VIEW;

                    return {
                        reportID: item.reportID,
                        action,
                        total,
                        policyID: item.policyID,
                        allActions: item.allActions ?? [action],
                        currency: item.currency,
                        chatReportID: item.report?.chatReportID,
                    };
                });
        }

        setSearchContextData((prevState) => ({
            ...prevState,
            selectedTransactions,
            shouldTurnOffSelectionMode: false,
            selectedReports,
        }));
    };

    const clearSelectedTransactions: SearchActionsContextValue['clearSelectedTransactions'] = (searchHashOrClearIDsFlag, shouldTurnOffSelectionMode = false) => {
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
        setShouldShowSelectAllMatchingItems(false);
        selectAllMatchingItems(false);
    };

    const {selectedTransactionIDs, selectedTransactions} = searchContextData;

    const removeTransaction: SearchActionsContextValue['removeTransaction'] = (transactionID) => {
        if (!transactionID) {
            return;
        }

        if (!isEmptyObject(selectedTransactions)) {
            const newSelectedTransactions = Object.entries(selectedTransactions).reduce((acc, [key, value]) => {
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
    };

    const setShouldResetSearchQuery = (shouldReset: boolean) => {
        setSearchContextData((prevState) => ({
            ...prevState,
            shouldResetSearchQuery: shouldReset,
        }));
    };

    const searchStateContextValue: SearchStateContextValue = {
        ...searchContextData,
        currentSearchResults,
        shouldUseLiveData,
        shouldShowFiltersBarLoading,
        lastSearchType,
        shouldShowSelectAllMatchingItems,
        areAllMatchingItemsSelected,
    };

    const searchActionsContextValue: SearchActionsContextValue = {
        removeTransaction,
        setCurrentSearchHashAndKey,
        setCurrentSearchQueryJSON,
        setSelectedTransactions,
        clearSelectedTransactions,
        setShouldShowFiltersBarLoading,
        setLastSearchType,
        setShouldShowSelectAllMatchingItems,
        selectAllMatchingItems,
        setShouldResetSearchQuery,
    };

    return (
        <SearchStateContext value={searchStateContextValue}>
            <SearchActionsContext value={searchActionsContextValue}>{children}</SearchActionsContext>
        </SearchStateContext>
    );
}

/**
 * Note: `selectedTransactionIDs` and `selectedTransactions` are two separate properties.
 * Setting or clearing one of them does not influence the other.
 * IDs should be used if transaction details are not required.
 */
function useSearchStateContext() {
    return useContext(SearchStateContext);
}

function useSearchActionsContext() {
    return useContext(SearchActionsContext);
}

export {SearchContextProvider, useSearchStateContext, useSearchActionsContext, SearchStateContext, SearchActionsContext};
