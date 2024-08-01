import {useOnyx} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import usePreferredCurrency from './usePreferredCurrency';
import useSubscriptionPlan from './useSubscriptionPlan';

const SUBSCRIPTION_PRICES = {
    [CONST.PAYMENT_CARD_CURRENCY.USD]: {
        [CONST.POLICY.TYPE.CORPORATE]: {
            [CONST.SUBSCRIPTION.TYPE.ANNUAL]: 900,
            [CONST.SUBSCRIPTION.TYPE.PAYPERUSE]: 1800,
        },
        [CONST.POLICY.TYPE.TEAM]: {
            [CONST.SUBSCRIPTION.TYPE.ANNUAL]: 500,
            [CONST.SUBSCRIPTION.TYPE.PAYPERUSE]: 1000,
        },
    },
    [CONST.PAYMENT_CARD_CURRENCY.AUD]: {
        [CONST.POLICY.TYPE.CORPORATE]: {
            [CONST.SUBSCRIPTION.TYPE.ANNUAL]: 1500,
            [CONST.SUBSCRIPTION.TYPE.PAYPERUSE]: 3000,
        },
        [CONST.POLICY.TYPE.TEAM]: {
            [CONST.SUBSCRIPTION.TYPE.ANNUAL]: 700,
            [CONST.SUBSCRIPTION.TYPE.PAYPERUSE]: 1400,
        },
    },
    [CONST.PAYMENT_CARD_CURRENCY.GBP]: {
        [CONST.POLICY.TYPE.CORPORATE]: {
            [CONST.SUBSCRIPTION.TYPE.ANNUAL]: 700,
            [CONST.SUBSCRIPTION.TYPE.PAYPERUSE]: 1400,
        },
        [CONST.POLICY.TYPE.TEAM]: {
            [CONST.SUBSCRIPTION.TYPE.ANNUAL]: 400,
            [CONST.SUBSCRIPTION.TYPE.PAYPERUSE]: 800,
        },
    },
    [CONST.PAYMENT_CARD_CURRENCY.NZD]: {
        [CONST.POLICY.TYPE.CORPORATE]: {
            [CONST.SUBSCRIPTION.TYPE.ANNUAL]: 1600,
            [CONST.SUBSCRIPTION.TYPE.PAYPERUSE]: 3200,
        },
        [CONST.POLICY.TYPE.TEAM]: {
            [CONST.SUBSCRIPTION.TYPE.ANNUAL]: 800,
            [CONST.SUBSCRIPTION.TYPE.PAYPERUSE]: 1600,
        },
    },
} as const;

function useSubscriptionPrice(): number {
    const preferredCurrency = usePreferredCurrency();
    const subscriptionPlan = useSubscriptionPlan();
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);

    if (!subscriptionPlan || !privateSubscription?.type) {
        return 0;
    }

    return SUBSCRIPTION_PRICES[preferredCurrency][subscriptionPlan][privateSubscription.type];
}

export default useSubscriptionPrice;
