import type {NavigationState, PartialState} from '@react-navigation/native';
import {findFocusedRoute, getStateFromPath as RNGetStateFromPath} from '@react-navigation/native';
import type {TupleToUnion} from 'type-fest';
import {linkingConfig} from '@libs/Navigation/linkingConfig';
import SCREEN_ACCESS_MAP from '@libs/Navigation/SCREEN_ACCESS_MAP';
import type {Route} from '@src/ROUTES';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {DynamicRoute} from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';
import getMatchingNewRoute from './getMatchingNewRoute';
import getStateForDynamicRoute from './getStateForDynamicRoute';

/**
 * @param path - The path to parse
 * @returns - It's possible that there is no navigation action for the given path
 */
function getStateFromPath(path: Route): PartialState<NavigationState> {
    const normalizedPath = !path.startsWith('/') ? `/${path}` : path;
    const normalizedPathAfterRedirection = getMatchingNewRoute(normalizedPath) ?? normalizedPath;

    const lastSuffix = path.split('?').at(0)?.split('/').pop() ?? '';
    if (Object.values(DYNAMIC_ROUTES).includes(lastSuffix as DynamicRoute)) {
        const pathWithoutDynamicSuffix = path.replace(`/${lastSuffix}`, '');
        const DYNAMIC_ROUTE = (Object.keys(DYNAMIC_ROUTES) as Array<keyof typeof DYNAMIC_ROUTES>).find((key) => DYNAMIC_ROUTES[key] === lastSuffix) ?? 'VERIFY_ACCOUNT';

        const focusedRoute = findFocusedRoute(getStateFromPath(pathWithoutDynamicSuffix as Route) ?? {});
        if (focusedRoute?.name && SCREEN_ACCESS_MAP[DYNAMIC_ROUTE].includes(focusedRoute.name as Screen)) {
            const verifyAccountState = getStateForDynamicRoute(normalizedPath, DYNAMIC_ROUTE);
            return verifyAccountState;
        }
    }

    // This function is used in the linkTo function where we want to use default getStateFromPath function.
    const state = RNGetStateFromPath(normalizedPathAfterRedirection, linkingConfig.config);

    if (!state) {
        throw new Error('Failed to parse the path to a navigation state.');
    }

    return state;
}

export default getStateFromPath;
