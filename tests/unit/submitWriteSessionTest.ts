import type {WriteReadyBarrier} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import {push as pushToSequentialQueue} from '@libs/Network/SequentialQueue';
import {hasPendingSubmitWriteForReport, resetForTesting as resetPendingSubmitWriteForTesting} from '@libs/pendingSubmitWrite';
import {
    cancelWriteSession,
    DEFAULT_SAFETY_TIMEOUT_MS,
    flushWriteSession,
    getOptimisticWatchKey,
    hasPendingWrite,
    reserveWriteSession,
    resetForTesting,
    scheduleWrite,
} from '@libs/submitWriteSession';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {AppState} from 'react-native';

jest.mock('@libs/Network/SequentialQueue', () => ({
    push: jest.fn(() => Promise.resolve()),
    waitForIdle: jest.fn(() => Promise.resolve()),
    flush: jest.fn(),
}));
jest.mock('@libs/Navigation/TransitionTracker');
jest.mock('@libs/Pusher');
jest.mock('@libs/NetworkState');

const mockPush = jest.mocked(pushToSequentialQueue);

// submitWriteSession's scheduling behavior is command-agnostic; UPDATE_PREFERRED_LOCALE is just an arbitrary write command.
function write() {
    return scheduleWrite(WRITE_COMMANDS.UPDATE_PREFERRED_LOCALE, {value: CONST.LOCALES.EN}, {}, {shouldDeferForSearch: false});
}

function deferToSearch(options: Parameters<typeof scheduleWrite>[3] = {shouldDeferForSearch: true}) {
    return scheduleWrite(WRITE_COMMANDS.UPDATE_PREFERRED_LOCALE, {value: CONST.LOCALES.EN}, {}, options);
}

function deferToDismissModal(isRetry = false) {
    return scheduleWrite(WRITE_COMMANDS.UPDATE_PREFERRED_LOCALE, {value: CONST.LOCALES.EN}, {}, {shouldDeferForSearch: false, isRetry});
}

function writeWithBarrier(barrier: WriteReadyBarrier, options: Omit<Parameters<typeof scheduleWrite>[3], 'barrier'> = {shouldDeferForSearch: false}) {
    return scheduleWrite(WRITE_COMMANDS.UPDATE_PREFERRED_LOCALE, {value: CONST.LOCALES.EN}, {}, {...options, barrier});
}

async function flushMicrotasks(until: () => boolean = () => false, maxIterations = 50) {
    for (let i = 0; i < maxIterations && !until(); i++) {
        await Promise.resolve();
    }
}

const pushHappened = () => mockPush.mock.calls.length > 0;
const pushCount = () => mockPush.mock.calls.length;

beforeEach(() => {
    jest.clearAllMocks();
    resetForTesting();
    resetPendingSubmitWriteForTesting();
});

afterEach(() => {
    // Defensive: drain any write a test left pending (its barrier never released) via the background
    // flush, so writeWhenReady's own pendingWrites bookkeeping cannot leak into the next test's counts.
    AppState.emitCurrentTestState('background');
    AppState.emitCurrentTestState('active');
    resetForTesting();
});

