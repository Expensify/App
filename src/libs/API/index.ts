import {readUpdateIDFrom, resolveDuplicationConflictAction, resolveEnableFeatureConflicts, resolveReconnectDuplicationConflictAction} from '@libs/actions/RequestConflictUtils';
import type {AnyRequestMatcher, EnablePolicyFeatureCommand} from '@libs/actions/RequestConflictUtils';
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
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {push as pushToSequentialQueue, waitForIdle as waitForSequentialQueueIdle} from '@libs/Network/SequentialQueue';
import {getIsOffline} from '@libs/NetworkState';
import Pusher from '@libs/Pusher';
import {addMiddleware, processWithMiddleware} from '@libs/Request';
import sanitizeLogParams from '@libs/sanitizeLogParams';

import {getAll, getOngoingRequest, getLength as getPersistedRequestsLength} from '@userActions/PersistedRequests';

import CONST from '@src/CONST';
import type OnyxRequest from '@src/types/onyx/Request';
import type {AnyRequest, OnyxData, PaginatedRequest, PaginationConfig, RequestConflictResolver} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';
import type {SetRequired} from 'type-fest';

import {AppState} from 'react-native';
import Onyx from 'react-native-onyx';

import type {ApiCommand, ApiRequestCommandParameters, ApiRequestType, CommandOfType, ReadCommand, SideEffectRequestCommand, WriteCommand} from './types';

import {READ_COMMANDS} from './types';

// Setup API middlewares. Each request made will pass through a series of middleware functions that will get called in sequence (each one passing the result of the previous to the next).
// Note: The ordering here is intentional as we want to Log, Recheck Connection, Reauthenticate, and Save the Response in Onyx. Errors thrown in one middleware will bubble to the next.
// e.g. an error thrown in Logging or Reauthenticate logic will be caught by the next middleware or the SequentialQueue which retries failing requests.

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

/**
 * All calls to API.write() will be persisted to disk as JSON with the params, successData, and failureData (or finallyData, if included in place of the former two values).
 * This is so that if the network is unavailable or the app is closed, we can send the WRITE request later.
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
    Log.info('[API] Called API write', false, buildLogParams(command, apiCommandParameters ?? {}));
    const request = prepareRequest(command, CONST.API_REQUEST_TYPE.WRITE, apiCommandParameters, onyxData, conflictResolver);

    return processRequest(request, CONST.API_REQUEST_TYPE.WRITE);
}

/**
 * A barrier that also exposes a `cancel` to release whatever it is waiting on. `writeWhenReady` calls
 * this only when it executes the write before the barrier has settled (released early via the safety
 * timeout, or because the app backgrounds), so a still-pending barrier doesn't leave a dangling
 * registration. When the barrier itself releases the write, it has already settled and `cancel` is not
 * called. Exposing `cancel` is optional - a plain promise-like works too.
 */
type CancelableBarrier = PromiseLike<unknown> & {cancel: () => void};

/**
 * A readiness signal for `writeWhenReady`: a promise-like that resolves once it is safe to apply the
 * write's optimistic data (e.g. after a navigation transition finishes), or a function returning one
 * (invoked when the write is queued). Either form may instead be a `CancelableBarrier`, whose `cancel`
 * is invoked if the write fires before the barrier settles. A rejection is treated the same as
 * resolving - the write executes anyway.
 */
type WriteReadyBarrier = PromiseLike<unknown> | CancelableBarrier | (() => PromiseLike<unknown> | CancelableBarrier);

function isCancelableBarrier(value: unknown): value is CancelableBarrier {
    return typeof value === 'object' && value !== null && 'cancel' in value && typeof value.cancel === 'function';
}

/**
 * Why a deferred write was released. `barrier` is the happy path (the barrier resolved); the others all
 * mean the barrier did not cleanly release the write - it rejected, timed out, or the app backgrounded
 * first - and are logged distinctly.
 */
type WriteWhenReadyReleaseReason = 'barrier' | 'barrierRejected' | 'safetyTimeout' | 'appBackground';

// Default upper bound on how long writeWhenReady waits for a barrier before executing regardless, so
// a barrier that never settles can never strand the write. A generous multiple of the max transition
// duration: long enough that the bounded default barrier always wins the race, short enough to still
// bound a stuck custom barrier. Callers with a legitimately slower custom barrier can raise it via the
// `safetyTimeoutMs` argument.
// NOTE: the default barrier's worst case is MAX_TRANSITION_START_WAIT_MS + MAX_TRANSITION_DURATION_MS,
// so this timeout must stay above that sum for the "default barrier always wins" invariant to hold. The
// x5 margin covers it while both constants are ~equal; a unit test pins the invariant against drift.
const SAFETY_TIMEOUT_TRANSITION_MULTIPLIER = 5;
const WRITE_WHEN_READY_SAFETY_TIMEOUT_MS = CONST.MAX_TRANSITION_DURATION_MS * SAFETY_TIMEOUT_TRANSITION_MULTIPLIER;

