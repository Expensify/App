import {isFullDownloadRequest} from '@libs/actions/RequestConflictUtils';
import {getServerReconnectCutoff, recordFullReconnectTimeFromResponse} from '@libs/FullReconnectUtils';

import CONST from '@src/CONST';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

import type Middleware from './types';

/**
 * Records LAST_FULL_RECONNECT_TIME on every successful full-download (OpenApp/full-ReconnectApp)
 * response. The time is recorded from the response rather than computed when the request is
 * built, because the response can itself deliver a newer reconnect cutoff — a build-time value
 * can land below it and fire extra full reconnects right after downloading everything.
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
