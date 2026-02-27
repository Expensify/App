import React from 'react';
import {View} from 'react-native';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import BillingBanner from '@pages/settings/Subscription/CardSection/BillingBanner/BillingBanner';
import ROUTES from '@src/ROUTES';
import Button from './Button';
import {loadIllustration} from './Icon/IllustrationLoader';

function DomainsEmptyStateComponent() {
    const {asset: BlueShield} = useMemoizedLazyAsset(() => loadIllustration('BlueShield'));
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={styles.ph5}>
            <BillingBanner
                icon={BlueShield}
                title={translate('domain.enhancedSecurity.title')}
                subtitle={translate('domain.enhancedSecurity.subtitle')}
                subtitleStyle={[styles.textLabelSupporting, styles.pt1]}
                style={[styles.borderRadiusComponentLarge, styles.highlightBG]}
                rightComponent={
                    <Button
                        text={translate('domain.enhancedSecurity.enable')}
                        success
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACES_ADD_DOMAIN)}
                    />
                }
            />
        </View>
    );
}

export default DomainsEmptyStateComponent;
