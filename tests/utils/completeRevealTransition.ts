import {act} from '@testing-library/react-native';

import TransitionTracker from '@libs/Navigation/TransitionTracker';

/**
 * Screens deprioritized with React <Activity> reveal only after the navigation transition that uncovered them
 * completes. This helper drives TransitionTracker through one full transition cycle so a pending reveal commits.
 * The microtask yield between start and end lets the reveal's waitForUpcomingTransition continuation attach to
 * the transition before it ends, mirroring how a real transition outlives the navigation state commit.
 */
async function completeRevealTransition() {
    await act(async () => {
        const handle = TransitionTracker.startTransition();
        await Promise.resolve();
        TransitionTracker.endTransition(handle);
    });
}

export default completeRevealTransition;
