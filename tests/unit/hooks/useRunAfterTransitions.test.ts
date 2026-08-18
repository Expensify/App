import {renderHook} from '@testing-library/react-native';

import useRunAfterTransitions from '@hooks/useRunAfterTransitions';

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

        firePendingCallbacks();

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
        firePendingCallbacks();
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
