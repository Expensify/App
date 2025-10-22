import {differenceInDays, differenceInSeconds, fromUnixTime, isAfter, isBefore} from 'date-fns';
import {fromZonedTime} from 'date-fns-tz';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {SvgProps} from 'react-native-svg';
import type {ValueOf} from 'type-fest';
import * as Illustrations from '@components/Icon/Illustrations';
import type {PreferredCurrency} from '@hooks/usePreferredCurrency';
import type {PersonalPolicyTypeExcludedProps} from '@pages/settings/Subscription/SubscriptionPlan/SubscriptionPlanCard';
import type {SubscriptionType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BillingGraceEndPeriod, BillingStatus, Fund, FundList, IntroSelected, Policy, StripeCustomerID} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {convertToShortDisplayString} from './CurrencyUtils';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {translateLocal} from './Localize';
import {getOwnedPaidPolicies, isPolicyOwner} from './PolicyUtils';

const PAYMENT_STATUS = {
    POLICY_OWNER_WITH_AMOUNT_OWED: 'policy_owner_with_amount_owed',
    POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE: 'policy_owner_with_amount_owed_overdue',
    OWNER_OF_POLICY_UNDER_INVOICING: 'owner_of_policy_under_invoicing',
    OWNER_OF_POLICY_UNDER_INVOICING_OVERDUE: 'owner_of_policy_under_invoicing_overdue',
    BILLING_DISPUTE_PENDING: 'billing_dispute_pending',
    CARD_AUTHENTICATION_REQUIRED: 'authentication_required',
    INSUFFICIENT_FUNDS: 'insufficient_funds',
    CARD_EXPIRED: 'expired_card',
    CARD_EXPIRE_SOON: 'card_expire_soon',
    RETRY_BILLING_SUCCESS: 'retry_billing_success',
    RETRY_BILLING_ERROR: 'retry_billing_error',
    GENERIC_API_ERROR: 'generic_api_error',
} as const;

type DiscountInfo = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    discountType: number;
};

type SubscriptionPlanInfo = {
    title: string;
    subtitle: string;
    note: string | undefined;
    benefits: string[];
    src: React.FC<SvgProps>;
    description: string;
};

let currentUserAccountID = -1;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        currentUserAccountID = value?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    },
});

let amountOwed: OnyxEntry<number>;
Onyx.connect({
    key: ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED,
    callback: (value) => (amountOwed = value),
});

let billingDisputePending: OnyxEntry<number>;
Onyx.connect({
    key: ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING,
    callback: (value) => (billingDisputePending = value),
});

let billingStatus: OnyxEntry<BillingStatus>;
Onyx.connect({
    key: ONYXKEYS.NVP_PRIVATE_BILLING_STATUS,
    callback: (value) => (billingStatus = value),
});

let firstPolicyDate: OnyxEntry<string>;
Onyx.connect({
    key: ONYXKEYS.NVP_PRIVATE_FIRST_POLICY_CREATED_DATE,
    callback: (value) => {
        firstPolicyDate = value;
    },
});

let hasManualTeam2025Pricing: OnyxEntry<string>;
Onyx.connect({
    key: ONYXKEYS.NVP_PRIVATE_MANUAL_TEAM_2025_PRICING,
    callback: (value) => {
        hasManualTeam2025Pricing = value;
    },
});

let ownerBillingGraceEndPeriod: OnyxEntry<number>;
Onyx.connect({
    key: ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END,
    callback: (value) => (ownerBillingGraceEndPeriod = value),
});

let fundList: OnyxEntry<FundList>;
Onyx.connect({
    key: ONYXKEYS.FUND_LIST,
    callback: (value) => {
        if (!value) {
            return;
        }

        fundList = value;
    },
});

let retryBillingSuccessful: OnyxEntry<boolean>;
Onyx.connect({
    key: ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL,
    initWithStoredValues: false,
    callback: (value) => {
        if (value === undefined) {
            return;
        }

        retryBillingSuccessful = value;
    },
});

let retryBillingFailed: OnyxEntry<boolean>;
Onyx.connect({
    key: ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED,
    callback: (value) => {
        if (value === undefined) {
            return;
        }

        retryBillingFailed = value;
    },
    initWithStoredValues: false,
});

let firstDayFreeTrial: OnyxEntry<string>;
Onyx.connect({
    key: ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL,
    callback: (value) => (firstDayFreeTrial = value),
});

let lastDayFreeTrial: OnyxEntry<string>;
Onyx.connect({
    key: ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL,
    callback: (value) => (lastDayFreeTrial = value),
});

