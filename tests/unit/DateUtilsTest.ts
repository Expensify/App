import type {LocaleContextProps} from '@components/LocaleContextProvider';

import DateUtils from '@libs/DateUtils';
import {translate} from '@libs/Localize';

import CONST from '@src/CONST';
import type {Locale} from '@src/CONST/LOCALES';
import IntlStore from '@src/languages/IntlStore';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';

/* eslint-disable @typescript-eslint/naming-convention */
import {addDays, addMinutes, endOfDay, format, set, setHours, setMinutes, startOfDay, subDays, subHours, subMinutes, subSeconds} from 'date-fns';
import {fromZonedTime, toZonedTime, format as tzFormat} from 'date-fns-tz';
import {enUS} from 'date-fns/locale/en-US';
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

    it('formatToDayOfWeek should return a weekday', () => {
        const weekDay = DateUtils.formatToDayOfWeek(new Date(datetime), LOCALE);
        expect(weekDay).toBe('Monday');
    });
    it('formatToLocalTime should return a date in a local format', () => {
        const localTime = DateUtils.formatToLocalTime(datetime, LOCALE);
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
        expect(DateUtils.datetimeToCalendarTime(LOCALE, today, UTC)).toBe('Today at 2:32 PM');

        const tomorrow = addDays(setMinutes(setHours(new Date(), 14), 32), 1).toString();
        expect(DateUtils.datetimeToCalendarTime(LOCALE, tomorrow, UTC)).toBe('Tomorrow at 2:32 PM');

        const yesterday = setMinutes(setHours(subDays(new Date(), 1), 7), 43).toString();
        expect(DateUtils.datetimeToCalendarTime(LOCALE, yesterday, UTC)).toBe('Yesterday at 7:43 AM');

        const date = setMinutes(setHours(new Date('2022-11-05'), 10), 17).toString();
        expect(DateUtils.datetimeToCalendarTime(LOCALE, date, UTC)).toBe('Nov 5, 2022 at 10:17 AM');

        const todayLowercaseDate = setMinutes(setHours(new Date(), 14), 32).toString();
        expect(DateUtils.datetimeToCalendarTime(LOCALE, todayLowercaseDate, UTC, true)).toBe('today at 2:32 PM');
    });

    describe('datetimeToCalendarTime — locale + bucketing', () => {
        afterEach(() => {
            jest.useRealTimers();
        });

        it('es renders 24h time', () => {
            jest.useFakeTimers().setSystemTime(new Date('2026-03-11T14:32:00Z'));
            const now = new Date().toISOString();
            expect(DateUtils.datetimeToCalendarTime(CONST.LOCALES.ES, now, UTC)).toMatch(/14:32/);
        });

        it('ja bucketing uses Sunday-start', () => {
            jest.useFakeTimers().setSystemTime(new Date('2026-03-11T12:00:00Z'));
            // Sunday 2026-03-08 is inside the current ja week (Sun-start) but the previous en week (Mon-start).
            const sunday = '2026-03-08T10:00:00Z';
            const jaResult = DateUtils.datetimeToCalendarTime(CONST.LOCALES.JA, sunday, UTC);
            expect(jaResult).not.toMatch(/2026/);
            const enResult = DateUtils.datetimeToCalendarTime(CONST.LOCALES.EN, sunday, UTC);
            expect(enResult).toMatch(/2026/);
        });

        it('past year renders with year', () => {
            jest.useFakeTimers().setSystemTime(new Date('2026-06-15T12:00:00Z'));
            const oldDate = '2022-11-05T10:17:00Z';
            expect(DateUtils.datetimeToCalendarTime(CONST.LOCALES.EN, oldDate, UTC)).toBe('Nov 5, 2022 at 10:17 AM');
        });

        it('today/tomorrow boundary respects the selected timezone', () => {
            // 00:30 UTC Mar 11 is 16:30 Mar 10 in Pacific, and the 04:00 UTC target is 20:00 Mar 10 there: same LA day.
            jest.useFakeTimers().setSystemTime(new Date('2026-03-11T00:30:00Z'));
            const laterSameLaDay = '2026-03-11T04:00:00Z';
            const result = DateUtils.datetimeToCalendarTime(CONST.LOCALES.EN, laterSameLaDay, 'America/Los_Angeles');
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

        // Sub-minute rounds up. date-fns said "less than a minute ago", which Intl cannot express.
        const aFewSecondsAgo = subSeconds(new Date(), 10).toString();
        expect(DateUtils.datetimeToRelative(LOCALE, aFewSecondsAgo, UTC)).toBe('1 minute ago');

        const aMinuteAgo = subMinutes(new Date(), 1).toString();
        expect(DateUtils.datetimeToRelative(LOCALE, aMinuteAgo, UTC)).toBe('1 minute ago');

        const anHourAgo = subHours(new Date(), 1).toString();
        expect(DateUtils.datetimeToRelative(LOCALE, anHourAgo, UTC)).toBe('1 hour ago');
    });

    it('datetimeToRelative renders localized wording for non-English locales', async () => {
        await IntlStore.load(CONST.LOCALES.ES);
        const anHourAgo = subHours(new Date(), 1).toString();
        const result = DateUtils.datetimeToRelative(CONST.LOCALES.ES, anHourAgo, UTC);
        expect(result).toMatch(/hace/);
        expect(result).not.toMatch(/ago/);
    });

    it('datetimeToRelative renders Greek wording end-to-end after IntlStore.load("el")', async () => {
        await IntlStore.load(CONST.LOCALES.EL);
        const anHourAgo = subHours(new Date(), 1).toString();
        const result = DateUtils.datetimeToRelative(CONST.LOCALES.EL, anHourAgo, UTC);
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
            expect(DateUtils.getStatusUntilDate(translateLocal, '', inputTimeZoneNY, currentTimeZone, LOCALE)).toBe('');
        });

        it('returns "Until h:mm a" when input and current timezone are same', () => {
            const nowInTZ = toZonedTime(new Date(), currentTimeZone);
            const targetTime = set(nowInTZ, {hours: 15, minutes: 34, seconds: 0, milliseconds: 0});
            const inputDateStr = tzFormat(targetTime, CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, {timeZone: currentTimeZone});

            const result = DateUtils.getStatusUntilDate(translateLocal, inputDateStr, currentTimeZone, currentTimeZone, LOCALE);
            // eslint-disable-next-line rulesdir/require-locale-for-localized-date-format -- expected label pinned to enUS to match the SUT.
            const expectedLabel = tzFormat(targetTime, CONST.DATE.LOCAL_TIME_FORMAT, {timeZone: currentTimeZone, locale: enUS});

            expect(result).toBe(`Until ${expectedLabel}`);
        });

        it('returns "Until tomorrow" when end of day is in the same timezone', () => {
            const nowInCurrent = toZonedTime(new Date(), currentTimeZone);
            const endOfTodayCurrent = endOfDay(nowInCurrent);

            const inputDateStrNY = tzFormat(endOfTodayCurrent, CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, {timeZone: inputTimeZoneNY});

            const result = DateUtils.getStatusUntilDate(translateLocal, inputDateStrNY, inputTimeZoneNY, inputTimeZoneNY, LOCALE);
            expect(result).toBe('Until tomorrow');
        });

        it('returns "Until h:mm a" for later today in a different timezone', () => {
            const targetTimeLA = set(toZonedTime(new Date(), currentTimeZone), {hours: 15, minutes: 34, seconds: 0, milliseconds: 0});
            const inputDateStrNY = tzFormat(targetTimeLA, CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, {timeZone: inputTimeZoneNY});

            const result = DateUtils.getStatusUntilDate(translateLocal, inputDateStrNY, inputTimeZoneNY, currentTimeZone, LOCALE);

            const date = fromZonedTime(inputDateStrNY, inputTimeZoneNY);
            const converted = toZonedTime(date, currentTimeZone);
            // eslint-disable-next-line rulesdir/require-locale-for-localized-date-format -- expected label pinned to enUS to match the SUT.
            const expectedLabel = tzFormat(converted, CONST.DATE.LOCAL_TIME_FORMAT, {timeZone: currentTimeZone, locale: enUS});

            expect(result).toBe(`Until ${expectedLabel}`);
        });

        it('returns "Until {month-day} {time}" for future date within the same year in a different timezone', () => {
            const twoDaysLaterLA = addDays(set(toZonedTime(new Date(), currentTimeZone), {hours: 15, minutes: 0, seconds: 0, milliseconds: 0}), 2);
            const inputDateStrParis = tzFormat(twoDaysLaterLA, CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, {timeZone: inputTimeZoneParis});

            const result = DateUtils.getStatusUntilDate(translateLocal, inputDateStrParis, inputTimeZoneParis, currentTimeZone, LOCALE);

            const date = fromZonedTime(inputDateStrParis, inputTimeZoneParis);
            const monthDay = intlFormatForTest(date, CONST.DATE.INTL_FORMATS.MONTH_DAY, currentTimeZone);
            const time = intlFormatForTest(date, CONST.DATE.INTL_FORMATS.SHORT_TIME, currentTimeZone);

            expect(result).toBe(`Until ${monthDay} ${time}`);
        });

        it('returns "Until {month-day} {time}" when "until today" crosses into next day in current timezone', () => {
            const endOfTodayTokyo = endOfDay(toZonedTime(new Date(), inputTimeZoneTokyo));
            const inputDateStrTokyo = tzFormat(endOfTodayTokyo, CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, {timeZone: inputTimeZoneTokyo});

            const result = DateUtils.getStatusUntilDate(translateLocal, inputDateStrTokyo, inputTimeZoneTokyo, currentTimeZone, LOCALE);

            const date = fromZonedTime(inputDateStrTokyo, inputTimeZoneTokyo);
            const monthDay = intlFormatForTest(date, CONST.DATE.INTL_FORMATS.MONTH_DAY, currentTimeZone);
            const time = intlFormatForTest(date, CONST.DATE.INTL_FORMATS.SHORT_TIME, currentTimeZone);

            expect(result).toBe(`Until ${monthDay} ${time}`);
        });

        it('returns "Until {medium-date} {time}" for a date in a different year across timezones', () => {
            const laFutureDateStr = '2026-01-02 09:15:00';
            const inputDateStrTokyo = tzFormat(fromZonedTime(laFutureDateStr, currentTimeZone), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, {timeZone: inputTimeZoneTokyo});

            const result = DateUtils.getStatusUntilDate(translateLocal, inputDateStrTokyo, inputTimeZoneTokyo, currentTimeZone, LOCALE);

            const date = fromZonedTime(inputDateStrTokyo, inputTimeZoneTokyo);
            const fullDate = intlFormatForTest(date, CONST.DATE.INTL_FORMATS.MEDIUM_DATE, currentTimeZone);
            const time = intlFormatForTest(date, CONST.DATE.INTL_FORMATS.SHORT_TIME, currentTimeZone);

            expect(result).toBe(`Until ${fullDate} ${time}`);
        });
    });

    describe('formatInUTCTo*', () => {
        // A local-midnight Date under a UTC-zone formatter shifts a day for UTC+ viewers, so `toUTCDate` anchors at UTC midnight.
        it.each(['en', 'es'] as const)('formatInUTCToMedium renders the input calendar day in %s regardless of viewer timezone', (locale) => {
            const result = DateUtils.formatInUTCToMedium('2025-08-19', locale);
            const expected = new Intl.DateTimeFormat(locale, {dateStyle: 'medium', timeZone: 'UTC'}).format(new Date('2025-08-19T00:00:00Z'));
            expect(result).toBe(expected);
        });

        it.each(['en', 'es'] as const)('formatTransactionListDate renders a current-year day in %s regardless of viewer timezone', (locale) => {
            const currentYear = new Date().getUTCFullYear();
            const wireDate = `${currentYear}-01-01`;
            const result = DateUtils.formatTransactionListDate(wireDate, locale);
            const expected = new Intl.DateTimeFormat(locale, {month: 'short', day: 'numeric', timeZone: 'UTC'}).format(new Date(`${wireDate}T00:00:00Z`));
            expect(result).toBe(expected);
        });

        it.each(['en', 'es'] as const)('formatInUTCToLong renders the input calendar day in %s regardless of viewer timezone', (locale) => {
            const result = DateUtils.formatInUTCToLong('2025-12-31', locale);
            const expected = new Intl.DateTimeFormat(locale, {dateStyle: 'long', timeZone: 'UTC'}).format(new Date('2025-12-31T00:00:00Z'));
            expect(result).toBe(expected);
        });

        it('parses DB wire timestamps (yyyy-MM-dd HH:mm:ss) as UTC, not local — UTC+ viewers must not see day-shift', () => {
            // `new Date('2026-01-01 00:30:00')` parses as LOCAL in V8 and Hermes, so in UTC+5:30 it becomes 2025-12-31 19:00Z.
            expect(DateUtils.formatInUTCToMedium('2026-01-01 00:30:00', 'en')).toMatch(/Jan\s*1\D.*2026/);
        });
    });

    describe('formatTravelDate inputs', () => {
        const travelDate = new Date('2025-08-19T14:30:00Z');

        it('formatToMediumDate renders es as "19 ago 2025"', () => {
            const es = DateUtils.formatToMediumDate(travelDate, 'es');
            expect(es).toMatch(/19/);
            expect(es).toMatch(/ago/);
            expect(es).not.toMatch(/Aug/);
        });

        it('formatToLocalTime renders es in 24h', () => {
            const es = DateUtils.formatToLocalTime(travelDate, 'es');
            expect(es).not.toMatch(/AM|PM/);
        });

        it('formatToLocalTime renders en in 12h with AM/PM', () => {
            const en = DateUtils.formatToLocalTime(travelDate, 'en');
            expect(en).toMatch(/AM|PM/);
        });
    });

    describe('getDaysOfWeekNarrow', () => {
        it('en narrow labels are single-letter weekday initials', () => {
            const en = DateUtils.getDaysOfWeekNarrow('en');
            expect(en).toHaveLength(7);
            expect(en.every((d) => d.length === 1)).toBe(true);
        });

        it('zh-hans narrow labels are 7 distinct characters', () => {
            const zh = DateUtils.getDaysOfWeekNarrow('zh-hans');
            const distinct = new Set(zh);
            expect(distinct.size).toBe(7);
            expect(zh.every((d) => d !== '星')).toBe(true);
        });
    });

    describe('getLocalizedDatePlaceholder', () => {
        it.each(['en', 'es', 'de', 'fr', 'it', 'nl', 'pl', 'pt-BR', 'ja', 'zh-hans'] as const)('%s placeholder follows locale field order and separator', (locale) => {
            const placeholder = DateUtils.getLocalizedDatePlaceholder(locale);
            expect(placeholder).toMatch(/^(MM|DD|YYYY)([./-])(MM|DD|YYYY)\2(MM|DD|YYYY)$/);
        });

        it('en placeholder is MM/DD/YYYY', () => {
            expect(DateUtils.getLocalizedDatePlaceholder('en')).toBe('MM/DD/YYYY');
            expect(DateUtils.getLocalizedDatePlaceholder('en')).not.toBe('YYYY-MM-DD');
        });

        it('de uses dot separator', () => {
            expect(DateUtils.getLocalizedDatePlaceholder('de')).toBe('DD.MM.YYYY');
        });

        it('ja places year first', () => {
            expect(DateUtils.getLocalizedDatePlaceholder('ja')).toMatch(/^YYYY/);
        });
    });

    describe('formatToLocalizedShortDate', () => {
        it.each([
            ['en', '01/05/2026'],
            ['de', '05.01.2026'],
            ['ja', '2026/01/05'],
        ] as const)('renders 2026-01-05 as %s in %s', (locale, expected) => {
            expect(DateUtils.formatToLocalizedShortDate('2026-01-05', locale)).toBe(expected);
        });

        it('never renders the canonical "yyyy-MM-dd" form to en users', () => {
            expect(DateUtils.formatToLocalizedShortDate('2026-01-05', 'en')).not.toBe('2026-01-05');
        });

        it('date-only input renders the same calendar day for every viewer timezone', () => {
            const en = DateUtils.formatToLocalizedShortDate('2025-08-19', 'en');
            const ja = DateUtils.formatToLocalizedShortDate('2025-08-19', 'ja');
            expect(en).toContain('08');
            expect(en).toContain('19');
            expect(ja).toContain('08');
            expect(ja).toContain('19');
        });

        // Different presets, so drift would pair an "MM/DD/YYYY" hint with an "05.01.2026" value.
        it.each(['en', 'de', 'ja', 'ko', 'es', 'fr', 'pt-BR', 'it', 'nl', 'pl', 'zh-hans', 'zh-hant'] as const)(
            'placeholder and formatted value share the same field order and separators (%s)',
            (locale) => {
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
                expect(orderFromPreset({dateStyle: 'short'})).toEqual(orderFromPreset({year: 'numeric', month: '2-digit', day: '2-digit'}));
                expect(literalsFromPreset({dateStyle: 'short'})).toEqual(literalsFromPreset({year: 'numeric', month: '2-digit', day: '2-digit'}));
            },
        );
    });

    describe('getWeekStartsOn / getWeekEndsOn', () => {
        it.each([
            ['en', 1, 0],
            ['es', 1, 0],
            ['el', 1, 0],
            ['ja', 0, 6],
            ['pt-BR', 0, 6],
        ] as const)('locale %s starts on %i and ends on %i', (locale, start, end) => {
            expect(DateUtils.getWeekStartsOn(locale)).toBe(start);
            expect(DateUtils.getWeekEndsOn(locale)).toBe(end);
        });

        it('returns a valid weekday for every supported locale', () => {
            for (const locale of Object.values(CONST.LOCALES)) {
                if (locale === CONST.LOCALES.DEFAULT) {
                    continue;
                }
                expect([0, 1, 2, 3, 4, 5, 6]).toContain(DateUtils.getWeekStartsOn(locale));
            }
        });

        describe('fallback branches', () => {
            const originalLocale = Intl.Locale;

            /**
             * Resolves the locale against a stubbed `Intl.Locale` on a freshly required module. The real
             * `getWeekStartsOn` memoizes, and the blocks above already resolved these locales through real Intl, so
             * without isolation the cache answers first and the fallback code under test never runs.
             */
            function getWeekStartsOnWith(impl: () => Record<string, unknown>, locale: Locale): number {
                Object.defineProperty(Intl, 'Locale', {value: jest.fn(impl), configurable: true, writable: true});
                try {
                    let result = -1;
                    jest.isolateModules(() => {
                        const fresh = jest.requireActual<{default: typeof DateUtils}>('@libs/DateUtils').default;
                        result = fresh.getWeekStartsOn(locale);
                    });
                    return result;
                } finally {
                    Object.defineProperty(Intl, 'Locale', {value: originalLocale, configurable: true, writable: true});
                }
            }

            function throwOnConstruction(): Record<string, unknown> {
                throw new RangeError('Intl.Locale unavailable');
            }

            it('reads `weekInfo` property when `getWeekInfo()` method is absent', () => {
                expect(getWeekStartsOnWith(() => ({weekInfo: {firstDay: 7, weekend: [6, 7], minimalDays: 1}}), CONST.LOCALES.JA)).toBe(0);
            });

            it('falls back to the CLDR-per-locale map when neither getWeekInfo() nor weekInfo is available', () => {
                // ja is Sunday-start per CLDR. The static-map fallback preserves that on engines without `getWeekInfo`.
                expect(getWeekStartsOnWith(() => ({}), CONST.LOCALES.JA)).toBe(0);
                expect(getWeekStartsOnWith(() => ({}), CONST.LOCALES.FR)).toBe(1);
            });

            it('falls back to the CLDR-per-locale map when Intl.Locale constructor throws', () => {
                expect(getWeekStartsOnWith(throwOnConstruction, CONST.LOCALES.JA)).toBe(0);
                expect(getWeekStartsOnWith(throwOnConstruction, CONST.LOCALES.FR)).toBe(1);
            });

            it('falls back to the CLDR-per-locale map when firstDay is out of range', () => {
                expect(getWeekStartsOnWith(() => ({weekInfo: {firstDay: 99, weekend: [6, 7], minimalDays: 1}}), CONST.LOCALES.JA)).toBe(0);
                expect(getWeekStartsOnWith(() => ({weekInfo: {firstDay: 99, weekend: [6, 7], minimalDays: 1}}), CONST.LOCALES.FR)).toBe(1);
            });

            it('static CLDR map reproduces Intl.Locale.getWeekInfo for every supported locale', () => {
                // Read the truth from real Intl first, then disable it, so the two sides come from different sources.
                // Comparing the map against Intl while Intl is still reachable would compare it against itself.
                const probe = new Intl.Locale(CONST.LOCALES.EN);
                if (typeof probe.getWeekInfo !== 'function') {
                    return;
                }
                for (const locale of Object.values(CONST.LOCALES)) {
                    // `en` carries a product override, asserted on its own below against both sides.
                    if (locale === CONST.LOCALES.DEFAULT) {
                        continue;
                    }
                    const weekInfo = new Intl.Locale(locale).getWeekInfo();
                    const intlFirstDay = weekInfo.firstDay === 7 ? 0 : weekInfo.firstDay;
                    expect({locale, fallback: getWeekStartsOnWith(throwOnConstruction, locale)}).toEqual({locale, fallback: intlFirstDay});
                }
            });

            it('pins en to Monday, deliberately against CLDR', () => {
                const probe = new Intl.Locale(CONST.LOCALES.EN);
                if (typeof probe.getWeekInfo !== 'function') {
                    return;
                }
                const weekInfo = probe.getWeekInfo();
                expect(weekInfo.firstDay === 7 ? 0 : weekInfo.firstDay).toBe(0);
                expect(DateUtils.getWeekStartsOn(CONST.LOCALES.EN)).toBe(1);
            });
        });
    });

    describe('formatInTimeZoneTo* (date-only inputs degrade to "")', () => {
        it.each([
            ['formatInTimeZoneToLong' as const, '2025-08-19'],
            ['formatInTimeZoneToShortTime' as const, '2025-08-19'],
            ['formatInTimeZoneToWeekday' as const, '2025-08-19'],
        ])('%s returns "" instead of throwing on unzoned input', (fnName, dateStr) => {
            const run = () => DateUtils[fnName](dateStr, 'America/New_York', 'en');
            expect(run).not.toThrow();
            expect(run()).toBe('');
        });
    });

    describe('getFormattedSplitDateRange', () => {
        const translateEN = <TPath extends TranslationPaths>(path: TPath, ...params: TranslationParameters<TPath>) => translate(LOCALE, path, ...params);

        it('should return empty string when startDate is undefined', () => {
            const result = DateUtils.getFormattedSplitDateRange(translateEN, undefined, '2024-01-15', LOCALE);
            expect(result).toBe('');
        });

        it('should return empty string when endDate is undefined', () => {
            const result = DateUtils.getFormattedSplitDateRange(translateEN, '2024-01-10', undefined, LOCALE);
            expect(result).toBe('');
        });

        it('should return empty string when both dates are undefined', () => {
            const result = DateUtils.getFormattedSplitDateRange(translateEN, undefined, CONST.LOCALES.EN, LOCALE);
            expect(result).toBe('');
        });

        it('should return empty string when a date is unparsable', () => {
            const result = DateUtils.getFormattedSplitDateRange(translateEN, 'not-a-date', '2024-01-15', LOCALE);
            expect(result).toBe('');
        });

        it('should return plural form for multiple days', () => {
            const result = DateUtils.getFormattedSplitDateRange(translateEN, '2024-01-10', '2024-01-15', LOCALE);
            expect(result).toContain('Jan 10, 2024');
            expect(result).toContain('to');
            expect(result).toContain('Jan 15, 2024');
            expect(result).toContain('6 days');
        });

        it('should return correct format for 2 days', () => {
            const result = DateUtils.getFormattedSplitDateRange(translateEN, '2024-01-10', '2024-01-11', LOCALE);
            expect(result).toContain('Jan 10, 2024');
            expect(result).toContain('to');
            expect(result).toContain('Jan 11, 2024');
            expect(result).toContain('2 days');
        });

        it('should handle cross-month date ranges', () => {
            const result = DateUtils.getFormattedSplitDateRange(translateEN, '2024-01-25', '2024-02-05', LOCALE);
            expect(result).toContain('Jan 25, 2024');
            expect(result).toContain('to');
            expect(result).toContain('Feb 5, 2024');
            expect(result).toContain('12 days');
        });

        it('should handle cross-year date ranges', () => {
            const result = DateUtils.getFormattedSplitDateRange(translateEN, '2023-12-25', '2024-01-05', LOCALE);
            expect(result).toContain('Dec 25, 2023');
            expect(result).toContain('to');
            expect(result).toContain('Jan 5, 2024');
            expect(result).toContain('12 days');
        });

        it('should localize the dates rather than emitting the wire shape', () => {
            const result = DateUtils.getFormattedSplitDateRange(
                <TPath extends TranslationPaths>(path: TPath, ...params: TranslationParameters<TPath>) => translate(CONST.LOCALES.ES, path, ...params),
                '2024-01-10',
                '2024-01-15',
                CONST.LOCALES.ES,
            );
            expect(result).toContain('10 ene 2024');
            expect(result).toContain('15 ene 2024');
            expect(result).not.toContain('2024-01-10');
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
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));
            const result = DateUtils.getFormattedCancellationDate('2026-04-19', CONST.LOCALES.EN);
            expect(result).toBe('Sunday, Apr 19, 2026 12:00 AM, UTC');
        });

        it('renders non-English locales with locale-driven field order + clock (not just token translation)', () => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));
            const es = DateUtils.getFormattedCancellationDate('2026-04-19T15:00:00+07:00', CONST.LOCALES.ES);
            // Spanish convention is day before month on a 24h clock, where a date-fns pattern would keep the English order and 12h "3:00 PM".
            expect(es).not.toMatch(/AM|PM/);
            expect(es).toContain('15:00');
            expect(es).toContain('GMT+7');
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
            const observed = collectDateTimeFormatOptions((fresh) => {
                fresh[fnName]('2026-01-15', CONST.LOCALES.EN);
            });
            expect(observed.some((o) => o.timeZone === 'UTC')).toBe(true);
        });

        it('formatToLocalizedShortDate uses timeZone: "UTC"', () => {
            const observed = collectDateTimeFormatOptions((fresh) => {
                fresh.formatToLocalizedShortDate('2026-01-15', CONST.LOCALES.EN);
            });
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
            expect(run).not.toThrow();
            expect(run()).toBe('');
        });
    });

    describe('wire-timestamp helpers accept the DB shape', () => {
        it('extractDate returns the calendar day', () => {
            expect(DateUtils.extractDate('2025-07-09 14:30:00')).toBe('2025-07-09');
        });

        it('extractDate returns empty rather than throwing on an unparsable value', () => {
            expect(DateUtils.extractDate('not-a-date')).toBe('');
        });

        it('isValidStartEndTimeRange accepts a picker-built range', () => {
            expect(DateUtils.isValidStartEndTimeRange({startTime: '2025-07-09 08:00:00', endTime: '2025-07-09 14:00:00'})).toBe(true);
        });

        it('isValidDateString accepts the DB shape and rejects garbage', () => {
            expect(DateUtils.isValidDateString('2025-07-09 14:30:00')).toBe(true);
            expect(DateUtils.isValidDateString('not-a-date')).toBe(false);
        });
    });

    describe('toLocalDate parses the DB wire shapes explicitly (Hermes rejects what V8 accepts)', () => {
        it.each([
            ['2025-07-09', [2025, 6, 9, 0, 0, 0, 0]],
            ['2025-07-09 14:30', [2025, 6, 9, 14, 30, 0, 0]],
            ['2025-07-09 14:30:45', [2025, 6, 9, 14, 30, 45, 0]],
            ['2025-07-09 14:30:45.123', [2025, 6, 9, 14, 30, 45, 123]],
        ])('parses %s as local wall-clock', (wire, [y, mo, d, h, mi, sec, ms]) => {
            const parsed = DateUtils.toLocalDate(wire);
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
            expect(DateUtils.toLocalDate('2025-07-09 14:30:45.123456').getSeconds()).toBe(45);
        });

        it('passes a Date through untouched', () => {
            const date = new Date(2025, 6, 9);
            expect(DateUtils.toLocalDate(date)).toBe(date);
        });
    });

    describe('getStablePerDiemMerchantDateRange is a wire contract, not a display format', () => {
        it('stays enUS-pinned under a non-English locale so the comma count consumers rely on never moves', async () => {
            await IntlStore.load(CONST.LOCALES.ES);
            const range = DateUtils.getStablePerDiemMerchantDateRange(new Date(2026, 0, 5), new Date(2026, 0, 8));
            expect(range).toBe('Jan 5, 2026 - Jan 8, 2026');
            // PerDiemEReceipt splits the merchant on ', ' and takes the last three parts as the range.
            expect(`Berlin, ${range}`.split(', ').length).toBe(4);
            await IntlStore.load(LOCALE);
        });
    });

    describe('doesDateBelongToAPastYear reads the year off the wire string', () => {
        afterEach(() => {
            jest.useRealTimers();
        });

        it('does not suffix a year onto a same-year row viewed after the UTC day has rolled over', () => {
            jest.useFakeTimers().setSystemTime(new Date(2025, 11, 31, 20, 0, 0));
            expect(DateUtils.doesDateBelongToAPastYear('2025-12-31')).toBe(false);
        });

        it('flags a genuinely earlier year', () => {
            jest.useFakeTimers().setSystemTime(new Date(2026, 5, 15, 12, 0, 0));
            expect(DateUtils.doesDateBelongToAPastYear('2023-05-01')).toBe(true);
        });
    });

    describe('locale-aware helpers render localized output', () => {
        it('formatToShortMonthDay renders es as "9 jul"', () => {
            expect(DateUtils.formatToShortMonthDay('2025-07-09', 'es')).toBe('9 jul');
        });

        it('getFormattedQuarterForSearch renders es with localized month abbreviations', () => {
            const result = DateUtils.getFormattedQuarterForSearch(2025, 3, 'es');
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
            expect(DateUtils[fnName]('2025-07-09 14:30:00', locale)).toBe(expected);
        });

        it.each([
            [CONST.LOCALES.EN, 'Jul 9, 2025, 2:30 PM'],
            [CONST.LOCALES.ES, '9 jul 2025, 14:30'],
        ])('getLocalizedTimePeriodDescription renders a custom status date in %s as %s', (locale, expected) => {
            const translateFor = <TPath extends TranslationPaths>(path: TPath, ...params: TranslationParameters<TPath>) => translate(locale, path, ...params);
            expect(DateUtils.getLocalizedTimePeriodDescription(translateFor, locale, '2025-07-09 14:30:00')).toBe(expected);
        });

        it('the named wrappers accept a Date as well as a wire string', () => {
            const wire = '2025-07-09 14:30:00';
            expect(DateUtils.formatToLongMonthYear(DateUtils.toLocalDate(wire), CONST.LOCALES.ES)).toBe(DateUtils.formatToLongMonthYear(wire, CONST.LOCALES.ES));
        });

        it.each([
            [CONST.LOCALES.EN, 'Mar 17-20'],
            [CONST.LOCALES.ES, '17-20 mar'],
            [CONST.LOCALES.FR, '17-20 mars'],
            [CONST.LOCALES.DE, '17-20. M\u00e4rz'],
            [CONST.LOCALES.JA, '3\u670817\u65e5-20\u65e5'],
        ])('getFormattedDateRange puts the shared month where %s writes it', (locale, expected) => {
            const start = new Date(2025, 2, 17);
            const end = new Date(2025, 2, 20);
            expect(DateUtils.getFormattedDateRange(translateLocal, start, end, locale)).toBe(expected);
        });

        it('getFormattedDateRangeForSearch returns empty rather than an orphan separator on an unparsable boundary', () => {
            expect(DateUtils.getFormattedDateRangeForSearch('not-a-date', '2025-07-09', false, false, LOCALE)).toBe('');
            expect(DateUtils.getFormattedDateRangeForSearch('2025-07-09', 'not-a-date', false, false, LOCALE)).toBe('');
        });

        it('refreshIntlFormatterCaches drops cached failures but keeps working formatters', () => {
            DateUtils.clearIntlFormatterCaches();
            const throwingSpy = jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => {
                throw new RangeError('no Intl');
            });
            expect(DateUtils.formatToMediumDate('2025-07-09', CONST.LOCALES.ES)).toBe('');
            throwingSpy.mockRestore();

            // Repeated deliberately: `Intl` works again, and this is still empty only because the failure is cached.
            expect(DateUtils.formatToMediumDate('2025-07-09', CONST.LOCALES.ES)).toBe('');

            expect(DateUtils.formatToMediumDate('2025-07-09', CONST.LOCALES.EN)).not.toBe('');
            const constructorSpy = jest.spyOn(Intl, 'DateTimeFormat');
            DateUtils.refreshIntlFormatterCaches();

            expect(DateUtils.formatToMediumDate('2025-07-09', CONST.LOCALES.ES)).not.toBe('');
            const constructionsToRecoverTheFailure = constructorSpy.mock.calls.length;

            expect(DateUtils.formatToMediumDate('2025-07-09', CONST.LOCALES.EN)).not.toBe('');
            expect(constructorSpy.mock.calls).toHaveLength(constructionsToRecoverTheFailure);
            constructorSpy.mockRestore();
        });

        it('getFormattedQuarterForSearch keeps the quarter label when the bounds cannot be formatted', () => {
            DateUtils.clearIntlFormatterCaches();
            jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => {
                throw new RangeError('no Intl');
            });
            expect(DateUtils.getFormattedQuarterForSearch(2025, 3, LOCALE)).toBe('Q3 2025');
            jest.restoreAllMocks();
            DateUtils.clearIntlFormatterCaches();
        });
    });

    // #97796: under a non-English date-fns default, localized meridiems (vorm./nachm.) failed Per Diem save.
    describe('time picker helpers stay on English AM/PM under non-English locales (#97796)', () => {
        beforeEach(async () => {
            await IntlStore.load(CONST.LOCALES.DE);
        });

        it('extractTime12Hour emits English AM/PM regardless of active locale', () => {
            expect(DateUtils.extractTime12Hour('2025-08-19 14:00:00')).toBe('02:00 PM');
        });

        it('get12HourTimeObjectFromDate returns English AM/PM period derived from the hour', () => {
            expect(DateUtils.get12HourTimeObjectFromDate('02:00 PM')?.period).toBe('PM');
            expect(DateUtils.get12HourTimeObjectFromDate('08:00 AM')?.period).toBe('AM');
        });

        it('combineDateAndTime parses the picker-emitted "hh:mm a" into the correct 24h time', () => {
            expect(DateUtils.combineDateAndTime('02:00 PM', '2025-08-19')).toBe('2025-08-19 14:00:00');
            expect(DateUtils.combineDateAndTime('08:00 AM', '2025-08-19')).toBe('2025-08-19 08:00:00');
        });

        it('isValidStartEndTimeRange accepts a picker-built 08:00 → 14:00 range that main rejected as invalid', () => {
            const startTime = DateUtils.combineDateAndTime('08:00 AM', '2025-08-19');
            const endTime = DateUtils.combineDateAndTime('02:00 PM', '2025-08-19');
            expect(DateUtils.isValidStartEndTimeRange({startTime, endTime})).toBe(true);
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

    describe('time picker helpers with a non-English date-fns locale', () => {
        beforeEach(() => IntlStore.load(CONST.LOCALES.DE));

        it('combineDateAndTime parses the picker-submitted English AM/PM value', () => {
            expect(DateUtils.combineDateAndTime('02:00 PM', '2026-08-04')).toBe('2026-08-04 14:00:00');
            expect(DateUtils.combineDateAndTime('08:00 AM', '2026-08-04 00:00:00')).toBe('2026-08-04 08:00:00');
        });

        it('get12HourTimeObjectFromDate returns the AM/PM period for a localized time string', () => {
            const localizedNoon = DateUtils.extractTime12Hour('2026-08-04 12:00:00');
            expect(DateUtils.get12HourTimeObjectFromDate(localizedNoon)?.period).toBe(CONST.TIME_PERIOD.PM);
            const localizedMorning = DateUtils.extractTime12Hour('2026-08-04 08:00:00');
            expect(DateUtils.get12HourTimeObjectFromDate(localizedMorning)).toEqual({hour: '08', minute: '00', seconds: '00', milliseconds: '000', period: CONST.TIME_PERIOD.AM});
        });

        it('per diem start/end range built from picker values validates', () => {
            const newStart = DateUtils.combineDateAndTime('08:00 AM', '2026-08-04');
            const newEnd = DateUtils.combineDateAndTime('02:00 PM', '2026-08-04');
            expect(DateUtils.isValidStartEndTimeRange({startTime: newStart, endTime: newEnd})).toBe(true);
        });
    });
});
