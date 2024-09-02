import React, {useCallback, useContext, useMemo, useState} from 'react';
import type {SearchReport} from '@src/types/onyx/SearchResults';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {SearchContext, SelectedTransactions} from './types';

const defaultSearchContext = {
    currentSearchHash: -1,
    selectedTransactions: {},
    selectedReports: [],
    setCurrentSearchHash: () => {},
    setSelectedTransactions: () => {},
    clearSelectedTransactions: () => {},
    setSelectedReports: () => {},
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

    const setSelectedTransactions = useCallback((selectedTransactions: SelectedTransactions) => {
        setSearchContextData((prevState) => ({
            ...prevState,
            selectedTransactions,
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
            }));
        },
        [searchContextData.currentSearchHash],
    );

    const setSelectedReports = useCallback((selectedReports: Array<SearchReport['reportID']>) => {
        setSearchContextData((prevState) => ({
            ...prevState,
            selectedReports,
        }));
    }, []);

    const [shouldShowStatusBarLoading, setShouldShowStatusBarLoading] = useState(false);

    const searchContext = useMemo<SearchContext>(
        () => ({
            ...searchContextData,
            setCurrentSearchHash,
            setSelectedTransactions,
            clearSelectedTransactions,
            setSelectedReports,
            shouldShowStatusBarLoading,
            setShouldShowStatusBarLoading,
        }),
        [searchContextData, setCurrentSearchHash, setSelectedTransactions, clearSelectedTransactions, setSelectedReports, shouldShowStatusBarLoading],
    );

    return <Context.Provider value={searchContext}>{children}</Context.Provider>;
}

function useSearchContext() {
    return useContext(Context);
}

SearchContextProvider.displayName = 'SearchContextProvider';

export {SearchContextProvider, useSearchContext};
