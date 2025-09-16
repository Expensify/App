import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {SetRequired} from 'type-fest';
import {resolveDuplicationConflictAction, resolveEnableFeatureConflicts} from '@libs/actions/RequestConflictUtils';
import type {EnablePolicyFeatureCommand, RequestMatcher} from '@libs/actions/RequestConflictUtils';
import {getFinishOnboardingTaskOnyxData} from '@libs/actions/Task';
import Log from '@libs/Log';
import {handleDeletedAccount, HandleUnusedOptimisticID, Logging, Pagination, Reauthentication, RecheckConnection, SaveResponseInOnyx} from '@libs/Middleware';
import {isOffline} from '@libs/Network/NetworkStore';
import {push as pushToSequentialQueue, waitForIdle as waitForSequentialQueueIdle} from '@libs/Network/SequentialQueue';
import * as OptimisticReportNames from '@libs/OptimisticReportNames';
import {getUpdateContext, initialize as initializeOptimisticReportNamesContext} from '@libs/OptimisticReportNamesConnectionManager';
import Pusher from '@libs/Pusher';
import {processWithMiddleware, use} from '@libs/Request';
import {getAll, getLength as getPersistedRequestsLength} from '@userActions/PersistedRequests';
import CONST from '@src/CONST';
import type OnyxRequest from '@src/types/onyx/Request';
import type {PaginatedRequest, PaginationConfig, RequestConflictResolver} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';
import type {ApiCommand, ApiRequestCommandParameters, ApiRequestType, CommandOfType, ReadCommand, SideEffectRequestCommand, WriteCommand} from './types';
import {READ_COMMANDS, WRITE_COMMANDS} from './types';

// Setup API middlewares. Each request made will pass through a series of middleware functions that will get called in sequence (each one passing the result of the previous to the next).
// Note: The ordering here is intentional as we want to Log, Recheck Connection, Reauthenticate, and Save the Response in Onyx. Errors thrown in one middleware will bubble to the next.
// e.g. an error thrown in Logging or Reauthenticate logic will be caught by the next middleware or the SequentialQueue which retries failing requests.

// Logging - Logs request details and errors.
use(Logging);

// RecheckConnection - Sets a timer for a request that will "recheck" if we are connected to the internet if time runs out. Also triggers the connection recheck when we encounter any error.
use(RecheckConnection);

// Reauthentication - Handles jsonCode 407 which indicates an expired authToken. We need to reauthenticate and get a new authToken with our stored credentials.
use(Reauthentication);

// Handles the case when the copilot has been deleted. The response contains jsonCode 408 and a message indicating account deletion
use(handleDeletedAccount);

// If an optimistic ID is not used by the server, this will update the remaining serialized requests using that optimistic ID to use the correct ID instead.
use(HandleUnusedOptimisticID);

use(Pagination);

// SaveResponseInOnyx - Merges either the successData or failureData (or finallyData, if included in place of the former two values) into Onyx depending on if the call was successful or not. This needs to be the LAST middleware we use, don't add any
// middlewares after this, because the SequentialQueue depends on the result of this middleware to pause the queue (if needed) to bring the app to an up-to-date state.
use(SaveResponseInOnyx);

// Initialize OptimisticReportNames context on module load
initializeOptimisticReportNamesContext().catch(() => {
    Log.warn('Failed to initialize OptimisticReportNames context');
});

let requestIndex = 0;

type OnyxData = {
    optimisticData?: OnyxUpdate[];
    successData?: OnyxUpdate[];
    failureData?: OnyxUpdate[];
    finallyData?: OnyxUpdate[];
    queueFlushedData?: OnyxUpdate[];
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

    let shouldApplyOptimisticData = true;
    if (conflictResolver?.checkAndFixConflictingRequest) {
        const requests = getAll();
        const {conflictAction} = conflictResolver.checkAndFixConflictingRequest(requests);
        shouldApplyOptimisticData = conflictAction.type !== 'noAction';
    }

    const {optimisticData, ...onyxDataWithoutOptimisticData} = onyxData;
    if (optimisticData && shouldApplyOptimisticData) {
        Log.info('[API] Applying optimistic data', false, {command, type});

        // Process optimistic data through report name middleware
        // Skip for OpenReport command to avoid unnecessary processing
        if (command === WRITE_COMMANDS.OPEN_REPORT) {
            Onyx.update(optimisticData);
        } else {
            try {
                const context = getUpdateContext();
                const processedOptimisticData = OptimisticReportNames.updateOptimisticReportNamesFromUpdates(optimisticData, context);
                Onyx.update(processedOptimisticData);
            } catch (error) {
                Log.hmmm('[API] Failed to process optimistic report names', {error});
                // Fallback to original optimistic data if processing fails
                Onyx.update(optimisticData);
            }
        }
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
        pushToSequentialQueue(request);
        return Promise.resolve();
    }

    // Read requests are processed right away, but don't return the response to the caller
    if (type === CONST.API_REQUEST_TYPE.READ) {
        processWithMiddleware(request);
        return Promise.resolve();
    }

    // Requests with side effects process right away, and return the response to the caller
    return processWithMiddleware(request);
}

