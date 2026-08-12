import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import type {LinkToOptions} from './linkTo/types';

import createDynamicRoute from './dynamicRoutesUtils/createDynamicRoute';
import isSearchTopmostFullScreenRoute from './isSearchTopmostFullScreenRoute';

type GetCreateReportRouteParams = {
    reportID: string;
};

function getReportsRootRoute() {
    return ROUTES.SEARCH_ROOT.getRoute({
        query: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT}),
    });
}

function navigateToCreateReportWorkspaceSelection(options?: LinkToOptions) {
    Navigation.navigate(getReportsRootRoute(), options);
    Navigation.setNavigationActionToMicrotaskQueue(() => {
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.NEW_REPORT_WORKSPACE_SELECTION.path));
    });
}

/**
 * Opens a newly created report from the Reports page context so back navigation returns to Reports instead of Inbox.
 */
function navigateToCreatedReportInReports(reportID: string, options?: LinkToOptions) {
    const reportsRootRoute = getReportsRootRoute();
    Navigation.navigate(reportsRootRoute, options);
    Navigation.setNavigationActionToMicrotaskQueue(() => {
        Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID, backTo: reportsRootRoute}));
    });
}

function getCreateReportRoute({reportID}: GetCreateReportRouteParams): Route {
    const activeRoute = Navigation.getActiveRoute();

    if (isSearchTopmostFullScreenRoute()) {
        return ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID, backTo: activeRoute});
    }

    return ROUTES.REPORT_WITH_ID.getRoute(reportID, undefined, undefined, activeRoute);
}

export default getCreateReportRoute;
export {getReportsRootRoute, navigateToCreatedReportInReports, navigateToCreateReportWorkspaceSelection};
