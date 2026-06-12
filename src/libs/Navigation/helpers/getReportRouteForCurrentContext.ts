import Navigation from '@libs/Navigation/Navigation';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import isSearchTopmostFullScreenRoute from './isSearchTopmostFullScreenRoute';

type GetReportRouteForCurrentContextParams = {
    reportID: string | undefined;
};

function getReportRouteForCurrentContext({reportID}: GetReportRouteForCurrentContextParams): Route {
    if (!reportID) {
        return ROUTES.REPORT_WITH_ID.getRoute('');
    }

    const backTo = Navigation.getActiveRoute();
    if (isSearchTopmostFullScreenRoute()) {
        return ROUTES.SEARCH_REPORT.getRoute({reportID, backTo});
    }

    return ROUTES.REPORT_WITH_ID.getRoute(reportID, undefined, undefined, backTo);
}

export default getReportRouteForCurrentContext;
