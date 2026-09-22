import Button from '@components/Button';
import Icon from '@components/Icon';
import Text from '@components/Text';
import WidgetContainer from '@components/WidgetContainer';

import useIsNonIncentivizedEarlyRenewalPeriod from '@hooks/useIsNonIncentivizedEarlyRenewalPeriod';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {nudgeBillingOwnerEarlyRenewal} from '@libs/actions/EarlyRenewalOffer';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React, {useState} from 'react';
import {View} from 'react-native';

const ICON_SIZE = variables.componentSizeNormal;

function EarlyRenewalOfferSection() {
    const [eligibility, eligibilityMetadata] = useOnyx(ONYXKEYS.EARLY_RENEWAL_OFFER_ELIGIBILITY);
    const isNonIncentivizedPeriod = useIsNonIncentivizedEarlyRenewalPeriod();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['MoneyBag']);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    if (eligibilityMetadata.status !== 'loaded' || !eligibility || !isNonIncentivizedPeriod) {
        return null;
    }

    const copy = eligibility.canClaim ? CONST.SUBSCRIPTION.EARLY_RENEWAL.COPY.BILLING_OWNER : CONST.SUBSCRIPTION.EARLY_RENEWAL.COPY.WORKSPACE_ADMIN;

    const handlePress = () => {
        if (eligibility.canClaim) {
            Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_EARLY_RENEWAL);
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');
        nudgeBillingOwnerEarlyRenewal(CONST.SUBSCRIPTION.EARLY_RENEWAL.OFFER_ID.NON_INCENTIVIZED_ONE_YEAR, eligibility.nudgePolicyID)
            .then((response) => {
                if (response?.jsonCode === CONST.JSON_CODE.SUCCESS) {
                    return;
                }
                setErrorMessage(response?.message ?? translate('common.genericErrorMessage'));
            })
            .catch(() => setErrorMessage(translate('common.genericErrorMessage')))
            .finally(() => setIsSubmitting(false));
    };

    return (
        <WidgetContainer
            title={copy.HOME_TITLE}
            containerStyles={{backgroundColor: theme.trialBannerBackgroundColor}}
        >
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.pt3, errorMessage ? styles.pb3 : styles.pb8, shouldUseNarrowLayout ? styles.ph5 : styles.ph8]}>
                <Icon
                    src={icons.MoneyBag}
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                />
                <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter]}>
                    <Text style={styles.widgetItemTitle}>{copy.HOME_SUBTITLE}</Text>
                </View>
                <Button
                    isDisabled={isOffline}
                    isLoading={isSubmitting}
                    onPress={handlePress}
                    size={CONST.BUTTON_SIZE.SMALL}
                    style={styles.widgetItemButton}
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                >
                    <Button.Text>{copy.CTA}</Button.Text>
                </Button>
            </View>
            {!!errorMessage && <Text style={[styles.formError, shouldUseNarrowLayout ? styles.ph5 : styles.ph8, styles.pb5]}>{errorMessage}</Text>}
        </WidgetContainer>
    );
}

export default EarlyRenewalOfferSection;