/**
 * All calls to API.write() will be persisted to disk as JSON with the params, successData, and failureData (or finallyData, if included in place of the former two values).
 * This is so that if the network is unavailable or the app is closed, we can send the WRITE request later.
 */

function write<TCommand extends WriteCommand>(
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData = {},
    conflictResolver: RequestConflictResolver = {},
): Promise<void | Response> {
    Log.info('[API] Called API write', false, {command, ...apiCommandParameters});

    // List of commands linked to workspace settings that should complete the reviewWorkspaceSettings onboarding task.
    const workspaceCommands: WriteCommand[] = [
        WRITE_COMMANDS.SET_WORKSPACE_AUTO_REPORTING_FREQUENCY,
        WRITE_COMMANDS.SET_WORKSPACE_AUTO_REPORTING_MONTHLY_OFFSET,
        WRITE_COMMANDS.SET_WORKSPACE_APPROVAL_MODE,
        WRITE_COMMANDS.SET_WORKSPACE_PAYER,
        WRITE_COMMANDS.SET_WORKSPACE_REIMBURSEMENT,
        WRITE_COMMANDS.ADD_BILLING_CARD_AND_REQUEST_WORKSPACE_OWNER_CHANGE,
        WRITE_COMMANDS.VERIFY_SETUP_INTENT_AND_REQUEST_POLICY_OWNER_CHANGE,
        WRITE_COMMANDS.UPDATE_WORKSPACE_AVATAR,
        WRITE_COMMANDS.DELETE_WORKSPACE_AVATAR,
        WRITE_COMMANDS.UPDATE_WORKSPACE_GENERAL_SETTINGS,
        WRITE_COMMANDS.UPDATE_WORKSPACE_DESCRIPTION,
        WRITE_COMMANDS.UPDATE_POLICY_ADDRESS,
        WRITE_COMMANDS.DISCONNECT_WORKSPACE_RECEIPT_PARTNER,
        WRITE_COMMANDS.POLICY_UBER_AUTO_INVITE,
        WRITE_COMMANDS.POLICY_UBER_AUTO_REMOVE,
        WRITE_COMMANDS.REQUEST_EXPENSIFY_CARD_LIMIT_INCREASE,
        WRITE_COMMANDS.UPDATE_POLICY_MEMBERS_CUSTOM_FIELDS,
        WRITE_COMMANDS.ENABLE_POLICY_CONNECTIONS,
        WRITE_COMMANDS.TOGGLE_RECEIPT_PARTNERS,
        WRITE_COMMANDS.ENABLE_DISTANCE_REQUEST_TAX,
        WRITE_COMMANDS.SET_POLICY_CUSTOM_TAX_NAME,
        WRITE_COMMANDS.SET_POLICY_TAXES_CURRENCY_DEFAULT,
        WRITE_COMMANDS.SET_POLICY_TAXES_FOREIGN_CURRENCY_DEFAULT,
        WRITE_COMMANDS.DOWNGRADE_TO_TEAM,
        WRITE_COMMANDS.SET_WORKSPACE_DEFAULT_SPEND_CATEGORY,
        WRITE_COMMANDS.SET_POLICY_EXPENSE_MAX_AMOUNT_NO_RECEIPT,
        WRITE_COMMANDS.SET_POLICY_EXPENSE_MAX_AMOUNT,
        WRITE_COMMANDS.SET_POLICY_PROHIBITED_EXPENSES,
        WRITE_COMMANDS.SET_POLICY_EXPENSE_MAX_AGE,
        WRITE_COMMANDS.UPDATE_CUSTOM_RULES,
        WRITE_COMMANDS.SET_POLICY_BILLABLE_MODE,
        WRITE_COMMANDS.SET_POLICY_REIMBURSABLE_MODE,
        WRITE_COMMANDS.DISABLE_POLICY_BILLABLE_MODE,
        WRITE_COMMANDS.SET_WORKSPACE_ERECEIPTS_ENABLED,
        WRITE_COMMANDS.SET_POLICY_ATTENDEE_TRACKING_ENABLED,
        WRITE_COMMANDS.SET_POLICY_DEFAULT_REPORT_TITLE,
        WRITE_COMMANDS.SET_POLICY_PREVENT_MEMBER_CREATED_TITLE,
        WRITE_COMMANDS.SET_POLICY_PREVENT_SELF_APPROVAL,
        WRITE_COMMANDS.SET_POLICY_AUTOMATIC_APPROVAL_LIMIT,
        WRITE_COMMANDS.SET_POLICY_AUTOMATIC_APPROVAL_RATE,
        WRITE_COMMANDS.ENABLE_POLICY_AUTO_APPROVAL_OPTIONS,
        WRITE_COMMANDS.SET_POLICY_AUTO_REIMBURSEMENT_LIMIT,
        WRITE_COMMANDS.ENABLE_POLICY_AUTO_REIMBURSEMENT_LIMIT,
        WRITE_COMMANDS.UPDATE_INVOICE_COMPANY_NAME,
        WRITE_COMMANDS.UPDATE_INVOICE_COMPANY_WEBSITE,
        WRITE_COMMANDS.PAY_AND_DOWNGRADE,
        WRITE_COMMANDS.TOGGLE_POLICY_PER_DIEM,
        WRITE_COMMANDS.UPGRADE_TO_CORPORATE,
        WRITE_COMMANDS.ENABLE_POLICY_DISTANCE_RATES,
        WRITE_COMMANDS.ENABLE_POLICY_EXPENSIFY_CARDS,
        WRITE_COMMANDS.ENABLE_POLICY_COMPANY_CARDS,
        WRITE_COMMANDS.TOGGLE_RECEIPT_PARTNERS,
        WRITE_COMMANDS.ENABLE_POLICY_CATEGORIES,
        WRITE_COMMANDS.ENABLE_POLICY_TAGS,
        WRITE_COMMANDS.ENABLE_POLICY_TAXES,
        WRITE_COMMANDS.ENABLE_POLICY_REPORT_FIELDS,
        WRITE_COMMANDS.ENABLE_POLICY_WORKFLOWS,
        WRITE_COMMANDS.SET_POLICY_RULES_ENABLED,
        WRITE_COMMANDS.ENABLE_POLICY_INVOICING,
    ];

    let onyxDataWithOnboardingData: OnyxData | undefined;
    // Check if this command is linked to setting a workspace which should complete the reviewWorkspaceSettings task.
    if (workspaceCommands.includes(command)) {
        const {optimisticData, successData, failureData} = getFinishOnboardingTaskOnyxData(CONST.ONBOARDING_TASK_TYPE.REVIEW_WORKSPACE_SETTINGS, true);

        onyxDataWithOnboardingData = {
            ...onyxData,
            optimisticData: [...(onyxData.optimisticData ?? []), ...(optimisticData ?? [])],
            successData: [...(onyxData.successData ?? []), ...(successData ?? [])],
            failureData: [...(onyxData.failureData ?? []), ...(failureData ?? [])],
        };
    }

    const request = prepareRequest(command, CONST.API_REQUEST_TYPE.WRITE, apiCommandParameters, onyxDataWithOnboardingData ?? onyxData, conflictResolver);
    return processRequest(request, CONST.API_REQUEST_TYPE.WRITE);
}

