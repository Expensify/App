import {act} from '@testing-library/react-native';

import TransitionTracker from '@libs/Navigation/TransitionTracker';

type TransitionCallback = () => void | Promise<void>;

/**
 * Captures the callbacks handed to `runAfterTransitions` so tests can fire them on demand, and stubs a cancel
 * handle. Jest hoists mock factories per file, so the test file still has to mock
 * `@libs/Navigation/TransitionTracker` with a `runAfterTransitions: jest.fn()` itself and call `install` from its
 * `beforeEach`, after `jest.clearAllMocks`.
 */
function createTransitionTrackerHarness() {
    let pendingCallbacks: TransitionCallback[] = [];
    const cancel = jest.fn();

    function install() {
        pendingCallbacks = [];
        jest.mocked(TransitionTracker.runAfterTransitions).mockImplementation(({callback}) => {
            pendingCallbacks.push(callback);
            return {cancel};
        });
    }

    function firePendingCallbacks() {
        act(() => {
            const callbacks = pendingCallbacks;
            pendingCallbacks = [];
            for (const callback of callbacks) {
                callback();
            }
        });
    }

    function getPendingCallbackCount() {
        return pendingCallbacks.length;
    }

    return {install, firePendingCallbacks, getPendingCallbackCount, cancel};
}

export default createTransitionTrackerHarness;
