import {useEffect, useState} from 'react';
import useHasTeam2025Pricing from '@hooks/useHasTeam2025Pricing';
import useOnyx from '@hooks/useOnyx';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import type {DiscountInfo} from '@libs/SubscriptionUtils';
import {calculateRemainingFreeTrialDays, doesUserHavePaymentCardAdded, getEarlyDiscountInfo, isUserOnFreeTrial, shouldShowDiscountBanner} from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type DiscountType = 50 | 25 | null;

function getDiscountType(showDiscount: boolean, discountInfo: DiscountInfo | null): DiscountType {
    if (!showDiscount || !discountInfo) {
        return null;
    }
    return discountInfo.discountType === 50 ? 50 : 25;
}

type FreeTrialState = {
    shouldShowFreeTrialSection: boolean;
    discountType: DiscountType;
    daysLeft: number;
    discountInfo: DiscountInfo | null;
};

function useFreeTrial(): FreeTrialState {
    const [firstDayFreeTrial] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL);
    const [lastDayFreeTrial] = useOnyx(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL);
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID);
    const hasTeam2025Pricing = useHasTeam2025Pricing();
    const subscriptionPlan = useSubscriptionPlan();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    const onFreeTrial = isUserOnFreeTrial(firstDayFreeTrial, lastDayFreeTrial);
    const hasPaymentCard = doesUserHavePaymentCardAdded(userBillingFundID);
    const showDiscount = shouldShowDiscountBanner(hasTeam2025Pricing, subscriptionPlan, firstDayFreeTrial, lastDayFreeTrial, userBillingFundID, allPolicies);
    const daysLeft = calculateRemainingFreeTrialDays(lastDayFreeTrial);

    // Live countdown — same pattern as Offer50off
    const [discountInfo, setDiscountInfo] = useState<DiscountInfo | null>(() => getEarlyDiscountInfo(firstDayFreeTrial));

    useEffect(() => {
        const intervalID = setInterval(() => {
            setDiscountInfo(getEarlyDiscountInfo(firstDayFreeTrial));
        }, CONST.MILLISECONDS_PER_SECOND);

        return () => clearInterval(intervalID);
    }, [firstDayFreeTrial]);

    if (!onFreeTrial || hasPaymentCard) {
        return {shouldShowFreeTrialSection: false, discountType: null, daysLeft: 0, discountInfo: null};
    }

    return {shouldShowFreeTrialSection: true, discountType: getDiscountType(showDiscount, discountInfo), daysLeft, discountInfo};
}

export default useFreeTrial;
export type {DiscountType, FreeTrialState};
