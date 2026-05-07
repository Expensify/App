import {useEffect, useMemo, useState} from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHasTeam2025Pricing from '@hooks/useHasTeam2025Pricing';
import useOnyx from '@hooks/useOnyx';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import type {DiscountInfo} from '@libs/SubscriptionUtils';
import {getEarlyDiscountInfo, shouldShowDiscountBanner} from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const EARLY_DISCOUNT_HALF_OFF = 50;

type TimeSensitiveEarlyDiscountState = {
    shouldShowEarlyDiscount: boolean;
    discountInfo: DiscountInfo | null;
};

function useTimeSensitiveEarlyDiscount(): TimeSensitiveEarlyDiscountState {
    const [firstDayFreeTrial] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL);
    const [lastDayFreeTrial] = useOnyx(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL);
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const {accountID} = useCurrentUserPersonalDetails();
    const hasTeam2025Pricing = useHasTeam2025Pricing();
    const subscriptionPlan = useSubscriptionPlan();

    const isEligibleForDiscount = shouldShowDiscountBanner(accountID, hasTeam2025Pricing, subscriptionPlan, firstDayFreeTrial, lastDayFreeTrial, userBillingFundID, allPolicies);

    const [tick, setTick] = useState(0);

    // Tick once per second so the countdown stays in sync with wall-clock time
    // while the user is viewing the Home page.
    useEffect(() => {
        if (!isEligibleForDiscount) {
            return;
        }
        const intervalID = setInterval(() => setTick((previousTick) => previousTick + 1), CONST.MILLISECONDS_PER_SECOND);

        return () => clearInterval(intervalID);
    }, [isEligibleForDiscount]);

    const discountInfo = useMemo(() => {
        if (!isEligibleForDiscount) {
            return null;
        }
        // Keep tick in-use so this memo recomputes once per second.
        const currentTick = tick;
        return currentTick >= 0 ? getEarlyDiscountInfo(firstDayFreeTrial) : null;
    }, [firstDayFreeTrial, isEligibleForDiscount, tick]);

    const shouldShowEarlyDiscount = isEligibleForDiscount && discountInfo?.discountType === EARLY_DISCOUNT_HALF_OFF;

    return {
        shouldShowEarlyDiscount,
        discountInfo: shouldShowEarlyDiscount ? discountInfo : null,
    };
}

export default useTimeSensitiveEarlyDiscount;
export type {TimeSensitiveEarlyDiscountState};
