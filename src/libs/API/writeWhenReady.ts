import Log from '@libs/Log';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import CONST from '@src/CONST';
import type {OnyxData} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import {AppState} from 'react-native';

import type {ApiRequestCommandParameters, WriteCommand} from './types';

import {buildLogParams} from './makeRequest';
import write from './write';

/** Readiness check for `writeWhenReady`: the write happens once the returned promise settles - a rejection releases it too, since the barrier only answers "when" to write, never "whether". */
type WriteReadyBarrier = (signal: AbortSignal) => PromiseLike<unknown>;

type ReleaseReason = 'success' | 'rejected' | 'safetyTimeout' | 'appBackground';

type WriteWhenReadyOptions = {
    safetyTimeoutMs?: number;

    /** Fires exactly once, on every release path, before `write()` is invoked. A throwing handler is logged, not thrown. */
    onRelease?: (reason: ReleaseReason) => void;

    /** Fires only after `write()` has been called and returned without throwing. A throwing handler is logged, not thrown. */
    onWriteStarted?: () => void;
};

// Must stay longer than the default barrier's worst case (a unit test pins that); exported so that test asserts the real value.
const SAFETY_TIMEOUT_MS = 5 * CONST.MAX_TRANSITION_DURATION_MS;

// Tracked so pending deferred writes can be force-flushed before the OS suspends a backgrounded app.
const pendingWrites = new Set<() => void>();

let hasRegisteredBackgroundFlushListener = false;

