import {isReplayingDiscardedNavigation, runWhileReplayingDiscardedNavigation} from '@libs/Navigation/helpers/discardPromptState';

describe('discardPromptState', () => {
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
