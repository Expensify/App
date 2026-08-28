import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import type {Route} from '@src/ROUTES';

import {NavigationRouteContext, useFocusEffect} from '@react-navigation/native';
import {useContext, useState} from 'react';

/**
 * Builds dynamic routes with `basePath` bound to the mounted route of the component using `useFocusEffect`,
 * so a link created during render remains tied to that screen's route even after another screen is stacked over it.
 *
 * A screen that mounts with another one already stacked over it never focuses, so the path the screen was matched
 * from seeds the base until focus can supply it. Read off the context rather than `useRoute`, which throws when the
 * component renders outside a screen.
 */
function useScreenBoundDynamicRoute(): (dynamicRouteSuffixWithParams: string) => Route {
    const route = useContext(NavigationRouteContext);
    const [focusedBasePath, setFocusedBasePath] = useState<string | undefined>();
    useFocusEffect(() => setFocusedBasePath(Navigation.getActiveRoute()));

    const basePath = focusedBasePath ?? route?.path;

    return (dynamicRouteSuffixWithParams: string) => createDynamicRoute(dynamicRouteSuffixWithParams, basePath);
}

export default useScreenBoundDynamicRoute;
