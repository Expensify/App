import getInitialNumToRender from '@pages/inbox/report/getInitialNumReportActionsToRender';
import getReportActionsListInitialNumToRender from '@pages/inbox/report/getReportActionsListInitialNumToRender';

describe('getReportActionsListInitialNumToRender', () => {
    it('keeps initial render windowed when scroll-to-end mode is enabled', () => {
        const result = getReportActionsListInitialNumToRender({
            numToRender: 12,
            shouldScrollToEndAfterLayout: true,
            hasCreatedActionAdded: false,
            sortedVisibleReportActionsLength: 500,
            isOffline: false,
            getInitialNumToRender,
        });

        expect(result).toBe(12);
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

    it('caps rendering to available actions when platform-adjusted value is larger than the list', () => {
        const result = getReportActionsListInitialNumToRender({
            numToRender: 10,
            linkedReportActionID: '123',
            shouldScrollToEndAfterLayout: true,
            hasCreatedActionAdded: false,
            sortedVisibleReportActionsLength: 3,
            isOffline: false,
            getInitialNumToRender,
        });

        expect(result).toBe(3);
    });
});
