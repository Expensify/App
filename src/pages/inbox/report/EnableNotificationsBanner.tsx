import React from 'react';
import {View} from 'react-native';
import Banner from '@components/Banner';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {dismissForSession} from '@libs/actions/ConciergeNotificationBanner';
import NotificationPermission from '@libs/Notification/notificationPermission';
import variables from '@styles/variables';
import CONST from '@src/CONST';

// Composer overlaps this banner; the overlap must be ≥ the composer's corner radius.
const BANNER_COMPOSER_OVERLAP_PX = variables.componentBorderRadiusRounded + 8;
const BANNER_VISIBLE_BOTTOM_GAP_PX = 12;

const containerOverrideStyle = {
    paddingBottom: BANNER_VISIBLE_BOTTOM_GAP_PX + BANNER_COMPOSER_OVERLAP_PX,
    borderRadius: 0,
    borderTopLeftRadius: variables.componentBorderRadiusLarge,
    borderTopRightRadius: variables.componentBorderRadiusLarge,
};

function requestAndDismiss() {
    NotificationPermission.request().then(dismissForSession);
}

function EnableNotificationsBanner() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View
            role={CONST.ROLE.STATUS}
            accessibilityLiveRegion="polite"
        >
            <Banner
                text={translate('concierge.enableNotifications.prompt')}
                textStyles={[styles.textNormal]}
                containerStyles={[styles.pt3, styles.pr3, styles.pl4, containerOverrideStyle]}
                shouldShowButton
                shouldUseSmallButtons
                buttonText={translate('concierge.enableNotifications.cta')}
                onButtonPress={requestAndDismiss}
                shouldShowSecondaryButton
                secondaryButtonText={translate('common.notNow')}
                onSecondaryButtonPress={dismissForSession}
            />
        </View>
    );
}

EnableNotificationsBanner.displayName = 'EnableNotificationsBanner';

export default EnableNotificationsBanner;
export {BANNER_COMPOSER_OVERLAP_PX};
