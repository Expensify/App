import type {OnyxKey} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {AnyOnyxServerUpdate, OnyxServerUpdate} from '@src/types/onyx/OnyxUpdatesFromServer';

const NotificationType = {
    REPORT_ACTION: 'reportAction',
    REPORT_COMMENT: 'reportComment',
    TRANSACTION: 'transaction',
} as const;

type NotificationTypes = ValueOf<typeof NotificationType>;

type NotificationDataMap = {
    [NotificationType.REPORT_ACTION]: AnyPushNotificationData;
    [NotificationType.REPORT_COMMENT]: AnyPushNotificationData;
    [NotificationType.TRANSACTION]: AnyPushNotificationData;
};

/**
 * This type was created as a solution during the migration away from the large OnyxKey union and is useful for contexts where the specific Onyx keys are not known ahead of time.
 * It should only be used in legacy code where providing exact key types would require major restructuring.
 */
type AnyPushNotificationData = ReportActionPushNotificationData<AnyOnyxServerUpdate> | TransactionPushNotificationData<AnyOnyxServerUpdate>;

type PushNotificationData<TKey extends OnyxKey> = ReportActionPushNotificationData<OnyxServerUpdate<TKey>> | TransactionPushNotificationData<OnyxServerUpdate<TKey>>;

type BasePushNotificationData<TUpdate extends AnyOnyxServerUpdate> = {
    title: string;
    subtitle: string;
    type: ValueOf<typeof NotificationType>;
    onyxData?: TUpdate[];
    lastUpdateID?: number;
    previousUpdateID?: number;
    hasPendingOnyxUpdates?: boolean;
};

type ReportActionPushNotificationData<TUpdate extends AnyOnyxServerUpdate> = BasePushNotificationData<TUpdate> & {
    reportID: number;
    reportActionID: string;
};

type TransactionPushNotificationData<TUpdate extends AnyOnyxServerUpdate> = BasePushNotificationData<TUpdate> & {
    reportID: number;
    transactionID: number;
};

/**
 * See https://github.com/Expensify/Web-Expensify/blob/main/lib/MobilePushNotifications.php for the various
 * types of push notifications sent by our API.
 */
export default NotificationType;
export type {NotificationTypes, NotificationDataMap, PushNotificationData, AnyPushNotificationData, ReportActionPushNotificationData, TransactionPushNotificationData};
