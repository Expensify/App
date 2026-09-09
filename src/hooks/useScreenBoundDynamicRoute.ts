import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import type {Route} from '@src/ROUTES';

import {NavigationRouteContext, useFocusEffect} from '@react-navigation/native';
import {useContext, useState} from 'react';

/**
 * Builds dynamic routes against the route of the screen that owns the component, so a link created during render
 * stays tied to that screen even after another one is stacked over it.
 *
 * The path a screen was matched from is the base whenever it has one. Screens reached without a matched path fall
 * back to the active route latched on focus. Read the route off the context rather than `useRoute`, which throws
 * when the component renders outside a screen.
 */
function useScreenBoundDynamicRoute(): (dynamicRouteSuffixWithParams: string) => Route {
    const route = useContext(NavigationRouteContext);
    const [focusedBasePath, setFocusedBasePath] = useState<string | undefined>();
    useFocusEffect(() => {
        // An empty string means the navigation container is not ready yet, and a bare root drops the rest of the
        // path, so neither is worth latching until the next focus.
        const activeRoute = Navigation.getActiveRoute();
        if (!activeRoute || activeRoute === '/') {
            return;
        }
        setFocusedBasePath(activeRoute);
    });

    // The focus effect of a screen pushed into the RHP runs while the state is still mid-transition, where
    // getActiveRoute reports a dynamic screen as its suffix alone (`/category/Name`), so the matched path wins.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const basePath = route?.path || focusedBasePath;

    return (dynamicRouteSuffixWithParams: string) => createDynamicRoute(dynamicRouteSuffixWithParams, basePath);
}

export default useScreenBoundDynamicRoute;
