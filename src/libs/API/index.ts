import Onyx from 'react-native-onyx';
import type {OnyxKey} from 'react-native-onyx';
import type {SetRequired} from 'type-fest';
import {resolveDuplicationConflictAction, resolveEnableFeatureConflicts} from '@libs/actions/RequestConflictUtils';
import type {EnablePolicyFeatureCommand, RequestMatcher} from '@libs/actions/RequestConflictUtils';
import Log from '@libs/Log';
import {handleDeletedAccount, HandleUnusedOptimisticID, Logging, Pagination, Reauthentication, RecheckConnection, SaveResponseInOnyx, SupportalPermission} from '@libs/Middleware';
import FraudMonitoring from '@libs/Middleware/FraudMonitoring';
import {isOffline} from '@libs/Network/NetworkStore';
import {push as pushToSequentialQueue, waitForIdle as waitForSequentialQueueIdle} from '@libs/Network/SequentialQueue';
import Pusher from '@libs/Pusher';
import {addMiddleware, processWithMiddleware} from '@libs/Request';
import {getAll, getLength as getPersistedRequestsLength} from '@userActions/PersistedRequests';
import CONST from '@src/CONST';
import type OnyxRequest from '@src/types/onyx/Request';
import type {OnyxData, PaginatedRequest, PaginationConfig, RequestConflictResolver} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';
import type {ApiCommand, ApiRequestCommandParameters, ApiRequestType, CommandOfType, ReadCommand, SideEffectRequestCommand, WriteCommand} from './types';
import {READ_COMMANDS} from './types';

// Setup API middlewares. Each request made will pass through a series of middleware functions that will get called in sequence (each one passing the result of the previous to the next).
// Note: The ordering here is intentional as we want to Log, Recheck Connection, Reauthenticate, and Save the Response in Onyx. Errors thrown in one middleware will bubble to the next.
// e.g. an error thrown in Logging or Reauthenticate logic will be caught by the next middleware or the SequentialQueue which retries failing requests.

// Logging - Logs request details and errors.
addMiddleware(Logging);

// RecheckConnection - Sets a timer for a request that will "recheck" if we are connected to the internet if time runs out. Also triggers the connection recheck when we encounter any error.
addMiddleware(RecheckConnection);

// Reauthentication - Handles jsonCode 407 which indicates an expired authToken. We need to reauthenticate and get a new authToken with our stored credentials.
addMiddleware(Reauthentication);

// Handles the case when the copilot has been deleted. The response contains jsonCode 408 and a message indicating account deletion
addMiddleware(handleDeletedAccount);

// Handle supportal permission denial centrally
addMiddleware(SupportalPermission);

// If an optimistic ID is not used by the server, this will update the remaining serialized requests using that optimistic ID to use the correct ID instead.
addMiddleware(HandleUnusedOptimisticID);

addMiddleware(Pagination);

// SaveResponseInOnyx - Merges either the successData or failureData (or finallyData, if included in place of the former two values) into Onyx depending on if the call was successful or not. This needs to be the LAST middleware we use, don't add any
// middlewares after this, because the SequentialQueue depends on the result of this middleware to pause the queue (if needed) to bring the app to an up-to-date state.
addMiddleware(SaveResponseInOnyx);

// FraudMonitoring - Tags the request with the appropriate Fraud Protection event.
addMiddleware(FraudMonitoring);

let requestIndex = 0;

/**
 * Prepare the request to be sent. Bind data together with request metadata and apply optimistic Onyx data.
 */
