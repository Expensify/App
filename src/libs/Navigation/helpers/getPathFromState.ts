import {findFocusedRoute, getPathFromState as RNGetPathFromState} from '@react-navigation/native';
import type {NavigationState, PartialState} from '@react-navigation/routers';
import {getRemappedNavigatorKey} from '@libs/Navigation/AppNavigator/createRootStackNavigator/useCustomRootStackNavigatorState/reuseNavigatorKey';
import {config, normalizedConfigs} from '@libs/Navigation/linkingConfig/config';
import type {DynamicRouteSuffix} from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';
import {dynamicRoutePaths} from './isDynamicRouteSuffix';

type State = NavigationState | Omit<PartialState<NavigationState>, 'stale'>;

/**
 * Checks if a screen name is a dynamic route screen
 */
function isDynamicRouteScreen(screenName: Screen): boolean {
    const screenPath = normalizedConfigs[screenName]?.path;

    if (!screenPath) {
        return false;
    }

    return dynamicRoutePaths.has(screenPath as DynamicRouteSuffix);
}

/**
 * When buildOptimizedRoutes remaps a new route (e.g. RSN-key3) to reuse an existing
 * mounted navigator (RSN-key1), the new route is never mounted under its own key and
 * its embedded state in the root navigation state remains undefined. This causes
 * getPathFromState to serialize route.params directly, producing a broken URL.
 *
 * This function patches the state by copying the mounted navigator's current state to
 * the logical (unmounted) route so URL generation can drill into the correct nested state.
 */
function patchStateWithRemappedStates(state: State): State {
    if (!('routes' in state) || !state.routes) {
        return state;
    }

    let changed = false;
    const routes = (state as NavigationState).routes;

    const patchedRoutes = routes.map((route) => {
        if (route.state) {
            return route;
        }

        const remappedKey = getRemappedNavigatorKey(route.key);
        if (!remappedKey) {
            return route;
        }

        const remappedRoute = routes.find((r) => r.key === remappedKey);
        if (!remappedRoute?.state) {
            return route;
        }

        changed = true;
        return {...route, state: remappedRoute.state};
    });

    if (!changed) {
        return state;
    }

    return {...(state as NavigationState), routes: patchedRoutes};
}

const getPathFromState = (state: State): string => {
    const patchedState = patchStateWithRemappedStates(state);

    const focusedRoute = findFocusedRoute(patchedState);
    const screenName = focusedRoute?.name ?? '';

    // Handle dynamic route screens that require special path that is placed in state
    if (isDynamicRouteScreen(screenName as Screen) && focusedRoute?.path) {
        return focusedRoute.path;
    }

    // For regular routes, use React Navigation's default path generation
    const path = RNGetPathFromState(patchedState, config);

    return path;
};

export default getPathFromState;
