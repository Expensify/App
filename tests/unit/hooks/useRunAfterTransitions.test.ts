import {act, renderHook} from '@testing-library/react-native';

import useRunAfterTransitions from '@hooks/useRunAfterTransitions';

import TransitionTracker from '@libs/Navigation/TransitionTracker';

jest.mock('@libs/Navigation/TransitionTracker', () => ({
    runAfterTransitions: jest.fn(),
}));

const mockedRunAfterTransitions = jest.mocked(TransitionTracker.runAfterTransitions);

// Captures the callbacks handed to `runAfterTransitions` so tests can fire them on demand, and stubs a cancel handle.
let pendingCallbacks: Array<() => void | Promise<void>> = [];
const cancel = jest.fn();

beforeEach(() => {
    jest.clearAllMocks();
    pendingCallbacks = [];
    mockedRunAfterTransitions.mockImplementation(({callback}) => {
        pendingCallbacks.push(callback);
        return {cancel};
    });
});

describe('useRunAfterTransitions', () => {
    it('returns false while not ready', () => {
        const {result} = renderHook(() => useRunAfterTransitions(false));

        expect(result.current).toBe(false);
        expect(mockedRunAfterTransitions).not.toHaveBeenCalled();
    });

    it('schedules a callback via runAfterTransitions once ready', () => {
        const {result} = renderHook(() => useRunAfterTransitions(true));

        expect(mockedRunAfterTransitions).toHaveBeenCalledTimes(1);
        // Stays false until the scheduled callback actually fires.
        expect(result.current).toBe(false);
    });

    it('turns true once the scheduled callback fires', () => {
        const {result} = renderHook(() => useRunAfterTransitions(true));

        act(() => {
            for (const callback of pendingCallbacks) {
                callback();
            }
        });

        expect(result.current).toBe(true);
    });

    it('does not schedule anything while toggling not-ready -> ready -> not-ready', () => {
        const {result, rerender} = renderHook(({ready}) => useRunAfterTransitions(ready), {initialProps: {ready: false}});

        rerender({ready: false});

        expect(mockedRunAfterTransitions).not.toHaveBeenCalled();
        expect(result.current).toBe(false);
    });

    it('cancels the pending handle when ready flips back to false before the callback fires', () => {
        const {rerender} = renderHook(({ready}) => useRunAfterTransitions(ready), {initialProps: {ready: true}});
        expect(mockedRunAfterTransitions).toHaveBeenCalledTimes(1);

        rerender({ready: false});

        expect(cancel).toHaveBeenCalledTimes(1);
    });

    it('does not flip back to false once active, even if ready later flips back to false', () => {
        const {result, rerender} = renderHook(({ready}) => useRunAfterTransitions(ready), {initialProps: {ready: true}});
        act(() => {
            for (const callback of pendingCallbacks) {
                callback();
            }
        });
        expect(result.current).toBe(true);

        rerender({ready: false});

        expect(result.current).toBe(true);
    });

    it('cancels the handle on unmount', () => {
        const {unmount} = renderHook(() => useRunAfterTransitions(true));
        expect(mockedRunAfterTransitions).toHaveBeenCalledTimes(1);

        unmount();

        expect(cancel).toHaveBeenCalledTimes(1);
    });
});
