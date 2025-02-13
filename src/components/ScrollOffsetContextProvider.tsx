import type {ParamListBase} from '@react-navigation/native';
import React, {createContext, useCallback, useEffect, useMemo, useRef} from 'react';
import {useOnyx} from 'react-native-onyx';
import usePrevious from '@hooks/usePrevious';
import {isSidebarScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {NavigationPartialRoute, State} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

type ScrollOffsetContextValue = {
    /** Save scroll offset of flashlist on given screen */
    saveScrollOffset: (route: PlatformStackRouteProp<ParamListBase>, scrollOffset: number) => void;

    /** Get scroll offset value for given screen */
    getScrollOffset: (route: PlatformStackRouteProp<ParamListBase>) => number | undefined;

    /** Save scroll index of flashlist on given screen */
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

/** This function is prepared to work with HOME screens. May need modification if we want to handle other types of screens. */
function getKey(route: PlatformStackRouteProp<ParamListBase> | NavigationPartialRoute): string {
    if (route.params && 'policyID' in route.params && typeof route.params.policyID === 'string') {
        return `${route.name}-${route.params.policyID}`;
    }
    return `${route.name}-global`;
}

function ScrollOffsetContextProvider({children}: ScrollOffsetContextProviderProps) {
    const [priorityMode] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE);
    const scrollOffsetsRef = useRef<Record<string, number>>({});
    const previousPriorityMode = usePrevious(priorityMode);

    useEffect(() => {
        if (previousPriorityMode === null || previousPriorityMode === priorityMode) {
            return;
        }

        // If the priority mode changes, we need to clear the scroll offsets for the home screens because it affects the size of the elements and scroll positions wouldn't be correct.
        for (const key of Object.keys(scrollOffsetsRef.current)) {
            if (key.includes(SCREENS.HOME)) {
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
        const scrollOffsetkeysOfExistingScreens = sidebarRoutes.map((route) => getKey(route));
        for (const key of Object.keys(scrollOffsetsRef.current)) {
            if (!scrollOffsetkeysOfExistingScreens.includes(key)) {
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

export type {ScrollOffsetContextProviderProps, ScrollOffsetContextValue};
