// Typed require with explicit .ts path — matches the project's test-file convention.
/* eslint-disable @typescript-eslint/no-require-imports, import/extensions */
const {tryClaim, resetCycle, Priorities, CYCLE_TIMEOUT_MS} = require<{
    tryClaim: (priority: number) => boolean;
    resetCycle: () => void;
    Priorities: {INITIAL: number; AUTO: number; RETURN: number};
    CYCLE_TIMEOUT_MS: number;
}>('../../src/libs/ScreenFocusArbiter.ts');
/* eslint-enable @typescript-eslint/no-require-imports, import/extensions */

beforeEach(() => {
    resetCycle();
});

describe('ScreenFocusArbiter', () => {
    describe('tryClaim', () => {
        it('should succeed when no prior claim exists', () => {
            expect(tryClaim(Priorities.INITIAL)).toBe(true);
        });

        it('should succeed when a higher priority claims over a lower one', () => {
            expect(tryClaim(Priorities.INITIAL)).toBe(true);
            expect(tryClaim(Priorities.AUTO)).toBe(true);
            expect(tryClaim(Priorities.RETURN)).toBe(true);
        });

        it('should reject when a lower priority attempts to override a higher one', () => {
            expect(tryClaim(Priorities.RETURN)).toBe(true);
            expect(tryClaim(Priorities.AUTO)).toBe(false);
            expect(tryClaim(Priorities.INITIAL)).toBe(false);
        });

        it('should allow equal priority to re-claim (idempotent)', () => {
            expect(tryClaim(Priorities.AUTO)).toBe(true);
            expect(tryClaim(Priorities.AUTO)).toBe(true);
        });

        it('should allow AUTO after RETURN once the cycle expires', () => {
            jest.useFakeTimers();
            try {
                expect(tryClaim(Priorities.RETURN)).toBe(true);
                expect(tryClaim(Priorities.AUTO)).toBe(false);

                jest.advanceTimersByTime(CYCLE_TIMEOUT_MS + 1);
                expect(tryClaim(Priorities.AUTO)).toBe(true);
            } finally {
                jest.useRealTimers();
            }
        });

        it('should keep the cycle fresh on every claim within the window', () => {
            jest.useFakeTimers();
            try {
                expect(tryClaim(Priorities.RETURN)).toBe(true);

                jest.advanceTimersByTime(CYCLE_TIMEOUT_MS - 100);
                expect(tryClaim(Priorities.RETURN)).toBe(true);

                jest.advanceTimersByTime(150);
                // Window resets from the last successful claim, not from the first.
                expect(tryClaim(Priorities.AUTO)).toBe(false);

                jest.advanceTimersByTime(CYCLE_TIMEOUT_MS + 150);
                expect(tryClaim(Priorities.AUTO)).toBe(true);
            } finally {
                jest.useRealTimers();
            }
        });
    });

    describe('resetCycle', () => {
        it('should clear the current priority so any claim succeeds next', () => {
            expect(tryClaim(Priorities.RETURN)).toBe(true);
            expect(tryClaim(Priorities.INITIAL)).toBe(false);

            resetCycle();
            expect(tryClaim(Priorities.INITIAL)).toBe(true);
        });

        it('should also reset the timestamp so the expiration window restarts', () => {
            jest.useFakeTimers({now: 0});
            try {
                expect(tryClaim(Priorities.RETURN)).toBe(true);

                resetCycle();

                jest.setSystemTime(100);
                expect(tryClaim(Priorities.INITIAL)).toBe(true);
            } finally {
                jest.useRealTimers();
            }
        });
    });
});
