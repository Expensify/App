import React, {useCallback, useContext, useMemo, useState} from 'react';
import type {ReportActionListItemType, ReportListItemType, TaskListItemType, TransactionListItemType} from '@components/SelectionList/types';
import {getReportsFromSelectedTransactions} from '@libs/SearchUIUtils';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {SearchContext as SearchContextOld, SelectedTransactions, TMoneyRequestReportContext} from './types';

type SearchContext = TMoneyRequestReportContext & SearchContextOld;

const defaultSearchContext: SearchContext = {
    currentSearchHash: -1,
    shouldTurnOffSelectionMode: false,
    selectedTransactions: {},
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
    /** **************** */
    selectedTransactionsID: [],
    setSelectedTransactionsID: () => {},
    toggleTransaction: () => {},
    removeTransaction: () => {},
    isTransactionSelected: () => false,
};

const Context = React.createContext<SearchContext>(defaultSearchContext);

function SearchContextProvider({children}: ChildrenProps) {
    const [shouldShowExportModeOption, setShouldShowExportModeOption] = useState(false);
    const [isExportMode, setExportMode] = useState(false);
    const [selectedTransactionsID, setSelectedTransactionsID] = useState<string[]>([]);

    const [searchContextData, setSearchContextData] = useState<
        Pick<SearchContext, 'currentSearchHash' | 'selectedTransactions' | 'shouldTurnOffSelectionMode' | 'selectedReports' | 'isOnSearch'>
    >({
        currentSearchHash: defaultSearchContext.currentSearchHash,
        selectedTransactions: defaultSearchContext.selectedTransactions,
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

    const toggleTransaction = useCallback((transactionID: string) => {
        setSelectedTransactionsID((prev) => {
            if (prev.includes(transactionID)) {
                return prev.filter((t) => t !== transactionID);
            }
            return [...prev, transactionID];
        });
    }, []);

    const removeTransaction = useCallback((transactionID?: string) => {
        setSelectedTransactionsID((prev) => {
            return prev.filter((t) => t !== transactionID);
        });
    }, []);

    const isTransactionSelected = useCallback((transactionID: string) => selectedTransactionsID.includes(transactionID), [selectedTransactionsID]);

    const setSelectedTransactions = useCallback(
        (selectedTransactions: SelectedTransactions, data: TransactionListItemType[] | ReportListItemType[] | ReportActionListItemType[] | TaskListItemType[]) => {
            // When selecting transactions, we also need to manage the reports to which these transactions belong. This is done to ensure proper exporting to CSV.
            const selectedReports = getReportsFromSelectedTransactions(data, selectedTransactions);

            setSearchContextData((prevState) => ({
                ...prevState,
                selectedTransactions,
                shouldTurnOffSelectionMode: false,
                selectedReports,
            }));
        },
        [],
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

    const [shouldShowStatusBarLoading, setShouldShowStatusBarLoading] = useState(false);
    const [lastSearchType, setLastSearchType] = useState<string | undefined>(undefined);

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
            /** **************** */
            selectedTransactionsID,
            setSelectedTransactionsID,
            toggleTransaction,
            isTransactionSelected,
            removeTransaction,
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
            /** **************** */
            selectedTransactionsID,
            setSelectedTransactionsID,
            toggleTransaction,
            isTransactionSelected,
            removeTransaction,
        ],
    );

    return <Context.Provider value={searchContext}>{children}</Context.Provider>;
}

function useSearchContext() {
    return useContext(Context);
}

SearchContextProvider.displayName = 'SearchContextProvider';

export {SearchContextProvider, useSearchContext, Context};
