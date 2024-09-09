import React, {useCallback, useContext, useState} from 'react';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

const defaultSearchContext = {
    isSearchRouterDisplayed: false,
    toggleSearchRouter: () => {},
};

type SearchRouterContext = typeof defaultSearchContext;

const Context = React.createContext<SearchRouterContext>(defaultSearchContext);

function SearchRouterContextProvider({children}: ChildrenProps) {
    const [isSearchRouterDisplayed, setIsSearchRouterDisplayed] = useState(false);

    const toggleSearchRouter = useCallback(() => {
        setIsSearchRouterDisplayed(!isSearchRouterDisplayed);
    }, [isSearchRouterDisplayed]);

    const routerContext = {
        isSearchRouterDisplayed,
        toggleSearchRouter,
    };
    return <Context.Provider value={routerContext}>{children}</Context.Provider>;
}

function useSearchRouterContext() {
    return useContext(Context);
}

SearchRouterContextProvider.displayName = 'SearchRouterContextProvider';

export {SearchRouterContextProvider, useSearchRouterContext};
