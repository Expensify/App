import React from 'react';
import * as Illustrations from '@components/Icon/Illustrations';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import * as SubscriptionUtils from '@libs/SubscriptionUtils';
import BillingBanner from './BillingBanner';

function TrialStartedBillingBanner() {
    const {translate} = useLocalize();

    return (
        <BillingBanner
            title={translate('subscription.billingBanner.trialStarted.title', {numOfDays: SubscriptionUtils.calculateRemainingFreeTrialDays()})}
            subtitle={<Text>{translate('subscription.billingBanner.trialStarted.subtitle')}</Text>}
            icon={Illustrations.TreasureChest}
        />
    );
}

TrialStartedBillingBanner.displayName = 'TrialStartedBillingBanner';

export default TrialStartedBillingBanner;
