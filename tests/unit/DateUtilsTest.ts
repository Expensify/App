// cspell:ignore Montag Dienstag Freitag Sonntag März Τρίτη Κυριακή -- German and Greek weekday and month
// names, asserted verbatim so the locale-driven formatters are covered rather than only the English path.
import type {LocaleContextProps} from '@components/LocaleContextProvider';

import DateUtils from '@libs/DateUtils';
import {clearIntlFormatterCaches, refreshIntlFormatterCaches} from '@libs/IntlFormatterCaches';
import {translate} from '@libs/Localize';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';

/* eslint-disable @typescript-eslint/naming-convention */
import {addDays, addMinutes, endOfDay, format, set, setHours, setMinutes, startOfDay, subDays, subHours, subMinutes, subSeconds} from 'date-fns';
import {fromZonedTime, toZonedTime, format as tzFormat} from 'date-fns-tz';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@src/libs/Log');

const LOCALE = CONST.LOCALES.EN;
const UTC: SelectedTimezone = 'Atlantic/Reykjavik';

const intlFormatForTest = (date: Date, preset: Intl.DateTimeFormatOptions, timeZone: string) =>
    new Intl.DateTimeFormat(LOCALE, {...preset, timeZone}).format(date).replaceAll(CONST.DATE.INTL_NBSP_PATTERN, ' ');

