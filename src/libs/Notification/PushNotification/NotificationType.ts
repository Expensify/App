import type {OnyxServerUpdate} from '@src/types/onyx/OnyxUpdatesFromServer';

const NotificationType = {
    REPORT_COMMENT: 'reportComment',
} as const;

type NotificationDataMap = {
    [NotificationType.REPORT_COMMENT]: ReportCommentNotificationData;
};

type NotificationData = ReportCommentNotificationData;

type ReportCommentNotificationData = {
    title: string;
    type: typeof NotificationType.REPORT_COMMENT;
    reportID: number;
    reportActionID: string;
    shouldScrollToLastUnread?: boolean;
    roomName?: string;
    onyxData?: OnyxServerUpdate[];
    lastUpdateID?: number;
    previousUpdateID?: number;
};

/**
 * See https://github.com/Expensify/Web-Expensify/blob/main/lib/MobilePushNotifications.php for the various
 * types of push notifications sent by our API.
 */
export default NotificationType;
export type {NotificationDataMap, NotificationData, ReportCommentNotificationData};
