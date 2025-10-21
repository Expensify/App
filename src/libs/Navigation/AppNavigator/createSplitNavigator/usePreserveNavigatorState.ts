import type {NavigationState, ParamListBase, RouteProp, StackNavigationState} from '@react-navigation/native';
import NAVIGATORS from '@src/NAVIGATORS';
import {useEffect} from 'react';

const preservedNavigatorStates: Record<string, StackNavigationState<ParamListBase>> = {};

const cleanPreservedNavigatorStates = (state: NavigationState) => {
    const currentSplitNavigatorKeys = state.routes.map((route) => route.key);

    for (const key of Object.keys(preservedNavigatorStates)) {
        if (!currentSplitNavigatorKeys.includes(key)) {
            delete preservedNavigatorStates[key];
        }
    }
};

const clearPreservedSearchNavigatorStates = () => {
    for (const key of Object.keys(preservedNavigatorStates)) {
        console.log(key);
        if (key.startsWith(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR)) {
            delete preservedNavigatorStates[key];
        }
    }
}

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
