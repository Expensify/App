import React from 'react';
import {View} from 'react-native';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';
import Section from '@components/Section';
import Text from '@components/Text';
import {useMemoizedLazyAsset, useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useTwoFactorAuthRoute from '@hooks/useTwoFactorAuthRoute';
import Navigation from '@navigation/Navigation';

function Enable2FACard() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {asset: ShieldYellow} = useMemoizedLazyAsset(() => loadIllustration('ShieldYellow' as IllustrationName));
    const icons = useMemoizedLazyExpensifyIcons(['Shield']);
    const {getTwoFactorAuthRoute} = useTwoFactorAuthRoute();

    return (
        <Section
            title={translate('connectBankAccountStep.enable2FATitle')}
            icon={ShieldYellow}
            titleStyles={styles.mb4}
            containerStyles={styles.mh5}
            menuItems={[
                {
                    title: translate('connectBankAccountStep.secureYourAccount'),
                    onPress: () => Navigation.navigate(getTwoFactorAuthRoute()),
                    icon: icons.Shield,
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
