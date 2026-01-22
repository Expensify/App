import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
import useOnyx from '@hooks/useOnyx';
import {isMoneyRequestReport} from '@libs/ReportUtils';
import {isTransactionListItemType, isTransactionReportGroupListItemType} from '@libs/SearchUIUtils';
import type {SearchKey} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {SearchContextData, SearchContextProps, SearchQueryJSON, SelectedTransactions} from './types';

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

    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${searchContextData.currentSearchHash}`, {canBeMissing: true});

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
                .filter((item) => isMoneyRequestReport(item) && item.transactions.length > 0 && item.transactions.every(({keyForList}) => selectedTransactions[keyForList]?.isSelected))
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
