import resolveComparisonWindows from '@pages/Insights/insightsCompare';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';

import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('resolveComparisonWindows', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.DEFAULT);
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        // Given a fixed today, so the resolved windows are the same on every run
        jest.useFakeTimers().setSystemTime(new Date('2026-09-22T12:00:00'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('compares the year so far against the same stretch of the year before', () => {
        // When the page reports on the year to date
        const windows = resolveComparisonWindows({preset: CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE}, translateLocal);

        // Then each window runs from January 1st to the same day of its own year
        expect(windows?.current.range).toEqual({start: '2026-01-01', end: '2026-09-22'});
        expect(windows?.previous.range).toEqual({start: '2025-01-01', end: '2025-09-22'});
        expect(windows?.current.label).toBe('YTD 2026');
        expect(windows?.previous.label).toBe('YTD 2025');
    });

    it('compares a month against the month before it', () => {
        // When the page reports on last month
        const windows = resolveComparisonWindows({preset: CONST.SEARCH.DATE_PRESETS.LAST_MONTH}, translateLocal);

        // Then both windows are whole months, named after the month they cover
        expect(windows?.current.range).toEqual({start: '2026-08-01', end: '2026-08-31'});
        expect(windows?.previous.range).toEqual({start: '2026-07-01', end: '2026-07-31'});
        expect(windows?.current.label).toBe('Aug 2026');
        expect(windows?.previous.label).toBe('Jul 2026');
    });

    it('compares the last twelve months against the twelve before them', () => {
        // When the page reports on the last 12 months
        const windows = resolveComparisonWindows({preset: CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS}, translateLocal);

        // Then the windows sit back to back, each a year long and bounded by whole months
        expect(windows?.current.range).toEqual({start: '2025-10-01', end: '2026-09-30'});
        expect(windows?.previous.range).toEqual({start: '2024-10-01', end: '2025-09-30'});
        expect(windows?.current.label).toBe('Last 12 months');
        expect(windows?.previous.label).toBe('Prior 12 months');
    });

    it('compares a custom range against the range of the same length before it, named by its length', () => {
        // When the page reports on ten days in March
        const windows = resolveComparisonWindows({after: '2026-03-11', before: '2026-03-20'}, translateLocal);

        // Then the compared window is the ten days ending the day before it starts
        expect(windows?.current.range).toEqual({start: '2026-03-11', end: '2026-03-20'});
        expect(windows?.previous.range).toEqual({start: '2026-03-01', end: '2026-03-10'});
        expect(windows?.current.label).toBe('Mar 11 - Mar 20');
        expect(windows?.previous.label).toBe('Prior 10 days');
    });

    it('names a custom range that covers whole months in months', () => {
        // When the page reports on a quarter
        const windows = resolveComparisonWindows({after: '2026-04-01', before: '2026-06-30'}, translateLocal);

        // Then the compared window is the quarter before it, named in months rather than days
        expect(windows?.previous.range).toEqual({start: '2026-01-01', end: '2026-03-31'});
        expect(windows?.previous.label).toBe('Prior 3 months');
    });

    it('compares a single day against the day before it', () => {
        // When the page reports on one day
        const windows = resolveComparisonWindows({after: '2026-12-03', before: '2026-12-03'}, translateLocal);

        // Then both windows are named by their date
        expect(windows?.current.range).toEqual({start: '2026-12-03', end: '2026-12-03'});
        expect(windows?.previous.range).toEqual({start: '2026-12-02', end: '2026-12-02'});
        expect(windows?.current.label).toBe('Dec 3');
        expect(windows?.previous.label).toBe('Dec 2');
    });

    it('has nothing to compare a period with no counterpart against', () => {
        // When the page reports on a preset that names no period of its own
        const windows = resolveComparisonWindows({preset: CONST.SEARCH.DATE_PRESETS.NEVER}, translateLocal);

        // Then no comparison is offered
        expect(windows).toBeUndefined();
    });
});
