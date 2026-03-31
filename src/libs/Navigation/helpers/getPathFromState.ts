import {findFocusedRoute, getPathFromState as RNGetPathFromState} from '@react-navigation/native';
import type {NavigationState, PartialState} from '@react-navigation/routers';
import {config, normalizedConfigs} from '@libs/Navigation/linkingConfig/config';
import type {DynamicRouteSuffix} from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';
import SCREENS from '@src/SCREENS';
import {dynamicRoutePaths} from './dynamicRoutesUtils/isDynamicRouteSuffix';

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

    // When PublicScreens renders SCREENS.HOME at root level (not nested in TabNavigator),
    // return '/' so the URL after logout is clean instead of '/Home'.
    if (state.routes?.length === 1 && state.routes[0]?.name === SCREENS.HOME) {
        return '/';
    }

    // Handle dynamic route screens that require special path that is placed in state
    if (isDynamicRouteScreen(screenName as Screen) && focusedRoute?.path) {
        return focusedRoute.path;
    }

    // For regular routes, use React Navigation's default path generation
    const path = RNGetPathFromState(state, config);

    return path;
};

export default getPathFromState;
