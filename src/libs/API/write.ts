import Log from '@libs/Log';

import CONST from '@src/CONST';
import type {OnyxData, RequestConflictResolver} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import type {ApiRequestCommandParameters, WriteCommand} from './types';

import {buildLogParams, prepareRequest, processRequest} from './makeRequest';

/**
 * The `API.write()` implementation. It lives here rather than in index.ts so that `writeWhenReady` can
 * reuse it without importing the barrel (which would introduce an import cycle). index.ts re-declares a
 * thin `write` on top of this, because ~140 tests do `jest.spyOn(API, 'write')` and that only works while
 * `write` is a binding declared in the barrel itself.
 *
 * All calls are persisted to disk as JSON with the params, successData, and failureData (or finallyData, if
 * included in place of the former two values). This is so that if the network is unavailable or the app is
 * closed, we can send the WRITE request later.
 */
function baseWrite<TCommand extends WriteCommand, TKey extends OnyxKey>(
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData<TKey> = {},
    conflictResolver: RequestConflictResolver<TKey> = {},
): Promise<void | Response<TKey>> {
    Log.info('[API] Called API write', false, buildLogParams(command, apiCommandParameters ?? {}));
    const request = prepareRequest(command, CONST.API_REQUEST_TYPE.WRITE, apiCommandParameters, onyxData, conflictResolver);

    return processRequest(request, CONST.API_REQUEST_TYPE.WRITE);
}

export default baseWrite;
