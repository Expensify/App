/**
 * State shared by all the "Discard changes?" prompts.
 *
 * Replaying: after the user picks Discard, the blocked navigation is sent again. Other prompts it reaches check
 * `isReplayingDiscardedNavigation`, so the user isn't asked twice.
 */
let replayDepth = 0;

/** Sends again a navigation the user already picked Discard for. Other prompts it reaches don't ask again. */
function runWhileReplayingDiscardedNavigation(replay: () => void) {
    replayDepth += 1;
    try {
        replay();
    } finally {
        replayDepth -= 1;
    }
}

function isReplayingDiscardedNavigation() {
    return replayDepth > 0;
}

export {runWhileReplayingDiscardedNavigation, isReplayingDiscardedNavigation};
