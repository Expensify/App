import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import type {Route} from '@src/ROUTES';

import type {NavigationState, PartialState} from '@react-navigation/native';

import {NavigationRouteContext, useFocusEffect} from '@react-navigation/native';
import {useContext, useState} from 'react';

function isRouteInState(state: NavigationState | PartialState<NavigationState> | undefined, key: string): boolean {
    return !!state?.routes.some((route) => route.key === key || isRouteInState(route.state, key));
}

/**
 * Builds dynamic routes against the screen that owns the component, seeding the base from the matched path until focus
 * supplies the active route, so a link built during render survives another screen being stacked over it. The route
 * is read off `NavigationRouteContext` because `useRoute` throws outside a screen.
 */
function useScreenBoundDynamicRoute(): (dynamicRouteSuffixWithParams: string) => Route {
    const route = useContext(NavigationRouteContext);
    const [focusedBasePath, setFocusedBasePath] = useState<string | undefined>();
    useFocusEffect(() => {
        const latch = () => {
            const activeRoute = Navigation.getActiveRoute();
            if (!activeRoute || activeRoute === '/') {
                return;
            }
            setFocusedBasePath(activeRoute);
        };
        // getActiveRoute returns an empty string before the container is ready, and until the root state carries a
        // freshly mounted navigator it renders the screen as the bare root or its dynamic suffix alone. Latch only once
        // this route is in the root state; isReady keeps getRootState quiet on an unattached ref.
        const key = route?.key;
        if (!key || !navigationRef.isReady() || isRouteInState(navigationRef.getRootState(), key)) {
            latch();
            return;
        }
        const unsubscribe = navigationRef.addListener('state', () => {
            if (!isRouteInState(navigationRef.getRootState(), key)) {
                return;
            }
            unsubscribe();
            latch();
        });
        return unsubscribe;
    });

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const basePath = focusedBasePath || route?.path;

    return (dynamicRouteSuffixWithParams: string) => createDynamicRoute(dynamicRouteSuffixWithParams, basePath);
}

export default useScreenBoundDynamicRoute;
