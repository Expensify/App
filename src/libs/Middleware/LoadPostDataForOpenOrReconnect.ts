import {isReconnectFamilyRequest} from '@libs/actions/RequestConflictUtils';

import {loadPostDataForOpenOrReconnect} from '@userActions/App';

import CONST from '@src/CONST';

import type Middleware from './types';

/**
 * Sends the post-load reads once per OpenApp/ReconnectApp that reaches the server. Tied to the response
 * rather than to the call, so a reconnect the queue drops as a duplicate sends nothing, and a reconnect
 * restored from a previous session still gets its reads even though its original caller is gone.
 */
const loadPostData: Middleware = (requestResponse, request) =>
    requestResponse.then((response) => {
        if (isReconnectFamilyRequest(request) && response?.jsonCode === CONST.JSON_CODE.SUCCESS) {
            loadPostDataForOpenOrReconnect();
        }

        return response;
    });

export default loadPostData;
