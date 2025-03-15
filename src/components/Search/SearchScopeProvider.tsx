import React from 'react';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {useSearchContext} from './SearchContext';
import {Context} from './SearchContext';

type SearchScopeProviderProps = ChildrenProps & {
    isOnSearch: boolean;
};

function SearchScopeProvider({children, isOnSearch}: SearchScopeProviderProps) {
    const parentContext = useSearchContext();

    const searchContext = {
        ...parentContext,
        isOnSearch,
    };

    return <Context.Provider value={searchContext}>{children}</Context.Provider>;
}

export default SearchScopeProvider;
