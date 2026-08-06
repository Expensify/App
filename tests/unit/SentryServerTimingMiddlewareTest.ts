import SentryServerTiming from '@libs/Middleware/SentryServerTiming';
import {endSpanWithAttributes, startSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

jest.mock('@libs/telemetry/activeSpans', () => ({
    startSpan: jest.fn(),
    endSpanWithAttributes: jest.fn(),
    cancelSpan: jest.fn(),
}));

let requestIndex = 0;

function buildRequest(command: string, data: Record<string, unknown>): Request<OnyxKey> {
    requestIndex += 1;
    return {command, data, requestIndex};
}

function buildResponse(lastUpdateID: number): Response<OnyxKey> {
    return {jsonCode: 200, lastUpdateID};
}

describe('SentryServerTiming middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('marks a GetMissingOnyxMessages response as not advanced when its ceiling matches what the request asked from', async () => {
        const request = buildRequest('GetMissingOnyxMessages', {updateIDFrom: 8102, updateIDTo: 8102});

        await SentryServerTiming(Promise.resolve(buildResponse(8102)), request, false);

        expect(endSpanWithAttributes).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({[CONST.TELEMETRY.ATTRIBUTE_RESPONSE_ADVANCED]: false}));
    });

    it('marks a GetMissingOnyxMessages response as advanced when its ceiling is newer', async () => {
        const request = buildRequest('GetMissingOnyxMessages', {updateIDFrom: 8102, updateIDTo: 8200});

        await SentryServerTiming(Promise.resolve(buildResponse(8200)), request, false);

        expect(endSpanWithAttributes).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({[CONST.TELEMETRY.ATTRIBUTE_RESPONSE_ADVANCED]: true}));
    });

    it('leaves the verdict off a full ReconnectApp, which fetches everything again and has nothing to advance past', async () => {
        const request = buildRequest('ReconnectApp', {});

        await SentryServerTiming(Promise.resolve(buildResponse(8200)), request, false);

        expect(endSpanWithAttributes).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({[CONST.TELEMETRY.ATTRIBUTE_RESPONSE_ADVANCED]: undefined}));
    });

    it('leaves the verdict off when the response carries no update ID, so an unreadable answer never reads as a stall', async () => {
        const request = buildRequest('ReconnectApp', {updateIDFrom: 8102});

        await SentryServerTiming(Promise.resolve({jsonCode: 200}), request, false);

        expect(endSpanWithAttributes).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({[CONST.TELEMETRY.ATTRIBUTE_RESPONSE_ADVANCED]: undefined}));
    });

    it('stamps the range a GetMissingOnyxMessages request asked for, parsing the string form of the target', async () => {
        const request = buildRequest('GetMissingOnyxMessages', {updateIDFrom: 8102, updateIDTo: '8200'});

        await SentryServerTiming(Promise.resolve(buildResponse(8200)), request, false);

        expect(startSpan).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                attributes: expect.objectContaining({
                    [CONST.TELEMETRY.ATTRIBUTE_UPDATE_ID_FROM]: 8102,
                    [CONST.TELEMETRY.ATTRIBUTE_UPDATE_ID_TO]: 8200,
                }),
            }),
        );
    });

    it('leaves the target off a ReconnectApp, which has no update ID to catch up to', async () => {
        const request = buildRequest('ReconnectApp', {updateIDFrom: 8102});

        await SentryServerTiming(Promise.resolve(buildResponse(8200)), request, false);

        expect(startSpan).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({attributes: expect.objectContaining({[CONST.TELEMETRY.ATTRIBUTE_UPDATE_ID_TO]: undefined})}));
    });

    it('gives overlapping reconnect requests their own span, so one does not cancel the other', async () => {
        const first = SentryServerTiming(Promise.resolve(buildResponse(8102)), buildRequest('GetMissingOnyxMessages', {updateIDFrom: 8102}), false);
        const second = SentryServerTiming(Promise.resolve(buildResponse(8200)), buildRequest('ReconnectApp', {updateIDFrom: 8102}), false);

        await Promise.all([first, second]);

        const spanIDs = jest.mocked(startSpan).mock.calls.map(([spanID]) => spanID);
        expect(new Set(spanIDs).size).toBe(2);
    });
});
