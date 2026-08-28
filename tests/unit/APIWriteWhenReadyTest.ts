import * as API from '@libs/API';
import type {WriteReadyBarrier, WriteWhenReadyOptions} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import {SAFETY_TIMEOUT_MS} from '@libs/API/writeWhenReady';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {push as pushToSequentialQueue} from '@libs/Network/SequentialQueue';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {AppStateStatus} from 'react-native';

import {AppState} from 'react-native';
import Onyx from 'react-native-onyx';

jest.mock('@libs/Network/SequentialQueue', () => ({
    push: jest.fn(() => Promise.resolve()),
    waitForIdle: jest.fn(() => Promise.resolve()),
    // Called by the network layer on init; stub so advancing fake timers doesn't hit a missing export.
    flush: jest.fn(),
}));
jest.mock('@libs/Navigation/TransitionTracker');
jest.mock('@libs/Pusher');
jest.mock('@libs/NetworkState');

const mockPush = jest.mocked(pushToSequentialQueue);
const mockRunAfterTransitions = jest.mocked(TransitionTracker.runAfterTransitions);

// writeWhenReady's deferral behaviour is command-agnostic; UPDATE_PREFERRED_LOCALE is just an arbitrary write command.
type DeferWriteOnyxData = Parameters<typeof API.writeWhenReady>[2];
function deferWrite(barrier?: WriteReadyBarrier, safetyTimeoutMs?: number, onyxData: DeferWriteOnyxData = {}) {
    return API.writeWhenReady(WRITE_COMMANDS.UPDATE_PREFERRED_LOCALE, {value: CONST.LOCALES.EN}, onyxData, barrier, safetyTimeoutMs);
}

// Same as deferWrite, but for the onRelease/onWriteStarted describe block, which needs the options-object
// overload rather than a bare safetyTimeoutMs number. Routed through one helper (rather than each test
// calling API.writeWhenReady directly) to keep the no-multiple-api-calls token count down across this describe block.
function deferWriteWithOptions(barrier: WriteReadyBarrier, options: WriteWhenReadyOptions, onyxData: DeferWriteOnyxData = {}) {
    return API.writeWhenReady(WRITE_COMMANDS.UPDATE_PREFERRED_LOCALE, {value: CONST.LOCALES.EN}, onyxData, barrier, options);
}

// Built at module scope: the no-multiple-api-calls lint rule counts `API` tokens per function body, and the
// describe block already has one.
const navigationBarrier = API.createTransitionBarrier('navigation');

// Wrapper rather than direct calls in the armTransitionBarrier tests, for the same no-multiple-api-calls reason.
function armBarrier(waitFor?: true | 'navigation') {
    return API.armTransitionBarrier(waitFor);
}

// A barrier that never settles - forces the write to sit pending until a timeout/background flush.
function neverSettlingBarrier(): WriteReadyBarrier {
    return () => new Promise<void>(() => {});
}

function emitAppState(state: AppStateStatus) {
    // The react-native mock augments AppState with emitCurrentTestState to drive its change listener in tests.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- accessing a react-native mock-only test helper
    (AppState as unknown as {emitCurrentTestState: (nextState: AppStateStatus) => void}).emitCurrentTestState(state);
}

// Drain queued microtasks (barrier resolution -> execute -> write -> processRequest up to its first
// await) one tick at a time. Pass a predicate to stop as soon as the awaited effect has happened;
// otherwise it drains up to `maxIterations` ticks. Looping to a condition (rather than a fixed number
// of awaits) keeps these tests from silently racing if the microtask chain ever grows a step.
async function flushMicrotasks(until: () => boolean = () => false, maxIterations = 50) {
    for (let i = 0; i < maxIterations && !until(); i++) {
        await Promise.resolve();
    }
}

// The awaited effect these tests key off is the push to the SequentialQueue.
const pushHappened = () => mockPush.mock.calls.length > 0;

// A barrier that stays pending until `release()` is called, and records whether the `AbortSignal` passed
// to it was aborted - so a test can control exactly when (or whether) it settles and assert on abort.
function makeAbortableBarrier() {
    let release: () => void = () => {};
    // Create the promise eagerly so `release` points at the real resolver before this helper returns
    // (the barrier factory only runs once writeWhenReady invokes it, which is after destructuring).
    const promise = new Promise<void>((resolve) => {
        release = resolve;
    });
    const onAbort = jest.fn();
    const barrier: WriteReadyBarrier = (signal: AbortSignal) => {
        signal.addEventListener('abort', onAbort);
        return promise;
    };
    return {barrier, release, onAbort};
}

