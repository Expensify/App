import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {dismissForSession} from '@libs/actions/ConciergeNotificationBanner';
import NotificationPermission from '@libs/Notification/notificationPermission';
import variables from '@styles/variables';

// Vertical overlap (px) between the bottom of the cream banner and the top of the composer.
// ReportFooter applies marginTop: -BANNER_COMPOSER_OVERLAP_PX to the composer so this many
// pixels of cream are hidden behind the composer's rounded top, exposing only its corner curves.
const BANNER_COMPOSER_OVERLAP_PX = 32;

// The visible cream below the text equals p3's 12px top padding; the rest sits behind the composer.
const containerInlineStyle = {paddingBottom: 12 + BANNER_COMPOSER_OVERLAP_PX, borderRadius: variables.componentBorderRadiusRounded};

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
            style={[styles.flexRow, styles.alignItemsCenter, styles.hoveredComponentBG, styles.p3, containerInlineStyle]}
        >
            <Text style={[styles.flex1, styles.flexWrap, styles.textNormal]}>{translate('concierge.enableNotifications.prompt')}</Text>
            <Button
                success
                small
                style={[styles.ml2]}
                text={translate('concierge.enableNotifications.cta')}
                onPress={requestAndDismissIfGranted}
            />
            <Button
                small
                style={[styles.ml2]}
                text={translate('common.notNow')}
                onPress={dismissForSession}
            />
        </View>
    );
}

EnableNotificationsBanner.displayName = 'EnableNotificationsBanner';

export default EnableNotificationsBanner;
export {BANNER_COMPOSER_OVERLAP_PX};
