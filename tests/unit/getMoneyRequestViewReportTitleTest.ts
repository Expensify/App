import getMoneyRequestViewReportTitle from '@libs/getMoneyRequestViewReportTitle';

describe('getMoneyRequestViewReportTitle', () => {
    it('returns plain title when the report is editable', () => {
        expect(
            getMoneyRequestViewReportTitle({
                reportName: 'My Report',
                reportID: '123',
                canEditReport: true,
                activeRoute: '/search/expenses',
            }),
        ).toBe('My Report');
    });

    it('returns plain title when reportID is missing', () => {
        expect(
            getMoneyRequestViewReportTitle({
                reportName: 'My Report',
                reportID: undefined,
                canEditReport: false,
                activeRoute: '/search/expenses',
            }),
        ).toBe('My Report');
    });

    it('links to the Search report route when opened from Spend/Search', () => {
        expect(
            getMoneyRequestViewReportTitle({
                reportName: 'My Report',
                reportID: '123',
                canEditReport: false,
                activeRoute: '/search/expenses',
            }),
        ).toBe('[My Report](search/r/123)');
    });

    it('links to the Inbox report route when not opened from Spend/Search', () => {
        expect(
            getMoneyRequestViewReportTitle({
                reportName: 'My Report',
                reportID: '123',
                canEditReport: false,
                activeRoute: '/r/456',
            }),
        ).toBe('[My Report](r/123)');
    });
});

