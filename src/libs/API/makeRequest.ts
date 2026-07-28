import Log from '@libs/Log';
import {
    FailureTracking,
    handleDeletedAccount,
    HandleUnusedOptimisticID,
    LoadTest,
    Logging,
    Pagination,
    Reauthentication,
    RecordFullReconnectTime,
    SaveResponseInOnyx,
    SupportalPermission,
} from '@libs/Middleware';
import FraudMonitoring from '@libs/Middleware/FraudMonitoring';
import SentryServerTiming from '@libs/Middleware/SentryServerTiming';
import {push as pushToSequentialQueue} from '@libs/Network/SequentialQueue';
import {getIsOffline} from '@libs/NetworkState';
import Pusher from '@libs/Pusher';
import {addMiddleware, processWithMiddleware} from '@libs/Request';
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

// Setup API middlewares. Each request made will pass through a series of middleware functions that will get called in sequence (each one passing the result of the previous to the next).
// Note: The ordering here is intentional as we want to Log, Recheck Connection, Reauthenticate, and Save the Response in Onyx. Errors thrown in one middleware will bubble to the next.
// e.g. an error thrown in Logging or Reauthenticate logic will be caught by the next middleware or the SequentialQueue which retries failing requests.
// This lives alongside prepareRequest/processRequest (rather than in index.ts) so registration happens for any entry point that can process a request, not just the barrel.

// Logging - Logs request details and errors.
addMiddleware(Logging);

// Duplicates API calls (tagged with mockRequest=true) when the server sends load-test parameters via the X-Load-Test response header.
addMiddleware(LoadTest);

// FailureTracking - Observes request outcomes and feeds them to FailureTracker for sustained failure detection.
addMiddleware(FailureTracking);

// Reauthentication - Handles jsonCode 407 which indicates an expired authToken. We need to reauthenticate and get a new authToken with our stored credentials.
addMiddleware(Reauthentication);

// Handles the case when the copilot has been deleted. The response contains jsonCode 408 and a message indicating account deletion
addMiddleware(handleDeletedAccount);

// Handle supportal permission denial centrally
addMiddleware(SupportalPermission);

// If an optimistic ID is not used by the server, this will update the remaining serialized requests using that optimistic ID to use the correct ID instead.
addMiddleware(HandleUnusedOptimisticID);

addMiddleware(Pagination);

// SentryServerTiming - Tracks server round-trip time for configured command groups via Sentry spans.
addMiddleware(SentryServerTiming);

// RecordFullReconnectTime - Records the full-reconnect time into an OpenApp/full-ReconnectApp response. Must run before SaveResponseInOnyx applies the response.
addMiddleware(RecordFullReconnectTime);

// SaveResponseInOnyx - Merges either the successData or failureData (or finallyData, if included in place of the former two values) into Onyx depending on if the call was successful or not. This must be the last middleware that applies Onyx data
// (middlewares after it, like FraudMonitoring, must not write Onyx), because the SequentialQueue depends on the result of this middleware to pause the queue (if needed) to bring the app to an up-to-date state.
addMiddleware(SaveResponseInOnyx);

// FraudMonitoring - Tags the request with the appropriate Fraud Protection event.
addMiddleware(FraudMonitoring);

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
        Log.info('[API] Applying optimistic data', false, {command, type});
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
        request.data.shouldRetry = true;
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
