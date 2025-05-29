import React, {useCallback, useContext, useMemo, useState} from 'react';
import {getReportsFromSelectedTransactions} from '@libs/SearchUIUtils';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {SearchContext} from './types';

const defaultSearchContext: SearchContext = {
    currentSearchHash: -1,
    shouldTurnOffSelectionMode: false,
    selectedTransactions: {},
    selectedTransactionsID: [],
    selectedReports: [],
    setCurrentSearchHash: () => {},
    setSelectedTransactions: () => {},
    clearSelectedTransactions: () => {},
    shouldShowStatusBarLoading: false,
    setShouldShowStatusBarLoading: () => {},
    lastSearchType: undefined,
    setLastSearchType: () => {},
    shouldShowExportModeOption: false,
    setShouldShowExportModeOption: () => {},
    isExportMode: false,
    setExportMode: () => {},
    isOnSearch: false,
};

const Context = React.createContext<SearchContext>(defaultSearchContext);

function SearchContextProvider({children}: ChildrenProps) {
    const [shouldShowExportModeOption, setShouldShowExportModeOption] = useState(false);
    const [isExportMode, setExportMode] = useState(false);
    const [shouldShowStatusBarLoading, setShouldShowStatusBarLoading] = useState(false);
    const [lastSearchType, setLastSearchType] = useState<string | undefined>(undefined);
    const [searchContextData, setSearchContextData] = useState<
        Pick<SearchContext, 'currentSearchHash' | 'selectedTransactions' | 'shouldTurnOffSelectionMode' | 'selectedReports' | 'isOnSearch' | 'selectedTransactionsID'>
    >({
        currentSearchHash: defaultSearchContext.currentSearchHash,
        selectedTransactions: defaultSearchContext.selectedTransactions,
        selectedTransactionsID: defaultSearchContext.selectedTransactionsID,
        shouldTurnOffSelectionMode: false,
        selectedReports: defaultSearchContext.selectedReports,
        isOnSearch: false,
    });

    const setCurrentSearchHash = useCallback((searchHash: number) => {
        setSearchContextData((prevState) => ({
            ...prevState,
            currentSearchHash: searchHash,
        }));
    }, []);

    const setSelectedTransactions: SearchContext['setSelectedTransactions'] = useCallback(
        (selectedTransactions, data = []) => {
            if (selectedTransactions instanceof Array) {
                if (!selectedTransactions.length && !searchContextData.selectedTransactionsID.length) {
                    return;
                }
                return setSearchContextData((prevState) => ({
                    ...prevState,
                    selectedTransactionsID: selectedTransactions,
                }));
            }

            // When selecting transactions, we also need to manage the reports to which these transactions belong. This is done to ensure proper exporting to CSV.
            const selectedReports = getReportsFromSelectedTransactions(data, selectedTransactions);

            setSearchContextData((prevState) => ({
                ...prevState,
                selectedTransactions,
                shouldTurnOffSelectionMode: false,
                selectedReports,
            }));
        },
        [searchContextData.selectedTransactionsID.length],
    );

    const clearSelectedTransactions = useCallback(
        (searchHash?: number, shouldTurnOffSelectionMode = false) => {
            if (searchHash === searchContextData.currentSearchHash) {
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
        [searchContextData.currentSearchHash],
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

function useSearchContext() {
    return useContext(Context);
}

SearchContextProvider.displayName = 'SearchContextProvider';

export {SearchContextProvider, useSearchContext, Context};
