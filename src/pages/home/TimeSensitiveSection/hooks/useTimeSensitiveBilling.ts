import useOnyx from '@hooks/useOnyx';
import {hasCardExpiredError, hasInsufficientFundsError} from '@libs/SubscriptionUtils';
import ONYXKEYS from '@src/ONYXKEYS';

function useTimeSensitiveBilling() {
    const [billingStatus] = useOnyx(ONYXKEYS.NVP_PRIVATE_BILLING_STATUS);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);

    const hasBillingError = hasCardExpiredError(billingStatus) || hasInsufficientFundsError(billingStatus);
    const shouldShowFixFailedBilling = hasBillingError && account?.hasPurchases === true;

    return {
        shouldShowFixFailedBilling,
    };
}

export default useTimeSensitiveBilling;
