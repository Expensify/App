// Typed require with explicit .ts path — matches the project's test-file convention.
/* eslint-disable import/extensions */
const {pickLauncher, consumeLauncher, setActivePopoverLauncher, scheduleClearActivePopoverLauncher, resetLauncherStackForTests} = require<{
    pickLauncher: () => HTMLElement | null;
    consumeLauncher: (element: HTMLElement) => void;
    setActivePopoverLauncher: (element: HTMLElement) => void;
    scheduleClearActivePopoverLauncher: (element?: HTMLElement) => void;
    resetLauncherStackForTests: () => void;
}>('../../src/libs/LauncherStack.ts');
/* eslint-enable import/extensions */

function appendButton(): HTMLButtonElement {
    const button = document.createElement('button');
    document.body.appendChild(button);
    return button;
}

function withFakeTimers<T>(fn: () => T): T {
    jest.useFakeTimers();
    try {
        return fn();
    } finally {
        jest.useRealTimers();
    }
}

afterEach(() => {
    document.body.innerHTML = '';
    resetLauncherStackForTests();
});

describe('LauncherStack', () => {
    describe('pickLauncher', () => {
        it('returns null when the stack is empty', () => {
            expect(pickLauncher()).toBeNull();
        });

        it('returns the topmost active launcher', () => {
            const a = appendButton();
            const b = appendButton();
            setActivePopoverLauncher(a);
            setActivePopoverLauncher(b);
            expect(pickLauncher()).toBe(b);
        });

        it('returns the outer (active) launcher when an inner nested trap deactivates', () => {
            const outer = appendButton();
            const inner = appendButton();
            setActivePopoverLauncher(outer);
            setActivePopoverLauncher(inner);
            scheduleClearActivePopoverLauncher(inner);
            expect(pickLauncher()).toBe(outer);
        });

        it('returns the most-recent deactivated-within-window entry when no active entries remain', () => {
            const a = appendButton();
            const b = appendButton();
            setActivePopoverLauncher(a);
            setActivePopoverLauncher(b);
            scheduleClearActivePopoverLauncher(a);
            scheduleClearActivePopoverLauncher(b);
            expect(pickLauncher()).toBe(b);
        });

        it('returns null after all deactivated launchers age out past LAUNCHER_CLEAR_DELAY_MS', () => {
            withFakeTimers(() => {
                const a = appendButton();
                setActivePopoverLauncher(a);
                scheduleClearActivePopoverLauncher();
                jest.advanceTimersByTime(2000);
                expect(pickLauncher()).toBeNull();
            });
        });

        it('prunes stale entries detached from the DOM', () => {
            const detached = document.createElement('button');
            setActivePopoverLauncher(detached);
            expect(pickLauncher()).toBeNull();
        });
    });

    describe('setActivePopoverLauncher', () => {
        it('re-activating a deactivated entry restores it as active (sequential traps)', () => {
            withFakeTimers(() => {
                const a = appendButton();
                const b = appendButton();
                setActivePopoverLauncher(a);
                scheduleClearActivePopoverLauncher(a);
                jest.advanceTimersByTime(500);
                setActivePopoverLauncher(b);
                // b active; a still within window but deactivated → b wins.
                expect(pickLauncher()).toBe(b);
            });
        });

        it('re-activating a mid-stack entry moves it to the top so pickLauncher sees it as most-recent', () => {
            // A pushed+deactivated → B pushed → A reactivated. Without the refresh, pickLauncher would return B instead of the just-reactivated A.
            const a = appendButton();
            const b = appendButton();
            setActivePopoverLauncher(a);
            scheduleClearActivePopoverLauncher(a);
            setActivePopoverLauncher(b);
            setActivePopoverLauncher(a);
            expect(pickLauncher()).toBe(a);
        });

        it('caps the stack at LAUNCHER_STACK_MAX and drops the oldest on overflow', () => {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            const launchers = Array.from({length: 10}, () => appendButton());
            for (const l of launchers) {
                setActivePopoverLauncher(l);
            }
            expect(pickLauncher()).toBe(launchers.at(-1));
            const top = launchers.at(-1);
            if (top) {
                consumeLauncher(top);
            }
            expect(pickLauncher()).toBe(launchers.at(-2));
            expect(warnSpy).toHaveBeenCalled();
            warnSpy.mockRestore();
        });
    });

    describe('scheduleClearActivePopoverLauncher', () => {
        it('marks the entry deactivated without immediate removal (deferred-clear within window)', () => {
            const a = appendButton();
            setActivePopoverLauncher(a);
            scheduleClearActivePopoverLauncher(a);
            expect(pickLauncher()).toBe(a);
        });

        it('defaults to the top of the stack when called without an argument', () => {
            const a = appendButton();
            const b = appendButton();
            setActivePopoverLauncher(a);
            setActivePopoverLauncher(b);
            scheduleClearActivePopoverLauncher();
            expect(pickLauncher()).toBe(a);
        });

        it('does not wipe a subsequently-pushed launcher after the window elapses', () => {
            withFakeTimers(() => {
                const a = appendButton();
                const b = appendButton();
                setActivePopoverLauncher(a);
                scheduleClearActivePopoverLauncher();
                jest.advanceTimersByTime(100);
                setActivePopoverLauncher(b);
                jest.advanceTimersByTime(2000);
                expect(pickLauncher()).toBe(b);
            });
        });

        it('moves the deactivated entry to the stack tail so nested-close order matches recency (outer closes AFTER inner → outer wins)', () => {
            // Outer A opens, inner B opens, B deactivates first, A deactivates second. A is the most recently-deactivated and should be picked.
            const outer = appendButton();
            const inner = appendButton();
            setActivePopoverLauncher(outer);
            setActivePopoverLauncher(inner);
            scheduleClearActivePopoverLauncher(inner);
            scheduleClearActivePopoverLauncher(outer);
            expect(pickLauncher()).toBe(outer);
        });
    });

    describe('consumeLauncher', () => {
        it('removes the specified entry from the stack', () => {
            const a = appendButton();
            const b = appendButton();
            setActivePopoverLauncher(a);
            setActivePopoverLauncher(b);
            consumeLauncher(b);
            expect(pickLauncher()).toBe(a);
        });

        it('is idempotent — no-ops if the launcher was already pruned', () => {
            const a = appendButton();
            setActivePopoverLauncher(a);
            consumeLauncher(a);
            expect(() => consumeLauncher(a)).not.toThrow();
            expect(pickLauncher()).toBeNull();
        });
    });
});
