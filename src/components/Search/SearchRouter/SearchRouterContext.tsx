import React, {useContext, useMemo, useState} from 'react';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

const defaultSearchContext = {
    isSearchRouterDisplayed: false,
    openSearchRouter: () => {},
    closeSearchRouter: () => {},
};

type SearchRouterContext = typeof defaultSearchContext;

const Context = React.createContext<SearchRouterContext>(defaultSearchContext);

function SearchRouterContextProvider({children}: ChildrenProps) {
    const [isSearchRouterDisplayed, setIsSearchRouterDisplayed] = useState(false);

    const routerContext = useMemo(() => {
        const openSearchRouter = () => setIsSearchRouterDisplayed(true);
        const closeSearchRouter = () => setIsSearchRouterDisplayed(false);

        return {
            isSearchRouterDisplayed,
            openSearchRouter,
            closeSearchRouter,
        };
    }, [isSearchRouterDisplayed, setIsSearchRouterDisplayed]);

    return <Context.Provider value={routerContext}>{children}</Context.Provider>;
}

function useSearchRouterContext() {
    return useContext(Context);
}

SearchRouterContextProvider.displayName = 'SearchRouterContextProvider';

export {SearchRouterContextProvider, useSearchRouterContext};
