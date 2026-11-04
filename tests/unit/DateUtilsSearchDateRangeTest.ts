// cspell:ignore Sept
import DateUtils from '@libs/DateUtils';

import {de} from 'date-fns/locale/de';
import {es} from 'date-fns/locale/es';

// `Intl` puts thin spaces around the en dash in an English range.
const THIN_SPACE = ' ';

describe('DateUtils.getFormattedDateRangeForSearch', () => {
    it('writes the shared month and year once in English', () => {
        // Given a week of Search results within one month
        // When its range label is built
        // Then the month and year are written once, the way `Intl` joins a range
        expect(DateUtils.getFormattedDateRangeForSearch('2025-09-01', '2025-09-07', undefined)).toBe(`Sep 1${THIN_SPACE}–${THIN_SPACE}7, 2025`);
    });

    it('joins the range the way each language does', () => {
        // Given the same week in German and Spanish
        // When its range label is built
        // Then each language puts the days first and uses its own range punctuation. The hand-written `MMM d - MMM d`
        // kept the US order and repeated the month.
        expect(DateUtils.getFormattedDateRangeForSearch('2025-09-01', '2025-09-07', de)).toBe('1.–7. Sept. 2025');
        expect(DateUtils.getFormattedDateRangeForSearch('2025-09-01', '2025-09-07', es)).toBe('1–7 sept 2025');
    });

    it('shows both years when the range crosses New Year', () => {
        // Given a range that starts in one year and ends in the next
        // When its range label is built
        // Then each end carries its own year
        expect(DateUtils.getFormattedDateRangeForSearch('2025-12-29', '2026-01-04', undefined)).toBe(`Dec 29, 2025${THIN_SPACE}–${THIN_SPACE}Jan 4, 2026`);
    });

    it('still joins the range on an engine without formatRange', () => {
        // Given an engine that does not implement `Intl.DateTimeFormat.prototype.formatRange`, as can happen on Hermes
        const formatRangeDescriptor = Object.getOwnPropertyDescriptor(Intl.DateTimeFormat.prototype, 'formatRange');
        // @ts-expect-error -- removed on purpose to reproduce an engine that leaves the method out
        delete Intl.DateTimeFormat.prototype.formatRange;

        try {
            // When a range label is built
            const result = DateUtils.getFormattedDateRangeForSearch('2025-09-01', '2025-09-07', undefined);

            // Then both dates are still shown, joined with a dash, instead of the Search page throwing
            expect(result).toBe('Sep 1, 2025 – Sep 7, 2025');
        } finally {
            if (formatRangeDescriptor) {
                Object.defineProperty(Intl.DateTimeFormat.prototype, 'formatRange', formatRangeDescriptor);
            }
        }
    });

    it('returns an empty string for a date that cannot be read', () => {
        // Given a range whose start is not a yyyy-MM-dd date
        // When its range label is built
        // Then nothing is shown instead of `Intl` throwing a RangeError
        expect(DateUtils.getFormattedDateRangeForSearch('not a date', '2025-09-07', undefined)).toBe('');
    });
});
