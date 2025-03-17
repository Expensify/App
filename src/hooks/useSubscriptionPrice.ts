import {useOnyx} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import usePreferredCurrency from './usePreferredCurrency';
import useSubscriptionPlan from './useSubscriptionPlan';

function useSubscriptionPrice(): number {
    const preferredCurrency = usePreferredCurrency();
    const subscriptionPlan = useSubscriptionPlan();
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);

    if (!subscriptionPlan || !privateSubscription?.type) {
        return 0;
    }

    return CONST.SUBSCRIPTION_PRICES[preferredCurrency][subscriptionPlan][privateSubscription.type];
}

export default useSubscriptionPrice;
