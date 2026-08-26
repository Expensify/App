import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import type {Route} from '@src/ROUTES';

import {useFocusEffect} from '@react-navigation/native';
import {useState} from 'react';

/**
 * Builds dynamic routes against the route this screen was last focused on, so a link created during render still
 * resolves once another screen is stacked over it. Focus is used rather than the route state because `useRoutePath`
 * returns only the dynamic suffix on a screen that is itself a dynamic route.
 */
function useScreenBoundDynamicRoute(): (dynamicRouteSuffixWithParams: string) => Route {
    const [basePath, setBasePath] = useState<string | undefined>();
    useFocusEffect(() => setBasePath(Navigation.getActiveRoute()));

    return (dynamicRouteSuffixWithParams: string) => createDynamicRoute(dynamicRouteSuffixWithParams, basePath);
}

export default useScreenBoundDynamicRoute;
