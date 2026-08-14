import {SAFETY_TIMEOUT_MS} from '@libs/API/writeWhenReady';
import {hasPendingSubmitWriteForReport, markPendingSubmitWriteForReport, resetForTesting} from '@libs/pendingSubmitWrite';

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
});