/** Subscribes to AppState lazily on the first deferred write, so importers that never defer don't pay for it. */
function registerBackgroundFlushListener() {
    if (hasRegisteredBackgroundFlushListener) {
        return;
    }
    hasRegisteredBackgroundFlushListener = true;

    // Only `background` (not the transient `inactive`) is the last event before the OS can suspend the process.
    AppState.addEventListener('change', (nextState) => {
        if (nextState !== CONST.APP_STATE.BACKGROUND || pendingWrites.size === 0) {
            return;
        }
        Log.info(`[API] App going to "${nextState}" - flushing ${pendingWrites.size} pending writeWhenReady write(s)`, false);
        // Copy first: a flush can synchronously queue another deferred write, which must not join this same loop.
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
 * Builds a barrier that resolves once the current or upcoming transition completes.
 * `waitFor: 'navigation'` requires a screen transition specifically, so a stray modal/keyboard
 * animation can't release the write early - at the cost of waiting out `MAX_TRANSITION_START_WAIT_MS`
 * if no screen transition starts.
 */
function createTransitionBarrier(waitFor: true | 'navigation' = true): WriteReadyBarrier {
    return (signal) =>
        new Promise<void>((resolve) => {
            const handle = TransitionTracker.runAfterTransitions({
                callback: () => resolve(),
                waitForUpcomingTransition: waitFor,
            });
            // Left pending on abort - resolving/rejecting here would execute the write the signal cancelled.
            signal.addEventListener('abort', () => handle.cancel());
        });
}

const waitForTransition = createTransitionBarrier();

/** A transition barrier that was attached to `TransitionTracker` before the write it gates existed; `cancel` drops the registration if the write never happens. */
type ArmedTransitionBarrier = {
    barrier: WriteReadyBarrier;
    cancel: () => void;
};

/**
 * Use when a caller navigates first and only builds the write afterward, once the navigation has
 * already finished: attaching the default barrier that late would miss the transition and fall
 * through to the safety timeout. Arm this instead when navigation triggers, then pass the resulting
 * barrier to `writeWhenReady` once the write is built; one armed barrier can gate several writes from
 * the same interaction (e.g. one per receipt in a split), releasing them together.
 */
function armTransitionBarrier(waitFor: true | 'navigation' = true): ArmedTransitionBarrier {
    const armController = new AbortController();
    const armed = createTransitionBarrier(waitFor)(armController.signal);

    return {
        barrier: () => armed,
        cancel: () => armController.abort(),
    };
}

/**
 * Like `write()`, but both the optimistic update and the request are deferred until `barrier` settles
 * (or `safetyTimeoutMs` elapses, whichever comes first), then delegates to the normal `write()` pipeline.
 *
 * Caveats:
 *   - A barrier rejection is not a cancellation: the write still executes (the rejection is only
 *     logged). The barrier answers "when" to write, never "whether" - gate a conditional write before
 *     the call, not by rejecting the barrier.
 *   - Does not support `write()`'s `conflictResolver`: a deferred request isn't in the sequential
 *     queue or considered for conflict resolution until it actually executes.
 *   - Call order isn't preserved across independent `writeWhenReady` calls - their barriers race.
 *
 * Caution:
 *   - The default barrier waits for any transition (~2s worst case if none starts). Pass
 *     `createTransitionBarrier('navigation')` to gate on a screen transition only, or a custom barrier.
 *   - We best-effort flush pending writes when the app backgrounds, but there's no flush on a hard
 *     kill or crash - a deferred write can simply be lost. Don't defer writes where losing one would
 *     leave something unrecoverable or hard to reconcile; losing one that's merely annoying to redo
 *     is an acceptable risk.
 *
 * @returns A promise that resolves with the underlying `write()` result once the write executes.
 */
function writeWhenReady<TCommand extends WriteCommand>(command: TCommand, apiCommandParameters: ApiRequestCommandParameters[TCommand]): Promise<void | Response<never>>;
function writeWhenReady<TCommand extends WriteCommand, TKey extends OnyxKey>(
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData?: OnyxData<TKey>,
    barrier?: WriteReadyBarrier,
    options?: number | WriteWhenReadyOptions,
): Promise<void | Response<TKey>>;
function writeWhenReady<TCommand extends WriteCommand, TKey extends OnyxKey>(
    command: TCommand,
    apiCommandParameters: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData<TKey> = {},
    barrier: WriteReadyBarrier = waitForTransition,
    options: number | WriteWhenReadyOptions = {},
): Promise<void | Response<TKey>> {
    Log.info('[API] Called API writeWhenReady', false, buildLogParams(command, apiCommandParameters ?? {}));

    // A bare number for `options` is treated as `safetyTimeoutMs`.
    const {safetyTimeoutMs = SAFETY_TIMEOUT_MS, onRelease, onWriteStarted} = typeof options === 'number' ? {safetyTimeoutMs: options} : options;

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
                // Abort only on early-release paths - on 'success'/'rejected' the barrier already settled.
                if (reason === 'safetyTimeout' || reason === 'appBackground') {
                    abortController.abort();
                }

                if (reason !== 'success') {
                    Log.warn(`[API] writeWhenReady released via "${reason}" - the barrier did not release the write`, {
                        command,
                        ...(reason === 'rejected' ? {error: barrierError} : {}),
                    });
                }

                // Isolated so onRelease can never block or fail the write.
                try {
                    onRelease?.(reason);
                } catch (error) {
                    Log.warn('[API] writeWhenReady onRelease threw', {command, error});
                }

                write(command, apiCommandParameters, onyxData).then(resolve, reject);

                // Isolated so a throwing side effect can't be mistaken for a failed write.
                try {
                    onWriteStarted?.();
                } catch (error) {
                    Log.warn('[API] writeWhenReady onWriteStarted threw', {
                        command,
                        error,
                    });
                }
            } catch (error) {
                reject(error);
            }
        };

        registerBackgroundFlushListener();
        flushOnBackground = () => execute('appBackground');

        // The AppState listener only catches new transitions, so an app already in the background when the write is queued must flush here directly.
        if (AppState.currentState === CONST.APP_STATE.BACKGROUND) {
            execute('appBackground');
            return;
        }

        pendingWrites.add(flushOnBackground);

        safetyTimeoutID = setTimeout(() => execute('safetyTimeout'), Math.max(0, safetyTimeoutMs));

        // Caught so a synchronous throw is funneled into the rejection path instead of escaping.
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

export {writeWhenReady, createTransitionBarrier, armTransitionBarrier, SAFETY_TIMEOUT_MS};
export type {WriteReadyBarrier, WriteWhenReadyOptions};
