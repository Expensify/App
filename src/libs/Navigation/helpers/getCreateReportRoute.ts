import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import isSearchTopmostFullScreenRoute from './isSearchTopmostFullScreenRoute';
import isHomeTopmostFullScreenRoute from './isHomeTopmostFullScreenRoute';

type GetCreateReportRouteParams = {
    reportID: string;
    shouldUseNarrowLayout?: boolean;
};

function getCreateReportRoute({reportID, shouldUseNarrowLayout = false}: GetCreateReportRouteParams): string {
    const activeRoute = Navigation.getActiveRoute();

    if (isSearchTopmostFullScreenRoute()) {
        return ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID, backTo: activeRoute});
    }

    if (isHomeTopmostFullScreenRoute()) {
        return shouldUseNarrowLayout ? ROUTES.REPORT_WITH_ID.getRoute(reportID, undefined, undefined, ROUTES.HOME) : ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID, backTo: ROUTES.HOME});
    }

    return ROUTES.REPORT_WITH_ID.getRoute(reportID, undefined, undefined, activeRoute);
}

export default getCreateReportRoute;
