import React, {useMemo} from 'react';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {Context, useSearchContext} from './SearchContext';

type SearchScopeProviderProps = ChildrenProps & {
    isOnSearch: boolean;
};

function SearchScopeProvider({children, isOnSearch}: SearchScopeProviderProps) {
    const parentContext = useSearchContext();

    const searchContext = useMemo(
        () => ({
            ...parentContext,
            isOnSearch,
        }),
        [parentContext, isOnSearch],
    );

    return <Context.Provider value={searchContext}>{children}</Context.Provider>;
}

export default SearchScopeProvider;
