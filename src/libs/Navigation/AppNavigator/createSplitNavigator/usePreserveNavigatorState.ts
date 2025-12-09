import type {NavigationState, ParamListBase, RouteProp, StackNavigationState} from '@react-navigation/native';
import {useEffect} from 'react';
import NAVIGATORS from '@src/NAVIGATORS';

const preservedNavigatorStates: Record<string, StackNavigationState<ParamListBase>> = {};

const cleanPreservedNavigatorStates = (state: NavigationState) => {
    const currentSplitNavigatorKeys = new Set(state.routes.map((route) => route.key));

    for (const key of Object.keys(preservedNavigatorStates)) {
        if (!currentSplitNavigatorKeys.has(key)) {
            delete preservedNavigatorStates[key];
        }
    }
};

const clearPreservedSearchNavigatorStates = () => {
    for (const key of Object.keys(preservedNavigatorStates)) {
        if (key.startsWith(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR)) {
            delete preservedNavigatorStates[key];
        }
    }
};

const getPreservedNavigatorState = (key: string) => preservedNavigatorStates[key];

function usePreserveNavigatorState(state: StackNavigationState<ParamListBase>, route: RouteProp<ParamListBase> | undefined) {
    useEffect(() => {
        if (!route) {
            return;
        }
        preservedNavigatorStates[route.key] = state;
    }, [route, state]);
}

export default usePreserveNavigatorState;

export {getPreservedNavigatorState, cleanPreservedNavigatorStates, clearPreservedSearchNavigatorStates};
