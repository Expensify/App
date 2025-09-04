import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
import {isMoneyRequestReport} from '@libs/ReportUtils';
import {isTransactionListItemType, isTransactionReportGroupListItemType} from '@libs/SearchUIUtils';
import type {SearchKey} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {SearchContext, SearchContextData, SearchQueryJSON, SelectedTransactions} from './types';

const defaultSearchContextData: SearchContextData = {
    currentSearchHash: -1,
    currentSearchKey: undefined,
    currentSearchQueryJSON: undefined,
    selectedTransactions: {},
    selectedTransactionIDs: [],
    selectedReports: [],
    isOnSearch: false,
    shouldTurnOffSelectionMode: false,
    shouldResetSearchQuery: false,
};

const defaultSearchContext: SearchContext = {
    ...defaultSearchContextData,
    lastSearchType: undefined,
    areAllMatchingItemsSelected: false,
    showSelectAllMatchingItems: false,
    shouldShowFiltersBarLoading: false,
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

const Context = React.createContext<SearchContext>(defaultSearchContext);

function SearchContextProvider({children}: ChildrenProps) {
    const [showSelectAllMatchingItems, shouldShowSelectAllMatchingItems] = useState(false);
    const [areAllMatchingItemsSelected, selectAllMatchingItems] = useState(false);
    const [shouldShowFiltersBarLoading, setShouldShowFiltersBarLoading] = useState(false);
    const [lastSearchType, setLastSearchType] = useState<string | undefined>(undefined);
    const [searchContextData, setSearchContextData] = useState(defaultSearchContextData);
    const areTransactionsEmpty = useRef(true);

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

    const setSelectedTransactions: SearchContext['setSelectedTransactions'] = useCallback((selectedTransactions, data = []) => {
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
        let selectedReports: SearchContext['selectedReports'] = [];

        if (data.length && data.every(isTransactionReportGroupListItemType)) {
            selectedReports = data
                .filter((item) => isMoneyRequestReport(item) && item.transactions.length > 0 && item.transactions.every(({keyForList}) => selectedTransactions[keyForList]?.isSelected))
                .map(({reportID, action = CONST.SEARCH.ACTION_TYPES.VIEW, total = CONST.DEFAULT_NUMBER_ID, policyID, allActions = [action]}) => ({
                    reportID,
                    action,
                    total,
                    policyID,
                    allActions,
                }));
        } else if (data.length && data.every(isTransactionListItemType)) {
            selectedReports = data
                .filter(({keyForList}) => !!keyForList && selectedTransactions[keyForList]?.isSelected)
                .map(({reportID, action = CONST.SEARCH.ACTION_TYPES.VIEW, amount: total = CONST.DEFAULT_NUMBER_ID, policyID, allActions = [action]}) => ({
                    reportID,
                    action,
                    total,
                    policyID,
                    allActions,
                }));
        }

        setSearchContextData((prevState) => ({
            ...prevState,
            selectedTransactions,
            shouldTurnOffSelectionMode: false,
            selectedReports,
        }));
    }, []);

    const clearSelectedTransactions: SearchContext['clearSelectedTransactions'] = useCallback(
        (searchHashOrClearIDsFlag, shouldTurnOffSelectionMode = false) => {
            if (typeof searchHashOrClearIDsFlag === 'boolean') {
                setSelectedTransactions([]);
                return;
            }

            if (searchHashOrClearIDsFlag === searchContextData.currentSearchHash) {
                return;
            }

            if (searchContextData.selectedReports.length === 0 && isEmptyObject(searchContextData.selectedTransactions) && !searchContextData.shouldTurnOffSelectionMode) {
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
        [
            searchContextData.currentSearchHash,
            searchContextData.selectedReports.length,
            searchContextData.selectedTransactions,
            searchContextData.shouldTurnOffSelectionMode,
            setSelectedTransactions,
        ],
    );

    const removeTransaction: SearchContext['removeTransaction'] = useCallback(
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

    const searchContext = useMemo<SearchContext>(
        () => ({
            ...searchContextData,
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

    return <Context.Provider value={searchContext}>{children}</Context.Provider>;
}

/**
 * Note: `selectedTransactionIDs` and `selectedTransactions` are two separate properties.
 * Setting or clearing one of them does not influence the other.
 * IDs should be used if transaction details are not required.
 */
function useSearchContext() {
    return useContext(Context);
}

SearchContextProvider.displayName = 'SearchContextProvider';

export {SearchContextProvider, useSearchContext, Context};
