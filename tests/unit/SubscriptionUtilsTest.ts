import {addDays, addMinutes, format as formatDate, getUnixTime, subDays} from 'date-fns';
import Onyx from 'react-native-onyx';
import * as SubscriptionUtils from '@libs/SubscriptionUtils';
import {PAYMENT_STATUS} from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BillingGraceEndPeriod, BillingStatus, FundList, StripeCustomerID} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';

const billingGraceEndPeriod: BillingGraceEndPeriod = {
    value: 0,
};

const GRACE_PERIOD_DATE = new Date().getTime() + 1000 * 3600;
const GRACE_PERIOD_DATE_OVERDUE = new Date().getTime() - 1000;

const AMOUNT_OWED = 100;
const STRIPE_CUSTOMER_ID: StripeCustomerID = {
    paymentMethodID: '1',
    intentsID: '2',
    currency: 'USD',
    status: 'authentication_required',
};
const BILLING_STATUS_INSUFFICIENT_FUNDS: BillingStatus = {
    action: 'action',
    periodMonth: 'periodMonth',
    periodYear: 'periodYear',
    declineReason: 'insufficient_funds',
};
const BILLING_STATUS_EXPIRED_CARD: BillingStatus = {
    ...BILLING_STATUS_INSUFFICIENT_FUNDS,
    declineReason: 'expired_card',
};
const FUND_LIST: FundList = {
    defaultCard: {
        isDefault: true,
        accountData: {
            cardYear: new Date().getFullYear(),
            cardMonth: new Date().getMonth() + 1,
            additionalData: {
                isBillingCard: true,
            },
        },
    },
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

        it('should return 1 if the current date is on the same day of the free trial end date, but some minutes earlier', async () => {
            await Onyx.set(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, formatDate(addMinutes(new Date(), 30), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING));
            expect(SubscriptionUtils.calculateRemainingFreeTrialDays()).toBe(1);
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

        it('should return false if the Onyx keys are not set', () => {
            expect(SubscriptionUtils.isUserOnFreeTrial()).toBeFalsy();
        });

        it('should return false if the current date is before the free trial start date', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: formatDate(addDays(new Date(), 2), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING),
                [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: formatDate(addDays(new Date(), 4), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING),
            });

            expect(SubscriptionUtils.isUserOnFreeTrial()).toBeFalsy();
        });

        it('should return false if the current date is after the free trial end date', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: formatDate(subDays(new Date(), 4), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING),
                [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: formatDate(subDays(new Date(), 2), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING),
            });

            expect(SubscriptionUtils.isUserOnFreeTrial()).toBeFalsy();
        });

        it('should return true if the current date is on the same date of free trial start date', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: formatDate(new Date(), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING),
                [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: formatDate(addDays(new Date(), 3), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING),
            });

            expect(SubscriptionUtils.isUserOnFreeTrial()).toBeTruthy();
        });

        it('should return true if the current date is on the same date of free trial end date, but some minutes earlier', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: formatDate(subDays(new Date(), 2), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING),
                [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: formatDate(addMinutes(new Date(), 30), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING),
            });

            expect(SubscriptionUtils.isUserOnFreeTrial()).toBeTruthy();
        });

        it('should return true if the current date is between the free trial start and end dates', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: formatDate(subDays(new Date(), 1), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING),
                [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: formatDate(addDays(new Date(), 3), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING),
            });

            expect(SubscriptionUtils.isUserOnFreeTrial()).toBeTruthy();
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
                [ONYXKEYS.SESSION]: null,
                [ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END]: null,
                [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: null,
                [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED]: null,
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

        it("should return false if the user is the workspace's owner but is not past due billing", async () => {
            const accountID = 1;
            const policyID = '1001';

            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {email: '', accountID},
                [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: getUnixTime(addDays(new Date(), 3)), // not past due
                [`${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const]: {
                    ...createRandomPolicy(Number(policyID)),
                    ownerAccountID: accountID,
                },
            });

            expect(SubscriptionUtils.shouldRestrictUserBillableActions(policyID)).toBeFalsy();
        });

        it("should return false if the user is the workspace's owner that is past due billing but isn't owning any amount", async () => {
            const accountID = 1;
            const policyID = '1001';

            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {email: '', accountID},
                [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: getUnixTime(subDays(new Date(), 3)), // past due
                [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED]: 0,
                [`${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const]: {
                    ...createRandomPolicy(Number(policyID)),
                    ownerAccountID: accountID,
                },
            });

            expect(SubscriptionUtils.shouldRestrictUserBillableActions(policyID)).toBeFalsy();
        });

        it("should return true if the user is the workspace's owner that is past due billing and is owning some amount", async () => {
            const accountID = 1;
            const policyID = '1001';

            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {email: '', accountID},
                [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: getUnixTime(subDays(new Date(), 3)), // past due
                [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED]: 8010,
                [`${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const]: {
                    ...createRandomPolicy(Number(policyID)),
                    ownerAccountID: accountID,
                },
            });

            expect(SubscriptionUtils.shouldRestrictUserBillableActions(policyID)).toBeTruthy();
        });

        it("should return false if the user is past due billing but is not the workspace's owner", async () => {
            const accountID = 1;
            const policyID = '1001';

            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {email: '', accountID},
                [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: getUnixTime(subDays(new Date(), 3)), // past due
                [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED]: 8010,
                [`${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const]: {
                    ...createRandomPolicy(Number(policyID)),
                    ownerAccountID: 2, // not the user
                },
            });

            expect(SubscriptionUtils.shouldRestrictUserBillableActions(policyID)).toBeFalsy();
        });
    });

    describe('getSubscriptionStatus', () => {
        afterEach(async () => {
            await Onyx.clear();
            await Onyx.multiSet({
                [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: null,
                [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED]: null,
                [ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING]: null,
                [ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID]: null,
                [ONYXKEYS.NVP_PRIVATE_BILLING_STATUS]: null,
                [ONYXKEYS.FUND_LIST]: null,
                [ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL]: null,
                [ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED]: null,
            });
        });

        it('should return undefined by default', () => {
            expect(SubscriptionUtils.getSubscriptionStatus()).toBeUndefined();
        });

        it('should return POLICY_OWNER_WITH_AMOUNT_OWED status', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: GRACE_PERIOD_DATE,
                [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED]: AMOUNT_OWED,
            });

            expect(SubscriptionUtils.getSubscriptionStatus()).toEqual({
                status: PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED,
                isError: true,
            });
        });

        it('should return POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE status', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: GRACE_PERIOD_DATE_OVERDUE,
                [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED]: AMOUNT_OWED,
            });

            expect(SubscriptionUtils.getSubscriptionStatus()).toEqual({
                status: PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE,
            });
        });

        it('should return OWNER_OF_POLICY_UNDER_INVOICING_OVERDUE status', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: GRACE_PERIOD_DATE_OVERDUE,
                [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED]: 0,
            });

            expect(SubscriptionUtils.getSubscriptionStatus()).toEqual({
                status: PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING_OVERDUE,
            });
        });

        it('should return OWNER_OF_POLICY_UNDER_INVOICING status', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: GRACE_PERIOD_DATE,
            });

            expect(SubscriptionUtils.getSubscriptionStatus()).toEqual({
                status: PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING,
            });
        });

        it('should return BILLING_DISPUTE_PENDING status', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: 0,
                [ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING]: 1,
            });

            expect(SubscriptionUtils.getSubscriptionStatus()).toEqual({
                status: PAYMENT_STATUS.BILLING_DISPUTE_PENDING,
            });
        });

        it('should return CARD_AUTHENTICATION_REQUIRED status', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED]: 0,
                [ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING]: 0,
                [ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID]: STRIPE_CUSTOMER_ID,
            });

            expect(SubscriptionUtils.getSubscriptionStatus()).toEqual({
                status: PAYMENT_STATUS.CARD_AUTHENTICATION_REQUIRED,
            });
        });

        it('should return INSUFFICIENT_FUNDS status', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED]: AMOUNT_OWED,
                [ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID]: {},
                [ONYXKEYS.NVP_PRIVATE_BILLING_STATUS]: BILLING_STATUS_INSUFFICIENT_FUNDS,
            });

            expect(SubscriptionUtils.getSubscriptionStatus()).toEqual({
                status: PAYMENT_STATUS.INSUFFICIENT_FUNDS,
            });
        });

        it('should return CARD_EXPIRED status', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_PRIVATE_BILLING_STATUS]: BILLING_STATUS_EXPIRED_CARD,
            });

            expect(SubscriptionUtils.getSubscriptionStatus()).toEqual({
                status: PAYMENT_STATUS.CARD_EXPIRED,
            });
        });

        it('should return CARD_EXPIRE_SOON status', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED]: 0,
                [ONYXKEYS.NVP_PRIVATE_BILLING_STATUS]: {},
                [ONYXKEYS.FUND_LIST]: FUND_LIST,
            });

            expect(SubscriptionUtils.getSubscriptionStatus()).toEqual({
                status: PAYMENT_STATUS.CARD_EXPIRE_SOON,
            });
        });

        it('should return RETRY_BILLING_SUCCESS status', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.FUND_LIST]: {},
                [ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL]: true,
            });

            expect(SubscriptionUtils.getSubscriptionStatus()).toEqual({
                status: PAYMENT_STATUS.RETRY_BILLING_SUCCESS,
                isError: false,
            });
        });

        it('should return RETRY_BILLING_ERROR status', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.FUND_LIST]: {},
                [ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL]: false,
                [ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED]: true,
            });

            expect(SubscriptionUtils.getSubscriptionStatus()).toEqual({
                status: PAYMENT_STATUS.RETRY_BILLING_ERROR,
                isError: true,
            });
        });
    });
});
