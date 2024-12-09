import type {PushPayload} from '@ua/react-native-airship';
import Airship from '@ua/react-native-airship';
import Log from '@libs/Log';
import parsePushNotificationPayload from '@libs/Notification/PushNotification/parsePushNotificationPayload';
import CONST from '@src/CONST';
import type ClearReportNotifications from './types';

const parseNotificationAndReportIDs = (pushPayload: PushPayload) => {
    const data = parsePushNotificationPayload(pushPayload.extras.payload);
    return {
        notificationID: pushPayload.notificationId,
        reportID: data?.reportID !== undefined ? String(data.reportID) : undefined,
    };
};

const clearReportNotifications: ClearReportNotifications = (reportID: string) => {
    Log.info('[PushNotification] clearing report notifications', false, {reportID});

    Airship.push
        .getActiveNotifications()
        .then((pushPayloads) => {
            const reportNotificationIDs = pushPayloads.reduce<string[]>((notificationIDs, pushPayload) => {
                const notification = parseNotificationAndReportIDs(pushPayload);
                if (notification.notificationID && notification.reportID === reportID) {
                    notificationIDs.push(notification.notificationID);
                }
                return notificationIDs;
            }, []);

            Log.info(`[PushNotification] found ${reportNotificationIDs.length} notifications to clear`, false, {reportID});
            reportNotificationIDs.forEach((notificationID) => Airship.push.clearNotification(notificationID));
        })
        .catch((error: unknown) => {
            Log.alert(`${CONST.ERROR.ENSURE_BUGBOT} [PushNotification] BrowserNotifications.clearReportNotifications threw an error. This should never happen.`, {reportID, error});
        });
};

export default clearReportNotifications;
