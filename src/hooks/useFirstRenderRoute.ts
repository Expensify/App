import {useEffect, useRef} from 'react';
import Navigation from '@navigation/Navigation';

function useFirstRenderRoute(focusExceptionRoutes?: string[]) {
    const initialRoute = useRef<string | null>(null);

    useEffect(() => {
        Navigation.isNavigationReady().then(() => {
            initialRoute.current = Navigation.getActiveRouteWithoutParams();
        });
    }, []);

    return {
        get isFocused() {
            const activeRoute = Navigation.getActiveRouteWithoutParams();
            const allRoutesToConsider = [initialRoute.current, ...(focusExceptionRoutes ?? [])];
            return allRoutesToConsider.includes(activeRoute);
        },
        get value() {
            return initialRoute.current;
        },
    };
}

export default useFirstRenderRoute;
