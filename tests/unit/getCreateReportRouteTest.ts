import getCreateReportRoute, {getDefaultReportsPageRoute} from '@libs/Navigation/helpers/getCreateReportRoute';
import ROUTES from '@src/ROUTES';

describe('getCreateReportRoute', () => {
    const reportID = '123';

    it('returns the Search route with the current search state when already in Search', () => {
        const route = getCreateReportRoute({
            reportID,
            searchBackTo: 'search?q=type:expense-report',
            shouldOpenInSearch: true,
        });

        expect(route).toBe(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID, backTo: 'search?q=type:expense-report'}));
    });

    it('returns the Reports route with the default expense reports page when opening from Home', () => {
        const route = getCreateReportRoute({
            reportID,
            shouldOpenInReports: true,
        });

        expect(route).toBe(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID, backTo: getDefaultReportsPageRoute()}));
    });

    it('preserves an explicit Reports backTo route when reopening after workspace selection', () => {
        const route = getCreateReportRoute({
            reportID,
            searchBackTo: 'search?q=type:expense-report sortBy:date sortOrder:desc',
            shouldOpenInReports: true,
        });

        expect(route).toBe(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID, backTo: 'search?q=type:expense-report sortBy:date sortOrder:desc'}));
    });

    it('falls back to the Inbox-owned report route outside Home and Search', () => {
        const route = getCreateReportRoute({
            reportID,
            fallbackBackTo: 'inbox',
        });

        expect(route).toBe(ROUTES.REPORT_WITH_ID.getRoute(reportID, undefined, undefined, 'inbox'));
    });
});
