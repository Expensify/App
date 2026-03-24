import useOnyx from '@hooks/useOnyx';
import {hasCardExpiredError, hasInsufficientFundsError} from '@libs/SubscriptionUtils';
import ONYXKEYS from '@src/ONYXKEYS';

function useTimeSensitiveBilling() {
    const [billingStatus] = useOnyx(ONYXKEYS.NVP_PRIVATE_BILLING_STATUS);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);

    const hasBillingError = !!amountOwed && (hasCardExpiredError(billingStatus, amountOwed) || hasInsufficientFundsError(billingStatus, amountOwed));
    const shouldShowFixFailedBilling = hasBillingError && account?.hasPurchases === true;

    return {
        shouldShowFixFailedBilling,
    };
}

export default useTimeSensitiveBilling;
