import useHasTeam2025Pricing from '@hooks/useHasTeam2025Pricing';
import useOnyx from '@hooks/useOnyx';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import {getEarlyDiscountInfo, shouldShowDiscountBanner} from '@libs/SubscriptionUtils';
import ONYXKEYS from '@src/ONYXKEYS';

function useTimeSensitiveOffers() {
    const [firstDayFreeTrial] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, {canBeMissing: true});
    const [lastDayFreeTrial] = useOnyx(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, {canBeMissing: true});
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID, {canBeMissing: true});
    const hasTeam2025Pricing = useHasTeam2025Pricing();
    const subscriptionPlan = useSubscriptionPlan();

    // Use the same logic as the subscription page to determine if discount banner should be shown
    const shouldShowDiscount = shouldShowDiscountBanner(hasTeam2025Pricing, subscriptionPlan, firstDayFreeTrial, lastDayFreeTrial, userBillingFundID);
    const discountInfo = getEarlyDiscountInfo(firstDayFreeTrial);

    // Determine which offer to show based on discount type (they are mutually exclusive)
    const shouldShow50off = shouldShowDiscount && discountInfo?.discountType === 50;
    const shouldShow25off = shouldShowDiscount && discountInfo?.discountType === 25;

    return {
        shouldShow50off,
        shouldShow25off,
        firstDayFreeTrial,
        discountInfo,
    };
}

export default useTimeSensitiveOffers;
