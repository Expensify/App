import type {JsonObject, JsonValue} from '@ua/react-native-airship';
import Log from '@libs/Log';
import type {PushNotificationData} from './NotificationType';

/**
 * Parse the payload of a push notification. On Android, some notification payloads are sent as a JSON string rather than an object
 */
export default function parsePushNotificationPayload(payload: JsonValue | undefined): PushNotificationData | undefined {
    let data = payload;
    if (typeof payload === 'string') {
        try {
            data = JSON.parse(payload) as JsonObject;
        } catch {
            Log.hmmm('[PushNotification] Failed to parse the payload', payload);
            data = undefined;
        }
    }

    return data ? (data as PushNotificationData) : undefined;
}
