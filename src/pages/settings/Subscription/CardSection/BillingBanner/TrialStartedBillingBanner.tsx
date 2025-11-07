import React from 'react';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import * as SubscriptionUtils from '@libs/SubscriptionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import BillingBanner from './BillingBanner';

function TrialStartedBillingBanner() {
    const {translate} = useLocalize();
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID, {canBeMissing: true});

    const subtitle = !SubscriptionUtils.doesUserHavePaymentCardAdded(userBillingFundID) ? translate('subscription.billingBanner.trialStarted.subtitle') : '';

    return (
        <BillingBanner
            title={translate('subscription.billingBanner.trialStarted.title', {numOfDays: SubscriptionUtils.calculateRemainingFreeTrialDays()})}
            subtitle={subtitle}
            icon={Illustrations.TreasureChest}
        />
    );
}

TrialStartedBillingBanner.displayName = 'TrialStartedBillingBanner';

export default TrialStartedBillingBanner;
