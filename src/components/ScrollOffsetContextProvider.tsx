import type {ParamListBase} from '@react-navigation/native';
import React, {createContext, useCallback, useEffect, useMemo, useRef} from 'react';
import {withOnyx} from 'react-native-onyx';
import usePrevious from '@hooks/usePrevious';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {NavigationPartialRoute, State} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {PriorityMode} from '@src/types/onyx';

type ScrollOffsetContextValue = {
    /** Save scroll offset of flashlist on given screen */
    saveScrollOffset: (route: PlatformStackRouteProp<ParamListBase>, scrollOffset: number) => void;

    /** Get scroll offset value for given screen */
    getScrollOffset: (route: PlatformStackRouteProp<ParamListBase>) => number | undefined;

    /** Clean scroll offsets of screen that aren't anymore in the state */
    cleanStaleScrollOffsets: (state: State) => void;
};

type ScrollOffsetContextProviderOnyxProps = {
    /** The chat priority mode */
    priorityMode: PriorityMode;
};

type ScrollOffsetContextProviderProps = ScrollOffsetContextProviderOnyxProps & {
    /** Actual content wrapped by this component */
    children: React.ReactNode;
};

const defaultValue: ScrollOffsetContextValue = {
    saveScrollOffset: () => {},
    getScrollOffset: () => undefined,
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

function ScrollOffsetContextProvider({children, priorityMode}: ScrollOffsetContextProviderProps) {
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
        const bottomTabNavigator = state.routes.find((route) => route.name === NAVIGATORS.BOTTOM_TAB_NAVIGATOR);
        if (bottomTabNavigator?.state && 'routes' in bottomTabNavigator.state) {
            const bottomTabNavigatorRoutes = bottomTabNavigator.state.routes;
            const scrollOffsetkeysOfExistingScreens = bottomTabNavigatorRoutes.map((route) => getKey(route));
            for (const key of Object.keys(scrollOffsetsRef.current)) {
                if (!scrollOffsetkeysOfExistingScreens.includes(key)) {
                    delete scrollOffsetsRef.current[key];
                }
            }
        }
    }, []);

    const contextValue = useMemo(
        (): ScrollOffsetContextValue => ({
            saveScrollOffset,
            getScrollOffset,
            cleanStaleScrollOffsets,
        }),
        [saveScrollOffset, getScrollOffset, cleanStaleScrollOffsets],
    );

    return <ScrollOffsetContext.Provider value={contextValue}>{children}</ScrollOffsetContext.Provider>;
}

export default withOnyx<ScrollOffsetContextProviderProps, ScrollOffsetContextProviderOnyxProps>({
    priorityMode: {
        key: ONYXKEYS.NVP_PRIORITY_MODE,
    },
})(ScrollOffsetContextProvider);

export {ScrollOffsetContext};

export type {ScrollOffsetContextProviderProps, ScrollOffsetContextValue};
