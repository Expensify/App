import {isFullDownloadRequest} from '@libs/actions/RequestConflictUtils';
import {getServerReconnectCutoff, recordFullReconnectTimeFromResponse} from '@libs/FullReconnectUtils';

import CONST from '@src/CONST';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

import type Middleware from './types';

/**
 * Records LAST_FULL_RECONNECT_TIME whenever a full download finishes: on every successful OpenApp
 * and full-ReconnectApp response (isFullDownloadRequest is the same rule the queue's reconnect
 * dedup uses, so the two cannot drift apart). The time is recorded from the response, not computed
 * when the request is built; see recordFullReconnectTimeFromResponse for why.
 */
const recordFullReconnectTime: Middleware = (requestResponse, request) =>
    requestResponse.then((response) => {
        if (!isFullDownloadRequest(request) || response?.jsonCode !== CONST.JSON_CODE.SUCCESS) {
            return response;
        }

        response.onyxData ??= [];
        recordFullReconnectTimeFromResponse(response.onyxData as AnyOnyxUpdate[], getServerReconnectCutoff());
        return response;
    });

export default recordFullReconnectTime;
