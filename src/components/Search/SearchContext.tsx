import React, {useCallback, useContext, useMemo, useState} from 'react';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {SearchContext, SelectedTransactions} from './types';

const defaultSearchContext = {
    currentSearchHash: -1,
    shouldTurnOffSelectionMode: false,
    selectedTransactions: {},
    setCurrentSearchHash: () => {},
    setSelectedTransactions: () => {},
    clearSelectedTransactions: () => {},
};

const Context = React.createContext<SearchContext>(defaultSearchContext);

function SearchContextProvider({children}: ChildrenProps) {
    const [searchContextData, setSearchContextData] = useState<Pick<SearchContext, 'currentSearchHash' | 'selectedTransactions' | 'shouldTurnOffSelectionMode'>>({
        currentSearchHash: defaultSearchContext.currentSearchHash,
        selectedTransactions: defaultSearchContext.selectedTransactions,
        shouldTurnOffSelectionMode: false,
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
            shouldTurnOffSelectionMode: false,
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
            }));
        },
        [searchContextData.currentSearchHash],
    );

    const searchContext = useMemo<SearchContext>(
        () => ({
            ...searchContextData,
            setCurrentSearchHash,
            setSelectedTransactions,
            clearSelectedTransactions,
        }),
        [searchContextData, setCurrentSearchHash, setSelectedTransactions, clearSelectedTransactions],
    );

    return <Context.Provider value={searchContext}>{children}</Context.Provider>;
}

function useSearchContext() {
    return useContext(Context);
}

SearchContextProvider.displayName = 'SearchContextProvider';

export {SearchContextProvider, useSearchContext};
