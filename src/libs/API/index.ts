import {readUpdateIDFrom, resolveDuplicationConflictAction, resolveEnableFeatureConflicts, resolveReconnectDuplicationConflictAction} from '@libs/actions/RequestConflictUtils';
import type {AnyRequestMatcher, EnablePolicyFeatureCommand} from '@libs/actions/RequestConflictUtils';
import Log from '@libs/Log';
import {waitForIdle as waitForSequentialQueueIdle} from '@libs/Network/SequentialQueue';

import {getOngoingRequest, getLength as getPersistedRequestsLength} from '@userActions/PersistedRequests';

import CONST from '@src/CONST';
import type OnyxRequest from '@src/types/onyx/Request';
import type {AnyRequest, OnyxData, PaginatedRequest, PaginationConfig, RequestConflictResolver} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import type {ApiRequestCommandParameters, ApiRequestType, CommandOfType, ReadCommand, SideEffectRequestCommand, WriteCommand} from './types';
import type {WriteReadyBarrier} from './writeWhenReady';

import {buildLogParams, prepareRequest, processRequest} from './makeRequest';
import {READ_COMMANDS} from './types';
import baseWrite from './write';
import {createTransitionBarrier, writeWhenReady} from './writeWhenReady';

/**
 * All calls to API.write() will be persisted to disk as JSON with the params, successData, and failureData (or finallyData, if included in place of the former two values).
 * This is so that if the network is unavailable or the app is closed, we can send the WRITE request later.
 *
 * The body lives in ./write so writeWhenReady can share it without importing this barrel. It is re-declared
 * here rather than re-exported because ~140 tests do `jest.spyOn(API, 'write')`, and babel's ESM->CJS
 * transform emits a re-exported binding as a non-configurable getter that `spyOn` cannot redefine.
 */
function write<TCommand extends WriteCommand>(command: TCommand, apiCommandParameters: ApiRequestCommandParameters[TCommand]): Promise<void | Response<never>>;

function write<TCommand extends WriteCommand, TKey extends OnyxKey>(
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData?: OnyxData<TKey>,
    conflictResolver?: RequestConflictResolver<TKey>,
): Promise<void | Response<TKey>>;

function write<TCommand extends WriteCommand, TKey extends OnyxKey>(
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData<TKey> = {},
    conflictResolver: RequestConflictResolver<TKey> = {},
): Promise<void | Response<TKey>> {
    return baseWrite(command, apiCommandParameters, onyxData, conflictResolver);
}

/**
 * This function is used to write data to the API while ensuring that there are no duplicate requests in the queue.
 * If a duplicate request is found, it resolves the conflict by replacing the duplicated request with the new one.
 */
function writeWithNoDuplicatesConflictAction<TCommand extends WriteCommand, TKey extends OnyxKey>(
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData<TKey> = {},
    requestMatcher: AnyRequestMatcher = (request) => request.command === command,
): Promise<void | Response<TKey>> {
    const conflictResolver = {
        checkAndFixConflictingRequest: (persistedRequests: AnyRequest[]) => resolveDuplicationConflictAction(persistedRequests, requestMatcher),
    };

    return write(command, apiCommandParameters, onyxData, conflictResolver);
}

/**
 * Writes a ReconnectApp through the coverage-based reconnect resolver. See the Conflict Resolution section
 * of contributingGuides/SEQUENTIAL_QUEUE.md. getOngoingRequest() is read inside the closure so both
 * evaluation passes see the same in-flight request.
 */
function writeWithNoDuplicatesReconnectConflictAction<TCommand extends WriteCommand, TKey extends OnyxKey>(
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData<TKey> = {},
): Promise<void | Response<TKey>> {
    const incomingRequest: AnyRequest = {command, data: {updateIDFrom: readUpdateIDFrom(apiCommandParameters)}};
    const conflictResolver = {
        checkAndFixConflictingRequest: (persistedRequests: AnyRequest[]) => resolveReconnectDuplicationConflictAction(persistedRequests, getOngoingRequest(), incomingRequest),
    };

    return write(command, apiCommandParameters, onyxData, conflictResolver);
}

/**
 * This function is used to write data to the API while ensuring that there are no conflicts with enabling policy features.
 * If a conflict is found, it resolves the conflict by deleting the duplicated request.
 */
function writeWithNoDuplicatesEnableFeatureConflicts<TCommand extends EnablePolicyFeatureCommand, TKey extends OnyxKey>(
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData<TKey> = {},
): Promise<void | Response<TKey>> {
    const conflictResolver = {
        checkAndFixConflictingRequest: (persistedRequests: Array<OnyxRequest<TKey>>) => resolveEnableFeatureConflicts(command, persistedRequests, apiCommandParameters),
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
function makeRequestWithSideEffects<TCommand extends SideEffectRequestCommand, TKey extends OnyxKey>(
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData<TKey> = {},
): Promise<void | Response<TKey>> {
    Log.info('[API] Called API makeRequestWithSideEffects', false, buildLogParams(command, apiCommandParameters ?? {}));
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
function read<TCommand extends ReadCommand>(command: TCommand, apiCommandParameters: ApiRequestCommandParameters[TCommand]): void;

function read<TCommand extends ReadCommand, TKey extends OnyxKey>(command: TCommand, apiCommandParameters: ApiRequestCommandParameters[TCommand], onyxData: OnyxData<TKey>): void;

function read<TCommand extends ReadCommand, TKey extends OnyxKey>(command: TCommand, apiCommandParameters: ApiRequestCommandParameters[TCommand], onyxData: OnyxData<TKey> = {}): void {
    Log.info('[API] Called API.read', false, buildLogParams(command, apiCommandParameters ?? {}));

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

function paginate<TRequestType extends typeof CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS, TCommand extends CommandOfType<TRequestType>, TKey extends OnyxKey>(
    type: TRequestType,
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData<TKey>,
    config: PaginationConfig,
): Promise<Response<TKey> | void>;
function paginate<TRequestType extends typeof CONST.API_REQUEST_TYPE.READ, TCommand extends CommandOfType<TRequestType>, TKey extends OnyxKey>(
    type: TRequestType,
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData<TKey>,
    config: PaginationConfig,
): void;
function paginate<TRequestType extends typeof CONST.API_REQUEST_TYPE.WRITE, TCommand extends CommandOfType<TRequestType>, TKey extends OnyxKey>(
    type: TRequestType,
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData<TKey>,
    config: PaginationConfig,
    conflictResolver?: RequestConflictResolver<TKey>,
): void;
function paginate<TRequestType extends ApiRequestType, TCommand extends CommandOfType<TRequestType>, TKey extends OnyxKey>(
    type: TRequestType,
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData<TKey>,
    config: PaginationConfig,
    conflictResolver: RequestConflictResolver<TKey> = {},
): Promise<Response<TKey> | void> | void {
    Log.info('[API] Called API.paginate', false, buildLogParams(command, apiCommandParameters ?? {}));
    const request: PaginatedRequest<TKey> = {
        ...prepareRequest(command, type, apiCommandParameters, onyxData, conflictResolver),
        ...config,
        isPaginated: true,
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

export {
    write,
    writeWhenReady,
    createTransitionBarrier,
    makeRequestWithSideEffects,
    read,
    paginate,
    writeWithNoDuplicatesConflictAction,
    writeWithNoDuplicatesReconnectConflictAction,
    writeWithNoDuplicatesEnableFeatureConflicts,
    waitForWrites,
};
export type {WriteReadyBarrier};