/**
 * This function is used to write data to the API while ensuring that there are no duplicate requests in the queue.
 * If a duplicate request is found, it resolves the conflict by replacing the duplicated request with the new one.
 */
function writeWithNoDuplicatesConflictAction<TCommand extends WriteCommand>(
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData = {},
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
    onyxData: OnyxData = {},
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
    if (getPersistedRequestsLength() > 0) {
        Log.info(`[API] '${command}' is waiting on ${getPersistedRequestsLength()} write commands`);
    }
    return waitForSequentialQueueIdle();
}

/**
 * Requests made with this method are not be persisted to disk. If there is no network connectivity, the request is ignored and discarded.
 */
function read<TCommand extends ReadCommand>(command: TCommand, apiCommandParameters: ApiRequestCommandParameters[TCommand], onyxData: OnyxData = {}): void {
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
    onyxData: OnyxData,
    config: PaginationConfig,
): Promise<Response | void>;
function paginate<TRequestType extends typeof CONST.API_REQUEST_TYPE.READ, TCommand extends CommandOfType<TRequestType>>(
    type: TRequestType,
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData,
    config: PaginationConfig,
): void;
function paginate<TRequestType extends typeof CONST.API_REQUEST_TYPE.WRITE, TCommand extends CommandOfType<TRequestType>>(
    type: TRequestType,
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData,
    config: PaginationConfig,
    conflictResolver?: RequestConflictResolver,
): void;
function paginate<TRequestType extends ApiRequestType, TCommand extends CommandOfType<TRequestType>>(
    type: TRequestType,
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData,
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

export {write, makeRequestWithSideEffects, read, paginate, writeWithNoDuplicatesConflictAction, writeWithNoDuplicatesEnableFeatureConflicts};
