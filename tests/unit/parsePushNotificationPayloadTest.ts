import parsePushNotificationPayload from '@libs/Notification/PushNotification/parsePushNotificationPayload';

describe('parsePushNotificationPayload', () => {
    it("returns 'undefined' for missing payload", () => {
        expect(parsePushNotificationPayload(undefined)).toBeUndefined();
    });

    it('returns untouched input when provided with raw json', () => {
        const payload = {key: 'value'};
        expect(parsePushNotificationPayload(payload)).toStrictEqual(payload);
    });

    it('returns correct json when provided with stringified json', () => {
        const json = {key: 'value'};
        const payload = JSON.stringify(json);
        expect(parsePushNotificationPayload(payload)).toStrictEqual(json);
    });

    it('returns correct json when provided with gzip compressed json string', () => {
        const json = {key: 'value'};
        // gzip compressed json string
        const payload = 'H4sIAAAAAAAAA6tWyk6tVLJSKkvMKU1VqgUAv5wYPw8AAAA=';
        expect(parsePushNotificationPayload(payload)).toStrictEqual(json);
    });
});
