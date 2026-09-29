import Button from '@components/Button';
import Icon from '@components/Icon';
import Text from '@components/Text';
import WidgetContainer from '@components/WidgetContainer';

import useEarlyRenewalConfirmation from '@hooks/useEarlyRenewalConfirmation';
import useEarlyRenewalPeriod from '@hooks/useEarlyRenewalPeriod';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';

const ICON_SIZE = variables.componentSizeNormal;

function EarlyRenewalOfferSection() {
    const [eligibility, eligibilityMetadata] = useOnyx(ONYXKEYS.EARLY_RENEWAL_OFFER_ELIGIBILITY);
    const {isNonIncentivizedPeriod} = useEarlyRenewalPeriod();
    const showEarlyRenewalConfirmation = useEarlyRenewalConfirmation();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['SubscriptionAnnual']);

    if (eligibilityMetadata.status !== 'loaded' || !eligibility?.canClaim || !isNonIncentivizedPeriod) {
        return null;
    }

    return (
        <WidgetContainer
            title={translate('earlyRenewal.title')}
            containerStyles={styles.trialBannerBackgroundColor}
        >
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.pt3, styles.pb8, shouldUseNarrowLayout ? styles.ph5 : styles.ph8]}>
                <Icon
                    src={illustrations.SubscriptionAnnual}
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                />
                <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter]}>
                    <Text style={styles.widgetItemTitle}>{translate('earlyRenewal.subtitle')}</Text>
                </View>
                <Button
                    isDisabled={isOffline}
                    onPress={showEarlyRenewalConfirmation}
                    size={CONST.BUTTON_SIZE.SMALL}
                    style={styles.widgetItemButton}
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                >
                    <Button.Text>{translate('earlyRenewal.renew')}</Button.Text>
                </Button>
            </View>
        </WidgetContainer>
    );
}

export default EarlyRenewalOfferSection;
