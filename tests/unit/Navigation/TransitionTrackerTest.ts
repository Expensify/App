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
            const handle = TransitionTracker.startTransition();
            const callback = jest.fn();
            TransitionTracker.runAfterTransitions({callback, runImmediately: true});
            expect(callback).toHaveBeenCalledTimes(1);
            TransitionTracker.endTransition(handle);
            drainTransitions();
        });

        it('queues callback when transition is active and runs it after endTransition', () => {
            const callback = jest.fn();
            const handle = TransitionTracker.startTransition();
            TransitionTracker.runAfterTransitions({callback});
            expect(callback).not.toHaveBeenCalled();
            TransitionTracker.endTransition(handle);
            expect(callback).toHaveBeenCalledTimes(1);
            drainTransitions();
        });

        it('runs queued callbacks only when all overlapping transitions end', () => {
            const callback = jest.fn();
            const handleA = TransitionTracker.startTransition();
            const handleB = TransitionTracker.startTransition();
            TransitionTracker.runAfterTransitions({callback});
            TransitionTracker.endTransition(handleA);
            expect(callback).not.toHaveBeenCalled();
            TransitionTracker.endTransition(handleB);
            expect(callback).toHaveBeenCalledTimes(1);
            drainTransitions();
        });

        it('cancel prevents queued callback from running', () => {
            const callback = jest.fn();
            const transitionHandle = TransitionTracker.startTransition();
            const cancelHandle = TransitionTracker.runAfterTransitions({callback});
            cancelHandle.cancel();
            TransitionTracker.endTransition(transitionHandle);
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
            const handle = TransitionTracker.startTransition();
            // Two ticks: one for promiseForNextTransitionStart, one for Promise.race wrapper
            await Promise.resolve();
            await Promise.resolve();
            expect(callback).not.toHaveBeenCalled();
            TransitionTracker.endTransition(handle);
            expect(callback).toHaveBeenCalledTimes(1);
            drainTransitions();
        });

        it('waitForUpcomingTransition fires callback after timeout if transitionStart never arrives', async () => {
            const callback = jest.fn();
            TransitionTracker.runAfterTransitions({callback, waitForUpcomingTransition: true});
            expect(callback).not.toHaveBeenCalled();
            jest.advanceTimersByTime(CONST.MAX_TRANSITION_START_WAIT_MS);
            await Promise.resolve();
            await Promise.resolve();
            expect(callback).toHaveBeenCalledTimes(1);
            drainTransitions();
        });

        it('cancel prevents waitForUpcomingTransition callback from running after transition starts', () => {
            const callback = jest.fn();
            const cancelHandle = TransitionTracker.runAfterTransitions({callback, waitForUpcomingTransition: true});
            const transitionHandle = TransitionTracker.startTransition();
            cancelHandle.cancel();
            TransitionTracker.endTransition(transitionHandle);
            expect(callback).not.toHaveBeenCalled();
            drainTransitions();
        });

        it('cancel before transition starts prevents waitForUpcomingTransition callback from running', () => {
            const callback = jest.fn();
            const cancelHandle = TransitionTracker.runAfterTransitions({callback, waitForUpcomingTransition: true});
            cancelHandle.cancel();
            const transitionHandle = TransitionTracker.startTransition();
            TransitionTracker.endTransition(transitionHandle);
            expect(callback).not.toHaveBeenCalled();
            drainTransitions();
        });
    });

    describe('handle-based pairing', () => {
        it('out-of-order end: transitions ended in reverse order still flush correctly', () => {
            const callback = jest.fn();
            const handleA = TransitionTracker.startTransition();
            const handleB = TransitionTracker.startTransition();
            TransitionTracker.runAfterTransitions({callback});
            TransitionTracker.endTransition(handleB);
            expect(callback).not.toHaveBeenCalled();
            TransitionTracker.endTransition(handleA);
            expect(callback).toHaveBeenCalledTimes(1);
            drainTransitions();
        });

        it('double-end with same handle is a no-op and does not corrupt the count', () => {
            const callback = jest.fn();
            const handleA = TransitionTracker.startTransition();
            const handleB = TransitionTracker.startTransition();
            TransitionTracker.runAfterTransitions({callback});

            TransitionTracker.endTransition(handleA);
            TransitionTracker.endTransition(handleA);
            expect(callback).not.toHaveBeenCalled();

            TransitionTracker.endTransition(handleB);
            expect(callback).toHaveBeenCalledTimes(1);
            drainTransitions();
        });

        it('safety timeout fires then manual endTransition is a no-op — no double-decrement', () => {
            const callback = jest.fn();
            const handle = TransitionTracker.startTransition();
            TransitionTracker.runAfterTransitions({callback});

            jest.advanceTimersByTime(CONST.MAX_TRANSITION_DURATION_MS);
            expect(callback).toHaveBeenCalledTimes(1);

            TransitionTracker.endTransition(handle);
            expect(callback).toHaveBeenCalledTimes(1);

            const laterCallback = jest.fn();
            const laterHandle = TransitionTracker.startTransition();
            TransitionTracker.runAfterTransitions({callback: laterCallback});
            expect(laterCallback).not.toHaveBeenCalled();
            TransitionTracker.endTransition(laterHandle);
            expect(laterCallback).toHaveBeenCalledTimes(1);
            drainTransitions();
        });

        it('exception in one callback does not prevent subsequent callbacks from running', () => {
            const handle = TransitionTracker.startTransition();
            const callbackA = jest.fn(() => {
                throw new Error('boom');
            });
            const callbackB = jest.fn();
            TransitionTracker.runAfterTransitions({callback: callbackA});
            TransitionTracker.runAfterTransitions({callback: callbackB});

            TransitionTracker.endTransition(handle);
            expect(callbackA).toHaveBeenCalledTimes(1);
            expect(callbackB).toHaveBeenCalledTimes(1);
            drainTransitions();
        });
    });
});
