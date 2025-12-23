import type {ValueOf} from 'type-fest';
import type {MultifactorAuthenticationChallengeObject} from '@libs/MultifactorAuthentication/Biometrics/ED25519/types';
import type {OnyxServerUpdate} from '@src/types/onyx/OnyxUpdatesFromServer';

const NotificationType = {
    REPORT_ACTION: 'reportAction',
    REPORT_COMMENT: 'reportComment',
    TRANSACTION: 'transaction',
    APPROVE_TRANSACTION: 'approveTransaction',
} as const;

type NotificationTypes = ValueOf<typeof NotificationType>;

type NotificationDataMap = {
    [NotificationType.REPORT_ACTION]: ReportActionPushNotificationData;
    [NotificationType.REPORT_COMMENT]: ReportActionPushNotificationData;
    [NotificationType.TRANSACTION]: TransactionPushNotificationData;
    [NotificationType.APPROVE_TRANSACTION]: ApproveTransactionPushNotificationData;
};

type PushNotificationData = ReportActionPushNotificationData | TransactionPushNotificationData | ApproveTransactionPushNotificationData;

type BasePushNotificationData = {
    title: string;
    subtitle: string;
    type: ValueOf<typeof NotificationType>;
    onyxData?: OnyxServerUpdate[];
    lastUpdateID?: number;
    previousUpdateID?: number;
    hasPendingOnyxUpdates?: boolean;
};

type ReportActionPushNotificationData = BasePushNotificationData & {
    reportID: number;
    reportActionID: string;
};

type TransactionPushNotificationData = BasePushNotificationData & {
    reportID: number;
    transactionID: number;
};

type ApproveTransactionPushNotificationData = BasePushNotificationData &
    Omit<TransactionPushNotificationData, 'transactionID'> & {
        challenge: MultifactorAuthenticationChallengeObject;
        deadline: number;
        // Due to its length and the rounding, the transaction ID must be a string
        transactionID: string;
    };

/**
 * See https://github.com/Expensify/Web-Expensify/blob/main/lib/MobilePushNotifications.php for the various
 * types of push notifications sent by our API.
 */
export default NotificationType;
export type {NotificationTypes, NotificationDataMap, PushNotificationData, ReportActionPushNotificationData, TransactionPushNotificationData, ApproveTransactionPushNotificationData};
