import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import isSearchTopmostFullScreenRoute from './isSearchTopmostFullScreenRoute';

type GetReportRouteForCurrentContextParams = {
    reportID: string | undefined;
    reportActionID?: string;
    backTo?: string;
};

function getReportRouteForCurrentContext({reportID, reportActionID, backTo}: GetReportRouteForCurrentContextParams): Route {
    const currentRoute = backTo ?? Navigation.getActiveRoute();

    if (isSearchTopmostFullScreenRoute()) {
        return ROUTES.SEARCH_REPORT.getRoute({reportID, reportActionID, backTo: currentRoute});
    }

    return ROUTES.REPORT_WITH_ID.getRoute(reportID, reportActionID, undefined, currentRoute);
}

export default getReportRouteForCurrentContext;
