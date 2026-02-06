import {findFocusedRoute, getPathFromState as RNGetPathFromState} from '@react-navigation/native';
import type {NavigationState, PartialState} from '@react-navigation/routers';
import {linkingConfig} from '@libs/Navigation/linkingConfig';
import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';

type State = NavigationState | Omit<PartialState<NavigationState>, 'stale'>;

/**
 * Checks if a screen name is a dynamic route screen
 */
function isDynamicRouteScreen(screenName: Screen): boolean {
    for (const {path} of Object.values(DYNAMIC_ROUTES)) {
        if (normalizedConfigs[screenName]?.path === path) {
            return true;
        }
    }
    return false;
}

const getPathFromState = (state: State): string => {
    const focusedRoute = findFocusedRoute(state);
    const screenName = focusedRoute?.name ?? '';

    // Handle dynamic route screens that require special path that is placed in state
    if (isDynamicRouteScreen(screenName as Screen) && focusedRoute?.path) {
        return focusedRoute.path;
    }

    // For regular routes, use React Navigation's default path generation
    const path = RNGetPathFromState(state, linkingConfig.config);

    return path;
};

export default getPathFromState;
