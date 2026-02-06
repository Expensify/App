import React from 'react';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {calculateRemainingFreeTrialDays, doesUserHavePaymentCardAdded} from '@libs/SubscriptionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import BillingBanner from './BillingBanner';

function TrialStartedBillingBanner() {
    const {translate} = useLocalize();
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID, {canBeMissing: true});
    const [lastDayFreeTrial] = useOnyx(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, {canBeMissing: true});
    const illustrations = useMemoizedLazyIllustrations(['TreasureChest']);
    const subtitle = !doesUserHavePaymentCardAdded(userBillingFundID) ? translate('subscription.billingBanner.trialStarted.subtitle') : '';
    return (
        <BillingBanner
            title={translate('subscription.billingBanner.trialStarted.title', {numOfDays: calculateRemainingFreeTrialDays(lastDayFreeTrial)})}
            subtitle={subtitle}
            icon={illustrations.TreasureChest}
        />
    );
}

export default TrialStartedBillingBanner;
