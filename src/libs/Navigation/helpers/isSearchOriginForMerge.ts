import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import isSearchTopmostFullScreenRoute from './isSearchTopmostFullScreenRoute';

function normalizeRoute(route?: string): string | undefined {
    if (!route) {
        return undefined;
    }

    const decodedRoute = (() => {
        try {
            return decodeURIComponent(route);
        } catch {
            return route;
        }
    })();

    return decodedRoute.startsWith('/') ? decodedRoute.substring(1) : decodedRoute;
}

function isSearchOriginForMerge(routeName: string, backTo?: string): boolean {
    if (routeName !== SCREENS.RIGHT_MODAL.SEARCH_REPORT) {
        return false;
    }

    const normalizedBackTo = normalizeRoute(backTo);
    if (normalizedBackTo) {
        return normalizedBackTo.startsWith(ROUTES.SEARCH_ROOT.route);
    }

    return isSearchTopmostFullScreenRoute();
}

export default isSearchOriginForMerge;
