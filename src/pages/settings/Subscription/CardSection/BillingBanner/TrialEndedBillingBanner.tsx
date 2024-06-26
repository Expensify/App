import React from 'react';
import * as Illustrations from '@components/Icon/Illustrations';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import BillingBanner from './BillingBanner';

function TrialEndedBillingBanner() {
    const {translate} = useLocalize();

    return (
        <BillingBanner
            title={translate('subscription.billingBanner.trialEnded.title')}
            subtitle={<Text>{translate('subscription.billingBanner.trialEnded.subtitle')}</Text>}
            icon={Illustrations.Tire}
        />
    );
}

TrialEndedBillingBanner.displayName = 'TrialEndedBillingBanner';

export default TrialEndedBillingBanner;
