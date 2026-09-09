import {SAFETY_TIMEOUT_MS} from '@libs/API/writeWhenReady';
import {
    clearPendingSubmitWriteWhenBarrierSettles,
    hasPendingSubmitWriteForReport,
    markPendingSubmitWriteForReport,
    resetForTesting,
    restartPendingSubmitWriteSafetyTimeout,
} from '@libs/pendingSubmitWrite';

beforeEach(() => {
    resetForTesting();
});

describe('pendingSubmitWrite', () => {
    it('raises the signal only for the report it was marked for', () => {
        // Given a submit write marked pending for one specific report
        markPendingSubmitWriteForReport('report-A');

        // Then only that report sees a pending write - an unscoped signal would make every unrelated
        // empty money-request report look like it's loading too
        expect(hasPendingSubmitWriteForReport('report-A')).toBe(true);
        expect(hasPendingSubmitWriteForReport('report-B')).toBe(false);
    });

    it('returns false for an undefined reportID', () => {
        // Given a submit write pending for a real report
        markPendingSubmitWriteForReport('report-A');

        // Then querying with no reportID must not accidentally match it - a consumer with no report
        // context yet should never read as "loading" for whatever happens to be pending
        expect(hasPendingSubmitWriteForReport(undefined)).toBe(false);
    });

    it('does nothing when marked without a reportID', () => {
        // Given a mark call with no reportID, which has nothing to track
        const clear = markPendingSubmitWriteForReport(undefined);
        clear();

        // Then no report is left pending - the no-op path must not leave stale state behind
        expect(hasPendingSubmitWriteForReport('report-A')).toBe(false);
    });

    it('clears via the returned function, idempotently', () => {
        // Given a submit write marked pending
        const clear = markPendingSubmitWriteForReport('report-A');

        // When it's cleared
        clear();
        expect(hasPendingSubmitWriteForReport('report-A')).toBe(false);

        // Then clearing again is a no-op, so a caller that can't guarantee single-clear semantics (e.g. both a timeout and a manual clear) can't double-clear a later signal by accident
        clear();
        expect(hasPendingSubmitWriteForReport('report-A')).toBe(false);
    });

    it('ignores a stale clear from a submission that was superseded', () => {
        // Given two submissions in flight, one after the other, each with its own clear function
        const clearFirst = markPendingSubmitWriteForReport('report-A');
        markPendingSubmitWriteForReport('report-B');

        // When the first submission's cleanup arrives late, after it has already been superseded
        clearFirst();

        // Then the newer submission's signal survives - a stale clear reaching this module out of order
        // must not be able to drop a signal it has nothing to do with
        expect(hasPendingSubmitWriteForReport('report-B')).toBe(true);
    });

    it('clears itself after the safety timeout when nobody clears it', () => {
        jest.useFakeTimers();
        try {
            // Given a submit write marked pending, with nothing set up to ever call its clear function
            markPendingSubmitWriteForReport('report-A');
            expect(hasPendingSubmitWriteForReport('report-A')).toBe(true);

            // When the safety timeout elapses - the same bound writeWhenReady uses to guarantee a write
            // goes out, so this signal can't outlive the write it's tracking
            jest.advanceTimersByTime(SAFETY_TIMEOUT_MS);

            // Then the signal clears itself, so a report can never be left showing a loading skeleton forever
            expect(hasPendingSubmitWriteForReport('report-A')).toBe(false);
        } finally {
            jest.useRealTimers();
        }
    });

    it("does not let a superseded submission's safety timeout clear the current signal", () => {
        jest.useFakeTimers();
        try {
            // Given a first submission that gets superseded by a second one, partway through the first
            // submission's safety-timeout window
            markPendingSubmitWriteForReport('report-A');
            jest.advanceTimersByTime(SAFETY_TIMEOUT_MS / 2);
            markPendingSubmitWriteForReport('report-B');

            // When the first mark's original timer would have fired, if it had not been superseded
            jest.advanceTimersByTime(SAFETY_TIMEOUT_MS / 2);

            // Then the current (second) signal is unaffected - a stale timer clearing the wrong
            // generation would drop a live signal for a submission that hasn't had a chance to clear yet
            expect(hasPendingSubmitWriteForReport('report-B')).toBe(true);
        } finally {
            jest.useRealTimers();
        }
    });

    it('restarts the safety timeout from the point the write attaches', () => {
        jest.useFakeTimers();
        try {
            // Given a submit write marked pending well before the actual write is constructed
            markPendingSubmitWriteForReport('report-A');
            jest.advanceTimersByTime(SAFETY_TIMEOUT_MS - 1);

            // When the write attaches near the end of the mark-time window and restarts its timeout
            restartPendingSubmitWriteSafetyTimeout('report-A');
            jest.advanceTimersByTime(SAFETY_TIMEOUT_MS - 1);

            // Then the signal is still up, because the restart bought it a fresh window rather than
            // expiring on the original mark-time schedule
            expect(hasPendingSubmitWriteForReport('report-A')).toBe(true);

            jest.advanceTimersByTime(1);
            expect(hasPendingSubmitWriteForReport('report-A')).toBe(false);
        } finally {
            jest.useRealTimers();
        }
    });

    it('ignores a restart for a report that is no longer the pending one', () => {
        jest.useFakeTimers();
        try {
            // Given a submit write pending for report-A
            markPendingSubmitWriteForReport('report-A');

            // When a restart arrives for a different report, e.g. a stale call from a superseded write
            restartPendingSubmitWriteSafetyTimeout('report-B');
            jest.advanceTimersByTime(SAFETY_TIMEOUT_MS);

            // Then report-A's original timer still governs it - the mismatched restart must not have
            // extended a signal it wasn't addressed to
            expect(hasPendingSubmitWriteForReport('report-A')).toBe(false);
        } finally {
            jest.useRealTimers();
        }
    });

    describe('clearPendingSubmitWriteWhenBarrierSettles', () => {
        it('keeps the signal up until the write attaches to the barrier', async () => {
            // Given a pending submit write whose clear is tied to a write barrier
            const clear = markPendingSubmitWriteForReport('report-A');
            let releaseBarrier: () => void = () => {};
            const barrier = () =>
                new Promise<void>((resolve) => {
                    releaseBarrier = resolve;
                });
            const wrappedBarrier = clearPendingSubmitWriteWhenBarrierSettles(barrier, clear);

            // When the submit function has returned but no write has attached yet (e.g. a GPS lookup is still running)
            await Promise.resolve();

            // Then the signal is still up, so the destination keeps its loading state instead of flashing empty
            expect(hasPendingSubmitWriteForReport('report-A')).toBe(true);

            // When the write attaches and the barrier settles
            const pending = wrappedBarrier(new AbortController().signal);
            releaseBarrier();
            await pending;

            // Then the signal clears at the point the write actually goes out
            expect(hasPendingSubmitWriteForReport('report-A')).toBe(false);
        });

        it('clears the signal when the write is released early via abort', async () => {
            // Given a pending submit write attached to a barrier that never settles on its own
            const clear = markPendingSubmitWriteForReport('report-A');
            const wrappedBarrier = clearPendingSubmitWriteWhenBarrierSettles(() => new Promise<void>(() => {}), clear);
            const abortController = new AbortController();
            const pending = wrappedBarrier(abortController.signal);

            // When writeWhenReady releases the write early (safety timeout or app background) by aborting
            abortController.abort();

            // Then the signal clears too, instead of waiting for its own safety timeout
            expect(hasPendingSubmitWriteForReport('report-A')).toBe(false);
            // The barrier itself never settles, so nothing more to await on `pending`
            expect(pending).toBeDefined();
        });

        it('still clears the signal when the barrier rejects', async () => {
            // Given a pending submit write tied to a barrier that rejects (the write still executes in that case)
            const clear = markPendingSubmitWriteForReport('report-A');
            const wrappedBarrier = clearPendingSubmitWriteWhenBarrierSettles(() => Promise.reject(new Error('barrier failed')), clear);

            // When the barrier rejects
            await expect(wrappedBarrier(new AbortController().signal)).rejects.toThrow('barrier failed');

            // Then the signal is cleared along with it
            expect(hasPendingSubmitWriteForReport('report-A')).toBe(false);
        });
    });
});
