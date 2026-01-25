import {addMonths, format, fromUnixTime, startOfMonth} from 'date-fns';
import type {OnyxEntry} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import {convertAmountToDisplayString} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import {getAmountOwed, getOverdueGracePeriodDate, getSubscriptionStatus, PAYMENT_STATUS} from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import type {StripeCustomerID} from '@src/types/onyx';
import type BillingStatus from '@src/types/onyx/BillingStatus';
import type {AccountData, FundList} from '@src/types/onyx/Fund';
import type {Purchase} from '@src/types/onyx/PurchaseList';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
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

type GetBillingStatusProps = {
    translate: LocaleContextProps['translate'];
    stripeCustomerId: OnyxEntry<StripeCustomerID>;
    accountData?: AccountData;
    purchase?: Purchase;
    retryBillingSuccessful: OnyxEntry<boolean>;
    billingDisputePending: number | undefined;
    retryBillingFailed: boolean | undefined;
    billingStatus: OnyxEntry<BillingStatus>;
    creditCardEyesIcon?: IconAsset;
    closeIcon?: IconAsset;
    fundList: OnyxEntry<FundList>;
};

function getBillingStatus({
    translate,
    stripeCustomerId,
    accountData,
    purchase,
    retryBillingSuccessful,
    billingDisputePending,
    retryBillingFailed,
    billingStatus,
    creditCardEyesIcon,
    closeIcon,
    fundList,
}: GetBillingStatusProps): BillingStatusResult | undefined {
    const cardEnding = (accountData?.cardNumber ?? '')?.slice(-4);

    const amountOwed = getAmountOwed();

    const subscriptionStatus = getSubscriptionStatus(stripeCustomerId, retryBillingSuccessful, billingDisputePending, retryBillingFailed, fundList, billingStatus);

    const endDate = getOverdueGracePeriodDate();

    const endDateFormatted = endDate ? DateUtils.formatWithUTCTimeZone(fromUnixTime(endDate).toUTCString(), CONST.DATE.MONTH_DAY_YEAR_FORMAT) : null;

    const isCurrentCardExpired = DateUtils.isCardExpired(accountData?.cardMonth ?? 0, accountData?.cardYear ?? 0);

    const purchaseAmount = purchase?.message.billableAmount;
    const purchaseCurrency = purchase?.currency;
    const purchaseDate = purchase?.created;
    const isBillingFailed = purchase?.message.billingType === CONST.BILLING.TYPE_FAILED_2018;
    const purchaseDateFormatted = purchaseDate ? DateUtils.formatWithUTCTimeZone(purchaseDate, CONST.DATE.MONTH_DAY_YEAR_FORMAT) : undefined;
    const purchaseAmountWithCurrency = convertAmountToDisplayString(purchaseAmount, purchaseCurrency);

    switch (subscriptionStatus?.status) {
        case PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED:
            return {
                title: translate('subscription.billingBanner.policyOwnerAmountOwed.title'),
                subtitle: translate('subscription.billingBanner.policyOwnerAmountOwed.subtitle', endDateFormatted ?? ''),
                isError: true,
                isRetryAvailable: true,
            };

        case PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE:
            return {
                title: translate('subscription.billingBanner.policyOwnerAmountOwedOverdue.title'),
                subtitle: translate(
                    'subscription.billingBanner.policyOwnerAmountOwedOverdue.subtitle',
                    isBillingFailed ? purchaseDateFormatted : undefined,
                    isBillingFailed ? purchaseAmountWithCurrency : undefined,
                ),
                isError: true,
                isRetryAvailable: !isEmptyObject(accountData) ? true : undefined,
            };

        case PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING:
            return {
                title: translate('subscription.billingBanner.policyOwnerUnderInvoicing.title'),
                subtitle: translate('subscription.billingBanner.policyOwnerUnderInvoicing.subtitle', endDateFormatted ?? ''),
                isError: true,
                isAddButtonDark: true,
            };

        case PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING_OVERDUE:
            return {
                title: translate('subscription.billingBanner.policyOwnerUnderInvoicingOverdue.title'),
                subtitle: translate('subscription.billingBanner.policyOwnerUnderInvoicingOverdue.subtitle'),
                isError: true,
                isAddButtonDark: true,
            };

        case PAYMENT_STATUS.BILLING_DISPUTE_PENDING:
            return {
                title: translate('subscription.billingBanner.billingDisputePending.title'),
                subtitle: translate('subscription.billingBanner.billingDisputePending.subtitle', amountOwed, cardEnding),
                isError: true,
                isRetryAvailable: false,
            };

        case PAYMENT_STATUS.CARD_AUTHENTICATION_REQUIRED:
            return {
                title: translate('subscription.billingBanner.cardAuthenticationRequired.title'),
                subtitle: translate('subscription.billingBanner.cardAuthenticationRequired.subtitle', cardEnding),
                isError: true,
                isAuthenticationRequired: true,
            };

        case PAYMENT_STATUS.INSUFFICIENT_FUNDS:
            return {
                title: translate('subscription.billingBanner.insufficientFunds.title'),
                subtitle: translate('subscription.billingBanner.insufficientFunds.subtitle', amountOwed),
                isError: true,
                isRetryAvailable: true,
            };

        case PAYMENT_STATUS.CARD_EXPIRED:
            return {
                title: translate('subscription.billingBanner.cardExpired.title'),
                subtitle: translate('subscription.billingBanner.cardExpired.subtitle', amountOwed),
                isError: true,
                isRetryAvailable: !isCurrentCardExpired,
            };

        case PAYMENT_STATUS.CARD_EXPIRE_SOON:
            return {
                title: translate('subscription.billingBanner.cardExpireSoon.title'),
                subtitle: translate('subscription.billingBanner.cardExpireSoon.subtitle'),
                isError: false,
                icon: creditCardEyesIcon,
            };

        case PAYMENT_STATUS.RETRY_BILLING_SUCCESS:
            return {
                title: translate('subscription.billingBanner.retryBillingSuccess.title'),
                subtitle: translate('subscription.billingBanner.retryBillingSuccess.subtitle'),
                isError: false,
                rightIcon: closeIcon,
            };

        case PAYMENT_STATUS.RETRY_BILLING_ERROR:
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

export default {getBillingStatus, getNextBillingDate};
export type {BillingStatusResult};
