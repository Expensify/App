import {isFullDownloadRequest} from '@libs/actions/RequestConflictUtils';
import {getServerReconnectCutoff, recordFullReconnectTimeFromResponse} from '@libs/FullReconnectUtils';

import CONST from '@src/CONST';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

import type Middleware from './types';

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
