import Onyx from 'react-native-onyx';
import {format as tzFormat} from 'date-fns-tz';
import {addMinutes, subHours, subMinutes, subSeconds, format, setMinutes, setHours, subDays, addDays} from 'date-fns';
import CONST from '../../src/CONST';
import DateUtils from '../../src/libs/DateUtils';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';

const LOCALE = CONST.LOCALES.EN;

describe('DateUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: 999},
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {999: {timezone: {selected: 'UTC'}}},
            },
        });
        return waitForPromisesToResolve();
    });

    afterEach(() => {
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
        const weekDay = DateUtils.formatToDayOfWeek(datetime);
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

    it('should return the date in calendar time when calling datetimeToCalendarTime', () => {
        const today = setMinutes(setHours(new Date(), 14), 32);
        expect(DateUtils.datetimeToCalendarTime(LOCALE, today)).toBe('Today at 2:32 PM');

        const tomorrow = addDays(setMinutes(setHours(new Date(), 14), 32), 1);
        expect(DateUtils.datetimeToCalendarTime(LOCALE, tomorrow)).toBe('Tomorrow at 2:32 PM');

        const yesterday = setMinutes(setHours(subDays(new Date(), 1), 7), 43);
        expect(DateUtils.datetimeToCalendarTime(LOCALE, yesterday)).toBe('Yesterday at 7:43 AM');

        const date = setMinutes(setHours(new Date('2022-11-05'), 10), 17);
        expect(DateUtils.datetimeToCalendarTime(LOCALE, date)).toBe('Nov 5, 2022 at 10:17 AM');

        const todayLowercaseDate = setMinutes(setHours(new Date(), 14), 32);
        expect(DateUtils.datetimeToCalendarTime(LOCALE, todayLowercaseDate, false, undefined, true)).toBe('today at 2:32 PM');
    });

    it('should update timezone if automatic and selected timezone do not match', () => {
        Intl.DateTimeFormat = jest.fn(() => ({
            resolvedOptions: () => ({timeZone: 'America/Chicago'}),
        }));
        Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {999: {timezone: {selected: 'UTC', automatic: true}}}).then(() => {
            const result = DateUtils.getCurrentTimezone();
            expect(result).toEqual({
                selected: 'America/Chicago',
                automatic: true,
            });
        });
    });

    it('should not update timezone if automatic and selected timezone match', () => {
        Intl.DateTimeFormat = jest.fn(() => ({
            resolvedOptions: () => ({timeZone: 'UTC'}),
        }));
        Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {999: {timezone: {selected: 'UTC', automatic: true}}}).then(() => {
            const result = DateUtils.getCurrentTimezone();
            expect(result).toEqual({
                selected: 'UTC',
                automatic: true,
            });
        });
    });

    it('canUpdateTimezone should return true when lastUpdatedTimezoneTime is more than 5 minutes ago', () => {
        // Use fake timers to control the current time
        jest.useFakeTimers('modern');
        jest.setSystemTime(addMinutes(new Date(), 6));
        const isUpdateTimezoneAllowed = DateUtils.canUpdateTimezone();
        expect(isUpdateTimezoneAllowed).toBe(true);
    });

    it('canUpdateTimezone should return false when lastUpdatedTimezoneTime is less than 5 minutes ago', () => {
        // Use fake timers to control the current time
        jest.useFakeTimers('modern');
        jest.setSystemTime(addMinutes(new Date(), 4));
        const isUpdateTimezoneAllowed = DateUtils.canUpdateTimezone();
        expect(isUpdateTimezoneAllowed).toBe(false);
    });

    it('should return the date in calendar time when calling datetimeToRelative', () => {
        const aFewSecondsAgo = subSeconds(new Date(), 10);
        expect(DateUtils.datetimeToRelative(LOCALE, aFewSecondsAgo)).toBe('less than a minute ago');

        const aMinuteAgo = subMinutes(new Date(), 1);
        expect(DateUtils.datetimeToRelative(LOCALE, aMinuteAgo)).toBe('1 minute ago');

        const anHourAgo = subHours(new Date(), 1);
        expect(DateUtils.datetimeToRelative(LOCALE, anHourAgo)).toBe('about 1 hour ago');
    });

    it('subtractMillisecondsFromDateTime should subtract milliseconds from a given date and time', () => {
        const initialDateTime = '2023-07-18T10:30:00Z';
        const millisecondsToSubtract = 5000; // 5 seconds
        const expectedDateTime = '2023-07-18 10:29:55.000';
        const result = DateUtils.subtractMillisecondsFromDateTime(initialDateTime, millisecondsToSubtract);
        expect(result).toBe(expectedDateTime);
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
});
