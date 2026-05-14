import shouldUseBackToOnLeaveReport, {getBackToOnLeaveReport} from '@libs/Navigation/helpers/shouldUseBackToOnLeaveReport';
import ROUTES from '@src/ROUTES';

describe('shouldUseBackToOnLeaveReport', () => {
    const reportID = '123';

    it('preserves a Search route even when it targets the current report', () => {
        const backTo = ROUTES.SEARCH_REPORT.getRoute({
            reportID,
            reportActionID: '456',
            backTo: ROUTES.SEARCH_ROOT.getRoute({query: 'type:chat', rawQuery: 'type:chat'}),
        });

        expect(shouldUseBackToOnLeaveReport(reportID, backTo)).toBe(true);
    });

    it('unwraps nested Search backTo when the immediate Search route targets the current report', () => {
        const nestedBackTo = ROUTES.SEARCH_ROOT.getRoute({query: 'type:chat', rawQuery: 'type:chat'});
        const backTo = ROUTES.SEARCH_REPORT.getRoute({
            reportID,
            reportActionID: '456',
            backTo: nestedBackTo,
        });

        expect(getBackToOnLeaveReport(reportID, backTo)).toBe(nestedBackTo);
    });

    it('does not preserve an Inbox route that points back to the current report', () => {
        const backTo = ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID, ROUTES.REPORT_WITH_ID.getRoute(reportID));

        expect(shouldUseBackToOnLeaveReport(reportID, backTo)).toBe(false);
    });
});
