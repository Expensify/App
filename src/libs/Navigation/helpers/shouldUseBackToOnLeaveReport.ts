import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';

function normalizeRoute(route: string): string {
    return route
        .replaceAll(/\?.*/g, '')
        .replaceAll(/^\/+|\/+$/g, '')
        .replaceAll(/\/+/g, '/');
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

function shouldUseBackToOnLeaveReport(reportID: string | undefined, backTo?: Route): boolean {
    if (!backTo) {
        return false;
    }

    if (!reportID) {
        return true;
    }

    return !doesRouteTargetCurrentReport(backTo, reportID);
}

export default shouldUseBackToOnLeaveReport;
