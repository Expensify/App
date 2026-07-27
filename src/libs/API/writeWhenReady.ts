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
 * A readiness signal for `writeWhenReady`: a function, invoked when the write is queued, that returns a
 * promise-like resolving once it is safe to apply the write's optimistic data (e.g. after a navigation
 * transition finishes). It is given an `AbortSignal` that fires if the write executes before the barrier
 * settles (released early via the safety timeout, or because the app backgrounds), so a barrier waiting on
 * something cancelable can stop waiting instead of leaving a dangling registration. A rejection is treated
 * the same as resolving - the write executes anyway.
 */
type WriteReadyBarrier = (signal: AbortSignal) => PromiseLike<unknown>;

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
 * so it always resolves. Drops the TransitionTracker registration via `signal` if the write is released
 * before the transition finishes.
 */
function waitForNavigationTransition(signal: AbortSignal): Promise<void> {
    return new Promise((resolve) => {
        const handle = TransitionTracker.runAfterTransitions({
            callback: () => resolve(),
            waitForUpcomingTransition: true,
        });
        // On abort, drop the TransitionTracker registration. The promise is intentionally left pending (its
        // `resolve` is never called on this path): writeWhenReady's `hasExecuted` guard makes any late
        // resolution a no-op, and the chain is GC-eligible once the writeWhenReady promise settles.
        signal.addEventListener('abort', () => handle.cancel());
    });
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
 * Pass a custom `barrier` (a function taking an `AbortSignal` and returning a promise-like) to wait for a
 * different signal instead.
 *
 * Once ready, it delegates to the normal `write()` pipeline, so optimistic/success/failure handling,
 * retries, and queue ordering are all unchanged. (Request de-duplication via `write()`'s
 * `conflictResolver` is not exposed here - deferred writes always use the default, no-op resolver. A
 * command that normally goes through `writeWithNoDuplicates*` could enqueue two identical requests if
 * rapidly double-triggered while deferred; migrate such commands only with a plan for that.) Note that
 * deferring necessarily moves this write later in the queue relative to writes dispatched immediately
 * after it - that is the intended trade-off.
 *
 * Call order is NOT preserved across multiple deferred writes: each call races its own independent
 * barrier, so a later `writeWhenReady` with a fast barrier can reach `write()` (and thus the queue)
 * before an earlier one with a slow barrier. Do not rely on call order when firing two deferred writes
 * with a data dependency (e.g. an optimistic parent then child) - gate the dependent one on the first's
 * barrier, or don't defer it.
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
        // Read by `execute` but assigned below it; `let` closures capture the binding, not the value, so
        // this placeholder is safe until the real value is wired up on the next line.
        let flushOnBackground: () => void = () => {};
        let safetyTimeoutId: ReturnType<typeof setTimeout> | undefined;
        const abortController = new AbortController();
        let barrierError: unknown;

        const execute = (reason: WriteWhenReadyReleaseReason) => {
            if (hasExecuted) {
                return;
            }
            hasExecuted = true;

            // A synchronous throw (from write() or prepareRequest) must settle the returned promise via
            // reject rather than leave it pending forever - and, on the background path, must not escape
            // into the flush loop and strand the other pending writes.
            try {
                clearTimeout(safetyTimeoutId);
                pendingWriteWhenReadyFlushes.delete(flushOnBackground);
                // Abort only on the early-release paths (safety timeout / app background), where the barrier
                // may still be pending and would otherwise leave a dangling registration - e.g. the default
                // barrier's TransitionTracker registration. On the 'barrier'/'barrierRejected' paths the
                // barrier has already settled, so there is nothing to release. A throwing abort listener
                // can't drop the write or escape here: AbortSignal dispatch reports listener errors out of
                // band rather than propagating them out of abort(), so this stays throw-safe. Barriers whose
                // cleanup can throw should handle it in their own listener if they want it logged.
                if (reason === 'safetyTimeout' || reason === 'appBackground') {
                    abortController.abort();
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

        // Invoke the barrier inside a try/catch so a synchronously-thrown error is funneled into the
        // rejection path instead of escaping.
        let barrierValue: PromiseLike<unknown>;
        try {
            barrierValue = barrier(abortController.signal);
        } catch (error) {
            barrierValue = Promise.reject(error);
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

export {writeWhenReady};
export type {WriteReadyBarrier};
