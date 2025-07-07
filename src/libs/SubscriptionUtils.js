"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAYMENT_STATUS = void 0;
exports.calculateRemainingFreeTrialDays = calculateRemainingFreeTrialDays;
exports.doesUserHavePaymentCardAdded = doesUserHavePaymentCardAdded;
exports.getAmountOwed = getAmountOwed;
exports.getCardForSubscriptionBilling = getCardForSubscriptionBilling;
exports.getFreeTrialText = getFreeTrialText;
exports.getOverdueGracePeriodDate = getOverdueGracePeriodDate;
exports.getSubscriptionStatus = getSubscriptionStatus;
exports.hasCardAuthenticatedError = hasCardAuthenticatedError;
exports.hasRetryBillingError = hasRetryBillingError;
exports.hasSubscriptionGreenDotInfo = hasSubscriptionGreenDotInfo;
exports.hasSubscriptionRedDotError = hasSubscriptionRedDotError;
exports.hasUserFreeTrialEnded = hasUserFreeTrialEnded;
exports.isUserOnFreeTrial = isUserOnFreeTrial;
exports.shouldRestrictUserBillableActions = shouldRestrictUserBillableActions;
exports.shouldShowPreTrialBillingBanner = shouldShowPreTrialBillingBanner;
exports.shouldShowDiscountBanner = shouldShowDiscountBanner;
exports.getEarlyDiscountInfo = getEarlyDiscountInfo;
exports.shouldCalculateBillNewDot = shouldCalculateBillNewDot;
exports.getSubscriptionPlanInfo = getSubscriptionPlanInfo;
exports.getSubscriptionPrice = getSubscriptionPrice;
var date_fns_1 = require("date-fns");
var date_fns_tz_1 = require("date-fns-tz");
var react_native_onyx_1 = require("react-native-onyx");
var Illustrations = require("@components/Icon/Illustrations");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var CurrencyUtils_1 = require("./CurrencyUtils");
var Localize_1 = require("./Localize");
var PolicyUtils_1 = require("./PolicyUtils");
var PAYMENT_STATUS = {
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
};
exports.PAYMENT_STATUS = PAYMENT_STATUS;
var currentUserAccountID = -1;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (value) {
        var _a;
        currentUserAccountID = (_a = value === null || value === void 0 ? void 0 : value.accountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID;
    },
});
var amountOwed;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_PRIVATE_AMOUNT_OWED,
    callback: function (value) { return (amountOwed = value); },
});
var stripeCustomerId;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_PRIVATE_STRIPE_CUSTOMER_ID,
    callback: function (value) {
        if (!value) {
            return;
        }
        stripeCustomerId = value;
    },
});
var billingDisputePending;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_PRIVATE_BILLING_DISPUTE_PENDING,
    callback: function (value) { return (billingDisputePending = value); },
});
var billingStatus;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_PRIVATE_BILLING_STATUS,
    callback: function (value) { return (billingStatus = value); },
});
var firstPolicyDate;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_PRIVATE_FIRST_POLICY_CREATED_DATE,
    callback: function (value) {
        firstPolicyDate = value;
    },
});
var hasManualTeam2025Pricing;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_PRIVATE_MANUAL_TEAM_2025_PRICING,
    callback: function (value) {
        hasManualTeam2025Pricing = value;
    },
});
var ownerBillingGraceEndPeriod;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END,
    callback: function (value) { return (ownerBillingGraceEndPeriod = value); },
});
var fundList;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.FUND_LIST,
    callback: function (value) {
        if (!value) {
            return;
        }
        fundList = value;
    },
});
var retryBillingSuccessful;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL,
    initWithStoredValues: false,
    callback: function (value) {
        if (value === undefined) {
            return;
        }
        retryBillingSuccessful = value;
    },
});
var retryBillingFailed;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED,
    callback: function (value) {
        if (value === undefined) {
            return;
        }
        retryBillingFailed = value;
    },
    initWithStoredValues: false,
});
var firstDayFreeTrial;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_FIRST_DAY_FREE_TRIAL,
    callback: function (value) { return (firstDayFreeTrial = value); },
});
var lastDayFreeTrial;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_LAST_DAY_FREE_TRIAL,
    callback: function (value) { return (lastDayFreeTrial = value); },
});
var userBillingFundID;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_BILLING_FUND_ID,
    callback: function (value) { return (userBillingFundID = value); },
});
var userBillingGraceEndPeriodCollection;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END,
    callback: function (value) { return (userBillingGraceEndPeriodCollection = value); },
    waitForCollectionCallback: true,
});
var allPolicies;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.POLICY,
    callback: function (value) { return (allPolicies = value); },
    waitForCollectionCallback: true,
});
// Indicates if downgrading the current subscription plan is allowed for the user.
var canDowngrade = false;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.ACCOUNT,
    callback: function (val) {
        var _a;
        canDowngrade = (_a = val === null || val === void 0 ? void 0 : val.canDowngrade) !== null && _a !== void 0 ? _a : false;
    },
});
var introSelected;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_INTRO_SELECTED,
    callback: function (value) { return (introSelected = value); },
});
/**
 * @returns The date when the grace period ends.
 */
