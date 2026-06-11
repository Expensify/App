/* eslint-disable @typescript-eslint/naming-convention */
import {addDays, addMinutes, endOfDay, format, set, setHours, setMinutes, startOfDay, subDays, subHours, subMinutes, subSeconds} from 'date-fns';
import {fromZonedTime, toZonedTime, format as tzFormat} from 'date-fns-tz';
import Onyx from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import DateUtils from '@libs/DateUtils';
import {translate} from '@libs/Localize';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@src/libs/Log');

const LOCALE = CONST.LOCALES.EN;
const UTC = 'UTC';

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
        const localDate = DateUtils.getLocalDateFromDatetime(LOCALE, 'InvalidTimezone' as SelectedTimezone, undefined);
        expect(localDate.getTime()).not.toBeNaN();
    });

    it('should return the date in calendar time when calling datetimeToCalendarTime', () => {
        const today = setMinutes(setHours(new Date(), 14), 32).toString();
        expect(DateUtils.datetimeToCalendarTime(LOCALE, today, UTC as SelectedTimezone, false)).toBe('Today at 2:32 PM');

        const tomorrow = addDays(setMinutes(setHours(new Date(), 14), 32), 1).toString();
        expect(DateUtils.datetimeToCalendarTime(LOCALE, tomorrow, UTC as SelectedTimezone, false)).toBe('Tomorrow at 2:32 PM');

        const yesterday = setMinutes(setHours(subDays(new Date(), 1), 7), 43).toString();
        expect(DateUtils.datetimeToCalendarTime(LOCALE, yesterday, UTC as SelectedTimezone, false)).toBe('Yesterday at 7:43 AM');

        const date = setMinutes(setHours(new Date('2022-11-05'), 10), 17).toString();
        expect(DateUtils.datetimeToCalendarTime(LOCALE, date, UTC as SelectedTimezone, false)).toBe('Nov 5, 2022 at 10:17 AM');

        const todayLowercaseDate = setMinutes(setHours(new Date(), 14), 32).toString();
        expect(DateUtils.datetimeToCalendarTime(LOCALE, todayLowercaseDate, UTC as SelectedTimezone, false, true)).toBe('today at 2:32 PM');
    });

    it('should update timezone if automatic and selected timezone do not match', async () => {
        jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(
            () =>
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
        expect(DateUtils.datetimeToRelative(LOCALE, aFewSecondsAgo, UTC as SelectedTimezone)).toBe('less than a minute ago');

        const aMinuteAgo = subMinutes(new Date(), 1).toString();
        expect(DateUtils.datetimeToRelative(LOCALE, aMinuteAgo, UTC as SelectedTimezone)).toBe('1 minute ago');

        const anHourAgo = subHours(new Date(), 1).toString();
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

        it('returns the correct date when the date with time is used', () => {
            const datetimeStr = '2022-11-07 17:48:00';
            const expectedResult = '2022-11-07';
            expect(DateUtils.formatWithUTCTimeZone(datetimeStr)).toEqual(expectedResult);
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
            const expectedLabel = tzFormat(targetTime, CONST.DATE.LOCAL_TIME_FORMAT, {timeZone: currentTimeZone});

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
            const expectedLabel = tzFormat(converted, CONST.DATE.LOCAL_TIME_FORMAT, {timeZone: currentTimeZone});

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
        // Local-midnight Date + UTC-zone formatter shifts a day for UTC+ viewers; `toUTCDate` anchors at UTC midnight.
        it.each(['en', 'es'] as const)('formatInUTCToMedium renders the input calendar day in %s regardless of viewer timezone', (locale) => {
            const result = DateUtils.formatInUTCToMedium('2025-08-19', locale);
            const expected = new Intl.DateTimeFormat(locale, {dateStyle: 'medium', timeZone: 'UTC'}).format(new Date('2025-08-19T00:00:00Z'));
            expect(result).toBe(expected);
        });

        it.each(['en', 'es'] as const)('formatInUTCToShort renders the input calendar day in %s regardless of viewer timezone', (locale) => {
            const result = DateUtils.formatInUTCToShort('2025-01-01', locale);
            const expected = new Intl.DateTimeFormat(locale, {month: 'short', day: 'numeric', timeZone: 'UTC'}).format(new Date('2025-01-01T00:00:00Z'));
            expect(result).toBe(expected);
        });

        it.each(['en', 'es'] as const)('formatInUTCToLong renders the input calendar day in %s regardless of viewer timezone', (locale) => {
            const result = DateUtils.formatInUTCToLong('2025-12-31', locale);
            const expected = new Intl.DateTimeFormat(locale, {dateStyle: 'long', timeZone: 'UTC'}).format(new Date('2025-12-31T00:00:00Z'));
            expect(result).toBe(expected);
        });

        it('parses DB wire timestamps (yyyy-MM-dd HH:mm:ss) as UTC, not local — UTC+ viewers must not see day-shift', () => {
            // `new Date('2026-01-01 00:30:00')` parses as LOCAL in V8/Hermes; in UTC+5:30 that becomes 2025-12-31 19:00Z.
            expect(DateUtils.formatInUTCToMedium('2026-01-01 00:30:00', 'en')).toMatch(/Jan\s*1\D.*2026/);
        });
    });

    describe('formatToShortMonth', () => {
        it.each([
            ['en', /^Aug/],
            ['es', /^ago/],
            ['ja', /8月/],
        ] as const)('renders the month in %s', (locale, expectedPattern) => {
            expect(DateUtils.formatToShortMonth(new Date('2025-08-19T00:00:00Z'), locale)).toMatch(expectedPattern);
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

        // Placeholder and value use different presets; if they ever drift, DatePicker shows "MM/DD/YYYY" hint with "05.01.2026" value.
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
    });

    describe('formatInTimeZoneTo* (date-only inputs throw)', () => {
        it.each([
            ['formatInTimeZoneToLong' as const, '2025-08-19'],
            ['formatInTimeZoneToShortTime' as const, '2025-08-19'],
            ['formatInTimeZoneToWeekday' as const, '2025-08-19'],
        ])('%s throws on date-only input', (fnName, dateStr) => {
            expect(() => DateUtils[fnName](dateStr, 'America/New_York', 'en')).toThrow(RangeError);
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
            expect(DateUtils.formatUTCDateTimeToDateInTimezone('', UTC as SelectedTimezone)).toBe('');
        });

        it('should return empty string when timeZone is empty', () => {
            expect(DateUtils.formatUTCDateTimeToDateInTimezone('2024-01-15 08:00:00', '' as SelectedTimezone)).toBe('');
        });

        it('should return date in yyyy-MM-dd format when timeZone is UTC', () => {
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
            const result = DateUtils.formatUTCDateTimeToDateInTimezone('2024-01-15 08:00:00.000', UTC as SelectedTimezone);
            expect(result).toBe('2024-01-15');
        });

        it('should handle date-only format (parses as midnight UTC)', () => {
            const result = DateUtils.formatUTCDateTimeToDateInTimezone('2024-01-15', UTC as SelectedTimezone);
            expect(result).toBe('2024-01-15');
        });

        it('should return empty string for invalid date', () => {
            const result = DateUtils.formatUTCDateTimeToDateInTimezone('invalid-date', UTC as SelectedTimezone);
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
            const result = DateUtils.normalizeDateToStartOfDay('2024-01-15', UTC as SelectedTimezone);
            expect(result).toBe('2024-01-15 00:00:00');
        });

        it('should match getDBTime of startOfDay for the parsed date (without milliseconds)', () => {
            const dateStr = '2022-11-07';
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
            const result = DateUtils.normalizeDateToEndOfDay('2024-01-15', UTC as SelectedTimezone);
            expect(result).toBe('2024-01-15 23:59:59');
        });

        it('should match getDBTime of endOfDay for the parsed date (without milliseconds)', () => {
            const dateStr = '2022-11-07';
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
});
