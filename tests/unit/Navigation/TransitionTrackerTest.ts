import TransitionTracker from '@libs/Navigation/TransitionTracker';
import CONST from '@src/CONST';

describe('TransitionTracker', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    function drainTransitions(): void {
        jest.runAllTimers();
    }

    describe('runAfterTransitions', () => {
        it('runs callback immediately when no transition is active', () => {
            const callback = jest.fn();
            TransitionTracker.runAfterTransitions({callback});
            expect(callback).toHaveBeenCalledTimes(1);
            drainTransitions();
        });

        it('runs callback immediately when runImmediately is true even with active transition', () => {
            TransitionTracker.startTransition();
            const callback = jest.fn();
            TransitionTracker.runAfterTransitions({callback, runImmediately: true});
            expect(callback).toHaveBeenCalledTimes(1);
            TransitionTracker.endTransition();
            drainTransitions();
        });

        it('queues callback when transition is active and runs it after endTransition', () => {
            const callback = jest.fn();
            TransitionTracker.startTransition();
            TransitionTracker.runAfterTransitions({callback});
            expect(callback).not.toHaveBeenCalled();
            TransitionTracker.endTransition();
            expect(callback).toHaveBeenCalledTimes(1);
            drainTransitions();
        });

        it('runs queued callbacks only when all overlapping transitions end', () => {
            const callback = jest.fn();
            TransitionTracker.startTransition();
            TransitionTracker.startTransition();
            TransitionTracker.runAfterTransitions({callback});
            TransitionTracker.endTransition();
            expect(callback).not.toHaveBeenCalled();
            TransitionTracker.endTransition();
            expect(callback).toHaveBeenCalledTimes(1);
            drainTransitions();
        });

        it('cancel prevents queued callback from running', () => {
            const callback = jest.fn();
            TransitionTracker.startTransition();
            const handle = TransitionTracker.runAfterTransitions({callback});
            handle.cancel();
            TransitionTracker.endTransition();
            expect(callback).not.toHaveBeenCalled();
            drainTransitions();
        });

        it('safety timeout flushes callbacks when endTransition is never called', () => {
            const callback = jest.fn();
            TransitionTracker.startTransition();
            TransitionTracker.runAfterTransitions({callback});
            expect(callback).not.toHaveBeenCalled();
            jest.advanceTimersByTime(CONST.MAX_TRANSITION_DURATION_MS);
            expect(callback).toHaveBeenCalledTimes(1);
            jest.useRealTimers();
        });

        it('waitForUpcomingTransition queues callback after next transition starts and runs it after transition ends', async () => {
            const callback = jest.fn();
            TransitionTracker.runAfterTransitions({callback, waitForUpcomingTransition: true});
            expect(callback).not.toHaveBeenCalled();
            TransitionTracker.startTransition();
            await Promise.resolve();
            expect(callback).not.toHaveBeenCalled();
            TransitionTracker.endTransition();
            expect(callback).toHaveBeenCalledTimes(1);
            drainTransitions();
        });

        it('cancel prevents waitForUpcomingTransition callback from running after transition starts', () => {
            const callback = jest.fn();
            const handle = TransitionTracker.runAfterTransitions({callback, waitForUpcomingTransition: true});
            TransitionTracker.startTransition();
            handle.cancel();
            TransitionTracker.endTransition();
            expect(callback).not.toHaveBeenCalled();
            drainTransitions();
        });

        it('cancel before transition starts prevents waitForUpcomingTransition callback from running', () => {
            const callback = jest.fn();
            const handle = TransitionTracker.runAfterTransitions({callback, waitForUpcomingTransition: true});
            handle.cancel();
            TransitionTracker.startTransition();
            TransitionTracker.endTransition();
            expect(callback).not.toHaveBeenCalled();
            drainTransitions();
        });
    });
});
