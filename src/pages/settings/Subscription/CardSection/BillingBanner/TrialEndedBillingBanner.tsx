import React from 'react';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {doesUserHavePaymentCardAdded} from '@libs/SubscriptionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import BillingBanner from './BillingBanner';

function TrialEndedBillingBanner() {
    const {translate} = useLocalize();
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID, {canBeMissing: true});
    const {asset: Tire} = useMemoizedLazyAsset(() => loadIllustration('Tire' as IllustrationName));
    if (doesUserHavePaymentCardAdded(userBillingFundID)) {
        return null;
    }

    return (
        <BillingBanner
            title={translate('subscription.billingBanner.trialEnded.title')}
            subtitle={translate('subscription.billingBanner.trialEnded.subtitle')}
            icon={Tire}
        />
    );
}

export default TrialEndedBillingBanner;
