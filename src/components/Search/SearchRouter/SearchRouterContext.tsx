import React, {useContext, useEffect, useRef, useState} from 'react';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import {navigationRef} from '@libs/Navigation/Navigation';
import {startSpan} from '@libs/telemetry/activeSpans';
import {close} from '@userActions/Modal';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {closeSearch, openSearch} from './toggleSearch';

type SearchRouterStateContextType = {
    isSearchRouterDisplayed: boolean;
};

type SearchRouterActionsContextType = {
    openSearchRouter: () => void;
    closeSearchRouter: () => void;
    toggleSearch: () => void;
    registerSearchPageInput: (ref: AnimatedTextInputRef) => void;
    unregisterSearchPageInput: () => void;
};

type HistoryState = {
    isSearchModalOpen?: boolean;
};

const defaultSearchRouterActionsContext: SearchRouterActionsContextType = {
    openSearchRouter: () => {},
    closeSearchRouter: () => {},
    toggleSearch: () => {},
    registerSearchPageInput: () => {},
    unregisterSearchPageInput: () => {},
};

const SearchRouterStateContext = React.createContext<SearchRouterStateContextType>({isSearchRouterDisplayed: false});

const SearchRouterActionsContext = React.createContext<SearchRouterActionsContextType>(defaultSearchRouterActionsContext);

const isBrowserWithHistory = typeof window !== 'undefined' && typeof window.history !== 'undefined';
const canListenPopState = typeof window !== 'undefined' && typeof window.addEventListener === 'function';

function SearchRouterContextProvider({children}: ChildrenProps) {
    const [isSearchRouterDisplayed, setIsSearchRouterDisplayed] = useState(false);
    const searchRouterDisplayedRef = useRef(false);
    const searchPageInputRef = useRef<AnimatedTextInputRef | undefined>(undefined);
    useEffect(() => {
        if (!canListenPopState) {
            return;
        }

        /**
         * Handle browser back/forward navigation
         * When user clicks back/forward, we check the history state:
         * - If state has isSearchModalOpen=true, we show the modal
         * - If state has isSearchModalOpen=false or no state, we hide the modal
         * This creates a proper browser history integration where modal state
         * is part of the navigation history
         */
        const handlePopState = (event: PopStateEvent) => {
            const state = event.state as HistoryState | null;
            if (state?.isSearchModalOpen) {
                setIsSearchRouterDisplayed(true);
                searchRouterDisplayedRef.current = true;
            } else {
                setIsSearchRouterDisplayed(false);
                searchRouterDisplayedRef.current = false;
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const openSearchRouter = () => {
        if (isBrowserWithHistory) {
            window.history.pushState({isSearchModalOpen: true} satisfies HistoryState, '');
        }
        close(
            () => {
                openSearch(setIsSearchRouterDisplayed);
                searchRouterDisplayedRef.current = true;
            },
            false,
            true,
        );
    };

    const closeSearchRouter = () => {
        closeSearch(setIsSearchRouterDisplayed);
        searchRouterDisplayedRef.current = false;
        if (isBrowserWithHistory) {
            const state = window.history.state as HistoryState | null;
            if (state?.isSearchModalOpen) {
                window.history.replaceState({isSearchModalOpen: false} satisfies HistoryState, '');
            }
        }
    };

    const startSearchRouterOpenSpan = () => {
        startSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER, {
            name: CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER,
            op: CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER,
            attributes: {
                trigger: 'keyboard',
            },
        });
    };

    // There are callbacks that live outside of React render-loop and interact with SearchRouter
    // So we need a function that is based on ref to correctly open/close it
    // When user is on `/search` page we focus the Input instead of showing router
    const toggleSearch = () => {
        const searchFullScreenRoutes = navigationRef.getRootState()?.routes.findLast((route) => route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
        const lastRoute = searchFullScreenRoutes?.state?.routes?.at(-1);
        const isUserOnSearchPage = isSearchTopmostFullScreenRoute() && lastRoute?.name === SCREENS.SEARCH.ROOT;

        if (isUserOnSearchPage && searchPageInputRef.current) {
            if (searchPageInputRef.current.isFocused()) {
                searchPageInputRef.current.blur();
            } else {
                startSearchRouterOpenSpan();
                searchPageInputRef.current.focus();
            }
        } else if (searchRouterDisplayedRef.current) {
            closeSearchRouter();
        } else {
            startSearchRouterOpenSpan();
            openSearchRouter();
        }
    };

    const registerSearchPageInput = (ref: AnimatedTextInputRef) => {
        searchPageInputRef.current = ref;
    };

    const unregisterSearchPageInput = () => {
        searchPageInputRef.current = undefined;
    };

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const actionsContextValue = {
        openSearchRouter,
        closeSearchRouter,
        toggleSearch,
        registerSearchPageInput,
        unregisterSearchPageInput,
    };

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const stateContextValue = {isSearchRouterDisplayed};

    return (
        <SearchRouterActionsContext.Provider value={actionsContextValue}>
            <SearchRouterStateContext.Provider value={stateContextValue}>{children}</SearchRouterStateContext.Provider>
        </SearchRouterActionsContext.Provider>
    );
}

function useSearchRouterState() {
    return useContext(SearchRouterStateContext);
}

function useSearchRouterActions() {
    return useContext(SearchRouterActionsContext);
}

export {SearchRouterContextProvider, useSearchRouterState, useSearchRouterActions};
