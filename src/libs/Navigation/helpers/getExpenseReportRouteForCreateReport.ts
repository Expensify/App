import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';

type CreateReportOrigin = 'home' | 'search' | 'default';

type GetExpenseReportRouteForCreateReportParams = {
    reportID: string;
    createReportOrigin?: CreateReportOrigin;
    createReportSourceRoute?: string;
    shouldUseNarrowLayout?: boolean;
};

const normalizeRoute = (route?: string) => {
    if (!route) {
        return undefined;
    }

    return route.startsWith('/') ? route.substring(1) : route;
};

function getSearchSourceRoute(createReportSourceRoute?: string) {
    const normalizedRoute = normalizeRoute(createReportSourceRoute);

    if (!normalizedRoute) {
        return ROUTES.SEARCH_ROOT.route;
    }

    const [, queryString = ''] = normalizedRoute.split('?');
    if (queryString) {
        const params = new URLSearchParams(queryString);
        const encodedBackTo = params.get('backTo');

        if (encodedBackTo) {
            const decodedBackTo = normalizeRoute(decodeURIComponent(encodedBackTo));
            if (decodedBackTo?.startsWith(ROUTES.SEARCH_ROOT.route)) {
                return decodedBackTo;
            }
        }
    }

    if (normalizedRoute.startsWith(ROUTES.SEARCH_ROOT.route)) {
        return normalizedRoute;
    }

    return ROUTES.SEARCH_ROOT.route;
}

function getExpenseReportRouteForCreateReport({
    reportID,
    createReportOrigin = 'default',
    createReportSourceRoute,
    shouldUseNarrowLayout = false,
}: GetExpenseReportRouteForCreateReportParams): Route {
    if (createReportOrigin === 'search') {
        return ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({
            reportID,
            backTo: getSearchSourceRoute(createReportSourceRoute),
        });
    }

    if (createReportOrigin === 'home') {
        return shouldUseNarrowLayout ? ROUTES.REPORT_WITH_ID.getRoute(reportID, undefined, undefined, ROUTES.HOME) : ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID, backTo: ROUTES.HOME});
    }

    return ROUTES.REPORT_WITH_ID.getRoute(reportID, undefined, undefined, createReportSourceRoute);
}

export default getExpenseReportRouteForCreateReport;
