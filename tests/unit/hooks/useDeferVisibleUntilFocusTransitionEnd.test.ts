import {renderHook} from '@testing-library/react-native';

import useDeferVisibleUntilFocusTransitionEnd from '@hooks/useDeferVisibleUntilFocusTransitionEnd';

import TransitionTracker from '@libs/Navigation/TransitionTracker';

import createTransitionTrackerHarness from '../../utils/TransitionTrackerTestUtils';

jest.mock('@libs/Navigation/TransitionTracker', () => ({
    runAfterTransitions: jest.fn(),
}));

const transitionTracker = createTransitionTrackerHarness();
const {firePendingCallbacks, cancel} = transitionTracker;
const mockedRunAfterTransitions = jest.mocked(TransitionTracker.runAfterTransitions);

beforeEach(() => {
    jest.clearAllMocks();
    transitionTracker.install();
});

describe('useDeferVisibleUntilFocusTransitionEnd', () => {
    it('shows immediately when mounted already active, without waiting for a transition', () => {
        // Given a consumer that is already active on mount
        // When the hook renders for the first time
        const {result} = renderHook(() => useDeferVisibleUntilFocusTransitionEnd(true));

        // Then it shows right away, because a mount that starts active deliberately skips the deferral
        expect(result.current).toBe(true);
        expect(mockedRunAfterTransitions).not.toHaveBeenCalled();
    });

    it('returns false when mounted inactive', () => {
        // Given a consumer that is inactive on mount
        // When the hook renders for the first time
        const {result} = renderHook(() => useDeferVisibleUntilFocusTransitionEnd(false));

        // Then it stays hidden and schedules nothing
        expect(result.current).toBe(false);
        expect(mockedRunAfterTransitions).not.toHaveBeenCalled();
    });

    it('waits for the upcoming transition when scheduling', () => {
        // Given the hook mounted inactive
        const {rerender} = renderHook(({isActive}) => useDeferVisibleUntilFocusTransitionEnd(isActive), {initialProps: {isActive: false}});

        // When the consumer turns active
        rerender({isActive: true});

        // Then the callback is scheduled with waitForUpcomingTransition, so a transition that has not started yet still counts
        expect(mockedRunAfterTransitions).toHaveBeenCalledWith(expect.objectContaining({waitForUpcomingTransition: true}));
        expect(transitionTracker.getPendingCallbackCount()).toBe(1);
    });

    it('hides immediately when isActive flips to false', () => {
        // Given the hook showing an active consumer
        const {result, rerender} = renderHook(({isActive}) => useDeferVisibleUntilFocusTransitionEnd(isActive), {initialProps: {isActive: true}});
        expect(result.current).toBe(true);

        // When the consumer turns inactive
        rerender({isActive: false});

        // Then it hides at once, because hiding never has to wait for a transition
        expect(result.current).toBe(false);
    });

    it('cancels the pending handle when isActive flips to false', () => {
        // Given the hook mounted inactive
        const {rerender} = renderHook(({isActive}) => useDeferVisibleUntilFocusTransitionEnd(isActive), {initialProps: {isActive: false}});

        // When the consumer turns active and inactive again before the callback fired
        rerender({isActive: true});
        rerender({isActive: false});

        // Then the pending callback is cancelled, so it cannot reveal the consumer later
        expect(cancel).toHaveBeenCalledTimes(1);
    });

    it('stays hidden after reactivation until the scheduled callback fires', () => {
        // Given the hook showing an active consumer
        const {result, rerender} = renderHook(({isActive}) => useDeferVisibleUntilFocusTransitionEnd(isActive), {initialProps: {isActive: true}});

        // When the consumer turns inactive and active again
        rerender({isActive: false});
        rerender({isActive: true});

        // Then it stays hidden, because the second activation has its own transition to wait for
        expect(result.current).toBe(false);

        // When that transition ends
        firePendingCallbacks();

        // Then it shows
        expect(result.current).toBe(true);
    });

    it('does not schedule anything while staying inactive across rerenders', () => {
        // Given the hook mounted inactive
        const {result, rerender} = renderHook(({isActive}) => useDeferVisibleUntilFocusTransitionEnd(isActive), {initialProps: {isActive: false}});

        // When it rerenders while the consumer is still inactive
        rerender({isActive: false});

        // Then nothing is scheduled, so an inactive consumer never pays for a transition callback
        expect(mockedRunAfterTransitions).not.toHaveBeenCalled();
        expect(result.current).toBe(false);
    });

    it('ignores a stale callback after deactivation', () => {
        // Given the hook showing an active consumer
        const {result, rerender} = renderHook(({isActive}) => useDeferVisibleUntilFocusTransitionEnd(isActive), {initialProps: {isActive: true}});

        // When the consumer turns inactive and a stale callback fires anyway
        rerender({isActive: false});

        // The real cancel would prevent this, but even if a stale callback slips through, the hook must stay hidden.
        firePendingCallbacks();

        // Then it stays hidden
        expect(result.current).toBe(false);
    });

    it('handles a full hide/show cycle repeatedly', () => {
        // Given the hook mounted inactive
        const {result, rerender} = renderHook(({isActive}) => useDeferVisibleUntilFocusTransitionEnd(isActive), {initialProps: {isActive: false}});
        expect(result.current).toBe(false);

        // When the consumer turns active and its transition ends
        rerender({isActive: true});
        expect(result.current).toBe(false);
        firePendingCallbacks();

        // Then it shows
        expect(result.current).toBe(true);

        // When the consumer turns inactive
        rerender({isActive: false});

        // Then it hides
        expect(result.current).toBe(false);

        // When the same cycle runs a second time
        rerender({isActive: true});
        expect(result.current).toBe(false);
        firePendingCallbacks();

        // Then it shows again, so nothing from the first cycle is left behind
        expect(result.current).toBe(true);
    });

    it('cancels the handle on unmount', () => {
        // Given a pending callback of a consumer that turned active
        const {rerender, unmount} = renderHook(({isActive}) => useDeferVisibleUntilFocusTransitionEnd(isActive), {initialProps: {isActive: false}});

        rerender({isActive: true});
        expect(mockedRunAfterTransitions).toHaveBeenCalledTimes(1);

        // When the hook unmounts
        unmount();

        // Then the callback is cancelled, so nothing runs on a screen that is already gone
        expect(cancel).toHaveBeenCalledTimes(1);
    });
});
