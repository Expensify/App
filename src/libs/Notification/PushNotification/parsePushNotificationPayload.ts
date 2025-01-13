import type {JsonObject, JsonValue} from '@ua/react-native-airship';
import pako from 'pako';
import Log from '@libs/Log';
import type {PushNotificationData} from './NotificationType';

const GZIP_MAGIC_NUMBER = '\x1f\x8b';

/**
 * Parse the payload of a push notification. On Android, some notification payloads are sent as a JSON string rather than an object
 */
export default function parsePushNotificationPayload(payload: JsonValue | undefined): PushNotificationData | undefined {
    if (payload === undefined) {
        return undefined;
    }

    // No need to parse if it's already an object
    if (typeof payload !== 'string') {
        return payload as PushNotificationData;
    }

    // Gzipped JSON String
    if (payload.startsWith(GZIP_MAGIC_NUMBER)) {
        try {
            Log.hmmm('[PushNotification] Dealing with a gzipped json string', payload);
            const compressed = Buffer.from(payload, 'base64');
            const decompressed = pako.inflate(compressed);
            const jsonString = Buffer.from(decompressed).toString('utf-8');
            const jsonObject = JSON.parse(jsonString) as JsonObject;
            return jsonObject as PushNotificationData;
        } catch {
            Log.hmmm('[PushNotification] Failed to parse the payload as a Gzipped JSON string', payload);
            return undefined;
        }
    }

    // JSON String
    try {
        return JSON.parse(payload) as JsonObject as PushNotificationData;
    } catch {
        Log.hmmm(`[PushNotification] Failed to parse the payload as a JSON string`, payload);
        return undefined;
    }
}
