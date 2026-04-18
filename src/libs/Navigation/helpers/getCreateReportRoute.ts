import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import isSearchTopmostFullScreenRoute from './isSearchTopmostFullScreenRoute';
import type {LinkToOptions} from './linkTo/types';

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
        Navigation.navigate(ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute());
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
export {getReportsRootRoute, navigateToCreateReportWorkspaceSelection};
