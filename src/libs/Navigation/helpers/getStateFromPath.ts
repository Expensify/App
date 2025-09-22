import type {NavigationState, PartialState} from '@react-navigation/native';
import {getStateFromPath as RNGetStateFromPath} from '@react-navigation/native';
import {linkingConfig} from '@libs/Navigation/linkingConfig';
import type {Route} from '@src/ROUTES';
import addVerifyAccountRoute from './addVerifyAccountRoute';
import getMatchingNewRoute from './getMatchingNewRoute';

/**
 * @param path - The path to parse
 * @returns - It's possible that there is no navigation action for the given path
 */
function getStateFromPath(path: Route): PartialState<NavigationState> {
    const normalizedPath = !path.startsWith('/') ? `/${path}` : path;
    const normalizedPathAfterRedirection = getMatchingNewRoute(normalizedPath) ?? normalizedPath;

    if (path.includes('/verify-account')) {
        const verifyAccountState = addVerifyAccountRoute(normalizedPath);
        return verifyAccountState;
    }

    // This function is used in the linkTo function where we want to use default getStateFromPath function.
    const state = RNGetStateFromPath(normalizedPathAfterRedirection, linkingConfig.config);

    if (!state) {
        throw new Error('Failed to parse the path to a navigation state.');
    }

    return state;
}

export default getStateFromPath;
