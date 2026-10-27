import {
    isFlowDiscardPromptSuppressed,
    isReplayingDiscardedNavigation,
    releaseFlowDiscardPromptSuppression,
    runWhileReplayingDiscardedNavigation,
    suppressFlowDiscardPrompt,
} from '@libs/Navigation/helpers/discardPromptState';
import getNavigationActionForReplay from '@libs/Navigation/helpers/getNavigationActionForReplay';

import CONST from '@src/CONST';

let mockIsNavigationReady = true;
jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        isReady: () => mockIsNavigationReady,
        getRootState: () => ({key: 'root', routes: [{key: 'tab-navigator'}, {key: 'rhp-route'}]}),
    },
}));

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

describe('getNavigationActionForReplay', () => {
    beforeEach(() => {
        mockIsNavigationReady = true;
    });

    it('targets the root navigator for a back without a target, sent from a root-level route', () => {
        // Given the RHP overlay's GO_BACK without a target, sent from the root-level RHP route
        const action = {type: 'GO_BACK', source: 'rhp-route'};

        // When preparing it for replay through the container
        const actionForReplay = getNavigationActionForReplay(action);

        // Then it targets the root, which closed the whole RHP the first time
        expect(actionForReplay).toEqual({type: 'GO_BACK', source: 'rhp-route', target: 'root'});
    });

    it.each([
        ['a targeted action', {type: 'POP', source: 'rhp-route', target: 'money-request-stack'}],
        ['an action without a source', {type: 'GO_BACK'}],
        ['an action that is not a back', {type: 'NAVIGATE', source: 'rhp-route'}],
        ['an action sent from a nested screen', {type: 'GO_BACK', source: 'confirmation-route'}],
    ])('replays %s unchanged', (_, action) => {
        // Given an action the deepest navigator handles the same way on replay
        // When preparing it for replay
        // Then it's left as is
        expect(getNavigationActionForReplay(action)).toBe(action);
    });

    it('replays the action unchanged before navigation is ready', () => {
        // Given a navigation container that isn't ready
        mockIsNavigationReady = false;
        const action = {type: 'GO_BACK', source: 'rhp-route'};

        // When preparing an overlay back for replay
        // Then it's left as is
        expect(getNavigationActionForReplay(action)).toBe(action);
    });
});
