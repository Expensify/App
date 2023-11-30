import Airship from '@ua/react-native-airship';
import _ from 'underscore';

export default function clearReportNotifications(reportID) {
    Airship.push.getActiveNotifications().then((payloads) => {
        const reportNotificationIDs = _.chain(payloads)
            .filter((payload) => payload.notificationId && payload.extras.reportID === reportID)
            .map((payload) => payload.notificationId);
        reportNotificationIDs.forEach((notificationID) => Airship.push.clearNotification(notificationID));
    });
}
