import type {PushPayload} from '@ua/react-native-airship';
import type {PushNotificationData} from './NotificationType';

function getPushNotificationData(notification: PushPayload): PushNotificationData {
    let payload = notification.extras.payload;

    // On Android, some notification payloads are sent as a JSON string rather than an object
    if (typeof payload === 'string') {
        payload = JSON.parse(payload);
    }

    return payload as PushNotificationData;
}

export default getPushNotificationData;
