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
    try {
        const binaryStringPayload = atob(payload);
        if (!binaryStringPayload.startsWith(GZIP_MAGIC_NUMBER)) {
            throw Error();
        }
        const compressed = Uint8Array.from(binaryStringPayload, (x) => x.charCodeAt(0));
        const decompressed = pako.inflate(compressed, {to: 'string'});
        const jsonObject = JSON.parse(decompressed) as JsonObject;
        return jsonObject as PushNotificationData;
    } catch {
        Log.hmmm('[PushNotification] Failed to parse the payload as a Gzipped JSON string', payload);
    }

    // JSON String
    try {
        return JSON.parse(payload) as JsonObject as PushNotificationData;
    } catch {
        Log.hmmm(`[PushNotification] Failed to parse the payload as a JSON string`, payload);
    }

    return undefined;
}
