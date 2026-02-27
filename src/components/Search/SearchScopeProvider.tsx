import React, {useContext, useMemo} from 'react';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

const defaultSearchContext = {
    isOnSearch: false,
};

const SearchScopeContext = React.createContext(defaultSearchContext);

function SearchScopeProvider({children, isOnSearch = true}: ChildrenProps) {
    const searchContext = useMemo(
        () => ({
            isOnSearch,
        }),
        [isOnSearch],
    );

    return <SearchScopeContext.Provider value={searchContext}>{children}</SearchScopeContext.Provider>;
}

function useIsOnSearch() {
    const {isOnSearch} = useContext(SearchScopeContext);
    return isOnSearch;
}

export {useIsOnSearch, SearchScopeProvider};
