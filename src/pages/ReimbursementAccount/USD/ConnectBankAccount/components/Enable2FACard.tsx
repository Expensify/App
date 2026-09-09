import {loadIllustration} from '@components/Icon/IllustrationLoader';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';
import MenuItem from '@components/MenuItem';
import Section from '@components/Section';
import Text from '@components/Text';

import {useMemoizedLazyAsset, useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useTwoFactorAuthRoute from '@hooks/useTwoFactorAuthRoute';

import Navigation from '@navigation/Navigation';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import React from 'react';
import {View} from 'react-native';

function Enable2FACard() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {asset: ShieldYellow} = useMemoizedLazyAsset(() => loadIllustration('ShieldYellow' as IllustrationName));
    const icons = useMemoizedLazyExpensifyIcons(['Shield']);
    const {getTwoFactorAuthRoute} = useTwoFactorAuthRoute();

    return (
        <Section
            title={translate('connectBankAccountStep.enable2FATitle')}
            icon={ShieldYellow}
            titleStyles={styles.mb4}
            containerStyles={styles.mh5}
        >
            <View style={styles.mb6}>
                <Text>{translate('connectBankAccountStep.enable2FAText')}</Text>
            </View>
            <View style={styles.mhn5}>
                <MenuItem.Root onPress={callFunctionIfActionIsAllowed(() => Navigation.navigate(getTwoFactorAuthRoute()))}>
                    <MenuItem.Row>
                        <MenuItem.Leading>
                            <MenuItem.Icon src={icons.Shield} />
                        </MenuItem.Leading>
                        <MenuItem.Content>
                            <MenuItem.Title>{translate('connectBankAccountStep.secureYourAccount')}</MenuItem.Title>
                        </MenuItem.Content>
                        <MenuItem.Trailing>
                            <MenuItem.Chevron />
                        </MenuItem.Trailing>
                    </MenuItem.Row>
                </MenuItem.Root>
            </View>
        </Section>
    );
}

export default Enable2FACard;
