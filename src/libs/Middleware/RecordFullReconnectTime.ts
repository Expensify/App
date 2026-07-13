import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {recordFullReconnectTimeFromResponse} from '@libs/FullReconnectUtils';

import CONST from '@src/CONST';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

import type Middleware from './types';

/**
 * An OpenApp or full-ReconnectApp response can deliver a newer "reconnect if older than X" cutoff
 * than the one known when the request was built. The reconnect time waiting in the request's
 * successData was computed from that older cutoff, so the app would save a time below the delivered
 * cutoff, read itself as stale, and fire an extra full reconnect right after downloading everything
 * (a device clock behind the server makes this real; see recordFullReconnectTimeFromResponse).
 * Recompute the time from the cutoff the response actually carries before the response is applied.
 */
const recordFullReconnectTime: Middleware = (requestResponse, request) =>
    requestResponse.then((response) => {
        if (request.command !== WRITE_COMMANDS.OPEN_APP && request.command !== SIDE_EFFECT_REQUEST_COMMANDS.RECONNECT_APP) {
            return response;
        }
        if (!response?.onyxData || response.jsonCode !== CONST.JSON_CODE.SUCCESS) {
            return response;
        }

        recordFullReconnectTimeFromResponse(response.onyxData as AnyOnyxUpdate[], request.successData as AnyOnyxUpdate[] | undefined);
        return response;
    });

export default recordFullReconnectTime;
