import React, {createContext, useCallback, useContext, useMemo, useRef} from 'react';
import type {MutableRefObject} from 'react';
import type {SearchListItem} from '@components/SelectionListWithSections/types';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type SearchListItemsCacheRef = MutableRefObject<Map<string, SearchListItem> | null>;

type SearchListItemsCacheContextValue = {
    itemsCacheRef: SearchListItemsCacheRef;
    setItemsCache: (items: SearchListItem[]) => void;
};

const SearchListItemsCacheContext = createContext<SearchListItemsCacheContextValue | null>(null);

function SearchListItemsCacheProvider({children}: ChildrenProps) {
    const itemsCacheRef = useRef<Map<string, SearchListItem> | null>(null);
    const setItemsCache = useCallback((items: SearchListItem[]) => {
        itemsCacheRef.current = new Map(items.map((item) => [item.keyForList ?? '', item]));
    }, []);
    const value = useMemo(() => ({itemsCacheRef, setItemsCache}), [setItemsCache]);
    return <SearchListItemsCacheContext.Provider value={value}>{children}</SearchListItemsCacheContext.Provider>;
}

function useSearchListItemsCacheRef(): SearchListItemsCacheRef | null {
    const context = useContext(SearchListItemsCacheContext);
    return context?.itemsCacheRef ?? null;
}

function useSearchListItemsCache(): SearchListItemsCacheContextValue | null {
    return useContext(SearchListItemsCacheContext);
}

export {SearchListItemsCacheProvider, useSearchListItemsCacheRef, useSearchListItemsCache};
export type {SearchListItemsCacheRef, SearchListItemsCacheContextValue};
