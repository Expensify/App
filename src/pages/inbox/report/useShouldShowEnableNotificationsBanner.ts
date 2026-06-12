import {useEffect, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import NotificationPermission from '@libs/Notification/notificationPermission';
import type {NotificationPermissionStatus} from '@libs/Notification/notificationPermission/types';
import {isConciergeChatReport, isPolicyExpenseChat} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

function useShouldShowEnableNotificationsBanner(report: OnyxEntry<Report>): boolean {
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [hasDismissed] = useOnyx(ONYXKEYS.RAM_ONLY_HAS_DISMISSED_CONCIERGE_NOTIFICATION_BANNER);
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus | undefined>();

    const isConcierge = isConciergeChatReport(report, conciergeReportID);
    const isPolicyExpenseChatReport = isPolicyExpenseChat(report);

    useEffect(() => {
        // Show banner for Concierge chats or policy expense chats where notifications might not work
        if (!isConcierge && !isPolicyExpenseChatReport) {
            return;
        }
        if (hasDismissed) {
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
    }, [isConcierge, isPolicyExpenseChatReport, hasDismissed]);

    // Show banner if permission is not granted (default or denied) for Concierge or policy expense chats
    return (isConcierge || isPolicyExpenseChatReport) && !hasDismissed && permissionStatus !== 'granted';
}

export default useShouldShowEnableNotificationsBanner;
