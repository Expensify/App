import React from 'react';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import * as SubscriptionUtils from '@libs/SubscriptionUtils';
import BillingBanner from './BillingBanner';

function TrialEndedBillingBanner() {
    const {translate} = useLocalize();

    if (SubscriptionUtils.doesUserHavePaymentCardAdded()) {
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
