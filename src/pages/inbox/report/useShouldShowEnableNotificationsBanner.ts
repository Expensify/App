import useOnyx from '@hooks/useOnyx';

import NotificationPermission from '@libs/Notification/notificationPermission';
import type {NotificationPermissionStatus} from '@libs/Notification/notificationPermission/types';
import {isConciergeChatReport} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useEffect, useState} from 'react';

function useShouldShowEnableNotificationsBanner(report: OnyxEntry<Report>): boolean {
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [hasDismissed] = useOnyx(ONYXKEYS.RAM_ONLY_HAS_DISMISSED_CONCIERGE_NOTIFICATION_BANNER);
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus | undefined>();

    const isConcierge = isConciergeChatReport(report, conciergeReportID);

    useEffect(() => {
        if (!isConcierge || hasDismissed) {
            return;
        }
        let isMounted = true;
        const checkStatus = () => {
            NotificationPermission.getStatus().then((status) => {
                if (!isMounted) {
                    return;
                }
                setPermissionStatus(status);
            });
        };
        checkStatus();
        // Permission can change in the browser's site settings while the tab stays open, so re-probe on focus.
        const canListen = typeof window !== 'undefined' && typeof window.addEventListener === 'function';
        if (canListen) {
            window.addEventListener('focus', checkStatus);
        }
        return () => {
            isMounted = false;
            if (canListen) {
                window.removeEventListener('focus', checkStatus);
            }
        };
    }, [isConcierge, hasDismissed]);

    return isConcierge && !hasDismissed && permissionStatus === 'default';
}

export default useShouldShowEnableNotificationsBanner;
