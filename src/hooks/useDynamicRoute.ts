import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import type {State} from '@libs/Navigation/types';

import type {Route} from '@src/ROUTES';

import {useStateForPath} from '@react-navigation/core';

/**
 * Binds a dynamic route to the component's own screen instead of the active route, so a link built during render
 * still resolves once another screen is stacked over it.
 *
 * Uses `useStateForPath` rather than `useRoutePath` because the latter throws when the component renders outside a
 * navigator screen, which shared components legitimately do. There the base falls back to the active route.
 */
function useDynamicRoute(): (dynamicRouteSuffixWithParams: string) => Route {
    const state = useStateForPath();
    const basePath = state ? getPathFromState(state as State) : undefined;

    return (dynamicRouteSuffixWithParams: string) => createDynamicRoute(dynamicRouteSuffixWithParams, basePath);
}

export default useDynamicRoute;
