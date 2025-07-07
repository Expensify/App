"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var date_fns_1 = require("date-fns");
var Expensicons = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var DateUtils_1 = require("@libs/DateUtils");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var CONST_1 = require("@src/CONST");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function getBillingStatus(_a) {
    var _b, _c, _d, _e;
    var translate = _a.translate, accountData = _a.accountData, purchase = _a.purchase;
    var cardEnding = (_c = ((_b = accountData === null || accountData === void 0 ? void 0 : accountData.cardNumber) !== null && _b !== void 0 ? _b : '')) === null || _c === void 0 ? void 0 : _c.slice(-4);
    var amountOwed = (0, SubscriptionUtils_1.getAmountOwed)();
    var subscriptionStatus = (0, SubscriptionUtils_1.getSubscriptionStatus)();
    var endDate = (0, SubscriptionUtils_1.getOverdueGracePeriodDate)();
    var endDateFormatted = endDate ? DateUtils_1.default.formatWithUTCTimeZone((0, date_fns_1.fromUnixTime)(endDate).toUTCString(), CONST_1.default.DATE.MONTH_DAY_YEAR_FORMAT) : null;
    var isCurrentCardExpired = DateUtils_1.default.isCardExpired((_d = accountData === null || accountData === void 0 ? void 0 : accountData.cardMonth) !== null && _d !== void 0 ? _d : 0, (_e = accountData === null || accountData === void 0 ? void 0 : accountData.cardYear) !== null && _e !== void 0 ? _e : 0);
    var purchaseAmount = purchase === null || purchase === void 0 ? void 0 : purchase.message.billableAmount;
    var purchaseCurrency = purchase === null || purchase === void 0 ? void 0 : purchase.currency;
    var purchaseDate = purchase === null || purchase === void 0 ? void 0 : purchase.created;
    var isBillingFailed = (purchase === null || purchase === void 0 ? void 0 : purchase.message.billingType) === CONST_1.default.BILLING.TYPE_FAILED_2018;
    var purchaseDateFormatted = purchaseDate ? DateUtils_1.default.formatWithUTCTimeZone(purchaseDate, CONST_1.default.DATE.MONTH_DAY_YEAR_FORMAT) : undefined;
    var purchaseAmountWithCurrency = (0, CurrencyUtils_1.convertAmountToDisplayString)(purchaseAmount, purchaseCurrency);
    switch (subscriptionStatus === null || subscriptionStatus === void 0 ? void 0 : subscriptionStatus.status) {
        case SubscriptionUtils_1.PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED:
            return {
                title: translate('subscription.billingBanner.policyOwnerAmountOwed.title'),
                subtitle: translate('subscription.billingBanner.policyOwnerAmountOwed.subtitle', { date: endDateFormatted !== null && endDateFormatted !== void 0 ? endDateFormatted : '' }),
                isError: true,
                isRetryAvailable: true,
            };
        case SubscriptionUtils_1.PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE:
            return {
                title: translate('subscription.billingBanner.policyOwnerAmountOwedOverdue.title'),
                subtitle: translate('subscription.billingBanner.policyOwnerAmountOwedOverdue.subtitle', isBillingFailed
                    ? {
                        date: purchaseDateFormatted,
                        purchaseAmountOwed: purchaseAmountWithCurrency,
                    }
                    : {}),
                isError: true,
                isRetryAvailable: !(0, EmptyObject_1.isEmptyObject)(accountData) ? true : undefined,
            };
        case SubscriptionUtils_1.PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING:
            return {
                title: translate('subscription.billingBanner.policyOwnerUnderInvoicing.title'),
                subtitle: translate('subscription.billingBanner.policyOwnerUnderInvoicing.subtitle', { date: endDateFormatted !== null && endDateFormatted !== void 0 ? endDateFormatted : '' }),
                isError: true,
                isAddButtonDark: true,
            };
        case SubscriptionUtils_1.PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING_OVERDUE:
            return {
                title: translate('subscription.billingBanner.policyOwnerUnderInvoicingOverdue.title'),
                subtitle: translate('subscription.billingBanner.policyOwnerUnderInvoicingOverdue.subtitle'),
                isError: true,
                isAddButtonDark: true,
            };
        case SubscriptionUtils_1.PAYMENT_STATUS.BILLING_DISPUTE_PENDING:
            return {
                title: translate('subscription.billingBanner.billingDisputePending.title'),
                subtitle: translate('subscription.billingBanner.billingDisputePending.subtitle', { amountOwed: amountOwed, cardEnding: cardEnding }),
                isError: true,
                isRetryAvailable: false,
            };
        case SubscriptionUtils_1.PAYMENT_STATUS.CARD_AUTHENTICATION_REQUIRED:
            return {
                title: translate('subscription.billingBanner.cardAuthenticationRequired.title'),
                subtitle: translate('subscription.billingBanner.cardAuthenticationRequired.subtitle', { cardEnding: cardEnding }),
                isError: true,
                isAuthenticationRequired: true,
            };
        case SubscriptionUtils_1.PAYMENT_STATUS.INSUFFICIENT_FUNDS:
            return {
                title: translate('subscription.billingBanner.insufficientFunds.title'),
                subtitle: translate('subscription.billingBanner.insufficientFunds.subtitle', { amountOwed: amountOwed }),
                isError: true,
                isRetryAvailable: true,
            };
        case SubscriptionUtils_1.PAYMENT_STATUS.CARD_EXPIRED:
            return {
                title: translate('subscription.billingBanner.cardExpired.title'),
                subtitle: translate('subscription.billingBanner.cardExpired.subtitle', { amountOwed: amountOwed }),
                isError: true,
                isRetryAvailable: !isCurrentCardExpired,
            };
        case SubscriptionUtils_1.PAYMENT_STATUS.CARD_EXPIRE_SOON:
            return {
                title: translate('subscription.billingBanner.cardExpireSoon.title'),
                subtitle: translate('subscription.billingBanner.cardExpireSoon.subtitle'),
                isError: false,
                icon: Illustrations.CreditCardEyes,
            };
        case SubscriptionUtils_1.PAYMENT_STATUS.RETRY_BILLING_SUCCESS:
            return {
                title: translate('subscription.billingBanner.retryBillingSuccess.title'),
                subtitle: translate('subscription.billingBanner.retryBillingSuccess.subtitle'),
                isError: false,
                rightIcon: Expensicons.Close,
            };
        case SubscriptionUtils_1.PAYMENT_STATUS.RETRY_BILLING_ERROR:
            return {
                title: translate('subscription.billingBanner.retryBillingError.title'),
                subtitle: translate('subscription.billingBanner.retryBillingError.subtitle'),
                isError: true,
                isRetryAvailable: false,
            };
        default:
            return undefined;
    }
}
/**
 * Get the next billing date.
 *
 * @returns - The next billing date in 'yyyy-MM-dd' format.
 */
function getNextBillingDate() {
    var today = new Date();
    var nextBillingDate = (0, date_fns_1.startOfMonth)((0, date_fns_1.addMonths)(today, 1));
    return (0, date_fns_1.format)(nextBillingDate, CONST_1.default.DATE.MONTH_DAY_YEAR_FORMAT);
}
exports.default = { getBillingStatus: getBillingStatus, getNextBillingDate: getNextBillingDate };
