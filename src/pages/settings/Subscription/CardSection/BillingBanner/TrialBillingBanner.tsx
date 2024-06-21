import React from 'react';
import * as Illustrations from '@components/Icon/Illustrations';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import * as SubscriptionUtils from '@libs/SubscriptionUtils';
import BillingBanner from './BillingBanner';

function TrialBillingBanner() {
    const {translate} = useLocalize();

    return (
        <BillingBanner
            title={translate('subscription.billingBanner.trial.title', {numOfDays: SubscriptionUtils.calculateRemainingFreeTrialDays()})}
            subtitle={<Text>{translate('subscription.billingBanner.trial.subtitle')}</Text>}
            icon={Illustrations.TreasureChest}
        />
    );
}

TrialBillingBanner.displayName = 'PreTrialBillingBanner';

export default TrialBillingBanner;
