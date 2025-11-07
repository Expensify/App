import React from 'react';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import * as SubscriptionUtils from '@libs/SubscriptionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import BillingBanner from './BillingBanner';

function TrialEndedBillingBanner() {
    const {translate} = useLocalize();
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID, {canBeMissing: true});

    if (SubscriptionUtils.doesUserHavePaymentCardAdded(userBillingFundID)) {
        return null;
    }

    return (
        <BillingBanner
            title={translate('subscription.billingBanner.trialEnded.title')}
            subtitle={translate('subscription.billingBanner.trialEnded.subtitle')}
            icon={Illustrations.Tire}
        />
    );
}

TrialEndedBillingBanner.displayName = 'TrialEndedBillingBanner';

export default TrialEndedBillingBanner;
