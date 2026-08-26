import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import type {State} from '@libs/Navigation/types';

import type {Route} from '@src/ROUTES';

import {useStateForPath} from '@react-navigation/core';

/**
 * Builds dynamic routes against the screen this component is mounted on rather than the active route, so a link
 * created during render still resolves once another screen is stacked over it.
 *
 * `useStateForPath` is used over `useRoutePath` because the latter throws outside a navigator screen; the base
 * falls back to the active route there.
 */
function useScreenBoundDynamicRoute(): (dynamicRouteSuffixWithParams: string) => Route {
    const state = useStateForPath();
    const basePath = state ? getPathFromState(state as State) : undefined;

    return (dynamicRouteSuffixWithParams: string) => createDynamicRoute(dynamicRouteSuffixWithParams, basePath);
}

export default useScreenBoundDynamicRoute;
