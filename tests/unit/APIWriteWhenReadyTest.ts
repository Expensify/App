import * as API from '@libs/API';
import type {WriteReadyBarrier} from '@libs/API';
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

// Built at module scope: the no-multiple-api-calls lint rule counts `API` tokens per function body, and the
// describe block already has one.
const navigationBarrier = API.createTransitionBarrier('navigation');

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
        let releaseBarrier: () => void = () => {};
        const barrier = jest.fn(
            () =>
                new Promise<void>((resolve) => {
                    releaseBarrier = resolve;
                }),
        );

        deferWrite(barrier);
        await flushMicrotasks();

        expect(barrier).toHaveBeenCalledTimes(1);
        expect(mockPush).not.toHaveBeenCalled();

        releaseBarrier();
        await flushMicrotasks(pushHappened);

        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('defaults to waiting for any transition', async () => {
        let transitionCallback: () => void = () => {};
        mockRunAfterTransitions.mockImplementation(({callback}) => {
            transitionCallback = callback as () => void;
            return {cancel: jest.fn()};
        });

        API.writeWhenReady(WRITE_COMMANDS.UPDATE_PREFERRED_LOCALE, {value: CONST.LOCALES.EN});
        await flushMicrotasks();

        // `true` means any transition (navigation, modal, keyboard) opens the gate - a modal or the keyboard
        // contends for the main thread just like a screen push does.
        expect(mockRunAfterTransitions).toHaveBeenCalledWith(expect.objectContaining({waitForUpcomingTransition: true}));
        expect(mockPush).not.toHaveBeenCalled();

        transitionCallback();
        await flushMicrotasks(pushHappened);

        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('gates on a screen transition only when given createTransitionBarrier(navigation)', async () => {
        let transitionCallback: () => void = () => {};
        mockRunAfterTransitions.mockImplementation(({callback}) => {
            transitionCallback = callback as () => void;
            return {cancel: jest.fn()};
        });

        deferWrite(navigationBarrier);
        await flushMicrotasks();

        expect(mockRunAfterTransitions).toHaveBeenCalledWith(expect.objectContaining({waitForUpcomingTransition: 'navigation'}));
        expect(mockPush).not.toHaveBeenCalled();

        transitionCallback();
        await flushMicrotasks(pushHappened);

        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('flushes a pending write when the app goes to the background', async () => {
        const barrier = () => new Promise<void>(() => {});

        deferWrite(barrier);
        await flushMicrotasks();
        expect(mockPush).not.toHaveBeenCalled();

        emitAppState('background');
        await flushMicrotasks(pushHappened);

        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('executes immediately when the app is already in the background', async () => {
        // The AppState listener only sees new transitions, so a write queued while already backgrounded
        // (e.g. from a push notification handler) has to be caught by the up-front currentState check.
        emitAppState('background');

        const barrier = jest.fn(() => new Promise<void>(() => {}));
        deferWrite(barrier);
        await flushMicrotasks(pushHappened);

        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(barrier).not.toHaveBeenCalled();
    });

    it('does not flush a pending write when the app becomes active', async () => {
        let releaseBarrier: () => void = () => {};
        const barrier = () =>
            new Promise<void>((resolve) => {
                releaseBarrier = resolve;
            });

        deferWrite(barrier);
        await flushMicrotasks();

        emitAppState('active');
        await flushMicrotasks();
        expect(mockPush).not.toHaveBeenCalled();

        // Release so the pending write does not leak into later tests' background flush.
        releaseBarrier();
        await flushMicrotasks(pushHappened);
        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('executes anyway after the safety timeout when the barrier never settles', async () => {
        jest.useFakeTimers();
        try {
            const barrier = () => new Promise<void>(() => {});

            deferWrite(barrier);
            await flushMicrotasks();
            expect(mockPush).not.toHaveBeenCalled();

            await jest.advanceTimersByTimeAsync(SAFETY_TIMEOUT_MS);

            expect(mockPush).toHaveBeenCalledTimes(1);
        } finally {
            jest.useRealTimers();
        }
    });

    it('executes anyway when the barrier rejects', async () => {
        const barrier = () => Promise.reject(new Error('barrier failed'));

        deferWrite(barrier);
        await flushMicrotasks(pushHappened);

        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('executes anyway when the barrier thunk throws synchronously', async () => {
        const barrier = () => {
            throw new Error('thunk boom');
        };

        deferWrite(barrier);
        await flushMicrotasks(pushHappened);

        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('rejects the returned promise when the write throws synchronously', async () => {
        // prepareRequest applies optimisticData synchronously via Onyx.update, so making that throw is the
        // cleanest way to exercise write() throwing synchronously inside execute()'s try/catch.
        const updateSpy = jest.spyOn(Onyx, 'update').mockImplementationOnce(() => {
            throw new Error('write boom');
        });
        try {
            const onyxData: DeferWriteOnyxData = {
                optimisticData: [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NVP_PREFERRED_LOCALE, value: CONST.LOCALES.EN}],
            };

            const outcome = deferWrite(() => Promise.resolve(), undefined, onyxData).then(
                () => 'resolved',
                () => 'rejected',
            );
            await flushMicrotasks(() => updateSpy.mock.calls.length > 0);

            await expect(outcome).resolves.toBe('rejected');
            expect(mockPush).not.toHaveBeenCalled();
        } finally {
            updateSpy.mockRestore();
        }
    });

    it('executes the write exactly once even if the safety timeout also elapses', async () => {
        jest.useFakeTimers();
        try {
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

            // The barrier already fired; letting the safety timeout elapse must not execute a second time.
            await jest.advanceTimersByTimeAsync(SAFETY_TIMEOUT_MS * 2);

            expect(mockPush).toHaveBeenCalledTimes(1);
        } finally {
            jest.useRealTimers();
        }
    });

    it("aborts a still-pending barrier's signal when released early via the safety timeout", async () => {
        jest.useFakeTimers();
        try {
            const {barrier, onAbort} = makeAbortableBarrier(); // never released

            deferWrite(barrier);
            await flushMicrotasks();
            expect(onAbort).not.toHaveBeenCalled();

            await jest.advanceTimersByTimeAsync(SAFETY_TIMEOUT_MS);
            await flushMicrotasks(pushHappened);

            expect(mockPush).toHaveBeenCalledTimes(1);
            expect(onAbort).toHaveBeenCalledTimes(1);
        } finally {
            jest.useRealTimers();
        }
    });

    it("aborts a still-pending barrier's signal when flushed on background", async () => {
        const {barrier, onAbort} = makeAbortableBarrier(); // never released

        deferWrite(barrier);
        await flushMicrotasks();
        expect(onAbort).not.toHaveBeenCalled();

        emitAppState('background');
        await flushMicrotasks(pushHappened);

        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(onAbort).toHaveBeenCalledTimes(1);
    });

    it("does not abort a barrier's signal that resolves normally", async () => {
        const {barrier, release, onAbort} = makeAbortableBarrier();

        deferWrite(barrier);
        await flushMicrotasks();
        expect(mockPush).not.toHaveBeenCalled();

        release();
        await flushMicrotasks(pushHappened);

        expect(mockPush).toHaveBeenCalledTimes(1);
        // The barrier itself released the write, so it has already settled - there is nothing to abort.
        expect(onAbort).not.toHaveBeenCalled();
    });

    it('honors a custom safetyTimeoutMs', async () => {
        jest.useFakeTimers();
        try {
            const customTimeoutMs = 100;
            const barrier = () => new Promise<void>(() => {}); // never settles

            deferWrite(barrier, customTimeoutMs);
            await flushMicrotasks();

            await jest.advanceTimersByTimeAsync(customTimeoutMs - 1);
            expect(mockPush).not.toHaveBeenCalled();

            await jest.advanceTimersByTimeAsync(1);
            await flushMicrotasks(pushHappened);

            expect(mockPush).toHaveBeenCalledTimes(1);
        } finally {
            jest.useRealTimers();
        }
    });

    it('flushes every pending write on a single background event', async () => {
        const addEventListenerSpy = jest.spyOn(AppState, 'addEventListener');

        deferWrite(neverSettlingBarrier());
        // Measured relative to the first deferred write rather than asserting an absolute count, so this does
        // not depend on whether an earlier test in this file already tripped the one-time registration guard.
        const registrationsAfterFirstWrite = addEventListenerSpy.mock.calls.length;
        deferWrite(neverSettlingBarrier());
        deferWrite(neverSettlingBarrier());
        await flushMicrotasks();
        expect(mockPush).not.toHaveBeenCalled();

        emitAppState('background');
        await flushMicrotasks(() => mockPush.mock.calls.length >= 3);

        expect(mockPush).toHaveBeenCalledTimes(3);
        // One AppState subscription serves every pending write: the later writes must not add their own, or a
        // single background event would flush each write once per subscription.
        expect(addEventListenerSpy).toHaveBeenCalledTimes(registrationsAfterFirstWrite);
        addEventListenerSpy.mockRestore();
    });

    it('does not drop a write whose barrier abort listener throws during background flush, and still flushes the others', async () => {
        const {barrier: throwingBarrier, onAbort} = makeThrowingAbortBarrier();
        // Track that the throwing write settles (does not hang) - and, per the isolation, resolves.
        const throwingOutcome = deferWrite(throwingBarrier).then(
            () => 'resolved',
            () => 'rejected',
        );
        deferWrite(neverSettlingBarrier());
        deferWrite(neverSettlingBarrier());
        await flushMicrotasks();

        // A throwing abort listener is reported out of band by AbortSignal's dispatch: it must neither
        // abort the loop flushing the other two, nor drop its own write. All three writes should flush.
        expect(() => emitAppState('background')).not.toThrow();
        await flushMicrotasks(() => mockPush.mock.calls.length >= 3);

        expect(mockPush).toHaveBeenCalledTimes(3);
        expect(onAbort).toHaveBeenCalledTimes(1);
        await expect(throwingOutcome).resolves.toBe('resolved');
    });

    it('does not drop the write when the barrier abort listener throws on the safety timeout path', async () => {
        jest.useFakeTimers();
        try {
            const {barrier: throwingBarrier, onAbort} = makeThrowingAbortBarrier(); // never settles
            const outcome = deferWrite(throwingBarrier).then(
                () => 'resolved',
                () => 'rejected',
            );
            await flushMicrotasks();

            await jest.advanceTimersByTimeAsync(SAFETY_TIMEOUT_MS);
            await flushMicrotasks(pushHappened);

            // The safety timeout must force the write through even though the abort listener threw.
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
            const cancel = jest.fn();
            mockRunAfterTransitions.mockReturnValue({cancel});

            // No barrier arg => the default waitForNavigationTransition barrier.
            deferWrite();
            await flushMicrotasks();
            expect(cancel).not.toHaveBeenCalled();

            await jest.advanceTimersByTimeAsync(SAFETY_TIMEOUT_MS);
            await flushMicrotasks(pushHappened);

            expect(mockPush).toHaveBeenCalledTimes(1);
            expect(cancel).toHaveBeenCalledTimes(1);
        } finally {
            jest.useRealTimers();
        }
    });

    it('forwards the command, params, and onyxData to write() and resolves once queued', async () => {
        const onyxData: DeferWriteOnyxData = {
            successData: [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NVP_PREFERRED_LOCALE, value: CONST.LOCALES.EN}],
        };

        const promise = deferWrite(() => Promise.resolve(), undefined, onyxData);
        await flushMicrotasks(pushHappened);

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
        expect(SAFETY_TIMEOUT_MS).toBeGreaterThan(CONST.MAX_TRANSITION_START_WAIT_MS + CONST.MAX_TRANSITION_DURATION_MS);
    });
});
