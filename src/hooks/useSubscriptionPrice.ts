import {useOnyx} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useIsNewSubscription from './useIsNewSubscription';
import usePreferredCurrency from './usePreferredCurrency';
import useSubscriptionPlan from './useSubscriptionPlan';

function useSubscriptionPrice(): number {
    const preferredCurrency = usePreferredCurrency();
    const subscriptionPlan = useSubscriptionPlan();
    const isNewSubscription = useIsNewSubscription();
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);
    let subscriptionType = privateSubscription?.type;

    if (!subscriptionPlan || !subscriptionType) {
        return 0;
    }

    if (subscriptionType === CONST.SUBSCRIPTION.TYPE.PAYPERUSE && isNewSubscription) {
        subscriptionType = CONST.SUBSCRIPTION.TYPE.PAYPERUSE_2025;
    }

    return CONST.SUBSCRIPTION_PRICES[preferredCurrency][subscriptionPlan][subscriptionType];
}

export default useSubscriptionPrice;
