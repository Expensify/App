/** Displays the billing owner's early renewal offer above their payment details. */
import Button from '@components/Button';

import useEarlyRenewalConfirmation from '@hooks/useEarlyRenewalConfirmation';
import useEarlyRenewalPeriod from '@hooks/useEarlyRenewalPeriod';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import BillingBanner from '@pages/settings/Subscription/CardSection/BillingBanner/BillingBanner';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import type EarlyRenewalBillingBannerProps from './types';

function EarlyRenewalBillingBanner({fallback}: EarlyRenewalBillingBannerProps) {
    const [eligibility, eligibilityMetadata] = useOnyx(ONYXKEYS.EARLY_RENEWAL_OFFER_ELIGIBILITY);
    const {isNonIncentivizedPeriod} = useEarlyRenewalPeriod();
    const showEarlyRenewalConfirmation = useEarlyRenewalConfirmation();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['MoneyBadge']);

    if (eligibilityMetadata.status !== 'loaded' || !eligibility?.canClaim || !isNonIncentivizedPeriod) {
        return fallback;
    }

    return (
        <BillingBanner
            title={translate('earlyRenewal.title')}
            subtitle={translate('earlyRenewal.subtitle')}
            icon={illustrations.MoneyBadge}
            rightComponent={
                <Button
                    isDisabled={isOffline}
                    onPress={showEarlyRenewalConfirmation}
                    size={CONST.BUTTON_SIZE.SMALL}
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                >
                    <Button.Text>{translate('earlyRenewal.renew')}</Button.Text>
                </Button>
            }
        />
    );
}

export default EarlyRenewalBillingBanner;
