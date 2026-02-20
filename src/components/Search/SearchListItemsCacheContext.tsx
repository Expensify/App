import React, {createContext, useContext, useMemo, useRef} from 'react';
import type {MutableRefObject} from 'react';
import type {SearchListItem} from '@components/SelectionListWithSections/types';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type SearchListItemsCacheRef = MutableRefObject<Map<string, SearchListItem> | null>;

const SearchListItemsCacheContext = createContext<SearchListItemsCacheRef | null>(null);

function SearchListItemsCacheProvider({children}: ChildrenProps) {
    const itemsCacheRef = useRef<Map<string, SearchListItem> | null>(null);
    const value = useMemo(() => itemsCacheRef, []);
    return (
        <SearchListItemsCacheContext.Provider value={value}>{children}</SearchListItemsCacheContext.Provider>
    );
}

function useSearchListItemsCacheRef(): SearchListItemsCacheRef | null {
    return useContext(SearchListItemsCacheContext);
}

export {SearchListItemsCacheProvider, useSearchListItemsCacheRef};
export type {SearchListItemsCacheRef};
