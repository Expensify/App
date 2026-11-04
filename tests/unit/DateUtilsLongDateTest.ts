// cspell:ignore Juni junio
import DateUtils from '@libs/DateUtils';

import {de} from 'date-fns/locale/de';
import {es} from 'date-fns/locale/es';
import {ja} from 'date-fns/locale/ja';

describe('DateUtils local long date', () => {
    describe('formatToLongDate', () => {
        it('keeps the English long date unchanged', () => {
            // Given a local date and no locale, which falls back to en-US
            // When it is formatted as a long date
            // Then English keeps the `MMMM d, yyyy` shape it had before
            expect(DateUtils.formatToLongDate(new Date(2026, 5, 20), undefined)).toBe('June 20, 2026');
        });

        it('orders the date the way each language does', () => {
            // Given languages that do not write a long date in the US order
            // When the same date is formatted in each
            // Then German puts the day first, Spanish adds its `de` between the parts and Japanese leads with the year
            const date = new Date(2026, 5, 20);
            expect(DateUtils.formatToLongDate(date, de)).toBe('20. Juni 2026');
            expect(DateUtils.formatToLongDate(date, es)).toBe('20 de junio de 2026');
            expect(DateUtils.formatToLongDate(date, ja)).toBe('2026年6月20日');
        });

        it('returns an empty string for an invalid date', () => {
            // Given a date that cannot be read
            // When it is formatted
            // Then nothing is shown instead of `Intl` throwing a RangeError into the render
            expect(DateUtils.formatToLongDate(new Date('not a date'), undefined)).toBe('');
        });
    });

    describe('formatToReadableString', () => {
        it('shows a yyyy-MM-dd date on its own day in the language order', () => {
            // Given a calendar date such as a search filter boundary or a distance rate start date
            // When it is formatted
            // Then the stored day is shown, ordered the way each language writes it
            expect(DateUtils.formatToReadableString('2026-06-20', undefined)).toBe('June 20, 2026');
            expect(DateUtils.formatToReadableString('2026-06-20', de)).toBe('20. Juni 2026');
        });
    });
});