function getOverdueGracePeriodDate() {
    return ownerBillingGraceEndPeriod;
}
/**
 * @returns Whether the workspace owner has an overdue grace period.
 */
function hasOverdueGracePeriod() {
    return !!ownerBillingGraceEndPeriod;
}
/**
 * @returns Whether the workspace owner's grace period is overdue.
 */
function hasGracePeriodOverdue() {
    return !!ownerBillingGraceEndPeriod && Date.now() > new Date(ownerBillingGraceEndPeriod).getTime();
}
/**
 * @returns The amount owed by the workspace owner.
 */
function getAmountOwed() {
    return amountOwed !== null && amountOwed !== void 0 ? amountOwed : 0;
}
/**
 * @returns Whether there is an amount owed by the workspace owner.
 */
function hasAmountOwed() {
    return !!amountOwed;
}
/**
 * @returns Whether there is a card authentication error.
 */
function hasCardAuthenticatedError() {
    return (stripeCustomerId === null || stripeCustomerId === void 0 ? void 0 : stripeCustomerId.status) === 'authentication_required' && getAmountOwed() === 0;
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
    return (billingStatus === null || billingStatus === void 0 ? void 0 : billingStatus.declineReason) === 'expired_card' && amountOwed !== 0;
}
/**
 * @returns Whether there is an insufficient funds error.
 */
function hasInsufficientFundsError() {
    return (billingStatus === null || billingStatus === void 0 ? void 0 : billingStatus.declineReason) === 'insufficient_funds' && getAmountOwed() !== 0;
}
function shouldShowPreTrialBillingBanner() {
    var _a;
    // We don't want to show the Pre Trial banner if the user was a Test Drive Receiver that created their workspace
    // with the promo code.
    var wasUserTestDriveReceiver = (_a = introSelected === null || introSelected === void 0 ? void 0 : introSelected.previousChoices) === null || _a === void 0 ? void 0 : _a.some(function (choice) { return choice === CONST_1.default.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER; });
    return !isUserOnFreeTrial() && !hasUserFreeTrialEnded() && !wasUserTestDriveReceiver;
}
/**
 * @returns The card to be used for subscription billing.
 */
function getCardForSubscriptionBilling() {
    return Object.values(fundList !== null && fundList !== void 0 ? fundList : {}).find(function (card) { var _a, _b; return (_b = (_a = card === null || card === void 0 ? void 0 : card.accountData) === null || _a === void 0 ? void 0 : _a.additionalData) === null || _b === void 0 ? void 0 : _b.isBillingCard; });
}
/**
 * @returns Whether the card is due to expire soon.
 */
