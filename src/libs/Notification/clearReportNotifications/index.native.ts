import Airship, {PushPayload} from '@ua/react-native-airship';
import Log from '@libs/Log';
import { NotificationData } from '@libs/Notification/PushNotification/NotificationType';
import ClearReportNotifications from './types';

function parseNotificationAndReportIDs(pushPayload: PushPayload) {
    let payload = pushPayload.extras.payload;
    if (typeof payload === 'string') {
        payload = JSON.parse(payload);
    }
    const data = payload as NotificationData;
    return {
        notificationID: pushPayload.notificationId,
        reportID: String(data.reportID),
    };
}

const clearReportNotifications: ClearReportNotifications = (reportID: string) => {
    Log.info('[PushNotification] clearing report notifications', false, {reportID});

    Airship.push.getActiveNotifications().then((pushPayloads) => {
        const reportNotificationIDs = pushPayloads
            .map(parseNotificationAndReportIDs)
            .filter((notification) => notification.reportID === reportID)
            .map((notification) => notification.notificationID);

        Log.info(`[PushNotification] found ${reportNotificationIDs.length} notifications to clear`, false, {reportID});
        reportNotificationIDs.forEach((notificationID) => notificationID && Airship.push.clearNotification(notificationID));
    });
};

export default clearReportNotifications;
