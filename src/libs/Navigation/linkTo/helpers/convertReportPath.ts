import type {NavigationPartialRoute, ReportsSplitNavigatorParamList, SearchReportParamList} from '@libs/Navigation/types';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

// We have two types of report screens. One is in the search central pane and the other is in the right hand pane.
// This functions converts the path to the opposite form.
function convertReportPath(focusedRouteFromPath: NavigationPartialRoute) {
    const params = focusedRouteFromPath.params as ReportsSplitNavigatorParamList[typeof SCREENS.REPORT] | SearchReportParamList[typeof SCREENS.SEARCH.REPORT_RHP];
    if (focusedRouteFromPath.name === SCREENS.REPORT) {
        return ROUTES.SEARCH_REPORT.getRoute({reportID: params.reportID, reportActionID: params.reportActionID});
    }

    return ROUTES.REPORT_WITH_ID.getRoute(params.reportID, params.reportActionID);
}

export default convertReportPath;
