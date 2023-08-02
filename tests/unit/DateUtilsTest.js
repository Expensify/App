import moment from 'moment';
import Onyx from 'react-native-onyx';
import CONST from '../../src/CONST';
import DateUtils from '../../src/libs/DateUtils';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';

const LOCALE = CONST.LOCALES.EN;

describe('DateUtils', () => {
    let originalNow;
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: 999},
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {999: {timezone: {selected: 'Etc/UTC'}}},
            },
        });
        return waitForPromisesToResolve();
    });

    beforeEach(() => {
        originalNow = moment.now;
    });

    afterEach(() => {
        Onyx.clear();
        moment.now = originalNow;
    });

    const datetime = '2022-11-07 00:00:00';
    it('should return a moment object with the formatted datetime when calling getLocalMomentFromDatetime', () => {
        const localMoment = DateUtils.getLocalMomentFromDatetime(LOCALE, datetime, 'America/Los_Angeles');
        expect(moment.isMoment(localMoment)).toBe(true);
        expect(moment(localMoment).format()).toEqual('2022-11-06T16:00:00-08:00');
    });

    it('should return a moment object when calling getLocalMomentFromDatetime with null instead of a datetime', () => {
        const localMoment = DateUtils.getLocalMomentFromDatetime(LOCALE, null, 'America/Los_Angeles');
        expect(moment.isMoment(localMoment)).toBe(true);
    });

    it('should return the date in calendar time when calling datetimeToCalendarTime', () => {
        const today = moment.utc().set({hour: 14, minute: 32});
        expect(DateUtils.datetimeToCalendarTime(LOCALE, today)).toBe('Today at 2:32 PM');

        const yesterday = moment.utc().subtract(1, 'days').set({hour: 7, minute: 43});
        expect(DateUtils.datetimeToCalendarTime(LOCALE, yesterday)).toBe('Yesterday at 7:43 AM');

        const date = moment.utc('2022-11-05').set({hour: 10, minute: 17});
        expect(DateUtils.datetimeToCalendarTime(LOCALE, date)).toBe('Nov 5, 2022 at 10:17 AM');

        const todayLowercaseDate = moment.utc().set({hour: 14, minute: 32});
        expect(DateUtils.datetimeToCalendarTime(LOCALE, todayLowercaseDate, false, undefined, true)).toBe('today at 2:32 PM');
    });

    it('should update timezone if automatic and selected timezone do not match', () => {
        Intl.DateTimeFormat = jest.fn(() => ({
            resolvedOptions: () => ({timeZone: 'America/Chicago'}),
        }));
        Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {999: {timezone: {selected: 'Etc/UTC', automatic: true}}}).then(() => {
            const result = DateUtils.getCurrentTimezone();
            expect(result).toEqual({
                selected: 'America/Chicago',
                automatic: true,
            });
        });
    });

    it('should not update timezone if automatic and selected timezone match', () => {
        Intl.DateTimeFormat = jest.fn(() => ({
            resolvedOptions: () => ({timeZone: 'Etc/UTC'}),
        }));
        Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {999: {timezone: {selected: 'Etc/UTC', automatic: true}}}).then(() => {
            const result = DateUtils.getCurrentTimezone();
            expect(result).toEqual({
                selected: 'Etc/UTC',
                automatic: true,
            });
        });
    });

    it('canUpdateTimezone should return true when lastUpdatedTimezoneTime is more than 5 minutes ago', () => {
        const currentTime = moment().add(6, 'minutes');
        moment.now = jest.fn(() => currentTime);
        const isUpdateTimezoneAllowed = DateUtils.canUpdateTimezone();
        expect(isUpdateTimezoneAllowed).toBe(true);
    });

    it('canUpdateTimezone should return false when lastUpdatedTimezoneTime is less than 5 minutes ago', () => {
        const currentTime = moment().add(4, 'minutes');
        moment.now = jest.fn(() => currentTime);
        const isUpdateTimezoneAllowed = DateUtils.canUpdateTimezone();
        expect(isUpdateTimezoneAllowed).toBe(false);
    });

    it('should return the date in calendar time when calling datetimeToRelative', () => {
        const aFewSecondsAgo = moment().subtract(10, 'seconds');
        expect(DateUtils.datetimeToRelative(LOCALE, aFewSecondsAgo)).toBe('a few seconds ago');

        const aMinuteAgo = moment().subtract(1, 'minute');
        expect(DateUtils.datetimeToRelative(LOCALE, aMinuteAgo)).toBe('a minute ago');

        const anHourAgo = moment().subtract(1, 'hour');
        expect(DateUtils.datetimeToRelative(LOCALE, anHourAgo)).toBe('an hour ago');
    });

    it('subtractMillisecondsFromDateTime should subtract milliseconds from a given date and time', () => {
        const initialDateTime = '2023-07-18T10:30:00Z';
        const millisecondsToSubtract = 5000; // 5 seconds
        const expectedDateTime = '2023-07-18 10:29:55.000';
        const result = DateUtils.subtractMillisecondsFromDateTime(initialDateTime, millisecondsToSubtract);
        expect(result.valueOf()).toBe(expectedDateTime);
    });

    describe('getDBTime', () => {
        it('should return the date in the format expected by the database', () => {
            const getDBTime = DateUtils.getDBTime();
            expect(getDBTime).toBe(moment(getDBTime).format('YYYY-MM-DD HH:mm:ss.SSS'));
        });

        it('should represent the correct moment in utc when used with a standard datetime string', () => {
            const timestamp = 'Mon Nov 21 2022 19:04:14 GMT-0800 (Pacific Standard Time)';
            const getDBTime = DateUtils.getDBTime(timestamp);
            expect(getDBTime).toBe('2022-11-22 03:04:14.000');
        });

        it('should represent the correct moment in time when used with an ISO string', () => {
            const timestamp = '2022-11-22T03:08:04.326Z';
            const getDBTime = DateUtils.getDBTime(timestamp);
            expect(getDBTime).toBe('2022-11-22 03:08:04.326');
        });

        it('should represent the correct moment in time when used with a unix timestamp', () => {
            const timestamp = 1669086850792;
            const getDBTime = DateUtils.getDBTime(timestamp);
            expect(getDBTime).toBe('2022-11-22 03:14:10.792');
        });
    });
});
