import React, {useCallback, useContext, useMemo, useState} from 'react';
import type {SearchContext} from '@components/Search/types';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

const defaultSearchContext = {
    currentSearchHash: -1,
    selectedTransactionIds: [],
    setCurrentSearchHash: () => {},
    setSelectedTransactionIds: () => {},
};

const Context = React.createContext<SearchContext>(defaultSearchContext);

function SearchContextProvider({children}: ChildrenProps) {
    const [searchContextData, setSearchContextData] = useState<Pick<SearchContext, 'currentSearchHash' | 'selectedTransactionIds'>>({
        currentSearchHash: defaultSearchContext.currentSearchHash,
        selectedTransactionIds: defaultSearchContext.selectedTransactionIds,
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
        (selectedTransactionIds: string[]) => {
            setSearchContextData({
                ...searchContextData,
                selectedTransactionIds,
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