let userBillingFundID: OnyxEntry<number>;
Onyx.connect({
    key: ONYXKEYS.NVP_BILLING_FUND_ID,
    callback: (value) => (userBillingFundID = value),
});

let userBillingGraceEndPeriodCollection: OnyxCollection<BillingGraceEndPeriod>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END,
    callback: (value) => (userBillingGraceEndPeriodCollection = value),
    waitForCollectionCallback: true,
});

let allPolicies: OnyxCollection<Policy>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    callback: (value) => (allPolicies = value),
    waitForCollectionCallback: true,
});

// Indicates if downgrading the current subscription plan is allowed for the user.
let canDowngrade = false;
Onyx.connect({
    key: ONYXKEYS.ACCOUNT,
    callback: (val) => {
        canDowngrade = val?.canDowngrade ?? false;
    },
});

/**
 * @returns The date when the grace period ends.
 */
function getOverdueGracePeriodDate(): OnyxEntry<number> {
    return ownerBillingGraceEndPeriod;
}

/**
 * @returns Whether the workspace owner has an overdue grace period.
 */
function hasOverdueGracePeriod(): boolean {
    return !!ownerBillingGraceEndPeriod;
}

/**
 * @returns Whether the workspace owner's grace period is overdue.
 */
function hasGracePeriodOverdue(): boolean {
    return !!ownerBillingGraceEndPeriod && Date.now() > new Date(ownerBillingGraceEndPeriod).getTime();
}

/**
 * @returns The amount owed by the workspace owner.
 */
function getAmountOwed(): number {
    return amountOwed ?? 0;
}

/**
 * @returns Whether there is an amount owed by the workspace owner.
 */
function hasAmountOwed(): boolean {
    return !!amountOwed;
}

/**
 * @returns Whether there is a card authentication error.
 */
function hasCardAuthenticatedError(stripeCustomerId: OnyxEntry<StripeCustomerID>) {
    return stripeCustomerId?.status === 'authentication_required' && getAmountOwed() === 0;
}

/**
 * @returns Whether there is a billing dispute pending.
 */
function hasBillingDisputePending() {
    return !!billingDisputePending;
}

/**
 * @returns Whether there is a card expired error.
 */
function hasCardExpiredError() {
    return billingStatus?.declineReason === 'expired_card' && amountOwed !== 0;
}

/**
 * @returns Whether there is an insufficient funds error.
 */
function hasInsufficientFundsError() {
    return billingStatus?.declineReason === 'insufficient_funds' && getAmountOwed() !== 0;
}

function shouldShowPreTrialBillingBanner(introSelected: OnyxEntry<IntroSelected>): boolean {
    // We don't want to show the Pre Trial banner if the user was a Test Drive Receiver that created their workspace
    // with the promo code.
    const wasUserTestDriveReceiver = introSelected?.previousChoices?.some((choice) => choice === CONST.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER);

    return !isUserOnFreeTrial() && !hasUserFreeTrialEnded() && !wasUserTestDriveReceiver;
}
/**
 * @returns The card to be used for subscription billing.
 */
function getCardForSubscriptionBilling(): Fund | undefined {
    return Object.values(fundList ?? {}).find((card) => card?.accountData?.additionalData?.isBillingCard);
}

/**
 * @returns Whether the card is due to expire soon.
 */
function hasCardExpiringSoon(): boolean {
    if (!isEmptyObject(billingStatus)) {
        return false;
    }

    const card = getCardForSubscriptionBilling();

    if (!card) {
        return false;
    }

    const cardYear = card?.accountData?.cardYear;
    const cardMonth = card?.accountData?.cardMonth;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const isExpiringThisMonth = cardYear === currentYear && cardMonth === currentMonth;
    const isExpiringNextMonth = cardYear === (currentMonth === 12 ? currentYear + 1 : currentYear) && cardMonth === (currentMonth === 12 ? 1 : currentMonth + 1);

    return isExpiringThisMonth || isExpiringNextMonth;
}

function shouldShowDiscountBanner(hasTeam2025Pricing: boolean, subscriptionPlan: ValueOf<typeof CONST.POLICY.TYPE> | null): boolean {
    if (!getOwnedPaidPolicies(allPolicies, currentUserAccountID)?.length) {
        return false;
    }

    if (!isUserOnFreeTrial()) {
        return false;
    }

    if (doesUserHavePaymentCardAdded()) {
        return false;
    }

    if (hasTeam2025Pricing && subscriptionPlan === CONST.POLICY.TYPE.TEAM) {
        return false;
    }

    const dateNow = Math.floor(Date.now() / 1000);
    const firstDayTimestamp = fromZonedTime(`${firstDayFreeTrial}`, 'UTC').getTime() / 1000;
    const lastDayTimestamp = fromZonedTime(`${lastDayFreeTrial}`, 'UTC').getTime() / 1000;
    if (dateNow > lastDayTimestamp) {
        return false;
    }

    return dateNow <= firstDayTimestamp + CONST.TRIAL_DURATION_DAYS * CONST.DATE.SECONDS_PER_DAY;
}

