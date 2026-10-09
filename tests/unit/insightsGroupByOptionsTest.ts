import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import {getFittingGroupBy, getInsightsGroupByOptions} from '@pages/Insights/insightsGroupByOptions';

import CONST from '@src/CONST';

const {DAY, WEEK, MONTH, QUARTER, YEAR} = CONST.SEARCH.GROUP_BY;
const {THIS_MONTH, LAST_MONTH, YEAR_TO_DATE, LAST_12_MONTHS} = CONST.SEARCH.DATE_PRESETS;

describe('insightsGroupByOptions', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2026, 9, 8));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('getInsightsGroupByOptions', () => {
        it.each<[string, InsightsFilters['date'], Array<InsightsFilters['groupBy']>]>([
            ['this month', {preset: THIS_MONTH}, [DAY, WEEK]],
            ['last month', {preset: LAST_MONTH}, [DAY, WEEK]],
            ['year to date in October', {preset: YEAR_TO_DATE}, [WEEK, MONTH, QUARTER]],
            ['last 12 months', {preset: LAST_12_MONTHS}, [WEEK, MONTH, QUARTER]],
            ['a range under two weeks', {from: '2026-03-01', to: '2026-03-10'}, [DAY]],
            ['a range of 13 days', {from: '2026-03-01', to: '2026-03-13'}, [DAY]],
            ['a range of 14 days', {from: '2026-03-01', to: '2026-03-14'}, [DAY, WEEK]],
            ['a range of 62 days', {from: '2026-03-01', to: '2026-05-01'}, [DAY, WEEK, MONTH]],
            ['a range of 63 days', {from: '2026-03-01', to: '2026-05-02'}, [WEEK, MONTH]],
            ['a range of exactly two months', {from: '2026-01-01', to: '2026-02-28'}, [DAY, WEEK, MONTH]],
            ['a range of two years', {from: '2024-01-01', to: '2025-12-31'}, [WEEK, MONTH, QUARTER, YEAR]],
            ['a single day', {on: '2026-03-04'}, []],
        ])('offers the options that fit %s', (_label, date, expected) => {
            // Given a dashboard reporting on that date range

            // When the Group by options are listed
            const options = getInsightsGroupByOptions(date);

            // Then only groupings that give a readable trend for its length are offered, in the dropdown's order
            expect(options).toEqual(expected);
        });

        it('offers Day and Week for year to date in January', () => {
            // Given it's late January, so the year so far is a few weeks long
            jest.setSystemTime(new Date(2026, 0, 20));

            // When the Group by options are listed for year to date
            const options = getInsightsGroupByOptions({preset: YEAR_TO_DATE});

            // Then the range is too short for monthly points and short enough for daily ones
            expect(options).toEqual([DAY, WEEK]);
        });
    });

    describe('getFittingGroupBy', () => {
        it('keeps a Group by the date range offers', () => {
            // Given a monthly chart over the last 12 months, which offers Month

            // When the Group by is fitted to the range
            const groupBy = getFittingGroupBy(MONTH, getInsightsGroupByOptions({preset: LAST_12_MONTHS}));

            // Then the selection stays as it is
            expect(groupBy).toBe(MONTH);
        });

        it('switches to the nearest offered option when the range rules the selection out', () => {
            // Given a quarterly chart moved to this month, which only offers Day and Week

            // When the Group by is fitted to the range
            const groupBy = getFittingGroupBy(QUARTER, getInsightsGroupByOptions({preset: THIS_MONTH}));

            // Then Week is picked, the closest grouping to Quarter that the month offers
            expect(groupBy).toBe(WEEK);
        });

        it('switches Day to Week when the range is too long for daily points', () => {
            // Given a daily chart moved to the last 12 months

            // When the Group by is fitted to the range
            const groupBy = getFittingGroupBy(DAY, getInsightsGroupByOptions({preset: LAST_12_MONTHS}));

            // Then Week is picked, the closest grouping to Day that the range offers
            expect(groupBy).toBe(WEEK);
        });

        it('keeps the selection for a single day, which has no options to pick from', () => {
            // Given a quarterly chart moved to a single day

            // When the Group by is fitted to the day
            const groupBy = getFittingGroupBy(QUARTER, getInsightsGroupByOptions({on: '2026-03-04'}));

            // Then the saved selection is left alone, so it comes back when a range is picked again
            expect(groupBy).toBe(QUARTER);
        });
    });
});
