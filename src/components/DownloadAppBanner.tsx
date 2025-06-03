import React from 'react';
import {View} from 'react-native';
import useHasLoggedIntoMobileApp from '@hooks/useHasLoggedIntoMobileApp';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import BillingBanner from '@pages/settings/Subscription/CardSection/BillingBanner/BillingBanner';
import ROUTES from '@src/ROUTES';
import Button from './Button';
import {ExpensifyMobileApp} from './Icon/Illustrations';

function DownloadAppBanner() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {hasLoggedIntoMobileApp, isLastMobileAppLoginLoaded} = useHasLoggedIntoMobileApp();

    if (!isLastMobileAppLoginLoaded || hasLoggedIntoMobileApp) {
        return null;
    }

    return (
        <View style={[styles.ph2, styles.mb2, styles.stickToBottom]}>
            <BillingBanner
                icon={ExpensifyMobileApp}
                title={translate('common.getTheApp')}
                subtitle={translate('common.scanReceiptsOnTheGo')}
                subtitleStyle={[styles.mt1, styles.mutedTextLabel]}
                style={[styles.borderRadiusComponentLarge, styles.hoveredComponentBG]}
                rightComponent={
                    <Button
                        small
                        success
                        text={translate('common.download')}
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_APP_DOWNLOAD_LINKS)}
                    />
                }
            />
        </View>
    );
}

export default DownloadAppBanner;
