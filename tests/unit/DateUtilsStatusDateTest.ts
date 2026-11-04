import DateUtils from '@libs/DateUtils';

import {de} from 'date-fns/locale/de';

import {translateLocal} from '../utils/TestHelper';

describe('DateUtils custom status date', () => {
    it('shows a custom clear-after date as a numeric date in English', () => {
        // Given a custom status that clears at a specific date and time, and no locale, which falls back to en-US
        // When its clear-after description is built
        // Then the date uses the English numeric date order instead of the machine `yyyy-MM-dd` format
        expect(DateUtils.getLocalizedTimePeriodDescription(translateLocal, undefined, '2026-06-20 17:34:00')).toBe('06/20/2026 5:34 PM');
    });

    it('orders the numeric date the way the language does', () => {
        // Given the same custom status date in German
        // When its clear-after description is built
        // Then the day comes first with the separators German uses, and the time follows the German 24-hour clock
        expect(DateUtils.getLocalizedTimePeriodDescription(translateLocal, de, '2026-06-20 17:34:00')).toBe('20.06.2026 17:34');
    });

    it('returns an empty string for a date that cannot be read', () => {
        // Given a custom clear-after value that is not a date
        // When its description is built
        // Then nothing is shown instead of `Intl` throwing a RangeError into the status page
        expect(DateUtils.getLocalizedTimePeriodDescription(translateLocal, undefined, 'not a date')).toBe('');
    });
});
