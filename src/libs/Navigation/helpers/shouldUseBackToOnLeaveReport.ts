import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';

function normalizeRoute(route: string): string {
    return route
        .replaceAll(/\?.*/g, '')
        .replaceAll(/^\/+|\/+$/g, '')
        .replaceAll(/\/+/g, '/');
}

function getNestedBackToRoute(route: string): Route | undefined {
    const [, queryString = ''] = route.split('?');

    if (!queryString) {
        return undefined;
    }

    const params = new URLSearchParams(queryString);
    const encodedBackTo = params.get('backTo');

    if (!encodedBackTo) {
        return undefined;
    }

    return encodedBackTo as Route;
}

function doesRouteTargetCurrentReport(route: string, reportID: string): boolean {
    const normalizedRoute = normalizeRoute(route);
    const currentReportRoutes = [
        ROUTES.REPORT_WITH_ID.getRoute(reportID),
        ROUTES.SEARCH_REPORT.getRoute({reportID}),
        ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID}),
        ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID}),
    ].map(normalizeRoute);

    return currentReportRoutes.some((currentReportRoute) => normalizedRoute === currentReportRoute || normalizedRoute.startsWith(`${currentReportRoute}/`));
}

function getBackToOnLeaveReport(reportID: string | undefined, backTo?: Route): Route | undefined {
    if (!backTo) {
        return undefined;
    }

    const normalizedBackTo = normalizeRoute(backTo);
    const isSearchRoute = normalizedBackTo.startsWith(ROUTES.SEARCH_ROOT.route);

    if (isSearchRoute) {
        if (!reportID || !doesRouteTargetCurrentReport(backTo, reportID)) {
            return backTo;
        }

        return getNestedBackToRoute(backTo) ?? backTo;
    }

    if (!reportID) {
        return backTo;
    }

    if (doesRouteTargetCurrentReport(backTo, reportID)) {
        return undefined;
    }

    return backTo;
}

function shouldUseBackToOnLeaveReport(reportID: string | undefined, backTo?: Route): boolean {
    return !!getBackToOnLeaveReport(reportID, backTo);
}

export {getBackToOnLeaveReport};
export default shouldUseBackToOnLeaveReport;
