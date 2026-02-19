import React from 'react';
import {View} from 'react-native';
import {Shield} from '@components/Icon/Expensicons';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';
import Section from '@components/Section';
import Text from '@components/Text';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';

type Enable2FACardProps = {
    policyID?: string | undefined;
};

function Enable2FACard({policyID}: Enable2FACardProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {asset: ShieldYellow} = useMemoizedLazyAsset(() => loadIllustration('ShieldYellow' as IllustrationName));

    return (
        <Section
            title={translate('connectBankAccountStep.enable2FATitle')}
            icon={ShieldYellow}
            titleStyles={styles.mb4}
            containerStyles={styles.mh5}
            menuItems={[
                {
                    title: translate('connectBankAccountStep.secureYourAccount'),
                    // Assuming user is validated here, validation is checked at the beginning of ConnectBank Flow
                    onPress: () => Navigation.navigate(ROUTES.SETTINGS_2FA_ROOT.getRoute(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({policyID}))),
                    icon: Shield,
                    shouldShowRightIcon: true,
                    outerWrapperStyle: shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8,
                },
            ]}
        >
            <View style={styles.mb6}>
                <Text>{translate('connectBankAccountStep.enable2FAText')}</Text>
            </View>
        </Section>
    );
}

export default Enable2FACard;
