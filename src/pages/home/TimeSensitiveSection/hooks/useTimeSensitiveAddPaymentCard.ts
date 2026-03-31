import {isFromInternalDomainSelector} from '@selectors/Account';
import useHasTeam2025Pricing from '@hooks/useHasTeam2025Pricing';
import useOnyx from '@hooks/useOnyx';
import {shouldShowTrialEndedUI} from '@libs/SubscriptionUtils';
import ONYXKEYS from '@src/ONYXKEYS';

function useTimeSensitiveAddPaymentCard() {
    const [lastDayFreeTrial] = useOnyx(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL);
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID);
    const hasTeam2025Pricing = useHasTeam2025Pricing();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [isGrandfatheredFree] = useOnyx(ONYXKEYS.NVP_PRIVATE_GRANDFATHERED_FREE);
    const [isFromInternalDomain] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isFromInternalDomainSelector});
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);

    // Show add payment card for users whose trial ended and haven't added a payment card
    const shouldShowAddPaymentCard =
        hasTeam2025Pricing && shouldShowTrialEndedUI(lastDayFreeTrial, userBillingFundID, allPolicies, isGrandfatheredFree, isFromInternalDomain, privateSubscription?.type);

    return {
        shouldShowAddPaymentCard,
    };
}

export default useTimeSensitiveAddPaymentCard;
