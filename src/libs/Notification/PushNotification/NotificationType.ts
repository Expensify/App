import type {ValueOf} from 'type-fest';
import type {MultifactorAuthenticationChallengeObject} from '@libs/MultifactorAuthentication/Biometrics/ED25519/types';
import type {OnyxServerUpdate} from '@src/types/onyx/OnyxUpdatesFromServer';

const NotificationType = {
    REPORT_ACTION: 'reportAction',
    REPORT_COMMENT: 'reportComment',
    TRANSACTION: 'transaction',
    AUTHORIZE_TRANSACTION: 'authorizeTransaction',
} as const;

type NotificationTypes = ValueOf<typeof NotificationType>;

type NotificationDataMap = {
    [NotificationType.REPORT_ACTION]: ReportActionPushNotificationData;
    [NotificationType.REPORT_COMMENT]: ReportActionPushNotificationData;
    [NotificationType.TRANSACTION]: TransactionPushNotificationData;
    [NotificationType.AUTHORIZE_TRANSACTION]: AuthorizeTransactionPushNotificationData;
};

type PushNotificationData = ReportActionPushNotificationData | TransactionPushNotificationData | AuthorizeTransactionPushNotificationData;

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
    // Due to its length and the rounding, the transactionID must be a string.
    transactionID: string;
};

type AuthorizeTransactionPushNotificationData = TransactionPushNotificationData & {
    challenge: MultifactorAuthenticationChallengeObject;
    deadline: number;
};

/**
 * See https://github.com/Expensify/Web-Expensify/blob/main/lib/MobilePushNotifications.php for the various
 * types of push notifications sent by our API.
 */
export default NotificationType;
export type {NotificationTypes, NotificationDataMap, PushNotificationData, ReportActionPushNotificationData, TransactionPushNotificationData, AuthorizeTransactionPushNotificationData};