// Deferred writes still waiting on their barrier. Tracked so they can be force-flushed when the app
// backgrounds: JS timers are suspended in the background, so the per-write safety timeout cannot be
// relied on to fire before the OS suspends/kills the process, and the optimistic data + queued
// request would otherwise be lost.
const pendingWriteWhenReadyFlushes = new Set<() => void>();

let hasRegisteredBackgroundFlushListener = false;

// Subscribe to AppState lazily, on the first deferred write, so importers that never call
// writeWhenReady don't pay for the subscription. Once registered the listener is intentionally never
// removed - it lives as long as the app (matching other module singletons) and guards every later
// deferred write.
function registerBackgroundFlushListener() {
    if (hasRegisteredBackgroundFlushListener) {
        return;
    }
    hasRegisteredBackgroundFlushListener = true;

    // Flush only on a full `background` transition, not the transient `inactive` state (Control Center,
    // the app switcher, permission/biometric prompts) - flushing on those would defeat the perf point
    // by running the optimistic re-render during a blip the user immediately returns from. `background`
    // is the last event before the OS can suspend the process, so flushing here applies the optimistic
    // data and enqueues the request for persistence (best-effort - Onyx disk writes are async) before
    // suspension.
    AppState.addEventListener('change', (nextState) => {
        if (nextState !== CONST.APP_STATE.BACKGROUND || pendingWriteWhenReadyFlushes.size === 0) {
            return;
        }
        Log.info(`[API] App going to "${nextState}" - flushing ${pendingWriteWhenReadyFlushes.size} pending writeWhenReady write(s)`, false);
        // Isolate each flush (like TransitionTracker does its callbacks) so one throwing write can't abort
        // the loop and strand the remaining pending writes right before the process is suspended. `execute`
        // is already throw-safe; this is defense-in-depth.
        for (const flush of [...pendingWriteWhenReadyFlushes]) {
            try {
                flush();
            } catch (error) {
                Log.warn('[API] writeWhenReady background flush threw', {error});
            }
        }
    });
}

/**
 * Default `writeWhenReady` barrier: resolves once the current or upcoming navigation transition
 * completes. Bounded by TransitionTracker (it stops waiting for an upcoming transition after
 * CONST.MAX_TRANSITION_START_WAIT_MS and auto-ends transitions after CONST.MAX_TRANSITION_DURATION_MS),
 * so it always resolves. Exposes `cancel` so `writeWhenReady` can drop the TransitionTracker
 * registration if the write is released before the transition finishes.
 */
function waitForNavigationTransition(): CancelableBarrier {
    let handle: {cancel: () => void} | undefined;
    const promise = new Promise<void>((resolve) => {
        // The executor runs synchronously, so `handle` is assigned before this function returns.
        handle = TransitionTracker.runAfterTransitions({
            callback: () => resolve(),
            waitForUpcomingTransition: true,
        });
    });
    // Return a thin thenable rather than mutating the native Promise with a `cancel` property.
    return {
        then: (onFulfilled, onRejected) => promise.then(onFulfilled, onRejected),
        cancel: () => handle?.cancel(),
    };
}

function writeWhenReady<TCommand extends WriteCommand>(command: TCommand, apiCommandParameters: ApiRequestCommandParameters[TCommand]): Promise<void | Response<never>>;

function writeWhenReady<TCommand extends WriteCommand, TKey extends OnyxKey>(
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData?: OnyxData<TKey>,
    barrier?: WriteReadyBarrier,
    safetyTimeoutMs?: number,
): Promise<void | Response<TKey>>;

/**
 * Like `write()`, but defers the entire write - including its optimistic Onyx updates - until a
 * readiness signal fires. By default it waits for the navigation transition to complete, so the
 * expensive optimistic re-render doesn't compete with the transition animation for the main thread.
 * Pass a custom `barrier` (a promise-like, or a function returning one) to wait for a different
 * signal instead.
 *
 * Once ready, it delegates to the normal `write()` pipeline, so optimistic/success/failure handling,
 * retries, and queue ordering are all unchanged. (Request de-duplication via `write()`'s
 * `conflictResolver` is not exposed here - deferred writes always use the default, no-op resolver. A
 * command that normally goes through `writeWithNoDuplicates*` could enqueue two identical requests if
 * rapidly double-triggered while deferred; migrate such commands only with a plan for that.) Note that
 * deferring necessarily moves this write later in the queue relative to writes dispatched immediately
 * after it - that is the intended trade-off.
 *
 * Because the optimistic data is *also* deferred, the user sees no optimistic feedback until the
 * barrier fires. That is invisible when the barrier is a navigate-away (the user is watching the
 * transition, not this screen), so prefer the default barrier only when the user has actually left the
 * screen; a custom barrier that keeps the user on-screen can feel laggy. Note the default barrier waits
 * for an *upcoming* transition, so if the caller does NOT navigate it adds up to roughly
 * `CONST.MAX_TRANSITION_START_WAIT_MS + CONST.MAX_TRANSITION_DURATION_MS` (~2s) of latency before the
 * write fires on that timeout - another reason to only default it on a genuine navigate-away.
 *
 * Because the background flush is best-effort (see below), do NOT use `writeWhenReady` for writes where
 * losing the optimistic update on a background-race would be harmful - e.g. money movement or report
 * submission. Use it for cosmetic/deferrable writes whose momentary loss on a hard kill is acceptable.
 *
 * The write always eventually fires: a safety timeout (`safetyTimeoutMs`, defaulting to
 * {@link WRITE_WHEN_READY_SAFETY_TIMEOUT_MS}; a non-positive value is clamped to `0` so the timeout
 * fires on the next macrotask - this minimizes, but does not strictly disable, deferral, since an
 * already-resolved barrier still settles first on a microtask) covers a barrier that never settles, and
 * a pending write is flushed immediately if the app backgrounds (so its optimistic data is applied and
 * the request is enqueued for persistence - best-effort, since Onyx disk writes are async - before the
 * process is suspended). Both of those cases - and a barrier rejection - are logged distinctly, since
 * they mean the intended barrier did not release the write. A caller whose custom barrier can
 * legitimately take longer than the default timeout should raise `safetyTimeoutMs` accordingly.
 *
 * @returns A promise that resolves with the underlying `write()` result once the write executes.
 */
