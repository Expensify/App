/** Displays the billing owner's early renewal offer above their payment details. */
import Button from '@components/Button';

import useEarlyRenewalConfirmation from '@hooks/useEarlyRenewalConfirmation';
import useEarlyRenewalPeriod from '@hooks/useEarlyRenewalPeriod';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
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
    const illustrations = useMemoizedLazyIllustrations(['MoneyBadge']);

    if (eligibilityMetadata.status !== 'loaded' || !eligibility?.canClaim || !isNonIncentivizedPeriod) {
        return fallback;
    }

    const copy = CONST.SUBSCRIPTION.EARLY_RENEWAL.COPY.BILLING_OWNER;

    return (
        <BillingBanner
            title={copy.HOME_TITLE}
            subtitle={copy.HOME_SUBTITLE}
            icon={illustrations.MoneyBadge}
            rightComponent={
                <Button
                    isDisabled={isOffline}
                    onPress={showEarlyRenewalConfirmation}
                    size={CONST.BUTTON_SIZE.SMALL}
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                >
                    <Button.Text>{copy.CTA}</Button.Text>
                </Button>
            }
        />
    );
}

export default EarlyRenewalBillingBanner;
