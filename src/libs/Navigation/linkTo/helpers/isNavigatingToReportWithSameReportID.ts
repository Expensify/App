import type {NavigationPartialRoute, ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

// Report screen is a specific case. We want to PUSH if the reportID is different.
// But if only the reportActionID is different we want to NAVIGATE.
// We don't want to push report with the same reportID on the browser history stack.
function isNavigatingToReportWithSameReportID(currentRoute: NavigationPartialRoute, newRoute: NavigationPartialRoute) {
    if (currentRoute.name !== SCREENS.REPORT || newRoute.name !== SCREENS.REPORT) {
        return false;
    }

    const currentParams = currentRoute.params as ReportsSplitNavigatorParamList[typeof SCREENS.REPORT];
    type NewType = ReportsSplitNavigatorParamList;

    const newParams = newRoute?.params as NewType[typeof SCREENS.REPORT];

    return currentParams.reportID === newParams.reportID;
}

export default isNavigatingToReportWithSameReportID;
