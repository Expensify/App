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
        const {result} = renderHook(() => useDeferVisibleUntilFocusTransitionEnd(true));

        expect(result.current).toBe(true);
        expect(mockedRunAfterTransitions).not.toHaveBeenCalled();
    });

    it('returns false when mounted inactive', () => {
        const {result} = renderHook(() => useDeferVisibleUntilFocusTransitionEnd(false));

        expect(result.current).toBe(false);
        expect(mockedRunAfterTransitions).not.toHaveBeenCalled();
    });

    it('waits for the upcoming transition when scheduling', () => {
        const {rerender} = renderHook(({isActive}) => useDeferVisibleUntilFocusTransitionEnd(isActive), {initialProps: {isActive: false}});

        rerender({isActive: true});

        expect(mockedRunAfterTransitions).toHaveBeenCalledWith(expect.objectContaining({waitForUpcomingTransition: true}));
        expect(transitionTracker.getPendingCallbackCount()).toBe(1);
    });

    it('hides immediately when isActive flips to false', () => {
        const {result, rerender} = renderHook(({isActive}) => useDeferVisibleUntilFocusTransitionEnd(isActive), {initialProps: {isActive: true}});
        expect(result.current).toBe(true);

        rerender({isActive: false});

        expect(result.current).toBe(false);
    });

    it('cancels the pending handle when isActive flips to false', () => {
        const {rerender} = renderHook(({isActive}) => useDeferVisibleUntilFocusTransitionEnd(isActive), {initialProps: {isActive: false}});

        rerender({isActive: true});
        rerender({isActive: false});

        expect(cancel).toHaveBeenCalledTimes(1);
    });

    it('stays hidden after reactivation until the scheduled callback fires', () => {
        const {result, rerender} = renderHook(({isActive}) => useDeferVisibleUntilFocusTransitionEnd(isActive), {initialProps: {isActive: true}});

        rerender({isActive: false});
        rerender({isActive: true});

        expect(result.current).toBe(false);

        firePendingCallbacks();

        expect(result.current).toBe(true);
    });

    it('does not schedule anything while staying inactive across rerenders', () => {
        const {result, rerender} = renderHook(({isActive}) => useDeferVisibleUntilFocusTransitionEnd(isActive), {initialProps: {isActive: false}});

        rerender({isActive: false});

        expect(mockedRunAfterTransitions).not.toHaveBeenCalled();
        expect(result.current).toBe(false);
    });

    it('ignores a stale callback after deactivation', () => {
        const {result, rerender} = renderHook(({isActive}) => useDeferVisibleUntilFocusTransitionEnd(isActive), {initialProps: {isActive: true}});

        rerender({isActive: false});

        // The real cancel would prevent this, but even if a stale callback slips through, the hook must stay hidden.
        firePendingCallbacks();

        expect(result.current).toBe(false);
    });

    it('handles a full hide/show cycle repeatedly', () => {
        const {result, rerender} = renderHook(({isActive}) => useDeferVisibleUntilFocusTransitionEnd(isActive), {initialProps: {isActive: false}});
        expect(result.current).toBe(false);

        rerender({isActive: true});
        expect(result.current).toBe(false);
        firePendingCallbacks();
        expect(result.current).toBe(true);

        rerender({isActive: false});
        expect(result.current).toBe(false);

        rerender({isActive: true});
        expect(result.current).toBe(false);
        firePendingCallbacks();
        expect(result.current).toBe(true);
    });

    it('cancels the handle on unmount', () => {
        const {rerender, unmount} = renderHook(({isActive}) => useDeferVisibleUntilFocusTransitionEnd(isActive), {initialProps: {isActive: false}});

        rerender({isActive: true});
        expect(mockedRunAfterTransitions).toHaveBeenCalledTimes(1);

        unmount();

        expect(cancel).toHaveBeenCalledTimes(1);
    });
});
