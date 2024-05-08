import type {OnyxServerUpdate} from '@src/types/onyx/OnyxUpdatesFromServer';

const NotificationType = {
    REPORT_COMMENT: 'reportComment',
} as const;

type NotificationDataMap = {
    [NotificationType.REPORT_COMMENT]: ReportCommentPushNotificationData;
};

type PushNotificationData = ReportCommentPushNotificationData;

type BasePushNotificationData = {
    title: string;
    type: string;
    onyxData?: OnyxServerUpdate[];
    lastUpdateID?: number;
    previousUpdateID?: number;
};

type ReportActionPushNotificationData = BasePushNotificationData & {
    reportID: number;
    reportActionID: string;
};

type ReportCommentPushNotificationData = ReportActionPushNotificationData & {
    type: typeof NotificationType.REPORT_COMMENT;
    roomName?: string;
};

/**
 * See https://github.com/Expensify/Web-Expensify/blob/main/lib/MobilePushNotifications.php for the various
 * types of push notifications sent by our API.
 */
export default NotificationType;
export type {NotificationDataMap, PushNotificationData, ReportCommentPushNotificationData};
