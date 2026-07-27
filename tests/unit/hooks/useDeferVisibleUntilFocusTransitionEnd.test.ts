import {act, renderHook} from '@testing-library/react-native';

import useDeferVisibleUntilFocusTransitionEnd from '@hooks/useDeferVisibleUntilFocusTransitionEnd';

import TransitionTracker from '@libs/Navigation/TransitionTracker';

jest.mock('@libs/Navigation/TransitionTracker', () => ({
    runAfterTransitions: jest.fn(),
}));

const mockedRunAfterTransitions = jest.mocked(TransitionTracker.runAfterTransitions);

// Captures the callbacks handed to `runAfterTransitions` so tests can fire them on demand, and stubs a cancel handle.
let pendingCallbacks: Array<() => void | Promise<void>> = [];
const cancel = jest.fn();

function firePendingCallbacks() {
    act(() => {
        const callbacks = pendingCallbacks;
        pendingCallbacks = [];
        for (const callback of callbacks) {
            callback();
        }
    });
}

beforeEach(() => {
    jest.clearAllMocks();
    pendingCallbacks = [];
    mockedRunAfterTransitions.mockImplementation(({callback}) => {
        pendingCallbacks.push(callback);
        return {cancel};
    });
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
        expect(pendingCallbacks).toHaveLength(1);
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
        pendingCallbacks = [];
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
