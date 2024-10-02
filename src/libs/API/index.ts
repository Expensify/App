import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {SetRequired} from 'type-fest';
import Log from '@libs/Log';
import * as Middleware from '@libs/Middleware';
import * as SequentialQueue from '@libs/Network/SequentialQueue';
import * as Pusher from '@libs/Pusher/pusher';
import * as Request from '@libs/Request';
import * as PersistedRequests from '@userActions/PersistedRequests';
import CONST from '@src/CONST';
import type OnyxRequest from '@src/types/onyx/Request';
import type {PaginatedRequest, PaginationConfig, RequestConflictResolver} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';
import type {ApiCommand, ApiRequestCommandParameters, ApiRequestType, CommandOfType, ReadCommand, SideEffectRequestCommand, WriteCommand} from './types';

// Setup API middlewares. Each request made will pass through a series of middleware functions that will get called in sequence (each one passing the result of the previous to the next).
// Note: The ordering here is intentional as we want to Log, Recheck Connection, Reauthenticate, and Save the Response in Onyx. Errors thrown in one middleware will bubble to the next.
// e.g. an error thrown in Logging or Reauthenticate logic will be caught by the next middleware or the SequentialQueue which retries failing requests.

// Logging - Logs request details and errors.
Request.use(Middleware.Logging);

// RecheckConnection - Sets a timer for a request that will "recheck" if we are connected to the internet if time runs out. Also triggers the connection recheck when we encounter any error.
Request.use(Middleware.RecheckConnection);

// Reauthentication - Handles jsonCode 407 which indicates an expired authToken. We need to reauthenticate and get a new authToken with our stored credentials.
Request.use(Middleware.Reauthentication);

// If an optimistic ID is not used by the server, this will update the remaining serialized requests using that optimistic ID to use the correct ID instead.
Request.use(Middleware.HandleUnusedOptimisticID);

Request.use(Middleware.Pagination);

// SaveResponseInOnyx - Merges either the successData or failureData (or finallyData, if included in place of the former two values) into Onyx depending on if the call was successful or not. This needs to be the LAST middleware we use, don't add any
// middlewares after this, because the SequentialQueue depends on the result of this middleware to pause the queue (if needed) to bring the app to an up-to-date state.
Request.use(Middleware.SaveResponseInOnyx);

type OnyxData = {
    optimisticData?: OnyxUpdate[];
    successData?: OnyxUpdate[];
    failureData?: OnyxUpdate[];
    finallyData?: OnyxUpdate[];
};

/**
 * Prepare the request to be sent. Bind data together with request metadata and apply optimistic Onyx data.
 */
