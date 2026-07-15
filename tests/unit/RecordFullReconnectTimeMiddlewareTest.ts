import DateUtils from '@libs/DateUtils';
import recordFullReconnectTime from '@libs/Middleware/RecordFullReconnectTime';

import ONYXKEYS from '@src/ONYXKEYS';
import type Request from '@src/types/onyx/Request';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

const CLIENT_NOW = '2026-06-12 10:00:00.000';
const DELIVERED_CUTOFF = '2026-06-12 10:05:00.000';

function cutoffEntry(cutoff: string): AnyOnyxUpdate {
    return {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE, value: cutoff};
}

function recordedTimeEntry(time: string): AnyOnyxUpdate {
    return {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.LAST_FULL_RECONNECT_TIME, value: time};
}

function buildRequest(command: string, data: Record<string, unknown> = {}): Request<OnyxKey> {
    return {command, data};
}

function buildResponse(jsonCode: number): Response<OnyxKey> {
    return {jsonCode, onyxData: [cutoffEntry(DELIVERED_CUTOFF)]};
}

describe('RecordFullReconnectTime middleware', () => {
    beforeEach(() => {
        jest.spyOn(DateUtils, 'getDBTime').mockReturnValue(CLIENT_NOW);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test.each(['OpenApp', 'ReconnectApp'])('records the reconnect time from the cutoff a %s response delivers', async (command) => {
        const request = buildRequest(command);
        const response = buildResponse(200);

        await recordFullReconnectTime(Promise.resolve(response), request, false);

        expect(response.onyxData).toEqual([recordedTimeEntry(DELIVERED_CUTOFF), cutoffEntry(DELIVERED_CUTOFF)]);
    });

    it('records nothing for a partial ReconnectApp, one that fetches from an update ID', async () => {
        const request = buildRequest('ReconnectApp', {updateIDFrom: 123});
        const response = buildResponse(200);

        await recordFullReconnectTime(Promise.resolve(response), request, false);

        expect(response.onyxData).toEqual([cutoffEntry(DELIVERED_CUTOFF)]);
    });

    it('records client-now when a successful response carries no onyxData at all', async () => {
        const request = buildRequest('OpenApp');
        const response: Response<OnyxKey> = {jsonCode: 200};

        await recordFullReconnectTime(Promise.resolve(response), request, false);

        expect(response.onyxData).toEqual([recordedTimeEntry(CLIENT_NOW)]);
    });

    test.each(['OpenReport', 'GetMissingOnyxMessages'])('leaves a %s response untouched', async (command) => {
        const request = buildRequest(command, {updateIDFrom: 5, updateIDTo: 9});
        const response = buildResponse(200);

        await recordFullReconnectTime(Promise.resolve(response), request, false);

        expect(response.onyxData).toEqual([cutoffEntry(DELIVERED_CUTOFF)]);
    });

    it('leaves failed responses untouched', async () => {
        const request = buildRequest('OpenApp');
        const response = buildResponse(407);

        await recordFullReconnectTime(Promise.resolve(response), request, false);

        expect(response.onyxData).toEqual([cutoffEntry(DELIVERED_CUTOFF)]);
    });

    it('passes the response through unchanged as the middleware result', async () => {
        const request = buildRequest('OpenApp');
        const response = buildResponse(200);

        await expect(recordFullReconnectTime(Promise.resolve(response), request, false)).resolves.toBe(response);
    });
});
