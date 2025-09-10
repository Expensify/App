import React, {useContext, useMemo} from 'react';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type SearchScopeProviderProps = ChildrenProps & {
    isOnSearch: boolean;
};

const defaultSearchContext = {
    isOnSearch: false,
};

const SearchScopeContext = React.createContext(defaultSearchContext);

function SearchScopeProvider({children, isOnSearch}: SearchScopeProviderProps) {
    const searchContext = useMemo(
        () => ({
            isOnSearch,
        }),
        [isOnSearch],
    );

    return <SearchScopeContext.Provider value={searchContext}>{children}</SearchScopeContext.Provider>;
}

const useIsOnSearch = () => {
    return useContext(SearchScopeContext);
};

export {useIsOnSearch, SearchScopeProvider};
export default SearchScopeProvider;
