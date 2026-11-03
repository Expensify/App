import Log from '@libs/Log';
import {push as pushToSequentialQueue} from '@libs/Network/SequentialQueue';
import {getIsOffline} from '@libs/NetworkState';
import Pusher from '@libs/Pusher';
import {processWithMiddleware} from '@libs/Request';
import sanitizeLogParams from '@libs/sanitizeLogParams';

import {getAll} from '@userActions/PersistedRequests';

import CONST from '@src/CONST';
import type OnyxRequest from '@src/types/onyx/Request';
import type {OnyxData, RequestConflictResolver} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';
import type {SetRequired} from 'type-fest';

import Onyx from 'react-native-onyx';

import type {ApiCommand, ApiRequestCommandParameters, ApiRequestType} from './types';

// Use timestamp-based IDs to avoid collisions between browser tabs.
// Each tab has its own JS context with its own counter, so a simple
// incrementing number would collide across tabs.
let requestIndex = Date.now();

function buildLogParams(command: string, params: Record<string, unknown>): Record<string, unknown> {
    return {command, ...Object.fromEntries(Object.entries(sanitizeLogParams(params)))};
}

/**
 * Prepare the request to be sent. Bind data together with request metadata and apply optimistic Onyx data.
 */
function prepareRequest<TCommand extends ApiCommand, TKey extends OnyxKey>(
    command: TCommand,
    type: ApiRequestType,
    params: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData<TKey> = {},
    conflictResolver: RequestConflictResolver<TKey> = {},
): OnyxRequest<TKey> {
    Log.info('[API] Preparing request', false, {command, type});

    let shouldApplyOptimisticData = true;
    if (conflictResolver?.checkAndFixConflictingRequest) {
        const requests = getAll();
        const {conflictAction} = conflictResolver.checkAndFixConflictingRequest(requests as Array<OnyxRequest<TKey>>);
        shouldApplyOptimisticData = conflictAction.type !== 'noAction';
    }

    const {optimisticData, successData, failureData, ...onyxDataWithoutOptimisticData} = onyxData;

    if (optimisticData && shouldApplyOptimisticData) {
        Log.info('[API] Applying optimistic data', false, {command, type}, undefined, optimisticData);
        Onyx.update(optimisticData);
    }

    const isWriteRequest = type === CONST.API_REQUEST_TYPE.WRITE;
    let pusherSocketID = Pusher.getPusherSocketID();
    if (pusherSocketID === 'null' && isWriteRequest) {
        Log.alert("Pusher socket ID is 'null'. This should not happen.", {command, pusherSocketID}, true);
        pusherSocketID = undefined;
    }

    // Prepare the data we'll send to the API
    const data = {
        ...params,
        apiRequestType: type,

        // We send the pusherSocketID with all write requests so that the api can include it in push events to prevent Pusher from sending the events to the requesting client. The push event
        // is sent back to the requesting client in the response data instead, which prevents a replay effect in the UI. See https://github.com/Expensify/App/issues/12775.
        pusherSocketID: isWriteRequest ? pusherSocketID : undefined,
    };

    // Assemble all request metadata (used by middlewares, and for persisted requests stored in Onyx)
    const request: SetRequired<OnyxRequest<TKey>, 'data'> = {
        command,
        data,
        initiatedOffline: getIsOffline(),
        requestIndex: requestIndex++,
        ...onyxDataWithoutOptimisticData,
        successData,
        failureData,
        ...conflictResolver,
    };

    if (isWriteRequest) {
        // This should be removed once we are no longer using deprecatedAPI https://github.com/Expensify/Expensify/issues/215650
        request.data.shouldRetry ??= true;
        request.data.canCancel = true;
    }

    return request;
}

/**
 * Process a prepared request according to its type.
 */
async function processRequest<TKey extends OnyxKey>(request: OnyxRequest<TKey>, type: ApiRequestType): Promise<void | Response<TKey>> {
    Log.info('[API] Processing request', false, {command: request.command, type});
    // Write commands can be saved and retried, so push it to the SequentialQueue
    if (type === CONST.API_REQUEST_TYPE.WRITE) {
        Log.info('[API] Write command. Pushing to SequentialQueue', false, {command: request.command});
        await pushToSequentialQueue(request);
        return;
    }

    // Read requests are processed right away, but don't return the response to the caller
    if (type === CONST.API_REQUEST_TYPE.READ) {
        Log.info('[API] Read command. Processing request with middleware', false, {command: request.command});
        processWithMiddleware(request);
        return Promise.resolve();
    }

    // Requests with side effects process right away, and return the response to the caller
    Log.info('[API] Side effect command. Processing request with middleware', false, {command: request.command});
    return processWithMiddleware(request);
}

export {buildLogParams, prepareRequest, processRequest};
