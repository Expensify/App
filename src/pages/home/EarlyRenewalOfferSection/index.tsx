import Button from '@components/Button';
import Icon from '@components/Icon';
import Text from '@components/Text';
import WidgetContainer from '@components/WidgetContainer';

import useEarlyRenewalConfirmation from '@hooks/useEarlyRenewalConfirmation';
import useIsNonIncentivizedEarlyRenewalPeriod from '@hooks/useIsNonIncentivizedEarlyRenewalPeriod';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';

const ICON_SIZE = variables.componentSizeNormal;

function EarlyRenewalOfferSection() {
    const [eligibility, eligibilityMetadata] = useOnyx(ONYXKEYS.EARLY_RENEWAL_OFFER_ELIGIBILITY);
    const isNonIncentivizedPeriod = useIsNonIncentivizedEarlyRenewalPeriod();
    const showEarlyRenewalConfirmation = useEarlyRenewalConfirmation();
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const theme = useTheme();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['SubscriptionAnnual']);

    if (eligibilityMetadata.status !== 'loaded' || !eligibility?.canClaim || !isNonIncentivizedPeriod) {
        return null;
    }

    const copy = CONST.SUBSCRIPTION.EARLY_RENEWAL.COPY.BILLING_OWNER;

    return (
        <WidgetContainer
            title={copy.HOME_TITLE}
            containerStyles={{backgroundColor: theme.trialBannerBackgroundColor}}
        >
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.pt3, styles.pb8, shouldUseNarrowLayout ? styles.ph5 : styles.ph8]}>
                <Icon
                    src={illustrations.SubscriptionAnnual}
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                />
                <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter]}>
                    <Text style={styles.widgetItemTitle}>{copy.HOME_SUBTITLE}</Text>
                </View>
                <Button
                    isDisabled={isOffline}
                    onPress={showEarlyRenewalConfirmation}
                    size={CONST.BUTTON_SIZE.SMALL}
                    style={styles.widgetItemButton}
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                >
                    <Button.Text>{copy.CTA}</Button.Text>
                </Button>
            </View>
        </WidgetContainer>
    );
}

export default EarlyRenewalOfferSection;
