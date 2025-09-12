import React from 'react';
import {View} from 'react-native';
import type {LayoutChangeEvent} from 'react-native';
import useHasLoggedIntoMobileApp from '@hooks/useHasLoggedIntoMobileApp';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import BillingBanner from '@pages/settings/Subscription/CardSection/BillingBanner/BillingBanner';
import ROUTES from '@src/ROUTES';
import Button from './Button';
import {ExpensifyMobileApp} from './Icon/Illustrations';

type DownloadAppBannerProps = {
    onLayout?: (e: LayoutChangeEvent) => void;
};

function DownloadAppBanner({onLayout}: DownloadAppBannerProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {hasLoggedIntoMobileApp, isLastMobileAppLoginLoaded} = useHasLoggedIntoMobileApp();

    if (!isLastMobileAppLoginLoaded || hasLoggedIntoMobileApp) {
        return null;
    }

    return (
        <View
            style={[styles.ph2, styles.mb2, styles.stickToBottom, styles.pt2]}
            onLayout={onLayout}
        >
            <BillingBanner
                icon={ExpensifyMobileApp}
                title={translate('common.getTheApp')}
                subtitle={translate('common.scanReceiptsOnTheGo')}
                subtitleStyle={[styles.mt1, styles.mutedTextLabel]}
                style={[styles.borderRadiusComponentNormal, styles.hoveredComponentBG]}
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
