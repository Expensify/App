import {addMonths, format, fromUnixTime, startOfMonth} from 'date-fns';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import DateUtils from '@libs/DateUtils';
import type {Phrase, PhraseParameters} from '@libs/Localize';
import * as SubscriptionUtils from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {AccountData} from '@src/types/onyx/Fund';
import type IconAsset from '@src/types/utils/IconAsset';

type BillingStatusResult = {
    title: string;
    subtitle: string;
    isError: boolean;
    isRetryAvailable?: boolean;
    isAddButtonDark?: boolean;
    isAuthenticationRequired?: boolean;
    icon?: IconAsset;
    rightIcon?: IconAsset;
};

function getBillingStatus(
    translate: <TKey extends TranslationPaths>(phraseKey: TKey, ...phraseParameters: PhraseParameters<Phrase<TKey>>) => string,
    accountData?: AccountData,
): BillingStatusResult | undefined {
    const cardEnding = (accountData?.cardNumber ?? '')?.slice(-4);

    const amountOwed = SubscriptionUtils.getAmountOwed();

    const subscriptionStatus = SubscriptionUtils.getSubscriptionStatus();

    const endDate = SubscriptionUtils.getOverdueGracePeriodDate();

    const endDateFormatted = endDate ? DateUtils.formatWithUTCTimeZone(fromUnixTime(endDate).toUTCString(), CONST.DATE.MONTH_DAY_YEAR_FORMAT) : null;

    const isCurrentCardExpired = DateUtils.isCardExpired(accountData?.cardMonth ?? 0, accountData?.cardYear ?? 0);

    switch (subscriptionStatus?.status) {
        case SubscriptionUtils.PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED:
            return {
                title: translate('subscription.billingBanner.policyOwnerAmountOwed.title'),
                subtitle: translate('subscription.billingBanner.policyOwnerAmountOwed.subtitle', {date: endDateFormatted}),
                isError: true,
                isRetryAvailable: true,
            };

        case SubscriptionUtils.PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE:
            return {
                title: translate('subscription.billingBanner.policyOwnerAmountOwedOverdue.title'),
                subtitle: translate('subscription.billingBanner.policyOwnerAmountOwedOverdue.subtitle'),
                isError: true,
            };

        case SubscriptionUtils.PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING:
            return {
                title: translate('subscription.billingBanner.policyOwnerUnderInvoicing.title'),
                subtitle: translate('subscription.billingBanner.policyOwnerUnderInvoicing.subtitle', {date: endDateFormatted}),
                isError: true,
                isAddButtonDark: true,
            };

        case SubscriptionUtils.PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING_OVERDUE:
            return {
                title: translate('subscription.billingBanner.policyOwnerUnderInvoicingOverdue.title'),
                subtitle: translate('subscription.billingBanner.policyOwnerUnderInvoicingOverdue.subtitle'),
                isError: true,
                isAddButtonDark: true,
            };

        case SubscriptionUtils.PAYMENT_STATUS.BILLING_DISPUTE_PENDING:
            return {
                title: translate('subscription.billingBanner.billingDisputePending.title'),
                subtitle: translate('subscription.billingBanner.billingDisputePending.subtitle', {amountOwed, cardEnding}),
                isError: true,
                isRetryAvailable: false,
            };

        case SubscriptionUtils.PAYMENT_STATUS.CARD_AUTHENTICATION_REQUIRED:
            return {
                title: translate('subscription.billingBanner.cardAuthenticationRequired.title'),
                subtitle: translate('subscription.billingBanner.cardAuthenticationRequired.subtitle', {cardEnding}),
                isError: true,
                isAuthenticationRequired: true,
            };

        case SubscriptionUtils.PAYMENT_STATUS.INSUFFICIENT_FUNDS:
            return {
                title: translate('subscription.billingBanner.insufficientFunds.title'),
                subtitle: translate('subscription.billingBanner.insufficientFunds.subtitle', {amountOwed}),
                isError: true,
                isRetryAvailable: true,
            };

        case SubscriptionUtils.PAYMENT_STATUS.CARD_EXPIRED:
            return {
                title: translate('subscription.billingBanner.cardExpired.title'),
                subtitle: translate('subscription.billingBanner.cardExpired.subtitle', {amountOwed}),
                isError: true,
                isRetryAvailable: !isCurrentCardExpired,
            };

        case SubscriptionUtils.PAYMENT_STATUS.CARD_EXPIRE_SOON:
            return {
                title: translate('subscription.billingBanner.cardExpireSoon.title'),
                subtitle: translate('subscription.billingBanner.cardExpireSoon.subtitle'),
                isError: false,
                icon: Illustrations.CreditCardEyes,
            };

        case SubscriptionUtils.PAYMENT_STATUS.RETRY_BILLING_SUCCESS:
            return {
                title: translate('subscription.billingBanner.retryBillingSuccess.title'),
                subtitle: translate('subscription.billingBanner.retryBillingSuccess.subtitle'),
                isError: false,
                rightIcon: Expensicons.Close,
            };

        case SubscriptionUtils.PAYMENT_STATUS.RETRY_BILLING_ERROR:
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
    shouldShowPreTrialBillingBanner,
    getNextBillingDate,
};
export type {BillingStatusResult};
