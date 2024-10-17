import React, {useCallback, useContext, useMemo, useState} from 'react';
import type {ReportActionListItemType, ReportListItemType, TransactionListItemType} from '@components/SelectionList/types';
import * as SearchUIUtils from '@libs/SearchUIUtils';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {SearchContext, SelectedTransactions} from './types';

const defaultSearchContext = {
    currentSearchHash: -1,
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
    return (data ?? [])
        .filter(
            (item) =>
                !SearchUIUtils.isTransactionListItemType(item) &&
                !SearchUIUtils.isReportActionListItemType(item) &&
                item.reportID &&
                item?.transactions?.every((transaction: {keyForList: string | number}) => selectedTransactions[transaction.keyForList]?.isSelected),
        )
        .map((item) => item.reportID);
}

function SearchContextProvider({children}: ChildrenProps) {
    const [searchContextData, setSearchContextData] = useState<Pick<SearchContext, 'currentSearchHash' | 'selectedTransactions' | 'selectedReports'>>({
        currentSearchHash: defaultSearchContext.currentSearchHash,
        selectedTransactions: defaultSearchContext.selectedTransactions,
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
            selectedReports,
        }));
    }, []);

    const clearSelectedTransactions = useCallback(
        (searchHash?: number) => {
            if (searchHash === searchContextData.currentSearchHash) {
                return;
            }
            setSearchContextData((prevState) => ({
                ...prevState,
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
