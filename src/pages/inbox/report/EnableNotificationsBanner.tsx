import type {ReactNode} from 'react';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {dismissForSession} from '@libs/actions/ConciergeNotificationBanner';
import NotificationPermission from '@libs/Notification/notificationPermission';
import type {NotificationPermissionStatus} from '@libs/Notification/notificationPermission/types';
import {isConciergeChatReport} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';

type EnableNotificationsBannerProps = {
    reportID: string;
    children: ReactNode;
};

function EnableNotificationsBanner({reportID, children}: EnableNotificationsBannerProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

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
        dismissForSession();
    }, []);

    const handleNotifyMe = useCallback(() => {
        NotificationPermission.request().then((status) => {
            setPermissionStatus(status);
            if (status === 'granted') {
                dismissForSession();
            }
        });
    }, []);

    const shouldShow = isConcierge && !hasDismissed && permissionStatus === 'default';

    if (!shouldShow) {
        return children;
    }

    return (
        <View style={[styles.borderRadiusComponentNormal, styles.hoveredComponentBG, styles.pv3, styles.ph3]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb3]}>
                <Text style={[styles.flex1, styles.flexWrap, styles.textNormal]}>{translate('concierge.enableNotifications.prompt')}</Text>
                <Button
                    success
                    small
                    style={[styles.ml2]}
                    text={translate('concierge.enableNotifications.cta')}
                    onPress={handleNotifyMe}
                />
                <Button
                    small
                    style={[styles.ml2]}
                    text={translate('common.notNow')}
                    onPress={dismiss}
                />
            </View>
            {children}
        </View>
    );
}

EnableNotificationsBanner.displayName = 'EnableNotificationsBanner';

export default EnableNotificationsBanner;
