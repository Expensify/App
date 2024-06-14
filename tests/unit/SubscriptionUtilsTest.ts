import {addDays, format as formatDate, getUnixTime, subDays} from 'date-fns';
import Onyx from 'react-native-onyx';
import * as SubscriptionUtils from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BillingGraceEndPeriod} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';

const billingGraceEndPeriod: BillingGraceEndPeriod = {
    name: 'owner@email.com',
    permissions: 'read',
    value: 0,
};

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

    describe('shouldRestrictUserBillableActions', () => {
        afterEach(async () => {
            await Onyx.clear();
            await Onyx.multiSet({
                [ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END]: null,
                [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: null,
                [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWNED]: null,
                [ONYXKEYS.COLLECTION.POLICY]: null,
            });
        });

        it("should return false if the user isn't a workspace's owner or isn't a member of any past due billing workspace", () => {
            expect(SubscriptionUtils.shouldRestrictUserBillableActions('1')).toBeFalsy();
        });

        it('should return false if the user is a non-owner of a workspace that is not in the shared NVP collection', async () => {
            const policyID = '1001';
            const ownerAccountID = 2001;

            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END}${ownerAccountID}` as const]: {
                    ...billingGraceEndPeriod,
                    value: getUnixTime(subDays(new Date(), 3)), // past due
                },
                [`${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const]: {
                    ...createRandomPolicy(Number(policyID)),
                    ownerAccountID: 2002, // owner not in the shared NVP collection
                },
            });

            expect(SubscriptionUtils.shouldRestrictUserBillableActions(policyID)).toBeFalsy();
        });

        it("should return false if the user is a workspace's non-owner that is not past due billing", async () => {
            const policyID = '1001';
            const ownerAccountID = 2001;

            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END}${ownerAccountID}` as const]: {
                    ...billingGraceEndPeriod,
                    value: getUnixTime(addDays(new Date(), 3)), // not past due
                },
                [`${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const]: {
                    ...createRandomPolicy(Number(policyID)),
                    ownerAccountID, // owner in the shared NVP collection
                },
            });

            expect(SubscriptionUtils.shouldRestrictUserBillableActions(policyID)).toBeFalsy();
        });

        it("should return true if the user is a workspace's non-owner that is past due billing", async () => {
            const policyID = '1001';
            const ownerAccountID = 2001;

            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END}${ownerAccountID}` as const]: {
                    ...billingGraceEndPeriod,
                    value: getUnixTime(subDays(new Date(), 3)), // past due
                },
                [`${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const]: {
                    ...createRandomPolicy(Number(policyID)),
                    ownerAccountID, // owner in the shared NVP collection
                },
            });

            expect(SubscriptionUtils.shouldRestrictUserBillableActions(policyID)).toBeTruthy();
        });

        it('should return false if the user is a workspace owner but is not past due billing', async () => {
            const policyID = '1001';

            await Onyx.multiSet({
                [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: getUnixTime(addDays(new Date(), 3)), // not past due
            });

            expect(SubscriptionUtils.shouldRestrictUserBillableActions(policyID)).toBeFalsy();
        });

        it('should return true if the user is a workspace owner but is past due billing', async () => {
            const policyID = '1001';

            await Onyx.multiSet({
                [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: getUnixTime(subDays(new Date(), 3)), // past due
                [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWNED]: 8010, // owing some amount
            });

            expect(SubscriptionUtils.shouldRestrictUserBillableActions(policyID)).toBeTruthy();
        });
    });
});
