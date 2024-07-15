import React from 'react';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import BillingBanner from './BillingBanner';

function TrialEndedBillingBanner() {
    const {translate} = useLocalize();

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
