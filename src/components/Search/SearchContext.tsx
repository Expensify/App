import React, {useCallback, useContext, useMemo, useState} from 'react';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {SearchContext} from './types';

const defaultSearchContext = {
    currentSearchHash: -1,
    selectedTransactionIDs: [],
    setCurrentSearchHash: () => {},
    setSelectedTransactionIds: () => {},
};

const Context = React.createContext<SearchContext>(defaultSearchContext);

function SearchContextProvider({children}: ChildrenProps) {
    const [searchContextData, setSearchContextData] = useState<Pick<SearchContext, 'currentSearchHash' | 'selectedTransactionIDs'>>({
        currentSearchHash: defaultSearchContext.currentSearchHash,
        selectedTransactionIDs: defaultSearchContext.selectedTransactionIDs,
    });

    const setCurrentSearchHash = useCallback(
        (searchHash: number) => {
            setSearchContextData({
                ...searchContextData,
                currentSearchHash: searchHash,
            });
        },
        [searchContextData],
    );

    const setSelectedTransactionIds = useCallback(
        (selectedTransactionIDs: string[]) => {
            setSearchContextData({
                ...searchContextData,
                selectedTransactionIDs,
            });
        },
        [searchContextData],
    );

    const searchContext = useMemo<SearchContext>(
        () => ({
            ...searchContextData,
            setCurrentSearchHash,
            setSelectedTransactionIds,
        }),
        [searchContextData, setCurrentSearchHash, setSelectedTransactionIds],
    );

    return <Context.Provider value={searchContext}>{children}</Context.Provider>;
}

function useSearchContext() {
    return useContext(Context);
}

SearchContextProvider.displayName = 'SearchContextProvider';

export {SearchContextProvider, useSearchContext};
