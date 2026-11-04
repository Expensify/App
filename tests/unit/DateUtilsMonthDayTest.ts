// cspell:ignore Juni
import DateUtils from '@libs/DateUtils';

import {de} from 'date-fns/locale/de';
import {es} from 'date-fns/locale/es';
import {ja} from 'date-fns/locale/ja';

const CURRENT_YEAR = new Date().getFullYear();

describe('DateUtils month and day', () => {
    describe('formatToMonthDay', () => {
        it('keeps the English month and day unchanged', () => {
            // Given a date and no locale, which falls back to en-US
            // When it is formatted as a month and day
            // Then English keeps the `MMM d` shape it had before
            expect(DateUtils.formatToMonthDay(new Date(Date.UTC(2026, 5, 20)), undefined, 'UTC')).toBe('Jun 20');
        });

        it('orders the month and day the way each language does', () => {
            // Given languages that do not write a month and day in the US order
            // When the same date is formatted in each
            // Then German and Spanish put the day first and Japanese adds its day suffix. The hand-written `MMM d`
            // produced `Juni 20` and `6月 20` instead.
            const date = new Date(Date.UTC(2026, 5, 20));
            expect(DateUtils.formatToMonthDay(date, de, 'UTC')).toBe('20. Juni');
            expect(DateUtils.formatToMonthDay(date, es, 'UTC')).toBe('20 jun');
            expect(DateUtils.formatToMonthDay(date, ja, 'UTC')).toBe('6月20日');
        });

        it('returns an empty string for an invalid date', () => {
            // Given a date that cannot be read
            // When it is formatted
            // Then nothing is shown instead of `Intl` throwing a RangeError into the render
            expect(DateUtils.formatToMonthDay(new Date('not a date'), undefined)).toBe('');
        });
    });

    describe('formatToMonthDayWithOptionalYearInUTC', () => {
        it('leaves out the year for a date in the current year', () => {
            // Given a calendar date in the current year
            // When it is formatted
            // Then only the month and day are shown, in the language's own order
            expect(DateUtils.formatToMonthDayWithOptionalYearInUTC(`${CURRENT_YEAR}-06-20`, undefined)).toBe('Jun 20');
            expect(DateUtils.formatToMonthDayWithOptionalYearInUTC(`${CURRENT_YEAR}-06-20`, de)).toBe('20. Juni');
        });

        it('adds the year for a date in a past year', () => {
            // Given a calendar date from a previous year
            // When it is formatted
            // Then the year is included so the date is not mistaken for this year's
            expect(DateUtils.formatToMonthDayWithOptionalYearInUTC(`${CURRENT_YEAR - 2}-06-20`, undefined)).toBe(`Jun 20, ${CURRENT_YEAR - 2}`);
        });

        it('does not move the day for a midnight calendar date', () => {
            // Given a calendar date stored as midnight, which would fall on the previous day in a timezone behind UTC
            // When it is formatted
            // Then the stored day is shown, because a transaction date is a calendar value rather than an instant
            expect(DateUtils.formatToMonthDayWithOptionalYearInUTC(`${CURRENT_YEAR}-01-01 00:00:00`, undefined)).toBe('Jan 1');
        });

        it('leaves out the year for January 1 of the current year in every timezone', () => {
            // Given a stored January 1 date, at midday on January 1 in UTC, when it is January 1 on every device
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2026-01-01T12:00:00Z'));

            try {
                // When it is formatted
                // Then the date's year is read in UTC, the timezone it is shown in. Read in the device's timezone, the
                // stored midnight falls on December 31 behind UTC and the date was mistaken for the previous year.
                expect(DateUtils.formatToMonthDayWithOptionalYearInUTC('2026-01-01', de)).toBe('1. Jan.');
            } finally {
                jest.useRealTimers();
            }
        });

        it('returns an empty string for an empty date', () => {
            // Given a missing date
            // When it is formatted
            // Then nothing is shown
            expect(DateUtils.formatToMonthDayWithOptionalYearInUTC('', undefined)).toBe('');
        });
    });
});
