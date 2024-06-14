import {addDays, format as formatDate, subDays} from 'date-fns';
import Onyx from 'react-native-onyx';
import * as SubscriptionUtils from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

Onyx.init({keys: ONYXKEYS});

describe('SubscriptionUtils', () => {
    describe('calculateRemainingFreeTrialDays', () => {
        afterEach(() => Onyx.clear());

        it('should return 0 if the Onyx key is not set', () => {
            expect(SubscriptionUtils.calculateRemainingFreeTrialDays()).toBe(0);
        });

        it('should return 0 if the current date is after the free trial end date', async () => {
            const date = formatDate(subDays(new Date(), 8), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING);

            await Onyx.set(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, date);

            expect(SubscriptionUtils.calculateRemainingFreeTrialDays()).toBe(0);
        });

        it('should return the remaining days if the current date is before the free trial end date', async () => {
            const date = formatDate(addDays(new Date(), 5), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING);

            await Onyx.set(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, date);

            expect(SubscriptionUtils.calculateRemainingFreeTrialDays()).toBe(5);
        });
    });

    describe('isUserOnFreeTrial', () => {
        afterEach(() => Onyx.clear());

        it('should return true if the Onyx keys are not set', () => {
            expect(SubscriptionUtils.isUserOnFreeTrial()).toBeTruthy();
        });

        it('should return true if the current date is between the free trial start and end dates', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: formatDate(subDays(new Date(), 1), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING),
                [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: formatDate(addDays(new Date(), 3), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING),
            });

            expect(SubscriptionUtils.isUserOnFreeTrial()).toBeTruthy();
        });

        it('should return false if the current date is after the free trial end date', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: formatDate(subDays(new Date(), 10), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING),
                [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: formatDate(subDays(new Date(), 3), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING),
            });

            expect(SubscriptionUtils.isUserOnFreeTrial()).toBeFalsy();
        });
    });
});