describe('submitWriteSession', () => {
    it('executes immediately when no session is active', async () => {
        write();
        await flushMicrotasks(pushHappened);

        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('defers to the SEARCH session when shouldDeferForSearch is true', async () => {
        deferToSearch({shouldDeferForSearch: true, optimisticWatchKey: 'transactions_123'});
        await flushMicrotasks();

        expect(mockPush).not.toHaveBeenCalled();
        expect(hasPendingWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)).toBe(true);
        expect(getOptimisticWatchKey(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)).toBe('transactions_123');

        flushWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
        await flushMicrotasks(pushHappened);

        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('defers to the DISMISS_MODAL session when a reservation exists', async () => {
        reserveWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);

        deferToDismissModal();
        await flushMicrotasks();

        expect(mockPush).not.toHaveBeenCalled();
        expect(hasPendingWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL)).toBe(true);

        flushWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
        await flushMicrotasks(pushHappened);

        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('SEARCH takes priority over DISMISS_MODAL when both conditions are true', async () => {
        reserveWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);

        deferToSearch();
        await flushMicrotasks();

        expect(hasPendingWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)).toBe(true);
        expect(mockPush).not.toHaveBeenCalled();

        flushWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
        await flushMicrotasks(pushHappened);

        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('skips DISMISS_MODAL deferral when isRetry is true', async () => {
        reserveWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);

        deferToDismissModal(true);
        await flushMicrotasks(pushHappened);

        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('defaults isRetry to false (defers to DISMISS_MODAL)', async () => {
        reserveWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);

        deferToDismissModal();
        await flushMicrotasks();

        expect(mockPush).not.toHaveBeenCalled();
        expect(hasPendingWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL)).toBe(true);
    });

    it('falls back to a reserved SEARCH session when shouldDeferForSearch was not set', async () => {
        reserveWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);

        write();
        await flushMicrotasks();

        expect(mockPush).not.toHaveBeenCalled();
        expect(hasPendingWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)).toBe(true);

        flushWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
        await flushMicrotasks(pushHappened);

        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('fires the safety timeout when a scheduled write is never flushed', async () => {
        jest.useFakeTimers();
        try {
            deferToSearch();
            await flushMicrotasks();
            expect(mockPush).not.toHaveBeenCalled();

            await jest.advanceTimersByTimeAsync(5000);

            expect(mockPush).toHaveBeenCalledTimes(1);
            expect(hasPendingWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)).toBe(false);
        } finally {
            jest.useRealTimers();
        }
    });

    it('does not double-fire after flush + safety timeout', async () => {
        jest.useFakeTimers();
        try {
            deferToSearch();
            await flushMicrotasks();
            flushWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
            await flushMicrotasks(pushHappened);
            expect(mockPush).toHaveBeenCalledTimes(1);

            await jest.advanceTimersByTimeAsync(5000);

            expect(mockPush).toHaveBeenCalledTimes(1);
        } finally {
            jest.useRealTimers();
        }
    });

    it('flushes the previous write immediately when a second one is scheduled on the same key', async () => {
        deferToSearch({shouldDeferForSearch: true, optimisticWatchKey: 'transactions_first'});
        await flushMicrotasks();
        expect(mockPush).not.toHaveBeenCalled();

        deferToSearch({shouldDeferForSearch: true, optimisticWatchKey: 'transactions_second'});
        await flushMicrotasks(pushHappened);

        // The first write flushed immediately (flush-and-replace); the second is now the pending session.
        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(getOptimisticWatchKey(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)).toBe('transactions_second');

        flushWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
        await flushMicrotasks(() => pushCount() >= 2);
        expect(mockPush).toHaveBeenCalledTimes(2);
    });

    it('cancels a reserved session without executing a write', () => {
        reserveWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
        cancelWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);

        expect(hasPendingWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)).toBe(false);
    });

    it('returns false for hasPendingWrite and undefined for getOptimisticWatchKey on unknown keys', () => {
        expect(hasPendingWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)).toBe(false);
        expect(getOptimisticWatchKey(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)).toBeUndefined();
    });

    it('is a no-op when flushing or cancelling an unreserved key', () => {
        expect(() => flushWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)).not.toThrow();
        expect(() => cancelWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)).not.toThrow();
    });

    it('flushes all pending sessions when the app goes to background', async () => {
        deferToSearch();
        reserveWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
        deferToDismissModal();
        await flushMicrotasks();

        expect(mockPush).not.toHaveBeenCalled();

        AppState.emitCurrentTestState('background');
        await flushMicrotasks(() => pushCount() >= 2);

        expect(mockPush).toHaveBeenCalledTimes(2);
        expect(hasPendingWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)).toBe(false);
        expect(hasPendingWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL)).toBe(false);
    });

    describe('DISMISS_MODAL session lifecycle', () => {
        it('reserve -> flush-while-reserved -> schedule executes immediately', async () => {
            reserveWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
            flushWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);

            deferToDismissModal();
            await flushMicrotasks(pushHappened);

            expect(mockPush).toHaveBeenCalledTimes(1);
            expect(hasPendingWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL)).toBe(false);
        });

        it('reserve -> schedule -> flush executes on flush', async () => {
            reserveWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);

            deferToDismissModal();
            await flushMicrotasks();
            expect(mockPush).not.toHaveBeenCalled();

            flushWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
            await flushMicrotasks(pushHappened);

            expect(mockPush).toHaveBeenCalledTimes(1);
        });

        it('second flush is a no-op after the session was already consumed', async () => {
            reserveWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);

            deferToDismissModal();
            flushWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
            await flushMicrotasks(pushHappened);
            expect(mockPush).toHaveBeenCalledTimes(1);

            flushWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
            await flushMicrotasks();
            expect(mockPush).toHaveBeenCalledTimes(1);
        });
    });

    describe('report-side pending-write signal', () => {
        it('returns false when no session is registered', () => {
            expect(hasPendingSubmitWriteForReport('report-1')).toBe(false);
        });

        it('returns false when reservation has no destination', () => {
            reserveWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
            expect(hasPendingSubmitWriteForReport('report-1')).toBe(false);
        });

        it('returns true only when destination matches the queried report', () => {
            reserveWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, {destinationReportID: 'report-A'});

            expect(hasPendingSubmitWriteForReport('report-A')).toBe(true);
            expect(hasPendingSubmitWriteForReport('report-B')).toBe(false);
        });

        it('returns false when reportID arg is undefined', () => {
            reserveWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, {destinationReportID: 'report-A'});
            expect(hasPendingSubmitWriteForReport(undefined)).toBe(false);
        });

        it('preserves the destination across reserve -> schedule handoff', async () => {
            reserveWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, {destinationReportID: 'report-A'});

            deferToDismissModal();
            await flushMicrotasks();

            expect(hasPendingSubmitWriteForReport('report-A')).toBe(true);
            expect(hasPendingSubmitWriteForReport('report-B')).toBe(false);

            flushWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
            await flushMicrotasks(pushHappened);
            expect(hasPendingSubmitWriteForReport('report-A')).toBe(false);
        });
    });

    describe('caller-supplied barrier', () => {
        it('waits for the barrier and takes priority over an active DISMISS_MODAL session', async () => {
            let releaseBarrier: () => void = () => {};
            const barrier = jest.fn(
                () =>
                    new Promise<void>((resolve) => {
                        releaseBarrier = resolve;
                    }),
            );
            reserveWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, {destinationReportID: 'report-A'});

            writeWithBarrier(barrier);
            await flushMicrotasks();

            expect(barrier).toHaveBeenCalledTimes(1);
            expect(mockPush).not.toHaveBeenCalled();

            releaseBarrier();
            await flushMicrotasks(pushHappened);

            expect(mockPush).toHaveBeenCalledTimes(1);
        });

        it('takes priority over an explicit Search deferral', async () => {
            const barrier = jest.fn(() => Promise.resolve());

            writeWithBarrier(barrier, {shouldDeferForSearch: true});
            await flushMicrotasks(pushHappened);

            expect(barrier).toHaveBeenCalledTimes(1);
            expect(mockPush).toHaveBeenCalledTimes(1);
        });

        it('leaves the session registry untouched', async () => {
            reserveWriteSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, {destinationReportID: 'report-A'});

            writeWithBarrier(() => Promise.resolve(), {shouldDeferForSearch: false, optimisticWatchKey: ONYXKEYS.NVP_PREFERRED_LOCALE});
            await flushMicrotasks(pushHappened);

            // The reservation is not consumed, replaced or flushed, and no watch key is published: a
            // barrier-scheduled write is invisible to the registry.
            expect(hasPendingSubmitWriteForReport('report-A')).toBe(true);
            expect(getOptimisticWatchKey(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL)).toBeUndefined();
        });

        it('reports the write as deferred so the optimization stays in the telemetry log', async () => {
            const onDeferred = jest.fn();

            writeWithBarrier(() => Promise.resolve(), {shouldDeferForSearch: false, onDeferred});
            await flushMicrotasks(pushHappened);

            expect(onDeferred).toHaveBeenCalledTimes(1);
        });

        it('fires onWriteStarted after the write goes out', async () => {
            const onWriteStarted = jest.fn();
            let releaseBarrier: () => void = () => {};
            const barrier = () =>
                new Promise<void>((resolve) => {
                    releaseBarrier = resolve;
                });

            writeWithBarrier(barrier, {shouldDeferForSearch: false, onWriteStarted});
            await flushMicrotasks();
            expect(onWriteStarted).not.toHaveBeenCalled();

            releaseBarrier();
            await flushMicrotasks(pushHappened);

            expect(onWriteStarted).toHaveBeenCalledTimes(1);
        });

        it('still writes when the barrier never releases, via the safety timeout', async () => {
            jest.useFakeTimers();
            try {
                writeWithBarrier(() => new Promise<void>(() => {}));
                await flushMicrotasks();
                expect(mockPush).not.toHaveBeenCalled();

                await jest.advanceTimersByTimeAsync(DEFAULT_SAFETY_TIMEOUT_MS);
                await flushMicrotasks(pushHappened);

                expect(mockPush).toHaveBeenCalledTimes(1);
            } finally {
                jest.useRealTimers();
            }
        });
    });
});
