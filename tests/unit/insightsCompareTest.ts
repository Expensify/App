import resolveComparisonPeriods from '@pages/Insights/insightsCompare';

import CONST from '@src/CONST';

describe('resolveComparisonPeriods', () => {
    beforeEach(() => {
        // Given a fixed today, so the resolved periods are the same on every run
        jest.useFakeTimers().setSystemTime(new Date('2026-09-22T12:00:00'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('compares year to date against the whole year before, like this year', () => {
        // When the page reports on year to date, which is kept as an alias of this year
        const periods = resolveComparisonPeriods({preset: CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE});

        // Then both periods are whole calendar years, a year apart
        const expectedPeriods = {primary: {start: '2026-01-01', end: '2026-12-31'}, comparison: {start: '2025-01-01', end: '2025-12-31'}, monthsApart: 12};
        expect(periods).toEqual(expectedPeriods);
        expect(resolveComparisonPeriods({preset: CONST.SEARCH.DATE_PRESETS.THIS_YEAR})).toEqual(expectedPeriods);
    });

    it('compares a month against the month before it', () => {
        // When the page reports on last month
        const periods = resolveComparisonPeriods({preset: CONST.SEARCH.DATE_PRESETS.LAST_MONTH});

        // Then both periods are whole months, a month apart
        expect(periods).toEqual({primary: {start: '2026-08-01', end: '2026-08-31'}, comparison: {start: '2026-07-01', end: '2026-07-31'}, monthsApart: 1});
    });

    it('compares the last twelve months against the twelve before them', () => {
        // When the page reports on the last 12 months
        const periods = resolveComparisonPeriods({preset: CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS});

        // Then the periods sit back to back, each a year long and bounded by whole months
        expect(periods).toEqual({primary: {start: '2025-10-01', end: '2026-09-30'}, comparison: {start: '2024-10-01', end: '2025-09-30'}, monthsApart: 12});
    });

    it('compares this week against the week before it', () => {
        // When the page reports on this week, which runs Sunday to Saturday
        const periods = resolveComparisonPeriods({preset: CONST.SEARCH.DATE_PRESETS.THIS_WEEK});

        // Then the compared period is the previous Sunday to Saturday, paired day by day rather than a month apart
        expect(periods).toEqual({primary: {start: '2026-09-20', end: '2026-09-26'}, comparison: {start: '2026-09-13', end: '2026-09-19'}});
    });

    it('compares the last 30 days against the 30 days before them', () => {
        // When the page reports on the last 30 days, which span two months
        const periods = resolveComparisonPeriods({preset: CONST.SEARCH.DATE_PRESETS.LAST_30_DAYS});

        // Then the compared period is the 30 days just before, not whole months
        expect(periods).toEqual({primary: {start: '2026-08-24', end: '2026-09-22'}, comparison: {start: '2026-07-25', end: '2026-08-23'}});
    });

    it('compares a custom range against the range of the same length before it', () => {
        // When the page reports on ten days in March
        const periods = resolveComparisonPeriods({from: '2026-03-11', to: '2026-03-20'});

        // Then the compared period is the ten days ending the day before it starts, paired day by day rather than by date
        expect(periods).toEqual({primary: {start: '2026-03-11', end: '2026-03-20'}, comparison: {start: '2026-03-01', end: '2026-03-10'}});
    });

    it('compares a custom range of whole months against the same number of days before it', () => {
        // When the page reports on October as a custom range
        const periods = resolveComparisonPeriods({from: '2026-10-01', to: '2026-10-31'});

        // Then the compared period is the 31 days before it, which starts on August 31st rather than September 1st
        expect(periods?.comparison).toEqual({start: '2026-08-31', end: '2026-09-30'});
    });
});
