import Navigation from '@libs/Navigation/Navigation';

import NAVIGATORS from '@src/NAVIGATORS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';

import getTopmostFullScreenRoute from './getTopmostFullScreenRoute';
import isSearchTopmostFullScreenRoute from './isSearchTopmostFullScreenRoute';

type GetReportRouteForCurrentContextParams = {
    reportID: string | undefined;
    isPendingCreation?: boolean;
};

function getReportRouteForCurrentContext({reportID, isPendingCreation = false}: GetReportRouteForCurrentContextParams): Route {
    if (!reportID) {
        return ROUTES.REPORT_WITH_ID.getRoute('');
    }

    // Reports opened from the Concierge page stay on it, and the report screen moves any that aren't Concierge conversations to the Inbox.
    // A report still being created opens in the Inbox, which keeps it waiting for the server.
    if (!isPendingCreation && getTopmostFullScreenRoute()?.name === NAVIGATORS.CONCIERGE_SPLIT_NAVIGATOR) {
        return ROUTES.CONCIERGE_CONVERSATION.getRoute(reportID);
    }

    const backTo = Navigation.getActiveRoute();
    if (isSearchTopmostFullScreenRoute() && !isPendingCreation) {
        return ROUTES.SEARCH_REPORT.getRoute({reportID, backTo});
    }

    return ROUTES.REPORT_WITH_ID.getRoute(reportID, undefined, undefined, backTo, undefined, isPendingCreation);
}

export default getReportRouteForCurrentContext;