// A never-settling barrier whose abort listener throws, to prove a throwing listener can't drop the write
// or break the background flush loop. That guarantee comes from AbortSignal's event dispatch (which
// reports listener errors out of band rather than propagating them out of abort()) plus the flush loop's
// own isolation, not from writeWhenReady catching the throw - but since we depend on it, pin it here.
function makeThrowingAbortBarrier() {
    const onAbort = jest.fn(() => {
        throw new Error('abort boom');
    });
    const barrier: WriteReadyBarrier = (signal: AbortSignal) => {
        signal.addEventListener('abort', onAbort);
        return new Promise<void>(() => {});
    };
    return {barrier, onAbort};
}

describe('API.writeWhenReady', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        // Defensive: drain any write a test left pending (its barrier never settled) via the background
        // flush, so it cannot leak into the next test's assertions. Reset the state afterwards.
        emitAppState('background');
        emitAppState('active');
    });

    it('does not execute the write until a custom barrier resolves', async () => {
        // Given a barrier that has not resolved yet, so it should be gating the write rather than a fixed delay
        let releaseBarrier: () => void = () => {};
        const barrier = jest.fn(
            () =>
                new Promise<void>((resolve) => {
                    releaseBarrier = resolve;
                }),
        );

        // When the write is queued, before the barrier ever settles
        deferWrite(barrier);
        await flushMicrotasks();

        // Then it must not go out yet, or the barrier would be decorative rather than an actual gate
        expect(barrier).toHaveBeenCalledTimes(1);
        expect(mockPush).not.toHaveBeenCalled();

        // When the barrier resolves, the one readiness condition writeWhenReady is supposed to be waiting on
        releaseBarrier();
        await flushMicrotasks(pushHappened);

        // Then the write finally executes, proving the barrier - not some other timer - released it
        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('defaults to waiting for any transition', async () => {
        // Given no barrier was passed, so the default barrier's own gating choice is what's under test
        let transitionCallback: () => void = () => {};
        mockRunAfterTransitions.mockImplementation(({callback}) => {
            transitionCallback = callback as () => void;
            return {cancel: jest.fn()};
        });

        // When the write is queued with only the default barrier
        API.writeWhenReady(WRITE_COMMANDS.UPDATE_PREFERRED_LOCALE, {
            value: CONST.LOCALES.EN,
        });
        await flushMicrotasks();

        // Then it gates on any transition - `true` accepts navigation, modal, or keyboard, since those
        // all contend for the main thread just like a screen push does - and has not written yet
        expect(mockRunAfterTransitions).toHaveBeenCalledWith(expect.objectContaining({waitForUpcomingTransition: true}));
        expect(mockPush).not.toHaveBeenCalled();

        // When that transition completes
        transitionCallback();
        await flushMicrotasks(pushHappened);

        // Then the write goes out, confirming the default barrier does eventually release it
        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('gates on a screen transition only when given createTransitionBarrier(navigation)', async () => {
        // Given a barrier built with 'navigation', so only a screen transition should open its gate
        let transitionCallback: () => void = () => {};
        mockRunAfterTransitions.mockImplementation(({callback}) => {
            transitionCallback = callback as () => void;
            return {cancel: jest.fn()};
        });

        // When the write is queued on that navigation-only barrier
        deferWrite(navigationBarrier);
        await flushMicrotasks();

        // Then TransitionTracker is asked for a screen transition specifically, not "any transition",
        // and the write has not gone out yet
        expect(mockRunAfterTransitions).toHaveBeenCalledWith(expect.objectContaining({waitForUpcomingTransition: 'navigation'}));
        expect(mockPush).not.toHaveBeenCalled();

        // When that screen transition completes
        transitionCallback();
        await flushMicrotasks(pushHappened);

        // Then the write goes out
        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('flushes a pending write when the app goes to the background', async () => {
        // Given a write deferred on a barrier that never settles on its own
        const barrier = () => new Promise<void>(() => {});

        deferWrite(barrier);
        await flushMicrotasks();
        expect(mockPush).not.toHaveBeenCalled();

        // When the app backgrounds, the OS's last chance to suspend the process before state is lost
        emitAppState('background');
        await flushMicrotasks(pushHappened);

        // Then the write is flushed anyway, so its optimistic data and queued request aren't lost
        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('executes immediately when the app is already in the background', async () => {
        // Given the app is already backgrounded before the write is even queued (e.g. a push
        // notification handler runs there) - the AppState change listener only fires on new transitions
        emitAppState('background');

        // When the write is queued on a barrier that would otherwise never settle
        const barrier = jest.fn(() => new Promise<void>(() => {}));
        deferWrite(barrier);
        await flushMicrotasks(pushHappened);

        // Then it must still execute via the up-front currentState check - if it relied on the
        // AppState listener alone, this write would hang forever since no transition would fire
        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(barrier).not.toHaveBeenCalled();
    });

    it('does not flush a pending write when the app becomes active', async () => {
        // Given a write still waiting on its barrier
        let releaseBarrier: () => void = () => {};
        const barrier = () =>
            new Promise<void>((resolve) => {
                releaseBarrier = resolve;
            });

        deferWrite(barrier);
        await flushMicrotasks();

        // When the app becomes active - not a suspend risk, unlike going to the background
        emitAppState('active');
        await flushMicrotasks();

        // Then it must not be force-flushed - only "background" is treated as the OS about to suspend
        // the process; flushing on every state change would defeat the point of deferring the write
        expect(mockPush).not.toHaveBeenCalled();

        // Release so the pending write does not leak into later tests' background flush.
        releaseBarrier();
        await flushMicrotasks(pushHappened);
        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('executes anyway after the safety timeout when the barrier never settles', async () => {
        jest.useFakeTimers();
        try {
            // Given a barrier that never settles on its own
            const barrier = () => new Promise<void>(() => {});

            deferWrite(barrier);
            await flushMicrotasks();
            expect(mockPush).not.toHaveBeenCalled();

            // When the safety timeout elapses
            await jest.advanceTimersByTimeAsync(SAFETY_TIMEOUT_MS);

            // Then the write executes anyway - a stuck or misbehaving barrier must not permanently
            // strand the write, since there would then be no request and nothing to roll back
            expect(mockPush).toHaveBeenCalledTimes(1);
        } finally {
            jest.useRealTimers();
        }
    });

    it('executes anyway when the barrier rejects', async () => {
        // Given a barrier that rejects instead of resolving
        const barrier = () => Promise.reject(new Error('barrier failed'));

        // When the write is queued on it
        deferWrite(barrier);
        await flushMicrotasks(pushHappened);

        // Then the write still executes - the barrier only answers "when" to write, never "whether",
        // so a broken readiness check can't silently drop a user action with no request and no rollback
        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('executes anyway when the barrier thunk throws synchronously', async () => {
        // Given a barrier thunk that throws synchronously instead of returning a promise at all
        const barrier = () => {
            throw new Error('thunk boom');
        };

        // When the write is queued on it
        deferWrite(barrier);
        await flushMicrotasks(pushHappened);

        // Then the write still executes - a synchronous throw must funnel into the same
        // never-cancel-the-write path as an async rejection, not escape and skip the write entirely
        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('rejects the returned promise when the write throws synchronously', async () => {
        // Given write() itself will throw synchronously - write() applies optimisticData via Onyx.update,
        // so making that throw is the cleanest way to exercise write() failing inside execute()'s
        // try/catch, as opposed to the barrier failing
        const updateSpy = jest.spyOn(Onyx, 'update').mockImplementationOnce(() => {
            throw new Error('write boom');
        });
        try {
            const onyxData: DeferWriteOnyxData = {
                optimisticData: [
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: ONYXKEYS.NVP_PREFERRED_LOCALE,
                        value: CONST.LOCALES.EN,
                    },
                ],
            };

            // When the barrier releases normally, but write() itself throws
            const outcome = deferWrite(() => Promise.resolve(), undefined, onyxData).then(
                () => 'resolved',
                () => 'rejected',
            );
            await flushMicrotasks(() => updateSpy.mock.calls.length > 0);

            // Then the returned promise rejects - unlike a barrier failure, a write() failure is a real
            // error the caller needs to see, not something to paper over
            await expect(outcome).resolves.toBe('rejected');
            expect(mockPush).not.toHaveBeenCalled();
        } finally {
            updateSpy.mockRestore();
        }
    });

    it('executes the write exactly once even if the safety timeout also elapses', async () => {
        jest.useFakeTimers();
        try {
            // Given a write already released normally by its barrier
            let releaseBarrier: () => void = () => {};
            const barrier = () =>
                new Promise<void>((resolve) => {
                    releaseBarrier = resolve;
                });

            deferWrite(barrier);
            // Flush first so the barrier thunk has run and releaseBarrier points at the real resolver.
            await flushMicrotasks();
            releaseBarrier();
            await flushMicrotasks(pushHappened);
            expect(mockPush).toHaveBeenCalledTimes(1);

            // When the safety timeout would also have elapsed afterwards - the two release paths race
            // independently, so a fired barrier must not leave the timeout to fire a second write later
            await jest.advanceTimersByTimeAsync(SAFETY_TIMEOUT_MS * 2);

            // Then the write is still only executed once
            expect(mockPush).toHaveBeenCalledTimes(1);
        } finally {
            jest.useRealTimers();
        }
    });

    it("aborts a still-pending barrier's signal when released early via the safety timeout", async () => {
        jest.useFakeTimers();
        try {
            // Given a barrier that never releases on its own
            const {barrier, onAbort} = makeAbortableBarrier(); // never released

            deferWrite(barrier);
            await flushMicrotasks();
            expect(onAbort).not.toHaveBeenCalled();

            // When the safety timeout releases the write early, ahead of the barrier
            await jest.advanceTimersByTimeAsync(SAFETY_TIMEOUT_MS);
            await flushMicrotasks(pushHappened);

            // Then the barrier's signal is aborted, so a barrier waiting on something cancelable (e.g. a
            // TransitionTracker registration) can drop it instead of leaving it dangling forever
            expect(mockPush).toHaveBeenCalledTimes(1);
            expect(onAbort).toHaveBeenCalledTimes(1);
        } finally {
            jest.useRealTimers();
        }
    });

    it("aborts a still-pending barrier's signal when flushed on background", async () => {
        // Given a barrier that never releases on its own
        const {barrier, onAbort} = makeAbortableBarrier(); // never released

        deferWrite(barrier);
        await flushMicrotasks();
        expect(onAbort).not.toHaveBeenCalled();

        // When the app backgrounds and force-flushes the write early, ahead of the barrier
        emitAppState('background');
        await flushMicrotasks(pushHappened);

        // Then the signal is aborted too, for the same cleanup reason as the safety-timeout path
        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(onAbort).toHaveBeenCalledTimes(1);
    });

    it("does not abort a barrier's signal that resolves normally", async () => {
        // Given a barrier that will settle on its own
        const {barrier, release, onAbort} = makeAbortableBarrier();

        deferWrite(barrier);
        await flushMicrotasks();
        expect(mockPush).not.toHaveBeenCalled();

        // When the barrier itself releases the write, the normal path (not an early-release override)
        release();
        await flushMicrotasks(pushHappened);

        // Then the signal is never aborted - it already settled on its own, so aborting would be a
        // spurious cleanup signal to a barrier that finished exactly as expected
        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(onAbort).not.toHaveBeenCalled();
    });

    it('honors a custom safetyTimeoutMs', async () => {
        jest.useFakeTimers();
        try {
            // Given a barrier that never settles, and a caller-supplied timeout shorter than the default
            const customTimeoutMs = 100;
            const barrier = () => new Promise<void>(() => {}); // never settles

            deferWrite(barrier, customTimeoutMs);
            await flushMicrotasks();

            // When time advances up to just before that custom timeout
            await jest.advanceTimersByTimeAsync(customTimeoutMs - 1);

            // Then it must not fire early - the custom value should fully replace the default, not race it
            expect(mockPush).not.toHaveBeenCalled();

            // When the custom timeout elapses
            await jest.advanceTimersByTimeAsync(1);
            await flushMicrotasks(pushHappened);

            // Then the write executes on the caller's schedule
            expect(mockPush).toHaveBeenCalledTimes(1);
        } finally {
            jest.useRealTimers();
        }
    });

    it('flushes every pending write on a single background event', async () => {
        // Given several writes deferred on barriers that never settle - if each subscribed to AppState
        // independently, one background event would flush each of them once per subscription
        const addEventListenerSpy = jest.spyOn(AppState, 'addEventListener');

        deferWrite(neverSettlingBarrier());
        // Measured relative to the first deferred write rather than asserting an absolute count, so this does
        // not depend on whether an earlier test in this file already tripped the one-time registration guard.
        const registrationsAfterFirstWrite = addEventListenerSpy.mock.calls.length;
        deferWrite(neverSettlingBarrier());
        deferWrite(neverSettlingBarrier());
        await flushMicrotasks();
        expect(mockPush).not.toHaveBeenCalled();

        // When a single background event fires
        emitAppState('background');
        await flushMicrotasks(() => mockPush.mock.calls.length >= 3);

        // Then every pending write is flushed exactly once, and no later write added its own AppState
        // subscription - confirming they all share the one registered up front
        expect(mockPush).toHaveBeenCalledTimes(3);
        expect(addEventListenerSpy).toHaveBeenCalledTimes(registrationsAfterFirstWrite);
        addEventListenerSpy.mockRestore();
    });

    it('does not drop a write whose barrier abort listener throws during background flush, and still flushes the others', async () => {
        // Given one write whose barrier's abort listener throws, alongside two other pending writes -
        // a throwing listener must not be allowed to break the shared flush loop for the others
        const {barrier: throwingBarrier, onAbort} = makeThrowingAbortBarrier();
        // Track that the throwing write settles (does not hang) - and, per the isolation, resolves.
        const throwingOutcome = deferWrite(throwingBarrier).then(
            () => 'resolved',
            () => 'rejected',
        );
        deferWrite(neverSettlingBarrier());
        deferWrite(neverSettlingBarrier());
        await flushMicrotasks();

        // When a background event force-flushes all three
        // A throwing abort listener is reported out of band by AbortSignal's dispatch: it must neither
        // abort the loop flushing the other two, nor drop its own write. All three writes should flush.
        expect(() => emitAppState('background')).not.toThrow();
        await flushMicrotasks(() => mockPush.mock.calls.length >= 3);

        // Then all three writes still flush, and the throwing write still resolves rather than hanging
        // forever waiting on a promise that its own abort listener's throw never let settle
        expect(mockPush).toHaveBeenCalledTimes(3);
        expect(onAbort).toHaveBeenCalledTimes(1);
        await expect(throwingOutcome).resolves.toBe('resolved');
    });

    it('does not drop the write when the barrier abort listener throws on the safety timeout path', async () => {
        jest.useFakeTimers();
        try {
            // Given a barrier whose abort listener throws, and which never settles on its own - this
            // exercises the safety-timeout abort path rather than the background-flush one above
            const {barrier: throwingBarrier, onAbort} = makeThrowingAbortBarrier(); // never settles
            const outcome = deferWrite(throwingBarrier).then(
                () => 'resolved',
                () => 'rejected',
            );
            await flushMicrotasks();

            // When the safety timeout releases it
            await jest.advanceTimersByTimeAsync(SAFETY_TIMEOUT_MS);
            await flushMicrotasks(pushHappened);

            // Then the write still goes through and resolves - the safety timeout's job is to guarantee
            // the write happens, and a throwing listener on the way there must not undermine that
            expect(mockPush).toHaveBeenCalledTimes(1);
            expect(onAbort).toHaveBeenCalledTimes(1);
            await expect(outcome).resolves.toBe('resolved');
        } finally {
            jest.useRealTimers();
        }
    });

    it('cancels the default TransitionTracker registration when released early via the safety timeout', async () => {
        jest.useFakeTimers();
        try {
            // Given a write deferred on the default transition barrier, which is still registered with
            // TransitionTracker when the safety timeout takes over
            const cancel = jest.fn();
            mockRunAfterTransitions.mockReturnValue({cancel});

            // No barrier arg => the default any-transition barrier.
            deferWrite();
            await flushMicrotasks();
            expect(cancel).not.toHaveBeenCalled();

            // When the safety timeout releases the write before the transition ever completes
            await jest.advanceTimersByTimeAsync(SAFETY_TIMEOUT_MS);
            await flushMicrotasks(pushHappened);

            // Then the registration is cancelled - leaving it alive would keep TransitionTracker
            // holding a callback for a write that has already gone out
            expect(mockPush).toHaveBeenCalledTimes(1);
            expect(cancel).toHaveBeenCalledTimes(1);
        } finally {
            jest.useRealTimers();
        }
    });

    it('forwards the command, params, and onyxData to write() and resolves once queued', async () => {
        // Given a write with onyxData, deferred on a barrier that resolves immediately - the barrier
        // and timing aren't the point here, correct pass-through to write() is
        const onyxData: DeferWriteOnyxData = {
            successData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
                    value: CONST.LOCALES.EN,
                },
            ],
        };

        // When the write executes
        const promise = deferWrite(() => Promise.resolve(), undefined, onyxData);
        await flushMicrotasks(pushHappened);

        // Then it delegates to write() with the exact same command, params, and onyxData it was given,
        // and its own promise resolves once the delegate is queued
        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(mockPush).toHaveBeenCalledWith(
            expect.objectContaining({
                command: WRITE_COMMANDS.UPDATE_PREFERRED_LOCALE,
                data: expect.objectContaining({value: CONST.LOCALES.EN}),
                successData: onyxData?.successData,
            }),
        );
        await expect(promise).resolves.toBeUndefined();
    });

    it('keeps the safety timeout above the default barrier worst case (guards constant drift)', () => {
        // Given the default barrier's worst-case wait (start-wait + duration) - if either constant
        // drifts closer to SAFETY_TIMEOUT_MS without this test catching it, the safety net could start
        // racing the barrier it's supposed to be a fallback for
        // Then the safety timeout must stay strictly longer, or the safety net could fire before the
        // default barrier's own legitimate worst case
        expect(SAFETY_TIMEOUT_MS).toBeGreaterThan(CONST.MAX_TRANSITION_START_WAIT_MS + CONST.MAX_TRANSITION_DURATION_MS);
    });

    describe('onRelease/onWriteStarted options', () => {
        it('calls onRelease with "success" before write() executes, and onWriteStarted after', async () => {
            // Given onRelease and onWriteStarted hooks on a write deferred on a resolving barrier - the
            // two hooks exist so callers can bundle side effects at each stage without patching write()
            const calls: string[] = [];
            const onRelease = jest.fn(() => calls.push('release'));
            const onWriteStarted = jest.fn(() => calls.push('started'));
            mockPush.mockImplementationOnce(() => {
                calls.push('pushed');
                return Promise.resolve();
            });

            // When the barrier resolves and the write executes
            await deferWriteWithOptions(() => Promise.resolve(), {
                onRelease,
                onWriteStarted,
            });
            await flushMicrotasks(pushHappened);

            // Then the calls land in this exact order - onRelease before write() is even called, and
            // onWriteStarted only once write() has actually gone out - or a caller relying on either
            // hook's timing to sequence its own side effect would get it wrong
            expect(onRelease).toHaveBeenCalledWith('success');
            expect(onWriteStarted).toHaveBeenCalledTimes(1);
            expect(calls).toEqual(['release', 'pushed', 'started']);
        });

        it('calls onRelease with the release reason on the safety-timeout and app-background paths', async () => {
            jest.useFakeTimers();
            try {
                // Given a barrier that never settles, forcing the safety-timeout release path
                const onRelease = jest.fn();
                deferWriteWithOptions(neverSettlingBarrier(), {onRelease});

                // When the safety timeout releases it
                await jest.advanceTimersByTimeAsync(SAFETY_TIMEOUT_MS);
                await flushMicrotasks(pushHappened);

                // Then onRelease reports "safetyTimeout" specifically, so a caller logging/alerting on
                // the reason can tell a barrier timing out apart from a normal release
                expect(onRelease).toHaveBeenCalledTimes(1);
                expect(onRelease).toHaveBeenCalledWith('safetyTimeout');
            } finally {
                jest.useRealTimers();
            }
        });

        it('calls onRelease with "appBackground" when already backgrounded at call time', async () => {
            // Given the app is already backgrounded before the write is queued
            emitAppState('background');
            const onRelease = jest.fn();

            // When the write is queued on a barrier that never settles
            deferWriteWithOptions(neverSettlingBarrier(), {onRelease});
            await flushMicrotasks(pushHappened);

            // Then onRelease reports "appBackground", distinct from "safetyTimeout", since a caller
            // may want to treat an app-background release differently (e.g. not log it as an anomaly)
            expect(onRelease).toHaveBeenCalledTimes(1);
            expect(onRelease).toHaveBeenCalledWith('appBackground');
        });

        it('calls onRelease with "rejected" when the barrier rejects', async () => {
            // Given a barrier that rejects
            const onRelease = jest.fn();

            // When the write is queued on it
            deferWriteWithOptions(() => Promise.reject(new Error('barrier failed')), {
                onRelease,
            });
            await flushMicrotasks(pushHappened);

            // Then onRelease reports "rejected" - the fourth distinct reason, so a caller can
            // distinguish a broken readiness check from a timeout or a background flush
            expect(onRelease).toHaveBeenCalledTimes(1);
            expect(onRelease).toHaveBeenCalledWith('rejected');
        });

        it('fires onRelease exactly once even if the safety timeout also elapses after a normal release', async () => {
            jest.useFakeTimers();
            try {
                // Given a write already released normally by its barrier - the safety timeout is still
                // pending underneath, since only execute()'s guard is what's supposed to stop it firing again
                let releaseBarrier: () => void = () => {};
                const barrier: WriteReadyBarrier = () =>
                    new Promise<void>((resolve) => {
                        releaseBarrier = resolve;
                    });
                const onRelease = jest.fn();

                deferWriteWithOptions(barrier, {onRelease});
                await flushMicrotasks();
                releaseBarrier();
                await flushMicrotasks(pushHappened);

                // When the safety timeout would also have elapsed afterwards
                await jest.advanceTimersByTimeAsync(SAFETY_TIMEOUT_MS * 2);

                // Then onRelease still only fired once - a caller counting on it firing exactly once
                // per write (e.g. to close out telemetry) would otherwise double-count
                expect(onRelease).toHaveBeenCalledTimes(1);
            } finally {
                jest.useRealTimers();
            }
        });

        it('lets write() execute even when onRelease throws, and logs instead of propagating', async () => {
            // Given an onRelease hook that throws
            const onRelease = jest.fn(() => {
                throw new Error('onRelease boom');
            });

            // When the write executes
            const promise = deferWriteWithOptions(() => Promise.resolve(), {
                onRelease,
            });
            await flushMicrotasks(pushHappened);

            // Then the write still goes out and resolves - a caller's buggy side-effect hook must never
            // be able to block or fail the actual write it's just observing
            expect(mockPush).toHaveBeenCalledTimes(1);
            await expect(promise).resolves.toBeUndefined();
        });

        it("does not change the write's outcome when onWriteStarted throws, and does not surface as an unhandled rejection", async () => {
            // Given an onWriteStarted hook that throws
            const onWriteStarted = jest.fn(() => {
                throw new Error('onWriteStarted boom');
            });

            // When the write executes
            const promise = deferWriteWithOptions(() => Promise.resolve(), {
                onWriteStarted,
            });
            await flushMicrotasks(pushHappened);

            // Then onWriteStarted is still called once, and the write's own promise still resolves - a
            // throwing side effect must not be mistaken for a failed write or surface as an unhandled rejection
            expect(onWriteStarted).toHaveBeenCalledTimes(1);
            await expect(promise).resolves.toBeUndefined();
        });

        it('does not call onWriteStarted when write() throws synchronously', async () => {
            // Given write() will throw synchronously
            const updateSpy = jest.spyOn(Onyx, 'update').mockImplementationOnce(() => {
                throw new Error('write boom');
            });
            try {
                const onWriteStarted = jest.fn();
                const onyxData: DeferWriteOnyxData = {
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
                            value: CONST.LOCALES.EN,
                        },
                    ],
                };

                // When the barrier releases and write() throws
                const outcome = deferWriteWithOptions(() => Promise.resolve(), {onWriteStarted}, onyxData).then(
                    () => 'resolved',
                    () => 'rejected',
                );
                await flushMicrotasks(() => updateSpy.mock.calls.length > 0);

                // Then onWriteStarted is never called, since its whole contract is firing only after
                // write() returns without throwing - calling it here would mislead a caller into
                // thinking the write went out when it didn't
                await expect(outcome).resolves.toBe('rejected');
                expect(onWriteStarted).not.toHaveBeenCalled();
            } finally {
                updateSpy.mockRestore();
            }
        });

        it('still accepts a bare number as the fifth parameter for backward compatibility', async () => {
            jest.useFakeTimers();
            try {
                // Given a write queued with a bare number as the fifth parameter, used as `safetyTimeoutMs`
                const customTimeoutMs = 100;
                deferWrite(neverSettlingBarrier(), customTimeoutMs);
                await flushMicrotasks();

                // When that custom timeout elapses
                await jest.advanceTimersByTimeAsync(customTimeoutMs);
                await flushMicrotasks(pushHappened);

                // Then it is still honoured as safetyTimeoutMs, so every existing call site keeps
                // working without having to migrate to the options-object form
                expect(mockPush).toHaveBeenCalledTimes(1);
            } finally {
                jest.useRealTimers();
            }
        });
    });

    describe('armTransitionBarrier', () => {
        // Captures the callback TransitionTracker was registered with, plus the cancel spy for that
        // registration, so a test can decide when the transition "finishes" and assert on cleanup.
        function mockTransitionRegistration() {
            const cancel = jest.fn();
            let transitionCallback: () => void = () => {};
            mockRunAfterTransitions.mockImplementation(({callback}) => {
                transitionCallback = callback as () => void;
                return {cancel};
            });
            return {cancel, finishTransition: () => transitionCallback()};
        }

        it('registers with TransitionTracker at arm time, before any write exists', () => {
            // Given no write exists yet - arming is meant to happen at navigation time, ahead of the write
            mockTransitionRegistration();

            // When a barrier is armed
            armBarrier();

            // Then it registers with TransitionTracker right away - if it waited until a write attached,
            // arming would be pointless, since that's exactly what the plain default barrier already does
            expect(mockRunAfterTransitions).toHaveBeenCalledTimes(1);
            expect(mockRunAfterTransitions).toHaveBeenCalledWith(expect.objectContaining({waitForUpcomingTransition: true}));
            expect(mockPush).not.toHaveBeenCalled();
        });

        it('writes immediately when the transition already finished before the barrier is used', async () => {
            // Given a barrier armed while a transition is active
            const {finishTransition} = mockTransitionRegistration();
            const armed = armBarrier();

            // When that transition completes before any write attaches - the exact case a freshly
            // created default barrier would miss, since it only registers once a write attaches and
            // would end up waiting on an unrelated future transition instead
            finishTransition();

            // When a write is then queued on the armed barrier
            deferWrite(armed.barrier);
            await flushMicrotasks(pushHappened);

            // Then it writes immediately, and no second TransitionTracker registration is made - the
            // armed barrier's already-resolved promise is reused, not rebuilt at write time
            expect(mockPush).toHaveBeenCalledTimes(1);
            expect(mockRunAfterTransitions).toHaveBeenCalledTimes(1);
        });

        it('still gates the write when the transition is in flight at write time', async () => {
            // Given a barrier armed while a transition is active
            const {finishTransition} = mockTransitionRegistration();
            const armed = armBarrier();

            // When a write is queued on the armed barrier before that transition completes
            deferWrite(armed.barrier);
            await flushMicrotasks();
            expect(mockPush).not.toHaveBeenCalled();

            // When the transition then completes
            finishTransition();
            await flushMicrotasks(pushHappened);

            // Then the write goes out - arming must not skip the actual gating when the transition
            // genuinely hasn't finished yet
            expect(mockPush).toHaveBeenCalledTimes(1);
        });

        it('releases several writes from one armed barrier at the same point', async () => {
            // Given one armed barrier shared by several writes from one interaction (e.g. one write per
            // receipt in a split) - they're expected to release together, not race independent barriers
            const {finishTransition} = mockTransitionRegistration();
            const armed = armBarrier();

            // When both writes queue on the same armed barrier
            deferWrite(armed.barrier);
            deferWrite(armed.barrier);
            await flushMicrotasks();
            expect(mockPush).not.toHaveBeenCalled();

            // When the transition completes
            finishTransition();
            await flushMicrotasks(() => mockPush.mock.calls.length >= 2);

            // Then both release together, through the one shared TransitionTracker registration - two
            // registrations would mean two independent completions instead of one shared release point
            expect(mockPush).toHaveBeenCalledTimes(2);
            expect(mockRunAfterTransitions).toHaveBeenCalledTimes(1);
        });

        it('keeps the barrier alive for the remaining writes when one of them times out', async () => {
            jest.useFakeTimers();
            try {
                // Given two writes on one armed barrier, one with a short safety timeout that will fire
                // well before the transition ever completes
                const {cancel, finishTransition} = mockTransitionRegistration();
                const armed = armBarrier();

                const shortTimeoutMs = 100;
                deferWrite(armed.barrier, shortTimeoutMs);
                deferWrite(armed.barrier);
                await flushMicrotasks();

                // When the first write's short safety timeout elapses and releases it early - it gives
                // up on its own, but must not tear down the shared registration the second write still needs
                await jest.advanceTimersByTimeAsync(shortTimeoutMs);
                await flushMicrotasks(pushHappened);
                expect(mockPush).toHaveBeenCalledTimes(1);

                // Then the TransitionTracker registration is left alive - otherwise the second write
                // would be stranded until its own safety timeout instead of releasing with the transition
                expect(cancel).not.toHaveBeenCalled();

                // When the transition then completes
                finishTransition();
                await flushMicrotasks(() => mockPush.mock.calls.length >= 2);

                // Then the second write still releases with the real transition completion
                expect(mockPush).toHaveBeenCalledTimes(2);
            } finally {
                jest.useRealTimers();
            }
        });

        it("keeps the armed TransitionTracker registration alive after a consumer's own safety timeout", async () => {
            jest.useFakeTimers();
            try {
                // Given a write deferred on an armed barrier, with the transition never completing
                const {cancel} = mockTransitionRegistration();
                const armed = armBarrier();
                deferWrite(armed.barrier);
                await flushMicrotasks();
                expect(cancel).not.toHaveBeenCalled();

                // When that write's own safety timeout releases it before the transition ever finishes
                await jest.advanceTimersByTimeAsync(SAFETY_TIMEOUT_MS);
                await flushMicrotasks(pushHappened);

                // Then the registration is left alive rather than cancelled - a later write could still
                // attach to the same armed barrier and needs the real transition-completion release,
                // not to be pushed onto its own safety timeout too because this one gave up first
                expect(mockPush).toHaveBeenCalledTimes(1);
                expect(cancel).not.toHaveBeenCalled();
            } finally {
                jest.useRealTimers();
            }
        });

        it('drops the registration on cancel() when the write never happens', () => {
            // Given a barrier armed for a write that gets abandoned before ever being used
            const {cancel} = mockTransitionRegistration();

            // When the caller explicitly cancels it instead of ever writing
            armBarrier().cancel();

            // Then the TransitionTracker registration is dropped - without cancel(), an abandoned arm
            // would leak a registration that nothing will ever resolve
            expect(cancel).toHaveBeenCalledTimes(1);
            expect(mockPush).not.toHaveBeenCalled();
        });

        it('passes waitFor through to the underlying transition barrier', () => {
            // Given no active transition yet
            mockTransitionRegistration();

            // When a barrier is armed for navigation transitions only
            armBarrier('navigation');

            // Then the underlying transition barrier is built with that same `waitFor` selection -
            // arming must not silently widen a navigation-only barrier into an any-transition one
            expect(mockRunAfterTransitions).toHaveBeenCalledWith(expect.objectContaining({waitForUpcomingTransition: 'navigation'}));
        });
    });
});