function hasCardExpiringSoon() {
    var _a, _b;
    if (!(0, EmptyObject_1.isEmptyObject)(billingStatus)) {
        return false;
    }
    var card = getCardForSubscriptionBilling();
    if (!card) {
        return false;
    }
    var cardYear = (_a = card === null || card === void 0 ? void 0 : card.accountData) === null || _a === void 0 ? void 0 : _a.cardYear;
    var cardMonth = (_b = card === null || card === void 0 ? void 0 : card.accountData) === null || _b === void 0 ? void 0 : _b.cardMonth;
    var currentYear = new Date().getFullYear();
    var currentMonth = new Date().getMonth();
    var isExpiringThisMonth = cardYear === currentYear && cardMonth === currentMonth;
    var isExpiringNextMonth = cardYear === (currentMonth === 12 ? currentYear + 1 : currentYear) && cardMonth === (currentMonth === 12 ? 1 : currentMonth + 1);
    return isExpiringThisMonth || isExpiringNextMonth;
}
function shouldShowDiscountBanner(hasTeam2025Pricing, subscriptionPlan) {
    var _a;
    if (!((_a = (0, PolicyUtils_1.getOwnedPaidPolicies)(allPolicies, currentUserAccountID)) === null || _a === void 0 ? void 0 : _a.length)) {
        return false;
    }
    if (!isUserOnFreeTrial()) {
        return false;
    }
    if (doesUserHavePaymentCardAdded()) {
        return false;
    }
    if (hasTeam2025Pricing && subscriptionPlan === CONST_1.default.POLICY.TYPE.TEAM) {
        return false;
    }
    var dateNow = Math.floor(Date.now() / 1000);
    var firstDayTimestamp = (0, date_fns_tz_1.fromZonedTime)("".concat(firstDayFreeTrial), 'UTC').getTime() / 1000;
    var lastDayTimestamp = (0, date_fns_tz_1.fromZonedTime)("".concat(lastDayFreeTrial), 'UTC').getTime() / 1000;
    if (dateNow > lastDayTimestamp) {
        return false;
    }
    return dateNow <= firstDayTimestamp + CONST_1.default.TRIAL_DURATION_DAYS * CONST_1.default.DATE.SECONDS_PER_DAY;
}
function getEarlyDiscountInfo() {
    if (!firstDayFreeTrial) {
        return null;
    }
    var dateNow = Math.floor(Date.now() / 1000);
    var firstDayTimestamp = (0, date_fns_tz_1.fromZonedTime)("".concat(firstDayFreeTrial), 'UTC').getTime() / 1000;
    var timeLeftInSeconds;
    var timeLeft24 = CONST_1.default.DATE.SECONDS_PER_DAY - (dateNow - firstDayTimestamp);
    if (timeLeft24 > 0) {
        timeLeftInSeconds = timeLeft24;
    }
    else {
        timeLeftInSeconds = firstDayTimestamp + CONST_1.default.TRIAL_DURATION_DAYS * CONST_1.default.DATE.SECONDS_PER_DAY - dateNow;
    }
    if (timeLeftInSeconds <= 0) {
        return null;
    }
    return {
        days: Math.floor(timeLeftInSeconds / CONST_1.default.DATE.SECONDS_PER_DAY),
        hours: Math.floor((timeLeftInSeconds % CONST_1.default.DATE.SECONDS_PER_DAY) / 3600),
        minutes: Math.floor((timeLeftInSeconds % 3600) / 60),
        seconds: Math.floor(timeLeftInSeconds % 60),
        discountType: timeLeft24 > 0 ? 50 : 25,
    };
}
/**
 * @returns Whether there is a retry billing error.
 */
function hasRetryBillingError() {
    return !!retryBillingFailed;
}
/**
 * @returns Whether the retry billing was successful.
 */
function isRetryBillingSuccessful() {
    return !!retryBillingSuccessful;
}
/**
 * @returns The subscription status.
 */
