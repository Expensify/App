import React from 'react';
import {View} from 'react-native';
import Banner from '@components/Banner';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {dismissForSession} from '@libs/actions/ConciergeNotificationBanner';
import NotificationPermission from '@libs/Notification/notificationPermission';
import variables from '@styles/variables';

// Vertical overlap (px) between the bottom of the cream banner and the top of the composer.
// ReportFooter applies marginTop: -BANNER_COMPOSER_OVERLAP_PX to the composer so this many
// pixels of cream sit behind the composer, exposing only its rounded-corner curves above the
// banner edge. Must be at least the composer's corner radius; the extra 8px is visual headroom.
const BANNER_COMPOSER_OVERLAP_PX = variables.componentBorderRadiusRounded + 8;

// Visible cream below the text, matching the pt3 top padding for symmetry around the prompt.
const BANNER_VISIBLE_BOTTOM_GAP_PX = 12;

// Rounded top corners only, flat bottom. paddingBottom = visible gap below text + the
// overlap that hides behind the composer.
const containerOverrideStyle = {
    paddingTop: 12,
    paddingRight: 12,
    paddingLeft: 16,
    paddingBottom: BANNER_VISIBLE_BOTTOM_GAP_PX + BANNER_COMPOSER_OVERLAP_PX,
    borderRadius: 0,
    borderTopLeftRadius: variables.componentBorderRadiusLarge,
    borderTopRightRadius: variables.componentBorderRadiusLarge,
};

function requestAndDismissIfGranted() {
    NotificationPermission.request().then((status) => {
        if (status !== 'granted') {
            return;
        }
        dismissForSession();
    });
}

function EnableNotificationsBanner() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
        >
            <Banner
                text={translate('concierge.enableNotifications.prompt')}
                textStyles={[styles.textNormal]}
                containerStyles={[containerOverrideStyle]}
                shouldShowButton
                shouldUseSmallButtons
                buttonText={translate('concierge.enableNotifications.cta')}
                onButtonPress={requestAndDismissIfGranted}
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
