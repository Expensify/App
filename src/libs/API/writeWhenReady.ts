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

/**
 * A readiness check used by `writeWhenReady`. It is called when the write is queued, and the write happens
 * once the returned promise settles (a rejection releases the write too).
 * It also receives an `AbortSignal` that fires if the write is released early (safety timeout / app
 * background), so a barrier waiting on something cancelable can drop its registration instead of leaving it dangling.
 */
type WriteReadyBarrier = (signal: AbortSignal) => PromiseLike<unknown>;

type ReleaseReason = 'success' | 'rejected' | 'safetyTimeout' | 'appBackground';

type WriteWhenReadyOptions = {
    safetyTimeoutMs?: number;

    /**
     * Fires exactly once, on every release path (including the already-backgrounded-at-call-time
     * path, and a barrier that throws synchronously), BEFORE `write()` is invoked. A throwing
     * `onRelease` is logged and does not block the write.
     */
    onRelease?: (reason: ReleaseReason) => void;

    /**
     * Fires only after `write()` has been called and returned without throwing - for bundling a
     * side effect (e.g. a notification) that today runs synchronously right after `API.write()`.
     * A throwing `onWriteStarted` is logged and does not affect the write's outcome.
     */
    onWriteStarted?: () => void;
};

// How long writeWhenReady waits for the barrier before executing, so the write happens even if the promise never settles.
// Must stay longer than the default barrier's worst case (CONST.MAX_TRANSITION_START_WAIT_MS + CONST.MAX_TRANSITION_DURATION_MS); a unit test pins that against drift.
// Exported for that test so it asserts on the real value rather than a copy of the formula.
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
 * Builds a `writeWhenReady` barrier that resolves once the current or upcoming transition completes.
 *
 * `waitFor` only selects which transition *opens the gate*: `true` (the default) accepts any transition,
 * `'navigation'` accepts only a screen transition. Once the gate is open, both wait for every active
 * transition to finish, regardless of kind.
 *
 * The default is `true` because the point of deferring is to keep the optimistic re-render off the main
 * thread while *something* is animating - a modal or the keyboard contends for it just like a screen push.
 * Pass `'navigation'` when the caller knows it navigates away and a stray modal/keyboard blip must not
 * release the write early; the trade-off is waiting out `CONST.MAX_TRANSITION_START_WAIT_MS` if no screen
 * transition ever starts.
 */
function createTransitionBarrier(waitFor: true | 'navigation' = true): WriteReadyBarrier {
    return (signal) =>
        new Promise<void>((resolve) => {
            const handle = TransitionTracker.runAfterTransitions({
                callback: () => resolve(),
                waitForUpcomingTransition: waitFor,
            });
            // On abort, drop the TransitionTracker registration.
            // The promise is intentionally left pending because resolving or rejecting would execute the write that was cancelled via the signal
            signal.addEventListener('abort', () => handle.cancel());
        });
}

const waitForTransition = createTransitionBarrier();

/**
 * A transition barrier that was attached to `TransitionTracker` before the write it gates exists.
 * `barrier` is passed to `writeWhenReady`; `cancel` drops the registration if the write never happens.
 */
type ArmedTransitionBarrier = {
    barrier: WriteReadyBarrier;
    cancel: () => void;
};

/**
 * Attach a transition barrier now, use it later.
 *
 * The default barrier only takes its fast path when `TransitionTracker` already knows a transition is
 * active or imminent at the moment the barrier is attached. A caller that navigates first and issues
 * the write from the navigation's own completion callback would attach after that transition ended,
 * so the barrier would wait for an unrelated future transition and fall through to the safety timeout.
 *
 * Arming splits the two moments: register with `TransitionTracker` at the point the navigation is
 * triggered, then hand the resulting barrier to `writeWhenReady` whenever the write is actually built.
 * If the transition already finished by then, the barrier is already resolved and the write runs
 * immediately.
 *
 * The same armed barrier can gate several writes from one interaction (e.g. one write per receipt in a
 * split); they all release at the same point rather than racing separate barriers.
 *
 * `cancel()` is for the abandoned path - the code armed a barrier and then decided not to write. It
 * leaves the barrier permanently pending, matching `createTransitionBarrier`'s abort contract, so a
 * cancelled barrier that is passed to `writeWhenReady` anyway still writes at the safety timeout
 * rather than never.
 */
