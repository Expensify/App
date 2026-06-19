import {useEffect, useState} from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHasTeam2025Pricing from '@hooks/useHasTeam2025Pricing';
import useOnyx from '@hooks/useOnyx';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import {getOwnedPaidPolicies} from '@libs/PolicyUtils';
import type {DiscountInfo} from '@libs/SubscriptionUtils';
import {calculateRemainingFreeTrialDays, doesUserHavePaymentCardAdded, getEarlyDiscountInfo, isUserOnFreeTrial, shouldShowDiscountBanner} from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const DISCOUNT_TYPE = {
    HALF_OFF: 50,
    QUARTER_OFF: 25,
} as const;

type DiscountType = (typeof DISCOUNT_TYPE)[keyof typeof DISCOUNT_TYPE] | null;

function getDiscountType(showDiscount: boolean, discountInfo: DiscountInfo | null): DiscountType {
    if (!showDiscount || !discountInfo) {
        return null;
    }
    return discountInfo.discountType === DISCOUNT_TYPE.HALF_OFF ? DISCOUNT_TYPE.HALF_OFF : DISCOUNT_TYPE.QUARTER_OFF;
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
    const {accountID} = useCurrentUserPersonalDetails();
    const hasTeam2025Pricing = useHasTeam2025Pricing();
    const subscriptionPlan = useSubscriptionPlan();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    const onFreeTrial = isUserOnFreeTrial(firstDayFreeTrial, lastDayFreeTrial);
    const hasPaymentCard = doesUserHavePaymentCardAdded(userBillingFundID);
    const hasOwnedPaidPolicies = getOwnedPaidPolicies(allPolicies, accountID).length > 0;
    const showDiscount = shouldShowDiscountBanner(accountID, hasTeam2025Pricing, subscriptionPlan, firstDayFreeTrial, lastDayFreeTrial, userBillingFundID, allPolicies);
    const daysLeft = calculateRemainingFreeTrialDays(lastDayFreeTrial);

    const [discountInfo, setDiscountInfo] = useState<DiscountInfo | null>(() => (showDiscount ? getEarlyDiscountInfo(firstDayFreeTrial) : null));

    useEffect(() => {
        if (!showDiscount) {
            return;
        }

        const intervalID = setInterval(() => {
            setDiscountInfo(getEarlyDiscountInfo(firstDayFreeTrial));
        }, CONST.MILLISECONDS_PER_SECOND);

        return () => {
            clearInterval(intervalID);
            setDiscountInfo(null);
        };
    }, [firstDayFreeTrial, showDiscount]);

    if (!onFreeTrial || hasPaymentCard || !hasOwnedPaidPolicies) {
        return {shouldShowFreeTrialSection: false, discountType: null, daysLeft: 0, discountInfo: null};
    }

    return {shouldShowFreeTrialSection: true, discountType: getDiscountType(showDiscount, discountInfo), daysLeft, discountInfo};
}

export default useFreeTrial;
export type {DiscountType, FreeTrialState};
