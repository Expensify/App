import CONST from '@src/CONST';
import usePreferredCurrency from './usePreferredCurrency';
import usePrivateSubscription from './usePrivateSubscription';
import useSubscriptionPlan from './useSubscriptionPlan';

const POSSIBLE_COST_SAVINGS = {
    [CONST.PAYMENT_CARD_CURRENCY.USD]: {
        [CONST.POLICY.TYPE.TEAM]: 1000,
        [CONST.POLICY.TYPE.CORPORATE]: 1800,
    },
    [CONST.PAYMENT_CARD_CURRENCY.AUD]: {
        [CONST.POLICY.TYPE.TEAM]: 1400,
        [CONST.POLICY.TYPE.CORPORATE]: 3000,
    },
    [CONST.PAYMENT_CARD_CURRENCY.GBP]: {
        [CONST.POLICY.TYPE.TEAM]: 800,
        [CONST.POLICY.TYPE.CORPORATE]: 1400,
    },
    [CONST.PAYMENT_CARD_CURRENCY.NZD]: {
        [CONST.POLICY.TYPE.TEAM]: 1600,
        [CONST.POLICY.TYPE.CORPORATE]: 3200,
    },
    [CONST.PAYMENT_CARD_CURRENCY.EUR]: {
        [CONST.POLICY.TYPE.TEAM]: 1000,
        [CONST.POLICY.TYPE.CORPORATE]: 1600,
    },
} as const;

function useSubscriptionPossibleCostSavings(): number {
    const preferredCurrency = usePreferredCurrency();
    const subscriptionPlan = useSubscriptionPlan();
    const privateSubscription = usePrivateSubscription();

    if (!subscriptionPlan || !privateSubscription?.type) {
        return 0;
    }

    return POSSIBLE_COST_SAVINGS[preferredCurrency][subscriptionPlan];
}

export default useSubscriptionPossibleCostSavings;
