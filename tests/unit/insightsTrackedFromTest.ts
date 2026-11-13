import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import {doesRangeStartBeforeTracking, isBucketTracked} from '@pages/Insights/insightsTrackedFrom';

import CONST from '@src/CONST';

const TRACKED_FROM = '2026-06-01';

const BASE_FILTERS: InsightsFilters = {
    date: {from: '2026-07-01', to: '2026-07-31'},
    policyIDs: [],
    groupBy: CONST.SEARCH.GROUP_BY.DAY,
    groupCurrency: 'USD',
};

describe('insightsTrackedFrom', () => {
    describe('isBucketTracked', () => {
        it('keeps a bucket with no date range', () => {
            // Given a bucket whose grouping has no dates, like a merchant

            // When it's checked against the first tracked day
            const isTracked = isBucketTracked(undefined, TRACKED_FROM);

            // Then it's kept, since there's no date to rule it out
            expect(isTracked).toBe(true);
        });

        it('drops a bucket that ends before the first tracked day', () => {
            // Given May, which ends the day before tracking started

            // When it's checked against the first tracked day
            const isTracked = isBucketTracked({start: '2026-05-01', end: '2026-05-31'}, TRACKED_FROM);

            // Then it's dropped, since the backend has no data for it
            expect(isTracked).toBe(false);
        });

        it('keeps a bucket that runs into the first tracked day', () => {
            // Given the week of May 31, which ends after tracking started

            // When it's checked against the first tracked day
            const isTracked = isBucketTracked({start: '2026-05-31', end: '2026-06-06'}, TRACKED_FROM);

            // Then it's kept with the data from the first tracked day on
            expect(isTracked).toBe(true);
        });

        it('keeps a bucket that ends on the first tracked day', () => {
            // Given a bucket whose last day is the first tracked day

            // When it's checked against the first tracked day
            const isTracked = isBucketTracked({start: '2026-05-26', end: TRACKED_FROM}, TRACKED_FROM);

            // Then it's kept, since that day has data
            expect(isTracked).toBe(true);
        });
    });

    describe('doesRangeStartBeforeTracking', () => {
        it('reaches back past the first tracked day when the range has no start', () => {
            // Given a Date filter preset that has no fixed start
            const filters: InsightsFilters = {...BASE_FILTERS, date: {preset: CONST.SEARCH.DATE_PRESETS.NEVER}};

            // When the range is checked against the first tracked day
            const startsBefore = doesRangeStartBeforeTracking(filters, TRACKED_FROM);

            // Then it counts as starting before, since it covers every earlier date
            expect(startsBefore).toBe(true);
        });

        it('starts before tracking when the range starts before the first tracked day', () => {
            // Given a range from May through July
            const filters: InsightsFilters = {...BASE_FILTERS, date: {from: '2026-05-01', to: '2026-07-31'}};

            // When the range is checked against the first tracked day
            const startsBefore = doesRangeStartBeforeTracking(filters, TRACKED_FROM);

            // Then it starts before tracking
            expect(startsBefore).toBe(true);
        });

        it('does not start before tracking when the range starts after it and nothing is compared', () => {
            // Given July with no compared period

            // When the range is checked against the first tracked day
            const startsBefore = doesRangeStartBeforeTracking(BASE_FILTERS, TRACKED_FROM);

            // Then it doesn't start before tracking
            expect(startsBefore).toBe(false);
        });

        it('starts before tracking when the compared previous period starts before the first tracked day', () => {
            // Given June compared with May, which comes before tracking started
            const filters: InsightsFilters = {...BASE_FILTERS, date: {from: '2026-06-01', to: '2026-06-30'}, compare: CONST.SEARCH.COMPARE.PREVIOUS_PERIOD};

            // When the range is checked against the first tracked day
            const startsBefore = doesRangeStartBeforeTracking(filters, TRACKED_FROM);

            // Then it starts before tracking, since the compared line covers untracked days
            expect(startsBefore).toBe(true);
        });

        it('does not start before tracking when the compared previous period starts after the first tracked day', () => {
            // Given August compared with July, both after tracking started
            const filters: InsightsFilters = {...BASE_FILTERS, date: {from: '2026-08-01', to: '2026-08-31'}, compare: CONST.SEARCH.COMPARE.PREVIOUS_PERIOD};

            // When the range is checked against the first tracked day
            const startsBefore = doesRangeStartBeforeTracking(filters, TRACKED_FROM);

            // Then it doesn't start before tracking
            expect(startsBefore).toBe(false);
        });

        it('ignores the compared periods of the average', () => {
            // Given June compared with the average, whose earlier periods aren't checked here
            const filters: InsightsFilters = {...BASE_FILTERS, date: {from: '2026-06-01', to: '2026-06-30'}, compare: CONST.SEARCH.COMPARE.AVERAGE};

            // When the range is checked against the first tracked day
            const startsBefore = doesRangeStartBeforeTracking(filters, TRACKED_FROM);

            // Then only the range itself counts, which starts on the first tracked day
            expect(startsBefore).toBe(false);
        });
    });
});
