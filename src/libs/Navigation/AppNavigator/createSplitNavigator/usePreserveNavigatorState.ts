import type {NavigationState, ParamListBase, RouteProp, StackNavigationState} from '@react-navigation/native';
import {useEffect} from 'react';
import NAVIGATORS from '@src/NAVIGATORS';

const preservedNavigatorStates: Record<string, NavigationState> = {};

// Collects every route key at every level of the navigation tree so that
// cleanPreservedNavigatorStates doesn't accidentally remove states for navigators
// that are nested inside TAB_NAVIGATOR (not at root level).
function collectAllRouteKeys(navState: NavigationState, keys: Set<string> = new Set<string>()): Set<string> {
    for (const route of navState.routes) {
        keys.add(route.key);
        if (route.state && route.state.stale === false) {
            collectAllRouteKeys(route.state as NavigationState, keys);
        }
    }
    return keys;
}

const cleanPreservedNavigatorStates = (state: NavigationState) => {
    const allRouteKeys = collectAllRouteKeys(state);

    for (const key of Object.keys(preservedNavigatorStates)) {
        if (!allRouteKeys.has(key)) {
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

const getPreservedNavigatorState = <T extends NavigationState = StackNavigationState<ParamListBase>>(key: string): T | undefined => preservedNavigatorStates[key] as T | undefined;

const setPreservedNavigatorState = (key: string, state: NavigationState) => {
    preservedNavigatorStates[key] = state;
};

function usePreserveNavigatorState(state: StackNavigationState<ParamListBase>, route: RouteProp<ParamListBase> | undefined) {
    useEffect(() => {
        if (!route) {
            return;
        }
        preservedNavigatorStates[route.key] = state;
    }, [route, state]);
}

export default usePreserveNavigatorState;

export {getPreservedNavigatorState, setPreservedNavigatorState, cleanPreservedNavigatorStates, clearPreservedSearchNavigatorStates};