describe('DateUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {
                    accountID: 999,
                },
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                    '999': {
                        accountID: 999,
                        timezone: {
                            selected: UTC,
                        },
                    },
                },
            },
        });
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        IntlStore.load(LOCALE);
        return waitForBatchedUpdates();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
        Onyx.clear();
    });

    const datetime = '2022-11-07 00:00:00';
    const timezone = 'Atlantic/Reykjavik';

    it('getZoneAbbreviation should show zone abbreviation from the datetime', () => {
        const zoneAbbreviation = DateUtils.getZoneAbbreviation(datetime, timezone);
        expect(zoneAbbreviation).toBe('GMT+0');
    });

    it('formatToLongDateWithWeekday should return a long date with a weekday', () => {
        const formattedDate = DateUtils.formatToLongDateWithWeekday(datetime, LOCALE);
        expect(formattedDate).toBe('Monday, November 7, 2022');
    });

    it('formatToLongDateWithWeekday follows the locale order as well as its words', () => {
        // Given a date read by German and Japanese users, whose languages order the weekday, day and month differently from English
        // When the long date with its weekday is formatted for each
        const german = DateUtils.formatToLongDateWithWeekday(datetime, CONST.LOCALES.DE);
        const japanese = DateUtils.formatToLongDateWithWeekday(datetime, CONST.LOCALES.JA);

        // Then each follows its own language's order, not English order with translated words
        expect(german).toBe('Montag, 7. November 2022');
        expect(japanese).toBe('2022年11月7日月曜日');
    });

    it('formatToDayOfWeek should return a weekday', () => {
        const weekDay = DateUtils.formatToDayOfWeek(new Date(datetime), LOCALE);
        expect(weekDay).toBe('Monday');
    });
    it('formatToLocalTime should return a date in a local format', () => {
        const localTime = DateUtils.formatToLocalTime(datetime, LOCALE);
        expect(localTime).toBe('12:00 AM');
    });

    it('formatToLocalTime should follow the given locale clock convention', () => {
        expect(DateUtils.formatToLocalTime(datetime, CONST.LOCALES.DE)).toBe('00:00');
        expect(DateUtils.formatToLocalTime(datetime, CONST.LOCALES.JA)).toBe('0:00');
        // Greek is the one shipped locale besides English that keeps a 12-hour clock, with its own marker.
        expect(DateUtils.formatToLocalTime(datetime, CONST.LOCALES.EL)).toBe('12:00 π.μ.');
    });

    it('should return a date object with the formatted datetime when calling getLocalDateFromDatetime', () => {
        const localDate = DateUtils.getLocalDateFromDatetime(LOCALE, timezone, datetime);
        expect(tzFormat(localDate, CONST.DATE.FNS_TIMEZONE_FORMAT_STRING, {timeZone: timezone})).toEqual('2022-11-07T00:00:00Z');
    });

    it('should fallback to current date when getLocalDateFromDatetime is failing', () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const localDate = DateUtils.getLocalDateFromDatetime(LOCALE, 'InvalidTimezone' as SelectedTimezone, undefined);
        expect(localDate.getTime()).not.toBeNaN();
    });

    it('should return the date in calendar time when calling datetimeToCalendarTime', () => {
        const today = setMinutes(setHours(new Date(), 14), 32).toString();
        expect(DateUtils.datetimeToCalendarTime(LOCALE, today, UTC, false)).toBe('Today at 2:32 PM');

        const tomorrow = addDays(setMinutes(setHours(new Date(), 14), 32), 1).toString();
        expect(DateUtils.datetimeToCalendarTime(LOCALE, tomorrow, UTC, false)).toBe('Tomorrow at 2:32 PM');

        const yesterday = setMinutes(setHours(subDays(new Date(), 1), 7), 43).toString();
        expect(DateUtils.datetimeToCalendarTime(LOCALE, yesterday, UTC, false)).toBe('Yesterday at 7:43 AM');

        const date = setMinutes(setHours(new Date('2022-11-05'), 10), 17).toString();
        expect(DateUtils.datetimeToCalendarTime(LOCALE, date, UTC, false)).toBe('Nov 5, 2022 at 10:17 AM');

        const todayLowercaseDate = setMinutes(setHours(new Date(), 14), 32).toString();
        expect(DateUtils.datetimeToCalendarTime(LOCALE, todayLowercaseDate, UTC, true)).toBe('today at 2:32 PM');
    });

    describe('datetimeToCalendarTime — locale + bucketing', () => {
        afterEach(() => {
            jest.useRealTimers();
        });

        it('es renders 24h time', () => {
            // Given an afternoon timestamp read by a Spanish user, whose language uses a 24-hour clock
            jest.useFakeTimers().setSystemTime(new Date('2026-03-11T14:32:00Z'));
            const now = new Date().toISOString();

            // When it is rendered as calendar time
            const result = DateUtils.datetimeToCalendarTime(CONST.LOCALES.ES, now, UTC, false);

            // Then the time reads 14:32, because the locale decides the clock rather than a fixed 12-hour pattern
            expect(result).toMatch(/14:32/);
        });

        it('ja bucketing uses Sunday-start', () => {
            // Given a Sunday inside the current Japanese week, which starts on Sunday, but in the previous English week
            jest.useFakeTimers().setSystemTime(new Date('2026-03-11T12:00:00Z'));
            const sunday = '2026-03-08T10:00:00Z';

            // When the same timestamp is rendered for a Japanese and an English reader
            const jaResult = DateUtils.datetimeToCalendarTime(CONST.LOCALES.JA, sunday, UTC, false);
            const enResult = DateUtils.datetimeToCalendarTime(CONST.LOCALES.EN, sunday, UTC, false);

            // Then only the English reader sees the dated form, because "this week" follows each locale's first day
            expect(jaResult).not.toMatch(/2026/);
            expect(enResult).toMatch(/2026/);
        });

        it('past year renders with year', () => {
            // Given a timestamp from an earlier year
            jest.useFakeTimers().setSystemTime(new Date('2026-06-15T12:00:00Z'));
            const oldDate = '2022-11-05T10:17:00Z';

            // When it is rendered as calendar time
            const result = DateUtils.datetimeToCalendarTime(CONST.LOCALES.EN, oldDate, UTC, false);

            // Then the year is included, because without it the date would read as this year
            expect(result).toBe('Nov 5, 2022 at 10:17 AM');
        });

        it('today/tomorrow boundary respects the selected timezone', () => {
            // Given a now and a target that are Mar 11 in UTC but both fall on Mar 10 in Los Angeles (16:30 and 20:00)
            jest.useFakeTimers().setSystemTime(new Date('2026-03-11T00:30:00Z'));
            const laterSameLaDay = '2026-03-11T04:00:00Z';

            // When the target is rendered for a user whose selected timezone is Los Angeles
            const result = DateUtils.datetimeToCalendarTime(CONST.LOCALES.EN, laterSameLaDay, 'America/Los_Angeles', false);

            // Then it reads as today, because the day boundary follows the user's timezone rather than UTC
            expect(result).toMatch(/Today/);
        });
    });

    it('should update timezone if automatic and selected timezone do not match', async () => {
        jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(
            () =>
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                ({
                    resolvedOptions: () => ({timeZone: 'America/Chicago'}),
                }) as Intl.DateTimeFormat,
        );
        Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {'999': {accountID: 999, timezone: {selected: 'Europe/London', automatic: true}}});
        await waitForBatchedUpdates();
        const result = DateUtils.getCurrentTimezone({selected: 'Europe/London', automatic: true});
        expect(result).toEqual({
            selected: 'America/Chicago',
            automatic: true,
        });
    });

    it('should not update timezone if automatic and selected timezone match', async () => {
        jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(
            () =>
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                ({
                    resolvedOptions: () => ({timeZone: UTC}),
                }) as Intl.DateTimeFormat,
        );
        Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {'999': {accountID: 999, timezone: {selected: 'Europe/London', automatic: true}}});
        await waitForBatchedUpdates();
        const result = DateUtils.getCurrentTimezone({selected: 'Europe/London', automatic: true});
        expect(result).toEqual({
            selected: UTC,
            automatic: true,
        });
    });

    it('canUpdateTimezone should return true when lastUpdatedTimezoneTime is more than 5 minutes ago', () => {
        // Use fake timers to control the current time
        jest.useFakeTimers();
        jest.setSystemTime(addMinutes(new Date(), 6));
        const isUpdateTimezoneAllowed = DateUtils.canUpdateTimezone();
        expect(isUpdateTimezoneAllowed).toBe(true);
    });

    it('canUpdateTimezone should return false when lastUpdatedTimezoneTime is less than 5 minutes ago', () => {
        // Use fake timers to control the current time
        jest.useFakeTimers();
        DateUtils.setTimezoneUpdated();
        jest.setSystemTime(addMinutes(new Date(), 4));
        const isUpdateTimezoneAllowed = DateUtils.canUpdateTimezone();
        expect(isUpdateTimezoneAllowed).toBe(false);
    });

    it('should return the date in calendar time when calling datetimeToRelative', () => {
        jest.useFakeTimers().setSystemTime(new Date('2026-03-11T12:00:00Z'));

        // Sub-minute reads CLDR's "now" on both sides of the device clock, where date-fns said "less than a minute ago".
        const aFewSecondsAgo = subSeconds(new Date(), 10).toString();
        expect(DateUtils.datetimeToRelative(LOCALE, aFewSecondsAgo, UTC)).toBe('now');

        const aFewSecondsAhead = new Date(Date.now() + 10_000).toString();
        expect(DateUtils.datetimeToRelative(LOCALE, aFewSecondsAhead, UTC)).toBe('now');

        const aMinuteAgo = subMinutes(new Date(), 1).toString();
        expect(DateUtils.datetimeToRelative(LOCALE, aMinuteAgo, UTC)).toBe('1 minute ago');

        const anHourAgo = subHours(new Date(), 1).toString();
        expect(DateUtils.datetimeToRelative(LOCALE, anHourAgo, UTC)).toBe('1 hour ago');
    });

    it('reads a null datetime as absent, like undefined, rather than as the epoch', () => {
        // Given a datetime that is null rather than missing
        jest.useFakeTimers().setSystemTime(new Date('2026-03-11T12:00:00Z'));

        // When it is read as a local date
        const localDate = DateUtils.getLocalDateFromDatetime(LOCALE, UTC, null);

        // Then it falls back to now, because new Date(null) would silently render 1 January 1970
        expect(localDate.getUTCFullYear()).toBe(2026);
    });

    it('datetimeToRelative renders localized wording for non-English locales', async () => {
        // Given a Spanish reader and a timestamp from an hour ago
        await IntlStore.load(CONST.LOCALES.ES);
        const anHourAgo = subHours(new Date(), 1).toString();

        // When the relative time is formatted
        const result = DateUtils.datetimeToRelative(CONST.LOCALES.ES, anHourAgo, UTC);

        // Then it uses Spanish wording, because relative time comes from Intl rather than English date-fns strings
        expect(result).toMatch(/hace/);
        expect(result).not.toMatch(/ago/);
    });

    it('datetimeToRelative renders Greek wording end-to-end after IntlStore.load("el")', async () => {
        // Given Greek loaded the way the app loads a language, and a timestamp from an hour ago
        await IntlStore.load(CONST.LOCALES.EL);
        const anHourAgo = subHours(new Date(), 1).toString();

        // When the relative time is formatted for a Greek reader
        const result = DateUtils.datetimeToRelative(CONST.LOCALES.EL, anHourAgo, UTC);

        // Then it reads in Greek, which shows the locale reaches Intl through the whole load path
        expect(result).toMatch(/πριν/);
        expect(result).not.toMatch(/ago/);
    });

    it('subtractMillisecondsFromDateTime should subtract milliseconds from a given date and time', () => {
        const initialDateTime = '2023-07-18T10:30:00Z';
        const millisecondsToSubtract = 5000; // 5 seconds
        const expectedDateTime = '2023-07-18 10:29:55.000';
        const result = DateUtils.subtractMillisecondsFromDateTime(initialDateTime, millisecondsToSubtract);
        expect(result).toBe(expectedDateTime);
    });

    describe('Date Comparison Functions', () => {
        const today = new Date();
        const tomorrow = addDays(today, 1);
        const yesterday = subDays(today, 1);

        const todayInTimezone = toZonedTime(today, timezone);
        const tomorrowInTimezone = toZonedTime(tomorrow, timezone);
        const yesterdayInTimezone = toZonedTime(yesterday, timezone);

        it('isToday should correctly identify today', () => {
            expect(DateUtils.isToday(todayInTimezone, timezone)).toBe(true);
            expect(DateUtils.isToday(tomorrowInTimezone, timezone)).toBe(false);
            expect(DateUtils.isToday(yesterdayInTimezone, timezone)).toBe(false);
        });

        it('isTomorrow should correctly identify tomorrow', () => {
            expect(DateUtils.isTomorrow(tomorrowInTimezone, timezone)).toBe(true);
            expect(DateUtils.isTomorrow(todayInTimezone, timezone)).toBe(false);
            expect(DateUtils.isTomorrow(yesterdayInTimezone, timezone)).toBe(false);
        });

        it('isYesterday should correctly identify yesterday', () => {
            expect(DateUtils.isYesterday(yesterdayInTimezone, timezone)).toBe(true);
            expect(DateUtils.isYesterday(todayInTimezone, timezone)).toBe(false);
            expect(DateUtils.isYesterday(tomorrowInTimezone, timezone)).toBe(false);
        });
    });

    describe('getDBTime', () => {
        it('should return the date in the format expected by the database', () => {
            const getDBTime = DateUtils.getDBTime();
            expect(getDBTime).toBe(format(new Date(getDBTime), CONST.DATE.FNS_DB_FORMAT_STRING));
        });

        it('should represent the correct date in utc when used with a standard datetime string', () => {
            const timestamp = 'Mon Nov 21 2022 19:04:14 GMT-0800 (Pacific Standard Time)';
            const getDBTime = DateUtils.getDBTime(timestamp);
            expect(getDBTime).toBe('2022-11-22 03:04:14.000');
        });

        it('should represent the correct date in time when used with an ISO string', () => {
            const timestamp = '2022-11-22T03:08:04.326Z';
            const getDBTime = DateUtils.getDBTime(timestamp);
            expect(getDBTime).toBe('2022-11-22 03:08:04.326');
        });

        it('should represent the correct date in time when used with a unix timestamp', () => {
            const timestamp = 1669086850792;
            const getDBTime = DateUtils.getDBTime(timestamp);
            expect(getDBTime).toBe('2022-11-22 03:14:10.792');
        });
    });

    describe('formatMachineDateWithUTCTimeZone', () => {
        describe('when the date is invalid', () => {
            it('returns an empty string', () => {
                const invalidDateStr = '';

                const formattedDate = DateUtils.formatMachineDateWithUTCTimeZone(invalidDateStr);

                expect(formattedDate).toEqual('');
            });
        });

        describe('when the date is valid', () => {
            const scenarios = [
                {dateFormat: CONST.DATE.FNS_FORMAT_STRING, expectedResult: '2022-11-07'},
                {dateFormat: CONST.DATE.FNS_TIMEZONE_FORMAT_STRING, expectedResult: '2022-11-07T00:00:00Z'},
                {dateFormat: CONST.DATE.FNS_DB_FORMAT_STRING, expectedResult: '2022-11-07 00:00:00.000'},
            ];

            test.each(scenarios)('returns the date as string with the format "$dateFormat"', ({dateFormat, expectedResult}) => {
                const formattedDate = DateUtils.formatMachineDateWithUTCTimeZone(datetime, dateFormat);

                expect(formattedDate).toEqual(expectedResult);
            });
        });

        it('returns the correct date when the date with time is used', () => {
            const datetimeStr = '2022-11-07 17:48:00';
            const expectedResult = '2022-11-07';
            expect(DateUtils.formatMachineDateWithUTCTimeZone(datetimeStr)).toEqual(expectedResult);
        });
    });

    describe('getLastBusinessDayOfMonth', () => {
        const scenarios = [
            {
                // Last business day of May in 2025
                inputDate: new Date(2025, 4),
                expectedResult: 30,
            },
            {
                // Last business day  of February in 2024
                inputDate: new Date(2024, 2),
                expectedResult: 29,
            },
            {
                // Last business day of January in 2024
                inputDate: new Date(2024, 0),
                expectedResult: 31,
            },
            {
                // Last business day of September in 2023
                inputDate: new Date(2023, 8),
                expectedResult: 29,
            },
        ];

        test.each(scenarios)('returns a last business day based on the input date', ({inputDate, expectedResult}) => {
            const lastBusinessDay = DateUtils.getLastBusinessDayOfMonth(inputDate);

            expect(lastBusinessDay).toEqual(expectedResult);
        });
    });

    describe('isCardExpired', () => {
        it('should return true when the card is expired', () => {
            const cardMonth = 1;
            const cardYear = new Date().getFullYear() - 1;
            expect(DateUtils.isCardExpired(cardMonth, cardYear)).toBe(true);
        });

        it('should return false when the card is not expired', () => {
            const cardMonth = 1;
            const cardYear = new Date().getFullYear() + 1;
            expect(DateUtils.isCardExpired(cardMonth, cardYear)).toBe(false);
        });
    });

    describe('travel date formatters', () => {
        // Current year and a past year, to exercise both branches. `translate` stays English throughout, so the
        // assertions isolate the locale: it drives the weekday, the month, their order and the clock convention.
        const thisYear = new Date(2026, 2, 17, 8, 0);
        const pastYear = new Date(2023, 2, 17, 20, 30);

        beforeEach(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date(2026, 5, 1));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('getFormattedTransportDate uses the locale weekday, month and clock', () => {
            expect(DateUtils.getFormattedTransportDate(translateLocal, thisYear, CONST.LOCALES.EN)).toBe('Departs Tuesday, Mar 17 at 8:00 AM');
            expect(DateUtils.getFormattedTransportDate(translateLocal, thisYear, CONST.LOCALES.DE)).toBe('Departs Dienstag, 17. März at 08:00');
            expect(DateUtils.getFormattedTransportDate(translateLocal, thisYear, CONST.LOCALES.JA)).toBe('Departs 3月17日火曜日 at 8:00');
            // Greek is the one shipped locale besides English that keeps a 12-hour clock.
            expect(DateUtils.getFormattedTransportDate(translateLocal, thisYear, CONST.LOCALES.EL)).toBe('Departs Τρίτη 17 Μαρ at 8:00 π.μ.');
        });

        it('getFormattedTransportDate adds the year outside the current year', () => {
            expect(DateUtils.getFormattedTransportDate(translateLocal, pastYear, CONST.LOCALES.DE)).toBe('Departs Freitag, 17. März 2023 at 20:30');
        });

        it('getFormattedTransportDateAndHour returns the date and hour separately, both localized', () => {
            expect(DateUtils.getFormattedTransportDateAndHour(thisYear, CONST.LOCALES.EN)).toEqual({date: 'Tuesday, Mar 17', hour: '8:00 AM'});
            expect(DateUtils.getFormattedTransportDateAndHour(thisYear, CONST.LOCALES.DE)).toEqual({date: 'Dienstag, 17. März', hour: '08:00'});
            expect(DateUtils.getFormattedTransportDateAndHour(pastYear, CONST.LOCALES.DE)).toEqual({date: 'Freitag, 17. März 2023', hour: '20:30'});
        });
    });

    describe('getStatusUntilDate', () => {
        const currentTimeZone = 'America/Los_Angeles' as SelectedTimezone;
        const inputTimeZoneNY = 'America/New_York' as SelectedTimezone;
        const inputTimeZoneParis = 'Europe/Paris' as SelectedTimezone;
        const inputTimeZoneTokyo = 'Asia/Tokyo' as SelectedTimezone;

        beforeEach(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2025-10-19T17:00:00Z'));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('formats every branch with the given locale clock', () => {
            // `translate` stays English so the assertion isolates what the locale controls: German uses a 24-hour
            // clock and day-first dates, while the surrounding copy is untouched.
            const sameDay = tzFormat(toZonedTime(new Date('2025-10-19T22:34:00Z'), currentTimeZone), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, {timeZone: currentTimeZone});
            expect(DateUtils.getStatusUntilDate(translateLocal, sameDay, currentTimeZone, currentTimeZone, CONST.LOCALES.DE)).toBe('Until 15:34');

            const sameYear = tzFormat(toZonedTime(new Date('2025-12-02T20:15:00Z'), currentTimeZone), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, {timeZone: currentTimeZone});
            expect(DateUtils.getStatusUntilDate(translateLocal, sameYear, currentTimeZone, currentTimeZone, CONST.LOCALES.DE)).toBe('Until 2. Dez. 12:15');

            const otherYear = tzFormat(toZonedTime(new Date('2026-03-02T20:15:00Z'), currentTimeZone), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, {timeZone: currentTimeZone});
            expect(DateUtils.getStatusUntilDate(translateLocal, otherYear, currentTimeZone, currentTimeZone, CONST.LOCALES.DE)).toBe('Until 02.03.2026 12:15');
        });

        it('returns empty string when input date is empty', () => {
            expect(DateUtils.getStatusUntilDate(translateLocal, '', inputTimeZoneNY, currentTimeZone, LOCALE)).toBe('');
        });

        it('returns "Until {time}" when input and current timezone are same', () => {
            // Given a status that ends at 3:34 PM later today, set in the viewer's own timezone
            const nowInTZ = toZonedTime(new Date(), currentTimeZone);
            const targetTime = set(nowInTZ, {hours: 15, minutes: 34, seconds: 0, milliseconds: 0});
            const inputDateStr = tzFormat(targetTime, CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, {timeZone: currentTimeZone});

            // When its end is described for an English reader
            const result = DateUtils.getStatusUntilDate(translateLocal, inputDateStr, currentTimeZone, currentTimeZone, LOCALE);

            // Then only the time is shown, because the day is implied when the status ends today
            expect(result).toBe('Until 3:34 PM');
        });

        it('returns "Until tomorrow" when end of day is in the same timezone', () => {
            const nowInCurrent = toZonedTime(new Date(), currentTimeZone);
            const endOfTodayCurrent = endOfDay(nowInCurrent);

            const inputDateStrNY = tzFormat(endOfTodayCurrent, CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, {timeZone: inputTimeZoneNY});

            const result = DateUtils.getStatusUntilDate(translateLocal, inputDateStrNY, inputTimeZoneNY, inputTimeZoneNY, LOCALE);
            expect(result).toBe('Until tomorrow');
        });

        it('returns "Until {time}" for later today in a different timezone', () => {
            // Given a status set in New York for 3:34 PM, which is 12:34 PM for a viewer in Los Angeles
            const targetTimeLA = set(toZonedTime(new Date(), currentTimeZone), {hours: 15, minutes: 34, seconds: 0, milliseconds: 0});
            const inputDateStrNY = tzFormat(targetTimeLA, CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, {timeZone: inputTimeZoneNY});

            // When its end is described for the Los Angeles viewer
            const result = DateUtils.getStatusUntilDate(translateLocal, inputDateStrNY, inputTimeZoneNY, currentTimeZone, LOCALE);

            // Then the time is the viewer's own, because the reader acts on their clock, not the author's
            expect(result).toBe('Until 12:34 PM');
        });

        it('returns "Until {month-day} {time}" for future date within the same year in a different timezone', () => {
            // Given a status set in Paris that ends two days from now, later this year
            const twoDaysLaterLA = addDays(set(toZonedTime(new Date(), currentTimeZone), {hours: 15, minutes: 0, seconds: 0, milliseconds: 0}), 2);
            const inputDateStrParis = tzFormat(twoDaysLaterLA, CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, {timeZone: inputTimeZoneParis});

            // When its end is described for a viewer in Los Angeles
            const result = DateUtils.getStatusUntilDate(translateLocal, inputDateStrParis, inputTimeZoneParis, currentTimeZone, LOCALE);

            // Then the month and day are added in the viewer's timezone, but not the year, since it is this year
            const date = fromZonedTime(inputDateStrParis, inputTimeZoneParis);
            const monthDay = intlFormatForTest(date, CONST.DATE.INTL_FORMATS.MONTH_DAY, currentTimeZone);
            const time = intlFormatForTest(date, CONST.DATE.INTL_FORMATS.SHORT_TIME, currentTimeZone);
            expect(result).toBe(`Until ${monthDay} ${time}`);
        });

        it('returns "Until {month-day} {time}" when "until today" crosses into next day in current timezone', () => {
            // Given a status set to end of today in Tokyo, which is already tomorrow for a viewer in Los Angeles
            const endOfTodayTokyo = endOfDay(toZonedTime(new Date(), inputTimeZoneTokyo));
            const inputDateStrTokyo = tzFormat(endOfTodayTokyo, CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, {timeZone: inputTimeZoneTokyo});

            // When its end is described for the Los Angeles viewer
            const result = DateUtils.getStatusUntilDate(translateLocal, inputDateStrTokyo, inputTimeZoneTokyo, currentTimeZone, LOCALE);

            // Then it names the day and time, because "until tomorrow" is only true in the author's timezone
            const date = fromZonedTime(inputDateStrTokyo, inputTimeZoneTokyo);
            const monthDay = intlFormatForTest(date, CONST.DATE.INTL_FORMATS.MONTH_DAY, currentTimeZone);
            const time = intlFormatForTest(date, CONST.DATE.INTL_FORMATS.SHORT_TIME, currentTimeZone);
            expect(result).toBe(`Until ${monthDay} ${time}`);
        });

        it('returns "Until {medium-date} {time}" for a date in a different year across timezones', () => {
            // Given a status set in Tokyo that ends early next year for a viewer in Los Angeles
            const laFutureDateStr = '2026-01-02 09:15:00';
            const inputDateStrTokyo = tzFormat(fromZonedTime(laFutureDateStr, currentTimeZone), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, {timeZone: inputTimeZoneTokyo});

            // When its end is described for the Los Angeles viewer
            const result = DateUtils.getStatusUntilDate(translateLocal, inputDateStrTokyo, inputTimeZoneTokyo, currentTimeZone, LOCALE);

            // Then the full date with its year is shown, because a month and day alone would read as this year
            const date = fromZonedTime(inputDateStrTokyo, inputTimeZoneTokyo);
            const fullDate = intlFormatForTest(date, CONST.DATE.INTL_FORMATS.MEDIUM_DATE, currentTimeZone);
            const time = intlFormatForTest(date, CONST.DATE.INTL_FORMATS.SHORT_TIME, currentTimeZone);
            expect(result).toBe(`Until ${fullDate} ${time}`);
        });
    });

    describe('formatInUTCTo*', () => {
        // A local-midnight Date under a UTC-zone formatter shifts a day for UTC+ viewers, so `toUTCDate` anchors at UTC midnight.
        it.each(['en', 'es'] as const)('formatInUTCToMedium renders the input calendar day in %s regardless of viewer timezone', (locale) => {
            // Given a date-only value, which names a calendar day rather than an instant
            // When it is rendered as a medium date
            const result = DateUtils.formatInUTCToMedium('2025-08-19', locale);

            // Then it shows that same day, in the reader's language, whatever timezone the device is in
            const expected = new Intl.DateTimeFormat(locale, {dateStyle: 'medium', timeZone: 'UTC'}).format(new Date('2025-08-19T00:00:00Z'));
            expect(result).toBe(expected);
        });

        it.each(['en', 'es'] as const)('formatTransactionListDate renders a current-year day in %s regardless of viewer timezone', (locale) => {
            // Given a transaction on 1 January of this year, the day most likely to slip into the previous year
            const currentYear = new Date().getUTCFullYear();
            const wireDate = `${currentYear}-01-01`;

            // When it is rendered for the transaction list
            const result = DateUtils.formatTransactionListDate(wireDate, locale);

            // Then it shows that same day without a year, in the reader's language, whatever timezone the device is in
            const expected = new Intl.DateTimeFormat(locale, {month: 'short', day: 'numeric', timeZone: 'UTC'}).format(new Date(`${wireDate}T00:00:00Z`));
            expect(result).toBe(expected);
        });

        it.each(['en', 'es'] as const)('formatInUTCToLong renders the input calendar day in %s regardless of viewer timezone', (locale) => {
            // Given the last day of a year, where a one-day shift would also change the year
            // When it is rendered as a long date
            const result = DateUtils.formatInUTCToLong('2025-12-31', locale);

            // Then it shows that same day, in the reader's language, whatever timezone the device is in
            const expected = new Intl.DateTimeFormat(locale, {dateStyle: 'long', timeZone: 'UTC'}).format(new Date('2025-12-31T00:00:00Z'));
            expect(result).toBe(expected);
        });

        it('parses DB wire timestamps (yyyy-MM-dd HH:mm:ss) as UTC, not local — UTC+ viewers must not see day-shift', () => {
            // Given a database timestamp just after midnight UTC, which V8 and Hermes parse as local time, so UTC+5:30 would read it as 31 December
            // When it is rendered as a medium date
            const result = DateUtils.formatInUTCToMedium('2026-01-01 00:30:00', 'en');

            // Then it stays on 1 January 2026, because the timestamp is read as UTC
            expect(result).toMatch(/Jan\s*1\D.*2026/);
        });
    });

    describe('formatTravelDate inputs', () => {
        const travelDate = new Date('2025-08-19T14:30:00Z');

        it('formatToMediumDate renders es as "19 ago 2025"', () => {
            // Given a travel date read by a Spanish user
            // When it is rendered as a medium date
            const es = DateUtils.formatToMediumDate(travelDate, 'es');

            // Then the month is Spanish rather than the English abbreviation, because travel details follow the reader's language
            expect(es).toMatch(/19/);
            expect(es).toMatch(/ago/);
            expect(es).not.toMatch(/Aug/);
        });

        it('formatToLocalTime renders es in 24h', () => {
            // Given a travel time read by a Spanish user
            // When it is rendered as a local time
            const es = DateUtils.formatToLocalTime(travelDate, 'es');

            // Then there is no AM/PM, because Spanish uses a 24-hour clock
            expect(es).not.toMatch(/AM|PM/);
        });

        it('formatToLocalTime renders en in 12h with AM/PM', () => {
            // Given the same travel time read by an English user
            // When it is rendered as a local time
            const en = DateUtils.formatToLocalTime(travelDate, 'en');

            // Then it keeps AM/PM, so moving to the locale clock did not change English
            expect(en).toMatch(/AM|PM/);
        });
    });

    describe('getDaysOfWeekNarrow', () => {
        it('en narrow labels are single-letter weekday initials', () => {
            // Given an English reader of the calendar picker header
            // When the narrow weekday labels are built
            const en = DateUtils.getDaysOfWeekNarrow('en');

            // Then there are seven single-letter initials, the compact form a calendar header needs
            expect(en).toHaveLength(7);
            expect(en.every((d) => d.length === 1)).toBe(true);
        });

        it('zh-hans narrow labels are 7 distinct characters', () => {
            // Given a Simplified Chinese reader, whose weekday names all start with the same character 星
            // When the narrow weekday labels are built
            const zh = DateUtils.getDaysOfWeekNarrow('zh-hans');

            // Then the seven labels are distinct, because cutting the full name to one character would show 星 seven times
            const distinct = new Set(zh);
            expect(distinct.size).toBe(7);
            expect(zh.every((d) => d !== '星')).toBe(true);
        });
    });

    describe('getLocalizedDatePlaceholder', () => {
        it.each(['en', 'es', 'de', 'fr', 'it', 'nl', 'pl', 'pt-BR', 'ja', 'zh-hans'] as const)('%s placeholder follows locale field order and separator', (locale) => {
            // Given a reader of a supported language filling in a date field
            // When the field's placeholder is built
            const placeholder = DateUtils.getLocalizedDatePlaceholder(locale);

            // Then it is a day, month and year in some order with one consistent separator, so the hint matches how that language writes dates
            expect(placeholder).toMatch(/^(MM|DD|YYYY)([./-])(MM|DD|YYYY)\2(MM|DD|YYYY)$/);
        });

        it('en placeholder is MM/DD/YYYY', () => {
            // Given an English reader filling in a date field
            // When the field's placeholder is built
            const placeholder = DateUtils.getLocalizedDatePlaceholder('en');

            // Then it is the US order, not the machine format the field used to show
            expect(placeholder).toBe('MM/DD/YYYY');
            expect(placeholder).not.toBe('YYYY-MM-DD');
        });

        it('de uses dot separator', () => {
            // Given a German reader filling in a date field
            // When the field's placeholder is built
            const placeholder = DateUtils.getLocalizedDatePlaceholder('de');

            // Then it is day first with dots, because the separator comes from the locale too, not only the order
            expect(placeholder).toBe('DD.MM.YYYY');
        });

        it('ja places year first', () => {
            // Given a Japanese reader filling in a date field
            // When the field's placeholder is built
            const placeholder = DateUtils.getLocalizedDatePlaceholder('ja');

            // Then the year comes first, as Japanese writes dates
            expect(placeholder).toMatch(/^YYYY/);
        });
    });

    describe('formatToLocalizedShortDate', () => {
        it.each([
            ['en', '01/05/2026'],
            ['de', '05.01.2026'],
            ['ja', '2026/01/05'],
        ] as const)('renders 2026-01-05 as %s in %s', (locale, expected) => {
            // Given a stored date whose day and month differ, so a swapped order would show
            // When it is rendered as a short date
            const result = DateUtils.formatToLocalizedShortDate('2026-01-05', locale);

            // Then it follows the reader's language order and separator
            expect(result).toBe(expected);
        });

        it('never renders the canonical "yyyy-MM-dd" form to en users', () => {
            // Given a stored date in the machine format
            // When it is rendered as a short date for an English reader
            const result = DateUtils.formatToLocalizedShortDate('2026-01-05', 'en');

            // Then it is not shown as stored, because that format is meant for storage, not display
            expect(result).not.toBe('2026-01-05');
        });

        it('date-only input renders the same calendar day for every viewer timezone', () => {
            // Given a date-only value, which names a calendar day rather than an instant
            // When it is rendered for an English and a Japanese reader
            const en = DateUtils.formatToLocalizedShortDate('2025-08-19', 'en');
            const ja = DateUtils.formatToLocalizedShortDate('2025-08-19', 'ja');

            // Then both show 19 August, because a date without a time must not shift with the device timezone
            expect(en).toContain('08');
            expect(en).toContain('19');
            expect(ja).toContain('08');
            expect(ja).toContain('19');
        });

        it.each(['en', 'de', 'ja', 'ko', 'es', 'fr', 'pt-BR', 'it', 'nl', 'pl', 'zh-hans', 'zh-hant'] as const)(
            'placeholder and formatted value share the same field order and separators (%s)',
            (locale) => {
                // Given the two formats a date field uses, the short date style for the value and numeric fields for the placeholder
                const sample = new Date(Date.UTC(2024, 11, 31));
                const literalsFromPreset = (options: Intl.DateTimeFormatOptions) =>
                    new Intl.DateTimeFormat(locale, options)
                        .formatToParts(sample)
                        .filter((p) => p.type === 'literal')
                        .map((p) => p.value);
                const orderFromPreset = (options: Intl.DateTimeFormatOptions) =>
                    new Intl.DateTimeFormat(locale, options)
                        .formatToParts(sample)
                        .filter((p) => p.type !== 'literal')
                        .map((p) => p.type);

                // When each lays out the same date
                const valueOrder = orderFromPreset({dateStyle: 'short'});
                const placeholderOrder = orderFromPreset({year: 'numeric', month: '2-digit', day: '2-digit'});
                const valueSeparators = literalsFromPreset({dateStyle: 'short'});
                const placeholderSeparators = literalsFromPreset({year: 'numeric', month: '2-digit', day: '2-digit'});

                // Then the fields and separators match, because a mismatch would pair an "MM/DD/YYYY" hint with a "05.01.2026" value
                expect(valueOrder).toEqual(placeholderOrder);
                expect(valueSeparators).toEqual(placeholderSeparators);
            },
        );
    });

    describe('formatToLocalDateTime', () => {
        it.each([
            [CONST.LOCALES.EN, 'Sep 18, 2026, 2:30 PM'],
            [CONST.LOCALES.ES, '18 sept 2026, 14:30'],
        ] as const)('renders the date and time in the order and clock of %s', (locale, expected) => {
            // Given an afternoon date and time
            // When it is rendered as one local date and time
            const result = DateUtils.formatToLocalDateTime(new Date(2026, 8, 18, 14, 30), locale);

            // Then the language decides both the date order and the clock, so they never mix conventions
            expect(result).toBe(expected);
        });
    });

    describe('getMonthNames / getFilteredMonthItems', () => {
        it('keeps a month as written inside a sentence and capitalizes it only as a picker label', () => {
            // Given the Spanish month names, which Spanish writes in lower case
            // When they are read raw and then turned into month picker items
            const spanishMonths = DateUtils.getMonthNames(CONST.LOCALES.ES);
            const pickerItem = DateUtils.getFilteredMonthItems(spanishMonths, 0).at(0);

            // Then only the picker label is capitalized, because a month inside a sentence must stay lower case
            expect(spanishMonths.at(0)).toBe('enero');
            expect(pickerItem?.text).toBe('Enero');
        });
    });

    describe('getWeekStartsOn / getWeekEndsOn', () => {
        it.each([
            ['en', 1, 0],
            ['es', 1, 0],
            ['el', 1, 0],
            ['ja', 0, 6],
            ['pt-BR', 0, 6],
        ] as const)('locale %s starts on %i and ends on %i', (locale, start, end) => {
            // Given a language with a known first day of the week
            // When the week bounds are read
            const weekStartsOn = DateUtils.getWeekStartsOn(locale);
            const weekEndsOn = DateUtils.getWeekEndsOn(locale);

            // Then they match that convention, because calendars and "this week" groups rely on them
            expect(weekStartsOn).toBe(start);
            expect(weekEndsOn).toBe(end);
        });

        it('returns a valid weekday for every supported locale', () => {
            // Given every language the app ships
            for (const locale of Object.values(CONST.LOCALES)) {
                if (locale === CONST.LOCALES.DEFAULT) {
                    continue;
                }

                // When its first day of the week is read
                const weekStartsOn = DateUtils.getWeekStartsOn(locale);

                // Then it is a real weekday, so a newly added language can never leave the calendar without a start
                expect([0, 1, 2, 3, 4, 5, 6]).toContain(weekStartsOn);
            }
        });

        describe('CLDR parity', () => {
            it('the week-start table reproduces Intl.Locale.getWeekInfo for every supported locale', () => {
                // Given an engine that reports week info, and every shipped language except en, whose override is tested below
                const probe = new Intl.Locale(CONST.LOCALES.EN);
                expect(typeof probe.getWeekInfo).toBe('function');
                for (const locale of Object.values(CONST.LOCALES)) {
                    if (locale === CONST.LOCALES.DEFAULT) {
                        continue;
                    }

                    // When the app's table and the engine are asked for the first day of the week
                    const weekInfo = new Intl.Locale(locale).getWeekInfo();
                    const intlFirstDay = weekInfo.firstDay === 7 ? 0 : weekInfo.firstDay;

                    // Then they agree, because the table stands in for getWeekInfo on engines that do not have it
                    expect({locale, weekStartsOn: DateUtils.getWeekStartsOn(locale)}).toEqual({locale, weekStartsOn: intlFirstDay});
                }
            });

            it('pins en to Monday, deliberately against CLDR', () => {
                // Given an engine that says English weeks start on Sunday
                const probe = new Intl.Locale(CONST.LOCALES.EN);
                expect(typeof probe.getWeekInfo).toBe('function');
                const weekInfo = probe.getWeekInfo();
                expect(weekInfo.firstDay === 7 ? 0 : weekInfo.firstDay).toBe(0);

                // When the app reads the English first day of the week
                const weekStartsOn = DateUtils.getWeekStartsOn(CONST.LOCALES.EN);

                // Then it is Monday, because following CLDR's Sunday would move the calendar for every existing English user
                expect(weekStartsOn).toBe(1);
            });
        });
    });

    describe('formatInTimeZoneTo* (date-only inputs degrade to "")', () => {
        it.each([
            ['formatInTimeZoneToLong' as const, '2025-08-19'],
            ['formatInTimeZoneToShortTime' as const, '2025-08-19'],
            ['formatInTimeZoneToWeekday' as const, '2025-08-19'],
        ])('%s returns "" instead of throwing on unzoned input', (fnName, dateStr) => {
            // Given a date-only value, which has no instant to place in a timezone
            // When a timezone formatter is asked to render it
            const run = () => DateUtils[fnName](dateStr, 'America/New_York', 'en');

            // Then it returns empty rather than throwing, because a throw here would crash the screen showing it
            expect(run).not.toThrow();
            expect(run()).toBe('');
        });
    });

    describe('getFormattedSplitDateRange', () => {
        it('should return empty string when startDate is undefined', () => {
            const result = DateUtils.getFormattedSplitDateRange(undefined, '2024-01-15', LOCALE);
            expect(result).toBe('');
        });

        it('should return empty string when endDate is undefined', () => {
            const result = DateUtils.getFormattedSplitDateRange('2024-01-10', undefined, LOCALE);
            expect(result).toBe('');
        });

        it('should return empty string when both dates are undefined', () => {
            const result = DateUtils.getFormattedSplitDateRange(undefined, undefined, LOCALE);
            expect(result).toBe('');
        });

        it('should return empty string when a date is unparsable', () => {
            // Given a split whose start date cannot be parsed
            // When its date range is formatted
            const result = DateUtils.getFormattedSplitDateRange('not-a-date', '2024-01-15', LOCALE);

            // Then it is empty rather than throwing, because a throw would break the screen that shows the range
            expect(result).toBe('');
        });

        it('should return plural form for multiple days', () => {
            const result = DateUtils.getFormattedSplitDateRange('2024-01-10', '2024-01-15', LOCALE);
            expect(result).toContain('Jan 10, 2024');
            expect(result).toContain('to');
            expect(result).toContain('Jan 15, 2024');
            expect(result).toContain('6 days');
        });

        it('should return correct format for 2 days', () => {
            const result = DateUtils.getFormattedSplitDateRange('2024-01-10', '2024-01-11', LOCALE);
            expect(result).toContain('Jan 10, 2024');
            expect(result).toContain('to');
            expect(result).toContain('Jan 11, 2024');
            expect(result).toContain('2 days');
        });

        it('should handle cross-month date ranges', () => {
            const result = DateUtils.getFormattedSplitDateRange('2024-01-25', '2024-02-05', LOCALE);
            expect(result).toContain('Jan 25, 2024');
            expect(result).toContain('to');
            expect(result).toContain('Feb 5, 2024');
            expect(result).toContain('12 days');
        });

        it('should handle cross-year date ranges', () => {
            const result = DateUtils.getFormattedSplitDateRange('2023-12-25', '2024-01-05', LOCALE);
            expect(result).toContain('Dec 25, 2023');
            expect(result).toContain('to');
            expect(result).toContain('Jan 5, 2024');
            expect(result).toContain('12 days');
        });

        it('should localize the dates rather than emitting the wire shape', async () => {
            // Given a Spanish reader and split dates stored in the machine format
            await IntlStore.load(CONST.LOCALES.ES);

            // When the split's date range is formatted
            const result = DateUtils.getFormattedSplitDateRange('2024-01-10', '2024-01-15', CONST.LOCALES.ES);

            // Then the dates, connector and day count all read in Spanish, because the stored format is not meant for display
            expect(result).toBe('10 ene 2024 al 15 ene 2024 (6 días)');
        });

        it('should use the singular form when the range is one day', () => {
            // Given a split that starts and ends on the same day
            // When its date range is formatted
            const result = DateUtils.getFormattedSplitDateRange('2024-01-10', '2024-01-10', LOCALE);

            // Then it counts "1 day", because a range that includes both ends is never zero days
            expect(result).toBe('Jan 10, 2024 to Jan 10, 2024 (1 day)');
        });

        it('should select the singular form per locale, not English two-form rules', async () => {
            // Given Spanish and Polish readers, whose plural rules differ from English
            await IntlStore.load(CONST.LOCALES.ES);

            // When one-day and three-day ranges are formatted for each
            const spanishOneDay = DateUtils.getFormattedSplitDateRange('2024-01-10', '2024-01-10', CONST.LOCALES.ES);
            await IntlStore.load(CONST.LOCALES.PL);
            const polishOneDay = DateUtils.getFormattedSplitDateRange('2024-01-10', '2024-01-10', CONST.LOCALES.PL);
            const polishThreeDays = DateUtils.getFormattedSplitDateRange('2024-01-10', '2024-01-12', CONST.LOCALES.PL);

            // Then each count takes its language's form, because Polish needs more than English's one and other
            expect(spanishOneDay).toContain('(1 día)');
            expect(polishOneDay).toContain('(1 dzień)');
            expect(polishThreeDays).toContain('(3 dni)');
        });
    });

    describe('formatCountdownTimer', () => {
        const mockTranslate: LocaleContextProps['translate'] = (path, ...params) => translate(LOCALE, path, ...params);

        it('should format hours, minutes, and seconds correctly', () => {
            const result = DateUtils.formatCountdownTimer(mockTranslate, 5, 30, 45);
            expect(result).toBe('5h : 30m : 45s');
        });

        it('should pad single digit minutes with leading zero', () => {
            const result = DateUtils.formatCountdownTimer(mockTranslate, 2, 5, 30);
            expect(result).toBe('2h : 05m : 30s');
        });

        it('should pad single digit seconds with leading zero', () => {
            const result = DateUtils.formatCountdownTimer(mockTranslate, 1, 15, 8);
            expect(result).toBe('1h : 15m : 08s');
        });

        it('should pad both minutes and seconds with leading zeros', () => {
            const result = DateUtils.formatCountdownTimer(mockTranslate, 0, 3, 7);
            expect(result).toBe('0h : 03m : 07s');
        });

        it('should handle zero values for all parameters', () => {
            const result = DateUtils.formatCountdownTimer(mockTranslate, 0, 0, 0);
            expect(result).toBe('0h : 00m : 00s');
        });

        it('should handle large hour values', () => {
            const result = DateUtils.formatCountdownTimer(mockTranslate, 23, 59, 59);
            expect(result).toBe('23h : 59m : 59s');
        });
    });

    describe('formatUTCDateTimeToDateInTimezone', () => {
        const originalTZ = process.env.TZ;

        beforeEach(() => {
            process.env.TZ = 'UTC';
        });

        afterEach(() => {
            process.env.TZ = originalTZ;
        });

        it('should return empty string when utcDateTime is empty', () => {
            expect(DateUtils.formatUTCDateTimeToDateInTimezone('', UTC)).toBe('');
        });

        it('should return empty string when timeZone is empty', () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            expect(DateUtils.formatUTCDateTimeToDateInTimezone('2024-01-15 08:00:00', '' as SelectedTimezone)).toBe('');
        });

        it('should return date in yyyy-MM-dd format when timeZone is UTC', () => {
            const result = DateUtils.formatUTCDateTimeToDateInTimezone('2024-01-15 08:00:00', UTC);
            expect(result).toBe('2024-01-15');
        });

        it('should convert UTC datetime to target timezone date', () => {
            // America/New_York is UTC-5 in January (EST), so 2024-01-15 08:00:00 UTC = 2024-01-15 03:00:00 EST
            const americaNewYork = 'America/New_York' as SelectedTimezone;
            const result = DateUtils.formatUTCDateTimeToDateInTimezone('2024-01-15 08:00:00', americaNewYork);
            expect(result).toBe('2024-01-15');
        });

        it('should handle UTC datetime that falls on previous day in target timezone', () => {
            // America/New_York is UTC-5, so 2024-01-15 02:00:00 UTC = 2024-01-14 21:00:00 EST
            const americaNewYork = 'America/New_York' as SelectedTimezone;
            const result = DateUtils.formatUTCDateTimeToDateInTimezone('2024-01-15 02:00:00', americaNewYork);
            expect(result).toBe('2024-01-14');
        });

        it('should handle UTC datetime with milliseconds', () => {
            const result = DateUtils.formatUTCDateTimeToDateInTimezone('2024-01-15 08:00:00.000', UTC);
            expect(result).toBe('2024-01-15');
        });

        it('should handle date-only format (parses as midnight UTC)', () => {
            const result = DateUtils.formatUTCDateTimeToDateInTimezone('2024-01-15', UTC);
            expect(result).toBe('2024-01-15');
        });

        it('should return empty string for invalid date', () => {
            const result = DateUtils.formatUTCDateTimeToDateInTimezone('invalid-date', UTC);
            expect(result).toBe('');
        });
    });

    describe('formatViolationSnapshotStartedAtDate', () => {
        const originalTZ = process.env.TZ;

        beforeEach(() => {
            process.env.TZ = 'UTC';
        });

        afterEach(() => {
            process.env.TZ = originalTZ;
        });

        it('should return empty string when violationSnapshotStartedAt is empty', () => {
            expect(DateUtils.formatViolationSnapshotStartedAtDate('', UTC, CONST.LOCALES.EN)).toBe('');
        });

        it('should return empty string when timeZone is undefined', () => {
            expect(DateUtils.formatViolationSnapshotStartedAtDate('2026-06-20', undefined, CONST.LOCALES.EN)).toBe('');
        });

        it('should format a date-only value in the target timezone', () => {
            const result = DateUtils.formatViolationSnapshotStartedAtDate('2026-06-20', UTC, CONST.LOCALES.EN);
            expect(result).toBe('June 20, 2026');
        });

        it('should format a UTC datetime value in the target timezone', () => {
            const result = DateUtils.formatViolationSnapshotStartedAtDate('2026-06-20 00:00:00', UTC, CONST.LOCALES.EN);
            expect(result).toBe('June 20, 2026');
        });

        it('should format a UTC datetime using the target timezone date', () => {
            const americaNewYork = 'America/New_York' as SelectedTimezone;
            const result = DateUtils.formatViolationSnapshotStartedAtDate('2026-06-20 02:00:00', americaNewYork, CONST.LOCALES.EN);
            expect(result).toBe('June 19, 2026');
        });

        it('should return empty string for invalid date', () => {
            const result = DateUtils.formatViolationSnapshotStartedAtDate('invalid-date', UTC, CONST.LOCALES.EN);
            expect(result).toBe('');
        });
    });

    describe('normalizeDateToStartOfDay', () => {
        const originalTZ = process.env.TZ;

        beforeEach(() => {
            process.env.TZ = 'UTC';
        });

        afterEach(() => {
            process.env.TZ = originalTZ;
        });

        it('should return midnight local time as UTC in DB format when timeZone is UTC', () => {
            const result = DateUtils.normalizeDateToStartOfDay('2024-01-15', UTC);
            expect(result).toBe('2024-01-15 00:00:00');
        });

        it('should match getDBTime of startOfDay for the parsed date (without milliseconds)', () => {
            const dateStr = '2022-11-07';
            const result = DateUtils.normalizeDateToStartOfDay(dateStr, UTC);
            const expected = DateUtils.getDBTime(fromZonedTime(startOfDay(new Date(`${dateStr}T00:00:00.000Z`)), UTC).valueOf()).replace(/\.\d{3}$/, '');
            expect(result).toBe(expected);
        });

        it('should return midnight in target timezone as UTC in DB format when timeZone is not UTC', () => {
            // America/New_York is UTC-5 in January (EST), so 2024-01-15 00:00:00 EST = 2024-01-15 05:00:00 UTC
            const americaNewYork = 'America/New_York' as SelectedTimezone;
            const result = DateUtils.normalizeDateToStartOfDay('2024-01-15', americaNewYork);
            expect(result).toBe('2024-01-15 05:00:00');
        });
    });

    describe('normalizeDateToEndOfDay', () => {
        const originalTZ = process.env.TZ;

        beforeEach(() => {
            process.env.TZ = 'UTC';
        });

        afterEach(() => {
            process.env.TZ = originalTZ;
        });

        it('should return end of day local time as UTC in DB format when timeZone is UTC', () => {
            const result = DateUtils.normalizeDateToEndOfDay('2024-01-15', UTC);
            expect(result).toBe('2024-01-15 23:59:59');
        });

        it('should match getDBTime of endOfDay for the parsed date (without milliseconds)', () => {
            const dateStr = '2022-11-07';
            const result = DateUtils.normalizeDateToEndOfDay(dateStr, UTC);
            const expected = DateUtils.getDBTime(fromZonedTime(endOfDay(new Date(`${dateStr}T00:00:00.000Z`)), UTC).valueOf()).replace(/\.\d{3}$/, '');
            expect(result).toBe(expected);
        });

        it('should return end of day in target timezone as UTC in DB format when timeZone is not UTC', () => {
            // America/New_York is UTC-5 in January (EST), so 2024-01-15 23:59:59 EST = 2024-01-16 04:59:59 UTC
            const americaNewYork = 'America/New_York' as SelectedTimezone;
            const result = DateUtils.normalizeDateToEndOfDay('2024-01-15', americaNewYork);
            expect(result).toBe('2024-01-16 04:59:59');
        });
    });

    describe('getFormattedCancellationDate', () => {
        it('should format the date using the venue timezone embedded in the ISO string', () => {
            // Pin "now" before 2026 so the 2026 date is treated as a non-current year and the year is shown.
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));
            // 2026-04-19T15:00:00+07:00 — venue is UTC+7, device timezone is UTC
            const result = DateUtils.getFormattedCancellationDate('2026-04-19T15:00:00+07:00', CONST.LOCALES.EN);
            // Should display 3:00 PM in the venue's +07:00 timezone, not converted to device-local time
            expect(result).toBe('Sunday, Apr 19, 2026 3:00 PM, GMT+7');
        });

        it('should format without year when date is in the current year', () => {
            // Pin "now" to 2026 so the 2026 date is treated as the current year and the year is omitted.
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2026-06-01T00:00:00Z'));
            const result = DateUtils.getFormattedCancellationDate('2026-06-15T10:30:00+00:00', CONST.LOCALES.EN);
            expect(result).toBe('Monday, Jun 15 10:30 AM, UTC');
        });

        it('should return empty string for falsy input', () => {
            expect(DateUtils.getFormattedCancellationDate('', CONST.LOCALES.EN)).toBe('');
        });

        it('should fall back to UTC when no timezone offset is present in the ISO string', () => {
            // Pin "now" before 2026 so the 2026 date is treated as a non-current year and the year is shown.
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));
            const result = DateUtils.getFormattedCancellationDate('2026-04-19T15:00:00', CONST.LOCALES.EN);
            expect(result).toBe('Sunday, Apr 19, 2026 3:00 PM, UTC');
        });

        it('date-only input is treated as UTC — trailing `-DD` must not match as a spurious GMT-DD offset', () => {
            // Given a cancellation deadline with no time, whose trailing "-19" looks like a GMT-19 offset
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));

            // When it is formatted for the reader
            const result = DateUtils.getFormattedCancellationDate('2026-04-19', CONST.LOCALES.EN);

            // Then it is read as UTC midnight, because treating the day as an offset would invent a timezone and move the deadline
            expect(result).toBe('Sunday, Apr 19, 2026 12:00 AM, UTC');
        });

        it('renders non-English locales with locale-driven field order + clock (not just token translation)', () => {
            // Given a 3 PM cancellation deadline at a venue seven hours ahead of UTC
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));

            // When it is formatted for a Spanish reader
            const es = DateUtils.getFormattedCancellationDate('2026-04-19T15:00:00+07:00', CONST.LOCALES.ES);

            // Then it uses the 24-hour 15:00 and keeps the venue offset, where a translated date-fns pattern would keep English order and "3:00 PM"
            expect(es).not.toMatch(/AM|PM/);
            expect(es).toContain('15:00');
            expect(es).toContain('GMT+7');
        });

        it('should use the given locale for the weekday, the month, their order and the clock', () => {
            // Given one venue deadline read in German, Japanese and Greek, three different ways of writing a date and time
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));

            // When it is formatted for each reader
            const german = DateUtils.getFormattedCancellationDate('2026-04-19T15:00:00+07:00', CONST.LOCALES.DE);
            const japanese = DateUtils.getFormattedCancellationDate('2026-04-19T15:00:00+07:00', CONST.LOCALES.JA);
            const greek = DateUtils.getFormattedCancellationDate('2026-04-19T15:00:00+07:00', CONST.LOCALES.EL);

            // Then each follows its own order and clock: German and Japanese drop the meridiem, while Greek keeps a 12-hour clock with its own marker
            expect(german).toBe('Sonntag, 19. Apr. 2026 15:00, GMT+7');
            expect(japanese).toBe('2026年4月19日日曜日 15:00, GMT+7');
            expect(greek).toBe('Κυριακή 19 Απρ 2026 3:00 μ.μ., GMT+7');
        });
    });

    // CI runs TZ=UTC, which hides a missing timeZone arg from output-based tests. Isolate for a cold memoize cache.
    describe('formatInUTCTo* passes timeZone: "UTC" to Intl.DateTimeFormat', () => {
        function collectDateTimeFormatOptions(runOnFreshDateUtils: (fresh: typeof DateUtils) => void): Intl.DateTimeFormatOptions[] {
            const observed: Intl.DateTimeFormatOptions[] = [];
            const originalDTF = Intl.DateTimeFormat;
            function MockDTF(_locale?: string, options?: Intl.DateTimeFormatOptions) {
                if (options) {
                    observed.push(options);
                }
                return {format: () => '', formatToParts: () => []};
            }
            Object.defineProperty(Intl, 'DateTimeFormat', {value: MockDTF, configurable: true, writable: true});
            try {
                jest.isolateModules(() => {
                    const fresh = jest.requireActual<{default: typeof DateUtils}>('@libs/DateUtils').default;
                    runOnFreshDateUtils(fresh);
                });
            } finally {
                Object.defineProperty(Intl, 'DateTimeFormat', {value: originalDTF, configurable: true, writable: true});
            }
            return observed;
        }

        it.each(['formatInUTCToMedium', 'formatTransactionListDate', 'formatInUTCToLong'] as const)('%s uses timeZone: "UTC"', (fnName) => {
            // Given a freshly loaded formatter module whose Intl formatters record the options they are built with
            // When it formats a date-only value
            const observed = collectDateTimeFormatOptions((fresh) => {
                fresh[fnName]('2026-01-15', CONST.LOCALES.EN);
            });

            // Then a UTC formatter is built, so the calendar day never shifts with the device timezone
            expect(observed.some((o) => o.timeZone === 'UTC')).toBe(true);
        });

        it('formatToLocalizedShortDate uses timeZone: "UTC"', () => {
            // Given a freshly loaded formatter module whose Intl formatters record the options they are built with
            // When it formats a date-only value as a short date
            const observed = collectDateTimeFormatOptions((fresh) => {
                fresh.formatToLocalizedShortDate('2026-01-15', CONST.LOCALES.EN);
            });

            // Then a UTC formatter is built, so the value in a date field never shifts with the device timezone
            expect(observed.some((o) => o.timeZone === 'UTC')).toBe(true);
        });
    });

    describe('render-path formatters degrade to "" on Invalid Date', () => {
        it.each([
            ['formatToReadableString', () => DateUtils.formatToReadableString('not-a-date', CONST.LOCALES.EN)],
            ['formatToMediumDate', () => DateUtils.formatToMediumDate('not-a-date', CONST.LOCALES.EN)],
            ['formatToLocalizedShortDate', () => DateUtils.formatToLocalizedShortDate('not-a-date', CONST.LOCALES.EN)],
            ['formatInUTCToMedium', () => DateUtils.formatInUTCToMedium('not-a-date', CONST.LOCALES.EN)],
            ['formatInUTCToLong', () => DateUtils.formatInUTCToLong('not-a-date', CONST.LOCALES.EN)],
            ['formatTransactionListDate', () => DateUtils.formatTransactionListDate('not-a-date', CONST.LOCALES.EN)],
            ['formatToShortMonthDay', () => DateUtils.formatToShortMonthDay('not-a-date', CONST.LOCALES.EN)],
        ] as const)('%s returns "" instead of throwing', (_, run) => {
            // Given an unparsable value reaching a formatter that runs while a screen renders
            // When the formatter is called
            // Then it returns empty rather than throwing, because a throw during render would break the whole screen
            expect(run).not.toThrow();
            expect(run()).toBe('');
        });
    });

    describe('wire-timestamp helpers accept the DB shape', () => {
        it('extractDate returns the calendar day', () => {
            // Given a timestamp in the space-separated shape the database sends
            // When its date is extracted
            const result = DateUtils.extractDate('2025-07-09 14:30:00');

            // Then the calendar day comes back, because this shape must parse on every engine, not only V8
            expect(result).toBe('2025-07-09');
        });

        it('extractDate returns empty rather than throwing on an unparsable value', () => {
            // Given a stored value that is not a date
            // When its date is extracted
            const result = DateUtils.extractDate('not-a-date');

            // Then it is empty rather than throwing, so one bad value cannot break its caller
            expect(result).toBe('');
        });

        it('isTimeAtLeastOneMinuteInFuture reads the DB shape on both sides of now', () => {
            // Given database-shaped timestamps ten minutes after and ten minutes before now
            const wire = (date: Date) => format(date, 'yyyy-MM-dd HH:mm:ss');

            // When each is checked for being in the future
            const tenMinutesAhead = DateUtils.isTimeAtLeastOneMinuteInFuture({dateTimeString: wire(addMinutes(new Date(), 10))});
            const tenMinutesAgo = DateUtils.isTimeAtLeastOneMinuteInFuture({dateTimeString: wire(subMinutes(new Date(), 10))});

            // Then only the later one passes, which shows the shape is parsed rather than rejected as an invalid date
            expect(tenMinutesAhead).toBe(true);
            expect(tenMinutesAgo).toBe(false);
        });
    });

    describe('toLocalDate parses the DB wire shapes explicitly (Hermes rejects what V8 accepts)', () => {
        it.each([
            ['2025-07-09', [2025, 6, 9, 0, 0, 0, 0]],
            ['2025-07-09 14:30', [2025, 6, 9, 14, 30, 0, 0]],
            ['2025-07-09 14:30:45', [2025, 6, 9, 14, 30, 45, 0]],
            ['2025-07-09 14:30:45.123', [2025, 6, 9, 14, 30, 45, 123]],
        ])('parses %s as local wall-clock', (wire, [y, mo, d, h, mi, sec, ms]) => {
            // Given one of the database shapes, from date-only up to milliseconds
            // When it is parsed
            const parsed = DateUtils.toLocalDate(wire);

            // Then every field is the local wall-clock value written, because Hermes would reject these strings in new Date
            expect([parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), parsed.getHours(), parsed.getMinutes(), parsed.getSeconds(), parsed.getMilliseconds()]).toEqual([
                y,
                mo,
                d,
                h,
                mi,
                sec,
                ms,
            ]);
        });

        it('handles sub-millisecond precision, which some backends send', () => {
            // Given a timestamp with microseconds
            // When it is parsed
            const parsed = DateUtils.toLocalDate('2025-07-09 14:30:45.123456');

            // Then the seconds survive, because extra fraction digits must not make the whole value invalid
            expect(parsed.getSeconds()).toBe(45);
        });

        it('passes a Date through untouched', () => {
            // Given a value that is already a Date
            const date = new Date(2025, 6, 9);

            // When it is parsed
            const parsed = DateUtils.toLocalDate(date);

            // Then the same object comes back, so callers can pass either form without a copy or a re-parse
            expect(parsed).toBe(date);
        });
    });

    describe('doesDateBelongToAPastYear reads the year off the wire string', () => {
        afterEach(() => {
            jest.useRealTimers();
        });

        it('does not suffix a year onto a same-year row viewed after the UTC day has rolled over', () => {
            // Given a row dated 31 December viewed that evening, when UTC may already be in the new year
            jest.useFakeTimers().setSystemTime(new Date(2025, 11, 31, 20, 0, 0));

            // When the row is checked for a past year
            const result = DateUtils.doesDateBelongToAPastYear('2025-12-31');

            // Then it is not, because the year is read off the stored string rather than a date shifted by the timezone
            expect(result).toBe(false);
        });

        it('flags a genuinely earlier year', () => {
            // Given a row from 2023 viewed in 2026
            jest.useFakeTimers().setSystemTime(new Date(2026, 5, 15, 12, 0, 0));

            // When the row is checked for a past year
            const result = DateUtils.doesDateBelongToAPastYear('2023-05-01');

            // Then it is, so reading the year off the string still shows the year when it is needed
            expect(result).toBe(true);
        });
    });

    describe('locale-aware helpers render localized output', () => {
        it('formatToShortMonthDay renders es as "9 jul"', () => {
            // Given a date read by a Spanish user
            // When it is rendered as a short month and day
            const result = DateUtils.formatToShortMonthDay('2025-07-09', 'es');

            // Then the day comes before a Spanish month, as Spanish writes it
            expect(result).toBe('9 jul');
        });

        it('getFormattedQuarterForSearch renders es with localized month abbreviations', () => {
            // Given the third quarter of 2025 shown to a Spanish user in Search
            // When the quarter label is built
            const result = DateUtils.getFormattedQuarterForSearch(2025, 3, 'es');

            // Then the quarter name stays and its first and last days use Spanish month abbreviations
            expect(result).toContain('Q3 2025');
            expect(result).toContain('jul');
            expect(result).toContain('sept');
        });

        it.each([
            ['formatToLongMonth' as const, CONST.LOCALES.EN, 'July'],
            ['formatToLongMonth' as const, CONST.LOCALES.ES, 'julio'],
            ['formatToLongMonthYear' as const, CONST.LOCALES.EN, 'July 2025'],
            ['formatToLongMonthYear' as const, CONST.LOCALES.ES, 'julio de 2025'],
            ['formatToWeekdayLongDate' as const, CONST.LOCALES.EN, 'Wednesday, July 9, 2025'],
            ['formatToWeekdayLongDate' as const, CONST.LOCALES.ES, 'miércoles, 9 de julio de 2025'],
            ['formatToShortMonthDayTime' as const, CONST.LOCALES.EN, 'Jul 9, 2:30 PM'],
            ['formatToShortMonthDayTime' as const, CONST.LOCALES.ES, '9 jul, 14:30'],
        ])('%s renders %s as %s', (fnName, locale, expected) => {
            // Given a stored afternoon timestamp and one of the named formatters
            // When it is rendered in English and in Spanish
            const result = DateUtils[fnName]('2025-07-09 14:30:00', locale);

            // Then each language gets its own words, order and clock, such as "julio de 2025" and 14:30
            expect(result).toBe(expected);
        });

        it.each([
            [CONST.LOCALES.EN, 'Jul 9, 2025, 2:30 PM'],
            [CONST.LOCALES.ES, '9 jul 2025, 14:30'],
        ])('getLocalizedTimePeriodDescription renders a custom status date in %s as %s', (locale, expected) => {
            // Given a custom status end date and translations in the same language as the date
            const translateFor = <TPath extends TranslationPaths>(path: TPath, ...params: TranslationParameters<TPath>) => translate(locale, path, ...params);

            // When the status period is described
            const result = DateUtils.getLocalizedTimePeriodDescription(translateFor, locale, '2025-07-09 14:30:00');

            // Then the date and time follow that language, including its clock
            expect(result).toBe(expected);
        });

        it('the named wrappers accept a Date as well as a wire string', () => {
            // Given the same moment as a stored string and as a Date
            const wire = '2025-07-09 14:30:00';

            // When each is formatted
            const fromDate = DateUtils.formatToLongMonthYear(DateUtils.toLocalDate(wire), CONST.LOCALES.ES);
            const fromWire = DateUtils.formatToLongMonthYear(wire, CONST.LOCALES.ES);

            // Then they match, because callers hold either form
            expect(fromDate).toBe(fromWire);
        });

        it.each([
            [CONST.LOCALES.EN, 'Mar 17-20'],
            [CONST.LOCALES.ES, '17-20 mar'],
            [CONST.LOCALES.FR, '17-20 mars'],
            [CONST.LOCALES.DE, '17-20. M\u00e4rz'],
            [CONST.LOCALES.JA, '3\u670817\u65e5-20\u65e5'],
        ])('getFormattedDateRange puts the shared month where %s writes it', (locale, expected) => {
            // Given a range whose start and end fall in the same month
            const start = new Date(2025, 2, 17);
            const end = new Date(2025, 2, 20);

            // When the range is formatted
            const result = DateUtils.getFormattedDateRange(translateLocal, start, end, locale);

            // Then the month appears once, before the days or after them as the language writes it
            expect(result).toBe(expected);
        });

        it('keeps field order on an engine whose formatToParts reports no fields', () => {
            // Given an engine whose formatToParts returns the whole date as one literal, so field positions cannot be read
            const originalDTF = Intl.DateTimeFormat;
            function LiteralOnlyDTF(locale?: string | string[], options?: Intl.DateTimeFormatOptions) {
                const real = new originalDTF(locale, options);
                return {
                    format: (date?: Date) => real.format(date),
                    formatToParts: (date?: Date) => [{type: 'literal', value: real.format(date)}],
                    resolvedOptions: () => real.resolvedOptions(),
                };
            }
            Object.defineProperty(Intl, 'DateTimeFormat', {value: LiteralOnlyDTF, configurable: true, writable: true});
            try {
                jest.isolateModules(() => {
                    // When a Spanish range and a German placeholder are built there
                    const fresh = jest.requireActual<{default: typeof DateUtils}>('@libs/DateUtils').default;
                    const spanishRange = fresh.getFormattedDateRange(translateLocal, new Date(2025, 2, 17), new Date(2025, 2, 20), CONST.LOCALES.ES);
                    const germanPlaceholder = fresh.getLocalizedDatePlaceholder(CONST.LOCALES.DE);

                    // Then both keep their language's day-first order, because the fallback must not silently revert to English order
                    expect(spanishRange).toBe('17-20 mar');
                    expect(germanPlaceholder).toBe('DD.MM.YYYY');
                });
            } finally {
                Object.defineProperty(Intl, 'DateTimeFormat', {value: originalDTF, configurable: true, writable: true});
            }
        });

        it('getFormattedDateRangeForSearch returns empty rather than an orphan separator on an unparsable boundary', () => {
            // Given a Search date range where one end cannot be parsed
            // When the range is formatted, with the bad value at either end
            const badStart = DateUtils.getFormattedDateRangeForSearch('not-a-date', '2025-07-09', false, false, LOCALE);
            const badEnd = DateUtils.getFormattedDateRangeForSearch('2025-07-09', 'not-a-date', false, false, LOCALE);

            // Then it is empty, because half a range beside a dangling " - " would misstate the filter
            expect(badStart).toBe('');
            expect(badEnd).toBe('');
        });

        it('refreshIntlFormatterCaches drops cached failures but keeps working formatters', () => {
            // Given a Spanish formatter failure cached while Intl threw and still served after Intl recovers, beside a working English formatter
            clearIntlFormatterCaches();
            jest.useFakeTimers();
            DateUtils.formatToMediumDate('2025-07-09', CONST.LOCALES.EN);

            const throwingSpy = jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => {
                throw new RangeError('no Intl');
            });
            expect(DateUtils.formatToMediumDate('2025-07-09', CONST.LOCALES.ES)).toBe('');
            throwingSpy.mockRestore();
            expect(DateUtils.formatToMediumDate('2025-07-09', CONST.LOCALES.ES)).toBe('');
            expect(DateUtils.formatToMediumDate('2025-07-09', CONST.LOCALES.EN)).not.toBe('');

            // When the caches are refreshed
            const constructorSpy = jest.spyOn(Intl, 'DateTimeFormat');
            refreshIntlFormatterCaches();

            // Then Spanish is rebuilt and works while English is reused as is, so a refresh retries failures without rebuilding what works
            expect(DateUtils.formatToMediumDate('2025-07-09', CONST.LOCALES.ES)).not.toBe('');
            const constructionsToRecoverTheFailure = constructorSpy.mock.calls.length;
            expect(DateUtils.formatToMediumDate('2025-07-09', CONST.LOCALES.EN)).not.toBe('');
            expect(constructorSpy.mock.calls).toHaveLength(constructionsToRecoverTheFailure);
            constructorSpy.mockRestore();
            jest.useRealTimers();
        });

        it('a device timezone change reaches formatters that were cached without an explicit zone', () => {
            // Given a time formatter cached in Athens, which shares both solstice offsets with Cairo and differs only through April
            clearIntlFormatterCaches();
            jest.useFakeTimers();
            const instant = new Date('2024-04-10T12:00:00Z');
            // Jest does not propagate `process.env.TZ` to V8, so the device zone is moved where the cache key reads it.
            const resolved = new Intl.DateTimeFormat().resolvedOptions();
            const zoneSpy = jest.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({...resolved, timeZone: 'Europe/Athens'});
            // Each advance clears the window the resolved zone is reused for, without clearing the formatter cache the assertion is about.
            jest.advanceTimersByTime(60 * 1000);
            expect(DateUtils.formatToLocalTime(instant, CONST.LOCALES.EN)).toBe('3:00 PM');

            // When the device moves to Cairo
            zoneSpy.mockReturnValue({...resolved, timeZone: 'Africa/Cairo'});
            jest.advanceTimersByTime(60 * 1000);
            const result = DateUtils.formatToLocalTime(instant, CONST.LOCALES.EN);

            // Then the time follows Cairo, so a user who changes zone never sees times from the one they left
            expect(result).toBe('2:00 PM');

            zoneSpy.mockRestore();
            jest.useRealTimers();
            clearIntlFormatterCaches();
        });

        it('re-resolves the device zone when a fast clock is corrected backwards', () => {
            // Given a time formatter cached in Athens
            clearIntlFormatterCaches();
            jest.useFakeTimers();
            const instant = new Date('2024-04-10T12:00:00Z');
            const resolved = new Intl.DateTimeFormat().resolvedOptions();
            const zoneSpy = jest.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({...resolved, timeZone: 'Europe/Athens'});
            jest.advanceTimersByTime(60 * 1000);
            expect(DateUtils.formatToLocalTime(instant, CONST.LOCALES.EN)).toBe('3:00 PM');

            // When the device moves to Cairo while a clock that ran an hour fast is corrected, moving the reuse window into the future
            zoneSpy.mockReturnValue({...resolved, timeZone: 'Africa/Cairo'});
            jest.setSystemTime(Date.now() - 60 * 60 * 1000);
            const result = DateUtils.formatToLocalTime(instant, CONST.LOCALES.EN);

            // Then the time still follows Cairo, so a clock correction cannot pin the old zone indefinitely
            expect(result).toBe('2:00 PM');

            zoneSpy.mockRestore();
            jest.useRealTimers();
            clearIntlFormatterCaches();
        });

        it('getFormattedQuarterForSearch keeps the quarter label when the bounds cannot be formatted', () => {
            // Given an engine where every Intl date formatter throws
            clearIntlFormatterCaches();
            jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => {
                throw new RangeError('no Intl');
            });

            // When the quarter label is built
            const result = DateUtils.getFormattedQuarterForSearch(2025, 3, LOCALE);

            // Then the quarter name is still shown alone, rather than with empty brackets around a lone dash
            expect(result).toBe('Q3 2025');
            jest.restoreAllMocks();
            clearIntlFormatterCaches();
        });
    });

    // #97796: under a non-English date-fns default, localized meridiems (vorm./nachm.) failed Per Diem save.
    describe('time picker helpers stay on English AM/PM under non-English locales (#97796)', () => {
        beforeEach(async () => {
            await IntlStore.load(CONST.LOCALES.DE);
        });

        it('extractTime12Hour emits English AM/PM regardless of active locale', () => {
            // Given a stored 2 PM time while German is the active language
            // When it is extracted for the time picker
            const result = DateUtils.extractTime12Hour('2025-08-19 14:00:00');

            // Then it uses English PM, because the picker reads this string back and only understands AM/PM
            expect(result).toBe('02:00 PM');
        });

        it('get12HourTimeObjectFromDate returns English AM/PM period derived from the hour', () => {
            // Given picker times for 2 PM and 8 AM while German is the active language
            // When each is split into its parts
            const afternoon = DateUtils.get12HourTimeObjectFromDate('02:00 PM');
            const morning = DateUtils.get12HourTimeObjectFromDate('08:00 AM');

            // Then each period is English PM or AM, because it comes from the hour rather than a localized marker
            expect(afternoon?.period).toBe('PM');
            expect(morning?.period).toBe('AM');
        });

        it('combineDateAndTime parses the picker-emitted "hh:mm a" into the correct 24h time', () => {
            // Given picker times for 2 PM and 8 AM while German is the active language
            // When each is combined with a date for storage
            const afternoon = DateUtils.combineDateAndTime('02:00 PM', '2025-08-19');
            const morning = DateUtils.combineDateAndTime('08:00 AM', '2025-08-19');

            // Then both are stored as 24-hour times, because the stored value must not depend on the reader's language
            expect(afternoon).toBe('2025-08-19 14:00:00');
            expect(morning).toBe('2025-08-19 08:00:00');
        });

        it('isValidStartEndTimeRange accepts a picker-built 08:00 → 14:00 range', () => {
            // Given an 8 AM to 2 PM range built by the picker while German is the active language
            const startTime = DateUtils.combineDateAndTime('08:00 AM', '2025-08-19');
            const endTime = DateUtils.combineDateAndTime('02:00 PM', '2025-08-19');

            // When the range is validated before saving a Per Diem
            const isValid = DateUtils.isValidStartEndTimeRange({startTime, endTime});

            // Then it is valid, because German meridiems once made this ordinary range fail the save
            expect(isValid).toBe(true);
        });
    });

    describe('getRemainingSecondsInWindow', () => {
        const windowMs = 30 * 1000;

        it('should return 0 when no timestamp is provided', () => {
            expect(DateUtils.getRemainingSecondsInWindow(undefined, windowMs)).toBe(0);
        });

        it('should return the full window when the request just happened', () => {
            expect(DateUtils.getRemainingSecondsInWindow(Date.now(), windowMs)).toBe(30);
        });

        it('should return the remaining seconds part-way through the window', () => {
            expect(DateUtils.getRemainingSecondsInWindow(Date.now() - 10 * 1000, windowMs)).toBe(20);
        });

        it('should clamp to 0 once the window has elapsed', () => {
            expect(DateUtils.getRemainingSecondsInWindow(Date.now() - 31 * 1000, windowMs)).toBe(0);
        });

        it('should clamp to the full window when the timestamp is in the future', () => {
            expect(DateUtils.getRemainingSecondsInWindow(Date.now() + 10 * 1000, windowMs)).toBe(30);
        });
    });

    describe('getTimeOfDayGreetingKey', () => {
        const atHour = (hour: number, minute = 0) => set(new Date(), {hours: hour, minutes: minute, seconds: 0, milliseconds: 0});

        it('should return goodMorning from 4am up to noon', () => {
            expect(DateUtils.getTimeOfDayGreetingKey(atHour(4))).toBe('goodMorning');
            expect(DateUtils.getTimeOfDayGreetingKey(atHour(8, 30))).toBe('goodMorning');
            expect(DateUtils.getTimeOfDayGreetingKey(atHour(11, 59))).toBe('goodMorning');
        });

        it('should return goodAfternoon from noon up to 5pm', () => {
            expect(DateUtils.getTimeOfDayGreetingKey(atHour(12))).toBe('goodAfternoon');
            expect(DateUtils.getTimeOfDayGreetingKey(atHour(14, 15))).toBe('goodAfternoon');
            expect(DateUtils.getTimeOfDayGreetingKey(atHour(16, 59))).toBe('goodAfternoon');
        });

        it('should return goodEvening from 5pm up to 4am', () => {
            expect(DateUtils.getTimeOfDayGreetingKey(atHour(17))).toBe('goodEvening');
            expect(DateUtils.getTimeOfDayGreetingKey(atHour(21))).toBe('goodEvening');
            expect(DateUtils.getTimeOfDayGreetingKey(atHour(0))).toBe('goodEvening');
            expect(DateUtils.getTimeOfDayGreetingKey(atHour(3, 59))).toBe('goodEvening');
        });
    });

    describe('time picker helpers with a non-English date-fns locale', () => {
        beforeEach(() => IntlStore.load(CONST.LOCALES.DE));

        it('combineDateAndTime parses the picker-submitted English AM/PM value', () => {
            expect(DateUtils.combineDateAndTime('02:00 PM', '2026-08-04')).toBe('2026-08-04 14:00:00');
            expect(DateUtils.combineDateAndTime('08:00 AM', '2026-08-04 00:00:00')).toBe('2026-08-04 08:00:00');
        });

        it('extractTime12Hour emits an English AM/PM marker whatever the active language', () => {
            // This value is the picker's wire format, not display text, so it stays English for the same reason
            // `combineDateAndTime` parses English: the period is compared against `CONST.TIME_PERIOD`.
            expect(DateUtils.extractTime12Hour('2026-08-04 12:00:00')).toBe('12:00 PM');
            expect(DateUtils.extractTime12Hour('2026-08-04 08:00:00')).toBe('08:00 AM');
            expect(DateUtils.extractTime12Hour('2026-08-04 12:00:00.500', true)).toBe('12:00:00.500 PM');
        });

        it('get12HourTimeObjectFromDate reads back what extractTime12Hour wrote', () => {
            const noon = DateUtils.extractTime12Hour('2026-08-04 12:00:00');
            expect(DateUtils.get12HourTimeObjectFromDate(noon)?.period).toBe(CONST.TIME_PERIOD.PM);
            const morning = DateUtils.extractTime12Hour('2026-08-04 08:00:00');
            expect(DateUtils.get12HourTimeObjectFromDate(morning)).toEqual({hour: '08', minute: '00', seconds: '00', milliseconds: '000', period: CONST.TIME_PERIOD.AM});
        });

        it('per diem start/end range built from picker values validates', () => {
            const newStart = DateUtils.combineDateAndTime('08:00 AM', '2026-08-04');
            const newEnd = DateUtils.combineDateAndTime('02:00 PM', '2026-08-04');
            expect(DateUtils.isValidStartEndTimeRange({startTime: newStart, endTime: newEnd})).toBe(true);
        });
    });

    describe('Search day formatting', () => {
        test('formats a compact day label', () => {
            expect(DateUtils.getShortFormattedDayForSearch('2026-09-15', CONST.LOCALES.EN)).toBe('Sep 15, ’26');
        });
    });
});
