import {useOnyx} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import usePreferredCurrency from './usePreferredCurrency';
import useSubscriptionPlan from './useSubscriptionPlan';

function useSubscriptionPrice(upgradePlan?: 'corporate' | 'team' | null): number {
    const preferredCurrency = usePreferredCurrency();
    const currentSubscriptionPlan = useSubscriptionPlan();
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);

    if ((!currentSubscriptionPlan && !upgradePlan) || (currentSubscriptionPlan && !upgradePlan && !privateSubscription?.type)) {
        return 0;
    }

    return CONST.SUBSCRIPTION.PRICES[preferredCurrency][
        currentSubscriptionPlan === CONST.POLICY.TYPE.CORPORATE || upgradePlan === CONST.POLICY.TYPE.CORPORATE ? CONST.POLICY.TYPE.CORPORATE : CONST.POLICY.TYPE.TEAM
    ][privateSubscription?.type ?? CONST.SUBSCRIPTION.TYPE.ANNUAL];
}

export default useSubscriptionPrice;
