import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {dismissForSession} from '@libs/actions/ConciergeNotificationBanner';
import NotificationPermission from '@libs/Notification/notificationPermission';
import variables from '@styles/variables';
import useShouldShowEnableNotificationsBanner from './useShouldShowEnableNotificationsBanner';

type EnableNotificationsBannerProps = {
    reportID: string;
};

function requestAndDismissIfGranted() {
    NotificationPermission.request().then((status) => {
        if (status !== 'granted') {
            return;
        }
        dismissForSession();
    });
}

function EnableNotificationsBanner({reportID}: EnableNotificationsBannerProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const shouldShow = useShouldShowEnableNotificationsBanner(reportID);

    if (!shouldShow) {
        return null;
    }

    return (
        <View
            style={[
                styles.flexRow,
                styles.alignItemsCenter,
                styles.hoveredComponentBG,
                styles.p3,
                {paddingBottom: 44, borderRadius: variables.componentBorderRadiusRounded},
            ]}
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
