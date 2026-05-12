import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';
import Button from '@components/Button';
import Icon from '@components/Icon';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import NotificationPermission from '@libs/Notification/notificationPermission';
import type {NotificationPermissionStatus} from '@libs/Notification/notificationPermission/types';
import {isConciergeChatReport} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';

type EnableNotificationsBannerProps = {
    reportID: string;
};

function EnableNotificationsBanner({reportID}: EnableNotificationsBannerProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Bell']);

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [hasDismissed] = useOnyx(ONYXKEYS.RAM_ONLY_HAS_DISMISSED_CONCIERGE_NOTIFICATION_BANNER);
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus | undefined>();

    const isConcierge = isConciergeChatReport(report, conciergeReportID);

    useEffect(() => {
        if (!isConcierge || hasDismissed) {
            return;
        }
        let isMounted = true;
        NotificationPermission.getStatus().then((status) => {
            if (!isMounted) {
                return;
            }
            setPermissionStatus(status);
        });
        return () => {
            isMounted = false;
        };
    }, [isConcierge, hasDismissed]);

    const dismiss = useCallback(() => {
        Onyx.set(ONYXKEYS.RAM_ONLY_HAS_DISMISSED_CONCIERGE_NOTIFICATION_BANNER, true);
    }, []);

    const handleNotifyMe = useCallback(() => {
        NotificationPermission.request().then((status) => {
            setPermissionStatus(status);
            if (status === 'granted') {
                Onyx.set(ONYXKEYS.RAM_ONLY_HAS_DISMISSED_CONCIERGE_NOTIFICATION_BANNER, true);
            }
        });
    }, []);

    if (!isConcierge || hasDismissed || permissionStatus !== 'default') {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.p3, styles.mh3, styles.mb2, styles.borderRadiusComponentNormal, styles.hoveredComponentBG]}>
            <View style={[styles.mr2]}>
                <Icon
                    src={icons.Bell}
                    fill={theme.icon}
                />
            </View>
            <Text style={[styles.flex1, styles.flexWrap, styles.textLabelSupporting]}>{translate('concierge.enableNotifications.prompt')}</Text>
            <Button
                small
                style={[styles.ml2]}
                text={translate('common.notNow')}
                onPress={dismiss}
            />
            <Button
                success
                small
                style={[styles.ml2]}
                text={translate('concierge.enableNotifications.cta')}
                onPress={handleNotifyMe}
            />
        </View>
    );
}

EnableNotificationsBanner.displayName = 'EnableNotificationsBanner';

export default EnableNotificationsBanner;
