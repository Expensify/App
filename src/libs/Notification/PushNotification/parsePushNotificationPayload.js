"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = parsePushNotificationPayload;
var pako_1 = require("pako");
var Log_1 = require("@libs/Log");
var GZIP_MAGIC_NUMBER = '\x1f\x8b';
/**
 * Parse the payload of a push notification. On Android, some notification payloads are sent as a JSON string rather than an object
 */
function parsePushNotificationPayload(payload) {
    if (payload === undefined) {
        return undefined;
    }
    // No need to parse if it's already an object
    if (typeof payload !== 'string') {
        return payload;
    }
    // Gzipped JSON String
    try {
        var binaryStringPayload = atob(payload);
        if (!binaryStringPayload.startsWith(GZIP_MAGIC_NUMBER)) {
            throw Error();
        }
        var compressed = Uint8Array.from(binaryStringPayload, function (x) { return x.charCodeAt(0); });
        var decompressed = pako_1.default.inflate(compressed, { to: 'string' });
        var jsonObject = JSON.parse(decompressed);
        return jsonObject;
    }
    catch (_a) {
        Log_1.default.hmmm('[PushNotification] Failed to parse the payload as a Gzipped JSON string', payload);
    }
    // JSON String
    try {
        return JSON.parse(payload);
    }
    catch (_b) {
        Log_1.default.hmmm("[PushNotification] Failed to parse the payload as a JSON string", payload);
    }
    return undefined;
}
