import React, {useCallback, useContext, useMemo, useState} from 'react';
import type {ReportListItemType, TransactionListItemType} from '@components/SelectionList/types';
import {isTransactionListItemType} from '@libs/SearchUtils';
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
};

const Context = React.createContext<SearchContext>(defaultSearchContext);

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

    const setSelectedTransactions = useCallback((selectedTransactions: SelectedTransactions, data: TransactionListItemType[] | ReportListItemType[]) => {
        // When selecting transaction we also have to manage reports to which these transactions belong toString. We do this for sake of properly exporting to CSV
        const selectedReports = (data ?? [])
            .filter(
                (item) =>
                    !isTransactionListItemType(item) &&
                    item.reportID &&
                    item.transactions.every((transaction: {keyForList: string | number}) => selectedTransactions[transaction.keyForList]?.isSelected),
            )
            .map((item) => item.reportID);

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

    const searchContext = useMemo<SearchContext>(
        () => ({
            ...searchContextData,
            setCurrentSearchHash,
            setSelectedTransactions,
            clearSelectedTransactions,
            shouldShowStatusBarLoading,
            setShouldShowStatusBarLoading,
        }),
        [searchContextData, setCurrentSearchHash, setSelectedTransactions, clearSelectedTransactions, shouldShowStatusBarLoading],
    );

    return <Context.Provider value={searchContext}>{children}</Context.Provider>;
}

function useSearchContext() {
    return useContext(Context);
}

SearchContextProvider.displayName = 'SearchContextProvider';

export {SearchContextProvider, useSearchContext};
