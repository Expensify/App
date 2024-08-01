/* eslint-disable @typescript-eslint/naming-convention */
import {addDays, addMinutes, format, setHours, setMinutes, subDays, subHours, subMinutes, subSeconds} from 'date-fns';
import {format as tzFormat, utcToZonedTime} from 'date-fns-tz';
import Onyx from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const LOCALE = CONST.LOCALES.EN;
const UTC = 'UTC';
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
                            // UTC is not recognized as a valid timezone but
                            // in these tests we want to use it to avoid issues
                            // because of daylight saving time
                            selected: UTC as SelectedTimezone,
                        },
                    },
                },
            },
        });
        return waitForBatchedUpdates();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
        Onyx.clear();
    });

    const datetime = '2022-11-07 00:00:00';
    const timezone = 'America/Los_Angeles';

    it('getZoneAbbreviation should show zone abbreviation from the datetime', () => {
        const zoneAbbreviation = DateUtils.getZoneAbbreviation(datetime, timezone);
        expect(zoneAbbreviation).toBe('PST');
    });

    it('formatToLongDateWithWeekday should return a long date with a weekday', () => {
        const formattedDate = DateUtils.formatToLongDateWithWeekday(datetime);
        expect(formattedDate).toBe('Monday, November 7, 2022');
    });

    it('formatToDayOfWeek should return a weekday', () => {
        const weekDay = DateUtils.formatToDayOfWeek(new Date(datetime));
        expect(weekDay).toBe('Monday');
    });
    it('formatToLocalTime should return a date in a local format', () => {
        const localTime = DateUtils.formatToLocalTime(datetime);
        expect(localTime).toBe('12:00 AM');
    });

    it('should return a date object with the formatted datetime when calling getLocalDateFromDatetime', () => {
        const localDate = DateUtils.getLocalDateFromDatetime(LOCALE, datetime, timezone);
        expect(tzFormat(localDate, CONST.DATE.FNS_TIMEZONE_FORMAT_STRING, {timeZone: timezone})).toEqual('2022-11-06T16:00:00-08:00');
    });

    it('should fallback to current date when getLocalDateFromDatetime is failing', () => {
        const localDate = DateUtils.getLocalDateFromDatetime(LOCALE, undefined, 'InvalidTimezone' as SelectedTimezone);
        expect(localDate.getTime()).not.toBeNaN();
    });

    it('should return the date in calendar time when calling datetimeToCalendarTime', () => {
        const today = setMinutes(setHours(new Date(), 14), 32).toString();
        expect(DateUtils.datetimeToCalendarTime(LOCALE, today)).toBe('Today at 2:32 PM');

        const tomorrow = addDays(setMinutes(setHours(new Date(), 14), 32), 1).toString();
        expect(DateUtils.datetimeToCalendarTime(LOCALE, tomorrow)).toBe('Tomorrow at 2:32 PM');

        const yesterday = setMinutes(setHours(subDays(new Date(), 1), 7), 43).toString();
        expect(DateUtils.datetimeToCalendarTime(LOCALE, yesterday)).toBe('Yesterday at 7:43 AM');

        const date = setMinutes(setHours(new Date('2022-11-05'), 10), 17).toString();
        expect(DateUtils.datetimeToCalendarTime(LOCALE, date)).toBe('Nov 5, 2022 at 10:17 AM');

        const todayLowercaseDate = setMinutes(setHours(new Date(), 14), 32).toString();
        expect(DateUtils.datetimeToCalendarTime(LOCALE, todayLowercaseDate, false, undefined, true)).toBe('today at 2:32 PM');
    });

    it('should update timezone if automatic and selected timezone do not match', () => {
        jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(
            () =>
                ({
                    resolvedOptions: () => ({timeZone: 'America/Chicago'}),
                } as Intl.DateTimeFormat),
        );
        Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {'999': {accountID: 999, timezone: {selected: 'Europe/London', automatic: true}}}).then(() => {
            const result = DateUtils.getCurrentTimezone();
            expect(result).toEqual({
                selected: 'America/Chicago',
                automatic: true,
            });
        });
    });

    it('should not update timezone if automatic and selected timezone match', () => {
        jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(
            () =>
                ({
                    resolvedOptions: () => ({timeZone: UTC}),
                } as Intl.DateTimeFormat),
        );
        Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {'999': {accountID: 999, timezone: {selected: 'Europe/London', automatic: true}}}).then(() => {
            const result = DateUtils.getCurrentTimezone();
            expect(result).toEqual({
                selected: UTC,
                automatic: true,
            });
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
        jest.setSystemTime(addMinutes(new Date(), 4));
        const isUpdateTimezoneAllowed = DateUtils.canUpdateTimezone();
        expect(isUpdateTimezoneAllowed).toBe(false);
    });

    it('should return the date in calendar time when calling datetimeToRelative', () => {
        const aFewSecondsAgo = subSeconds(new Date(), 10).toString();
        expect(DateUtils.datetimeToRelative(LOCALE, aFewSecondsAgo)).toBe('less than a minute ago');

        const aMinuteAgo = subMinutes(new Date(), 1).toString();
        expect(DateUtils.datetimeToRelative(LOCALE, aMinuteAgo)).toBe('1 minute ago');

        const anHourAgo = subHours(new Date(), 1).toString();
        expect(DateUtils.datetimeToRelative(LOCALE, anHourAgo)).toBe('about 1 hour ago');
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

        const todayInTimezone = utcToZonedTime(today, timezone);
        const tomorrowInTimezone = utcToZonedTime(tomorrow, timezone);
        const yesterdayInTimezone = utcToZonedTime(yesterday, timezone);

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

    describe('formatWithUTCTimeZone', () => {
        describe('when the date is invalid', () => {
            it('returns an empty string', () => {
                const invalidDateStr = '';

                const formattedDate = DateUtils.formatWithUTCTimeZone(invalidDateStr);

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
                const formattedDate = DateUtils.formatWithUTCTimeZone(datetime, dateFormat);

                expect(formattedDate).toEqual(expectedResult);
            });
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
});
