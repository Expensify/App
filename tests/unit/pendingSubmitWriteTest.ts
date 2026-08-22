import {SAFETY_TIMEOUT_MS} from '@libs/API/writeWhenReady';
import {hasPendingSubmitWriteForReport, markPendingSubmitWriteForReport, resetForTesting, restartPendingSubmitWriteSafetyTimeout} from '@libs/pendingSubmitWrite';

beforeEach(() => {
    resetForTesting();
});

describe('pendingSubmitWrite', () => {
    it('raises the signal only for the report it was marked for', () => {
        markPendingSubmitWriteForReport('report-A');

        expect(hasPendingSubmitWriteForReport('report-A')).toBe(true);
        expect(hasPendingSubmitWriteForReport('report-B')).toBe(false);
    });

    it('returns false for an undefined reportID', () => {
        markPendingSubmitWriteForReport('report-A');

        expect(hasPendingSubmitWriteForReport(undefined)).toBe(false);
    });

    it('does nothing when marked without a reportID', () => {
        const clear = markPendingSubmitWriteForReport(undefined);
        clear();

        expect(hasPendingSubmitWriteForReport('report-A')).toBe(false);
    });

    it('clears via the returned function, idempotently', () => {
        const clear = markPendingSubmitWriteForReport('report-A');

        clear();
        expect(hasPendingSubmitWriteForReport('report-A')).toBe(false);

        clear();
        expect(hasPendingSubmitWriteForReport('report-A')).toBe(false);
    });

    it('ignores a stale clear from a submission that was superseded', () => {
        const clearFirst = markPendingSubmitWriteForReport('report-A');
        markPendingSubmitWriteForReport('report-B');

        // The first submission's cleanup arriving late must not clear the newer submission's signal.
        clearFirst();

        expect(hasPendingSubmitWriteForReport('report-B')).toBe(true);
    });

    it('clears itself after the safety timeout when nobody clears it', () => {
        jest.useFakeTimers();
        try {
            markPendingSubmitWriteForReport('report-A');
            expect(hasPendingSubmitWriteForReport('report-A')).toBe(true);

            // Bounded by the same timeout writeWhenReady uses to guarantee the write goes out, so a
            // report can never be left showing a loading skeleton forever.
            jest.advanceTimersByTime(SAFETY_TIMEOUT_MS);

            expect(hasPendingSubmitWriteForReport('report-A')).toBe(false);
        } finally {
            jest.useRealTimers();
        }
    });

    it("does not let a superseded submission's safety timeout clear the current signal", () => {
        jest.useFakeTimers();
        try {
            markPendingSubmitWriteForReport('report-A');
            jest.advanceTimersByTime(SAFETY_TIMEOUT_MS / 2);
            markPendingSubmitWriteForReport('report-B');

            // The first mark's timer would fire here if it had not been superseded.
            jest.advanceTimersByTime(SAFETY_TIMEOUT_MS / 2);

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
});
