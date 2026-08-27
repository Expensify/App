import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import Navigation from '@libs/Navigation/Navigation';
import type {State} from '@libs/Navigation/types';

import type {Route} from '@src/ROUTES';

import {useFocusEffect, useStateForPath} from '@react-navigation/native';
import {useState} from 'react';

/**
 * Builds dynamic routes with `basePath` bound to the mounted route of the component using `useFocusEffect`,
 * so a link created during render remains tied to that screen's route even after another screen is stacked over it.
 *
 * A screen that mounts with another one already stacked over it never focuses, so the route state seeds the base
 * until focus can supply the full path.
 */
function useScreenBoundDynamicRoute(): (dynamicRouteSuffixWithParams: string) => Route {
    const stateForPath = useStateForPath();
    const [focusedBasePath, setFocusedBasePath] = useState<string | undefined>();
    useFocusEffect(() => setFocusedBasePath(Navigation.getActiveRoute()));

    const basePath = focusedBasePath ?? (stateForPath ? getPathFromState(stateForPath as State) : undefined);

    return (dynamicRouteSuffixWithParams: string) => createDynamicRoute(dynamicRouteSuffixWithParams, basePath);
}

export default useScreenBoundDynamicRoute;
