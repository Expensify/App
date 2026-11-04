import {formatDates} from '@components/Search/comparisonBuckets';

describe('comparisonBuckets formatDates', () => {
    it('names a single-day period with the app abbreviated date', () => {
        // Given a comparison period that covers one day, shown to an English user
        // When it is named for the chart tooltip and legend
        // Then it reads as the app's abbreviated date with a year, which is what the hand-written pattern produced in English
        expect(formatDates({start: '2026-08-01', end: '2026-08-01'}, undefined)).toBe('Aug 1, 2026');
    });
});
