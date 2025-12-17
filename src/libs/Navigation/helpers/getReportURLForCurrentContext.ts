import {getEnvironmentURL} from '@libs/Environment/Environment';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import isSearchTopmostFullScreenRoute from './isSearchTopmostFullScreenRoute';

let environmentURL: string;
getEnvironmentURL().then((url: string) => (environmentURL = url));

/**
 * Generates a URL for a report that respects the current navigation context.
 * When in a search context, includes backTo parameter to preserve search state.
 * Otherwise, returns a simple report URL.
 */
function getReportURLForCurrentContext(reportID: string | undefined): string {
    if (!reportID) {
        return `${environmentURL}/r/`;
    }
    const isInSearchContext = isSearchTopmostFullScreenRoute();
    if (!isInSearchContext) {
        return `${environmentURL}/${ROUTES.REPORT_WITH_ID.getRoute(reportID)}`;
    }

    // Navigation can return routes with a leading slash or missing when still mounting.
    // Normalize everything to match the path shape used by ROUTES helpers.
    const normalizeRoute = (route?: string) => {
        if (!route) {
            return undefined;
        }
        return route.startsWith('/') ? route.substring(1) : route;
    };

    const activeRoute = normalizeRoute(Navigation.getActiveRoute());

    let backToRoute: string | undefined;

    if (activeRoute) {
        const [, queryString = ''] = activeRoute.split('?');
        if (queryString) {
            const params = new URLSearchParams(queryString);
            const encodedBackTo = params.get('backTo');
            if (encodedBackTo) {
                // Prefer the backTo param when present; it points to the exact search state we left.
                backToRoute = normalizeRoute(decodeURIComponent(encodedBackTo));
            }
        }

        if (!backToRoute && activeRoute.startsWith(ROUTES.SEARCH_ROOT.route)) {
            // Otherwise keep the current search route (preserves tab + filters) as the return target.
            backToRoute = activeRoute;
        }
    }

    if (!backToRoute?.startsWith(ROUTES.SEARCH_ROOT.route)) {
        // Fall back to the generic search home when we can't recover a valid route.
        backToRoute = ROUTES.SEARCH_ROOT.route;
    }

    const relativePath = ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID, backTo: backToRoute});
    return `${environmentURL}/${relativePath}`;
}

export default getReportURLForCurrentContext;
