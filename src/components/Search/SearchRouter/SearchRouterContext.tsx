import React, {useContext, useEffect, useRef, useState} from 'react';
import {cancelSpan, endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import {close} from '@userActions/Modal';
import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {closeSearch, openSearch} from './toggleSearch';

// Module-level pending query used to seed the SearchRouter input on open.
// Set before opening, peeked during SearchRouter render, cleared on mount.
let pendingRouterQuery = '';

function peekPendingRouterQuery(): string {
    return pendingRouterQuery;
}

function clearPendingRouterQuery() {
    pendingRouterQuery = '';
}

export {peekPendingRouterQuery, clearPendingRouterQuery};

type SearchRouterStateContextType = {
    isSearchRouterDisplayed: boolean;
};

type SearchRouterActionsContextType = {
    openSearchRouter: (query?: string) => void;
    closeSearchRouter: () => void;
    toggleSearch: () => void;
};

type HistoryState = {
    isSearchModalOpen?: boolean;
};

const defaultSearchRouterActionsContext: SearchRouterActionsContextType = {
    openSearchRouter: () => {},
    closeSearchRouter: () => {},
    toggleSearch: () => {},
};

const SearchRouterStateContext = React.createContext<SearchRouterStateContextType>({isSearchRouterDisplayed: false});

const SearchRouterActionsContext = React.createContext<SearchRouterActionsContextType>(defaultSearchRouterActionsContext);

const isBrowserWithHistory = typeof window !== 'undefined' && typeof window.history !== 'undefined';
const canListenPopState = typeof window !== 'undefined' && typeof window.addEventListener === 'function';

function SearchRouterContextProvider({children}: ChildrenProps) {
    const [isSearchRouterDisplayed, setIsSearchRouterDisplayed] = useState(false);
    const searchRouterDisplayedRef = useRef(false);
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

    const startListRenderSpan = () => {
        startSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_LIST_RENDER, {
            name: CONST.TELEMETRY.SPAN_SEARCH_ROUTER_LIST_RENDER,
            op: 'ui.render',
            parentSpan: getSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER),
        });
    };

    const openSearchRouter = (query?: string) => {
        pendingRouterQuery = query ?? '';
        if (isBrowserWithHistory) {
            window.history.pushState({isSearchModalOpen: true} satisfies HistoryState, '');
        }
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
        cancelSpan(CONST.TELEMETRY.SPAN_SEARCH_PAGE_VISIBLE);
        cancelSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_LIST_RENDER);
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
