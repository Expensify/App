import {findFocusedRoute, getPathFromState as RNGetPathFromState} from '@react-navigation/native';
import type {NavigationState, PartialState} from '@react-navigation/routers';
import {linkingConfig} from '@libs/Navigation/linkingConfig';
import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';
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
