import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React, {useContext} from 'react';

const defaultSearchContext = {
    isOnSearch: false,
};

const SearchScopeContext = React.createContext(defaultSearchContext);

function SearchScopeProvider({children, isOnSearch = true}: ChildrenProps) {
    const searchContext = {
        isOnSearch,
    };

    return <SearchScopeContext.Provider value={searchContext}>{children}</SearchScopeContext.Provider>;
}

function useIsOnSearch() {
    const {isOnSearch} = useContext(SearchScopeContext);
    return isOnSearch;
}

export {useIsOnSearch, SearchScopeProvider};
