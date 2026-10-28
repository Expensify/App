import CONST from '@src/CONST';

/**
 * Shared state for the "Discard changes?" guards of a multi-step flow. A flow-root guard keeps prompting while later steps are
 * stacked on top of it, so an intentional exit from one of those steps (a submit) can't reach the root's own `suppressDiscardPrompt`.
 * It suppresses here instead. The safety timeout keeps a submit that aborts without leaving from muting the root for good.
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

/** Mutes every flow-root discard guard for an intentional flow exit, such as a submit that dismisses the RHP. */
function suppressFlowDiscardPrompt() {
    isSuppressed = true;
    clearTimeout(suppressionTimeoutID);
    suppressionTimeoutID = setTimeout(releaseFlowDiscardPromptSuppression, SUPPRESSION_SAFETY_TIMEOUT_MS);
}

function isFlowDiscardPromptSuppressed() {
    return isSuppressed;
}

/** Runs the replay of a navigation the user already confirmed to discard, so the other guards it reaches don't prompt again. */
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
