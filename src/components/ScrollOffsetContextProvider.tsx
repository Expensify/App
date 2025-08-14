import type {ParamListBase} from '@react-navigation/native';
import React, {createContext, useCallback, useEffect, useMemo, useRef} from 'react';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import {isSidebarScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {NavigationPartialRoute, State} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

type ScrollOffsetContextValue = {
    /** Save scroll offset of FlashList on given screen */
    saveScrollOffset: (route: PlatformStackRouteProp<ParamListBase>, scrollOffset: number) => void;

    /** Get scroll offset value for given screen */
    getScrollOffset: (route: PlatformStackRouteProp<ParamListBase>) => number | undefined;

    /** Save scroll index of FlashList on given screen */
    saveScrollIndex: (route: PlatformStackRouteProp<ParamListBase>, scrollIndex: number) => void;

    /** Get scroll index value for given screen */
    getScrollIndex: (route: PlatformStackRouteProp<ParamListBase>) => number | undefined;

    /** Clean scroll offsets of screen that aren't anymore in the state */
    cleanStaleScrollOffsets: (state: State) => void;
};

type ScrollOffsetContextProviderProps = {
    /** Actual content wrapped by this component */
    children: React.ReactNode;
};

const defaultValue: ScrollOffsetContextValue = {
    saveScrollOffset: () => {},
    getScrollOffset: () => undefined,
    saveScrollIndex: () => {},
    getScrollIndex: () => undefined,
    cleanStaleScrollOffsets: () => {},
};

const ScrollOffsetContext = createContext<ScrollOffsetContextValue>(defaultValue);

/** This function is prepared to work with HOME and SEARCH screens. */
function getKey(route: PlatformStackRouteProp<ParamListBase> | NavigationPartialRoute): string {
    // Handle routes with direct policyID parameter (HOME screens)
    if (route.params && 'policyID' in route.params && typeof route.params.policyID === 'string') {
        return `${route.name}-${route.params.policyID}`;
    }

    // Handle SEARCH.ROOT screens where policyID might be embedded in the search query
    if (route.name === SCREENS.SEARCH.ROOT && route.params && 'q' in route.params && typeof route.params.q === 'string') {
        const policyIDMatch = route.params.q.match(/policyID:([^\\s]+)/);
        if (policyIDMatch) {
            return `${route.name}-${policyIDMatch[1]}`;
        }
    }

    // Handle other SEARCH screens with reportID parameter
    if (route.params && 'reportID' in route.params && typeof route.params.reportID === 'string') {
        return `${route.name}-${route.params.reportID}`;
    }

    return `${route.name}-global`;
}

function ScrollOffsetContextProvider({children}: ScrollOffsetContextProviderProps) {
    const [priorityMode] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE, {canBeMissing: true});
    const scrollOffsetsRef = useRef<Record<string, number>>({});
    const previousPriorityMode = usePrevious(priorityMode);

    useEffect(() => {
        if (previousPriorityMode === null || previousPriorityMode === priorityMode) {
            return;
        }

        // If the priority mode changes, we need to clear the scroll offsets for the home and search screens because it affects the size of the elements and scroll positions wouldn't be correct.
        for (const key of Object.keys(scrollOffsetsRef.current)) {
            if (key.includes(SCREENS.HOME) || key.includes(SCREENS.SEARCH.ROOT)) {
                delete scrollOffsetsRef.current[key];
            }
        }
    }, [priorityMode, previousPriorityMode]);

    const saveScrollOffset: ScrollOffsetContextValue['saveScrollOffset'] = useCallback((route, scrollOffset) => {
        scrollOffsetsRef.current[getKey(route)] = scrollOffset;
    }, []);

    const getScrollOffset: ScrollOffsetContextValue['getScrollOffset'] = useCallback((route) => {
        if (!scrollOffsetsRef.current) {
            return;
        }
        return scrollOffsetsRef.current[getKey(route)];
    }, []);

    const cleanStaleScrollOffsets: ScrollOffsetContextValue['cleanStaleScrollOffsets'] = useCallback((state) => {
        const sidebarRoutes = state.routes.filter((route) => isSidebarScreenName(route.name));

        const searchRoutes = state.routes.filter((route) => route.name === SCREENS.SEARCH.ROOT);
        const allRelevantRoutes = [...sidebarRoutes, ...searchRoutes];
        const scrollOffsetKeysOfExistingScreens = allRelevantRoutes.map((route) => getKey(route));

        for (const key of Object.keys(scrollOffsetsRef.current)) {
            const isSearchRoute = key.startsWith('Search_Root-');
            if (!isSearchRoute && !scrollOffsetKeysOfExistingScreens.includes(key)) {
                delete scrollOffsetsRef.current[key];
            }
        }
    }, []);

    const saveScrollIndex: ScrollOffsetContextValue['saveScrollIndex'] = useCallback((route, scrollIndex) => {
        scrollOffsetsRef.current[getKey(route)] = scrollIndex;
    }, []);

    const getScrollIndex: ScrollOffsetContextValue['getScrollIndex'] = useCallback((route) => {
        if (!scrollOffsetsRef.current) {
            return;
        }
        return scrollOffsetsRef.current[getKey(route)];
    }, []);

    const contextValue = useMemo(
        (): ScrollOffsetContextValue => ({
            saveScrollOffset,
            getScrollOffset,
            cleanStaleScrollOffsets,
            saveScrollIndex,
            getScrollIndex,
        }),
        [saveScrollOffset, getScrollOffset, cleanStaleScrollOffsets, saveScrollIndex, getScrollIndex],
    );

    return <ScrollOffsetContext.Provider value={contextValue}>{children}</ScrollOffsetContext.Provider>;
}

export default ScrollOffsetContextProvider;

export {ScrollOffsetContext};
