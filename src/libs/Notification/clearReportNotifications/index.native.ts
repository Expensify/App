import Airship from '@ua/react-native-airship';
import ClearReportNotifications from './types';

const clearReportNotifications: ClearReportNotifications = (reportID: string) => {
    Airship.push.getActiveNotifications().then((payloads) => {
        const reportNotificationIDs = payloads.filter((payload) => payload.extras.reportID === reportID).map((payload) => payload.notificationId);
        reportNotificationIDs.forEach((notificationID) => notificationID && Airship.push.clearNotification(notificationID));
    });
};

export default clearReportNotifications;