function armTransitionBarrier(waitFor: true | 'navigation' = true): ArmedTransitionBarrier {
    const armController = new AbortController();
    const armed = createTransitionBarrier(waitFor)(armController.signal);
    let consumerCount = 0;
    let abortedConsumerCount = 0;

    return {
        barrier: (signal) => {
            consumerCount++;
            // Forward writeWhenReady's own abort (safety timeout / app background) so the TransitionTracker
            // registration is dropped instead of being left dangling after the write already went out.
            //
            // Only once every consumer has aborted, though: aborting leaves `armed` permanently pending by
            // design, so cancelling on the first consumer's timeout would strand the writes still waiting on
            // it until their own safety timeouts. With several writes from one interaction, one hitting its
            // timeout must not push the others onto the slow path.
            signal.addEventListener('abort', () => {
                abortedConsumerCount++;
                if (abortedConsumerCount < consumerCount) {
                    return;
                }
                armController.abort();
            });
            return armed;
        },
        cancel: () => armController.abort(),
    };
}

/**
 * Like `write()`, but deferred until a readiness signal (barrier) is fired.
 *   - Optimistic updates are intentionally deferred, as well as the API request itself.
 *   - Once ready, it delegates to the normal `write()` pipeline.
 *   - The write is executed after `safetyTimeoutMs`, regardless of whether the barrier promise has settled.
 *
 * Caveats:
 *   - A barrier rejection is NOT a cancellation: the write still executes (the rejection is logged with its error).
 *     The barrier only answers "when" to write, never "whether", so a broken readiness check cannot silently drop a
 *     user action - there would be no optimistic data, no request, and no `failureData` to roll back or surface.
 *     A write that should be conditional has to be gated before the call, not by rejecting the barrier.
 *   - This currently does not support the `conflictResolver` param of `write()`.
 *     Any request queued via `writeWhenReady` will not enter the sequential queue or be considered in conflict resolution until the deferred execution happens
 *   - Call order is NOT preserved across multiple deferred writes. If two independent `writeWhenReady` calls are queued, the two barriers race each other.
 *     If you need to preserve call order, it must be managed by callers: the later barrier must await resolution of the former.
 *
 * Caution:
 *   - By default, it waits for any transition to complete, so re-renders from optimistic writes don't compete with the transition animation.
 *     If no transition happens, then the write is deferred by roughly `CONST.MAX_TRANSITION_START_WAIT_MS + CONST.MAX_TRANSITION_DURATION_MS` (~2s).
 *     Pass `createTransitionBarrier('navigation')` to gate on a screen transition only, or a custom `barrier` to wait on something else entirely.
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

    // Back-compat: the fifth parameter used to be a bare safetyTimeoutMs number.
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

                // onRelease must never block or fail the write - isolate it in its own try/catch.
                try {
                    onRelease?.(reason);
                } catch (error) {
                    Log.warn('[API] writeWhenReady onRelease threw', {command, error});
                }

                write(command, apiCommandParameters, onyxData).then(resolve, reject);

                // Fires only after write() has been called and returned without throwing. Isolated so a
                // throwing side effect can't be mistaken for a failed write or surface as an unhandled rejection.
                try {
                    onWriteStarted?.();
                } catch (error) {
                    Log.warn('[API] writeWhenReady onWriteStarted threw', {command, error});
                }
            } catch (error) {
                reject(error);
            }
        };

        registerBackgroundFlushListener();
        flushOnBackground = () => execute('appBackground');

        // The AppState listener only catches new background transitions, so an app that is already backgrounded
        // when the write is queued (e.g. from a push notification handler) would never be flushed by it.
        if (AppState.currentState === CONST.APP_STATE.BACKGROUND) {
            execute('appBackground');
            return;
        }

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

export {writeWhenReady, createTransitionBarrier, armTransitionBarrier, SAFETY_TIMEOUT_MS};
export type {WriteReadyBarrier, WriteWhenReadyOptions, ReleaseReason, ArmedTransitionBarrier};
