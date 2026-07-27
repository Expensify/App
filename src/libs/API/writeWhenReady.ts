import Log from '@libs/Log';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import CONST from '@src/CONST';
import type {OnyxData} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import {AppState} from 'react-native';

import type {ApiRequestCommandParameters, WriteCommand} from './types';

import {buildLogParams} from './requestPipeline';
import write from './write';

/**
 * A readiness check used by `writeWhenReady`. It is called when the write is queued, and the write happens
 * once the returned promise settles (a rejection releases the write too).
 * It also receives an `AbortSignal` that fires if the write is released early (safety timeout / app
 * background), so a barrier waiting on something cancelable can drop its registration instead of leaving it dangling.
 */
type WriteReadyBarrier = (signal: AbortSignal) => PromiseLike<unknown>;

type ReleaseReason = 'success' | 'rejected' | 'safetyTimeout' | 'appBackground';

// How long writeWhenReady waits for the barrier before executing, so the write happens even if the promise never settles.
// Must stay longer than the default barrier's worst case (CONST.MAX_TRANSITION_START_WAIT_MS + CONST.MAX_TRANSITION_DURATION_MS); a unit test pins that against drift.
const SAFETY_TIMEOUT_MS = 5 * CONST.MAX_TRANSITION_DURATION_MS;

// Pending deferred writes. Tracked so they can be force-flushed when the app backgrounds.
// Because JS timers are suspended in the background, we flush before the OS suspends the process.
// That ensures the optimistic data + queued request are not lost.
const pendingWrites = new Set<() => void>();

let hasRegisteredBackgroundFlushListener = false;

/**
 * Subscribe to AppState lazily on the first deferred write,
 * so importers that never call writeWhenReady don't pay for the subscription.
 */
function registerBackgroundFlushListener() {
    if (hasRegisteredBackgroundFlushListener) {
        return;
    }
    hasRegisteredBackgroundFlushListener = true;

    // Flush only on a full `background` transition, not the transient `inactive` state (Control Center, the app switcher, permission/biometric prompts).
    // `background` is the last event before the OS can suspend the process, so it's our best opportunity for a last-minute, best-effort flush.
    AppState.addEventListener('change', (nextState) => {
        if (nextState !== CONST.APP_STATE.BACKGROUND || pendingWrites.size === 0) {
            return;
        }
        Log.info(`[API] App going to "${nextState}" - flushing ${pendingWrites.size} pending writeWhenReady write(s)`, false);
        // Isolate each flush so one throwing write can't abort the loop and strand the remaining pending writes.
        // The copy guards against a flush synchronously queueing another deferred write, which would otherwise be flushed in this same loop.
        for (const flush of [...pendingWrites]) {
            try {
                flush();
            } catch (error) {
                Log.warn('[API] writeWhenReady background flush threw', {error});
            }
        }
    });
}

/**
 * Default `writeWhenReady` barrier: resolves once the current or upcoming navigation transition completes.
 */
function waitForNavigationTransition(signal: AbortSignal): Promise<void> {
    return new Promise((resolve) => {
        const handle = TransitionTracker.runAfterTransitions({
            callback: () => resolve(),
            waitForUpcomingTransition: true,
        });
        // On abort, drop the TransitionTracker registration.
        // The promise is intentionally left pending because resolving or rejecting would execute the write that was cancelled via the signal
        signal.addEventListener('abort', () => handle.cancel());
    });
}

