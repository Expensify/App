import useSyncModalWithHistory from '@components/Modal/useSyncModalWithHistory';

import {cancelSpan, endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';

import {close} from '@userActions/Modal';

import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React, {useContext, useEffect, useRef, useState} from 'react';

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

// Mirrors whether the SearchRouter is open or mid-open at module level, so logic outside the provider
// tree (e.g. SearchRouterWarmup's idle callbacks) can check it without a context subscription.
let isSearchRouterOpenOrOpening = false;

function getIsSearchRouterOpenOrOpening() {
    return isSearchRouterOpenOrOpening;
}

function setIsSearchRouterOpenOrOpening(isOpenOrOpening: boolean) {
    isSearchRouterOpenOrOpening = isOpenOrOpening;
}

export {getIsSearchRouterOpenOrOpening, setIsSearchRouterOpenOrOpening};

type SearchRouterStateContextType = {
    isSearchRouterDisplayed: boolean;
};

type SearchRouterActionsContextType = {
    openSearchRouter: (query?: string, isFromSearchPage?: boolean) => void;
    /**
     * Closes the Search Router. On native, `afterTransition` runs after the modal transition. On web, callers that
     * need this behavior must use the SearchRouterModal wrapper, which runs the callback from `onModalHide`.
     */
    closeSearchRouter: (afterTransition?: () => void) => void;
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

    // The provider unmounts on sign-out without going through closeSearchRouter, so reset the module-level
    // flag to keep an open router from leaking the "open" state into the next session.
    useEffect(
        () => () => {
            isSearchRouterOpenOrOpening = false;
        },
        [],
    );

    // Registers a browser-history entry when the SearchRouter is open, so browser Back closes it
    // and browser Forward (after Back) reopens it. Uses the same back-guard mechanism as other modals
    // rather than direct window.history calls, avoiding misalignment with other guard-tracked overlays.
    useSyncModalWithHistory({
        isVisible: isSearchRouterDisplayed,
        shouldHandleNavigationBack: true,
        onClose: () => {
            isSearchRouterOpenOrOpening = false;
            closeSearch(setIsSearchRouterDisplayed);
            searchRouterDisplayedRef.current = false;
        },
        onOpen: () => {
            isSearchRouterOpenOrOpening = true;
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
        isSearchRouterOpenOrOpening = true;
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

    const closeSearchRouter = (afterTransition?: () => void) => {
        isSearchRouterOpenOrOpening = false;
        cancelSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER);
        cancelSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_MODAL_CLOSE_WAIT);
        cancelSpan(CONST.TELEMETRY.SPAN_SEARCH_PAGE_VISIBLE);
        cancelSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_LIST_RENDER);
        closeSearch(setIsSearchRouterDisplayed, afterTransition);
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