function getSubscriptionStatus() {
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
        }
        else {
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
    if (hasCardAuthenticatedError()) {
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
function hasSubscriptionRedDotError() {
    var _a, _b;
    return (_b = (_a = getSubscriptionStatus()) === null || _a === void 0 ? void 0 : _a.isError) !== null && _b !== void 0 ? _b : false;
}
/**
 * @returns Whether there is a subscription green dot info.
 */
function hasSubscriptionGreenDotInfo() {
    var _a;
    return ((_a = getSubscriptionStatus()) === null || _a === void 0 ? void 0 : _a.isError) === false;
}
/**
 * Calculates the remaining number of days of the workspace owner's free trial before it ends.
 */
function calculateRemainingFreeTrialDays() {
    if (!lastDayFreeTrial) {
        return 0;
    }
    var currentDate = new Date();
    var lastDayFreeTrialDate = new Date("".concat(lastDayFreeTrial, "Z"));
    var diffInSeconds = (0, date_fns_1.differenceInSeconds)(lastDayFreeTrialDate, currentDate);
    var diffInDays = Math.ceil(diffInSeconds / 86400);
    return diffInDays < 0 ? 0 : diffInDays;
}
/**
 * @param policies - The policies collection.
 * @returns The free trial badge text .
 */
function getFreeTrialText(policies) {
    var ownedPaidPolicies = (0, PolicyUtils_1.getOwnedPaidPolicies)(policies, currentUserAccountID);
    if ((0, EmptyObject_1.isEmptyObject)(ownedPaidPolicies)) {
        return undefined;
    }
    if (shouldShowPreTrialBillingBanner()) {
        return (0, Localize_1.translateLocal)('subscription.billingBanner.preTrial.title');
    }
    if (isUserOnFreeTrial()) {
        return (0, Localize_1.translateLocal)('subscription.billingBanner.trialStarted.title', { numOfDays: calculateRemainingFreeTrialDays() });
    }
    return undefined;
}
/**
 * Whether the workspace's owner is on its free trial period.
 */
function isUserOnFreeTrial() {
    if (!firstDayFreeTrial || !lastDayFreeTrial) {
        return false;
    }
    var currentDate = new Date();
    // Free Trials are stored in UTC so the below code will convert the provided UTC datetime to local time
    var firstDayFreeTrialDate = new Date("".concat(firstDayFreeTrial, "Z"));
    var lastDayFreeTrialDate = new Date("".concat(lastDayFreeTrial, "Z"));
    return (0, date_fns_1.isAfter)(currentDate, firstDayFreeTrialDate) && (0, date_fns_1.isBefore)(currentDate, lastDayFreeTrialDate);
}
/**
 * Whether the workspace owner's free trial period has ended.
 */
function hasUserFreeTrialEnded() {
    if (!lastDayFreeTrial) {
        return false;
    }
    var currentDate = new Date();
    var lastDayFreeTrialDate = new Date("".concat(lastDayFreeTrial, "Z"));
    return (0, date_fns_1.isAfter)(currentDate, lastDayFreeTrialDate);
}
/**
 * Whether the user has a payment card added to its account.
 */
function doesUserHavePaymentCardAdded() {
    return userBillingFundID !== undefined;
}
/**
 * Whether the user's billable actions should be restricted.
 */
function shouldRestrictUserBillableActions(policyID) {
    var currentDate = new Date();
    var policy = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)];
    // This logic will be executed if the user is a workspace's non-owner (normal user or admin).
    // We should restrict the workspace's non-owner actions if it's member of a workspace where the owner is
    // past due and is past its grace period end.
    for (var _i = 0, _a = Object.entries(userBillingGraceEndPeriodCollection !== null && userBillingGraceEndPeriodCollection !== void 0 ? userBillingGraceEndPeriodCollection : {}); _i < _a.length; _i++) {
        var userBillingGraceEndPeriodEntry = _a[_i];
        var entryKey = userBillingGraceEndPeriodEntry[0], userBillingGracePeriodEnd = userBillingGraceEndPeriodEntry[1];
        if (userBillingGracePeriodEnd && (0, date_fns_1.isAfter)(currentDate, (0, date_fns_1.fromUnixTime)(userBillingGracePeriodEnd.value))) {
            // Extracts the owner account ID from the collection member key.
            var ownerAccountID = Number(entryKey.slice(ONYXKEYS_1.default.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END.length));
            if ((0, PolicyUtils_1.isPolicyOwner)(policy, ownerAccountID)) {
                return true;
            }
        }
    }
    // If it reached here it means that the user is actually the workspace's owner.
    // We should restrict the workspace's owner actions if it's past its grace period end date and it's owing some amount.
    if ((0, PolicyUtils_1.isPolicyOwner)(policy, currentUserAccountID) &&
        ownerBillingGraceEndPeriod &&
        amountOwed !== undefined &&
        amountOwed > 0 &&
        (0, date_fns_1.isAfter)(currentDate, (0, date_fns_1.fromUnixTime)(ownerBillingGraceEndPeriod))) {
        return true;
    }
    return false;
}
function shouldCalculateBillNewDot() {
    return canDowngrade && (0, PolicyUtils_1.getOwnedPaidPolicies)(allPolicies, currentUserAccountID).length === 1;
}
function checkIfHasTeam2025Pricing() {
    if (hasManualTeam2025Pricing) {
        return true;
    }
    if (!firstPolicyDate) {
        return true;
    }
    return (0, date_fns_1.differenceInDays)(firstPolicyDate, CONST_1.default.SUBSCRIPTION.TEAM_2025_PRICING_START_DATE) >= 0;
}
function getSubscriptionPrice(plan, preferredCurrency, privateSubscriptionType) {
    if (!privateSubscriptionType || !plan) {
        return 0;
    }
    var hasTeam2025Pricing = checkIfHasTeam2025Pricing();
    if (hasTeam2025Pricing && plan === CONST_1.default.POLICY.TYPE.TEAM) {
        return CONST_1.default.SUBSCRIPTION_PRICES[preferredCurrency][plan][CONST_1.default.SUBSCRIPTION.PRICING_TYPE_2025];
    }
    return CONST_1.default.SUBSCRIPTION_PRICES[preferredCurrency][plan][privateSubscriptionType];
}
function getSubscriptionPlanInfo(subscriptionPlan, privateSubscriptionType, preferredCurrency, isFromComparisonModal) {
    var priceValue = getSubscriptionPrice(subscriptionPlan, preferredCurrency, privateSubscriptionType);
    var price = (0, CurrencyUtils_1.convertToShortDisplayString)(priceValue, preferredCurrency);
    var hasTeam2025Pricing = checkIfHasTeam2025Pricing();
    if (subscriptionPlan === CONST_1.default.POLICY.TYPE.TEAM) {
        var subtitle = (0, Localize_1.translateLocal)('subscription.yourPlan.customPricing');
        var note = (0, Localize_1.translateLocal)('subscription.yourPlan.asLowAs', { price: price });
        if (hasTeam2025Pricing) {
            if (isFromComparisonModal) {
                subtitle = price;
                note = (0, Localize_1.translateLocal)('subscription.yourPlan.perMemberMonth');
            }
            else {
                subtitle = (0, Localize_1.translateLocal)('subscription.yourPlan.pricePerMemberMonth', { price: price });
                note = undefined;
            }
        }
        return {
            title: (0, Localize_1.translateLocal)('subscription.yourPlan.collect.title'),
            subtitle: subtitle,
            note: note,
            benefits: [
                (0, Localize_1.translateLocal)('subscription.yourPlan.collect.benefit1'),
                (0, Localize_1.translateLocal)('subscription.yourPlan.collect.benefit2'),
                (0, Localize_1.translateLocal)('subscription.yourPlan.collect.benefit3'),
                (0, Localize_1.translateLocal)('subscription.yourPlan.collect.benefit4'),
                (0, Localize_1.translateLocal)('subscription.yourPlan.collect.benefit5'),
                (0, Localize_1.translateLocal)('subscription.yourPlan.collect.benefit6'),
                (0, Localize_1.translateLocal)('subscription.yourPlan.collect.benefit7'),
                (0, Localize_1.translateLocal)('subscription.yourPlan.collect.benefit8'),
            ],
            src: Illustrations.Mailbox,
            description: (0, Localize_1.translateLocal)('subscription.yourPlan.collect.description'),
        };
    }
    return {
        title: (0, Localize_1.translateLocal)('subscription.yourPlan.control.title'),
        subtitle: (0, Localize_1.translateLocal)('subscription.yourPlan.customPricing'),
        note: (0, Localize_1.translateLocal)('subscription.yourPlan.asLowAs', { price: price }),
        benefits: [
            (0, Localize_1.translateLocal)('subscription.yourPlan.control.benefit1'),
            (0, Localize_1.translateLocal)('subscription.yourPlan.control.benefit2'),
            (0, Localize_1.translateLocal)('subscription.yourPlan.control.benefit3'),
            (0, Localize_1.translateLocal)('subscription.yourPlan.control.benefit4'),
            (0, Localize_1.translateLocal)('subscription.yourPlan.control.benefit5'),
            (0, Localize_1.translateLocal)('subscription.yourPlan.control.benefit6'),
            (0, Localize_1.translateLocal)('subscription.yourPlan.control.benefit7'),
            (0, Localize_1.translateLocal)('subscription.yourPlan.control.benefit8'),
        ],
        src: Illustrations.ShieldYellow,
        description: (0, Localize_1.translateLocal)('subscription.yourPlan.control.description'),
    };
}