function getEarlyDiscountInfo(): DiscountInfo | null {
    if (!firstDayFreeTrial) {
        return null;
    }
    const dateNow = Math.floor(Date.now() / 1000);
    const firstDayTimestamp = fromZonedTime(`${firstDayFreeTrial}`, 'UTC').getTime() / 1000;

    let timeLeftInSeconds;
    const timeLeft24 = CONST.DATE.SECONDS_PER_DAY - (dateNow - firstDayTimestamp);
    if (timeLeft24 > 0) {
        timeLeftInSeconds = timeLeft24;
    } else {
        timeLeftInSeconds = firstDayTimestamp + CONST.TRIAL_DURATION_DAYS * CONST.DATE.SECONDS_PER_DAY - dateNow;
    }

    if (timeLeftInSeconds <= 0) {
        return null;
    }

    return {
        days: Math.floor(timeLeftInSeconds / CONST.DATE.SECONDS_PER_DAY),
        hours: Math.floor((timeLeftInSeconds % CONST.DATE.SECONDS_PER_DAY) / 3600),
        minutes: Math.floor((timeLeftInSeconds % 3600) / 60),
        seconds: Math.floor(timeLeftInSeconds % 60),
        discountType: timeLeft24 > 0 ? 50 : 25,
    };
}

/**
 * @returns Whether there is a retry billing error.
 */
function hasRetryBillingError(): boolean {
    return !!retryBillingFailed;
}

/**
 * @returns Whether the retry billing was successful.
 */
function isRetryBillingSuccessful(): boolean {
    return !!retryBillingSuccessful;
}

type SubscriptionStatus = {
    status: string;
    isError?: boolean;
};

/**
 * @returns The subscription status.
 */
function getSubscriptionStatus(stripeCustomerId: OnyxEntry<StripeCustomerID>): SubscriptionStatus | undefined {
    if (hasOverdueGracePeriod()) {
        if (hasAmountOwed()) {
            // 1. Policy owner with amount owed, within grace period
            if (!hasGracePeriodOverdue()) {
                return {
                    status: PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED,
                    isError: true,
                };
            }

            // 2. Policy owner with amount owed, overdue (past grace period)
            if (hasGracePeriodOverdue()) {
                return {
                    isError: true,
                    status: PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE,
                };
            }
        } else {
            // 3. Owner of policy under invoicing, within grace period
            if (!hasGracePeriodOverdue()) {
                return {
                    status: PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING,
                    isError: true,
                };
            }

            // 4. Owner of policy under invoicing, overdue (past grace period)
            if (hasGracePeriodOverdue()) {
                return {
                    status: PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING_OVERDUE,
                    isError: true,
                };
            }
        }
    }
    // 5. Billing disputed by cardholder
    if (hasBillingDisputePending()) {
        return {
            status: PAYMENT_STATUS.BILLING_DISPUTE_PENDING,
            isError: true,
        };
    }

    // 6. Card not authenticated
    if (hasCardAuthenticatedError(stripeCustomerId)) {
        return {
            status: PAYMENT_STATUS.CARD_AUTHENTICATION_REQUIRED,
            isError: true,
        };
    }

    // 7. Insufficient funds
    if (hasInsufficientFundsError()) {
        return {
            status: PAYMENT_STATUS.INSUFFICIENT_FUNDS,
            isError: true,
        };
    }

    // 8. Card expired
    if (hasCardExpiredError()) {
        return {
            status: PAYMENT_STATUS.CARD_EXPIRED,
            isError: true,
        };
    }

    // 9. Card due to expire soon
    if (hasCardExpiringSoon()) {
        return {
            status: PAYMENT_STATUS.CARD_EXPIRE_SOON,
        };
    }

    // 10. Retry billing success
    if (isRetryBillingSuccessful()) {
        return {
            status: PAYMENT_STATUS.RETRY_BILLING_SUCCESS,
            isError: false,
        };
    }

    // 11. Retry billing error
    if (hasRetryBillingError()) {
        return {
            status: PAYMENT_STATUS.RETRY_BILLING_ERROR,
            isError: true,
        };
    }

    return undefined;
}

/**
 * @returns Whether there is a subscription red dot error.
 */
