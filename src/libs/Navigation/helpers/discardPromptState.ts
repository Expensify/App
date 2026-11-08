import CONST from '@src/CONST';

/**
 * State shared by all the "Discard changes?" prompts.
 *
 * Muting: the first screen of a flow keeps prompting while later steps are open on top of it. When a later step closes the flow
 * on purpose, such as after a submit, it can't reach that screen's own `suppressDiscardPrompt`, so it mutes the prompt here instead.
 * If the submit fails and the flow stays open, the caller turns the prompt back on. The timeout is a fallback, so a mute can't last forever.
 *
 * Replaying: after the user picks Discard, the blocked navigation is sent again. Other prompts it reaches check
 * `isReplayingDiscardedNavigation`, so the user isn't asked twice.
 */
const SUPPRESSION_SAFETY_TIMEOUT_MS = CONST.MAX_TRANSITION_DURATION_MS * 5;

let isSuppressed = false;
let suppressionTimeoutID: ReturnType<typeof setTimeout> | undefined;
let replayDepth = 0;

function releaseFlowDiscardPromptSuppression() {
    isSuppressed = false;
    clearTimeout(suppressionTimeoutID);
    suppressionTimeoutID = undefined;
}

/** Mutes the prompt of every flow's first screen, for code that closes the flow on purpose, such as a submit. */
function suppressFlowDiscardPrompt() {
    isSuppressed = true;
    clearTimeout(suppressionTimeoutID);
    suppressionTimeoutID = setTimeout(releaseFlowDiscardPromptSuppression, SUPPRESSION_SAFETY_TIMEOUT_MS);
}

function isFlowDiscardPromptSuppressed() {
    return isSuppressed;
}

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

export {suppressFlowDiscardPrompt, releaseFlowDiscardPromptSuppression, isFlowDiscardPromptSuppressed, runWhileReplayingDiscardedNavigation, isReplayingDiscardedNavigation};
