import DateUtils from '@libs/DateUtils';
import type {Phrase, PhraseParameters} from '@libs/Localize';
import SubscriptionUtils from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {Fund} from '@src/types/onyx';
import type Locale from '@src/types/onyx/Locale';

type BillingStatusResult = {
    title?: string;
    subtitle?: string;
    isError?: boolean;
    shouldShowRedDotIndicator?: boolean;
    shouldShowGreenDotIndicator?: boolean;
    isTrialActive?: boolean;
    isRetryAvailable?: boolean;
    isAddButtonDark?: boolean;
    isAuthenticatingRequired?: boolean;
};

function getBillingStatus(
    translate: <TKey extends TranslationPaths>(phraseKey: TKey, ...phraseParameters: PhraseParameters<Phrase<TKey>>) => string,
    locale: Locale,
    cardEnding: string,
): BillingStatusResult {
    const amountOwed = SubscriptionUtils.getAmountOwed();

    const status = SubscriptionUtils.getSubscriptionStatus();

    const endDate = SubscriptionUtils.getOverdueGracePeriodDate();

    const endDateFormatted = DateUtils.formatWithUTCTimeZone(endDate, CONST.DATE.MONTH_DAY_YEAR_FORMAT);

    switch (status.status) {
        case SubscriptionUtils.PAYMENT_STATUSES.POLICY_OWNER_WITH_AMOUNT_OWED:
            return {
                title: translate('subscription.billingBanner.outdatedInfo'),
                subtitle: translate('subscription.billingBanner.updateCardDataByDate', {date: endDateFormatted}),
                isError: true,
                shouldShowRedDotIndicator: status.shouldShowRedDotIndicator,
                isRetryAvailable: true,
            };

        case SubscriptionUtils.PAYMENT_STATUSES.POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE:
            return {
                title: translate('subscription.billingBanner.outdatedInfo'),
                subtitle: translate('subscription.billingBanner.updatePaymentInformation'),
                isError: true,
                shouldShowRedDotIndicator: status.shouldShowRedDotIndicator,
            };

        case SubscriptionUtils.PAYMENT_STATUSES.OWNER_OF_POLICY_UNDER_INVOICING:
            return {
                title: translate('subscription.billingBanner.outdatedInfo'),
                subtitle: translate('subscription.billingBanner.paymentPastDuePayByDate', {date: endDateFormatted}),
                isError: true,
                shouldShowRedDotIndicator: status.shouldShowRedDotIndicator,
                isAddButtonDark: true,
            };

        case SubscriptionUtils.PAYMENT_STATUSES.OWNER_OF_POLICY_UNDER_INVOICING_OVERDUE:
            return {
                title: translate('subscription.billingBanner.outdatedInfo'),
                subtitle: translate('subscription.billingBanner.paymentPastDue'),
                isError: true,
                shouldShowRedDotIndicator: status.shouldShowRedDotIndicator,
                isAddButtonDark: true,
            };

        case SubscriptionUtils.PAYMENT_STATUSES.BILLING_DISPUTE_PENDING:
            return {
                title: translate('subscription.billingBanner.cardCouldNotBeCharged'),
                subtitle: translate('subscription.billingBanner.cardOnDispute', {amountOwed, cardEnding}),
                isError: true,
                shouldShowRedDotIndicator: status.shouldShowRedDotIndicator,
                isRetryAvailable: false,
            };

        case SubscriptionUtils.PAYMENT_STATUSES.CARD_AUTHENTICATION_REQUIRED:
            return {
                title: translate('subscription.billingBanner.cardCouldNotBeCharged'),
                subtitle: translate('subscription.billingBanner.cardNotFullyAuthenticated', {cardEnding}),
                isError: true,
                shouldShowRedDotIndicator: status.shouldShowRedDotIndicator,
                isAuthenticatingRequired: true,
            };

        case SubscriptionUtils.PAYMENT_STATUSES.INSUFFICIENT_FUNDS:
            return {
                title: translate('subscription.billingBanner.cardCouldNotBeCharged'),
                subtitle: translate('subscription.billingBanner.cardDeclinedDueToInsufficientFunds', {amountOwed}),
                isError: true,
                shouldShowRedDotIndicator: status.shouldShowRedDotIndicator,
                isRetryAvailable: true,
            };

        case SubscriptionUtils.PAYMENT_STATUSES.CARD_EXPIRED:
            return {
                title: translate('subscription.billingBanner.cardCouldNotBeCharged'),
                subtitle: translate('subscription.billingBanner.cardExpired', {amountOwed}),
                isError: true,
                shouldShowRedDotIndicator: status.shouldShowRedDotIndicator,
                isRetryAvailable: true,
            };

        case SubscriptionUtils.PAYMENT_STATUSES.CARD_EXPIRE_SOON:
            return {
                title: translate('subscription.billingBanner.cardExpiringSoon'),
                subtitle: translate('subscription.billingBanner.cardWillExpireAtTheEndOfMonth'),
                isError: false,
                shouldShowGreenDotIndicator: status.shouldShowGreenDotIndicator,
            };

        case SubscriptionUtils.PAYMENT_STATUSES.RETRY_BILLING_SUCCESS:
            return {
                title: translate('subscription.billingBanner.succeeded'),
                subtitle: translate('subscription.billingBanner.billedSuccessfully'),
                isError: false,
                shouldShowRedDotIndicator: status.shouldShowRedDotIndicator,
            };

        case SubscriptionUtils.PAYMENT_STATUSES.GENERIC_API_ERROR:
            return {
                title: translate('subscription.billingBanner.succeeded'),
                subtitle: translate('subscription.billingBanner.billedSuccessfully'),
                isError: false,
                shouldShowRedDotIndicator: status.shouldShowRedDotIndicator,
            };

        default:
            break;
    }

    return {};
}

function getCardForSubscriptionBilling(): Fund | undefined {
    return SubscriptionUtils.getCardForSubscriptionBilling();
}

export default {
    getBillingStatus,
    getCardForSubscriptionBilling,
};
