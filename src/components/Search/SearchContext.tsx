import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
import useCardFeedsForDisplay from '@hooks/useCardFeedsForDisplay';
import useOnyx from '@hooks/useOnyx';
import {isMoneyRequestReport} from '@libs/ReportUtils';
import {
    getSuggestedSearches,
    isTransactionCardGroupListItemType,
    isTransactionListItemType,
    isTransactionMemberGroupListItemType,
    isTransactionReportGroupListItemType,
} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {SearchContext, SearchContextData, SelectedTransactions} from './types';

const defaultSearchContextData: SearchContextData = {
    currentSearchHash: -1,
    selectedTransactions: {},
    selectedTransactionIDs: [],
    selectedReports: [],
    isOnSearch: false,
    shouldTurnOffSelectionMode: false,
};

const defaultSearchContext: SearchContext = {
    ...defaultSearchContextData,
    currentSearchKey: undefined,
    lastSearchType: undefined,
    isExportMode: false,
    shouldShowExportModeOption: false,
    shouldShowFiltersBarLoading: false,
    setLastSearchType: () => {},
    setCurrentSearchHash: () => {},
    setSelectedTransactions: () => {},
    removeTransaction: () => {},
    clearSelectedTransactions: () => {},
    setShouldShowFiltersBarLoading: () => {},
    setShouldShowExportModeOption: () => {},
    setExportMode: () => {},
};

const Context = React.createContext<SearchContext>(defaultSearchContext);

function SearchContextProvider({children}: ChildrenProps) {
    const [shouldShowExportModeOption, setShouldShowExportModeOption] = useState(false);
    const [isExportMode, setExportMode] = useState(false);
    const [shouldShowFiltersBarLoading, setShouldShowFiltersBarLoading] = useState(false);
    const [lastSearchType, setLastSearchType] = useState<string | undefined>(undefined);
    const [searchContextData, setSearchContextData] = useState(defaultSearchContextData);
    const areTransactionsEmpty = useRef(true);
    const {defaultCardFeed} = useCardFeedsForDisplay();

    const [accountID] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false, selector: (s) => s?.accountID});
    const suggestedSearches = useMemo(() => getSuggestedSearches(defaultCardFeed?.id, accountID), [defaultCardFeed?.id, accountID]);

    const currentSearchKey = useMemo(() => {
        const currentSearch = Object.values(suggestedSearches).find((search) => search.hash === searchContextData.currentSearchHash);
        return currentSearch?.key;
    }, [suggestedSearches, searchContextData.currentSearchHash]);

    const setCurrentSearchHash = useCallback((searchHash: number) => {
        setSearchContextData((prevState) => {
            if (searchHash === prevState.currentSearchHash) {
                return prevState;
            }

            return {
                ...prevState,
                currentSearchHash: searchHash,
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
                .filter((item) => isMoneyRequestReport(item) && item.transactions.every(({keyForList}) => selectedTransactions[keyForList]?.isSelected))
                .map(({reportID, action = CONST.SEARCH.ACTION_TYPES.VIEW, total = CONST.DEFAULT_NUMBER_ID, policyID}) => ({reportID, action, total, policyID}));
        }

        if (data.length && data.every(isTransactionMemberGroupListItemType)) {
            selectedReports = data
                .flatMap((item) => item.transactions)
                .filter(({keyForList}) => !!keyForList && selectedTransactions[keyForList]?.isSelected)
                .map(({reportID, action = CONST.SEARCH.ACTION_TYPES.VIEW, amount: total = CONST.DEFAULT_NUMBER_ID, policyID}) => ({reportID, action, total, policyID}));
        }

        if (data.length && data.every(isTransactionCardGroupListItemType)) {
            selectedReports = data
                .flatMap((item) => item.transactions)
                .filter(({keyForList}) => !!keyForList && selectedTransactions[keyForList]?.isSelected)
                .map(({reportID, action = CONST.SEARCH.ACTION_TYPES.VIEW, amount: total = CONST.DEFAULT_NUMBER_ID, policyID}) => ({reportID, action, total, policyID}));
        }

        if (data.length && data.every(isTransactionListItemType)) {
            selectedReports = data
                .filter(({keyForList}) => !!keyForList && selectedTransactions[keyForList]?.isSelected)
                .map(({reportID, action = CONST.SEARCH.ACTION_TYPES.VIEW, amount: total = CONST.DEFAULT_NUMBER_ID, policyID}) => ({reportID, action, total, policyID}));
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
            setShouldShowExportModeOption(false);
            setExportMode(false);
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

    const searchContext = useMemo<SearchContext>(
        () => ({
            ...searchContextData,
            currentSearchKey,
            removeTransaction,
            setCurrentSearchHash,
            setSelectedTransactions,
            clearSelectedTransactions,
            shouldShowFiltersBarLoading,
            setShouldShowFiltersBarLoading,
            lastSearchType,
            setLastSearchType,
            shouldShowExportModeOption,
            setShouldShowExportModeOption,
            isExportMode,
            setExportMode,
        }),
        [
            searchContextData,
            currentSearchKey,
            removeTransaction,
            setCurrentSearchHash,
            setSelectedTransactions,
            clearSelectedTransactions,
            shouldShowFiltersBarLoading,
            lastSearchType,
            shouldShowExportModeOption,
            isExportMode,
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
