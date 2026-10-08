import resolveComparisonWindows from '@pages/Insights/insightsCompare';

import CONST from '@src/CONST';

describe('resolveComparisonWindows', () => {
    beforeEach(() => {
        // Given a fixed today, so the resolved windows are the same on every run
        jest.useFakeTimers().setSystemTime(new Date('2026-09-22T12:00:00'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('compares the year so far against the same stretch of the year before', () => {
        // When the page reports on the year to date
        const windows = resolveComparisonWindows({preset: CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE});

        // Then each window runs from January 1st to the same day of its own year
        expect(windows).toEqual({current: {start: '2026-01-01', end: '2026-09-22'}, previous: {start: '2025-01-01', end: '2025-09-22'}});
    });

    it('compares a month against the month before it', () => {
        // When the page reports on last month
        const windows = resolveComparisonWindows({preset: CONST.SEARCH.DATE_PRESETS.LAST_MONTH});

        // Then both windows are whole months
        expect(windows).toEqual({current: {start: '2026-08-01', end: '2026-08-31'}, previous: {start: '2026-07-01', end: '2026-07-31'}});
    });

    it('compares the last twelve months against the twelve before them', () => {
        // When the page reports on the last 12 months
        const windows = resolveComparisonWindows({preset: CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS});

        // Then the windows sit back to back, each a year long and bounded by whole months
        expect(windows).toEqual({current: {start: '2025-10-01', end: '2026-09-30'}, previous: {start: '2024-10-01', end: '2025-09-30'}});
    });

    it('compares a custom range against the range of the same length before it', () => {
        // When the page reports on ten days in March
        const windows = resolveComparisonWindows({from: '2026-03-11', to: '2026-03-20'});

        // Then the compared window is the ten days ending the day before it starts
        expect(windows).toEqual({current: {start: '2026-03-11', end: '2026-03-20'}, previous: {start: '2026-03-01', end: '2026-03-10'}});
    });

    it('compares a custom range that covers whole months against the same number of months before it', () => {
        // When the page reports on a quarter
        const windows = resolveComparisonWindows({from: '2026-04-01', to: '2026-06-30'});

        // Then the compared window is the quarter before it, rather than the 91 days before it
        expect(windows?.previous).toEqual({start: '2026-01-01', end: '2026-03-31'});
    });

    it('compares a single day against the day before it', () => {
        // When the page reports on one day
        const windows = resolveComparisonWindows({on: '2026-12-03'});

        // Then the compared window is the day before
        expect(windows).toEqual({current: {start: '2026-12-03', end: '2026-12-03'}, previous: {start: '2026-12-02', end: '2026-12-02'}});
    });
});
