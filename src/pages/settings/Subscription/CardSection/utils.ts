import {addMonths, format, fromUnixTime, startOfMonth} from 'date-fns';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import DateUtils from '@libs/DateUtils';
import type {Phrase, PhraseParameters} from '@libs/Localize';
import * as SubscriptionUtils from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {Fund} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';

type BillingStatusResult = {
    title: string;
    subtitle: string;
    isError: boolean;
    isRetryAvailable?: boolean;
    isAddButtonDark?: boolean;
    isAuthenticatingRequired?: boolean;
    icon?: IconAsset;
    rightIcon?: IconAsset;
};

function getBillingStatus(
    translate: <TKey extends TranslationPaths>(phraseKey: TKey, ...phraseParameters: PhraseParameters<Phrase<TKey>>) => string,
    cardEnding: string,
): BillingStatusResult | undefined {
    const amountOwed = SubscriptionUtils.getAmountOwed();

    const status = SubscriptionUtils.getSubscriptionStatus();

    const endDate = SubscriptionUtils.getOverdueGracePeriodDate();

    const endDateFormatted = endDate ? DateUtils.formatWithUTCTimeZone(fromUnixTime(endDate).toUTCString(), CONST.DATE.MONTH_DAY_YEAR_FORMAT) : null;

    switch (status?.status) {
        case SubscriptionUtils.PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED:
            return {
                title: translate('subscription.billingBanner.outdatedInfo'),
                subtitle: translate('subscription.billingBanner.updateCardDataByDate', {date: endDateFormatted}),
                isError: true,
                isRetryAvailable: true,
            };

        case SubscriptionUtils.PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE:
            return {
                title: translate('subscription.billingBanner.outdatedInfo'),
                subtitle: translate('subscription.billingBanner.updatePaymentInformation'),
                isError: true,
            };

        case SubscriptionUtils.PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING:
            return {
                title: translate('subscription.billingBanner.outdatedInfo'),
                subtitle: translate('subscription.billingBanner.paymentPastDuePayByDate', {date: endDateFormatted}),
                isError: true,
                isAddButtonDark: true,
            };

        case SubscriptionUtils.PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING_OVERDUE:
            return {
                title: translate('subscription.billingBanner.outdatedInfo'),
                subtitle: translate('subscription.billingBanner.paymentPastDue'),
                isError: true,
                isAddButtonDark: true,
            };

        case SubscriptionUtils.PAYMENT_STATUS.BILLING_DISPUTE_PENDING:
            return {
                title: translate('subscription.billingBanner.cardCouldNotBeCharged'),
                subtitle: translate('subscription.billingBanner.cardOnDispute', {amountOwed, cardEnding}),
                isError: true,
                isRetryAvailable: false,
            };

        case SubscriptionUtils.PAYMENT_STATUS.CARD_AUTHENTICATION_REQUIRED:
            return {
                title: translate('subscription.billingBanner.cardCouldNotBeCharged'),
                subtitle: translate('subscription.billingBanner.cardNotFullyAuthenticated', {cardEnding}),
                isError: true,
                isAuthenticatingRequired: true,
            };

        case SubscriptionUtils.PAYMENT_STATUS.INSUFFICIENT_FUNDS:
            return {
                title: translate('subscription.billingBanner.cardCouldNotBeCharged'),
                subtitle: translate('subscription.billingBanner.cardDeclinedDueToInsufficientFunds', {amountOwed}),
                isError: true,
                isRetryAvailable: true,
            };

        case SubscriptionUtils.PAYMENT_STATUS.CARD_EXPIRED:
            return {
                title: translate('subscription.billingBanner.cardCouldNotBeCharged'),
                subtitle: translate('subscription.billingBanner.cardExpired', {amountOwed}),
                isError: true,
                isRetryAvailable: true,
            };

        case SubscriptionUtils.PAYMENT_STATUS.CARD_EXPIRE_SOON:
            return {
                title: translate('subscription.billingBanner.cardExpiringSoon'),
                subtitle: translate('subscription.billingBanner.cardWillExpireAtTheEndOfMonth'),
                isError: false,
                icon: Illustrations.CreditCardEyes,
            };

        case SubscriptionUtils.PAYMENT_STATUS.RETRY_BILLING_SUCCESS:
            return {
                title: translate('subscription.billingBanner.succeeded'),
                subtitle: translate('subscription.billingBanner.billedSuccessfully'),
                isError: false,
                rightIcon: Expensicons.Close,
            };

        case SubscriptionUtils.PAYMENT_STATUS.RETRY_BILLING_ERROR:
            return {
                title: translate('subscription.billingBanner.cardCouldNotBeCharged'),
                subtitle: translate('subscription.billingBanner.retryMessage'),
                isError: true,
            };

        default:
            return undefined;
    }
}

function getCardForSubscriptionBilling(): Fund | undefined {
    return SubscriptionUtils.getCardForSubscriptionBilling();
}

/**
 * Get the next billing date.
 *
 * @returns - The next billing date in 'yyyy-MM-dd' format.
 */
function getNextBillingDate(): string {
    const today = new Date();

    const nextBillingDate = startOfMonth(addMonths(today, 1));

    return format(nextBillingDate, CONST.DATE.MONTH_DAY_YEAR_FORMAT);
}

function shouldShowPreTrialBillingBanner(): boolean {
    return !SubscriptionUtils.isUserOnFreeTrial() && !SubscriptionUtils.hasUserFreeTrialEnded();
}

export default {
    getBillingStatus,
    getCardForSubscriptionBilling,
    shouldShowPreTrialBillingBanner,
    getNextBillingDate,
};
export type {BillingStatusResult};
