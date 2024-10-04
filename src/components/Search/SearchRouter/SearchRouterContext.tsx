import React, {useContext, useMemo, useRef, useState} from 'react';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

const defaultSearchContext = {
    isSearchRouterDisplayed: false,
    openSearchRouter: () => {},
    closeSearchRouter: () => {},
    toggleSearchRouter: () => {},
};

type SearchRouterContext = typeof defaultSearchContext;

const Context = React.createContext<SearchRouterContext>(defaultSearchContext);

function SearchRouterContextProvider({children}: ChildrenProps) {
    const [isSearchRouterDisplayed, setIsSearchRouterDisplayed] = useState(false);
    const searchRouterDisplayedRef = useRef(false);

    const routerContext = useMemo(() => {
        const openSearchRouter = () => {
            setIsSearchRouterDisplayed(true);
            searchRouterDisplayedRef.current = true;
        };
        const closeSearchRouter = () => {
            setIsSearchRouterDisplayed(false);
            searchRouterDisplayedRef.current = false;
        };

        // There are callbacks that live outside of React render-loop and interact with SearchRouter
        // So we need a function that is based on ref to correctly open/close it
        const toggleSearchRouter = () => {
            if (searchRouterDisplayedRef.current) {
                closeSearchRouter();
            } else {
                openSearchRouter();
            }
        };

        return {
            isSearchRouterDisplayed,
            openSearchRouter,
            closeSearchRouter,
            toggleSearchRouter,
        };
    }, [isSearchRouterDisplayed, setIsSearchRouterDisplayed]);

    return <Context.Provider value={routerContext}>{children}</Context.Provider>;
}

function useSearchRouterContext() {
    return useContext(Context);
}

SearchRouterContextProvider.displayName = 'SearchRouterContextProvider';

export {SearchRouterContextProvider, useSearchRouterContext};
