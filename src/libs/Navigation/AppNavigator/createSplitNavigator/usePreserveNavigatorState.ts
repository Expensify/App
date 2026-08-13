import NAVIGATORS from '@src/NAVIGATORS';

import type {NavigationState, ParamListBase, RouteProp, StackNavigationState} from '@react-navigation/native';

import {useEffect} from 'react';

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

// Preserved states belong to the authenticated session. They must be dropped on logout so the next
// session can't restore them — e.g. restoreTabNavigatorRoutes reattaching a previous user's tab
// subtree to the public sign-in route (which shares the TAB_NAVIGATOR name).
const clearPreservedNavigatorStates = () => {
    for (const key of Object.keys(preservedNavigatorStates)) {
        delete preservedNavigatorStates[key];
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

export {getPreservedNavigatorState, setPreservedNavigatorState, cleanPreservedNavigatorStates, clearPreservedSearchNavigatorStates, clearPreservedNavigatorStates};
