import type {ParamListBase, RouteProp} from '@react-navigation/native';
import type {FlashList} from '@shopify/flash-list';
import React, {createContext, useCallback, useMemo, useRef} from 'react';
import type {NavigationPartialRoute, State} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';

type ScrollOffsetContextValue = {
    /** Save scroll offset of flashlist on given screen */
    saveScrollOffset: (route: RouteProp<ParamListBase>, scrollOffset: number) => void;

    /** Scroll to saved offset of given screen */
    scrollToOffset: (route: RouteProp<ParamListBase>, flashListRef: React.RefObject<FlashList<string>>) => void;

    /** Clean scroll offsets of screen that aren't anymore in the state */
    cleanStaleScrollOffsets: (state: State) => void;
};

type ScrollOffsetContextProviderProps = {
    /** Actual content wrapped by this component */
    children: React.ReactNode;
};

const defaultValue: ScrollOffsetContextValue = {
    saveScrollOffset: () => {},
    scrollToOffset: () => {},
    cleanStaleScrollOffsets: () => {},
};

const ScrollOffsetContext = createContext<ScrollOffsetContextValue>(defaultValue);

/** This function is prepared to work with HOME screens. May need modification if we want to handle other types of screens. */
function getKey(route: RouteProp<ParamListBase> | NavigationPartialRoute): string {
    if (route.params && 'policyID' in route.params && typeof route.params.policyID === 'string') {
        return `${route.name}-${route.params.policyID}`;
    }
    return `${route.name}-global`;
}

export default function ScrollOffsetContextProvider(props: ScrollOffsetContextProviderProps) {
    const scrollOffsetsRef = useRef<Record<string, number>>({});

    const saveScrollOffset: ScrollOffsetContextValue['saveScrollOffset'] = useCallback((route, scrollOffset) => {
        scrollOffsetsRef.current[getKey(route)] = scrollOffset;
    }, []);

    const scrollToOffset: ScrollOffsetContextValue['scrollToOffset'] = useCallback((route, flashListRef) => {
        const offset = scrollOffsetsRef.current[getKey(route)];

        if (!(offset && flashListRef.current)) {
            return;
        }

        // We need to use requestAnimationFrame to make sure it will scroll properly on iOS.
        requestAnimationFrame(() => {
            if (!(offset && flashListRef.current)) {
                return;
            }
            flashListRef.current.scrollToOffset({offset});
        });
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

    /**
     * The context this component exposes to child components
     * @returns currentReportID to share between central pane and LHN
     */
    const contextValue = useMemo(
        (): ScrollOffsetContextValue => ({
            saveScrollOffset,
            scrollToOffset,
            cleanStaleScrollOffsets,
        }),
        [saveScrollOffset, scrollToOffset, cleanStaleScrollOffsets],
    );

    return <ScrollOffsetContext.Provider value={contextValue}>{props.children}</ScrollOffsetContext.Provider>;
}

export {ScrollOffsetContext};

export type {ScrollOffsetContextProviderProps, ScrollOffsetContextValue};
