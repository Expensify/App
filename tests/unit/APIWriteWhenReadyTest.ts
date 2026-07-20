import * as API from '@libs/API';
import type {WriteReadyBarrier} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
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

const SAFETY_TIMEOUT_MS = CONST.MAX_TRANSITION_DURATION_MS * 5;

// writeWhenReady's deferral behaviour is command-agnostic; UPDATE_PREFERRED_LOCALE is just an arbitrary write command.
type DeferWriteOnyxData = Parameters<typeof API.writeWhenReady>[2];
function deferWrite(barrier?: WriteReadyBarrier, safetyTimeoutMs?: number, onyxData: DeferWriteOnyxData = {}) {
    return API.writeWhenReady(WRITE_COMMANDS.UPDATE_PREFERRED_LOCALE, {value: CONST.LOCALES.EN}, onyxData, barrier, safetyTimeoutMs);
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

// A cancelable barrier (promise-like + `cancel`) that stays pending until `release()` is called, so a
// test can control exactly when (or whether) it settles and assert on its cancel handle.
function makeCancelableBarrier() {
    let release: () => void = () => {};
    const promise = new Promise<void>((resolve) => {
        release = resolve;
    });
    const cancel = jest.fn();
    const barrier: WriteReadyBarrier = {then: promise.then.bind(promise), cancel};
    return {barrier, release, cancel};
}

// A never-settling cancelable barrier whose cancel() throws, to exercise the throw-safe execute path.
function makeThrowingCancelBarrier() {
    const promise = new Promise<void>(() => {});
    const cancel = jest.fn(() => {
        throw new Error('cancel boom');
    });
    const barrier: WriteReadyBarrier = {then: promise.then.bind(promise), cancel};
    return {barrier, cancel};
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

    it('defaults to waiting for the navigation transition', async () => {
        let transitionCallback: () => void = () => {};
        mockRunAfterTransitions.mockImplementation(({callback}) => {
            transitionCallback = callback as () => void;
            return {cancel: jest.fn()};
        });

        API.writeWhenReady(WRITE_COMMANDS.UPDATE_PREFERRED_LOCALE, {value: CONST.LOCALES.EN});
        await flushMicrotasks();

        expect(mockRunAfterTransitions).toHaveBeenCalledWith(expect.objectContaining({waitForUpcomingTransition: true}));
        expect(mockPush).not.toHaveBeenCalled();

        transitionCallback();
        await flushMicrotasks(pushHappened);

        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('accepts a promise-like barrier directly, not only a thunk', async () => {
        let releaseBarrier: () => void = () => {};
        const barrierPromise = new Promise<void>((resolve) => {
            releaseBarrier = resolve;
        });

        deferWrite(barrierPromise);
        await flushMicrotasks();
        expect(mockPush).not.toHaveBeenCalled();

        releaseBarrier();
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

    it('cancels a still-pending cancelable barrier when released early via the safety timeout', async () => {
        jest.useFakeTimers();
        try {
            const {barrier, cancel} = makeCancelableBarrier(); // never released

            deferWrite(barrier);
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

    it('cancels a still-pending cancelable barrier when flushed on background', async () => {
        const {barrier, cancel} = makeCancelableBarrier(); // never released

        deferWrite(barrier);
        await flushMicrotasks();
        expect(cancel).not.toHaveBeenCalled();

        emitAppState('background');
        await flushMicrotasks(pushHappened);

        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(cancel).toHaveBeenCalledTimes(1);
    });

    it('calls cancel exactly once (a safe no-op) even when the barrier resolves normally', async () => {
        const {barrier, release, cancel} = makeCancelableBarrier();

        deferWrite(barrier);
        await flushMicrotasks();
        expect(mockPush).not.toHaveBeenCalled();

        release();
        await flushMicrotasks(pushHappened);

        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(cancel).toHaveBeenCalledTimes(1);
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
        deferWrite(neverSettlingBarrier());
        deferWrite(neverSettlingBarrier());
        deferWrite(neverSettlingBarrier());
        await flushMicrotasks();
        expect(mockPush).not.toHaveBeenCalled();

        emitAppState('background');
        await flushMicrotasks(() => mockPush.mock.calls.length >= 3);

        expect(mockPush).toHaveBeenCalledTimes(3);
    });

    it('isolates a throwing write during background flush so the others still flush', async () => {
        const {barrier: throwingBarrier, cancel} = makeThrowingCancelBarrier();
        // Track that the throwing write settles (rejects) rather than hanging forever.
        const throwingOutcome = deferWrite(throwingBarrier).catch(() => 'rejected');
        deferWrite(neverSettlingBarrier());
        deferWrite(neverSettlingBarrier());
        await flushMicrotasks();

        // The write whose cancel() throws must not abort the loop flushing the other two, nor hang.
        expect(() => emitAppState('background')).not.toThrow();
        await flushMicrotasks(() => mockPush.mock.calls.length >= 2);

        expect(mockPush).toHaveBeenCalledTimes(2);
        expect(cancel).toHaveBeenCalledTimes(1);
        await expect(throwingOutcome).resolves.toBe('rejected');
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
