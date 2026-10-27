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
        // Given a consumer that is not ready
        // When the hook renders
        const {result} = renderHook(() => useRunAfterTransitions(false));

        // Then it stays false and schedules nothing
        expect(result.current).toBe(false);
        expect(mockedRunAfterTransitions).not.toHaveBeenCalled();
    });

    it('schedules a callback via runAfterTransitions once ready', () => {
        // Given a consumer that is ready on mount
        // When the hook renders
        const {result} = renderHook(() => useRunAfterTransitions(true));

        // Then a callback is scheduled, and the hook stays false until that callback actually fires
        expect(mockedRunAfterTransitions).toHaveBeenCalledTimes(1);
        expect(result.current).toBe(false);
    });

    it('turns true once the scheduled callback fires', () => {
        // Given a ready consumer with a scheduled callback
        const {result} = renderHook(() => useRunAfterTransitions(true));

        // When the transitions end and the callback fires
        firePendingCallbacks();

        // Then the hook turns true
        expect(result.current).toBe(true);
    });

    it('does not schedule anything while toggling not-ready -> ready -> not-ready', () => {
        // Given the hook mounted not ready
        const {result, rerender} = renderHook(({ready}) => useRunAfterTransitions(ready), {initialProps: {ready: false}});

        // When it rerenders while the consumer is still not ready
        rerender({ready: false});

        // Then nothing is scheduled
        expect(mockedRunAfterTransitions).not.toHaveBeenCalled();
        expect(result.current).toBe(false);
    });

    it('cancels the pending handle when ready flips back to false before the callback fires', () => {
        // Given a ready consumer with a scheduled callback
        const {rerender} = renderHook(({ready}) => useRunAfterTransitions(ready), {initialProps: {ready: true}});
        expect(mockedRunAfterTransitions).toHaveBeenCalledTimes(1);

        // When the consumer stops being ready before the callback fired
        rerender({ready: false});

        // Then the pending callback is cancelled
        expect(cancel).toHaveBeenCalledTimes(1);
    });

    it('does not flip back to false once active, even if ready later flips back to false', () => {
        // Given a hook that already turned true
        const {result, rerender} = renderHook(({ready}) => useRunAfterTransitions(ready), {initialProps: {ready: true}});
        firePendingCallbacks();
        expect(result.current).toBe(true);

        // When the consumer stops being ready
        rerender({ready: false});

        // Then it stays true, because the hook never sets active back to false
        expect(result.current).toBe(true);
    });

    it('cancels the handle on unmount', () => {
        // Given a ready consumer with a scheduled callback
        const {unmount} = renderHook(() => useRunAfterTransitions(true));
        expect(mockedRunAfterTransitions).toHaveBeenCalledTimes(1);

        // When the hook unmounts
        unmount();

        // Then the callback is cancelled, so nothing runs on a screen that is already gone
        expect(cancel).toHaveBeenCalledTimes(1);
    });
});
