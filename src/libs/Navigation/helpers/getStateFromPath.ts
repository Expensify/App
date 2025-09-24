import type {NavigationState, PartialState} from '@react-navigation/native';
import {findFocusedRoute, getStateFromPath as RNGetStateFromPath} from '@react-navigation/native';
import type {TupleToUnion} from 'type-fest';
import {linkingConfig} from '@libs/Navigation/linkingConfig';
import SCREEN_ACCESS_MAP from '@libs/Navigation/SCREEN_ACCESS_MAP';
import type {Route} from '@src/ROUTES';
import {VERIFY_ACCOUNT} from '@src/ROUTES';
import getMatchingNewRoute from './getMatchingNewRoute';
import getStateForVerifyAccountRoute from './getStateForVerifyAccountRoute';

/**
 * @param path - The path to parse
 * @returns - It's possible that there is no navigation action for the given path
 */
function getStateFromPath(path: Route): PartialState<NavigationState> {
    const normalizedPath = !path.startsWith('/') ? `/${path}` : path;
    const normalizedPathAfterRedirection = getMatchingNewRoute(normalizedPath) ?? normalizedPath;

    // In the future, this if will handle more components than just verify account
    if (path.includes(`/${VERIFY_ACCOUNT}`)) {
        const pathWithoutVerifyAccount = path.replace(`/${VERIFY_ACCOUNT}`, '');

        const focusedRoute = findFocusedRoute(getStateFromPath(pathWithoutVerifyAccount as Route) ?? {});
        // This condition ensures that verify account screen can only be accessed from allowed screens
        if (focusedRoute?.name && SCREEN_ACCESS_MAP.VERIFY_ACCOUNT.includes(focusedRoute.name as TupleToUnion<typeof SCREEN_ACCESS_MAP.VERIFY_ACCOUNT>)) {
            const verifyAccountState = getStateForVerifyAccountRoute(normalizedPath);
            // Return bare state that contains only verify account screen in the right modal navigator
            // The background screen will be added later by the navigation system
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
