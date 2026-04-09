import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type GetCreateReportRouteParams = {
    reportID: string;
    searchBackTo?: string;
    fallbackBackTo?: string;
    shouldOpenInReports?: boolean;
    shouldOpenInSearch?: boolean;
};

function getDefaultReportsPageRoute() {
    return ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT})});
}

function getCreateReportRoute({reportID, searchBackTo, fallbackBackTo, shouldOpenInReports = false, shouldOpenInSearch = false}: GetCreateReportRouteParams) {
    if (shouldOpenInSearch) {
        return searchBackTo ? ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID, backTo: searchBackTo}) : ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID});
    }

    if (shouldOpenInReports) {
        const reportsBackTo = searchBackTo?.startsWith(ROUTES.SEARCH_ROOT.route) ? searchBackTo : getDefaultReportsPageRoute();
        return ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID, backTo: reportsBackTo});
    }

    return ROUTES.REPORT_WITH_ID.getRoute(reportID, undefined, undefined, fallbackBackTo);
}

export default getCreateReportRoute;
export {getDefaultReportsPageRoute};
