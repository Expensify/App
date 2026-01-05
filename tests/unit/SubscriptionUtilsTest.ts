import {act} from '@testing-library/react-native';
import {addDays, addMinutes, format as formatDate, getUnixTime, subDays} from 'date-fns';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {
    calculateRemainingFreeTrialDays,
    doesUserHavePaymentCardAdded,
    getEarlyDiscountInfo,
    getSubscriptionStatus,
    hasUserFreeTrialEnded,
    isUserOnFreeTrial,
    PAYMENT_STATUS,
    shouldCalculateBillNewDot,
    shouldRestrictUserBillableActions,
    shouldShowDiscountBanner,
    shouldShowPreTrialBillingBanner,
} from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BillingGraceEndPeriod, BillingStatus, FundList, IntroSelected, StripeCustomerID} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import {STRIPE_CUSTOMER_ID} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const billingGraceEndPeriod: BillingGraceEndPeriod = {
    value: 0,
};

const GRACE_PERIOD_DATE = new Date().getTime() + 1000 * 3600;
const GRACE_PERIOD_DATE_OVERDUE = new Date().getTime() - 1000;

const AMOUNT_OWED = 100;
const stripeCustomerId = STRIPE_CUSTOMER_ID;

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
            expect(calculateRemainingFreeTrialDays(undefined)).toBe(0);
        });

        it('should return 0 if the current date is after the free trial end date', async () => {
            await Onyx.set(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, formatDate(subDays(new Date(), 8), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING));
            expect(calculateRemainingFreeTrialDays(undefined)).toBe(0);
        });

        it('should return 1 if the current date is on the same day of the free trial end date, but some minutes earlier', async () => {
            const lastDayFreeTrial = formatDate(addMinutes(new Date(), 30), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING);
            await Onyx.set(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, lastDayFreeTrial);
            expect(calculateRemainingFreeTrialDays(lastDayFreeTrial)).toBe(1);
        });

        it('should return the remaining days if the current date is before the free trial end date', async () => {
            const lastDayFreeTrial = formatDate(addDays(new Date(), 5), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING);
            await Onyx.set(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, lastDayFreeTrial);
            expect(calculateRemainingFreeTrialDays(lastDayFreeTrial)).toBe(5);
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
            expect(isUserOnFreeTrial(undefined, undefined)).toBeFalsy();
        });

        it('should return false if the current date is before the free trial start date', async () => {
            const firstDayFreeTrial = formatDate(addDays(new Date(), 2), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING);
            await Onyx.multiSet({
                [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: firstDayFreeTrial,
                [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: formatDate(addDays(new Date(), 4), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING),
            });

            expect(isUserOnFreeTrial(firstDayFreeTrial, undefined)).toBeFalsy();
        });

        it('should return false if the current date is after the free trial end date', async () => {
            const firstDayFreeTrial = formatDate(subDays(new Date(), 4), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING);
            await Onyx.multiSet({
                [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: firstDayFreeTrial,
                [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: formatDate(subDays(new Date(), 2), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING),
            });

            expect(isUserOnFreeTrial(firstDayFreeTrial, undefined)).toBeFalsy();
        });

        it('should return true if the current date is on the same date of free trial start date', async () => {
            const firstDayFreeTrial = formatDate(new Date(), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING);
            const lastDayFreeTrial = formatDate(addDays(new Date(), 3), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING);
            await Onyx.multiSet({
                [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: firstDayFreeTrial,
                [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: lastDayFreeTrial,
            });

            expect(isUserOnFreeTrial(firstDayFreeTrial, lastDayFreeTrial)).toBeTruthy();
        });

        it('should return true if the current date is on the same date of free trial end date, but some minutes earlier', async () => {
            const firstDayFreeTrial = formatDate(subDays(new Date(), 2), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING);
            const lastDayFreeTrial = formatDate(addMinutes(new Date(), 30), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING);
            await Onyx.multiSet({
                [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: firstDayFreeTrial,
                [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: lastDayFreeTrial,
            });

            expect(isUserOnFreeTrial(firstDayFreeTrial, lastDayFreeTrial)).toBeTruthy();
        });

        it('should return true if the current date is between the free trial start and end dates', async () => {
            const firstDayFreeTrial = formatDate(subDays(new Date(), 1), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING);
            const lastDayFreeTrial = formatDate(addDays(new Date(), 3), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING);
            await Onyx.multiSet({
                [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: firstDayFreeTrial,
                [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: lastDayFreeTrial,
            });

            expect(isUserOnFreeTrial(firstDayFreeTrial, lastDayFreeTrial)).toBeTruthy();
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
            expect(hasUserFreeTrialEnded(undefined)).toBeFalsy();
        });

        it('should return false if the current date is before the free trial end date', async () => {
            await Onyx.set(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, formatDate(addDays(new Date(), 1), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING));
            expect(hasUserFreeTrialEnded(undefined)).toBeFalsy();
        });

        it('should return true if the current date is after the free trial end date', async () => {
            const lastDayFreeTrial = formatDate(subDays(new Date(), 2), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING);
            await Onyx.set(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, lastDayFreeTrial);
            expect(hasUserFreeTrialEnded(lastDayFreeTrial)).toBeTruthy();
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
            expect(doesUserHavePaymentCardAdded(undefined)).toBeFalsy();
        });

        it('should return true if the Onyx key is set', async () => {
            await Onyx.set(ONYXKEYS.NVP_BILLING_FUND_ID, 8010);
            expect(doesUserHavePaymentCardAdded(8010)).toBeTruthy();
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
            expect(shouldRestrictUserBillableActions('1')).toBeFalsy();
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

            expect(shouldRestrictUserBillableActions(policyID)).toBeFalsy();
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

            expect(shouldRestrictUserBillableActions(policyID)).toBeFalsy();
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

            expect(shouldRestrictUserBillableActions(policyID)).toBeTruthy();
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

            expect(shouldRestrictUserBillableActions(policyID)).toBeFalsy();
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

            expect(shouldRestrictUserBillableActions(policyID)).toBeFalsy();
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

            expect(shouldRestrictUserBillableActions(policyID)).toBeTruthy();
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

            expect(shouldRestrictUserBillableActions(policyID)).toBeFalsy();
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
            const stripeCustomerIdForDefault: Partial<OnyxEntry<StripeCustomerID>> = {};
            // @ts-expect-error - This is a test case
            expect(getSubscriptionStatus(stripeCustomerIdForDefault, false, undefined, undefined, undefined, undefined)).toBeUndefined();
        });

        it('should return POLICY_OWNER_WITH_AMOUNT_OWED status', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: GRACE_PERIOD_DATE,
                [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED]: AMOUNT_OWED,
            });

            expect(getSubscriptionStatus(stripeCustomerId, false, undefined, undefined, undefined, undefined)).toEqual({
                status: PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED,
                isError: true,
            });
        });

        it('should return POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE status', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: GRACE_PERIOD_DATE_OVERDUE,
                [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED]: AMOUNT_OWED,
            });

            expect(getSubscriptionStatus(stripeCustomerId, false, undefined, undefined, undefined, undefined)).toEqual({
                status: PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE,
                isError: true,
            });
        });

        it('should return OWNER_OF_POLICY_UNDER_INVOICING_OVERDUE status', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: GRACE_PERIOD_DATE_OVERDUE,
                [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED]: 0,
            });

            expect(getSubscriptionStatus(stripeCustomerId, false, undefined, undefined, undefined, undefined)).toEqual({
                status: PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING_OVERDUE,
                isError: true,
            });
        });

        it('should return OWNER_OF_POLICY_UNDER_INVOICING status', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: GRACE_PERIOD_DATE,
            });

            expect(getSubscriptionStatus(stripeCustomerId, false, undefined, undefined, undefined, undefined)).toEqual({
                status: PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING,
                isError: true,
            });
        });

        it('should return BILLING_DISPUTE_PENDING status', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: 0,
                [ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING]: 1,
            });

            expect(getSubscriptionStatus(stripeCustomerId, false, 1, undefined, undefined, undefined)).toEqual({
                status: PAYMENT_STATUS.BILLING_DISPUTE_PENDING,
                isError: true,
            });
        });

        it('should return CARD_AUTHENTICATION_REQUIRED status', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED]: 0,
                [ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING]: 0,
                [ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID]: STRIPE_CUSTOMER_ID,
            });

            expect(getSubscriptionStatus(stripeCustomerId, false, 0, undefined, undefined, undefined)).toEqual({
                status: PAYMENT_STATUS.CARD_AUTHENTICATION_REQUIRED,
                isError: true,
            });
        });

        it('should return INSUFFICIENT_FUNDS status', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED]: AMOUNT_OWED,
                [ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID]: {},
                [ONYXKEYS.NVP_PRIVATE_BILLING_STATUS]: BILLING_STATUS_INSUFFICIENT_FUNDS,
            });

            expect(getSubscriptionStatus(stripeCustomerId, false, undefined, undefined, undefined, BILLING_STATUS_INSUFFICIENT_FUNDS)).toEqual({
                status: PAYMENT_STATUS.INSUFFICIENT_FUNDS,
                isError: true,
            });
        });

        it('should return CARD_EXPIRED status', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_PRIVATE_BILLING_STATUS]: BILLING_STATUS_EXPIRED_CARD,
            });

            const stripeCustomerIdForCardExpired: Partial<OnyxEntry<StripeCustomerID>> = {
                paymentMethodID: '1',
                intentsID: '2',
                currency: 'USD',
            };

            // @ts-expect-error - This is a test case
            expect(getSubscriptionStatus(stripeCustomerIdForCardExpired, false, undefined, undefined, undefined, BILLING_STATUS_EXPIRED_CARD)).toEqual({
                status: PAYMENT_STATUS.CARD_EXPIRED,
                isError: true,
            });
        });

        it('should return CARD_EXPIRE_SOON status', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED]: 0,
                [ONYXKEYS.NVP_PRIVATE_BILLING_STATUS]: {},
                [ONYXKEYS.FUND_LIST]: FUND_LIST,
            });

            const stripeCustomerIdForCardExpireSoon: Partial<OnyxEntry<StripeCustomerID>> = {
                paymentMethodID: '1',
                intentsID: '2',
                currency: 'USD',
            };

            // @ts-expect-error - This is a test case
            expect(getSubscriptionStatus(stripeCustomerIdForCardExpireSoon, false, undefined, undefined, FUND_LIST, {})).toEqual({
                status: PAYMENT_STATUS.CARD_EXPIRE_SOON,
            });
        });

        it('should return RETRY_BILLING_SUCCESS status', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.FUND_LIST]: {},
                [ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL]: true,
            });

            const stripeCustomerIdForRetryBillingSuccess: Partial<OnyxEntry<StripeCustomerID>> = {
                paymentMethodID: '1',
                intentsID: '2',
                currency: 'USD',
            };
            // @ts-expect-error - This is a test case
            expect(getSubscriptionStatus(stripeCustomerIdForRetryBillingSuccess, true, undefined, undefined, {}, undefined)).toEqual({
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

            const stripeCustomerIdForRetryBillingError: Partial<OnyxEntry<StripeCustomerID>> = {
                paymentMethodID: '1',
                intentsID: '2',
                currency: 'USD',
            };
            // @ts-expect-error - This is a test case
            expect(getSubscriptionStatus(stripeCustomerIdForRetryBillingError, false, undefined, true, {}, undefined)).toEqual({
                status: PAYMENT_STATUS.RETRY_BILLING_ERROR,
                isError: true,
            });
        });
    });

    describe('shouldShowDiscountBanner', () => {
        const ownerAccountID = 234;
        const policyID = '100012';
        afterEach(async () => {
            await Onyx.clear();
        });

        it('should return false if the user is not on a free trial', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {accountID: ownerAccountID},
                [`${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const]: {
                    ...createRandomPolicy(Number(policyID)),
                    ownerAccountID,
                    type: CONST.POLICY.TYPE.CORPORATE,
                },
                [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: null,
                [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: null,
            });
            expect(shouldShowDiscountBanner(true, 'corporate', undefined, undefined, undefined)).toBeFalsy();
        });

        it(`should return false if user has already added a payment method`, async () => {
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {accountID: ownerAccountID},
                [`${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const]: {
                    ...createRandomPolicy(Number(policyID)),
                    ownerAccountID,
                    type: CONST.POLICY.TYPE.TEAM,
                },
                [ONYXKEYS.NVP_BILLING_FUND_ID]: 8010,
            });
            expect(shouldShowDiscountBanner(true, 'corporate', undefined, undefined, 8010)).toBeFalsy();
        });

        it('should return false if the user is on Team plan', async () => {
            const firstDayFreeTrial = formatDate(subDays(new Date(), 1), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING);
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {accountID: ownerAccountID},
                [`${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const]: {
                    ...createRandomPolicy(Number(policyID)),
                    ownerAccountID,
                    type: CONST.POLICY.TYPE.CORPORATE,
                },
                [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: firstDayFreeTrial,
                [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: formatDate(addDays(new Date(), 10), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING),
            });
            expect(shouldShowDiscountBanner(true, 'team', firstDayFreeTrial, undefined, undefined)).toBeFalsy();
        });

        it('should return true if the date is before the free trial end date or within the 8 days from the trial start date', async () => {
            const firstDayFreeTrial = formatDate(subDays(new Date(), 1), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING);
            const lastDayFreeTrial = formatDate(addDays(new Date(), 10), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING);
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {accountID: ownerAccountID},
                [`${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const]: {
                    ...createRandomPolicy(Number(policyID)),
                    ownerAccountID,
                    type: CONST.POLICY.TYPE.CORPORATE,
                },
                [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: firstDayFreeTrial,
                [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: lastDayFreeTrial,
            });
            expect(shouldShowDiscountBanner(true, 'corporate', firstDayFreeTrial, lastDayFreeTrial, undefined)).toBeTruthy();
        });

        it("should return false if user's trial is during the discount period but has no workspaces", async () => {
            const firstDayFreeTrial = formatDate(subDays(new Date(), 1), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING);
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {accountID: ownerAccountID},
                [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: firstDayFreeTrial,
                [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: formatDate(addDays(new Date(), 10), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING),
            });
            expect(shouldShowDiscountBanner(true, 'corporate', firstDayFreeTrial, undefined, undefined)).toBeFalsy();
        });
    });

    describe('getEarlyDiscountInfo', () => {
        const TEST_DATE = new Date();

        beforeEach(() => {
            jest.spyOn(Date, 'now').mockImplementation(() => TEST_DATE.getTime());
        });

        afterEach(async () => {
            jest.spyOn(Date, 'now').mockRestore();
            await Onyx.clear();
        });
        it('should return the discount info if the user is on a free trial and trial was started less than 24 hours before', async () => {
            const firstDayFreeTrial = formatDate(addMinutes(subDays(new Date(TEST_DATE), 1), 12), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING);
            await Onyx.multiSet({
                [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: firstDayFreeTrial,
                [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: formatDate(addDays(new Date(TEST_DATE), 10), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING),
            });

            expect(getEarlyDiscountInfo(firstDayFreeTrial)).toEqual({
                discountType: 50,
                days: 0,
                hours: 0,
                minutes: 12,
                seconds: 0,
            });
        });

        it('should return the discount info if the user is on a free trial and trial was started more than 24 hours before', async () => {
            const firstDayFreeTrial = formatDate(subDays(new Date(TEST_DATE), 2), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING);
            await Onyx.multiSet({
                [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: firstDayFreeTrial,
                [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: formatDate(addDays(new Date(TEST_DATE), 10), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING),
            });

            expect(getEarlyDiscountInfo(firstDayFreeTrial)).toEqual({
                discountType: 25,
                days: 6,
                hours: 0,
                minutes: 0,
                seconds: 0,
            });
        });

        it('should return null if the user is not on a free trial', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: null,
                [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: null,
            });

            expect(getEarlyDiscountInfo(undefined)).toBeNull();
        });
    });
    describe('shouldShowPreTrialBillingBanner', () => {
        it('should return true if the user is NOT on a free trial and trial has not ended', async () => {
            const firstDayFreeTrial = formatDate(addDays(new Date(), 5), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING);
            // Free trial starts in the future → user is not currently on trial
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: firstDayFreeTrial,
                    [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: formatDate(addDays(new Date(), 10), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING),
                });
            });

            await waitForBatchedUpdatesWithAct();

            const introSelected: OnyxEntry<IntroSelected> = {
                choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
            };

            expect(shouldShowPreTrialBillingBanner(introSelected, firstDayFreeTrial, undefined)).toBeTruthy();
        });

        it('should return false if the free trial has ended', async () => {
            const firstDayFreeTrial = formatDate(subDays(new Date(), 20), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING);
            const lastDayFreeTrial = formatDate(subDays(new Date(), 5), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING);
            await Onyx.multiSet({
                [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: firstDayFreeTrial,
                [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: lastDayFreeTrial,
            });

            const introSelected: OnyxEntry<IntroSelected> = {
                choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
            };

            expect(shouldShowPreTrialBillingBanner(introSelected, firstDayFreeTrial, lastDayFreeTrial)).toBeFalsy();
        });
    });
    describe('shouldCalculateBillNewDot', () => {
        const testUserAccountID = 1; // A consistent account ID for tests
        const paidPolicyID = '12345';
        const freePolicyID = '67890';
        const secondPaidPolicyID = '98765';

        beforeEach(async () => {
            // Clear Onyx and set up session for each test
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.SESSION, {email: 'test@example.com', accountID: testUserAccountID});
            // Ensure allPolicies is initialized as empty or cleared before each test
            await Onyx.multiSet({
                [ONYXKEYS.COLLECTION.POLICY]: null,
            });
            // Reset the mock for getOwnedPaidPolicies before each test
            jest.clearAllMocks();
        });

        it('should return false if canDowngrade is false (default or explicitly passed)', async () => {
            // Set up a policy that would normally count as owned and paid
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.POLICY}${paidPolicyID}` as const]: {
                    ...createRandomPolicy(Number(paidPolicyID)),
                    ownerAccountID: testUserAccountID,
                    type: CONST.POLICY.TYPE.CORPORATE,
                },
            });
            // Test with canDowngrade as false (explicitly)
            expect(shouldCalculateBillNewDot(false)).toBeFalsy();
            // Test with canDowngrade as undefined (defaults to false in the function signature)
            expect(shouldCalculateBillNewDot(undefined)).toBeFalsy();
            // Test without passing canDowngrade (defaults to false)
            expect(shouldCalculateBillNewDot()).toBeFalsy();
        });

        it('should return false if the user owns zero paid policies', async () => {
            // Only free policies or no policies at all
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.POLICY}${freePolicyID}` as const]: {
                    ...createRandomPolicy(Number(freePolicyID)),
                    ownerAccountID: testUserAccountID,
                    type: CONST.POLICY.TYPE.PERSONAL,
                },
            });
            expect(shouldCalculateBillNewDot(true)).toBeFalsy();
        });

        it('should return false if the user owns more than one paid policy', async () => {
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.POLICY}${paidPolicyID}` as const]: {
                    ...createRandomPolicy(Number(paidPolicyID)),
                    ownerAccountID: testUserAccountID,
                    type: CONST.POLICY.TYPE.CORPORATE,
                },
                [`${ONYXKEYS.COLLECTION.POLICY}${secondPaidPolicyID}` as const]: {
                    ...createRandomPolicy(Number(secondPaidPolicyID)),
                    ownerAccountID: testUserAccountID,
                    type: CONST.POLICY.TYPE.TEAM,
                },
            });
            expect(shouldCalculateBillNewDot(true)).toBeFalsy();
        });

        it('should return true if canDowngrade is true and the user owns exactly one paid policy', async () => {
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.POLICY}${paidPolicyID}` as const]: {
                    ...createRandomPolicy(Number(paidPolicyID)),
                    ownerAccountID: testUserAccountID,
                    type: CONST.POLICY.TYPE.CORPORATE,
                },
                [`${ONYXKEYS.COLLECTION.POLICY}${freePolicyID}` as const]: {
                    // Include a free policy to confirm it's correctly ignored
                    ...createRandomPolicy(Number(freePolicyID)),
                    ownerAccountID: testUserAccountID,
                    type: CONST.POLICY.TYPE.PERSONAL,
                },
            });
            expect(shouldCalculateBillNewDot(true)).toBeTruthy();
        });

        it('should return false if the user owns exactly one paid policy but is not the owner', async () => {
            // Set up a paid policy owned by another user
            const thirdUserAccountID = 2;
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.POLICY}${paidPolicyID}` as const]: {
                    ...createRandomPolicy(Number(paidPolicyID)),
                    ownerAccountID: thirdUserAccountID, // Owned by someone else
                    type: CONST.POLICY.TYPE.CORPORATE,
                },
            });
            expect(shouldCalculateBillNewDot(true)).toBeFalsy();
        });

        it('should return true if canDowngrade is true and the single paid policy is a team policy', async () => {
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.POLICY}${paidPolicyID}` as const]: {
                    ...createRandomPolicy(Number(paidPolicyID)),
                    ownerAccountID: testUserAccountID,
                    type: CONST.POLICY.TYPE.TEAM,
                },
            });
            expect(shouldCalculateBillNewDot(true)).toBeTruthy();
        });

        it('should return true if canDowngrade is true and the single paid policy is a corporate policy', async () => {
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.POLICY}${paidPolicyID}` as const]: {
                    ...createRandomPolicy(Number(paidPolicyID)),
                    ownerAccountID: testUserAccountID,
                    type: CONST.POLICY.TYPE.CORPORATE,
                },
            });
            expect(shouldCalculateBillNewDot(true)).toBeTruthy();
        });
    });
});
