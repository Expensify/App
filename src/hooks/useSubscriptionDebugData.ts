import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

function useSubscriptionDebugData() {
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const [privateAmountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [firstDayFreeTrial] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL);
    const [lastDayFreeTrial] = useOnyx(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL);
    const [billingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [billingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID);
    const [billingCard] = useOnyx(ONYXKEYS.FUND_LIST, {selector: (fundList) => Object.values(fundList ?? {}).find((card) => card.accountData?.additionalData?.isBillingCard)});
    const [billingStatus] = useOnyx(ONYXKEYS.NVP_PRIVATE_BILLING_STATUS);
    const [stripeCustomerID] = useOnyx(ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID);
    const [billingDisputePending] = useOnyx(ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING);
    const [billingRetryStatusSuccessful] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL);
    const [billingRetryStatusFailed] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED);

    return {
        privateSubscription,
        onboarding,
        privateAmountOwed,
        firstDayFreeTrial,
        lastDayFreeTrial,
        billingGracePeriodEnd,
        billingFundID,
        billingCard,
        billingStatus,
        billingDisputePending,
        billingRetryStatusSuccessful,
        billingRetryStatusFailed,
        stripeCustomerID,
    };
}

export default useSubscriptionDebugData;
