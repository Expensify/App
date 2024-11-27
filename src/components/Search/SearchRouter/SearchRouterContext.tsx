import React, {useContext, useMemo, useRef, useState} from 'react';
import isSearchTopmostCentralPane from '@navigation/isSearchTopmostCentralPane';
import * as Modal from '@userActions/Modal';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

const defaultSearchContext = {
    isSearchRouterDisplayed: false,
    openSearchRouter: () => {},
    closeSearchRouter: () => {},
    toggleSearch: () => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    registerSearchPageInput: (fn?: () => void) => {},
};

type SearchRouterContext = typeof defaultSearchContext;

const Context = React.createContext<SearchRouterContext>(defaultSearchContext);

function SearchRouterContextProvider({children}: ChildrenProps) {
    const [isSearchRouterDisplayed, setIsSearchRouterDisplayed] = useState(false);
    const searchRouterDisplayedRef = useRef(false);
    const searchPageFocusInputRef = useRef<(() => void) | undefined>(undefined);

    const routerContext = useMemo(() => {
        const openSearchRouter = () => {
            Modal.close(
                () => {
                    setIsSearchRouterDisplayed(true);
                    searchRouterDisplayedRef.current = true;
                },
                false,
                true,
            );
        };
        const closeSearchRouter = () => {
            setIsSearchRouterDisplayed(false);
            searchRouterDisplayedRef.current = false;
        };

        // There are callbacks that live outside of React render-loop and interact with SearchRouter
        // So we need a function that is based on ref to correctly open/close it
        // When on `/search` Page we instead focus the Input
        const toggleSearch = () => {
            const isUserOnSearchPage = isSearchTopmostCentralPane();

            console.log('toggle', {isUserOnSearchPage, ref: searchPageFocusInputRef.current});

            if (isUserOnSearchPage && searchPageFocusInputRef.current) {
                searchPageFocusInputRef.current?.();
            } else if (searchRouterDisplayedRef.current) {
                closeSearchRouter();
            } else {
                openSearchRouter();
            }
        };

        const registerSearchPageInput = (focusSearchInput?: () => void) => {
            searchPageFocusInputRef.current = focusSearchInput;
        };

        return {
            isSearchRouterDisplayed,
            openSearchRouter,
            closeSearchRouter,
            toggleSearch,
            registerSearchPageInput,
        };
    }, [isSearchRouterDisplayed, setIsSearchRouterDisplayed]);

    return <Context.Provider value={routerContext}>{children}</Context.Provider>;
}

function useSearchRouterContext() {
    return useContext(Context);
}

SearchRouterContextProvider.displayName = 'SearchRouterContextProvider';

export {SearchRouterContextProvider, useSearchRouterContext};