function hasSubscriptionRedDotError(stripeCustomerId: OnyxEntry<StripeCustomerID>): boolean {
    return getSubscriptionStatus(stripeCustomerId)?.isError ?? false;
}

/**
 * @returns Whether there is a subscription green dot info.
 */
function hasSubscriptionGreenDotInfo(stripeCustomerId: OnyxEntry<StripeCustomerID>): boolean {
    return getSubscriptionStatus(stripeCustomerId)?.isError === false;
}

/**
 * Calculates the remaining number of days of the workspace owner's free trial before it ends.
 */
function calculateRemainingFreeTrialDays(): number {
    if (!lastDayFreeTrial) {
        return 0;
    }

    const currentDate = new Date();
    const lastDayFreeTrialDate = new Date(`${lastDayFreeTrial}Z`);
    const diffInSeconds = differenceInSeconds(lastDayFreeTrialDate, currentDate);
    const diffInDays = Math.ceil(diffInSeconds / 86400);

    return diffInDays < 0 ? 0 : diffInDays;
}

/**
 * @param policies - The policies collection.
 * @returns The free trial badge text .
 */
function getFreeTrialText(policies: OnyxCollection<Policy> | null, introSelected: OnyxEntry<IntroSelected>): string | undefined {
    const ownedPaidPolicies = getOwnedPaidPolicies(policies, currentUserAccountID);
    if (isEmptyObject(ownedPaidPolicies)) {
        return undefined;
    }

    if (shouldShowPreTrialBillingBanner(introSelected)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('subscription.billingBanner.preTrial.title');
    }
    if (isUserOnFreeTrial()) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('subscription.billingBanner.trialStarted.title', {numOfDays: calculateRemainingFreeTrialDays()});
    }

    return undefined;
}

/**
 * Whether the workspace's owner is on its free trial period.
 */
function isUserOnFreeTrial(): boolean {
    if (!firstDayFreeTrial || !lastDayFreeTrial) {
        return false;
    }

    const currentDate = new Date();

    // Free Trials are stored in UTC so the below code will convert the provided UTC datetime to local time
    const firstDayFreeTrialDate = new Date(`${firstDayFreeTrial}Z`);
    const lastDayFreeTrialDate = new Date(`${lastDayFreeTrial}Z`);

    return isAfter(currentDate, firstDayFreeTrialDate) && isBefore(currentDate, lastDayFreeTrialDate);
}

/**
 * Whether the workspace owner's free trial period has ended.
 */
function hasUserFreeTrialEnded(): boolean {
    if (!lastDayFreeTrial) {
        return false;
    }

    const currentDate = new Date();
    const lastDayFreeTrialDate = new Date(`${lastDayFreeTrial}Z`);

    return isAfter(currentDate, lastDayFreeTrialDate);
}

/**
 * Whether the user has a payment card added to its account.
 */
function doesUserHavePaymentCardAdded(): boolean {
    return userBillingFundID !== undefined;
}

/**
 * Whether the user's billable actions should be restricted.
 */
function shouldRestrictUserBillableActions(policyID: string): boolean {
    const currentDate = new Date();

    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];

    // This logic will be executed if the user is a workspace's non-owner (normal user or admin).
    // We should restrict the workspace's non-owner actions if it's member of a workspace where the owner is
    // past due and is past its grace period end.
    for (const userBillingGraceEndPeriodEntry of Object.entries(userBillingGraceEndPeriodCollection ?? {})) {
        const [entryKey, userBillingGracePeriodEnd] = userBillingGraceEndPeriodEntry;

        if (userBillingGracePeriodEnd && isAfter(currentDate, fromUnixTime(userBillingGracePeriodEnd.value))) {
            // Extracts the owner account ID from the collection member key.
            const ownerAccountID = Number(entryKey.slice(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END.length));

            if (isPolicyOwner(policy, ownerAccountID)) {
                return true;
            }
        }
    }

    // If it reached here it means that the user is actually the workspace's owner.
    // We should restrict the workspace's owner actions if it's past its grace period end date and it's owing some amount.
    if (
        isPolicyOwner(policy, currentUserAccountID) &&
        ownerBillingGraceEndPeriod &&
        amountOwed !== undefined &&
        amountOwed > 0 &&
        isAfter(currentDate, fromUnixTime(ownerBillingGraceEndPeriod))
    ) {
        return true;
    }

    return false;
}

function shouldCalculateBillNewDot(): boolean {
    return canDowngrade && getOwnedPaidPolicies(allPolicies, currentUserAccountID).length === 1;
}

