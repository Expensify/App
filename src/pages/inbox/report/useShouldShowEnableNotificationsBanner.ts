import {useEffect, useState} from 'react';
import useOnyx from '@hooks/useOnyx';
import NotificationPermission from '@libs/Notification/notificationPermission';
import type {NotificationPermissionStatus} from '@libs/Notification/notificationPermission/types';
import {isConciergeChatReport} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';

function useShouldShowEnableNotificationsBanner(reportID: string): boolean {
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

    return isConcierge && !hasDismissed && permissionStatus === 'default';
}

export default useShouldShowEnableNotificationsBanner;
