/** The billing owner's early renewal offer, shown above their payment details when CardSection finds them eligible. */
import Button from '@components/Button';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useEarlyRenewalConfirmation from '@hooks/useEarlyRenewalConfirmation';
import useEarlyRenewalPeriod from '@hooks/useEarlyRenewalPeriod';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearEarlyRenewalOfferErrors} from '@libs/actions/EarlyRenewalOffer';

import BillingBanner from '@pages/settings/Subscription/CardSection/BillingBanner/BillingBanner';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

function EarlyRenewalBillingBanner() {
    const [eligibility] = useOnyx(ONYXKEYS.EARLY_RENEWAL_OFFER_ELIGIBILITY);
    const {isIncentivizedPeriod} = useEarlyRenewalPeriod();
    const showEarlyRenewalConfirmation = useEarlyRenewalConfirmation();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['MoneyBadge']);

    return (
        <OfflineWithFeedback
            errors={eligibility?.errors}
            onClose={clearEarlyRenewalOfferErrors}
            style={styles.w100}
            errorRowStyles={[styles.ph5, styles.pb4]}
        >
            <BillingBanner
                title={isIncentivizedPeriod ? translate('earlyRenewal.incentivizedTitle') : translate('earlyRenewal.title')}
                subtitle={isIncentivizedPeriod ? translate('earlyRenewal.incentivizedSubtitle') : translate('earlyRenewal.subtitle')}
                icon={illustrations.MoneyBadge}
                rightComponent={
                    <Button
                        isDisabled={isOffline}
                        isLoading={!!eligibility?.pendingAction}
                        onPress={showEarlyRenewalConfirmation}
                        size={CONST.BUTTON_SIZE.SMALL}
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                    >
                        <Button.Text>{isIncentivizedPeriod ? translate('earlyRenewal.claim') : translate('earlyRenewal.renew')}</Button.Text>
                    </Button>
                }
            />
        </OfflineWithFeedback>
    );
}

export default EarlyRenewalBillingBanner;
