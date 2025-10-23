import CONST from '@src/CONST';
import useHasTeam2025Pricing from './useHasTeam2025Pricing';
import usePreferredCurrency from './usePreferredCurrency';
import usePrivateSubscription from './usePrivateSubscription';
import useSubscriptionPlan from './useSubscriptionPlan';

function useSubscriptionPrice(): number {
    const preferredCurrency = usePreferredCurrency();
    const subscriptionPlan = useSubscriptionPlan();
    const hasTeam2025Pricing = useHasTeam2025Pricing();
    const privateSubscription = usePrivateSubscription();
    const subscriptionType = privateSubscription?.type;

    if (!subscriptionPlan || !subscriptionType) {
        return 0;
    }

    if (hasTeam2025Pricing && subscriptionPlan === CONST.POLICY.TYPE.TEAM) {
        return CONST.SUBSCRIPTION_PRICES[preferredCurrency][subscriptionPlan][CONST.SUBSCRIPTION.PRICING_TYPE_2025];
    }

    return CONST.SUBSCRIPTION_PRICES[preferredCurrency][subscriptionPlan][subscriptionType];
}

export default useSubscriptionPrice;
