import React, {useCallback, useContext, useMemo, useState} from 'react';
import type {ReportActionListItemType, ReportListItemType, TransactionListItemType} from '@components/SelectionList/types';
import {isMoneyRequestReport} from '@libs/ReportUtils';
import {isReportListItemType, isTransactionListItemType} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {SearchContext, SelectedTransactions} from './types';

const defaultSearchContext = {
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
};

const Context = React.createContext<SearchContext>(defaultSearchContext);

function getReportsFromSelectedTransactions(data: TransactionListItemType[] | ReportListItemType[] | ReportActionListItemType[], selectedTransactions: SelectedTransactions) {
    if (data.length === 0) {
        return [];
    }

    if (isReportListItemType(data[0]) || isMoneyRequestReport(data[0])) {
        return data
            .filter(
                (item): item is ReportListItemType =>
                    isReportListItemType(item) && isMoneyRequestReport(item) && item.transactions?.every((transaction) => selectedTransactions[transaction.keyForList]?.isSelected),
            )
            .map((item) => ({
                reportID: item.reportID,
                action: item.action ?? CONST.SEARCH.ACTION_TYPES.VIEW,
                total: item.total ?? CONST.DEFAULT_NUMBER_ID,
                policyID: item.policyID,
            }));
    }

    if (isTransactionListItemType(data[0])) {
        return data
            .filter((transaction) => transaction.keyForList != null && selectedTransactions[transaction.keyForList]?.isSelected)
            .map((transaction) => ({
                reportID: transaction.reportID,
                action: 'action' in transaction ? transaction.action ?? CONST.SEARCH.ACTION_TYPES.VIEW : CONST.SEARCH.ACTION_TYPES.VIEW,
                total: 'amount' in transaction ? transaction.amount ?? CONST.DEFAULT_NUMBER_ID : CONST.DEFAULT_NUMBER_ID,
                policyID: transaction.policyID,
            }));
    }

    return [];
}

function SearchContextProvider({children}: ChildrenProps) {
    const [searchContextData, setSearchContextData] = useState<Pick<SearchContext, 'currentSearchHash' | 'selectedTransactions' | 'shouldTurnOffSelectionMode' | 'selectedReports'>>({
        currentSearchHash: defaultSearchContext.currentSearchHash,
        selectedTransactions: defaultSearchContext.selectedTransactions,
        shouldTurnOffSelectionMode: false,
        selectedReports: defaultSearchContext.selectedReports,
    });

    const setCurrentSearchHash = useCallback((searchHash: number) => {
        setSearchContextData((prevState) => ({
            ...prevState,
            currentSearchHash: searchHash,
        }));
    }, []);

    const setSelectedTransactions = useCallback((selectedTransactions: SelectedTransactions, data: TransactionListItemType[] | ReportListItemType[] | ReportActionListItemType[]) => {
        // When selecting transactions, we also need to manage the reports to which these transactions belong. This is done to ensure proper exporting to CSV.
        const selectedReports = getReportsFromSelectedTransactions(data, selectedTransactions);

        setSearchContextData((prevState) => ({
            ...prevState,
            selectedTransactions,
            shouldTurnOffSelectionMode: false,
            selectedReports,
        }));
    }, []);

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
        }),
        [searchContextData, setCurrentSearchHash, setSelectedTransactions, clearSelectedTransactions, shouldShowStatusBarLoading, lastSearchType, setLastSearchType],
    );

    return <Context.Provider value={searchContext}>{children}</Context.Provider>;
}

function useSearchContext() {
    return useContext(Context);
}

SearchContextProvider.displayName = 'SearchContextProvider';

export {SearchContextProvider, useSearchContext};
