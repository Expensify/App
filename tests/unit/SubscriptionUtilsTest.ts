import {addDays, format as formatDate, subDays} from 'date-fns';
import Onyx from 'react-native-onyx';
import * as SubscriptionUtils from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

Onyx.init({keys: ONYXKEYS});

describe('SubscriptionUtils', () => {
    describe('calculateRemainingFreeTrialDays', () => {
        afterEach(async () => {
            await Onyx.clear();
            await Onyx.multiSet({
                [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: null,
            });
        });

        it('should return 0 if the Onyx key is not set', () => {
            expect(SubscriptionUtils.calculateRemainingFreeTrialDays()).toBe(0);
        });

        it('should return 0 if the current date is after the free trial end date', async () => {
            await Onyx.set(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, formatDate(subDays(new Date(), 8), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING));
            expect(SubscriptionUtils.calculateRemainingFreeTrialDays()).toBe(0);
        });

        it('should return the remaining days if the current date is before the free trial end date', async () => {
            await Onyx.set(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, formatDate(addDays(new Date(), 5), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING));
            expect(SubscriptionUtils.calculateRemainingFreeTrialDays()).toBe(5);
        });
    });

    describe('isUserOnFreeTrial', () => {
        afterEach(async () => {
            await Onyx.clear();
            await Onyx.multiSet({
                [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: null,
                [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: null,
            });
        });

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

    describe('hasUserFreeTrialEnded', () => {
        afterEach(async () => {
            await Onyx.clear();
            await Onyx.multiSet({
                [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: null,
                [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: null,
            });
        });

        it('should return false if the Onyx key is not set', () => {
            expect(SubscriptionUtils.hasUserFreeTrialEnded()).toBeFalsy();
        });

        it('should return false if the current date is before the free trial end date', async () => {
            await Onyx.set(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, formatDate(addDays(new Date(), 1), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING));
            expect(SubscriptionUtils.hasUserFreeTrialEnded()).toBeFalsy();
        });

        it('should return true if the current date is after the free trial end date', async () => {
            await Onyx.set(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, formatDate(subDays(new Date(), 2), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING));
            expect(SubscriptionUtils.hasUserFreeTrialEnded()).toBeTruthy();
        });
    });

    describe('doesUserHavePaymentCardAdded', () => {
        afterEach(async () => {
            await Onyx.clear();
            await Onyx.multiSet({
                [ONYXKEYS.NVP_BILLING_FUND_ID]: null,
            });
        });

        it('should return false if the Onyx key is not set', () => {
            expect(SubscriptionUtils.doesUserHavePaymentCardAdded()).toBeFalsy();
        });

        it('should return true if the Onyx key is set', async () => {
            await Onyx.set(ONYXKEYS.NVP_BILLING_FUND_ID, 8010);
            expect(SubscriptionUtils.doesUserHavePaymentCardAdded()).toBeTruthy();
        });
    });
});
