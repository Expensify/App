import {getEnvironmentURL} from '@libs/Environment/Environment';
import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import isSearchTopmostFullScreenRoute from './isSearchTopmostFullScreenRoute';

let environmentURL: string;
getEnvironmentURL().then((url: string) => (environmentURL = url));

// Static part of ROUTES.SEARCH_REPORT ('search/view/:reportID/:reportActionID?'), i.e. an expense opened in the search RHP
const SEARCH_REPORT_ROUTE_PREFIX = ROUTES.SEARCH_REPORT.route.slice(0, ROUTES.SEARCH_REPORT.route.indexOf(':'));

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
            const backTo = params.get('backTo');
            if (backTo) {
                // URLSearchParams.get() already decodes the value once. A raw "?" means it's already a usable route, and decoding
                // it again would unescape its nested backTo (e.g. after paging through expenses in the RHP), leaving duplicate
                // backTo keys in the URL that crash the app on back. Only decode when the value still looks encoded.
                const isAlreadyDecoded = backTo.includes('?');
                // Prefer the backTo param when present; it points to the exact search state we left.
                backToRoute = normalizeRoute(isAlreadyDecoded ? backTo : decodeURIComponent(backTo));
            }
        }

        // Paging through expenses with the carousel arrows stores the expense just left as backTo, so on an expense RHP
        // a backTo pointing to another expense is a sibling, not where the user came from. Return to the current
        // expense instead, otherwise going back from the linked report lands on that sibling.
        if (backToRoute?.startsWith(SEARCH_REPORT_ROUTE_PREFIX) && activeRoute.startsWith(SEARCH_REPORT_ROUTE_PREFIX)) {
            backToRoute = activeRoute;
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
