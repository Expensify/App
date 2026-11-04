// cspell:ignore Juni junio
import DateUtils from '@libs/DateUtils';

import {de} from 'date-fns/locale/de';
import {es} from 'date-fns/locale/es';
import {ja} from 'date-fns/locale/ja';

describe('DateUtils.formatToLongDateInUTC', () => {
    it('keeps the English long date unchanged', () => {
        // Given a date and no locale, which falls back to en-US
        // When it is formatted as a long date
        // Then English keeps the `MMMM d, yyyy` shape it had before
        expect(DateUtils.formatToLongDateInUTC('2026-06-20', undefined)).toBe('June 20, 2026');
    });

    it('orders the date the way each language does', () => {
        // Given languages that do not write a long date in the US order
        // When the same date is formatted in each
        // Then German puts the day first, Spanish adds its `de` between the parts and Japanese leads with the year.
        // The hand-written pattern produced `Juni 20, 2026` and `junio 20, 2026` instead.
        expect(DateUtils.formatToLongDateInUTC('2026-06-20', de)).toBe('20. Juni 2026');
        expect(DateUtils.formatToLongDateInUTC('2026-06-20', es)).toBe('20 de junio de 2026');
        expect(DateUtils.formatToLongDateInUTC('2026-06-20', ja)).toBe('2026年6月20日');
    });

    it('does not move the day for a UTC midnight timestamp', () => {
        // Given a renewal or due date sent as UTC midnight, which is the previous evening in a timezone behind UTC
        // When it is formatted
        // Then the UTC day is shown, matching the date the server meant
        expect(DateUtils.formatToLongDateInUTC('2026-06-20T00:00:00.000Z', undefined)).toBe('June 20, 2026');
    });

    it('returns an empty string for an invalid date', () => {
        // Given a value that is not a date
        // When it is formatted
        // Then nothing is shown, so callers that fall back to the raw value (such as payment history) still can
        expect(DateUtils.formatToLongDateInUTC('not a date', undefined)).toBe('');
    });
});