/**
 * Like `write()`, but deferred until a readiness signal (barrier) is fired.
 *   - Optimistic updates are intentionally deferred, as well as the API request itself.
 *   - Once ready, it delegates to the normal `write()` pipeline.
 *   - The write is executed after `safetyTimeoutMs`, regardless of whether the barrier promise has settled.
 *
 * Caveats:
 *   - This currently does not support the `conflictResolver` param of `write()`.
 *     Any request queued via `writeWhenReady` will not enter the sequential queue or be considered in conflict resolution until the deferred execution happens
 *   - Call order is NOT preserved across multiple deferred writes. If two independent `writeWhenReady` calls are queued, the two barriers race each other.
 *     If you need to preserve call order, it must be managed by callers: the later barrier must await resolution of the former.
 *
 * Caution:
 *   - By default, it waits for the navigation transition to complete, so re-renders from optimistic writes don't compete with the transition animation.
 *     If no navigation happens, then the write is deferred by roughly `CONST.MAX_TRANSITION_START_WAIT_MS + CONST.MAX_TRANSITION_DURATION_MS` (~2s).
 *     The default behavior can be overridden by passing a custom `barrier`
 *   - In the edge case where a user backgrounds or hard-kills the app before the write finishes, we make a best-effort to flush pending writes.
 *     This is not guaranteed to succeed, so critical writes (such as ones that move money) should not be deferred.
 *
 * @returns A promise that resolves with the underlying `write()` result once the write executes.
 */
function writeWhenReady<TCommand extends WriteCommand>(command: TCommand, apiCommandParameters: ApiRequestCommandParameters[TCommand]): Promise<void | Response<never>>;
function writeWhenReady<TCommand extends WriteCommand, TKey extends OnyxKey>(
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData?: OnyxData<TKey>,
    barrier?: WriteReadyBarrier,
    safetyTimeoutMs?: number,
): Promise<void | Response<TKey>>;
function writeWhenReady<TCommand extends WriteCommand, TKey extends OnyxKey>(
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData<TKey> = {},
    barrier: WriteReadyBarrier = waitForNavigationTransition,
    safetyTimeoutMs: number = SAFETY_TIMEOUT_MS,
): Promise<void | Response<TKey>> {
    Log.info('[API] Called API writeWhenReady', false, buildLogParams(command, apiCommandParameters ?? {}));

    return new Promise((resolve, reject) => {
        let hasExecuted = false;
        let flushOnBackground: () => void = () => {};
        let safetyTimeoutID: ReturnType<typeof setTimeout> | undefined;
        const abortController = new AbortController();
        let barrierError: unknown;

        const execute = (reason: ReleaseReason) => {
            if (hasExecuted) {
                return;
            }
            hasExecuted = true;

            try {
                clearTimeout(safetyTimeoutID);
                pendingWrites.delete(flushOnBackground);
                // Abort on the early-release paths so that pending barriers can cleanup if they desire.
                // On the 'success'/'rejected' paths, the barrier has already settled, so there's nothing to release.
                // Barriers whose cleanup can throw should handle it in their own abort listener.
                if (reason === 'safetyTimeout' || reason === 'appBackground') {
                    abortController.abort();
                }

                if (reason !== 'success') {
                    Log.warn(`[API] writeWhenReady released via "${reason}" - the barrier did not release the write`, {
                        command,
                        ...(reason === 'rejected' ? {error: barrierError} : {}),
                    });
                }

                write(command, apiCommandParameters, onyxData).then(resolve, reject);
            } catch (error) {
                reject(error);
            }
        };

        registerBackgroundFlushListener();
        flushOnBackground = () => execute('appBackground');

        pendingWrites.add(flushOnBackground);

        safetyTimeoutID = setTimeout(() => execute('safetyTimeout'), Math.max(0, safetyTimeoutMs));

        // Invoke the barrier inside a try/catch so a synchronously-thrown error is funneled into the
        // rejection path instead of escaping.
        let barrierValue: PromiseLike<unknown>;
        try {
            barrierValue = barrier(abortController.signal);
        } catch (error) {
            barrierValue = Promise.reject(error);
        }
        Promise.resolve(barrierValue).then(
            () => execute('success'),
            (error: unknown) => {
                barrierError = error;
                execute('rejected');
            },
        );
    });
}

export {writeWhenReady};
export type {WriteReadyBarrier};
