import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import type {Route} from '@src/ROUTES';

import {useFocusEffect} from '@react-navigation/native';
import {useState} from 'react';

/**
 * Builds dynamic routes with `basePath` bound to the mounted route of the component using `useFocusEffect`,
 * so a link created during render remains tied to that screen's route even after another screen is stacked over it.
 */
function useScreenBoundDynamicRoute(): (dynamicRouteSuffixWithParams: string) => Route {
    const [basePath, setBasePath] = useState<string | undefined>();
    useFocusEffect(() => setBasePath(Navigation.getActiveRoute()));

    return (dynamicRouteSuffixWithParams: string) => createDynamicRoute(dynamicRouteSuffixWithParams, basePath);
}

export default useScreenBoundDynamicRoute;