function writeWhenReady<TCommand extends WriteCommand, TKey extends OnyxKey>(
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData<TKey> = {},
    barrier: WriteReadyBarrier = waitForNavigationTransition,
    safetyTimeoutMs: number = WRITE_WHEN_READY_SAFETY_TIMEOUT_MS,
): Promise<void | Response<TKey>> {
    Log.info('[API] Called API writeWhenReady', false, buildLogParams(command, apiCommandParameters ?? {}));

    return new Promise((resolve, reject) => {
        let hasExecuted = false;
        // These three are read by `execute` but assigned below it; `let` closures capture the binding, not
        // the value, so the placeholders are safe until the real values are wired up on the next lines.
        let flushOnBackground: () => void = () => {};
        let safetyTimeoutId: ReturnType<typeof setTimeout> | undefined;
        let cancelBarrier: () => void = () => {};
        let barrierError: unknown;

        const execute = (reason: WriteWhenReadyReleaseReason) => {
            if (hasExecuted) {
                return;
            }
            hasExecuted = true;

            // Everything here runs defensively: a synchronous throw (from write() or prepareRequest) must
            // settle the returned promise via reject rather than leave it pending forever - and, on the
            // background path, must not escape into the flush loop and strand the other pending writes. (A
            // throw from cancelBarrier() is handled separately below so it never drops the write.)
            try {
                clearTimeout(safetyTimeoutId);
                pendingWriteWhenReadyFlushes.delete(flushOnBackground);
                // Release the barrier only on the early-release paths (safety timeout / app background),
                // where the barrier may still be pending and would otherwise leave a dangling registration.
                // On the 'barrier'/'barrierRejected' paths the barrier has already settled, so there is
                // nothing to cancel. cancel() is best-effort cleanup and these paths are meant to force the
                // write through, so isolate a throwing cancel() here - letting it reject would drop the very
                // write this path exists to guarantee.
                if (reason === 'safetyTimeout' || reason === 'appBackground') {
                    try {
                        cancelBarrier();
                    } catch (error) {
                        Log.warn('[API] writeWhenReady barrier cancel() threw during forced release - proceeding with the write', {command, error});
                    }
                }

                if (reason !== 'barrier') {
                    Log.warn(`[API] writeWhenReady released via "${reason}" - the barrier did not release the write`, {
                        command,
                        ...(reason === 'barrierRejected' ? {error: barrierError} : {}),
                    });
                }

                write(command, apiCommandParameters, onyxData).then(resolve, reject);
            } catch (error) {
                reject(error);
            }
        };

        registerBackgroundFlushListener();
        flushOnBackground = () => execute('appBackground');
        pendingWriteWhenReadyFlushes.add(flushOnBackground);

        safetyTimeoutId = setTimeout(() => execute('safetyTimeout'), Math.max(0, safetyTimeoutMs));

        // Resolve the barrier to its value once - invoking a thunk inside a try/catch so a synchronously-
        // thrown error is funneled into the rejection path instead of escaping - then capture its `cancel`
        // handle (if any) so a still-pending barrier can be released once the write has executed.
        let barrierValue: unknown;
        try {
            barrierValue = typeof barrier === 'function' ? barrier() : barrier;
        } catch (error) {
            barrierValue = Promise.reject(error);
        }
        if (isCancelableBarrier(barrierValue)) {
            const cancelableBarrier = barrierValue;
            cancelBarrier = () => cancelableBarrier.cancel();
        }
        Promise.resolve(barrierValue).then(
            () => execute('barrier'),
            (error: unknown) => {
                barrierError = error;
                execute('barrierRejected');
            },
        );
    });
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
    makeRequestWithSideEffects,
    read,
    paginate,
    writeWithNoDuplicatesConflictAction,
    writeWithNoDuplicatesReconnectConflictAction,
    writeWithNoDuplicatesEnableFeatureConflicts,
    waitForWrites,
};
export type {WriteReadyBarrier};
