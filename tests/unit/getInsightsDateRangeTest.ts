import getInsightsDateRange from '@pages/Insights/getInsightsDateRange';

import CONST from '@src/CONST';

describe('getInsightsDateRange', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2026, 9, 8));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('covers only the picked day for a single date', () => {
        // Given a Date filter set to one day

        // When the range it covers is read
        const range = getInsightsDateRange({on: '2026-03-04'});

        // Then the range starts and ends on that day
        expect(range).toEqual({start: '2026-03-04', end: '2026-03-04'});
    });

    it('keeps the bounds of a custom range', () => {
        // Given a Date filter set to a custom range

        // When the range it covers is read
        const range = getInsightsDateRange({from: '2026-03-01', to: '2026-05-02'});

        // Then the range keeps the picked bounds as they are
        expect(range).toEqual({start: '2026-03-01', end: '2026-05-02'});
    });

    it('resolves a preset against today', () => {
        // Given it's October 8 and the Date filter is set to This month

        // When the range it covers is read
        const range = getInsightsDateRange({preset: CONST.SEARCH.DATE_PRESETS.THIS_MONTH});

        // Then the range spans the whole of October, including the days still to come
        expect(range).toEqual({start: '2026-10-01', end: '2026-10-31'});
    });

    it('returns no bounds for a preset without a fixed range', () => {
        // Given a Date filter set to a preset that doesn't cover fixed dates

        // When the range it covers is read
        const range = getInsightsDateRange({preset: CONST.SEARCH.DATE_PRESETS.NEVER});

        // Then neither bound is set, so callers can tell there's no range to fit to
        expect(range.start).toBeFalsy();
        expect(range.end).toBeFalsy();
    });
});
