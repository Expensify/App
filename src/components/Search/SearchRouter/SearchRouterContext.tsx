import React, {useContext, useRef, useState} from 'react';
import useSyncModalWithHistory from '@components/Modal/useSyncModalWithHistory';
import {cancelSpan, endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import {close} from '@userActions/Modal';
import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {closeSearch, openSearch} from './toggleSearch';

// Module-level pending query used to seed the SearchRouter input on open.
// Set before opening, peeked during SearchRouter render, cleared on mount.
let pendingRouterQuery = '';
let pendingIsFromSearchPageSearchButton = false;

function peekPendingRouterState() {
    return {query: pendingRouterQuery, isFromSearchPageSearchButton: pendingIsFromSearchPageSearchButton};
}

function clearPendingRouterState() {
    pendingRouterQuery = '';
    pendingIsFromSearchPageSearchButton = false;
}

export {peekPendingRouterState, clearPendingRouterState};

type SearchRouterStateContextType = {
    isSearchRouterDisplayed: boolean;
};

type SearchRouterActionsContextType = {
    openSearchRouter: (query?: string, isFromSearchPage?: boolean) => void;
    closeSearchRouter: () => void;
    toggleSearch: () => void;
};

const defaultSearchRouterActionsContext: SearchRouterActionsContextType = {
    openSearchRouter: () => {},
    closeSearchRouter: () => {},
    toggleSearch: () => {},
};

const SearchRouterStateContext = React.createContext<SearchRouterStateContextType>({isSearchRouterDisplayed: false});

const SearchRouterActionsContext = React.createContext<SearchRouterActionsContextType>(defaultSearchRouterActionsContext);

function SearchRouterContextProvider({children}: ChildrenProps) {
    const [isSearchRouterDisplayed, setIsSearchRouterDisplayed] = useState(false);
    const searchRouterDisplayedRef = useRef(false);

    // Registers a browser-history entry when the SearchRouter is open, so browser Back closes it
    // and browser Forward (after Back) reopens it. Uses the same sentinel mechanism as other modals
    // rather than direct window.history calls, avoiding misalignment with other sentinel-tracked overlays.
    useSyncModalWithHistory({
        isVisible: isSearchRouterDisplayed,
        shouldHandleNavigationBack: true,
        onClose: () => {
            closeSearch(setIsSearchRouterDisplayed);
            searchRouterDisplayedRef.current = false;
        },
        onOpen: () => {
            openSearch(setIsSearchRouterDisplayed);
            searchRouterDisplayedRef.current = true;
        },
    });

    const startListRenderSpan = () => {
        startSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_LIST_RENDER, {
            name: CONST.TELEMETRY.SPAN_SEARCH_ROUTER_LIST_RENDER,
            op: 'ui.render',
            parentSpan: getSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER),
        });
    };

    const openSearchRouter = (query?: string, isFromSearchPageSearchButton?: boolean) => {
        pendingRouterQuery = query ?? '';
        pendingIsFromSearchPageSearchButton = isFromSearchPageSearchButton ?? false;
        startSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_MODAL_CLOSE_WAIT, {
            name: CONST.TELEMETRY.SPAN_SEARCH_ROUTER_MODAL_CLOSE_WAIT,
            op: 'ui.modal.wait',
            parentSpan: getSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER),
        });
        close(
            () => {
                endSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_MODAL_CLOSE_WAIT);
                startListRenderSpan();
                openSearch(setIsSearchRouterDisplayed);
                searchRouterDisplayedRef.current = true;
            },
            false,
            true,
        );
    };

    const closeSearchRouter = () => {
        cancelSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER);
        cancelSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_MODAL_CLOSE_WAIT);
        cancelSpan(CONST.TELEMETRY.SPAN_SEARCH_PAGE_VISIBLE);
        cancelSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_LIST_RENDER);
        closeSearch(setIsSearchRouterDisplayed);
        searchRouterDisplayedRef.current = false;
    };

    const startSearchRouterOpenSpan = () => {
        startSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER, {
            name: CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER,
            op: CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER,
            attributes: {
                [CONST.TELEMETRY.ATTRIBUTE_TRIGGER]: 'keyboard',
            },
        });
    };

    // There are callbacks that live outside of React render-loop and interact with SearchRouter
    // So we need a function that is based on ref to correctly open/close it
    const toggleSearch = () => {
        if (searchRouterDisplayedRef.current) {
            closeSearchRouter();
        } else {
            startSearchRouterOpenSpan();
            openSearchRouter();
        }
    };

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const actionsContextValue = {
        openSearchRouter,
        closeSearchRouter,
        toggleSearch,
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