function prepareRequest<TCommand extends ApiCommand>(
    command: TCommand,
    type: ApiRequestType,
    params: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData<OnyxKey> = {},
    conflictResolver: RequestConflictResolver = {},
): OnyxRequest {
    Log.info('[API] Preparing request', false, {command, type});

    let shouldApplyOptimisticData = true;
    if (conflictResolver?.checkAndFixConflictingRequest) {
        const requests = getAll();
        const {conflictAction} = conflictResolver.checkAndFixConflictingRequest(requests);
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
    const request: SetRequired<OnyxRequest, 'data'> = {
        command,
        data,
        initiatedOffline: isOffline(),
        requestID: requestIndex++,
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
function processRequest(request: OnyxRequest, type: ApiRequestType): Promise<void | Response> {
    Log.info('[API] Processing request', false, {command: request.command, type});
    // Write commands can be saved and retried, so push it to the SequentialQueue
    if (type === CONST.API_REQUEST_TYPE.WRITE) {
        Log.info('[API] Write command. Pushing to SequentialQueue', false, {command: request.command});
        pushToSequentialQueue(request);
        return Promise.resolve();
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

/**
 * All calls to API.write() will be persisted to disk as JSON with the params, successData, and failureData (or finallyData, if included in place of the former two values).
 * This is so that if the network is unavailable or the app is closed, we can send the WRITE request later.
 */

function write<TCommand extends WriteCommand>(
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData<OnyxKey> = {},
    conflictResolver: RequestConflictResolver = {},
): Promise<void | Response> {
    Log.info('[API] Called API write', false, {command, ...apiCommandParameters});
    const request = prepareRequest(command, CONST.API_REQUEST_TYPE.WRITE, apiCommandParameters, onyxData, conflictResolver);
    return processRequest(request, CONST.API_REQUEST_TYPE.WRITE);
}

/**
 * This function is used to write data to the API while ensuring that there are no duplicate requests in the queue.
 * If a duplicate request is found, it resolves the conflict by replacing the duplicated request with the new one.
 */
function writeWithNoDuplicatesConflictAction<TCommand extends WriteCommand>(
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData<OnyxKey> = {},
    requestMatcher: RequestMatcher = (request) => request.command === command,
): Promise<void | Response> {
    const conflictResolver = {
        checkAndFixConflictingRequest: (persistedRequests: OnyxRequest[]) => resolveDuplicationConflictAction(persistedRequests, requestMatcher),
    };

    return write(command, apiCommandParameters, onyxData, conflictResolver);
}

/**
 * This function is used to write data to the API while ensuring that there are no conflicts with enabling policy features.
 * If a conflict is found, it resolves the conflict by deleting the duplicated request.
 */
function writeWithNoDuplicatesEnableFeatureConflicts<TCommand extends EnablePolicyFeatureCommand>(
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData<OnyxKey> = {},
): Promise<void | Response> {
    const conflictResolver = {
        checkAndFixConflictingRequest: (persistedRequests: OnyxRequest[]) => resolveEnableFeatureConflicts(command, persistedRequests, apiCommandParameters),
    };

    return write(command, apiCommandParameters, onyxData, conflictResolver);
}

/**
 * For commands where the network response must be accessed directly or when there is functionality that can only
 * happen once the request is finished (eg. calling third-party services like Onfido and Plaid, redirecting a user
 * depending on the response data, etc.).
 * It works just like API.read(), except that it will return a promise.
 * Using this method is discouraged and will throw an ESLint error. Use it sparingly and only when all other alternatives have been exhausted.
 * It is best to discuss it in Slack anytime you are tempted to use this method.
 */
function makeRequestWithSideEffects<TCommand extends SideEffectRequestCommand>(
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData<OnyxKey> = {},
): Promise<void | Response> {
    Log.info('[API] Called API makeRequestWithSideEffects', false, {command, ...apiCommandParameters});
    const request = prepareRequest(command, CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS, apiCommandParameters, onyxData);

    // Return a promise containing the response from HTTPS
    return processRequest(request, CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS);
}

/**
 * Ensure all write requests on the sequential queue have finished responding before running a command.
 * Responses from requests can overwrite the optimistic data inserted by write requests that use the same Onyx keys and haven't responded yet.
 */
function waitForWrites<TCommand extends ReadCommand | WriteCommand | SideEffectRequestCommand>(command: TCommand) {
    if (getPersistedRequestsLength() > 0) {
        Log.info(`[API] '${command}' is waiting on ${getPersistedRequestsLength()} write commands`);
    }
    return waitForSequentialQueueIdle();
}

/**
 * Requests made with this method are not be persisted to disk. If there is no network connectivity, the request is ignored and discarded.
 */
function read<TCommand extends ReadCommand>(command: TCommand, apiCommandParameters: ApiRequestCommandParameters[TCommand], onyxData: OnyxData<OnyxKey> = {}): void {
    Log.info('[API] Called API.read', false, {command, ...apiCommandParameters});

    // Apply optimistic updates of read requests immediately
    const request = prepareRequest(command, CONST.API_REQUEST_TYPE.READ, apiCommandParameters, onyxData);
    // Sign in with shortLivedAuthToken command shouldn't be blocked by write commands
    if (command === READ_COMMANDS.SIGN_IN_WITH_SHORT_LIVED_AUTH_TOKEN || command === READ_COMMANDS.SIGN_IN_WITH_SUPPORT_AUTH_TOKEN) {
        processRequest(request, CONST.API_REQUEST_TYPE.READ);
        return;
    }
    waitForWrites(command).then(() => {
        processRequest(request, CONST.API_REQUEST_TYPE.READ);
    });
}

function paginate<TRequestType extends typeof CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS, TCommand extends CommandOfType<TRequestType>>(
    type: TRequestType,
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData<OnyxKey>,
    config: PaginationConfig,
): Promise<Response | void>;
function paginate<TRequestType extends typeof CONST.API_REQUEST_TYPE.READ, TCommand extends CommandOfType<TRequestType>>(
    type: TRequestType,
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData<OnyxKey>,
    config: PaginationConfig,
): void;
function paginate<TRequestType extends typeof CONST.API_REQUEST_TYPE.WRITE, TCommand extends CommandOfType<TRequestType>>(
    type: TRequestType,
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData<OnyxKey>,
    config: PaginationConfig,
    conflictResolver?: RequestConflictResolver,
): void;
function paginate<TRequestType extends ApiRequestType, TCommand extends CommandOfType<TRequestType>>(
    type: TRequestType,
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData<OnyxKey>,
    config: PaginationConfig,
    conflictResolver: RequestConflictResolver = {},
): Promise<Response | void> | void {
    Log.info('[API] Called API.paginate', false, {command, ...apiCommandParameters});
    const request: PaginatedRequest = {
        ...prepareRequest(command, type, apiCommandParameters, onyxData, conflictResolver),
        ...config,
        ...{
            isPaginated: true,
        },
    };

    switch (type) {
        case CONST.API_REQUEST_TYPE.WRITE:
            processRequest(request, type);
            return;
        case CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS:
            return processRequest(request, type);
        case CONST.API_REQUEST_TYPE.READ:
            waitForWrites(command as ReadCommand).then(() => processRequest(request, type));
            return;
        default:
            throw new Error('Unknown API request type');
    }
}

export {write, makeRequestWithSideEffects, read, paginate, writeWithNoDuplicatesConflictAction, writeWithNoDuplicatesEnableFeatureConflicts, waitForWrites};
