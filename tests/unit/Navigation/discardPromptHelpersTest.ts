import {
    isFlowDiscardPromptSuppressed,
    isReplayingDiscardedNavigation,
    releaseFlowDiscardPromptSuppression,
    runWhileReplayingDiscardedNavigation,
    suppressFlowDiscardPrompt,
} from '@libs/Navigation/helpers/discardPromptState';

import CONST from '@src/CONST';

describe('discardPromptState', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        releaseFlowDiscardPromptSuppression();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('keeps the flow muted until the suppression is released', () => {
        // Given a submit that muted the flow's discard guards
        suppressFlowDiscardPrompt();

        // When nothing released it yet
        // Then the flow stays muted
        expect(isFlowDiscardPromptSuppressed()).toBe(true);

        // When the submit aborts and releases it
        releaseFlowDiscardPromptSuppression();

        // Then the guards prompt again
        expect(isFlowDiscardPromptSuppressed()).toBe(false);
    });

    it('releases a forgotten suppression after a safety timeout', () => {
        // Given a suppression that nothing releases, such as a submit that stays on the page without unlocking
        suppressFlowDiscardPrompt();

        // When the safety timeout passes
        jest.advanceTimersByTime(CONST.MAX_TRANSITION_DURATION_MS * 5);

        // Then the flow isn't muted for good
        expect(isFlowDiscardPromptSuppressed()).toBe(false);
    });

    it('marks the replay of a discarded navigation, even when the replay throws', () => {
        // Given no replay in progress
        expect(isReplayingDiscardedNavigation()).toBe(false);

        // When a confirmed navigation is replayed
        let isReplayingDuringReplay = false;
        runWhileReplayingDiscardedNavigation(() => {
            isReplayingDuringReplay = isReplayingDiscardedNavigation();
        });

        // Then the other guards can tell while it runs, and only while it runs
        expect(isReplayingDuringReplay).toBe(true);
        expect(isReplayingDiscardedNavigation()).toBe(false);

        // When the replay throws
        expect(() =>
            runWhileReplayingDiscardedNavigation(() => {
                throw new Error('replay failed');
            }),
        ).toThrow('replay failed');

        // Then the marker is still cleared, so later navigations prompt normally
        expect(isReplayingDiscardedNavigation()).toBe(false);
    });
});
