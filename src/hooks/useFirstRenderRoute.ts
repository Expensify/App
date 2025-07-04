import {useEffect, useRef} from 'react';
import Navigation from '@navigation/Navigation';

/**
 * Custom hook for tracking the first route rendered by navigation and determining focus state.
 *
 * @param [focusExceptionRoutes] - A function or an array of route names to exclude when determining if the current route is focused.
 * @param [shouldConsiderParams=false] - If true, considers route parameters when determining the active route.
 * @returns An object containing the initial route and a state indicating if the current route is focused.
 */
function useFirstRenderRoute(focusExceptionRoutes?: ((initialRoute: string | null) => boolean) | string[], shouldConsiderParams = false) {
    const initialRoute = useRef<string | null>(null);

    useEffect(() => {
        Navigation.isNavigationReady().then(() => {
            if (initialRoute.current) {
                return;
            }
            initialRoute.current = shouldConsiderParams ? Navigation.getActiveRoute() : Navigation.getActiveRouteWithoutParams();
        });
    }, [shouldConsiderParams]);

    return {
        get isFocused() {
            const activeRoute = shouldConsiderParams ? Navigation.getActiveRoute() : Navigation.getActiveRouteWithoutParams();

            if (!focusExceptionRoutes || typeof focusExceptionRoutes === 'object') {
                const allRoutesToConsider = [initialRoute.current, ...(focusExceptionRoutes ?? [])];
                return allRoutesToConsider.includes(activeRoute);
            }
            return focusExceptionRoutes(initialRoute.current) || initialRoute.current === activeRoute;
        },
        get value() {
            return initialRoute.current;
        },
    };
}

export default useFirstRenderRoute;