function checkIfHasTeam2025Pricing() {
    if (hasManualTeam2025Pricing) {
        return true;
    }

    if (!firstPolicyDate) {
        return true;
    }

    return differenceInDays(firstPolicyDate, CONST.SUBSCRIPTION.TEAM_2025_PRICING_START_DATE) >= 0;
}

function getSubscriptionPrice(plan: PersonalPolicyTypeExcludedProps | null, preferredCurrency: PreferredCurrency, privateSubscriptionType: SubscriptionType | undefined): number {
    if (!privateSubscriptionType || !plan) {
        return 0;
    }

    const hasTeam2025Pricing = checkIfHasTeam2025Pricing();

    if (hasTeam2025Pricing && plan === CONST.POLICY.TYPE.TEAM) {
        return CONST.SUBSCRIPTION_PRICES[preferredCurrency][plan][CONST.SUBSCRIPTION.PRICING_TYPE_2025];
    }

    return CONST.SUBSCRIPTION_PRICES[preferredCurrency][plan][privateSubscriptionType];
}

function getSubscriptionPlanInfo(
    subscriptionPlan: PersonalPolicyTypeExcludedProps | null,
    privateSubscriptionType: SubscriptionType | undefined,
    preferredCurrency: PreferredCurrency,
    isFromComparisonModal: boolean,
): SubscriptionPlanInfo {
    const priceValue = getSubscriptionPrice(subscriptionPlan, preferredCurrency, privateSubscriptionType);
    const price = convertToShortDisplayString(priceValue, preferredCurrency);
    const hasTeam2025Pricing = checkIfHasTeam2025Pricing();

    if (subscriptionPlan === CONST.POLICY.TYPE.TEAM) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        let subtitle = translateLocal('subscription.yourPlan.customPricing');
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        let note: string | undefined = translateLocal('subscription.yourPlan.asLowAs', {price});

        if (hasTeam2025Pricing) {
            if (isFromComparisonModal) {
                subtitle = price;
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                note = translateLocal('subscription.yourPlan.perMemberMonth');
            } else {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                subtitle = translateLocal('subscription.yourPlan.pricePerMemberMonth', {price});
                note = undefined;
            }
        }

        return {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            title: translateLocal('subscription.yourPlan.collect.title'),
            subtitle,
            note,
            benefits: [
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                translateLocal('subscription.yourPlan.collect.benefit1'),
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                translateLocal('subscription.yourPlan.collect.benefit2'),
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                translateLocal('subscription.yourPlan.collect.benefit3'),
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                translateLocal('subscription.yourPlan.collect.benefit4'),
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                translateLocal('subscription.yourPlan.collect.benefit5'),
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                translateLocal('subscription.yourPlan.collect.benefit6'),
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                translateLocal('subscription.yourPlan.collect.benefit7'),
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                translateLocal('subscription.yourPlan.collect.benefit8'),
            ],
            src: Illustrations.Mailbox,
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            description: translateLocal('subscription.yourPlan.collect.description'),
        };
    }

    return {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        title: translateLocal('subscription.yourPlan.control.title'),
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        subtitle: translateLocal('subscription.yourPlan.customPricing'),
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        note: translateLocal('subscription.yourPlan.asLowAs', {price}),
        benefits: [
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            translateLocal('subscription.yourPlan.control.benefit1'),
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            translateLocal('subscription.yourPlan.control.benefit2'),
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            translateLocal('subscription.yourPlan.control.benefit3'),
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            translateLocal('subscription.yourPlan.control.benefit4'),
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            translateLocal('subscription.yourPlan.control.benefit5'),
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            translateLocal('subscription.yourPlan.control.benefit6'),
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            translateLocal('subscription.yourPlan.control.benefit7'),
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            translateLocal('subscription.yourPlan.control.benefit8'),
        ],
        src: Illustrations.ShieldYellow,
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        description: translateLocal('subscription.yourPlan.control.description'),
    };
}

export {
    calculateRemainingFreeTrialDays,
    doesUserHavePaymentCardAdded,
    getAmountOwed,
    getCardForSubscriptionBilling,
    getFreeTrialText,
    getOverdueGracePeriodDate,
    getSubscriptionStatus,
    hasCardAuthenticatedError,
    hasRetryBillingError,
    hasSubscriptionGreenDotInfo,
    hasSubscriptionRedDotError,
    hasUserFreeTrialEnded,
    isUserOnFreeTrial,
    PAYMENT_STATUS,
    shouldRestrictUserBillableActions,
    shouldShowPreTrialBillingBanner,
    shouldShowDiscountBanner,
    getEarlyDiscountInfo,
    shouldCalculateBillNewDot,
    getSubscriptionPlanInfo,
    getSubscriptionPrice,
};
