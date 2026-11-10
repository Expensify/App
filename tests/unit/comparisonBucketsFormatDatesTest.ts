import {formatDates} from '@components/Search/comparisonBuckets';

import {de} from 'date-fns/locale/de';

describe('comparisonBuckets formatDates', () => {
    it('names a single-day period with the app abbreviated date', () => {
        // Given a comparison period that covers one day, shown to an English user
        // When it is named for the chart tooltip and legend
        // Then it reads as the app's abbreviated date with a year, which is what the hand-written pattern produced in English
        expect(formatDates({start: '2026-08-01', end: '2026-08-01'}, undefined)).toBe('Aug 1, 2026');
    });

    it('orders a single-day period the way the language does', () => {
        // Given the same one-day period, shown to a German user
        // When it is named for the chart tooltip and legend
        // Then the day comes before the month. The hand-written `MMM d, yyyy` kept the US order and gave `Aug. 1, 2026`.
        expect(formatDates({start: '2026-08-01', end: '2026-08-01'}, de)).toBe('1. Aug. 2026');
    });
});