function prepareRequest<TCommand extends ApiCommand>(
    command: TCommand,
    type: ApiRequestType,
    params: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData = {},
    conflictResolver: RequestConflictResolver = {},
): OnyxRequest {
    Log.info('[API] Preparing request', false, {command, type});

    const {optimisticData, ...onyxDataWithoutOptimisticData} = onyxData;
    if (optimisticData) {
        Log.info('[API] Applying optimistic data', false, {command, type});
        Onyx.update(optimisticData);
    }

    const isWriteRequest = type === CONST.API_REQUEST_TYPE.WRITE;

    // Prepare the data we'll send to the API
    const data = {
        ...params,
        apiRequestType: type,

        // We send the pusherSocketID with all write requests so that the api can include it in push events to prevent Pusher from sending the events to the requesting client. The push event
        // is sent back to the requesting client in the response data instead, which prevents a replay effect in the UI. See https://github.com/Expensify/App/issues/12775.
        pusherSocketID: isWriteRequest ? Pusher.getPusherSocketID() : undefined,
    };

    // Assemble all request metadata (used by middlewares, and for persisted requests stored in Onyx)
    const request: SetRequired<OnyxRequest, 'data'> = {
        command,
        data,
        ...onyxDataWithoutOptimisticData,
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
    // Write commands can be saved and retried, so push it to the SequentialQueue
    if (type === CONST.API_REQUEST_TYPE.WRITE) {
        SequentialQueue.push(request);
        return Promise.resolve();
    }

    // Read requests are processed right away, but don't return the response to the caller
    if (type === CONST.API_REQUEST_TYPE.READ) {
        Request.processWithMiddleware(request);
        return Promise.resolve();
    }

    // Requests with side effects process right away, and return the response to the caller
    return Request.processWithMiddleware(request);
}

/**
 * All calls to API.write() will be persisted to disk as JSON with the params, successData, and failureData (or finallyData, if included in place of the former two values).
 * This is so that if the network is unavailable or the app is closed, we can send the WRITE request later.
 *
 * @param command - Name of API command to call.
 * @param apiCommandParameters - Parameters to send to the API.
 * @param onyxData  - Object containing errors, loading states, and optimistic UI data that will be merged
 *                             into Onyx before and after a request is made. Each nested object will be formatted in
 *                             the same way as an API response.
 * @param [onyxData.optimisticData] - Onyx instructions that will be passed to Onyx.update() before the request is made.
 * @param [onyxData.successData] - Onyx instructions that will be passed to Onyx.update() when the response has jsonCode === 200.
 * @param [onyxData.failureData] - Onyx instructions that will be passed to Onyx.update() when the response has jsonCode !== 200.
 * @param [onyxData.finallyData] - Onyx instructions that will be passed to Onyx.update() when the response has jsonCode === 200 or jsonCode !== 200.
 */

function write<TCommand extends WriteCommand>(
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData = {},
    conflictResolver: RequestConflictResolver = {},
): Promise<void | Response> {
    Log.info('[API] Called API write', false, {command, ...apiCommandParameters});
    const request = prepareRequest(command, CONST.API_REQUEST_TYPE.WRITE, apiCommandParameters, onyxData, conflictResolver);
    return processRequest(request, CONST.API_REQUEST_TYPE.WRITE);
}

/**
 * For commands where the network response must be accessed directly or when there is functionality that can only
 * happen once the request is finished (eg. calling third-party services like Onfido and Plaid, redirecting a user
 * depending on the response data, etc.).
 * It works just like API.read(), except that it will return a promise.
 * Using this method is discouraged and will throw an ESLint error. Use it sparingly and only when all other alternatives have been exhausted.
 * It is best to discuss it in Slack anytime you are tempted to use this method.
 *
 * @param command - Name of API command to call.
 * @param apiCommandParameters - Parameters to send to the API.
 * @param onyxData  - Object containing errors, loading states, and optimistic UI data that will be merged
 *                             into Onyx before and after a request is made. Each nested object will be formatted in
 *                             the same way as an API response.
 * @param [onyxData.optimisticData] - Onyx instructions that will be passed to Onyx.update() before the request is made.
 * @param [onyxData.successData] - Onyx instructions that will be passed to Onyx.update() when the response has jsonCode === 200.
 * @param [onyxData.failureData] - Onyx instructions that will be passed to Onyx.update() when the response has jsonCode !== 200.
 * @param [onyxData.finallyData] - Onyx instructions that will be passed to Onyx.update() when the response has jsonCode === 200 or jsonCode !== 200.
 * @returns
 */
function makeRequestWithSideEffects<TCommand extends SideEffectRequestCommand>(
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData = {},
): Promise<void | Response> {
    Log.info('[API] Called API makeRequestWithSideEffects', false, {command, ...apiCommandParameters});
    const request = prepareRequest(command, CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS, apiCommandParameters, onyxData);

    // Return a promise containing the response from HTTPS
    return processRequest(request, CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS);
}

/**
 * Ensure all write requests on the sequential queue have finished responding before running read requests.
 * Responses from read requests can overwrite the optimistic data inserted by
 * write requests that use the same Onyx keys and haven't responded yet.
 */
function waitForWrites<TCommand extends ReadCommand>(command: TCommand) {
    if (PersistedRequests.getLength() > 0) {
        Log.info(`[API] '${command}' is waiting on ${PersistedRequests.getLength()} write commands`);
    }
    return SequentialQueue.waitForIdle();
}

/**
 * Requests made with this method are not be persisted to disk. If there is no network connectivity, the request is ignored and discarded.
 *
 * @param command - Name of API command to call.
 * @param apiCommandParameters - Parameters to send to the API.
 * @param onyxData  - Object containing errors, loading states, and optimistic UI data that will be merged
 *                             into Onyx before and after a request is made. Each nested object will be formatted in
 *                             the same way as an API response.
 * @param [onyxData.optimisticData] - Onyx instructions that will be passed to Onyx.update() before the request is made.
 * @param [onyxData.successData] - Onyx instructions that will be passed to Onyx.update() when the response has jsonCode === 200.
 * @param [onyxData.failureData] - Onyx instructions that will be passed to Onyx.update() when the response has jsonCode !== 200.
 * @param [onyxData.finallyData] - Onyx instructions that will be passed to Onyx.update() when the response has jsonCode === 200 or jsonCode !== 200.
 */
function read<TCommand extends ReadCommand>(command: TCommand, apiCommandParameters: ApiRequestCommandParameters[TCommand], onyxData: OnyxData = {}): void {
    Log.info('[API] Called API.read', false, {command, ...apiCommandParameters});

    // Apply optimistic updates of read requests immediately
    const request = prepareRequest(command, CONST.API_REQUEST_TYPE.READ, apiCommandParameters, onyxData);
    waitForWrites(command).then(() => {
        processRequest(request, CONST.API_REQUEST_TYPE.READ);
    });
}

function paginate<TRequestType extends typeof CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS, TCommand extends CommandOfType<TRequestType>>(
    type: TRequestType,
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData,
    config: PaginationConfig,
): Promise<Response | void>;
function paginate<TRequestType extends typeof CONST.API_REQUEST_TYPE.READ | typeof CONST.API_REQUEST_TYPE.WRITE, TCommand extends CommandOfType<TRequestType>>(
    type: TRequestType,
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData,
    config: PaginationConfig,
): void;
function paginate<TRequestType extends ApiRequestType, TCommand extends CommandOfType<TRequestType>>(
    type: TRequestType,
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData,
    config: PaginationConfig,
): Promise<Response | void> | void {
    Log.info('[API] Called API.paginate', false, {command, ...apiCommandParameters});
    const request: PaginatedRequest = {
        ...prepareRequest(command, type, apiCommandParameters, onyxData),
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

export {write, makeRequestWithSideEffects, read, paginate};
