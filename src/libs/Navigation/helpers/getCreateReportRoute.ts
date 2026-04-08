import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import isHomeTopmostFullScreenRoute from './isHomeTopmostFullScreenRoute';
import isSearchTopmostFullScreenRoute from './isSearchTopmostFullScreenRoute';

type GetCreateReportRouteParams = {
    reportID: string;
    shouldUseNarrowLayout?: boolean;
};

function getReportsRootRoute() {
    return ROUTES.SEARCH_ROOT.getRoute({
        query: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT}),
    });
}

function getCreateReportRoute({reportID, shouldUseNarrowLayout = false}: GetCreateReportRouteParams): string {
    const activeRoute = Navigation.getActiveRoute();

    if (isSearchTopmostFullScreenRoute()) {
        return ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID, backTo: activeRoute});
    }

    if (isHomeTopmostFullScreenRoute()) {
        return ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({
            reportID,
            backTo: getReportsRootRoute(),
        });
    }

    return ROUTES.REPORT_WITH_ID.getRoute(reportID, undefined, undefined, activeRoute);
}

export default getCreateReportRoute;
