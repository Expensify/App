// cspell:ignore Juni junio Samstag
import DateUtils from '@libs/DateUtils';

import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';

import {de} from 'date-fns/locale/de';
import {es} from 'date-fns/locale/es';

const NEW_YORK: SelectedTimezone = 'America/New_York';
const TOKYO: SelectedTimezone = 'Asia/Tokyo';

describe('DateUtils.formatToLongDateInTimeZone', () => {
    it('keeps the English long date unchanged', () => {
        // Given a date-only value and no locale, which falls back to en-US
        // When it is formatted, with and without the weekday
        // Then English keeps the `MMMM d, yyyy` and `eeee, MMMM d, yyyy` shapes the schedule call pages had before
        expect(DateUtils.formatToLongDateInTimeZone('2026-06-20', NEW_YORK, undefined)).toBe('June 20, 2026');
        expect(DateUtils.formatToLongDateInTimeZone('2026-06-20', NEW_YORK, undefined, true)).toBe('Saturday, June 20, 2026');
    });

    it('orders the date the way each language does', () => {
        // Given languages that do not write a long date in the US order
        // When the same date is formatted in each
        // Then German puts the day first and Spanish adds its `de` between the parts
        expect(DateUtils.formatToLongDateInTimeZone('2026-06-20', NEW_YORK, de)).toBe('20. Juni 2026');
        expect(DateUtils.formatToLongDateInTimeZone('2026-06-20', NEW_YORK, de, true)).toBe('Samstag, 20. Juni 2026');
        expect(DateUtils.formatToLongDateInTimeZone('2026-06-20', NEW_YORK, es)).toBe('20 de junio de 2026');
    });

    it('keeps a date-only value on its own day in every timezone', () => {
        // Given a picked call date with no time, in timezones on both sides of UTC
        // When it is formatted in each
        // Then the picked day is shown, because a date-only value is read as midnight in the target timezone
        expect(DateUtils.formatToLongDateInTimeZone('2026-06-20', NEW_YORK, undefined)).toBe('June 20, 2026');
        expect(DateUtils.formatToLongDateInTimeZone('2026-06-20', TOKYO, undefined)).toBe('June 20, 2026');
    });

    it('shows an instant on the day it falls on in the target timezone', () => {
        // Given a call time that is late on June 20 in New York, which is already June 21 in UTC
        // When it is formatted in New York
        // Then the New York day is shown
        expect(DateUtils.formatToLongDateInTimeZone('2026-06-21T02:00:00Z', NEW_YORK, undefined)).toBe('June 20, 2026');
    });

    it('returns an empty string for an invalid date', () => {
        // Given a value that is not a date
        // When it is formatted
        // Then nothing is shown instead of `Intl` throwing a RangeError into the render
        expect(DateUtils.formatToLongDateInTimeZone('not a date', NEW_YORK, undefined)).toBe('');
    });
});
