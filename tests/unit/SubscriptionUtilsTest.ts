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
});
