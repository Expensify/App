import type {LocaleContextProps} from '@components/LocaleContextProvider';

import DateUtils from '@libs/DateUtils';
import {translate} from '@libs/Localize';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type Locale from '@src/types/onyx/Locale';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';

/* eslint-disable @typescript-eslint/naming-convention */
import {addDays, addMinutes, endOfDay, format, set, setHours, setMinutes, startOfDay, subDays, subHours, subMinutes, subSeconds} from 'date-fns';
import {fromZonedTime, toZonedTime, format as tzFormat} from 'date-fns-tz';
import {el} from 'date-fns/locale/el';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@src/libs/Log');

const LOCALE = CONST.LOCALES.EN;
const UTC = 'UTC';
const getTranslateFn =
    (locale: Locale): LocaleContextProps['translate'] =>
    (path, ...params) =>
        translate(locale, path, ...params);
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
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                            selected: UTC as SelectedTimezone,
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
        const formattedDate = DateUtils.formatToLongDateWithWeekday(datetime, undefined);
        expect(formattedDate).toBe('Monday, November 7, 2022');
    });

    it('formatToDayOfWeek should return a weekday', () => {
        const weekDay = DateUtils.formatToDayOfWeek(new Date(datetime), undefined);
        expect(weekDay).toBe('Monday');
    });
    it('formatToLocalTime should return a date in a local format', () => {
        const localTime = DateUtils.formatToLocalTime(translateLocal, datetime);
        expect(localTime).toBe('12:00 AM');
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        expect(DateUtils.datetimeToCalendarTime(LOCALE, today, UTC as SelectedTimezone, false)).toBe('Today at 2:32 PM');

        const tomorrow = addDays(setMinutes(setHours(new Date(), 14), 32), 1).toString();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        expect(DateUtils.datetimeToCalendarTime(LOCALE, tomorrow, UTC as SelectedTimezone, false)).toBe('Tomorrow at 2:32 PM');

        const yesterday = setMinutes(setHours(subDays(new Date(), 1), 7), 43).toString();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        expect(DateUtils.datetimeToCalendarTime(LOCALE, yesterday, UTC as SelectedTimezone, false)).toBe('Yesterday at 7:43 AM');

        const date = setMinutes(setHours(new Date('2022-11-05'), 10), 17).toString();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        expect(DateUtils.datetimeToCalendarTime(LOCALE, date, UTC as SelectedTimezone, false)).toBe('Nov 5, 2022 at 10:17 AM');

        const todayLowercaseDate = setMinutes(setHours(new Date(), 14), 32).toString();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        expect(DateUtils.datetimeToCalendarTime(LOCALE, todayLowercaseDate, UTC as SelectedTimezone, false, true)).toBe('today at 2:32 PM');
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
        const aFewSecondsAgo = subSeconds(new Date(), 10).toString();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        expect(DateUtils.datetimeToRelative(LOCALE, aFewSecondsAgo, UTC as SelectedTimezone)).toBe('less than a minute ago');

        const aMinuteAgo = subMinutes(new Date(), 1).toString();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        expect(DateUtils.datetimeToRelative(LOCALE, aMinuteAgo, UTC as SelectedTimezone)).toBe('1 minute ago');

        const anHourAgo = subHours(new Date(), 1).toString();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        expect(DateUtils.datetimeToRelative(LOCALE, anHourAgo, UTC as SelectedTimezone)).toBe('about 1 hour ago');
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

    describe('formatWithUTCTimeZone', () => {
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
                const formattedDate = DateUtils.formatWithUTCTimeZone(datetime, dateFormat, undefined);

                expect(formattedDate).toEqual(expectedResult);
            });
        });

        it('returns the correct date when the date with time is used', () => {
            const datetimeStr = '2022-11-07 17:48:00';
            const expectedResult = '2022-11-07';
            expect(DateUtils.formatMachineDateWithUTCTimeZone(datetimeStr)).toEqual(expectedResult);
        });

        it('formats locale-sensitive tokens in the locale it is given', () => {
            // The suite runs in English, so a Greek month name can only come from the locale argument.
            expect(DateUtils.formatWithUTCTimeZone(datetime, CONST.DATE.MONTH_DAY_ABBR_FORMAT, el)).toEqual('Νοε 7');
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

        it('returns empty string when input date is empty', () => {
            expect(DateUtils.getStatusUntilDate(translateLocal, undefined, '', inputTimeZoneNY, currentTimeZone)).toBe('');
        });

        it('returns "Until h:mm a" when input and current timezone are same', () => {
            const nowInTZ = toZonedTime(new Date(), currentTimeZone);
            const targetTime = set(nowInTZ, {hours: 15, minutes: 34, seconds: 0, milliseconds: 0});
            const inputDateStr = tzFormat(targetTime, CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, {timeZone: currentTimeZone});

            const result = DateUtils.getStatusUntilDate(translateLocal, undefined, inputDateStr, currentTimeZone, currentTimeZone);
            // eslint-disable-next-line rulesdir/require-locale-for-localized-date-format -- mirrors the undefined locale passed to getStatusUntilDate above, so the expectation matches what it produces.
            const expectedLabel = tzFormat(targetTime, CONST.DATE.LOCAL_TIME_FORMAT, {timeZone: currentTimeZone});

            expect(result).toBe(`Until ${expectedLabel}`);
        });

        it('returns "Until tomorrow" when end of day is in the same timezone', () => {
            const nowInCurrent = toZonedTime(new Date(), currentTimeZone);
            const endOfTodayCurrent = endOfDay(nowInCurrent);

            const inputDateStrNY = tzFormat(endOfTodayCurrent, CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, {timeZone: inputTimeZoneNY});

            const result = DateUtils.getStatusUntilDate(translateLocal, undefined, inputDateStrNY, inputTimeZoneNY, inputTimeZoneNY);
            expect(result).toBe('Until tomorrow');
        });

        it('returns "Until h:mm a" for later today in a different timezone', () => {
            const targetTimeLA = set(toZonedTime(new Date(), currentTimeZone), {hours: 15, minutes: 34, seconds: 0, milliseconds: 0});
            const inputDateStrNY = tzFormat(targetTimeLA, CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, {timeZone: inputTimeZoneNY});

            const result = DateUtils.getStatusUntilDate(translateLocal, undefined, inputDateStrNY, inputTimeZoneNY, currentTimeZone);

            const date = fromZonedTime(inputDateStrNY, inputTimeZoneNY);
            const converted = toZonedTime(date, currentTimeZone);
            // eslint-disable-next-line rulesdir/require-locale-for-localized-date-format -- mirrors the undefined locale passed to getStatusUntilDate above, so the expectation matches what it produces.
            const expectedLabel = tzFormat(converted, CONST.DATE.LOCAL_TIME_FORMAT, {timeZone: currentTimeZone});

            expect(result).toBe(`Until ${expectedLabel}`);
        });

        it('returns "Until MM-dd h:mm a" for future date within the same year in a different timezone', () => {
            const twoDaysLaterLA = addDays(set(toZonedTime(new Date(), currentTimeZone), {hours: 15, minutes: 0, seconds: 0, milliseconds: 0}), 2);
            const inputDateStrParis = tzFormat(twoDaysLaterLA, CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, {timeZone: inputTimeZoneParis});

            const result = DateUtils.getStatusUntilDate(translateLocal, undefined, inputDateStrParis, inputTimeZoneParis, currentTimeZone);

            const date = fromZonedTime(inputDateStrParis, inputTimeZoneParis);
            const converted = toZonedTime(date, currentTimeZone);
            const expectedLabel = tzFormat(converted, `${CONST.DATE.SHORT_DATE_FORMAT} ${CONST.DATE.LOCAL_TIME_FORMAT}`, {timeZone: currentTimeZone});

            expect(result).toBe(`Until ${expectedLabel}`);
        });

        it('returns "Until MM-dd h:mm a" when "until today" crosses into next day in current timezone', () => {
            const endOfTodayTokyo = endOfDay(toZonedTime(new Date(), inputTimeZoneTokyo));
            const inputDateStrTokyo = tzFormat(endOfTodayTokyo, CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, {timeZone: inputTimeZoneTokyo});

            const result = DateUtils.getStatusUntilDate(translateLocal, undefined, inputDateStrTokyo, inputTimeZoneTokyo, currentTimeZone);

            const date = fromZonedTime(inputDateStrTokyo, inputTimeZoneTokyo);
            const converted = toZonedTime(date, currentTimeZone);

            const expectedLabel = tzFormat(converted, `${CONST.DATE.SHORT_DATE_FORMAT} ${CONST.DATE.LOCAL_TIME_FORMAT}`, {timeZone: currentTimeZone});

            expect(result).toBe(`Until ${expectedLabel}`);
        });

        it('returns "Until yyyy-MM-dd h:mm a" for a date in a different year across timezones', () => {
            const laFutureDateStr = '2026-01-02 09:15:00';
            const inputDateStrTokyo = tzFormat(fromZonedTime(laFutureDateStr, currentTimeZone), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, {timeZone: inputTimeZoneTokyo});

            const result = DateUtils.getStatusUntilDate(translateLocal, undefined, inputDateStrTokyo, inputTimeZoneTokyo, currentTimeZone);

            const date = fromZonedTime(inputDateStrTokyo, inputTimeZoneTokyo);
            const converted = toZonedTime(date, currentTimeZone);
            const expectedLabel = tzFormat(converted, `${CONST.DATE.FNS_FORMAT_STRING} ${CONST.DATE.LOCAL_TIME_FORMAT}`, {timeZone: currentTimeZone});

            expect(result).toBe(`Until ${expectedLabel}`);
        });
    });

    describe('getFormattedSplitDateRange', () => {
        const translateEN = <TPath extends TranslationPaths>(path: TPath, ...params: TranslationParameters<TPath>) => translate(LOCALE, path, ...params);

        it('should return empty string when startDate is undefined', () => {
            const result = DateUtils.getFormattedSplitDateRange(translateEN, undefined, '2024-01-15');
            expect(result).toBe('');
        });

        it('should return empty string when endDate is undefined', () => {
            const result = DateUtils.getFormattedSplitDateRange(translateEN, '2024-01-10', undefined);
            expect(result).toBe('');
        });

        it('should return empty string when both dates are undefined', () => {
            const result = DateUtils.getFormattedSplitDateRange(translateEN, undefined, undefined);
            expect(result).toBe('');
        });

        it('should return plural form for multiple days', () => {
            const result = DateUtils.getFormattedSplitDateRange(translateEN, '2024-01-10', '2024-01-15');
            expect(result).toContain('2024-01-10');
            expect(result).toContain('to');
            expect(result).toContain('2024-01-15');
            expect(result).toContain('6 days');
        });

        it('should return correct format for 2 days', () => {
            const result = DateUtils.getFormattedSplitDateRange(translateEN, '2024-01-10', '2024-01-11');
            expect(result).toContain('2024-01-10');
            expect(result).toContain('to');
            expect(result).toContain('2024-01-11');
            expect(result).toContain('2 days');
        });

        it('should handle cross-month date ranges', () => {
            const result = DateUtils.getFormattedSplitDateRange(translateEN, '2024-01-25', '2024-02-05');
            expect(result).toContain('2024-01-25');
            expect(result).toContain('to');
            expect(result).toContain('2024-02-05');
            expect(result).toContain('12 days');
        });

        it('should handle cross-year date ranges', () => {
            const result = DateUtils.getFormattedSplitDateRange(translateEN, '2023-12-25', '2024-01-05');
            expect(result).toContain('2023-12-25');
            expect(result).toContain('to');
            expect(result).toContain('2024-01-05');
            expect(result).toContain('12 days');
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            expect(DateUtils.formatUTCDateTimeToDateInTimezone('', UTC as SelectedTimezone)).toBe('');
        });

        it('should return empty string when timeZone is empty', () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            expect(DateUtils.formatUTCDateTimeToDateInTimezone('2024-01-15 08:00:00', '' as SelectedTimezone)).toBe('');
        });

        it('should return date in yyyy-MM-dd format when timeZone is UTC', () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            const result = DateUtils.formatUTCDateTimeToDateInTimezone('2024-01-15 08:00:00', UTC as SelectedTimezone);
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            const result = DateUtils.formatUTCDateTimeToDateInTimezone('2024-01-15 08:00:00.000', UTC as SelectedTimezone);
            expect(result).toBe('2024-01-15');
        });

        it('should handle date-only format (parses as midnight UTC)', () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            const result = DateUtils.formatUTCDateTimeToDateInTimezone('2024-01-15', UTC as SelectedTimezone);
            expect(result).toBe('2024-01-15');
        });

        it('should return empty string for invalid date', () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            const result = DateUtils.formatUTCDateTimeToDateInTimezone('invalid-date', UTC as SelectedTimezone);
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            expect(DateUtils.formatViolationSnapshotStartedAtDate('', UTC as SelectedTimezone, undefined)).toBe('');
        });

        it('should return empty string when timeZone is undefined', () => {
            expect(DateUtils.formatViolationSnapshotStartedAtDate('2026-06-20', undefined, undefined)).toBe('');
        });

        it('should format a date-only value in the target timezone', () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            const result = DateUtils.formatViolationSnapshotStartedAtDate('2026-06-20', UTC as SelectedTimezone, undefined);
            expect(result).toBe('June 20th, 2026');
        });

        it('should format a UTC datetime value in the target timezone', () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            const result = DateUtils.formatViolationSnapshotStartedAtDate('2026-06-20 00:00:00', UTC as SelectedTimezone, undefined);
            expect(result).toBe('June 20th, 2026');
        });

        it('should format a UTC datetime using the target timezone date', () => {
            const americaNewYork = 'America/New_York' as SelectedTimezone;
            const result = DateUtils.formatViolationSnapshotStartedAtDate('2026-06-20 02:00:00', americaNewYork, undefined);
            expect(result).toBe('June 19th, 2026');
        });

        it('should return empty string for invalid date', () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            const result = DateUtils.formatViolationSnapshotStartedAtDate('invalid-date', UTC as SelectedTimezone, undefined);
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            const result = DateUtils.normalizeDateToStartOfDay('2024-01-15', UTC as SelectedTimezone);
            expect(result).toBe('2024-01-15 00:00:00');
        });

        it('should match getDBTime of startOfDay for the parsed date (without milliseconds)', () => {
            const dateStr = '2022-11-07';
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            const result = DateUtils.normalizeDateToStartOfDay(dateStr, UTC as SelectedTimezone);
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            const result = DateUtils.normalizeDateToEndOfDay('2024-01-15', UTC as SelectedTimezone);
            expect(result).toBe('2024-01-15 23:59:59');
        });

        it('should match getDBTime of endOfDay for the parsed date (without milliseconds)', () => {
            const dateStr = '2022-11-07';
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            const result = DateUtils.normalizeDateToEndOfDay(dateStr, UTC as SelectedTimezone);
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
            const result = DateUtils.getFormattedCancellationDate(translateLocal, undefined, '2026-04-19T15:00:00+07:00');
            // Should display 3:00 PM in the venue's +07:00 timezone, not converted to device-local time
            expect(result).toBe('Sunday, Apr 19, 2026 3:00 PM, GMT+7');
        });

        it('should format without year when date is in the current year', () => {
            // Pin "now" to 2026 so the 2026 date is treated as the current year and the year is omitted.
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2026-06-01T00:00:00Z'));
            const result = DateUtils.getFormattedCancellationDate(translateLocal, undefined, '2026-06-15T10:30:00+00:00');
            expect(result).toBe('Monday, Jun 15 10:30 AM, UTC');
        });

        it('should return empty string for falsy input', () => {
            expect(DateUtils.getFormattedCancellationDate(translateLocal, undefined, '')).toBe('');
        });

        it('should fall back to UTC when no timezone offset is present in the ISO string', () => {
            // Pin "now" before 2026 so the 2026 date is treated as a non-current year and the year is shown.
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));
            const result = DateUtils.getFormattedCancellationDate(translateLocal, undefined, '2026-04-19T15:00:00');
            expect(result).toBe('Sunday, Apr 19, 2026 3:00 PM, UTC');
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

        it('get12HourTimeObjectFromDate returns the AM/PM period for a localized time string', () => {
            const localizedNoon = DateUtils.extractTime12Hour('2026-08-04 12:00:00');
            expect(DateUtils.get12HourTimeObjectFromDate(localizedNoon).period).toBe(CONST.TIME_PERIOD.PM);
            const localizedMorning = DateUtils.extractTime12Hour('2026-08-04 08:00:00');
            expect(DateUtils.get12HourTimeObjectFromDate(localizedMorning)).toEqual({hour: '08', minute: '00', seconds: '00', milliseconds: '000', period: CONST.TIME_PERIOD.AM});
        });

        it('per diem start/end range built from picker values validates', () => {
            const newStart = DateUtils.combineDateAndTime('08:00 AM', '2026-08-04');
            const newEnd = DateUtils.combineDateAndTime('02:00 PM', '2026-08-04');
            expect(DateUtils.isValidStartEndTimeRange({startTime: newStart, endTime: newEnd})).toBe(true);
        });

        it('getTime12HourWithTranslatedPeriod shows the same period the picker offers', () => {
            const translateDE = getTranslateFn(CONST.LOCALES.DE);
            expect(DateUtils.getTime12HourWithTranslatedPeriod(translateDE, '2026-08-04 00:00:00')).toBe('12:00 AM');
            expect(DateUtils.getTime12HourWithTranslatedPeriod(translateDE, '2026-08-04 12:00:00')).toBe('12:00 PM');
            expect(DateUtils.getTime12HourWithTranslatedPeriod(translateDE, '2026-08-04 08:30:00')).toBe('08:30 AM');
        });

        it('getTime12HourWithTranslatedPeriod returns an empty string when there is no date', () => {
            expect(DateUtils.getTime12HourWithTranslatedPeriod(getTranslateFn(CONST.LOCALES.DE), '')).toBe('');
        });

        it('formatDateTimeTo12Hour and the Until label use the same period as the row', () => {
            const translateDE = getTranslateFn(CONST.LOCALES.DE);
            expect(DateUtils.formatDateTimeTo12Hour(translateDE, '2026-08-04 14:30:00')).toBe('2026-08-04 02:30 PM');
            expect(DateUtils.getLocalizedTimePeriodDescription(translateDE, undefined, '2026-08-04 14:30:00')).toBe('2026-08-04 02:30 PM');
        });

        it('datetimeToCalendarTime uses the same period as the row', () => {
            // Pinned so the date lands outside the current week and the branch under test is stable.
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2026-08-25T00:00:00Z'));
            expect(DateUtils.datetimeToCalendarTime(CONST.LOCALES.DE, '2026-08-04 14:30:00', timezone)).toBe('Aug. 4, 2026 um 2:30 PM');
            jest.useRealTimers();
        });

        it('a time in the hour skipped by the local DST change keeps its own hour', () => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date(2026, 2, 8, 0, 30));
            expect(DateUtils.getTime12HourWithTranslatedPeriod(getTranslateFn(CONST.LOCALES.DE), '2026-08-04 02:30:00')).toBe('02:30 AM');
            jest.useRealTimers();
        });
    });

    describe('getTime12HourWithTranslatedPeriod in a locale that translates the period', () => {
        beforeEach(() => IntlStore.load(CONST.LOCALES.JA));

        it('keeps the translated marker', () => {
            const translateJA = getTranslateFn(CONST.LOCALES.JA);
            expect(DateUtils.getTime12HourWithTranslatedPeriod(translateJA, '2026-08-04 14:00:00')).toBe('02:00 午後');
            expect(DateUtils.getTime12HourWithTranslatedPeriod(translateJA, '2026-08-04 08:00:00')).toBe('08:00 午前');
        });
    });
});
