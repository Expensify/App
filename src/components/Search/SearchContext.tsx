import React, {useCallback, useContext, useMemo, useState} from 'react';
import {isMoneyRequestReport} from '@libs/ReportUtils';
import {isReportListItemType, isTransactionListItemType} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {SearchContext, SearchContextData} from './types';

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
    lastSearchType: undefined,
    isExportMode: false,
    shouldShowStatusBarLoading: false,
    shouldShowExportModeOption: false,
    setLastSearchType: () => {},
    setCurrentSearchHash: () => {},
    setSelectedTransactions: () => {},
    clearSelectedTransactions: () => {},
    setShouldShowStatusBarLoading: () => {},
    setShouldShowExportModeOption: () => {},
    setExportMode: () => {},
};

const Context = React.createContext<SearchContext>(defaultSearchContext);

function SearchContextProvider({children}: ChildrenProps) {
    const [shouldShowExportModeOption, setShouldShowExportModeOption] = useState(false);
    const [isExportMode, setExportMode] = useState(false);
    const [shouldShowStatusBarLoading, setShouldShowStatusBarLoading] = useState(false);
    const [lastSearchType, setLastSearchType] = useState<string | undefined>(undefined);
    const [searchContextData, setSearchContextData] = useState(defaultSearchContextData);

    const setCurrentSearchHash = useCallback((searchHash: number) => {
        setSearchContextData((prevState) => ({
            ...prevState,
            currentSearchHash: searchHash,
        }));
    }, []);

    const setSelectedTransactions: SearchContext['setSelectedTransactions'] = useCallback(
        (selectedTransactions, data = []) => {
            if (selectedTransactions instanceof Array) {
                if (!selectedTransactions.length && !searchContextData.selectedTransactionIDs.length) {
                    return;
                }
                return setSearchContextData((prevState) => ({
                    ...prevState,
                    selectedTransactionIDs: selectedTransactions,
                }));
            }

            // When selecting transactions, we also need to manage the reports to which these transactions belong. This is done to ensure proper exporting to CSV.
            let selectedReports: SearchContext['selectedReports'] = [];

            if (data.length && data.every(isReportListItemType)) {
                selectedReports = data
                    .filter((item) => isMoneyRequestReport(item) && item.transactions.every(({keyForList}) => selectedTransactions[keyForList]?.isSelected))
                    .map(({reportID, action = CONST.SEARCH.ACTION_TYPES.VIEW, total = CONST.DEFAULT_NUMBER_ID, policyID}) => ({reportID, action, total, policyID}));
            }

            if (data.length && data.every(isTransactionListItemType)) {
                selectedReports = data
                    .filter(({keyForList}) => !!keyForList && selectedTransactions[keyForList]?.isSelected)
                    .map(({reportID, action, amount: total, policyID}) => ({reportID, action, total, policyID}));
            }

            setSearchContextData((prevState) => ({
                ...prevState,
                selectedTransactions,
                shouldTurnOffSelectionMode: false,
                selectedReports,
            }));
        },
        [searchContextData.selectedTransactionIDs.length],
    );

    const clearSelectedTransactions: SearchContext['clearSelectedTransactions'] = useCallback(
        (searchHashOrClearIDsFlag, shouldTurnOffSelectionMode = false) => {
            if (typeof searchHashOrClearIDsFlag === 'boolean') {
                setSelectedTransactions([]);
                return;
            }

            if (searchHashOrClearIDsFlag === searchContextData.currentSearchHash) {
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
        [searchContextData.currentSearchHash, setSelectedTransactions],
    );

    const searchContext = useMemo<SearchContext>(
        () => ({
            ...searchContextData,
            setCurrentSearchHash,
            setSelectedTransactions,
            clearSelectedTransactions,
            shouldShowStatusBarLoading,
            setShouldShowStatusBarLoading,
            lastSearchType,
            setLastSearchType,
            shouldShowExportModeOption,
            setShouldShowExportModeOption,
            isExportMode,
            setExportMode,
        }),
        [
            searchContextData,
            setCurrentSearchHash,
            setSelectedTransactions,
            clearSelectedTransactions,
            shouldShowStatusBarLoading,
            lastSearchType,
            shouldShowExportModeOption,
            setShouldShowExportModeOption,
            isExportMode,
            setExportMode,
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
