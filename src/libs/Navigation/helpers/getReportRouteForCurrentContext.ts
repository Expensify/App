import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {Route} from '@src/ROUTES';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
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
        return createDynamicRoute(DYNAMIC_ROUTES.SEARCH_REPORT_VIEW.getRoute(reportID));
    }

    return ROUTES.REPORT_WITH_ID.getRoute(reportID, undefined, undefined, backTo);
}

export default getReportRouteForCurrentContext;
