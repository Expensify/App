import getInitialNumToRender from '@pages/inbox/report/getInitialNumReportActionsToRender';
import getReportActionsListInitialNumToRender from '@pages/inbox/report/getReportActionsListInitialNumToRender';

describe('getReportActionsListInitialNumToRender', () => {
    it('returns the full list length when scroll-to-end mode is enabled before the created action is added', () => {
        const result = getReportActionsListInitialNumToRender({
            numToRender: 12,
            shouldScrollToEndAfterLayout: true,
            hasCreatedActionAdded: false,
            sortedVisibleReportActionsLength: 500,
            isOffline: false,
            getInitialNumToRender,
        });

        expect(result).toBe(500);
    });

    it('returns the platform-adjusted value for linked report actions', () => {
        const result = getReportActionsListInitialNumToRender({
            numToRender: 10,
            linkedReportActionID: '123',
            shouldScrollToEndAfterLayout: false,
            hasCreatedActionAdded: true,
            sortedVisibleReportActionsLength: 500,
            isOffline: false,
            getInitialNumToRender,
        });

        expect(result).toBe(getInitialNumToRender(10));
    });

    it('returns numToRender when there is no linked report action and the scroll-to-end short-circuit does not apply', () => {
        const result = getReportActionsListInitialNumToRender({
            numToRender: 10,
            shouldScrollToEndAfterLayout: false,
            hasCreatedActionAdded: true,
            sortedVisibleReportActionsLength: 3,
            isOffline: false,
            getInitialNumToRender,
        });

        expect(result).toBe(10);
    });
});
