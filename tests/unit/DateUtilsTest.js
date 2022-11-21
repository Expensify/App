import moment from 'moment';
import Onyx from 'react-native-onyx';
import DateUtils from '../../src/libs/DateUtils';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';

const LOCALE = 'en';

describe('DateUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {email: 'current@user.com'},
                [ONYXKEYS.PERSONAL_DETAILS]: {'current@user.com': {timezone: {selected: 'Etc/UTC'}}},
            },
        });
        return waitForPromisesToResolve();
    });

    const datetime = '2022-11-07 00:00:00';
    it('should return a moment object with the formatted datetime when calling getLocalMomentFromDatetime', () => {
        const localMoment = DateUtils.getLocalMomentFromDatetime(LOCALE, datetime, 'America/Los_Angeles');
        expect(moment.isMoment(localMoment)).toBe(true);
        expect(moment(localMoment).format()).toEqual('2022-11-06T16:00:00-08:00');
    });

    it('should return the date in calendar time when calling datetimeToCalendarTime', () => {
        const today = moment.utc().set({hour: 14, minute: 32});
        expect(DateUtils.datetimeToCalendarTime(LOCALE, today)).toBe('Today at 2:32 PM');

        const yesterday = moment.utc().subtract(1, 'days').set({hour: 7, minute: 43});
        expect(DateUtils.datetimeToCalendarTime(LOCALE, yesterday)).toBe('Yesterday at 7:43 AM');

        const date = moment.utc('2022-11-05').set({hour: 10, minute: 17});
        expect(DateUtils.datetimeToCalendarTime(LOCALE, date)).toBe('Nov 5, 2022 at 10:17 AM');
    });

    it('should return the date in calendar time when calling datetimeToRelative', () => {
        const aFewSecondsAgo = moment().subtract(10, 'seconds');
        expect(DateUtils.datetimeToRelative(LOCALE, aFewSecondsAgo)).toBe('a few seconds ago');

        const aMinuteAgo = moment().subtract(1, 'minute');
        expect(DateUtils.datetimeToRelative(LOCALE, aMinuteAgo)).toBe('a minute ago');

        const anHourAgo = moment().subtract(1, 'hour');
        expect(DateUtils.datetimeToRelative(LOCALE, anHourAgo)).toBe('an hour ago');
    });

    it('should return the date in the format expected by the database when calling currentDBTime', () => {
        const currentDBTime = DateUtils.currentDBTime();
        expect(currentDBTime).toBe(moment(currentDBTime).format('YYYY-MM-DD HH:mm:ss.SSS'));
    });
});
