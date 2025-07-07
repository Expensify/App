"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parsePushNotificationPayload_1 = require("@libs/Notification/PushNotification/parsePushNotificationPayload");
var payloadWithOnyxData = {
    type: 'reportComment',
    title: 'Test Payload',
    onyxData: [
        {
            key: 'reportActions_2170976176751360',
            onyxMethod: 'merge',
            value: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '2463291366241014308': {
                    actionName: 'ADDCOMMENT',
                    reportID: '2170976176751360',
                    reportActionID: '2463291366241014308',
                    message: [
                        {
                            type: 'COMMENT',
                            html: 'Hello world!',
                            text: 'Hello world!',
                        },
                    ],
                },
            },
        },
    ],
    lastUpdateID: 4024059044,
    previousUpdateID: 4024059043,
    reportID: 2170976176751360,
    reportActionID: '2463291366241014308',
    roomName: '',
    app: 'new',
};
// gzip compressed json string
var compressedPayloadWithOnyxData = 'H4sIAAAAAAAAA5WQT0/DMAzFv0rJeYe0zVrKbVqR4NDBYZzQhCxqbRVJEyXen6rqd6fJmBjQC7f4/ew8P/eMOoPsLmIWjba01EphS2wWMWpIBrJGR9EzdFJD7YFuu1MJBCN77dkHdt/ji3dqdOvekjjnRZ7FeZbP4zTjl7EKaadr36/QbtHLB5B7b9OzRGRpUoztWSJiHouU3wYdwqcrUGGbRVkun6rqfrX202fbx9KTKdPrtb66Jlxmfh/nYIvnTJebXBntSEkvPaCUOjpqK+ubcCU80R992AzDsBmpBEcvpgbCYC54Ivi84EKMzFg8NHrvpnj6M9rvZP8JZrVWl9v5GozxzxaPbPgE0MCh7v4BAAA=';
describe('parsePushNotificationPayload', function () {
    it("returns 'undefined' for missing payload", function () {
        expect((0, parsePushNotificationPayload_1.default)(undefined)).toBeUndefined();
    });
    it('returns untouched input when provided with raw json', function () {
        expect((0, parsePushNotificationPayload_1.default)(payloadWithOnyxData)).toStrictEqual(payloadWithOnyxData);
    });
    it('returns correct json when provided with stringified json', function () {
        var stringifiedPayload = JSON.stringify(payloadWithOnyxData);
        expect((0, parsePushNotificationPayload_1.default)(stringifiedPayload)).toStrictEqual(payloadWithOnyxData);
    });
    it('returns correct json when provided with gzip compressed json string', function () {
        expect((0, parsePushNotificationPayload_1.default)(compressedPayloadWithOnyxData)).toStrictEqual(payloadWithOnyxData);
    });
});
